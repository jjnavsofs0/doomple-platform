import Razorpay from "razorpay";
import crypto from "crypto";

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error("Razorpay API keys are not configured");
}

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

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
    const order = await razorpayInstance.orders.create({
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
    const paymentLink = await razorpayInstance.paymentLink.create({
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
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create payment link",
    };
  }
}

/**
 * Fetch payment details
 */
export async function getPaymentDetails(paymentId: string) {
  try {
    const payment = await razorpayInstance.payments.fetch(paymentId);
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

export default razorpayInstance;
