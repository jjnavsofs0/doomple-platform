import { SendEmailCommand, SendRawEmailCommand, SESClient } from "@aws-sdk/client-ses";

function getSesClient() {
  const region = process.env.AWS_SES_REGION || process.env.AWS_REGION;

  if (!region || !process.env.AWS_SES_FROM_EMAIL) {
    return null;
  }

  return new SESClient({
    region,
    credentials:
      process.env.AWS_SES_ACCESS_KEY_ID && process.env.AWS_SES_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY,
          }
        : process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          }
        : undefined,
  });
}

export function getSesIntegrationStatus() {
  const region = process.env.AWS_SES_REGION || process.env.AWS_REGION || "";
  const fromEmail = process.env.AWS_SES_FROM_EMAIL || "";
  const replyToEmail = process.env.AWS_SES_REPLY_TO || "";

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
}) {
  const sesClient = getSesClient();
  const fromEmail = process.env.AWS_SES_FROM_EMAIL;

  if (!sesClient || !fromEmail) {
    throw new Error(
      "AWS SES is not configured. Please set AWS_SES_REGION, AWS_SES_FROM_EMAIL, and SES credentials in environment variables."
    );
  }

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
}) {
  const sesClient = getSesClient();
  const fromEmail = process.env.AWS_SES_FROM_EMAIL;

  if (!sesClient || !fromEmail) {
    throw new Error(
      "AWS SES is not configured. Please set AWS_SES_REGION, AWS_SES_FROM_EMAIL, and SES credentials in environment variables."
    );
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

  await sesClient.send(
    new SendRawEmailCommand({
      RawMessage: {
        Data: Buffer.from(rawMessage),
      },
    })
  );
}
