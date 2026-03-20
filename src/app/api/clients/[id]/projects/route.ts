import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getProjectCoreSelect, supportsProjectCurrencyField } from "@/lib/project-db-compat";
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
    const projectCurrencySupported = await supportsProjectCurrencyField();

    const projects = await prisma.project.findMany({
      where: { clientId: params.id },
      orderBy: { createdAt: "desc" },
      select: getProjectCoreSelect(projectCurrencySupported),
    });

    return NextResponse.json({
      success: true,
      data: projects.map((project) => ({
        ...project,
        status: String(project.status || "").toLowerCase(),
        progress: project.progressPercent,
        category: project.category.replaceAll("_", " "),
      })),
    });
  } catch (error) {
    console.error("Get client projects error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch client projects" },
      { status: 500 }
    );
  }
}
