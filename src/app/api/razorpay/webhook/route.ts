import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { recordRazorpayPayment } from "@/lib/invoice-payments";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET || "")
      .update(body)
      .digest("hex");

    const isSignatureValid = expectedSignature === signature;

    const payload = JSON.parse(body);
    const eventType = payload.event;
    const data = payload.payload;

    // Log webhook
    const webhookLog = await prisma.razorpayWebhookLog.create({
      data: {
        eventType,
        orderId: data.order?.entity?.id || data.payment?.entity?.order_id || null,
        paymentId: data.payment?.entity?.id || null,
        payload: payload,
        verified: isSignatureValid,
      },
    });

    // If signature is invalid, log and return error
    if (!isSignatureValid) {
      await prisma.razorpayWebhookLog.update({
        where: { id: webhookLog.id },
        data: {
          error: "Invalid signature",
        },
      });

      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Process based on event type
    if (eventType === "payment.authorized" || eventType === "payment.captured") {
      const orderId = data.payment?.entity?.order_id;
      const paymentId = data.payment?.entity?.id;
      const amount = data.payment?.entity?.amount / 100; // Convert from paise

      if (orderId && paymentId) {
        // Find invoice by order ID
        const invoice = await prisma.invoice.findFirst({
          where: { razorpayOrderId: orderId },
        });

        if (invoice) {
          await recordRazorpayPayment({
            invoiceId: invoice.id,
            amount,
            orderId,
            paymentId,
            status: eventType === "payment.captured" ? "COMPLETED" : "PROCESSING",
            paidAt: eventType === "payment.captured" ? new Date() : null,
          });

          // Update webhook log as processed
          await prisma.razorpayWebhookLog.update({
            where: { id: webhookLog.id },
            data: {
              processedAt: new Date(),
            },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Webhook processed",
    });
  } catch (error) {
    console.error("Razorpay webhook error:", error);

    // Log error
    try {
      await prisma.razorpayWebhookLog.create({
        data: {
          eventType: "ERROR",
          payload: { error: error instanceof Error ? error.message : "Unknown error" },
          verified: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      });
    } catch (logError) {
      console.error("Failed to log webhook error:", logError);
    }

    return NextResponse.json(
      { success: false, error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
