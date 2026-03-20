import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPaymentDetails, verifyPaymentSignature } from "@/lib/razorpay";
import { recordRazorpayPayment } from "@/lib/invoice-payments";
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

    const body = await request.json();
    const orderId = String(body.razorpay_order_id || "");
    const paymentId = String(body.razorpay_payment_id || "");
    const signature = String(body.razorpay_signature || "");
    const invoiceId = String(body.invoiceId || "");

    if (!orderId || !paymentId || !signature || !invoiceId) {
      return NextResponse.json(
        { success: false, error: "Missing payment verification fields" },
        { status: 400 }
      );
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: {
        id: true,
        razorpayOrderId: true,
        client: {
          select: {
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

    if (invoice.razorpayOrderId && invoice.razorpayOrderId !== orderId) {
      return NextResponse.json(
        { success: false, error: "Order does not match the invoice" },
        { status: 400 }
      );
    }

    const isValidSignature = verifyPaymentSignature(orderId, paymentId, signature);
    if (!isValidSignature) {
      return NextResponse.json(
        { success: false, error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    const paymentDetails = await getPaymentDetails(paymentId);
    if (!paymentDetails.success || !paymentDetails.data) {
      await recordAppError({
        title: "Razorpay payment verification details failed",
        message: String(paymentDetails.error || "Failed to fetch payment details"),
        severity: "CRITICAL",
        source: "SERVER",
        route: "/api/razorpay/verify-payment",
        area: "payments",
        method: "POST",
        statusCode: 502,
        metadata: {
          invoiceId,
          orderId,
          paymentId,
        },
      });
      return NextResponse.json(
        { success: false, error: paymentDetails.error || "Failed to fetch payment details" },
        { status: 502 }
      );
    }

    const payment = paymentDetails.data;
    const amount = Number(payment.amount || 0) / 100;
    const paymentStatus = payment.status === "captured" ? "COMPLETED" : "PROCESSING";

    await recordRazorpayPayment({
      invoiceId,
      amount,
      orderId,
      paymentId,
      signature,
      status: paymentStatus,
      paidAt: payment.status === "captured" ? new Date() : null,
    });

    await notifyAdmins({
      title: payment.status === "captured" ? "Payment captured" : "Payment verification update",
      message: `Invoice payment ${paymentId} was ${payment.status}.`,
      type: "PAYMENT",
      link: `/admin/invoices/${invoiceId}`,
      topics: ["dashboard", "invoices", "payments", "notifications"],
      metadata: {
        invoiceId,
        paymentId,
        status: payment.status,
      },
    });

    await notifyClientUsersByEmail({
      email: invoice.client.email,
      title: payment.status === "captured" ? "Payment successful" : "Payment received",
      message:
        payment.status === "captured"
          ? "Your payment has been verified successfully."
          : "Your payment was received and is awaiting capture confirmation.",
      type: "PAYMENT",
      link: "/portal/payments",
      topics: ["invoices", "payments", "dashboard", "notifications"],
      metadata: {
        invoiceId,
        paymentId,
        status: payment.status,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        payment.status === "captured"
          ? "Payment verified successfully"
          : "Payment received and awaiting capture confirmation",
      data: {
        invoiceId,
        orderId,
        paymentId,
        status: payment.status,
        amount,
      },
    });
  } catch (error) {
    console.error("Verify Razorpay payment error:", error);
    await recordAppError({
      title: "Verify Razorpay payment error",
      message: getErrorMessage(error),
      severity: "CRITICAL",
      source: "SERVER",
      route: "/api/razorpay/verify-payment",
      area: "payments",
      method: "POST",
      statusCode: 500,
      stack: getErrorStack(error),
    });
    return NextResponse.json(
      { success: false, error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
