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

    const leadExists = await prisma.lead.findUnique({
      where: { id: params.id },
    });

    if (!leadExists) {
      return NextResponse.json(
        { success: false, error: "Lead not found" },
        { status: 404 }
      );
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const notes = await prisma.leadNote.findMany({
      where: { leadId: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.leadNote.count({ where: { leadId: params.id } });

    return NextResponse.json({
      success: true,
      data: notes,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get lead notes error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch notes" },
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

    const leadExists = await prisma.lead.findUnique({
      where: { id: params.id },
    });

    if (!leadExists) {
      return NextResponse.json(
        { success: false, error: "Lead not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    if (!body.content || typeof body.content !== "string") {
      return NextResponse.json(
        { success: false, error: "Note content is required" },
        { status: 400 }
      );
    }

    const note = await prisma.leadNote.create({
      data: {
        content: body.content,
        leadId: params.id,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Note created successfully",
        data: note,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create lead note error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create note" },
      { status: 500 }
    );
  }
}
