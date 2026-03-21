import { NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { triggerRealtimeEvent } from "@/lib/pusher-server";
import { isSesConfigured, sendTransactionalEmail } from "@/lib/email";
import { reportOperationalIssue } from "@/lib/operational-issues";

export const ADMIN_GLOBAL_CHANNEL = "private-admin-global";
const ADMIN_NOTIFICATION_ROLES = ["SUPER_ADMIN", "ADMIN", "SALES", "PROJECT_MANAGER", "FINANCE"] as const;

export function getUserPrivateChannel(userId: string) {
  return `private-user-${userId}`;
}

function getAbsoluteAppUrl(path?: string | null) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000";

  if (!path) {
    return baseUrl;
  }

  try {
    return new URL(path, baseUrl).toString();
  } catch {
    return baseUrl;
  }
}

async function getAdminEmailRecipients() {
  const users = await prisma.user.findMany({
    where: {
      role: {
        in: [...ADMIN_NOTIFICATION_ROLES],
      },
      isActive: true,
      emailVerificationStatus: "VERIFIED",
      transactionalEmailsEnabled: true,
    },
    select: {
      email: true,
    },
  });

  return Array.from(
    new Set(
      users
        .map((user) => user.email?.trim())
        .filter((email): email is string => Boolean(email))
    )
  );
}

async function sendAdminActivityEmail(params: {
  title: string;
  message: string;
  type: NotificationType;
  link?: string | null;
  metadata?: Record<string, unknown>;
  subject?: string;
}) {
  if (!isSesConfigured()) {
    await reportOperationalIssue({
      title: "Admin notification email skipped",
      error: "AWS SES is not configured",
      severity: "WARNING",
      area: "notifications.admin-email.config",
      metadata: {
        title: params.title,
        type: params.type,
        link: params.link || null,
      },
    });
    return;
  }

  const recipients = await getAdminEmailRecipients();
  if (recipients.length === 0) {
    return;
  }

  const destinationUrl = getAbsoluteAppUrl(params.link || "/admin");
  const metadataBlock = params.metadata
    ? JSON.stringify(params.metadata, null, 2)
    : "None";
  const topicLabel =
    params.type === NotificationType.LEAD
      ? "Lead Update"
      : params.type === NotificationType.PAYMENT
        ? "Payment Update"
        : params.type === NotificationType.INVOICE
          ? "Invoice Update"
          : params.type === NotificationType.PROJECT
            ? "Project Update"
            : "System Update";

  await sendTransactionalEmail({
    to: recipients,
    subject: params.subject || `[Doomple ${topicLabel}] ${params.title}`,
    text: [
      params.title,
      "",
      params.message,
      "",
      `Open: ${destinationUrl}`,
      "",
      "Metadata:",
      metadataBlock,
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;color:#0f172a">
        <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#1ABFAD">${topicLabel}</p>
        <h2 style="margin:0 0 12px">${params.title}</h2>
        <p style="margin:0 0 16px;line-height:1.6">${params.message}</p>
        <p style="margin:0 0 20px">
          <a href="${destinationUrl}" style="display:inline-block;border-radius:999px;background:#07223F;color:#ffffff;padding:10px 18px;text-decoration:none;font-weight:600">
            Open in Doomple
          </a>
        </p>
        <h3 style="margin:0 0 8px;font-size:14px">Metadata</h3>
        <pre style="white-space:pre-wrap;background:#f8fafc;border:1px solid #e2e8f0;padding:12px;border-radius:8px">${metadataBlock}</pre>
      </div>
    `,
    replyTo: process.env.AWS_SES_REPLY_TO || undefined,
    issueContext: {
      title: "Admin notification email failed",
      severity: "ERROR",
      area: "notifications.admin-email.send",
      metadata: {
        notificationTitle: params.title,
        type: params.type,
        link: params.link || null,
      },
    },
  });
}

export async function broadcastAdminRefresh(topics: string[], payload?: Record<string, unknown>) {
  await triggerRealtimeEvent(ADMIN_GLOBAL_CHANNEL, "entity.changed", {
    topics,
    ...payload,
    timestamp: Date.now(),
  });
}

export async function broadcastUserRefresh(userIds: string[], topics: string[], payload?: Record<string, unknown>) {
  if (userIds.length === 0) {
    return;
  }

  await triggerRealtimeEvent(
    userIds.map(getUserPrivateChannel),
    "entity.changed",
    {
      topics,
      ...payload,
      timestamp: Date.now(),
    }
  );
}

export async function createNotifications(params: {
  userIds: string[];
  title: string;
  message: string;
  type: NotificationType;
  link?: string | null;
  metadata?: Record<string, unknown>;
}) {
  if (params.userIds.length === 0) {
    return;
  }

  const createdAt = new Date();
  await prisma.notification.createMany({
    data: params.userIds.map((userId) => ({
      userId,
      title: params.title,
      message: params.message,
      type: params.type,
      link: params.link || null,
      createdAt,
    })),
  });

  await triggerRealtimeEvent(
    params.userIds.map(getUserPrivateChannel),
    "notification.created",
    {
      title: params.title,
      message: params.message,
      type: params.type,
      link: params.link || null,
      metadata: params.metadata || null,
      createdAt: createdAt.toISOString(),
    }
  );
}

export async function notifyAdmins(params: {
  title: string;
  message: string;
  type?: NotificationType;
  link?: string | null;
  topics?: string[];
  metadata?: Record<string, unknown>;
  email?:
    | boolean
    | {
        enabled?: boolean;
        subject?: string;
      };
}) {
  const admins = await prisma.user.findMany({
    where: {
      role: {
        in: [...ADMIN_NOTIFICATION_ROLES],
      },
      isActive: true,
    },
    select: { id: true },
  });

  await createNotifications({
    userIds: admins.map((user) => user.id),
    title: params.title,
    message: params.message,
    type: params.type || NotificationType.SYSTEM,
    link: params.link || null,
    metadata: params.metadata,
  });

  await broadcastAdminRefresh(params.topics || ["dashboard", "notifications"], params.metadata);

  const shouldEmail =
    typeof params.email === "boolean" ? params.email : params.email?.enabled;

  if (shouldEmail) {
    try {
      await sendAdminActivityEmail({
        title: params.title,
        message: params.message,
        type: params.type || NotificationType.SYSTEM,
        link: params.link || null,
        metadata: params.metadata,
        subject: typeof params.email === "object" ? params.email.subject : undefined,
      });
    } catch (error) {
      console.warn(
        "Admin notification email could not be sent:",
        error instanceof Error ? error.message : error
      );
    }
  }
}

export async function notifyUserById(params: {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  link?: string | null;
  topics?: string[];
  metadata?: Record<string, unknown>;
}) {
  await createNotifications({
    userIds: [params.userId],
    title: params.title,
    message: params.message,
    type: params.type || NotificationType.SYSTEM,
    link: params.link || null,
    metadata: params.metadata,
  });

  await broadcastUserRefresh([params.userId], params.topics || ["notifications"], params.metadata);
}

export async function notifyClientUsersByEmail(params: {
  email?: string | null;
  title: string;
  message: string;
  type?: NotificationType;
  link?: string | null;
  topics?: string[];
  metadata?: Record<string, unknown>;
}) {
  if (!params.email) {
    return;
  }

  const users = await prisma.user.findMany({
    where: {
      email: params.email,
      role: "CLIENT",
      isActive: true,
    },
    select: { id: true },
  });

  if (users.length === 0) {
    return;
  }

  const userIds = users.map((user) => user.id);
  await createNotifications({
    userIds,
    title: params.title,
    message: params.message,
    type: params.type || NotificationType.SYSTEM,
    link: params.link || null,
    metadata: params.metadata,
  });

  await broadcastUserRefresh(userIds, params.topics || ["notifications"], params.metadata);
}
