import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { BillingModel, ProjectCategory, ProjectStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const normalizeProjectCategory = (
  category: unknown,
  fallback: ProjectCategory
): ProjectCategory => {
  const normalized = String(category || "").toUpperCase();
  if (
    normalized === "CUSTOM_DEVELOPMENT" ||
    normalized === "UEP_IMPLEMENTATION" ||
    normalized === "SAAS_TOOLKIT_BUILD" ||
    normalized === "MOBILE_APP" ||
    normalized === "DEVOPS_SUPPORT" ||
    normalized === "INFRASTRUCTURE_SUPPORT" ||
    normalized === "AI_CHATBOT" ||
    normalized === "ERP_DEVELOPMENT" ||
    normalized === "ECOMMERCE" ||
    normalized === "MARKETING_RETAINER" ||
    normalized === "WORKFORCE_CONSULTING"
  ) {
    return normalized;
  }

  return fallback;
};

const normalizeBillingModel = (
  billingModel: unknown,
  fallback: BillingModel
): BillingModel => {
  const normalized = String(billingModel || "").toUpperCase();
  if (
    normalized === "FIXED_PRICE" ||
    normalized === "MILESTONE_BASED" ||
    normalized === "RECURRING_MONTHLY" ||
    normalized === "CONSULTATION"
  ) {
    return normalized;
  }

  return fallback;
};

const normalizeProjectStatus = (
  status: unknown,
  fallback: ProjectStatus
): ProjectStatus => {
  const normalized = String(status || "").toUpperCase();
  if (
    normalized === "DRAFT" ||
    normalized === "ACTIVE" ||
    normalized === "DISCOVERY" ||
    normalized === "IN_DESIGN" ||
    normalized === "IN_DEVELOPMENT" ||
    normalized === "IN_REVIEW" ||
    normalized === "ON_HOLD" ||
    normalized === "COMPLETED" ||
    normalized === "CANCELLED"
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

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        client: {
          select: {
            id: true,
            companyName: true,
            email: true,
            phone: true,
          },
        },
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        milestones: {
          orderBy: { order: "asc" },
        },
        notes: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        documents: {
          orderBy: { uploadedAt: "desc" },
        },
        statusHistory: {
          include: {
            changedBy: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        uepDetail: true,
        toolkitDetail: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...project,
        clientName:
          project.client?.companyName ||
          project.client?.email ||
          "Unknown Client",
        managerName: project.manager?.name || "Unassigned",
        progress: project.progressPercent,
        budget: Number(project.budget || 0),
        institutionType: project.uepDetail?.institutionType || null,
        selectedModules: project.uepDetail?.selectedModules || [],
        customizationScope: project.uepDetail?.customizationScope || null,
        deploymentModel: project.uepDetail?.deploymentModel || null,
        onboardingPlan: project.uepDetail?.onboardingPlan || null,
        supportPlan: project.uepDetail?.supportPlan || null,
        baseModules: project.toolkitDetail?.baseModules || [],
        customModules: project.toolkitDetail?.customModules.join(", ") || null,
        architecturePlan: project.toolkitDetail?.architecturePlan || null,
      },
    });
  } catch (error) {
    console.error("Get project error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch project" },
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

    const body = await request.json();

    const existingProject = await prisma.project.findUnique({
      where: { id: params.id },
    });

    if (!existingProject) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    const updatedProject = await prisma.project.update({
      where: { id: params.id },
      data: {
        name: body.name || existingProject.name,
        description:
          body.description !== undefined
            ? body.description
            : existingProject.description,
        scope: body.scope !== undefined ? body.scope : existingProject.scope,
        category: normalizeProjectCategory(body.category, existingProject.category),
        status: normalizeProjectStatus(body.status, existingProject.status),
        priority: body.priority || existingProject.priority,
        budget:
          body.budget !== undefined
            ? Number(body.budget)
            : existingProject.budget,
        billingModel: normalizeBillingModel(body.billingModel, existingProject.billingModel),
        progressPercent:
          body.progressPercent !== undefined
            ? body.progressPercent
            : existingProject.progressPercent,
        startDate: body.startDate
          ? new Date(body.startDate)
          : existingProject.startDate,
        estimatedEndDate: body.estimatedEndDate
          ? new Date(body.estimatedEndDate)
          : existingProject.estimatedEndDate,
        managerId:
          body.managerId !== undefined
            ? body.managerId
            : existingProject.managerId,
      },
      include: {
        client: {
          select: {
            id: true,
            companyName: true,
          },
        },
        manager: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const nextStatus = normalizeProjectStatus(body.status, existingProject.status);

    // Log status change in ProjectStatusHistory if status changed
    if (nextStatus !== existingProject.status) {
      await prisma.projectStatusHistory.create({
        data: {
          fromStatus: existingProject.status,
          toStatus: nextStatus,
          projectId: params.id,
          changedById: session.user.id,
          note: body.statusNote || null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Project updated successfully",
      data: {
        ...updatedProject,
        clientName: updatedProject.client?.companyName || "Unknown Client",
        managerName: updatedProject.manager?.name || "Unassigned",
        progress: updatedProject.progressPercent,
        budget: Number(updatedProject.budget || 0),
      },
    });
  } catch (error) {
    console.error("Update project error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update project" },
      { status: 500 }
    );
  }
}

export const PATCH = PUT;

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    // Delete related records
    await prisma.projectMilestone.deleteMany({ where: { projectId: params.id } });
    await prisma.projectNote.deleteMany({ where: { projectId: params.id } });
    await prisma.projectDocument.deleteMany({ where: { projectId: params.id } });
    await prisma.projectStatusHistory.deleteMany({ where: { projectId: params.id } });
    await prisma.uepProjectDetail.deleteMany({ where: { projectId: params.id } });
    await prisma.toolkitProjectDetail.deleteMany({ where: { projectId: params.id } });

    // Delete the project
    await prisma.project.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
