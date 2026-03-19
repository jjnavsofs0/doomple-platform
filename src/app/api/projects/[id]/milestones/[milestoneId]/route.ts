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
  fallback: MilestoneStatus
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

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; milestoneId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const milestone = await prisma.projectMilestone.findUnique({
      where: { id: params.milestoneId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            client: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    if (!milestone || milestone.projectId !== params.id) {
      return NextResponse.json(
        { success: false, error: "Milestone not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.projectMilestone.update({
      where: { id: params.milestoneId },
      data: {
        title: body.title ?? milestone.title,
        description: body.description ?? milestone.description,
        dueDate: body.dueDate ? new Date(body.dueDate) : milestone.dueDate,
        paymentAmount:
          body.paymentAmount !== undefined
            ? Number(body.paymentAmount)
            : milestone.paymentAmount,
        status: normalizeMilestoneStatus(body.status, milestone.status),
        order: body.order ?? milestone.order,
        completedAt:
          normalizeMilestoneStatus(body.status, milestone.status) === "COMPLETED"
            ? milestone.completedAt || new Date()
            : body.status !== undefined
              ? null
              : milestone.completedAt,
      },
    });

    await notifyAdmins({
      title: "Milestone updated",
      message: `${milestone.project.name} milestone ${updated.title} was updated.`,
      type: "PROJECT",
      link: `/admin/projects/${params.id}`,
      topics: ["projects", "notifications"],
      metadata: {
        projectId: params.id,
        milestoneId: updated.id,
        status: updated.status,
      },
    });

    await notifyClientUsersByEmail({
      email: milestone.project.client?.email,
      title: "Project milestone updated",
      message: `${milestone.project.name} has a milestone update in your portal.`,
      type: "PROJECT",
      link: "/portal/projects",
      topics: ["projects", "notifications"],
      metadata: {
        projectId: params.id,
        milestoneId: updated.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: serializeMilestone(updated),
    });
  } catch (error) {
    console.error("Patch milestone error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update milestone" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; milestoneId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const milestone = await prisma.projectMilestone.findUnique({
      where: { id: params.milestoneId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            client: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    await prisma.projectMilestone.delete({
      where: { id: params.milestoneId },
    });

    if (milestone) {
      await notifyAdmins({
        title: "Milestone deleted",
        message: `${milestone.title} was removed from ${milestone.project.name}.`,
        type: "PROJECT",
        link: `/admin/projects/${params.id}`,
        topics: ["projects", "notifications"],
        metadata: {
          projectId: params.id,
          milestoneId: params.milestoneId,
        },
      });

      await notifyClientUsersByEmail({
        email: milestone.project.client?.email,
        title: "Project milestone removed",
        message: `${milestone.project.name} has an updated milestone plan in your portal.`,
        type: "PROJECT",
        link: "/portal/projects",
        topics: ["projects", "notifications"],
        metadata: {
          projectId: params.id,
          milestoneId: params.milestoneId,
        },
      });
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Delete milestone error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete milestone" },
      { status: 500 }
    );
  }
}
