import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPortalClient } from "@/lib/portal";
import { getOutstandingAmount } from "@/lib/invoice-payments";

export const dynamic = "force-dynamic";

function formatInvoiceStatus(status: string, balance: number) {
  if (status === "PAID") return "paid";
  if (status === "OVERDUE") return "overdue";
  if (status === "DRAFT") return "draft";
  return balance > 0 ? "pending" : "paid";
}

function formatPaymentStatus(status: string) {
  if (status === "COMPLETED") return "success";
  if (status === "FAILED" || status === "REFUNDED") return "failed";
  return "pending";
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const portalClient = await getPortalClient();
    if ("error" in portalClient) {
      return NextResponse.json({ error: portalClient.error }, { status: portalClient.status });
    }

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: params.id,
        clientId: portalClient.client.id,
      },
      include: {
        items: {
          orderBy: { order: "asc" },
        },
        payments: {
          orderBy: { createdAt: "desc" },
        },
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

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: "Invoice not found" },
        { status: 404 }
      );
    }

    const balance = getOutstandingAmount(invoice.total, invoice.paidAmount);

    return NextResponse.json({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      status: formatInvoiceStatus(invoice.status, balance),
      issueDate: invoice.issueDate.toLocaleDateString("en-IN"),
      dueDate: invoice.dueDate.toLocaleDateString("en-IN"),
      description: invoice.notes || undefined,
      lineItems: invoice.items.map((item) => ({
        id: item.id,
        description: item.description,
        quantity: Number(item.quantity || 0),
        unitPrice: Number(item.unitPrice || 0),
        total: Number(item.total || 0),
      })),
      subtotal: Number(invoice.subtotal || 0),
      tax: Number(invoice.taxAmount || 0),
      total: Number(invoice.total || 0),
      paid: Number(invoice.paidAmount || 0),
      balance,
      payments: invoice.payments.map((payment) => ({
        id: payment.id,
        date: (payment.paidAt || payment.createdAt).toLocaleDateString("en-IN"),
        amount: Number(payment.amount || 0),
        method: (payment.method || "other").toLowerCase(),
        transactionId: payment.razorpayPaymentId || payment.id,
        status: formatPaymentStatus(payment.status),
      })),
      clientId: invoice.client.id,
      clientName:
        invoice.client.contactName ||
        invoice.client.companyName ||
        invoice.client.email,
      clientEmail: invoice.client.email,
    });
  } catch (error) {
    console.error("Get portal invoice detail error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}
