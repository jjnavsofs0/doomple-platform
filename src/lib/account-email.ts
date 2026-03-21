import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { isSesConfigured, sendTransactionalEmail } from "@/lib/email";

const EMAIL_CHANGE_EXPIRY_HOURS = 24;

function resolveAppOrigin(request: Request) {
  return new URL(request.url).origin.replace(/\/$/, "");
}

export async function createEmailChangeRequest(params: {
  userId: string;
  currentEmail?: string;
  currentName: string;
  newEmail: string;
  request: Request;
  mode?: "change" | "verify";
}) {
  if (!isSesConfigured()) {
    throw new Error(
      "Email verification requires AWS SES to be configured before changing email addresses."
    );
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + EMAIL_CHANGE_EXPIRY_HOURS * 60 * 60 * 1000);

  await prisma.emailChangeRequest.deleteMany({
    where: {
      userId: params.userId,
      verifiedAt: null,
    },
  });

  await prisma.emailChangeRequest.create({
    data: {
      userId: params.userId,
      newEmail: params.newEmail,
      token,
      expiresAt,
    },
  });

  const verifyUrl = `${resolveAppOrigin(params.request)}/api/account/email-change/verify?token=${token}`;
  const isVerificationOnly =
    params.mode === "verify" || !params.currentEmail || params.currentEmail === params.newEmail;
  const subject = isVerificationOnly
    ? "Verify your email address"
    : "Verify your new email address";
  const introHtml = isVerificationOnly
    ? `Please verify <strong>${params.newEmail}</strong> for your Doomple account.`
    : `We received a request to change your Doomple account email from <strong>${params.currentEmail}</strong> to <strong>${params.newEmail}</strong>.`;
  const introText = isVerificationOnly
    ? `Please verify ${params.newEmail} for your Doomple account.`
    : `We received a request to change your Doomple account email from ${params.currentEmail} to ${params.newEmail}.`;

  await sendTransactionalEmail({
    to: [params.newEmail],
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; color: #0f172a; max-width: 640px; margin: 0 auto; padding: 24px;">
        <h2 style="margin: 0 0 16px; color: #042042;">Confirm your email</h2>
        <p style="line-height: 1.7;">
          Hello ${params.currentName || "there"},
        </p>
        <p style="line-height: 1.7;">
          ${introHtml}
        </p>
        <p style="line-height: 1.7;">
          To complete this request, please verify the email address using the button below.
        </p>
        <p style="margin: 24px 0;">
          <a href="${verifyUrl}" style="display: inline-block; background: #042042; color: #ffffff; text-decoration: none; padding: 12px 18px; border-radius: 10px; font-weight: 600;">
            Verify New Email
          </a>
        </p>
        <p style="line-height: 1.7; color: #475569;">
          This link expires in ${EMAIL_CHANGE_EXPIRY_HOURS} hours. If you did not request this change, you can safely ignore this email.
        </p>
      </div>
    `,
    text: `Hello ${params.currentName || "there"},\n\n${introText}\n\nVerify the email here: ${verifyUrl}\n\nThis link expires in ${EMAIL_CHANGE_EXPIRY_HOURS} hours. If you did not request this change, you can ignore this email.`,
    issueContext: {
      title: "Account email verification email failed",
      severity: "ERROR",
      area: "account.email-change.send",
      metadata: {
        userId: params.userId,
        newEmail: params.newEmail,
        mode: params.mode || "change",
      },
    },
  });

  return {
    newEmail: params.newEmail,
    expiresAt,
  };
}

export async function getEmailDeliveryGuardForUser(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      emailVerificationStatus: true,
      transactionalEmailsEnabled: true,
      marketingEmailsEnabled: true,
      isActive: true,
    },
  });

  if (!user) {
    return null;
  }

  return user;
}
