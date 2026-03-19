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

export async function GET() {
  try {
    const portalClient = await getPortalClient();
    if ("error" in portalClient) {
      return NextResponse.json({ error: portalClient.error }, { status: portalClient.status });
    }

    const projects = await prisma.project.findMany({
      where: { clientId: portalClient.client.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        category: true,
        status: true,
        progressPercent: true,
        startDate: true,
        estimatedEndDate: true,
        description: true,
      },
    });

    return NextResponse.json({
      success: true,
      projects: projects.map((project) => ({
        id: project.id,
        name: project.name,
        category: project.category.replace(/_/g, " "),
        status: formatProjectStatus(project.status),
        progress: project.progressPercent,
        startDate: project.startDate
          ? project.startDate.toLocaleDateString("en-IN")
          : "TBD",
        estimatedEndDate: project.estimatedEndDate
          ? project.estimatedEndDate.toLocaleDateString("en-IN")
          : "TBD",
        description: project.description || "",
      })),
    });
  } catch (error) {
    console.error("Get portal projects error:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
