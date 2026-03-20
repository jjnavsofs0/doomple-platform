import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyAdmins, notifyClientUsersByEmail } from "@/lib/realtime";

const formatInvoiceResponse = (invoice: any) => ({
  ...invoice,
  clientName: invoice.client?.companyName || "Unknown Client",
  projectName: invoice.project?.name || null,
  lineItems: invoice.items.map((item: any) => ({
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
    .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" "),
  payments: invoice.payments.map((payment: any) => ({
    ...payment,
    amount: Number(payment.amount || 0),
    date: payment.paidAt?.toISOString() || new Date().toISOString(),
  })),
});

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

    const body = await request.json();
    const amount = Number(body.amount || 0);

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Payment amount must be greater than 0" },
        { status: 400 }
      );
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

    if (invoice.status === "DRAFT") {
      return NextResponse.json(
        {
          success: false,
          error: "Move the invoice to Sent before recording a payment.",
        },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.create({
      data: {
        invoiceId: params.id,
        amount,
        method: body.method || "Manual",
        status: "COMPLETED",
        paidAt: body.date ? new Date(body.date) : new Date(),
      },
    });

    const paidAmount = Number(invoice.paidAmount || 0) + amount;
    const total = Number(invoice.total || 0);
    const nextStatus =
      paidAmount >= total ? "PAID" : paidAmount > 0 ? "PARTIALLY_PAID" : invoice.status;

    await prisma.invoice.update({
      where: { id: params.id },
      data: {
        paidAmount,
        status: nextStatus,
      },
    });

    const updated = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        items: { orderBy: { order: "asc" } },
        client: { select: { companyName: true, email: true } },
        project: { select: { name: true } },
        createdBy: { select: { name: true, email: true } },
        payments: { orderBy: { createdAt: "desc" } },
      },
    });

    if (updated) {
      await notifyAdmins({
        title: "Payment recorded",
        message: `${updated.invoiceNumber} received a ${body.method || "manual"} payment entry.`,
        type: "PAYMENT",
        link: `/admin/invoices/${params.id}`,
        topics: ["dashboard", "invoices", "payments", "notifications"],
        email: true,
        metadata: {
          invoiceId: params.id,
          paymentId: payment.id,
        },
      });

      await notifyClientUsersByEmail({
        email: updated.client?.email,
        title: "Payment received",
        message: `We recorded a payment for invoice ${updated.invoiceNumber}.`,
        type: "PAYMENT",
        link: "/portal/payments",
        topics: ["invoices", "payments", "dashboard", "notifications"],
        metadata: {
          invoiceId: params.id,
          paymentId: payment.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: formatInvoiceResponse(updated),
    });
  } catch (error) {
    console.error("Create invoice payment error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record payment" },
      { status: 500 }
    );
  }
}
