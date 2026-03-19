import { NextResponse } from "next/server";
import { compare, hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";
import { createEmailChangeRequest } from "@/lib/account-email";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireAdminSession();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
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
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        pendingEmailChange: user.emailChangeRequests[0] || null,
      },
    });
  } catch (error) {
    console.error("Get admin profile error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireAdminSession();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const user = await prisma.user.findUnique({
      where: { id: auth.session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const nextEmail = String(body.email || user.email).trim().toLowerCase();
    const nextName = String(body.name || user.name || "").trim();
    const nextPhone = body.phone !== undefined ? String(body.phone || "").trim() : user.phone;
    const transactionalEmailsEnabled =
      body.transactionalEmailsEnabled !== undefined
        ? Boolean(body.transactionalEmailsEnabled)
        : user.transactionalEmailsEnabled;
    const marketingEmailsEnabled =
      body.marketingEmailsEnabled !== undefined
        ? Boolean(body.marketingEmailsEnabled)
        : user.marketingEmailsEnabled;

    if (!nextName || !nextEmail) {
      return NextResponse.json(
        { success: false, error: "Name and email are required" },
        { status: 400 }
      );
    }

    let emailChangeRequest:
      | {
          newEmail: string;
          expiresAt: Date;
        }
      | null = null;

    if (nextEmail !== user.email) {
      const duplicate = await prisma.user.findUnique({
        where: { email: nextEmail },
        select: { id: true },
      });

      if (duplicate && duplicate.id !== user.id) {
        return NextResponse.json(
          { success: false, error: "Email is already in use" },
          { status: 400 }
        );
      }

      emailChangeRequest = await createEmailChangeRequest({
        userId: user.id,
        currentEmail: user.email,
        currentName: nextName || user.name,
        newEmail: nextEmail,
        request,
      });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: nextName,
        phone: nextPhone || null,
        transactionalEmailsEnabled,
        marketingEmailsEnabled,
      },
      select: {
        id: true,
        name: true,
        email: true,
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
      },
    });

    return NextResponse.json({
      success: true,
      message: emailChangeRequest
        ? `Profile updated. Verify ${emailChangeRequest.newEmail} from the email we just sent to complete the address change.`
        : "Profile updated successfully",
      data: {
        ...updated,
        pendingEmailChange: updated.emailChangeRequests[0] || null,
      },
    });
  } catch (error) {
    console.error("Update admin profile error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdminSession();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const currentPassword = String(body.currentPassword || "");
    const newPassword = String(body.newPassword || "");
    const confirmPassword = String(body.confirmPassword || "");

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: "All password fields are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: "New password must be at least 8 characters" },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: "New password and confirm password do not match" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.session.user.id },
      select: {
        id: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const passwordMatch = await compare(currentPassword, user.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    const passwordHash = await hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Update admin password error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update password" },
      { status: 500 }
    );
  }
}
