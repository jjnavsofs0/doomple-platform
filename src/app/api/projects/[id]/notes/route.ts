import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyAdmins, notifyClientUsersByEmail } from "@/lib/realtime";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projectExists = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        client: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!projectExists) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    const url = new URL(request.url);
    const isClientVisible = url.searchParams.get("isClientVisible");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: any = { projectId: params.id };
    if (isClientVisible !== null) {
      where.isClientVisible = isClientVisible === "true";
    }

    const notes = await prisma.projectNote.findMany({
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
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.projectNote.count({ where });

    return NextResponse.json({
      success: true,
      data: notes.map((note) => ({
        ...note,
        createdBy: note.user?.name || note.user?.email || "Unknown User",
      })),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get project notes error:", error);
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

    const projectExists = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        client: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!projectExists) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
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

    const note = await prisma.projectNote.create({
      data: {
        content: body.content,
        projectId: params.id,
        userId: session.user.id,
        isClientVisible: body.isClientVisible || false,
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

    await notifyAdmins({
      title: "Project note added",
      message: `A new note was added to ${projectExists.name}.`,
      type: "PROJECT",
      link: `/admin/projects/${params.id}`,
      topics: ["projects", "notifications"],
      metadata: {
        projectId: params.id,
        noteId: note.id,
      },
    });

    if (note.isClientVisible) {
      await notifyClientUsersByEmail({
        email: projectExists.client?.email,
        title: "Project update posted",
        message: `${projectExists.name} has a new client-visible update.`,
        type: "PROJECT",
        link: "/portal/projects",
        topics: ["projects", "notifications"],
        metadata: {
          projectId: params.id,
          noteId: note.id,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Note created successfully",
        data: {
          ...note,
          createdBy: note.user?.name || note.user?.email || "Unknown User",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create project note error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create note" },
      { status: 500 }
    );
  }
}
