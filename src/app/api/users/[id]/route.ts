import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";
import { createEmailChangeRequest } from "@/lib/account-email";
import { getErasureBlockersForUser } from "@/lib/account-erasure";
import { recordAuditLog } from "@/lib/audit-log";
import { notifyAdmins, notifyUserById } from "@/lib/realtime";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdminSession(["SUPER_ADMIN", "ADMIN"]);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        avatarStorageKey: true,
        avatarStorageProvider: true,
        emailVerificationStatus: true,
        emailVerifiedAt: true,
        transactionalEmailsEnabled: true,
        marketingEmailsEnabled: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        emailChangeRequests: {
          where: {
            verifiedAt: null,
            expiresAt: {
              gt: new Date(),
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          select: {
            id: true,
            newEmail: true,
            expiresAt: true,
            createdAt: true,
          },
        },
        erasureRequests: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const [erasureImpact, auditTrail] = await Promise.all([
      getErasureBlockersForUser(params.id),
      prisma.adminAuditLog.findMany({
        where: {
          entityType: "user",
          entityId: params.id,
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
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        pendingEmailChange: user.emailChangeRequests[0] || null,
        erasureRequest: user.erasureRequests[0] || null,
        isDeletedAccount: user.erasureRequests[0]?.status === "ANONYMIZED",
        erasureImpact,
        auditTrail: auditTrail.map((entry) => ({
          id: entry.id,
          action: entry.action,
          summary: entry.summary,
          metadata: entry.metadata,
          createdAt: entry.createdAt,
          userName: entry.user?.name || entry.user?.email || "System",
        })),
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdminSession(["SUPER_ADMIN", "ADMIN"]);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        erasureRequests: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const latestErasureRequest = existingUser.erasureRequests[0] || null;
    if (latestErasureRequest?.status === "ANONYMIZED") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Deleted or anonymized accounts are locked and cannot be edited or reactivated.",
        },
        { status: 400 }
      );
    }

    const nextEmail =
      body.email !== undefined
        ? String(body.email || "").trim().toLowerCase()
        : existingUser.email;

    // === SUPER ADMIN PROTECTION ===

    // Only SUPER_ADMIN can modify another SUPER_ADMIN
    if (
      existingUser.role === "SUPER_ADMIN" &&
      auth.session.user.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json(
        { success: false, error: "Only a Super Admin can modify another Super Admin account" },
        { status: 403 }
      );
    }

    // Prevent deactivating own account
    if (
      body.isActive === false &&
      params.id === auth.session.user.id
    ) {
      return NextResponse.json(
        { success: false, error: "You cannot deactivate your own account" },
        { status: 400 }
      );
    }

    // Prevent deactivating the last SUPER_ADMIN
    if (body.isActive === false && existingUser.role === "SUPER_ADMIN") {
      const superAdminCount = await prisma.user.count({
        where: { role: "SUPER_ADMIN", isActive: true },
      });
      if (superAdminCount <= 1) {
        return NextResponse.json(
          { success: false, error: "Cannot deactivate the last active Super Admin account" },
          { status: 400 }
        );
      }
    }

    // Prevent promoting to SUPER_ADMIN unless requester is SUPER_ADMIN
    if (
      body.role === "SUPER_ADMIN" &&
      auth.session.user.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json(
        { success: false, error: "Only a Super Admin can promote users to Super Admin" },
        { status: 403 }
      );
    }

    // ==============================

    if (body.email && nextEmail !== existingUser.email) {
      const duplicate = await prisma.user.findUnique({
        where: { email: nextEmail },
      });

      if (duplicate) {
        return NextResponse.json(
          { success: false, error: "Email is already in use" },
          { status: 400 }
        );
      }
    }

    const validRoles = [
      "SUPER_ADMIN",
      "ADMIN",
      "SALES",
      "PROJECT_MANAGER",
      "FINANCE",
      "CLIENT",
    ];

    const passwordHash =
      body.password && String(body.password).trim()
        ? await hash(String(body.password), 10)
        : undefined;

    let emailChangeQueued = false;
    if (body.email && nextEmail !== existingUser.email) {
      await createEmailChangeRequest({
        userId: existingUser.id,
        currentEmail: existingUser.email,
        currentName: String(body.name ?? existingUser.name),
        newEmail: nextEmail,
        request,
      });
      emailChangeQueued = true;
    }

    const nextEmailVerificationStatus =
      body.emailVerificationStatus === "VERIFIED" ||
      body.emailVerificationStatus === "PENDING"
        ? body.emailVerificationStatus
        : existingUser.emailVerificationStatus;
    const emailMarkedVerified =
      nextEmailVerificationStatus === "VERIFIED" &&
      existingUser.emailVerificationStatus !== "VERIFIED";
    const emailMarkedUnverified =
      nextEmailVerificationStatus === "PENDING" &&
      existingUser.emailVerificationStatus === "VERIFIED";

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        name: body.name ?? existingUser.name,
        phone: body.phone !== undefined ? body.phone : existingUser.phone,
        role: validRoles.includes(body.role) ? body.role : existingUser.role,
        isActive:
          body.isActive !== undefined ? Boolean(body.isActive) : existingUser.isActive,
        transactionalEmailsEnabled:
          body.transactionalEmailsEnabled !== undefined
            ? Boolean(body.transactionalEmailsEnabled)
            : existingUser.transactionalEmailsEnabled,
        marketingEmailsEnabled:
          body.marketingEmailsEnabled !== undefined
            ? Boolean(body.marketingEmailsEnabled)
            : existingUser.marketingEmailsEnabled,
        emailVerificationStatus: nextEmailVerificationStatus,
        emailVerifiedAt: emailMarkedVerified
          ? new Date()
          : emailMarkedUnverified
            ? null
            : existingUser.emailVerifiedAt,
        passwordHash: passwordHash ?? existingUser.passwordHash,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        emailVerificationStatus: true,
        emailVerifiedAt: true,
        transactionalEmailsEnabled: true,
        marketingEmailsEnabled: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (emailMarkedVerified) {
      await prisma.emailChangeRequest.updateMany({
        where: {
          userId: updatedUser.id,
          verifiedAt: null,
          newEmail: updatedUser.email,
        },
        data: {
          verifiedAt: new Date(),
        },
      });
    }

    if (emailMarkedVerified) {
      await recordAuditLog({
        entityType: "user",
        entityId: updatedUser.id,
        action: "email_verified",
        summary: `${updatedUser.email} was marked as email verified by an administrator`,
        userId: auth.session.user.id,
        metadata: {
          email: updatedUser.email,
        },
      });
    }

    if (emailMarkedUnverified) {
      await recordAuditLog({
        entityType: "user",
        entityId: updatedUser.id,
        action: "email_unverified",
        summary: `${updatedUser.email} was marked as email unverified by an administrator`,
        userId: auth.session.user.id,
        metadata: {
          email: updatedUser.email,
        },
      });
    }

    await notifyAdmins({
      title: "User updated",
      message: `${updatedUser.name} account settings were updated.`,
      link: `/admin/users/${updatedUser.id}`,
      topics: ["dashboard", "users", "notifications"],
      metadata: {
        userId: updatedUser.id,
        role: updatedUser.role,
      },
    });

    if (updatedUser.id !== auth.session.user.id) {
      await notifyUserById({
        userId: updatedUser.id,
        title: "Account settings updated",
        message: emailChangeQueued
          ? "Your account settings were updated, and your email change is awaiting verification."
          : "Your account settings were updated by an administrator.",
        link: updatedUser.role === "CLIENT" ? "/portal/profile" : "/admin/profile",
        topics: ["users", "notifications"],
        metadata: {
          userId: updatedUser.id,
        },
      });
    }

    if (emailMarkedVerified && updatedUser.id !== auth.session.user.id) {
      await notifyUserById({
        userId: updatedUser.id,
        title: "Email verified",
        message: "An administrator marked your email address as verified.",
        link: updatedUser.role === "CLIENT" ? "/portal/profile" : "/admin/profile",
        topics: ["users", "notifications"],
        metadata: {
          userId: updatedUser.id,
          email: updatedUser.email,
        },
      });
    }

    if (emailMarkedUnverified && updatedUser.id !== auth.session.user.id) {
      await notifyUserById({
        userId: updatedUser.id,
        title: "Email verification removed",
        message: "An administrator marked your email address as unverified.",
        link: updatedUser.role === "CLIENT" ? "/portal/profile" : "/admin/profile",
        topics: ["users", "notifications"],
        metadata: {
          userId: updatedUser.id,
          email: updatedUser.email,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: emailChangeQueued
        ? "User updated. A verification email was sent to the new address before the email change can take effect."
        : emailMarkedVerified
          ? "User updated and email marked as verified"
        : emailMarkedUnverified
          ? "User updated and email marked as unverified"
        : "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdminSession(["SUPER_ADMIN", "ADMIN"]);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        role: true,
        email: true,
        erasureRequests: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          select: {
            status: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    if (user.erasureRequests[0]?.status === "ANONYMIZED") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Deleted or anonymized accounts are locked and cannot be reactivated or changed.",
        },
        { status: 400 }
      );
    }

    // Prevent deactivating own account
    if (user.id === auth.session.user.id) {
      return NextResponse.json(
        { success: false, error: "You cannot deactivate your own account" },
        { status: 400 }
      );
    }

    // Only SUPER_ADMIN can deactivate other SUPER_ADMIN accounts
    if (user.role === "SUPER_ADMIN" && auth.session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Only a Super Admin can deactivate another Super Admin account" },
        { status: 403 }
      );
    }

    // Prevent deactivating the last active SUPER_ADMIN
    if (user.role === "SUPER_ADMIN") {
      const superAdminCount = await prisma.user.count({
        where: { role: "SUPER_ADMIN", isActive: true },
      });
      if (superAdminCount <= 1) {
        return NextResponse.json(
          { success: false, error: "Cannot deactivate the last active Super Admin account" },
          { status: 400 }
        );
      }
    }

    await prisma.user.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    await notifyAdmins({
      title: "User deactivated",
      message: `${user.email} was deactivated.`,
      link: `/admin/users/${user.id}`,
      topics: ["dashboard", "users", "notifications"],
      metadata: {
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "User deactivated successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to deactivate user" },
      { status: 500 }
    );
  }
}
