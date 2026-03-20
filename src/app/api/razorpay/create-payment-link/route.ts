import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isGatewaySupportedForCurrency, normalizeCurrency } from "@/lib/billing";
import { prisma } from "@/lib/prisma";
import { createPaymentLink, isRazorpayConfigured } from "@/lib/razorpay";
import { getOutstandingAmount } from "@/lib/invoice-payments";
import { canAccessInvoiceForPayment } from "@/lib/invoice-access";
import { getErrorMessage, getErrorStack, recordAppError } from "@/lib/app-error-log";
import { notifyAdmins, notifyClientUsersByEmail } from "@/lib/realtime";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check Razorpay keys are properly configured
    if (!isRazorpayConfigured()) {
      return NextResponse.json(
        { success: false, error: "Razorpay is not configured. Please add your live API keys (RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET) in your environment settings." },
        { status: 503 }
      );
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

    if (invoice.status === "DRAFT") {
      return NextResponse.json(
        {
          success: false,
          error: "Move the invoice to Sent before generating a payment link.",
        },
        { status: 400 }
      );
    }

    if (!canAccessInvoiceForPayment(session.user, invoice.client.email)) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const outstandingAmount = getOutstandingAmount(invoice.total, invoice.paidAmount);
    const invoiceCurrency = normalizeCurrency(invoice.currency);
    if (outstandingAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invoice is already fully paid" },
        { status: 400 }
      );
    }

    if (!(await isGatewaySupportedForCurrency("RAZORPAY", invoiceCurrency))) {
      return NextResponse.json(
        {
          success: false,
          error: `Razorpay is not enabled for ${invoiceCurrency} invoices. Update payment gateway settings or use a supported currency.`,
        },
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
      currency: invoiceCurrency,
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
      await recordAppError({
        title: "Razorpay payment link creation failed",
        message: String(paymentLinkResult.error || "Failed to create payment link"),
        severity: "CRITICAL",
        source: "SERVER",
        route: "/api/razorpay/create-payment-link",
        area: "payments",
        method: "POST",
        statusCode: 500,
        metadata: {
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          currency: invoiceCurrency,
        },
      });
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

    await notifyAdmins({
      title: "Payment link generated",
      message: `A Razorpay payment link was generated for ${invoice.invoiceNumber}.`,
      type: "PAYMENT",
      link: `/admin/invoices/${invoice.id}`,
      topics: ["invoices", "payments", "notifications"],
      metadata: {
        invoiceId: invoice.id,
        paymentLinkId: paymentLinkResult.data.id,
      },
    });

    await notifyClientUsersByEmail({
      email: invoice.client.email,
      title: "Payment link available",
      message: `A payment link is ready for invoice ${invoice.invoiceNumber}.`,
      type: "PAYMENT",
      link: "/portal/invoices",
      topics: ["invoices", "payments", "notifications"],
      metadata: {
        invoiceId: invoice.id,
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
    await recordAppError({
      title: "Create Razorpay payment link error",
      message: getErrorMessage(error),
      severity: "CRITICAL",
      source: "SERVER",
      route: "/api/razorpay/create-payment-link",
      area: "payments",
      method: "POST",
      statusCode: 500,
      stack: getErrorStack(error),
    });
    return NextResponse.json(
      { success: false, error: "Failed to create payment link" },
      { status: 500 }
    );
  }
}
