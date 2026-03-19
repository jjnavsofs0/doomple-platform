import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { InvoiceStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { getEntityAuditLogs, recordAuditLog } from "@/lib/audit-log";
import { normalizeCurrency } from "@/lib/billing";
import { prisma } from "@/lib/prisma";
import { notifyAdmins, notifyClientUsersByEmail } from "@/lib/realtime";

type InvoiceRequestItem = {
  description: string;
  quantity: number | string;
  unitPrice: number | string;
  taxPercent?: number | string;
  discount?: number | string;
};

const normalizeInvoiceStatus = (
  status: unknown,
  fallback: InvoiceStatus
): InvoiceStatus => {
  const normalized = String(status || "").toUpperCase();
  if (
    normalized === "DRAFT" ||
    normalized === "SENT" ||
    normalized === "PARTIALLY_PAID" ||
    normalized === "PAID" ||
    normalized === "OVERDUE" ||
    normalized === "CANCELLED"
  ) {
    return normalized;
  }

  return fallback;
};

function serializeInvoice(invoice: any) {
  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    subtotal: Number(invoice.subtotal || 0),
    taxAmount: Number(invoice.taxAmount || 0),
    totalDiscount: 0,
    total: Number(invoice.total || 0),
    amountPaid: Number(invoice.paidAmount || 0),
    notes: invoice.notes || "",
    status: String(invoice.status || "DRAFT")
      .toLowerCase()
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" "),
    billingCategory: invoice.billingCategory || "General",
    currency: invoice.currency || "INR",
    clientId: invoice.clientId,
    clientName: invoice.client?.companyName || "Unknown Client",
    projectId: invoice.projectId,
    projectName: invoice.project?.name || null,
    quotationId: invoice.quotationId || null,
    quotationNumber: invoice.quotation?.quotationNumber || null,
    canEdit: invoice.status === "DRAFT",
    canDelete: invoice.status === "DRAFT",
    createdAt: invoice.createdAt,
    createdBy: invoice.createdBy?.name || invoice.createdBy?.email || "Unknown User",
    lineItems: (invoice.items || []).map((item: any) => ({
      id: item.id,
      description: item.description,
      quantity: Number(item.quantity || 0),
      unitPrice: Number(item.unitPrice || 0),
      taxPercent: Number(item.taxPercent || 0),
      discount: 0,
      total: Number(item.total || 0),
      order: item.order,
    })),
    client: invoice.client
      ? {
          id: invoice.client.id,
          companyName: invoice.client.companyName,
          email: invoice.client.email,
          phone: invoice.client.phone,
          billingAddress: invoice.client.billingAddress,
          city: invoice.client.city,
          state: invoice.client.state,
          country: invoice.client.country,
        }
      : null,
    project: invoice.project
      ? {
          id: invoice.project.id,
          name: invoice.project.name,
        }
      : null,
    payments: (invoice.payments || []).map((payment: any) => ({
      id: payment.id,
      amount: Number(payment.amount || 0),
      method: payment.method,
      status: payment.status,
      razorpayPaymentId: payment.razorpayPaymentId,
      date: payment.paidAt?.toISOString() || new Date().toISOString(),
      paidAt: payment.paidAt,
      createdAt: payment.createdAt,
    })),
  };
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invoice = await prisma.invoice.findUnique({
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
            billingAddress: true,
            city: true,
            state: true,
            country: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        quotation: {
          select: {
            id: true,
            quotationNumber: true,
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            method: true,
            status: true,
            paidAt: true,
            razorpayPaymentId: true,
          },
          orderBy: { createdAt: "desc" },
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

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: "Invoice not found" },
        { status: 404 }
      );
    }

    const auditTrail = await getEntityAuditLogs("invoice", params.id);

    return NextResponse.json({
      success: true,
      data: {
        ...serializeInvoice(invoice),
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
    console.error("Get invoice error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch invoice" },
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

    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        quotation: {
          select: {
            quotationNumber: true,
          },
        },
      },
    });

    if (!existingInvoice) {
      return NextResponse.json(
        { success: false, error: "Invoice not found" },
        { status: 404 }
      );
    }

    const requestedKeys = Object.keys(body).filter(
      (key) => body[key] !== undefined
    );
    const hasNonStatusChange = requestedKeys.some((key) => key !== "status");

    if (
      existingInvoice.status === "PAID" ||
      existingInvoice.status === "PARTIALLY_PAID"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Paid or partially paid invoices are locked and cannot be edited.",
        },
        { status: 400 }
      );
    }

    if (existingInvoice.status === "CANCELLED") {
      return NextResponse.json(
        {
          success: false,
          error: "Cancelled invoices are locked and cannot be edited.",
        },
        { status: 400 }
      );
    }

    if (existingInvoice.status === "OVERDUE" && hasNonStatusChange) {
      return NextResponse.json(
        {
          success: false,
          error: "Overdue invoices are locked. Create a revised invoice instead of editing this one.",
        },
        { status: 400 }
      );
    }

    if (existingInvoice.status === "SENT") {
      const nextStatus = normalizeInvoiceStatus(body.status, existingInvoice.status);
      const sentStatusOnlyChange =
        !hasNonStatusChange &&
        (nextStatus === "SENT" || nextStatus === "CANCELLED");

      if (!sentStatusOnlyChange) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Sent invoices are locked for editing. Only cancellation is allowed after sending.",
          },
          { status: 400 }
        );
      }
    }

    // Calculate new totals if items provided
    let subtotal = Number(existingInvoice.subtotal || 0);
    let taxAmount = Number(existingInvoice.taxAmount || 0);

    if (body.items && Array.isArray(body.items)) {
      subtotal = 0;
      taxAmount = 0;

      for (const item of body.items) {
        const itemTotal = item.quantity * item.unitPrice;
        subtotal += itemTotal;
        taxAmount += (itemTotal * item.taxPercent) / 100 || 0;
      }
    }

    const total = subtotal + taxAmount;

    const updatedInvoice = await prisma.invoice.update({
      where: { id: params.id },
      data: {
        dueDate: body.dueDate
          ? new Date(body.dueDate)
          : existingInvoice.dueDate,
        billingCategory:
          body.billingCategory !== undefined
            ? body.billingCategory
            : existingInvoice.billingCategory,
        currency:
          body.currency !== undefined
            ? normalizeCurrency(body.currency)
            : existingInvoice.currency,
        subtotal: Number(subtotal),
        taxAmount: Number(taxAmount),
        total: Number(total),
        notes: body.notes !== undefined ? body.notes : existingInvoice.notes,
        status: normalizeInvoiceStatus(body.status, existingInvoice.status),
      },
    });

    // Update items if provided
    if (body.items && Array.isArray(body.items)) {
      // Delete existing items
      await prisma.invoiceItem.deleteMany({
        where: { invoiceId: params.id },
      });

      // Create new items
      await prisma.invoiceItem.createMany({
      data: body.items.map((item: InvoiceRequestItem, index: number) => ({
          invoiceId: params.id,
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          taxPercent: Number(item.taxPercent || 0),
          total:
            Number(item.quantity) * Number(item.unitPrice) +
            (Number(item.quantity) * Number(item.unitPrice) * Number(item.taxPercent || 0)) / 100 -
            Number(item.discount || 0),
          order: index,
        })),
      });
    }

    const invoiceWithItems = await prisma.invoice.findUnique({
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
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        quotation: {
          select: {
            id: true,
            quotationNumber: true,
          },
        },
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
        payments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (existingInvoice.status !== updatedInvoice.status) {
      await recordAuditLog({
        entityType: "invoice",
        entityId: params.id,
        action:
          updatedInvoice.status === "CANCELLED" ? "cancelled" : "status_changed",
        summary: `Invoice ${existingInvoice.invoiceNumber} moved from ${existingInvoice.status} to ${updatedInvoice.status}`,
        userId: session.user.id,
        metadata: {
          invoiceNumber: existingInvoice.invoiceNumber,
          fromStatus: existingInvoice.status,
          toStatus: updatedInvoice.status,
          quotationNumber: existingInvoice.quotation?.quotationNumber || null,
        },
      });
    }

    if (hasNonStatusChange) {
      await recordAuditLog({
        entityType: "invoice",
        entityId: params.id,
        action: "updated",
        summary: `Invoice ${existingInvoice.invoiceNumber} details were updated`,
        userId: session.user.id,
        metadata: {
          invoiceNumber: existingInvoice.invoiceNumber,
          status: updatedInvoice.status,
          changedFields: requestedKeys.filter((key) => key !== "status"),
        },
      });
    }

    if (invoiceWithItems) {
      await notifyAdmins({
        title: "Invoice updated",
        message: `${existingInvoice.invoiceNumber} was updated.`,
        type: "INVOICE",
        link: `/admin/invoices/${params.id}`,
        topics: ["dashboard", "invoices", "payments", "notifications"],
        metadata: {
          invoiceId: params.id,
          status: updatedInvoice.status,
        },
      });

      if (existingInvoice.status !== updatedInvoice.status) {
        await notifyClientUsersByEmail({
          email: invoiceWithItems.client?.email,
          title: "Invoice status updated",
          message: `${existingInvoice.invoiceNumber} is now ${String(updatedInvoice.status).toLowerCase().replaceAll("_", " ")}.`,
          type: "INVOICE",
          link: "/portal/invoices",
          topics: ["invoices", "payments", "notifications"],
          metadata: {
            invoiceId: params.id,
            status: updatedInvoice.status,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Invoice updated successfully",
      data: invoiceWithItems ? serializeInvoice(invoiceWithItems) : null,
    });
  } catch (error) {
    console.error("Update invoice error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update invoice" },
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

    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
    });

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: "Invoice not found" },
        { status: 404 }
      );
    }

    // Only allow deletion of DRAFT invoices
    if (invoice.status !== "DRAFT") {
      return NextResponse.json(
        {
          success: false,
          error: "Only DRAFT invoices can be deleted",
        },
        { status: 400 }
      );
    }

    // Delete items
    await prisma.invoiceItem.deleteMany({
      where: { invoiceId: params.id },
    });

    // Delete payments
    await prisma.payment.deleteMany({
      where: { invoiceId: params.id },
    });

    await recordAuditLog({
      entityType: "invoice",
      entityId: invoice.id,
      action: "deleted",
      summary: `Draft invoice ${invoice.invoiceNumber} was permanently deleted`,
      userId: session.user.id,
      metadata: {
        invoiceNumber: invoice.invoiceNumber,
        status: invoice.status,
        total: Number(invoice.total || 0),
        currency: invoice.currency || "INR",
      },
    });

    await notifyAdmins({
      title: "Invoice deleted",
      message: `${invoice.invoiceNumber} was permanently deleted.`,
      type: "INVOICE",
      topics: ["dashboard", "invoices", "notifications"],
      metadata: {
        invoiceId: invoice.id,
      },
    });

    // Delete the invoice
    await prisma.invoice.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    console.error("Delete invoice error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete invoice" },
      { status: 500 }
    );
  }
}
