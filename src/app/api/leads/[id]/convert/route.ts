import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyAdmins, notifyClientUsersByEmail } from "@/lib/realtime";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: Record<string, unknown> = {};
    try {
      const text = await request.text();
      if (text) body = JSON.parse(text);
    } catch {
      // No body or invalid JSON — use defaults
    }

    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
      include: {
        convertedClient: {
          select: {
            id: true,
            companyName: true,
            email: true,
          },
        },
        convertedProject: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    if (!lead) {
      return NextResponse.json(
        { success: false, error: "Lead not found" },
        { status: 404 }
      );
    }

    if (lead.convertedClientId) {
      return NextResponse.json(
        {
          success: true,
          message: "Lead is already linked to a client record",
          data: {
            lead,
            client: lead.convertedClient,
            project: lead.convertedProject,
            usedExistingClient: true,
            alreadyConverted: true,
          },
        },
        { status: 200 }
      );
    }

    const existingClient = await prisma.client.findUnique({
      where: { email: lead.email },
      select: {
        id: true,
        companyName: true,
        contactName: true,
        email: true,
        phone: true,
        country: true,
      },
    });

    const client = existingClient
      ? await prisma.client.update({
          where: { id: existingClient.id },
          data: {
            companyName: existingClient.companyName || lead.companyName || lead.fullName,
            contactName: existingClient.contactName || lead.fullName,
            phone: existingClient.phone || lead.phone || null,
            country: existingClient.country || lead.country || null,
            isActive: true,
          },
        })
      : await prisma.client.create({
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
        name: (body.projectName as string) || `Project for ${lead.companyName || lead.fullName}`,
        category: ((body.category as string) || "CUSTOM_DEVELOPMENT") as import("@prisma/client").ProjectCategory,
        description: (body.projectDescription as string) || lead.requirementsSummary || null,
        clientId: client.id,
        leadId: lead.id,
        managerId: (body.managerId as string) || null,
        status: "DRAFT",
        budget: body.budget ? Number(body.budget) : null,
        billingModel: ((body.billingModel as string) || "FIXED_PRICE") as import("@prisma/client").BillingModel,
      },
      include: {
        client: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            email: true,
          },
        },
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
      include: {
        convertedClient: {
          select: {
            id: true,
            companyName: true,
            email: true,
          },
        },
        convertedProject: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    // Create activity log
    await prisma.leadActivity.create({
      data: {
        leadId: params.id,
        type: "CONVERTED",
        description: `Lead linked to Client (${client.id}) and Project (${project.id})`,
        userId: session.user.id,
        metadata: {
          clientId: client.id,
          projectId: project.id,
          usedExistingClient: Boolean(existingClient),
        },
      },
    });

    await notifyAdmins({
      title: existingClient ? "Lead linked to existing client" : "Lead converted to client",
      message: `${lead.fullName} is now linked to ${client.companyName || client.email}.`,
      type: "LEAD",
      link: `/admin/leads/${lead.id}`,
      topics: ["dashboard", "leads", "clients", "projects", "notifications"],
      metadata: {
        leadId: lead.id,
        clientId: client.id,
        projectId: project.id,
        usedExistingClient: Boolean(existingClient),
      },
    });

    await notifyClientUsersByEmail({
      email: client.email,
      title: "Lead converted into active client work",
      message: `${project.name} has been created and linked to your client account.`,
      type: "PROJECT",
      link: "/portal/projects",
      topics: ["projects", "dashboard", "notifications"],
      metadata: {
        clientId: client.id,
        projectId: project.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: existingClient
          ? "Lead linked to the existing client and a new project successfully"
          : "Lead converted to client and project successfully",
        data: {
          lead: updatedLead,
          client,
          project,
          usedExistingClient: Boolean(existingClient),
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
