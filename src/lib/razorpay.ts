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

function parseConfiguredAmountLimit(value?: string | null) {
  if (!value) return null;

  const parsed = Number(String(value).trim());
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export function getRazorpayTransactionLimit(currency: string) {
  const normalizedCurrency = String(currency || "INR").toUpperCase();
  const currencySpecific =
    process.env[`RAZORPAY_MAX_TRANSACTION_AMOUNT_${normalizedCurrency}`] || null;
  const shared = process.env.RAZORPAY_MAX_TRANSACTION_AMOUNT || null;

  return parseConfiguredAmountLimit(currencySpecific) ?? parseConfiguredAmountLimit(shared);
}

export function isRazorpayAmountLimitError(message: string) {
  return /amount exceeds maximum amount allowed/i.test(message);
}

export function buildRazorpayAmountLimitMessage(params: {
  currency: string;
  amount: number;
  configuredLimit?: number | null;
}) {
  const amountLabel = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: params.currency,
    maximumFractionDigits: 2,
  }).format(params.amount);

  const limitLabel =
    typeof params.configuredLimit === "number" && Number.isFinite(params.configuredLimit)
      ? new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: params.currency,
          maximumFractionDigits: 2,
        }).format(params.configuredLimit)
      : null;

  return limitLabel
    ? `This invoice balance (${amountLabel}) exceeds the configured Razorpay transaction limit (${limitLabel}) for ${params.currency}. Use bank transfer/manual collection or raise the limit in Razorpay.`
    : `This invoice balance (${amountLabel}) exceeds the Razorpay transaction limit for ${params.currency} on this account. Use bank transfer/manual collection or raise the limit in Razorpay.`;
}

export interface CreateOrderParams {
  amount: number; // in paise (smallest currency unit)
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface PaymentLinkParams {
  amount: number; // in paise
  currency: string;
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
      currency: params.currency,
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
