import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPaymentDetails, verifyPaymentSignature } from "@/lib/razorpay";
import { recordRazorpayPayment } from "@/lib/invoice-payments";
import { canAccessInvoiceForPayment } from "@/lib/invoice-access";

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
    return NextResponse.json(
      { success: false, error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
