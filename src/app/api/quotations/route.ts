import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit-log";
import { normalizeCurrency } from "@/lib/billing";
import { prisma } from "@/lib/prisma";
import { notifyAdmins } from "@/lib/realtime";
import { quotationSchema } from "@/lib/validations";

function generateQuotationNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `DQ-${year}${month}-${random}`;
}

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const clientId = url.searchParams.get("clientId");
    const leadId = url.searchParams.get("leadId");
    const search = url.searchParams.get("search");
    const deleted = url.searchParams.get("deleted") || "exclude";
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;

    const where: any = {};
    if (deleted === "only") {
      where.deletedAt = { not: null };
    } else if (deleted !== "include") {
      where.deletedAt = null;
    }
    if (status) where.status = status;
    if (clientId) where.clientId = clientId;
    if (leadId) where.leadId = leadId;
    if (search) {
      where.OR = [
        { quotationNumber: { contains: search, mode: "insensitive" } },
        { title: { contains: search, mode: "insensitive" } },
      ];
    }

    const quotations = await prisma.quotation.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            companyName: true,
            email: true,
          },
        },
        lead: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        items: {
          orderBy: { order: "asc" },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        deletedBy: {
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

    const total = await prisma.quotation.count({ where });

    const data = quotations.map((quotation) => ({
      ...quotation,
      clientName:
        quotation.client?.companyName ||
        quotation.lead?.fullName ||
        "Unassigned",
      createdBy: quotation.createdBy?.name || quotation.createdBy?.email || "Unknown User",
      total: Number(quotation.total || 0),
      currency: quotation.currency || "INR",
      validUntil: quotation.validUntil?.toISOString() || null,
      deletedAt: quotation.deletedAt?.toISOString() || null,
      deletedBy:
        quotation.deletedBy?.name ||
        quotation.deletedBy?.email ||
        null,
      deleteReason: quotation.deleteReason || "",
      status: quotation.status
        .toLowerCase()
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" "),
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
    console.error("Get quotations error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch quotations" },
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
    const items = Array.isArray(body.items)
      ? body.items
      : Array.isArray(body.lineItems)
        ? body.lineItems.map((item: any) => ({
            description: item.description,
            quantity: Number(item.quantity),
            rate: Number(item.unitPrice),
            taxPercent: Number(item.taxPercent || 0),
            discount: Number(item.discount || 0),
          }))
        : [];

    const normalizedData = {
      clientId: body.clientId || "",
      leadId: body.leadId || "",
      title: body.title || "",
      description: body.description || "",
      validUntil: body.validUntil || "",
      termsNotes: body.termsNotes || body.notes || "",
      template: body.template || "",
      currency: normalizeCurrency(body.currency),
      discountAmount:
        body.discountAmount !== undefined
          ? Number(body.discountAmount)
          : Number(body.totalDiscount || 0),
      items,
    };

    if (!normalizedData.title || (!normalizedData.clientId && !normalizedData.leadId) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Title, line items, and either a client or lead are required" },
        { status: 400 }
      );
    }

    quotationSchema.parse({
      clientId: normalizedData.clientId || "lead-only",
      title: normalizedData.title,
      description: normalizedData.description,
      items: normalizedData.items.map((item: any) => ({
        description: item.description,
        quantity: Number(item.quantity),
        rate: Number(item.rate),
      })),
      validUntil: normalizedData.validUntil
        ? new Date(normalizedData.validUntil).toISOString()
        : undefined,
      notes: normalizedData.termsNotes,
    });

    // Auto-generate quotation number
    const quotationNumber = generateQuotationNumber();

    // Calculate totals
    let subtotal = 0;
    let taxAmount = 0;

    for (const item of normalizedData.items) {
      const itemTotal = Number(item.quantity) * Number(item.rate);
      subtotal += itemTotal;
      taxAmount += (itemTotal * Number(item.taxPercent || 0)) / 100 || 0;
    }

    const discountAmount = normalizedData.discountAmount;
    const total = subtotal + taxAmount - discountAmount;

    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber,
        currency: normalizedData.currency,
        title: normalizedData.title,
        description: normalizedData.description || null,
        validUntil: normalizedData.validUntil
          ? new Date(normalizedData.validUntil)
          : null,
        termsNotes: normalizedData.termsNotes || null,
        status: "DRAFT",
        subtotal,
        taxAmount,
        discountAmount,
        total,
        template: normalizedData.template || null,
        clientId: normalizedData.clientId || null,
        leadId: normalizedData.leadId || null,
        createdById: session.user.id,
        items: {
          createMany: {
            data: normalizedData.items.map((item: any, index: number) => ({
              description: item.description,
              quantity: Number(item.quantity),
              unitPrice: Number(item.rate),
              taxPercent: Number(item.taxPercent || 0),
              discount: Number(item.discount || 0),
              total: Number(item.quantity) * Number(item.rate),
              order: index,
            })),
          },
        },
      },
      include: {
        client: {
          select: {
            id: true,
            companyName: true,
          },
        },
        lead: {
          select: {
            id: true,
            fullName: true,
          },
        },
        items: {
          orderBy: { order: "asc" },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    await recordAuditLog({
      entityType: "quotation",
      entityId: quotation.id,
      action: "created",
      summary: `Quotation ${quotation.quotationNumber} was created`,
      userId: session.user.id,
      metadata: {
        quotationNumber: quotation.quotationNumber,
        currency: quotation.currency || "INR",
        total: Number(quotation.total || 0),
        status: quotation.status,
      },
    });

    await notifyAdmins({
      title: "Quotation created",
      message: `${quotation.quotationNumber} was created${quotation.client?.companyName ? ` for ${quotation.client.companyName}` : ""}.`,
      link: `/admin/quotations/${quotation.id}`,
      topics: ["dashboard", "quotations", "notifications"],
      metadata: {
        quotationId: quotation.id,
        status: quotation.status,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Quotation created successfully",
        data: quotation,
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

    console.error("Create quotation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create quotation" },
      { status: 500 }
    );
  }
}
