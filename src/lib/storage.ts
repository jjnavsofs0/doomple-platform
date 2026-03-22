import { randomUUID } from "crypto";
import { mkdir, rm, writeFile } from "fs/promises";
import path from "path";
import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { reportOperationalIssue } from "@/lib/operational-issues";

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
type StorageVisibility = "public" | "private";

function readEnvValue(name: string) {
  const value = process.env[name];
  if (!value) {
    return "";
  }

  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function getStorageRegion() {
  return readEnvValue("AWS_S3_REGION") || readEnvValue("AWS_REGION");
}

function getS3CredentialSource() {
  const s3AccessKeyId = readEnvValue("AWS_S3_ACCESS_KEY_ID");
  const s3SecretAccessKey = readEnvValue("AWS_S3_SECRET_ACCESS_KEY");
  if (s3AccessKeyId && s3SecretAccessKey) {
    return {
      source: "AWS_S3_ACCESS_KEY_ID",
      credentials: {
        accessKeyId: s3AccessKeyId,
        secretAccessKey: s3SecretAccessKey,
      },
    };
  }

  const awsAccessKeyId = readEnvValue("AWS_ACCESS_KEY_ID");
  const awsSecretAccessKey = readEnvValue("AWS_SECRET_ACCESS_KEY");
  if (awsAccessKeyId && awsSecretAccessKey) {
    return {
      source: "AWS_ACCESS_KEY_ID",
      credentials: {
        accessKeyId: awsAccessKeyId,
        secretAccessKey: awsSecretAccessKey,
      },
    };
  }

  return {
    source: "default-provider-chain",
    credentials: undefined,
  };
}

function getS3Client() {
  const region = getStorageRegion();
  if (!region) {
    return null;
  }

  const credentialConfig = getS3CredentialSource();

  return new S3Client({
    region,
    credentials: credentialConfig.credentials,
  });
}

function getBucketName(visibility: StorageVisibility) {
  if (visibility === "public") {
    return readEnvValue("AWS_S3_PUBLIC_BUCKET") || readEnvValue("AWS_S3_BUCKET") || "";
  }

  return readEnvValue("AWS_S3_PRIVATE_BUCKET") || readEnvValue("AWS_S3_BUCKET") || "";
}

export function getStorageIntegrationStatus() {
  const credentialConfig = getS3CredentialSource();
  return {
    region: getStorageRegion(),
    publicBucket: getBucketName("public"),
    privateBucket: getBucketName("private"),
    publicBucketConfigured: Boolean(getBucketName("public")),
    privateBucketConfigured: Boolean(getBucketName("private")),
    credentialSource: credentialConfig.source,
    explicitCredentialsConfigured: Boolean(credentialConfig.credentials),
  };
}

export function isS3Configured() {
  const status = getStorageIntegrationStatus();
  return Boolean(getS3Client() && (status.publicBucketConfigured || status.privateBucketConfigured));
}

export async function uploadFile(params: {
  buffer: Buffer;
  fileName: string;
  contentType?: string;
  folder: string;
  visibility?: StorageVisibility;
}) {
  const visibility = params.visibility || "private";
  const safeName = sanitizeFileName(params.fileName);
  const storageKey = `${params.folder}/${Date.now()}-${randomUUID()}-${safeName}`;
  const s3Client = getS3Client();
  const bucket = getBucketName(visibility);
  const region = getStorageRegion();
  const credentialConfig = getS3CredentialSource();

  if (s3Client && bucket) {
    try {
      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: storageKey,
          Body: params.buffer,
          ContentType: params.contentType || "application/octet-stream",
        })
      );

      return {
        provider: `s3-${visibility}`,
        storageKey,
        url:
          visibility === "public"
            ? `https://${bucket}.s3.${region}.amazonaws.com/${storageKey}`
            : "",
      };
    } catch (error) {
      await reportOperationalIssue({
        title: "S3 upload failed; local storage fallback used",
        error,
        severity: "WARNING",
        area: "storage.s3.upload",
        metadata: {
          storageKey,
          bucket,
          region,
          visibility,
          fileName: params.fileName,
          credentialSource: credentialConfig.source,
        },
      });
      console.warn(
        `S3 upload failed for ${storageKey}; falling back to local storage:`,
        error instanceof Error ? error.message : error
      );
    }
  }

  const destination = path.join(LOCAL_UPLOAD_DIR, storageKey);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, params.buffer);

  return {
    provider: "local",
    storageKey,
    url: `/uploads/${storageKey}`,
  };
}

export async function deleteStoredFile(
  provider: string,
  storageKey?: string | null
) {
  if (!storageKey) {
    return;
  }

  if (provider.startsWith("s3-")) {
    const s3Client = getS3Client();
    const bucket = getBucketName(provider === "s3-public" ? "public" : "private");
    if (s3Client && bucket) {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: storageKey,
        })
      );
    }
    return;
  }

  const destination = path.join(LOCAL_UPLOAD_DIR, storageKey);
  await rm(destination, { force: true });
}

export async function getStoredFileUrl(params: {
  id: string;
  provider: string;
  storageKey?: string | null;
  fallbackUrl?: string | null;
}) {
  if (params.provider === "s3-public" && params.storageKey) {
    const s3Client = getS3Client();
    const bucket = getBucketName("public");
    const region = getStorageRegion();
    if (s3Client && bucket) {
      return getSignedUrl(
        s3Client,
        new GetObjectCommand({
          Bucket: bucket,
          Key: params.storageKey,
        }),
        { expiresIn: 60 * 10 }
      );
    }

    if (bucket && region) {
      return `https://${bucket}.s3.${region}.amazonaws.com/${params.storageKey}`;
    }
  }

  if (params.provider === "s3-private" && params.storageKey) {
    const s3Client = getS3Client();
    const bucket = getBucketName("private");

    if (s3Client && bucket) {
      return getSignedUrl(
        s3Client,
        new GetObjectCommand({
          Bucket: bucket,
          Key: params.storageKey,
        }),
        { expiresIn: 60 * 10 }
      );
    }
  }

  if (params.provider === "local" && params.storageKey) {
    return `/uploads/${params.storageKey}`;
  }

  return params.fallbackUrl || `/api/files/${params.id}/download`;
}
