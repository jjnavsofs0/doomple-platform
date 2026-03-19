import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type InvoiceRequestItem = {
  description: string;
  quantity: number | string;
  unitPrice: number | string;
  taxPercent?: number | string;
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

    return NextResponse.json({
      success: true,
      data: {
        ...invoice,
        clientName: invoice.client?.companyName || "Unknown Client",
        projectName: invoice.project?.name || null,
        lineItems: invoice.items.map((item) => ({
          ...item,
          quantity: Number(item.quantity || 0),
          unitPrice: Number(item.unitPrice || 0),
          taxPercent: Number(item.taxPercent || 0),
          discount: 0,
        })),
        subtotal: Number(invoice.subtotal || 0),
        taxAmount: Number(invoice.taxAmount || 0),
        totalDiscount: 0,
        total: Number(invoice.total || 0),
        amountPaid: Number(invoice.paidAmount || 0),
        createdBy: invoice.createdBy?.name || invoice.createdBy?.email || "Unknown User",
        billingCategory: invoice.billingCategory || "General",
        status: invoice.status
          .toLowerCase()
          .split("_")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" "),
        payments: invoice.payments.map((payment) => ({
          ...payment,
          amount: Number(payment.amount || 0),
          date: payment.paidAt?.toISOString() || new Date().toISOString(),
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
    });

    if (!existingInvoice) {
      return NextResponse.json(
        { success: false, error: "Invoice not found" },
        { status: 404 }
      );
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
        subtotal: Number(subtotal),
        taxAmount: Number(taxAmount),
        total: Number(total),
        notes: body.notes !== undefined ? body.notes : existingInvoice.notes,
        status: body.status || existingInvoice.status,
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
          total: Number(item.quantity) * Number(item.unitPrice),
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
          },
        },
        project: {
          select: {
            id: true,
            name: true,
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

    return NextResponse.json({
      success: true,
      message: "Invoice updated successfully",
      data: {
        ...invoiceWithItems,
        clientName: invoiceWithItems?.client?.companyName || "Unknown Client",
        projectName: invoiceWithItems?.project?.name || null,
        lineItems: invoiceWithItems?.items.map((item) => ({
          ...item,
          quantity: Number(item.quantity || 0),
          unitPrice: Number(item.unitPrice || 0),
          taxPercent: Number(item.taxPercent || 0),
          discount: 0,
        })) || [],
        subtotal: Number(invoiceWithItems?.subtotal || 0),
        taxAmount: Number(invoiceWithItems?.taxAmount || 0),
        totalDiscount: 0,
        total: Number(invoiceWithItems?.total || 0),
        amountPaid: Number(invoiceWithItems?.paidAmount || 0),
        createdBy:
          invoiceWithItems?.createdBy?.name ||
          invoiceWithItems?.createdBy?.email ||
          "Unknown User",
        billingCategory: invoiceWithItems?.billingCategory || "General",
        status: invoiceWithItems?.status
          .toLowerCase()
          .split("_")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" "),
        payments: invoiceWithItems?.payments.map((payment) => ({
          ...payment,
          amount: Number(payment.amount || 0),
          date: payment.paidAt?.toISOString() || new Date().toISOString(),
        })) || [],
      },
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
