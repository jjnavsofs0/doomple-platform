import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { MilestoneStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyAdmins, notifyClientUsersByEmail } from "@/lib/realtime";

const serializeMilestone = (milestone: any) => ({
  ...milestone,
  paymentAmount: Number(milestone.paymentAmount || 0),
  status: String(milestone.status || "").toLowerCase(),
});

const normalizeMilestoneStatus = (
  status: unknown,
  fallback: MilestoneStatus = "PENDING"
): MilestoneStatus => {
  const normalized = String(status || "").toUpperCase();
  if (
    normalized === "PENDING" ||
    normalized === "IN_PROGRESS" ||
    normalized === "COMPLETED" ||
    normalized === "SKIPPED"
  ) {
    return normalized;
  }

  return fallback;
};

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

    const milestones = await prisma.projectMilestone.findMany({
      where: { projectId: params.id },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: milestones.map(serializeMilestone),
    });
  } catch (error) {
    console.error("Get milestones error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch milestones" },
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

    if (!body.title) {
      return NextResponse.json(
        { success: false, error: "Milestone title is required" },
        { status: 400 }
      );
    }

    // Get the next order number
    const lastMilestone = await prisma.projectMilestone.findFirst({
      where: { projectId: params.id },
      orderBy: { order: "desc" },
    });

    const nextOrder = (lastMilestone?.order || 0) + 1;

    const milestone = await prisma.projectMilestone.create({
      data: {
        projectId: params.id,
        title: body.title,
        description: body.description || null,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        paymentAmount: body.paymentAmount ? Number(body.paymentAmount) : null,
        status: normalizeMilestoneStatus(body.status),
        order: nextOrder,
      },
    });

    await notifyAdmins({
      title: "Milestone created",
      message: `${projectExists.name} has a new milestone: ${milestone.title}.`,
      type: "PROJECT",
      link: `/admin/projects/${params.id}`,
      topics: ["projects", "notifications"],
      metadata: {
        projectId: params.id,
        milestoneId: milestone.id,
      },
    });

    await notifyClientUsersByEmail({
      email: projectExists.client?.email,
      title: "Project milestone added",
      message: `${projectExists.name} has a new milestone in your workspace.`,
      type: "PROJECT",
      link: "/portal/projects",
      topics: ["projects", "notifications"],
      metadata: {
        projectId: params.id,
        milestoneId: milestone.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Milestone created successfully",
        data: serializeMilestone(milestone),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create milestone error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create milestone" },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    if (!body.milestoneId) {
      return NextResponse.json(
        { success: false, error: "Milestone ID is required in body" },
        { status: 400 }
      );
    }

    const existingMilestone = await prisma.projectMilestone.findUnique({
      where: { id: body.milestoneId },
    });

    if (!existingMilestone || existingMilestone.projectId !== params.id) {
      return NextResponse.json(
        { success: false, error: "Milestone not found" },
        { status: 404 }
      );
    }

    const nextStatus = normalizeMilestoneStatus(body.status, existingMilestone.status);

    const updatedMilestone = await prisma.projectMilestone.update({
      where: { id: body.milestoneId },
      data: {
        title: body.title || existingMilestone.title,
        description:
          body.description !== undefined
            ? body.description
            : existingMilestone.description,
        dueDate: body.dueDate
          ? new Date(body.dueDate)
          : existingMilestone.dueDate,
        status: nextStatus,
        paymentAmount:
          body.paymentAmount !== undefined
            ? Number(body.paymentAmount)
            : existingMilestone.paymentAmount,
        order: body.order !== undefined ? Number(body.order) : existingMilestone.order,
        completedAt:
          nextStatus === "COMPLETED"
            ? existingMilestone.completedAt || new Date()
            : body.status !== undefined
              ? null
              : existingMilestone.completedAt,
      },
    });

    await notifyAdmins({
      title: "Milestone updated",
      message: `${projectExists.name} milestone ${updatedMilestone.title} was updated.`,
      type: "PROJECT",
      link: `/admin/projects/${params.id}`,
      topics: ["projects", "notifications"],
      metadata: {
        projectId: params.id,
        milestoneId: updatedMilestone.id,
        status: updatedMilestone.status,
      },
    });

    await notifyClientUsersByEmail({
      email: projectExists.client?.email,
      title: "Project milestone updated",
      message: `${projectExists.name} has a milestone update in your portal.`,
      type: "PROJECT",
      link: "/portal/projects",
      topics: ["projects", "notifications"],
      metadata: {
        projectId: params.id,
        milestoneId: updatedMilestone.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Milestone updated successfully",
      data: serializeMilestone(updatedMilestone),
    });
  } catch (error) {
    console.error("Update milestone error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update milestone" },
      { status: 500 }
    );
  }
}

export const PATCH = PUT;
