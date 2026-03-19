import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPortalClient } from "@/lib/portal";

export const dynamic = "force-dynamic";

function formatProjectStatus(status: string) {
  if (status === "ACTIVE" || status === "IN_DEVELOPMENT") return "active";
  if (status === "COMPLETED") return "completed";
  if (status === "ON_HOLD") return "on-hold";
  return "planning";
}

function formatMilestoneStatus(status: string) {
  if (status === "COMPLETED") return "done";
  if (status === "IN_PROGRESS") return "in-progress";
  return "upcoming";
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const portalClient = await getPortalClient();
    if ("error" in portalClient) {
      return NextResponse.json({ error: portalClient.error }, { status: portalClient.status });
    }

    const project = await prisma.project.findFirst({
      where: {
        id: params.id,
        clientId: portalClient.client.id,
      },
      include: {
        milestones: {
          orderBy: { order: "asc" },
        },
        notes: {
          where: {
            isClientVisible: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const documents = await prisma.fileAttachment.findMany({
      where: {
        entityType: "project",
        entityId: project.id,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        mimeType: true,
        createdAt: true,
        url: true,
      },
    });

    return NextResponse.json({
      id: project.id,
      name: project.name,
      status: formatProjectStatus(project.status),
      progress: project.progressPercent,
      category: project.category.replace(/_/g, " "),
      startDate: project.startDate
        ? project.startDate.toLocaleDateString("en-IN")
        : "TBD",
      estimatedEndDate: project.estimatedEndDate
        ? project.estimatedEndDate.toLocaleDateString("en-IN")
        : "TBD",
      description: project.description || "Project details will be shared here as work progresses.",
      scope: project.scope || "Scope details are being finalized.",
      milestones: project.milestones.map((milestone) => ({
        id: milestone.id,
        title: milestone.title,
        status: formatMilestoneStatus(milestone.status),
        dueDate: milestone.dueDate
          ? milestone.dueDate.toLocaleDateString("en-IN")
          : "TBD",
        paymentAmount: Number(milestone.paymentAmount || 0),
      })),
      notes: project.notes.map((note) => ({
        id: note.id,
        content: note.content,
        createdAt: note.createdAt.toLocaleDateString("en-IN"),
        isClientVisible: note.isClientVisible,
      })),
      documents: documents.map((document) => ({
        id: document.id,
        name: document.name,
        type: document.mimeType || "application/octet-stream",
        uploadedAt: document.createdAt.toISOString(),
        url: document.url,
      })),
    });
  } catch (error) {
    console.error("Get portal project detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}
