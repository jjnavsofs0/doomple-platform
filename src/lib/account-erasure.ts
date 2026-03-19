import { randomUUID } from "crypto";
import { hash } from "bcryptjs";
import { AccountErasureRequestStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { deleteStoredFile } from "@/lib/storage";
import { recordAuditLog } from "@/lib/audit-log";

type ErasureBlockers = {
  hasClientRecord: boolean;
  clientId: string | null;
  invoices: number;
  payments: number;
  quotations: number;
  activeProjects: number;
  requiresRetention: boolean;
  recommendedStatus: AccountErasureRequestStatus;
};

async function getLinkedClientByEmail(email: string | null | undefined) {
  if (!email) {
    return null;
  }

  return prisma.client.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      companyName: true,
      contactName: true,
      isActive: true,
    },
  });
}

export async function getErasureBlockersForUser(userId: string): Promise<ErasureBlockers> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const linkedClient = await getLinkedClientByEmail(user.email);
  if (!linkedClient) {
    return {
      hasClientRecord: false,
      clientId: null,
      invoices: 0,
      payments: 0,
      quotations: 0,
      activeProjects: 0,
      requiresRetention: false,
      recommendedStatus: AccountErasureRequestStatus.ANONYMIZED,
    };
  }

  const [invoices, payments, quotations, activeProjects] = await Promise.all([
    prisma.invoice.count({
      where: { clientId: linkedClient.id },
    }),
    prisma.payment.count({
      where: {
        invoice: {
          clientId: linkedClient.id,
        },
      },
    }),
    prisma.quotation.count({
      where: { clientId: linkedClient.id },
    }),
    prisma.project.count({
      where: {
        clientId: linkedClient.id,
        status: {
          notIn: ["COMPLETED", "CANCELLED"],
        },
      },
    }),
  ]);

  const requiresRetention = invoices > 0 || payments > 0 || quotations > 0 || activeProjects > 0;

  return {
    hasClientRecord: true,
    clientId: linkedClient.id,
    invoices,
    payments,
    quotations,
    activeProjects,
    requiresRetention,
    recommendedStatus: requiresRetention
      ? AccountErasureRequestStatus.RETAINED_FOR_FINANCE
      : AccountErasureRequestStatus.ANONYMIZED,
  };
}

export async function createErasureRequest(params: {
  userId: string;
  requestedById?: string | null;
  requestedReason: string;
}) {
  const requestedReason = params.requestedReason.trim();
  if (!requestedReason) {
    throw new Error("Request reason is required");
  }

  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const existingOpen = await prisma.accountErasureRequest.findFirst({
    where: {
      userId: params.userId,
      resolvedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (existingOpen) {
    return existingOpen;
  }

  const request = await prisma.accountErasureRequest.create({
    data: {
      userId: params.userId,
      requestedById: params.requestedById || null,
      requestedReason,
      status: AccountErasureRequestStatus.REQUESTED,
    },
  });

  await recordAuditLog({
    entityType: "user",
    entityId: user.id,
    action: "erasure_requested",
    summary: `Erasure request created for ${user.email}`,
    userId: params.requestedById || null,
    metadata: {
      requestId: request.id,
      requestedReason,
      role: user.role,
    },
  });

  return request;
}

async function ensureNotLastSuperAdmin(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, isActive: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.role !== "SUPER_ADMIN" || !user.isActive) {
    return;
  }

  const activeSuperAdmins = await prisma.user.count({
    where: {
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });

  if (activeSuperAdmins <= 1) {
    throw new Error("Cannot restrict or anonymize the last active Super Admin account");
  }
}

export async function applyErasureRequestStatus(params: {
  userId: string;
  requestId?: string;
  actorUserId?: string | null;
  status: AccountErasureRequestStatus;
  retentionReason?: string;
  internalNotes?: string;
}) {
  const request = await prisma.accountErasureRequest.findFirst({
    where: {
      id: params.requestId,
      userId: params.userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!request) {
    throw new Error("Erasure request not found");
  }

  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      avatarStorageKey: true,
      avatarStorageProvider: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  await ensureNotLastSuperAdmin(user.id);

  const blockers = await getErasureBlockersForUser(user.id);
  const now = new Date();
  const retentionReason = params.retentionReason?.trim() || null;
  const internalNotes = params.internalNotes?.trim() || null;

  if (params.status === AccountErasureRequestStatus.RETAINED_FOR_FINANCE && !retentionReason) {
    throw new Error("Retention reason is required when retaining data for finance or legal needs");
  }

  if (params.status === AccountErasureRequestStatus.ANONYMIZED && blockers.requiresRetention) {
    throw new Error("This account has finance or delivery records. Use retained_for_finance instead of anonymized.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.accountErasureRequest.update({
      where: { id: request.id },
      data: {
        status: params.status,
        retentionReason,
        internalNotes,
        reviewedById: params.actorUserId || null,
        restrictedAt:
          params.status === AccountErasureRequestStatus.REQUESTED ? request.restrictedAt : now,
        resolvedAt:
          params.status === AccountErasureRequestStatus.REQUESTED ? null : now,
      },
    });

    if (
      params.status === AccountErasureRequestStatus.RESTRICTED ||
      params.status === AccountErasureRequestStatus.RETAINED_FOR_FINANCE ||
      params.status === AccountErasureRequestStatus.ANONYMIZED
    ) {
      await tx.emailChangeRequest.deleteMany({
        where: {
          userId: user.id,
          verifiedAt: null,
        },
      });

      await tx.user.update({
        where: { id: user.id },
        data: {
          isActive: false,
          transactionalEmailsEnabled: false,
          marketingEmailsEnabled: false,
        },
      });

      if (blockers.clientId) {
        await tx.client.update({
          where: { id: blockers.clientId },
          data: {
            isActive: false,
          },
        });
      }
    }

    if (params.status === AccountErasureRequestStatus.ANONYMIZED) {
      const anonymizedEmail = `erased+${user.id}@redacted.doomple.local`;
      const anonymizedPasswordHash = await hash(randomUUID(), 10);

      await tx.user.update({
        where: { id: user.id },
        data: {
          email: anonymizedEmail,
          name: "Deleted User",
          phone: null,
          avatar: null,
          avatarStorageKey: null,
          avatarStorageProvider: null,
          passwordHash: anonymizedPasswordHash,
          emailVerificationStatus: "PENDING",
          emailVerifiedAt: null,
        },
      });

      if (blockers.clientId) {
        await tx.client.update({
          where: { id: blockers.clientId },
          data: {
            email: `erased+client-${blockers.clientId}@redacted.doomple.local`,
            companyName: "Deleted Client",
            contactName: "Deleted Contact",
            phone: null,
            billingAddress: null,
            city: null,
            state: null,
            country: null,
            postalCode: null,
            gstNumber: null,
            panNumber: null,
            bankName: null,
            bankAccountNumber: null,
            ifscCode: null,
            notes: "Client profile anonymized after approved erasure request.",
          },
        });
      }
    }
  });

  if (
    params.status === AccountErasureRequestStatus.ANONYMIZED &&
    user.avatarStorageKey &&
    user.avatarStorageProvider
  ) {
    await deleteStoredFile(user.avatarStorageProvider, user.avatarStorageKey);
  }

  const actionMap: Record<AccountErasureRequestStatus, string> = {
    REQUESTED: "erasure_requested",
    RESTRICTED: "erasure_restricted",
    ANONYMIZED: "erasure_anonymized",
    RETAINED_FOR_FINANCE: "erasure_retained_for_finance",
  };

  const summaryMap: Record<AccountErasureRequestStatus, string> = {
    REQUESTED: `Erasure request reopened for ${user.email}`,
    RESTRICTED: `Account access restricted for ${user.email}`,
    ANONYMIZED: `Account anonymized for ${user.email}`,
    RETAINED_FOR_FINANCE: `Account retained for finance/legal reasons for ${user.email}`,
  };

  await recordAuditLog({
    entityType: "user",
    entityId: user.id,
    action: actionMap[params.status],
    summary: summaryMap[params.status],
    userId: params.actorUserId || null,
    metadata: {
      requestId: request.id,
      status: params.status,
      retentionReason,
      internalNotes,
      blockers,
    } satisfies Prisma.JsonObject,
  });

  return prisma.accountErasureRequest.findUnique({
    where: { id: request.id },
  });
}
