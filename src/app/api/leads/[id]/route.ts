import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
      include: {
        notes: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        activities: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
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

    return NextResponse.json({
      success: true,
      data: lead,
    });
  } catch (error) {
    console.error("Get lead error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch lead" },
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

    const existingLead = await prisma.lead.findUnique({
      where: { id: params.id },
    });

    if (!existingLead) {
      return NextResponse.json(
        { success: false, error: "Lead not found" },
        { status: 404 }
      );
    }

    // Update lead
    const updatedLead = await prisma.lead.update({
      where: { id: params.id },
      data: {
        fullName: body.fullName || existingLead.fullName,
        email: body.email || existingLead.email,
        phone: body.phone !== undefined ? body.phone : existingLead.phone,
        companyName:
          body.companyName !== undefined
            ? body.companyName
            : existingLead.companyName,
        source: body.source || existingLead.source,
        category: body.category || existingLead.category,
        status: body.status || existingLead.status,
        priority: body.priority || existingLead.priority,
        budgetRange:
          body.budgetRange !== undefined
            ? body.budgetRange
            : existingLead.budgetRange,
        location:
          body.location !== undefined ? body.location : existingLead.location,
        country:
          body.country !== undefined ? body.country : existingLead.country,
        requirementsSummary:
          body.requirementsSummary !== undefined
            ? body.requirementsSummary
            : existingLead.requirementsSummary,
        assignedToId:
          body.assignedToId !== undefined
            ? body.assignedToId
            : existingLead.assignedToId,
        followUpDate:
          body.followUpDate !== undefined
            ? body.followUpDate
            : existingLead.followUpDate,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Log status change as activity if status changed
    if (body.status && body.status !== existingLead.status) {
      await prisma.leadActivity.create({
        data: {
          leadId: params.id,
          type: "STATUS_CHANGED",
          description: `Status changed from ${existingLead.status} to ${body.status}`,
          userId: session.user.id,
          metadata: {
            fromStatus: existingLead.status,
            toStatus: body.status,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Lead updated successfully",
      data: updatedLead,
    });
  } catch (error) {
    console.error("Update lead error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update lead" },
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

    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
    });

    if (!lead) {
      return NextResponse.json(
        { success: false, error: "Lead not found" },
        { status: 404 }
      );
    }

    // Delete related records first
    await prisma.leadNote.deleteMany({ where: { leadId: params.id } });
    await prisma.leadActivity.deleteMany({ where: { leadId: params.id } });

    // Delete the lead
    await prisma.lead.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (error) {
    console.error("Delete lead error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete lead" },
      { status: 500 }
    );
  }
}
