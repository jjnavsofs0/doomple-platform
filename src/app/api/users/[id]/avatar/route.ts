import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStoredFileUrl } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = ["SUPER_ADMIN", "ADMIN", "SALES", "PROJECT_MANAGER", "FINANCE"].includes(
      session.user.role
    );

    if (!isAdmin && session.user.id !== params.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        avatar: true,
        avatarStorageKey: true,
        avatarStorageProvider: true,
      },
    });

    if (!user?.avatar) {
      return NextResponse.json({ error: "Avatar not found" }, { status: 404 });
    }

    if (!user.avatarStorageKey || !user.avatarStorageProvider) {
      return NextResponse.redirect(new URL(user.avatar, request.url));
    }

    const resolvedUrl = await getStoredFileUrl({
      id: user.id,
      provider: user.avatarStorageProvider,
      storageKey: user.avatarStorageKey,
      fallbackUrl: user.avatar,
    });

    return NextResponse.redirect(new URL(resolvedUrl, request.url));
  } catch (error) {
    console.error("Get user avatar error:", error);
    return NextResponse.json(
      { error: "Failed to load avatar" },
      { status: 500 }
    );
  }
}
