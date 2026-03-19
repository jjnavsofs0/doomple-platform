import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/storage";

export const dynamic = "force-dynamic";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const auth = await requireAdminSession();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "Profile image file is required" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "Only image files can be uploaded as profile photos" },
        { status: 400 }
      );
    }

    if (file.size > MAX_AVATAR_SIZE) {
      return NextResponse.json(
        { success: false, error: "Profile image must be 5 MB or smaller" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadFile({
      buffer,
      fileName: file.name,
      contentType: file.type,
      folder: "avatars",
      visibility: "private",
    });

    const updatedUser = await prisma.user.update({
      where: { id: auth.session.user.id },
      data: {
        avatar: `/api/users/${auth.session.user.id}/avatar?v=${Date.now()}`,
        avatarStorageKey: uploaded.storageKey,
        avatarStorageProvider: uploaded.provider,
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
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile photo updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Upload profile avatar error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload profile photo" },
      { status: 500 }
    );
  }
}
