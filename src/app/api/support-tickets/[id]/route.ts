import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { recordAuditLog } from "@/lib/audit-log";

export const dynamic = "force-dynamic";

const ALLOWED_ROLES = ["SUPER_ADMIN", "ADMIN", "PROJECT_MANAGER", "SALES"];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminSession(ALLOWED_ROLES);
    if ("error" in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        client: true,
        conversation: {
          include: {
            messages: {
              orderBy: { createdAt: "asc" },
            },
            lead: true,
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: "Support ticket not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: ticket });
  } catch (error) {
    console.error("Get support ticket error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load support ticket" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminSession(ALLOWED_ROLES);
    if ("error" in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const body = await request.json();

    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: {
        status: body.status || undefined,
        priority: body.priority || undefined,
        subject: body.subject || undefined,
        description: body.description || undefined,
        resolvedAt:
          body.status === "RESOLVED" || body.status === "CLOSED" ? new Date() : body.status ? null : undefined,
      },
    });

    await recordAuditLog({
      entityType: "support_ticket",
      entityId: ticket.id,
      action: "updated",
      summary: `Support ticket ${ticket.ticketNumber} updated`,
      userId: auth.session.user.id,
      metadata: {
        status: ticket.status,
        priority: ticket.priority,
      },
    });

    return NextResponse.json({ success: true, data: ticket });
  } catch (error) {
    console.error("Update support ticket error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update support ticket" },
      { status: 500 }
    );
  }
}
