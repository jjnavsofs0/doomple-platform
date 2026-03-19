import type { InvoiceStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type Decimalish = number | string | { toString(): string } | null | undefined;

export function toAmount(value: Decimalish): number {
  return Number(value || 0);
}

export function getOutstandingAmount(total: Decimalish, paidAmount: Decimalish): number {
  return Math.max(0, toAmount(total) - toAmount(paidAmount));
}

function getPaidInvoiceStatus(total: number, paidAmount: number): InvoiceStatus {
  return paidAmount >= total ? "PAID" : "PARTIALLY_PAID";
}

export async function recordRazorpayPayment(params: {
  invoiceId: string;
  amount: number;
  orderId: string;
  paymentId: string;
  signature?: string | null;
  status: PaymentStatus;
  paidAt?: Date | null;
}) {
  return prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.findUnique({
      where: { id: params.invoiceId },
      select: {
        id: true,
        total: true,
        paidAmount: true,
      },
    });

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    const existingPayment = await tx.payment.findFirst({
      where: {
        invoiceId: params.invoiceId,
        razorpayPaymentId: params.paymentId,
      },
    });

    const nextPaymentStatus: PaymentStatus =
      existingPayment?.status === "COMPLETED" || params.status === "COMPLETED"
        ? "COMPLETED"
        : "PROCESSING";

    const shouldApplyToInvoice =
      nextPaymentStatus === "COMPLETED" && existingPayment?.status !== "COMPLETED";

    const payment = existingPayment
      ? await tx.payment.update({
          where: { id: existingPayment.id },
          data: {
            amount: params.amount,
            method: existingPayment.method || "RAZORPAY",
            razorpayOrderId: params.orderId,
            razorpayPaymentId: params.paymentId,
            razorpaySignature: params.signature ?? existingPayment.razorpaySignature,
            status: nextPaymentStatus,
            paidAt:
              nextPaymentStatus === "COMPLETED"
                ? params.paidAt ?? existingPayment.paidAt ?? new Date()
                : existingPayment.paidAt,
          },
        })
      : await tx.payment.create({
          data: {
            invoiceId: params.invoiceId,
            amount: params.amount,
            method: "RAZORPAY",
            razorpayOrderId: params.orderId,
            razorpayPaymentId: params.paymentId,
            razorpaySignature: params.signature ?? undefined,
            status: nextPaymentStatus,
            paidAt: nextPaymentStatus === "COMPLETED" ? params.paidAt ?? new Date() : null,
          },
        });

    const updatedInvoice = shouldApplyToInvoice
      ? await tx.invoice.update({
          where: { id: params.invoiceId },
          data: {
            paidAmount: toAmount(invoice.paidAmount) + params.amount,
            status: getPaidInvoiceStatus(
              toAmount(invoice.total),
              toAmount(invoice.paidAmount) + params.amount
            ),
          },
        })
      : invoice;

    return {
      payment,
      invoice: updatedInvoice,
    };
  });
}
