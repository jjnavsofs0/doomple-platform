import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const auth = await requireAdminSession();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const url = new URL(request.url);
    const entityType = url.searchParams.get("entityType");
    const entityId = url.searchParams.get("entityId");
    const limit = Math.min(Number(url.searchParams.get("limit") || "100"), 200);

    const where: Record<string, unknown> = {};
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;

    const logs = await prisma.adminAuditLog.findMany({
      where,
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
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: logs.map((entry) => ({
        id: entry.id,
        entityType: entry.entityType,
        entityId: entry.entityId,
        action: entry.action,
        summary: entry.summary,
        metadata: entry.metadata,
        createdAt: entry.createdAt,
        userName: entry.user?.name || entry.user?.email || "System",
      })),
    });
  } catch (error) {
    console.error("Get audit logs error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}
