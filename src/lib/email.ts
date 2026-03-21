import { SendEmailCommand, SendRawEmailCommand, SESClient } from "@aws-sdk/client-ses";
import { reportOperationalIssue } from "@/lib/operational-issues";

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

function getSesClient() {
  const region = readEnvValue("AWS_SES_REGION") || readEnvValue("AWS_REGION");
  const fromEmail = readEnvValue("AWS_SES_FROM_EMAIL");

  if (!region || !fromEmail) {
    return null;
  }

  const sesAccessKeyId = readEnvValue("AWS_SES_ACCESS_KEY_ID");
  const sesSecretAccessKey = readEnvValue("AWS_SES_SECRET_ACCESS_KEY");
  const awsAccessKeyId = readEnvValue("AWS_ACCESS_KEY_ID");
  const awsSecretAccessKey = readEnvValue("AWS_SECRET_ACCESS_KEY");

  return new SESClient({
    region,
    credentials:
      sesAccessKeyId && sesSecretAccessKey
        ? {
            accessKeyId: sesAccessKeyId,
            secretAccessKey: sesSecretAccessKey,
          }
        : awsAccessKeyId && awsSecretAccessKey
        ? {
            accessKeyId: awsAccessKeyId,
            secretAccessKey: awsSecretAccessKey,
          }
        : undefined,
  });
}

export function getSesIntegrationStatus() {
  const region = readEnvValue("AWS_SES_REGION") || readEnvValue("AWS_REGION") || "";
  const fromEmail = readEnvValue("AWS_SES_FROM_EMAIL");
  const replyToEmail = readEnvValue("AWS_SES_REPLY_TO");

  return {
    region,
    fromEmail,
    replyToEmail,
    configured: Boolean(getSesClient() && fromEmail),
  };
}

export function isSesConfigured() {
  return getSesIntegrationStatus().configured;
}

export async function sendTransactionalEmail(params: {
  to: string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  suppressIssueLog?: boolean;
  issueContext?: {
    title?: string;
    severity?: "INFO" | "WARNING" | "ERROR" | "CRITICAL";
    route?: string | null;
    area?: string | null;
    metadata?: Record<string, unknown> | null;
  };
}) {
  const sesClient = getSesClient();
  const fromEmail = readEnvValue("AWS_SES_FROM_EMAIL");

  if (!sesClient || !fromEmail) {
    const error = new Error(
      "AWS SES is not configured. Please set AWS_SES_REGION, AWS_SES_FROM_EMAIL, and SES credentials in environment variables."
    );
    if (!params.suppressIssueLog) {
      await reportOperationalIssue({
        title: params.issueContext?.title || "Transactional email could not be sent",
        error,
        severity: params.issueContext?.severity || "ERROR",
        route: params.issueContext?.route || null,
        area: params.issueContext?.area || "email.transactional.config",
        metadata: {
          to: params.to,
          subject: params.subject,
          ...params.issueContext?.metadata,
        },
      });
    }
    throw error;
  }

  try {
    await sesClient.send(
      new SendEmailCommand({
        Source: fromEmail,
        Destination: {
          ToAddresses: params.to,
        },
        ReplyToAddresses: params.replyTo ? [params.replyTo] : undefined,
        Message: {
          Subject: {
            Charset: "UTF-8",
            Data: params.subject,
          },
          Body: {
            Html: {
              Charset: "UTF-8",
              Data: params.html,
            },
            Text: {
              Charset: "UTF-8",
              Data: params.text,
            },
          },
        },
      })
    );
  } catch (error) {
    if (!params.suppressIssueLog) {
      await reportOperationalIssue({
        title: params.issueContext?.title || "Transactional email delivery failed",
        error,
        severity: params.issueContext?.severity || "ERROR",
        route: params.issueContext?.route || null,
        area: params.issueContext?.area || "email.transactional.send",
        metadata: {
          to: params.to,
          subject: params.subject,
          fromEmail,
          ...params.issueContext?.metadata,
        },
      });
    }
    throw error;
  }
}

/**
 * Send an email with an optional PDF attachment via SES SendRawEmailCommand.
 * This is required because SendEmailCommand does not support attachments.
 */
export async function sendEmailWithAttachment(params: {
  to: string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  attachment?: {
    filename: string;
    content: Buffer;
    contentType: string;
  };
  suppressIssueLog?: boolean;
  issueContext?: {
    title?: string;
    severity?: "INFO" | "WARNING" | "ERROR" | "CRITICAL";
    route?: string | null;
    area?: string | null;
    metadata?: Record<string, unknown> | null;
  };
}) {
  const sesClient = getSesClient();
  const fromEmail = readEnvValue("AWS_SES_FROM_EMAIL");

  if (!sesClient || !fromEmail) {
    const error = new Error(
      "AWS SES is not configured. Please set AWS_SES_REGION, AWS_SES_FROM_EMAIL, and SES credentials in environment variables."
    );
    if (!params.suppressIssueLog) {
      await reportOperationalIssue({
        title: params.issueContext?.title || "Email attachment delivery could not be sent",
        error,
        severity: params.issueContext?.severity || "ERROR",
        route: params.issueContext?.route || null,
        area: params.issueContext?.area || "email.attachment.config",
        metadata: {
          to: params.to,
          subject: params.subject,
          attachmentFilename: params.attachment?.filename || null,
          ...params.issueContext?.metadata,
        },
      });
    }
    throw error;
  }

  const boundary = `boundary_${Date.now()}`;
  const altBoundary = `alt_${boundary}`;

  // Build MIME multipart email
  const lines: string[] = [
    `From: ${fromEmail}`,
    `To: ${params.to.join(", ")}`,
    `Subject: ${params.subject}`,
    ...(params.replyTo ? [`Reply-To: ${params.replyTo}`] : []),
    `MIME-Version: 1.0`,
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: multipart/alternative; boundary="${altBoundary}"`,
    ``,
    `--${altBoundary}`,
    `Content-Type: text/plain; charset=UTF-8`,
    `Content-Transfer-Encoding: quoted-printable`,
    ``,
    params.text,
    ``,
    `--${altBoundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: quoted-printable`,
    ``,
    params.html,
    ``,
    `--${altBoundary}--`,
  ];

  if (params.attachment) {
    const base64Content = params.attachment.content.toString("base64");
    // Split base64 into 76-char lines per MIME spec
    const chunked = base64Content.match(/.{1,76}/g)?.join("\r\n") ?? base64Content;
    lines.push(
      ``,
      `--${boundary}`,
      `Content-Type: ${params.attachment.contentType}; name="${params.attachment.filename}"`,
      `Content-Disposition: attachment; filename="${params.attachment.filename}"`,
      `Content-Transfer-Encoding: base64`,
      ``,
      chunked
    );
  }

  lines.push(``, `--${boundary}--`);

  const rawMessage = lines.join("\r\n");

  try {
    await sesClient.send(
      new SendRawEmailCommand({
        RawMessage: {
          Data: Buffer.from(rawMessage),
        },
      })
    );
  } catch (error) {
    if (!params.suppressIssueLog) {
      await reportOperationalIssue({
        title: params.issueContext?.title || "Email attachment delivery failed",
        error,
        severity: params.issueContext?.severity || "ERROR",
        route: params.issueContext?.route || null,
        area: params.issueContext?.area || "email.attachment.send",
        metadata: {
          to: params.to,
          subject: params.subject,
          fromEmail,
          attachmentFilename: params.attachment?.filename || null,
          ...params.issueContext?.metadata,
        },
      });
    }
    throw error;
  }
}
