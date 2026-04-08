import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { broadcastAdminRefresh } from "@/lib/realtime";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const communications = await prisma.leadCommunication.findMany({
      where: { leadId: id },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: communications.map((entry) => ({
        ...entry,
        subject: entry.subject || entry.type,
        date: entry.createdAt.toISOString(),
        notes: entry.content,
      })),
    });
  } catch (error) {
    console.error("Get lead communications error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch lead communications" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const type = String(body.type || "note").trim().toLowerCase();
    const direction = body.direction ? String(body.direction).trim() : null;
    const subject = body.subject ? String(body.subject).trim() : null;
    const content = String(body.content || body.notes || "").trim();
    const outcome = body.outcome ? String(body.outcome).trim() : null;

    if (!content) {
      return NextResponse.json(
        { success: false, error: "Notes content is required" },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.findUnique({
      where: { id },
      select: { id: true, fullName: true },
    });

    if (!lead) {
      return NextResponse.json({ success: false, error: "Lead not found" }, { status: 404 });
    }

    const communication = await prisma.leadCommunication.create({
      data: {
        leadId: id,
        userId: session.user.id,
        type,
        direction,
        subject,
        content,
        outcome,
      },
      include: { user: { select: { id: true, name: true } } },
    });

    // Log activity
    await prisma.leadActivity.create({
      data: {
        leadId: id,
        userId: session.user.id,
        type: "COMMUNICATION",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} logged${subject ? `: ${subject}` : ""}${outcome ? ` · ${outcome.replace(/_/g, " ")}` : ""}`,
      },
    });

    void broadcastAdminRefresh(["leads", "notifications"]);

    return NextResponse.json(
      {
        success: true,
        data: {
          ...communication,
          subject: communication.subject || communication.type,
          date: communication.createdAt.toISOString(),
          notes: communication.content,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create lead communication error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to log communication" },
      { status: 500 }
    );
  }
}
