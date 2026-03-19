import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const limit = Math.min(Number(url.searchParams.get("limit") || "20"), 50);

    const [items, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.notification.count({
        where: {
          userId: session.user.id,
          isRead: false,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: items,
      unreadCount,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (body.markAllRead) {
      await prisma.notification.updateMany({
        where: {
          userId: session.user.id,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });
    } else if (body.id) {
      await prisma.notification.updateMany({
        where: {
          id: String(body.id),
          userId: session.user.id,
        },
        data: {
          isRead: true,
        },
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Notification id or markAllRead is required" },
        { status: 400 }
      );
    }

    const unreadCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
        isRead: false,
      },
    });

    return NextResponse.json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error("Update notifications error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update notifications" },
      { status: 500 }
    );
  }
}
