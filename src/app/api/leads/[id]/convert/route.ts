import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
    });

    if (!lead) {
      return NextResponse.json(
        { success: false, error: "Lead not found" },
        { status: 404 }
      );
    }

    // Check if already converted
    if (lead.convertedClientId) {
      return NextResponse.json(
        { success: false, error: "Lead already converted" },
        { status: 400 }
      );
    }

    // Create Client from lead data
    const client = await prisma.client.create({
      data: {
        type: "company",
        companyName: lead.companyName || lead.fullName,
        contactName: lead.fullName,
        email: lead.email,
        phone: lead.phone || null,
        country: lead.country || null,
        isActive: true,
      },
    });

    // Create Project
    const project = await prisma.project.create({
      data: {
        name: body.projectName || `Project for ${lead.companyName || lead.fullName}`,
        category: body.category || "CUSTOM_DEVELOPMENT",
        description: body.projectDescription || lead.requirementsSummary || null,
        clientId: client.id,
        leadId: lead.id,
        managerId: body.managerId || null,
        status: "DRAFT",
        budget: body.budget ? Number(body.budget) : null,
        billingModel: body.billingModel || "FIXED_PRICE",
      },
      include: {
        client: true,
      },
    });

    // Create initial project status history
    await prisma.projectStatusHistory.create({
      data: {
        fromStatus: "DRAFT",
        toStatus: "DRAFT",
        projectId: project.id,
        changedById: session.user.id,
        note: "Project created from lead conversion",
      },
    });

    // Update lead with conversion info and status
    const updatedLead = await prisma.lead.update({
      where: { id: params.id },
      data: {
        status: "WON",
        convertedClientId: client.id,
        convertedProjectId: project.id,
      },
    });

    // Create activity log
    await prisma.leadActivity.create({
      data: {
        leadId: params.id,
        type: "CONVERTED",
        description: `Lead converted to Client (${client.id}) and Project (${project.id})`,
        userId: session.user.id,
        metadata: {
          clientId: client.id,
          projectId: project.id,
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Lead converted to client and project successfully",
        data: {
          lead: updatedLead,
          client,
          project,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Lead conversion error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to convert lead" },
      { status: 500 }
    );
  }
}
