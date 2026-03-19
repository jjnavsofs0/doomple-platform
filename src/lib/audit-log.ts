import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type AuditLogParams = {
  entityType: string;
  entityId: string;
  action: string;
  summary: string;
  userId?: string | null;
  metadata?: Record<string, unknown>;
};

export async function recordAuditLog(params: AuditLogParams) {
  return prisma.adminAuditLog.create({
    data: {
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      summary: params.summary,
      metadata: params.metadata as Prisma.InputJsonValue | undefined,
      userId: params.userId || null,
    },
  });
}

export async function getEntityAuditLogs(entityType: string, entityId: string) {
  return prisma.adminAuditLog.findMany({
    where: {
      entityType,
      entityId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
  });
}
