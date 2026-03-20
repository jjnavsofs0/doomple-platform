import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyAdmins } from "@/lib/realtime";

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

    const communications = await prisma.clientCommunication.findMany({
      where: { clientId: params.id },
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
    console.error("Get client communications error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch client communications" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const type = String(body.type || "note").trim().toLowerCase();
    const subject = String(body.subject || "").trim();
    const content = String(body.content || body.notes || "").trim();

    if (!content) {
      return NextResponse.json(
        { success: false, error: "Log notes are required" },
        { status: 400 }
      );
    }

    const client = await prisma.client.findUnique({
      where: { id: params.id },
      select: { id: true, companyName: true },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Client not found" },
        { status: 404 }
      );
    }

    const communication = await prisma.clientCommunication.create({
      data: {
        clientId: params.id,
        userId: session.user.id,
        type,
        subject: subject || type,
        content,
      },
    });

    await notifyAdmins({
      title: "Client communication logged",
      message: `${client.companyName || "A client"} has a new communication entry.`,
      link: `/admin/clients/${params.id}`,
      topics: ["clients", "notifications"],
      metadata: {
        clientId: params.id,
        communicationId: communication.id,
      },
    });

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
    console.error("Create client communication error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create communication log" },
      { status: 500 }
    );
  }
}
