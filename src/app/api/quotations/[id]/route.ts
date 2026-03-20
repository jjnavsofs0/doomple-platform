import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { QuotationStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { getEntityAuditLogs, recordAuditLog } from "@/lib/audit-log";
import { normalizeCurrency } from "@/lib/billing";
import { prisma } from "@/lib/prisma";
import { notifyAdmins, notifyClientUsersByEmail } from "@/lib/realtime";

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

const formatStatusLabel = (status: string) =>
  status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

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

    const includeDeleted =
      new URL(request.url).searchParams.get("includeDeleted") === "1";

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
        deletedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        invoices: {
          select: {
            id: true,
            invoiceNumber: true,
            currency: true,
            total: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!quotation) {
      return NextResponse.json(
        { success: false, error: "Quotation not found" },
        { status: 404 }
      );
    }

    if (quotation.deletedAt && !includeDeleted) {
      return NextResponse.json(
        { success: false, error: "Quotation not found" },
        { status: 404 }
      );
    }

    const auditTrail = await getEntityAuditLogs("quotation", params.id);

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
        currency: quotation.currency || "INR",
        deletedAt: quotation.deletedAt,
        deleteReason: quotation.deleteReason || "",
        deletedBy:
          quotation.deletedBy?.name ||
          quotation.deletedBy?.email ||
          null,
        canEdit:
          !quotation.deletedAt &&
          quotation.invoices.length === 0 &&
          (quotation.status === "DRAFT" || quotation.status === "SENT"),
        canDelete:
          !quotation.deletedAt &&
          quotation.invoices.length === 0 &&
          quotation.status === "DRAFT",
        canRestore: Boolean(quotation.deletedAt),
        linkedInvoices: quotation.invoices.map((invoice) => ({
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          currency: invoice.currency || "INR",
          total: Number(invoice.total || 0),
          createdAt: invoice.createdAt,
          status: formatStatusLabel(invoice.status),
        })),
        status: formatStatusLabel(quotation.status),
        auditTrail: auditTrail.map((entry) => ({
          id: entry.id,
          action: entry.action,
          summary: entry.summary,
          createdAt: entry.createdAt,
          metadata: entry.metadata,
          userName: entry.user?.name || entry.user?.email || "System",
        })),
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
      include: {
        invoices: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!existingQuotation) {
      return NextResponse.json(
        { success: false, error: "Quotation not found" },
        { status: 404 }
      );
    }

    if (existingQuotation.deletedAt) {
      return NextResponse.json(
        {
          success: false,
          error: "Deleted quotations cannot be edited. Restore it from the bin first.",
        },
        { status: 400 }
      );
    }

    if (existingQuotation.invoices.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Quotations linked to invoices are locked and cannot be edited.",
        },
        { status: 400 }
      );
    }

    if (
      existingQuotation.status !== "DRAFT" &&
      existingQuotation.status !== "SENT"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Only draft or sent quotations can be edited. Accepted, rejected, or expired quotations are locked.",
        },
        { status: 400 }
      );
    }

    const requestedKeys = Object.keys(body).filter(
      (key) => body[key] !== undefined
    );
    const hasNonStatusChange = requestedKeys.some((key) => key !== "status");

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
        currency:
          body.currency !== undefined
            ? normalizeCurrency(body.currency)
            : existingQuotation.currency,
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
            email: true,
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
        deletedBy: {
          select: {
            name: true,
            email: true,
          },
        },
        invoices: {
          select: {
            id: true,
            invoiceNumber: true,
            currency: true,
            total: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (existingQuotation.status !== updatedQuotation.status) {
      await recordAuditLog({
        entityType: "quotation",
        entityId: params.id,
        action: "status_changed",
        summary: `Quotation ${existingQuotation.quotationNumber} moved from ${existingQuotation.status} to ${updatedQuotation.status}`,
        userId: session.user.id,
        metadata: {
          quotationNumber: existingQuotation.quotationNumber,
          fromStatus: existingQuotation.status,
          toStatus: updatedQuotation.status,
        },
      });
    }

    if (hasNonStatusChange) {
      await recordAuditLog({
        entityType: "quotation",
        entityId: params.id,
        action: "updated",
        summary: `Quotation ${existingQuotation.quotationNumber} details were updated`,
        userId: session.user.id,
        metadata: {
          quotationNumber: existingQuotation.quotationNumber,
          status: updatedQuotation.status,
          changedFields: requestedKeys.filter((key) => key !== "status"),
        },
      });
    }

    if (quotationWithItems) {
      await notifyAdmins({
        title: "Quotation updated",
        message: `${quotationWithItems.quotationNumber} was updated.`,
        link: `/admin/quotations/${params.id}`,
        topics: ["dashboard", "quotations", "notifications"],
        metadata: {
          quotationId: params.id,
          status: updatedQuotation.status,
        },
      });

      if (existingQuotation.status !== updatedQuotation.status) {
        await notifyClientUsersByEmail({
          email: quotationWithItems.client?.email,
          title: "Quotation status updated",
          message: `${quotationWithItems.quotationNumber} is now ${formatStatusLabel(updatedQuotation.status)}.`,
          link: "/portal/invoices",
          topics: ["quotations", "notifications"],
          metadata: {
            quotationId: params.id,
            status: updatedQuotation.status,
          },
        });
      }
    }

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
        currency: quotationWithItems?.currency || "INR",
        deletedAt: quotationWithItems?.deletedAt || null,
        deleteReason: quotationWithItems?.deleteReason || "",
        deletedBy:
          quotationWithItems?.deletedBy?.name ||
          quotationWithItems?.deletedBy?.email ||
          null,
        canEdit:
          !quotationWithItems?.deletedAt &&
          (quotationWithItems?.invoices.length || 0) === 0 &&
          (quotationWithItems?.status === "DRAFT" ||
            quotationWithItems?.status === "SENT"),
        canDelete:
          !quotationWithItems?.deletedAt &&
          (quotationWithItems?.invoices.length || 0) === 0 &&
          quotationWithItems?.status === "DRAFT",
        canRestore: Boolean(quotationWithItems?.deletedAt),
        linkedInvoices:
          quotationWithItems?.invoices.map((invoice) => ({
            id: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            currency: invoice.currency || "INR",
            total: Number(invoice.total || 0),
            createdAt: invoice.createdAt,
            status: formatStatusLabel(invoice.status),
          })) || [],
        status: formatStatusLabel(String(quotationWithItems?.status || "DRAFT")),
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

    const body = await request.json().catch(() => ({}));

    const quotation = await prisma.quotation.findUnique({
      where: { id: params.id },
      include: {
        invoices: {
          select: {
            id: true,
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

    if (quotation.deletedAt) {
      return NextResponse.json(
        { success: false, error: "Quotation is already in the bin" },
        { status: 400 }
      );
    }

    if (quotation.invoices.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Quotations linked to invoices cannot be deleted.",
        },
        { status: 400 }
      );
    }

    if (quotation.status !== "DRAFT") {
      return NextResponse.json(
        {
          success: false,
          error: "Only draft quotations can be moved to the bin.",
        },
        { status: 400 }
      );
    }

    await prisma.quotation.update({
      where: { id: params.id },
      data: {
        deletedAt: new Date(),
        deletedById: session.user.id,
        deleteReason:
          typeof body.reason === "string" && body.reason.trim().length > 0
            ? body.reason.trim()
            : null,
      },
    });

    await recordAuditLog({
      entityType: "quotation",
      entityId: quotation.id,
      action: "deleted",
      summary: `Quotation ${quotation.quotationNumber} was moved to the bin`,
      userId: session.user.id,
      metadata: {
        quotationNumber: quotation.quotationNumber,
        status: quotation.status,
        total: Number(quotation.total || 0),
        currency: quotation.currency || "INR",
        deleteReason:
          typeof body.reason === "string" && body.reason.trim().length > 0
            ? body.reason.trim()
            : null,
      },
    });

    await notifyAdmins({
      title: "Quotation moved to bin",
      message: `${quotation.quotationNumber} was moved to the quotation bin.`,
      topics: ["dashboard", "quotations", "notifications"],
      metadata: {
        quotationId: quotation.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Quotation moved to bin successfully",
    });
  } catch (error) {
    console.error("Delete quotation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete quotation" },
      { status: 500 }
    );
  }
}
