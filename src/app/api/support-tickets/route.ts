import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ALLOWED_ROLES = ["SUPER_ADMIN", "ADMIN", "PROJECT_MANAGER", "SALES"];

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminSession(ALLOWED_ROLES);
    if ("error" in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const q = url.searchParams.get("q");

    const tickets = await prisma.supportTicket.findMany({
      where: {
        ...(status ? { status: status as never } : {}),
        ...(q
          ? {
              OR: [
                { ticketNumber: { contains: q, mode: "insensitive" } },
                { subject: { contains: q, mode: "insensitive" } },
                { requesterEmail: { contains: q, mode: "insensitive" } },
                { requesterName: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        client: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            email: true,
          },
        },
        conversation: {
          select: {
            id: true,
            leadId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: tickets });
  } catch (error) {
    console.error("Get support tickets error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load support tickets" },
      { status: 500 }
    );
  }
}
