import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyAdmins, notifyUserById } from "@/lib/realtime";
import { leadSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const category = url.searchParams.get("category");
    const priority = url.searchParams.get("priority");
    const assignedTo = url.searchParams.get("assignedTo");
    const search = url.searchParams.get("search");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (priority) where.priority = priority;
    if (assignedTo) where.assignedToId = assignedTo;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { companyName: { contains: search, mode: "insensitive" } },
      ];
    }

    const leads = await prisma.lead.findMany({
      where,
      include: {
        assignedTo: {
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

    const total = await prisma.lead.count({ where });

    return NextResponse.json({
      success: true,
      data: leads,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get leads error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leads" },
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
      fullName: body.fullName || body.name || "",
      email: body.email || "",
      phone: body.phone || "",
      companyName: body.companyName || body.company || "",
      source: body.source || "WEBSITE",
      category: body.category || "SERVICE_INQUIRY",
      offeringType: body.offeringType || "",
      selectedService: body.selectedService || body.service || "",
      selectedSolution: body.selectedSolution || "",
      budgetRange: body.budgetRange || body.budget || "",
      projectType: body.projectType || "",
      businessStage: body.businessStage || "",
      timeline: body.timeline || "",
      requirementsSummary: body.requirementsSummary || body.message || "",
      priority: body.priority || "MEDIUM",
      location: body.location || "",
      country: body.country || "",
    };

    if (!normalizedData.fullName || !normalizedData.email) {
      return NextResponse.json(
        { success: false, error: "Full name and email are required" },
        { status: 400 }
      );
    }

    leadSchema.parse({
      name: normalizedData.fullName,
      email: normalizedData.email,
      phone: normalizedData.phone,
      company: normalizedData.companyName,
      service: normalizedData.selectedService || "General Inquiry",
      budget: normalizedData.budgetRange,
      message: normalizedData.requirementsSummary,
    });

    const lead = await prisma.lead.create({
      data: {
        fullName: normalizedData.fullName,
        email: normalizedData.email,
        phone: normalizedData.phone || null,
        companyName: normalizedData.companyName || null,
        source: normalizedData.source,
        category: normalizedData.category,
        status: "NEW",
        priority: normalizedData.priority,
        offeringType: normalizedData.offeringType || null,
        selectedService: normalizedData.selectedService || null,
        selectedSolution: normalizedData.selectedSolution || null,
        budgetRange: normalizedData.budgetRange || null,
        projectType: normalizedData.projectType || null,
        businessStage: normalizedData.businessStage || null,
        timeline: normalizedData.timeline || null,
        requirementsSummary: normalizedData.requirementsSummary || null,
        location: normalizedData.location || null,
        country: normalizedData.country || null,
        assignedToId: body.assignedToId || null,
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

    // Create initial activity log
    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        type: "CREATED",
        description: "Lead created",
        userId: session.user.id,
      },
    });

    await notifyAdmins({
      title: "New lead created",
      message: `${lead.fullName} entered the CRM${lead.companyName ? ` from ${lead.companyName}` : ""}.`,
      type: "LEAD",
      link: `/admin/leads/${lead.id}`,
      topics: ["dashboard", "leads", "notifications"],
      email: true,
      metadata: {
        leadId: lead.id,
        status: lead.status,
      },
    });

    if (lead.assignedToId) {
      await notifyUserById({
        userId: lead.assignedToId,
        title: "Lead assigned to you",
        message: `${lead.fullName} is now assigned to your queue.`,
        type: "LEAD",
        link: `/admin/leads/${lead.id}`,
        topics: ["leads", "notifications"],
        metadata: {
          leadId: lead.id,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Lead created successfully",
        data: lead,
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

    console.error("Create lead error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create lead" },
      { status: 500 }
    );
  }
}
