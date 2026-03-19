import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses";

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
    throw new Error("AWS SES is not configured");
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
