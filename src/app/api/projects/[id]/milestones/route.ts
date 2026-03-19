import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { MilestoneStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
        order: body.order || existingMilestone.order,
        completedAt: nextStatus === "COMPLETED" ? new Date() : existingMilestone.completedAt,
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
