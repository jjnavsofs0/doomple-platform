import { NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { triggerRealtimeEvent } from "@/lib/pusher-server";

export const ADMIN_GLOBAL_CHANNEL = "private-admin-global";

export function getUserPrivateChannel(userId: string) {
  return `private-user-${userId}`;
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
}) {
  const admins = await prisma.user.findMany({
    where: {
      role: {
        in: ["SUPER_ADMIN", "ADMIN", "SALES", "PROJECT_MANAGER", "FINANCE"],
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
