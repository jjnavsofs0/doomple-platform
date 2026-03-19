import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPaymentLink } from "@/lib/razorpay";
import { getOutstandingAmount } from "@/lib/invoice-payments";
import { canAccessInvoiceForPayment } from "@/lib/invoice-access";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (!body.invoiceId) {
      return NextResponse.json(
        { success: false, error: "Invoice ID is required" },
        { status: 400 }
      );
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: body.invoiceId },
      include: {
        client: {
          select: {
            companyName: true,
            contactName: true,
            email: true,
            phone: true,
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

    if (!canAccessInvoiceForPayment(session.user, invoice.client.email)) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const outstandingAmount = getOutstandingAmount(invoice.total, invoice.paidAmount);
    if (outstandingAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invoice is already fully paid" },
        { status: 400 }
      );
    }

    const normalizedPhone = (invoice.client.phone || "").replace(/\D/g, "");
    const customerPhone =
      normalizedPhone.length >= 8 && normalizedPhone.length <= 14
        ? normalizedPhone
        : undefined;

    const paymentLinkResult = await createPaymentLink({
      amount: Math.round(outstandingAmount * 100),
      description: `Invoice #${invoice.invoiceNumber}`,
      customer_info: {
        name:
          invoice.client.contactName ||
          invoice.client.companyName ||
          invoice.client.email,
        email: invoice.client.email,
        phone: customerPhone,
      },
      invoice_id: invoice.id,
    });

    if (!paymentLinkResult.success || !paymentLinkResult.data) {
      return NextResponse.json(
        { success: false, error: paymentLinkResult.error || "Failed to create payment link" },
        { status: 500 }
      );
    }

    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        razorpayPaymentLink: paymentLinkResult.data.short_url,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment link created successfully",
      data: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        paymentLinkId: paymentLinkResult.data.id,
        shortUrl: paymentLinkResult.data.short_url,
        amount: outstandingAmount,
      },
    });
  } catch (error) {
    console.error("Create Razorpay payment link error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create payment link" },
      { status: 500 }
    );
  }
}
