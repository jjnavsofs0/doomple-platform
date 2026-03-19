import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { QuotationStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type QuotationRequestItem = {
  description: string;
  quantity: number | string;
  unitPrice: number | string;
  taxPercent?: number | string;
  discount?: number | string;
};

const normalizeQuotationStatus = (
  status: unknown,
  fallback: QuotationStatus
): QuotationStatus => {
  const normalized = String(status || "").toUpperCase();
  if (
    normalized === "DRAFT" ||
    normalized === "SENT" ||
    normalized === "ACCEPTED" ||
    normalized === "REJECTED" ||
    normalized === "EXPIRED"
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

    const quotation = await prisma.quotation.findUnique({
      where: { id: params.id },
      include: {
        items: {
          orderBy: { order: "asc" },
        },
        client: {
          select: {
            id: true,
            companyName: true,
            email: true,
            phone: true,
          },
        },
        lead: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!quotation) {
      return NextResponse.json(
        { success: false, error: "Quotation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...quotation,
        clientName:
          quotation.client?.companyName ||
          quotation.lead?.fullName ||
          "Unassigned",
        createdBy:
          quotation.createdBy?.name ||
          quotation.createdBy?.email ||
          "Unknown User",
        lineItems: quotation.items.map((item) => ({
          ...item,
          quantity: Number(item.quantity || 0),
          unitPrice: Number(item.unitPrice || 0),
          taxPercent: Number(item.taxPercent || 0),
          discount: Number(item.discount || 0),
        })),
        subtotal: Number(quotation.subtotal || 0),
        taxAmount: Number(quotation.taxAmount || 0),
        totalDiscount: Number(quotation.discountAmount || 0),
        total: Number(quotation.total || 0),
        status: quotation.status
          .toLowerCase()
          .split("_")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" "),
      },
    });
  } catch (error) {
    console.error("Get quotation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch quotation" },
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

    const existingQuotation = await prisma.quotation.findUnique({
      where: { id: params.id },
    });

    if (!existingQuotation) {
      return NextResponse.json(
        { success: false, error: "Quotation not found" },
        { status: 404 }
      );
    }

    // Calculate new totals if items provided
    let subtotal = Number(existingQuotation.subtotal || 0);
    let taxAmount = Number(existingQuotation.taxAmount || 0);
    let discountAmount = Number(
      body.discountAmount ?? existingQuotation.discountAmount ?? 0
    );

    if (body.items && Array.isArray(body.items)) {
      subtotal = 0;
      taxAmount = 0;

      for (const item of body.items) {
        const itemTotal = item.quantity * item.unitPrice;
        subtotal += itemTotal;
        taxAmount += (itemTotal * item.taxPercent) / 100 || 0;
      }
    }

    const total = subtotal + taxAmount - discountAmount;

    const updatedQuotation = await prisma.quotation.update({
      where: { id: params.id },
      data: {
        title: body.title || existingQuotation.title,
        description:
          body.description !== undefined
            ? body.description
            : existingQuotation.description,
        validUntil: body.validUntil
          ? new Date(body.validUntil)
          : existingQuotation.validUntil,
        termsNotes:
          body.termsNotes !== undefined
            ? body.termsNotes
            : existingQuotation.termsNotes,
        status: normalizeQuotationStatus(body.status, existingQuotation.status),
        subtotal: Number(subtotal),
        taxAmount: Number(taxAmount),
        discountAmount: Number(discountAmount),
        total: Number(total),
        template: body.template || existingQuotation.template,
      },
    });

    // Update items if provided
    if (body.items && Array.isArray(body.items)) {
      // Delete existing items
      await prisma.quotationItem.deleteMany({
        where: { quotationId: params.id },
      });

      // Create new items
      await prisma.quotationItem.createMany({
        data: body.items.map((item: QuotationRequestItem, index: number) => ({
          quotationId: params.id,
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          taxPercent: Number(item.taxPercent || 0),
          discount: Number(item.discount || 0),
          total: Number(item.quantity) * Number(item.unitPrice),
          order: index,
        })),
      });
    }

    const quotationWithItems = await prisma.quotation.findUnique({
      where: { id: params.id },
      include: {
        items: {
          orderBy: { order: "asc" },
        },
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
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Quotation updated successfully",
      data: {
        ...quotationWithItems,
        clientName:
          quotationWithItems?.client?.companyName ||
          quotationWithItems?.lead?.fullName ||
          "Unassigned",
        createdBy:
          quotationWithItems?.createdBy?.name ||
          quotationWithItems?.createdBy?.email ||
          "Unknown User",
        lineItems: quotationWithItems?.items.map((item) => ({
          ...item,
          quantity: Number(item.quantity || 0),
          unitPrice: Number(item.unitPrice || 0),
          taxPercent: Number(item.taxPercent || 0),
          discount: Number(item.discount || 0),
        })) || [],
        subtotal: Number(quotationWithItems?.subtotal || 0),
        taxAmount: Number(quotationWithItems?.taxAmount || 0),
        totalDiscount: Number(quotationWithItems?.discountAmount || 0),
        total: Number(quotationWithItems?.total || 0),
        status: quotationWithItems?.status
          .toLowerCase()
          .split("_")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" "),
      },
    });
  } catch (error) {
    console.error("Update quotation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update quotation" },
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

    const quotation = await prisma.quotation.findUnique({
      where: { id: params.id },
    });

    if (!quotation) {
      return NextResponse.json(
        { success: false, error: "Quotation not found" },
        { status: 404 }
      );
    }

    // Delete items
    await prisma.quotationItem.deleteMany({
      where: { quotationId: params.id },
    });

    // Delete the quotation
    await prisma.quotation.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Quotation deleted successfully",
    });
  } catch (error) {
    console.error("Delete quotation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete quotation" },
      { status: 500 }
    );
  }
}
