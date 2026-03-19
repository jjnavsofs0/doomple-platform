import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { BillingModel, ProjectCategory } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { projectSchema } from "@/lib/validations";

const validProjectCategories = new Set<ProjectCategory>([
  "CUSTOM_DEVELOPMENT",
  "UEP_IMPLEMENTATION",
  "SAAS_TOOLKIT_BUILD",
  "MOBILE_APP",
  "DEVOPS_SUPPORT",
  "INFRASTRUCTURE_SUPPORT",
  "AI_CHATBOT",
  "ERP_DEVELOPMENT",
  "ECOMMERCE",
  "MARKETING_RETAINER",
  "WORKFORCE_CONSULTING",
]);

const validBillingModels = new Set<BillingModel>([
  "FIXED_PRICE",
  "MILESTONE_BASED",
  "RECURRING_MONTHLY",
  "CONSULTATION",
]);

const normalizeProjectCategory = (category?: string): ProjectCategory => {
  if (category === "CONSULTING") return "WORKFORCE_CONSULTING";
  if (category && validProjectCategories.has(category as ProjectCategory)) {
    return category as ProjectCategory;
  }
  return "CUSTOM_DEVELOPMENT";
};

const normalizeBillingModel = (billingModel?: string): BillingModel => {
  if (billingModel === "PROJECT_BASED" || billingModel === "FIXED_SCOPE") {
    return "FIXED_PRICE";
  }
  if (billingModel === "MONTHLY_RETAINER" || billingModel === "DEDICATED_TEAM") {
    return "RECURRING_MONTHLY";
  }
  if (billingModel && validBillingModels.has(billingModel as BillingModel)) {
    return billingModel as BillingModel;
  }
  return "FIXED_PRICE";
};

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const category = url.searchParams.get("category");
    const clientId = url.searchParams.get("clientId");
    const managerId = url.searchParams.get("managerId");
    const search = url.searchParams.get("search");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (clientId) where.clientId = clientId;
    if (managerId) where.managerId = managerId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            companyName: true,
            email: true,
          },
        },
        manager: {
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

    const total = await prisma.project.count({ where });

    const data = projects.map((project) => ({
      ...project,
      clientName: project.client?.companyName || project.client?.email || "Unknown Client",
      managerName: project.manager?.name || "Unassigned",
      progress: project.progressPercent,
      budget: Number(project.budget || 0),
    }));

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get projects error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const normalizedData = {
      name: body.name || "",
      description: body.description || "",
      scope: body.scope || "",
      clientId: body.clientId || "",
      managerId: body.managerId || "",
      category: normalizeProjectCategory(body.category),
      billingModel: normalizeBillingModel(body.billingModel),
      budget: body.budget ? Number(body.budget) : undefined,
      startDate: body.startDate || "",
      estimatedEndDate: body.estimatedEndDate || body.endDate || "",
      priority: body.priority || "MEDIUM",
    };

    if (!normalizedData.name || !normalizedData.clientId) {
      return NextResponse.json(
        { success: false, error: "Project name and client are required" },
        { status: 400 }
      );
    }

    projectSchema.parse({
      name: normalizedData.name,
      description: normalizedData.description,
      clientId: normalizedData.clientId,
      budget: normalizedData.budget,
      startDate: normalizedData.startDate
        ? new Date(normalizedData.startDate).toISOString()
        : "",
      endDate: normalizedData.estimatedEndDate
        ? new Date(normalizedData.estimatedEndDate).toISOString()
        : "",
    });

    // Check if client exists
    const clientExists = await prisma.client.findUnique({
      where: { id: normalizedData.clientId },
    });

    if (!clientExists) {
      return NextResponse.json(
        { success: false, error: "Client not found" },
        { status: 404 }
      );
    }

    const project = await prisma.project.create({
      data: {
        name: normalizedData.name,
        category: normalizedData.category,
        description: normalizedData.description || null,
        scope: normalizedData.scope || null,
        clientId: normalizedData.clientId,
        leadId: body.leadId || null,
        managerId: normalizedData.managerId || null,
        status: "DRAFT",
        priority: normalizedData.priority,
        budget: normalizedData.budget ?? null,
        billingModel: normalizedData.billingModel,
        startDate: normalizedData.startDate ? new Date(normalizedData.startDate) : null,
        estimatedEndDate: normalizedData.estimatedEndDate
          ? new Date(normalizedData.estimatedEndDate)
          : null,
        ...(normalizedData.category === "UEP_IMPLEMENTATION"
          ? {
              uepDetail: {
                create: {
                  institutionType: body.institutionType || null,
                  selectedModules: Array.isArray(body.selectedModules) ? body.selectedModules : [],
                  customizationScope: body.customizationScope || null,
                  deploymentModel: body.deploymentModel || null,
                  onboardingPlan: body.onboardingPlan || null,
                  supportPlan: body.supportPlan || null,
                },
              },
            }
          : {}),
        ...(normalizedData.category === "SAAS_TOOLKIT_BUILD"
          ? {
              toolkitDetail: {
                create: {
                  baseModules: Array.isArray(body.baseModules) ? body.baseModules : [],
                  customModules: body.customModules
                    ? String(body.customModules)
                        .split(",")
                        .map((module: string) => module.trim())
                        .filter(Boolean)
                    : [],
                  architecturePlan: body.architecturePlan || null,
                  launchChecklist: null,
                  saasReadinessChecklist: null,
                },
              },
            }
          : {}),
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

    // Create initial status history entry
    await prisma.projectStatusHistory.create({
      data: {
        fromStatus: "DRAFT",
        toStatus: "DRAFT",
        projectId: project.id,
        changedById: session.user.id,
        note: "Project created",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Project created successfully",
        data: project,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("validation")) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        );
      }
    }

    console.error("Create project error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create project" },
      { status: 500 }
    );
  }
}
