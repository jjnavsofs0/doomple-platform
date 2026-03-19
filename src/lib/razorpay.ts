import Razorpay from "razorpay";
import crypto from "crypto";

export function isRazorpayConfigured(): boolean {
  const keyId = process.env.RAZORPAY_KEY_ID || "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
  return Boolean(
    keyId &&
    keySecret &&
    !keyId.includes("REPLACE_ME") &&
    !keySecret.includes("REPLACE_ME") &&
    !keySecret.includes("placeholder")
  );
}

// Lazily create instance per call — avoids module-level throw during build
function getRazorpayInstance(): Razorpay {
  const keyId = process.env.RAZORPAY_KEY_ID || "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export interface CreateOrderParams {
  amount: number; // in paise (smallest currency unit)
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface PaymentLinkParams {
  amount: number; // in paise
  description: string;
  customer_info: {
    name: string;
    email: string;
    phone?: string;
  };
  invoice_id?: string;
}

/**
 * Create a Razorpay order
 */
export async function createOrder(params: CreateOrderParams) {
  try {
    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.create({
      amount: params.amount,
      currency: params.currency,
      receipt: params.receipt,
      notes: params.notes,
    });

    return {
      success: true,
      data: order,
    };
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create order",
    };
  }
}

/**
 * Verify Razorpay payment signature
 */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  try {
    const text = `${orderId}|${paymentId}`;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(text)
      .digest("hex");

    return generatedSignature === signature;
  } catch (error) {
    console.error("Error verifying signature:", error);
    return false;
  }
}

/**
 * Create a Razorpay payment link
 */
export async function createPaymentLink(params: PaymentLinkParams) {
  try {
    const razorpay = getRazorpayInstance();
    const paymentLink = await razorpay.paymentLink.create({
      amount: params.amount,
      currency: "INR",
      description: params.description,
      customer: {
        name: params.customer_info.name,
        email: params.customer_info.email,
        ...(params.customer_info.phone
          ? { contact: params.customer_info.phone }
          : {}),
      },
      notify: {
        sms: Boolean(params.customer_info.phone),
        email: true,
      },
      notes: {
        invoice_id: params.invoice_id || "",
      },
    });

    return {
      success: true,
      data: paymentLink,
    };
  } catch (error) {
    console.error("Error creating payment link:", error);
    // Extract Razorpay-specific error description if available
    const rzpError = error as { error?: { description?: string }; description?: string };
    const errorMessage =
      rzpError?.error?.description ||
      rzpError?.description ||
      (error instanceof Error ? error.message : "Failed to create payment link");
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Fetch payment details
 */
export async function getPaymentDetails(paymentId: string) {
  try {
    const razorpay = getRazorpayInstance();
    const payment = await razorpay.payments.fetch(paymentId);
    return {
      success: true,
      data: payment,
    };
  } catch (error) {
    console.error("Error fetching payment details:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch payment",
    };
  }
}

export default getRazorpayInstance();
