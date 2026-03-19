import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isGatewaySupportedForCurrency, normalizeCurrency } from "@/lib/billing";
import { createOrder } from "@/lib/razorpay";
import { getOutstandingAmount } from "@/lib/invoice-payments";
import { canAccessInvoiceForPayment } from "@/lib/invoice-access";
import { getErrorMessage, getErrorStack, recordAppError } from "@/lib/app-error-log";

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

    // Get invoice
    const invoice = await prisma.invoice.findUnique({
      where: { id: body.invoiceId },
      include: {
        client: {
          select: {
            companyName: true,
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

    // Convert amount to paise (smallest currency unit)
    const amountInPaise = Math.round(outstandingAmount * 100);

    if (!(await isGatewaySupportedForCurrency("RAZORPAY", invoiceCurrency))) {
      return NextResponse.json(
        {
          success: false,
          error: `Razorpay is not enabled for ${invoiceCurrency} invoices. Update payment gateway settings or use a supported currency.`,
        },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const orderResult = await createOrder({
      amount: amountInPaise,
      currency: invoiceCurrency,
      receipt: invoice.invoiceNumber,
      notes: {
        invoiceId: invoice.id,
        clientEmail: invoice.client.email,
        clientName: invoice.client.companyName || "",
      },
    });

    if (!orderResult.success) {
      console.error("Razorpay order creation failed:", orderResult.error);
      await recordAppError({
        title: "Razorpay order creation failed",
        message: String(orderResult.error || "Unknown Razorpay order failure"),
        severity: "CRITICAL",
        source: "SERVER",
        route: "/api/razorpay/create-order",
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
        { success: false, error: orderResult.error },
        { status: 500 }
      );
    }

    if (!orderResult.data) {
      return NextResponse.json(
        { success: false, error: "Razorpay order response was empty" },
        { status: 500 }
      );
    }

    // Store order ID on invoice
    await prisma.invoice.update({
      where: { id: body.invoiceId },
      data: {
        razorpayOrderId: orderResult.data.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Order created successfully",
      data: {
        orderId: orderResult.data.id,
        amount: amountInPaise,
        currency: invoiceCurrency,
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error("Create Razorpay order error:", error);
    await recordAppError({
      title: "Create Razorpay order error",
      message: getErrorMessage(error),
      severity: "CRITICAL",
      source: "SERVER",
      route: "/api/razorpay/create-order",
      area: "payments",
      method: "POST",
      statusCode: 500,
      stack: getErrorStack(error),
    });
    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 }
    );
  }
}
