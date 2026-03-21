import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { requireAdminSession } from "@/lib/admin-auth";
import { recordAuditLog } from "@/lib/audit-log";
import { buildTicketNumber } from "@/lib/chatbot";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ALLOWED_ROLES = ["SUPER_ADMIN", "ADMIN", "PROJECT_MANAGER", "SALES"];

function sanitizePhone(phone?: string | null) {
  const digits = String(phone || "").replace(/[^\d+]/g, "");
  return digits || null;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminSession(ALLOWED_ROLES);
    if ("error" in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const priority = url.searchParams.get("priority");
    const source = url.searchParams.get("source");
    const q = url.searchParams.get("q");

    const where: Prisma.SupportTicketWhereInput = {
      ...(status ? { status: status as never } : {}),
      ...(priority ? { priority: priority as never } : {}),
      ...(source ? { source: source as never } : {}),
      ...(q
        ? {
            OR: [
              { ticketNumber: { contains: q, mode: "insensitive" } },
              { subject: { contains: q, mode: "insensitive" } },
              { requesterEmail: { contains: q, mode: "insensitive" } },
              { requesterName: { contains: q, mode: "insensitive" } },
              { companyName: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [tickets, totalCount, openCount, urgentCount] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
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
      }),
      prisma.supportTicket.count(),
      prisma.supportTicket.count({
        where: {
          status: {
            in: ["OPEN", "IN_PROGRESS", "WAITING_ON_CLIENT"],
          },
        },
      }),
      prisma.supportTicket.count({
        where: {
          priority: "URGENT",
          status: {
            notIn: ["RESOLVED", "CLOSED"],
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: tickets,
      summary: {
        totalCount,
        openCount,
        urgentCount,
      },
    });
  } catch (error) {
    console.error("Get support tickets error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load support tickets" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminSession(ALLOWED_ROLES);
    if ("error" in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const subject = String(body.subject || "").trim();
    const description = String(body.description || "").trim();
    const requesterName = String(body.requesterName || "").trim();
    const requesterEmail = String(body.requesterEmail || "").trim().toLowerCase();

    if (!subject || !description || !requesterName || !requesterEmail) {
      return NextResponse.json(
        {
          success: false,
          error: "Subject, description, requester name, and requester email are required",
        },
        { status: 400 }
      );
    }

    const existingClient =
      typeof body.clientId === "string" && body.clientId
        ? await prisma.client.findUnique({
            where: { id: body.clientId },
            select: { id: true },
          })
        : await prisma.client.findUnique({
            where: { email: requesterEmail },
            select: { id: true },
          });

    const count = await prisma.supportTicket.count();
    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber: buildTicketNumber(count + 1),
        subject,
        description,
        requesterName,
        requesterEmail,
        requesterPhone: sanitizePhone(body.requesterPhone),
        companyName: String(body.companyName || "").trim() || null,
        clientId: existingClient?.id || null,
        status: body.status || "OPEN",
        priority: body.priority || "MEDIUM",
        source: body.source || "MANUAL",
      },
    });

    await recordAuditLog({
      entityType: "support_ticket",
      entityId: ticket.id,
      action: "created",
      summary: `Support ticket ${ticket.ticketNumber} created manually`,
      userId: auth.session.user.id,
      metadata: {
        source: ticket.source,
        priority: ticket.priority,
      },
    });

    return NextResponse.json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    console.error("Create support ticket error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create support ticket" },
      { status: 500 }
    );
  }
}
