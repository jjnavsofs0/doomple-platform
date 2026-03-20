import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const history = await prisma.projectStatusHistory.findMany({
      where: { projectId: params.id },
      include: {
        changedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: history.map((entry) => ({
        ...entry,
        changedAt: entry.createdAt.toISOString(),
        changedBy: entry.changedBy?.name || entry.changedBy?.email || "Unknown User",
        reason: entry.note,
      })),
    });
  } catch (error) {
    console.error("Get project history error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch project history" },
      { status: 500 }
    );
  }
}
