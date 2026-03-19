import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPortalClient } from "@/lib/portal";

export const dynamic = "force-dynamic";

function formatPaymentStatus(status: string) {
  if (status === "COMPLETED") return "success";
  if (status === "FAILED" || status === "REFUNDED") return "failed";
  return "pending";
}

export async function GET() {
  try {
    const portalClient = await getPortalClient();
    if ("error" in portalClient) {
      return NextResponse.json({ error: portalClient.error }, { status: portalClient.status });
    }

    const payments = await prisma.payment.findMany({
      where: {
        invoice: {
          clientId: portalClient.client.id,
        },
      },
      include: {
        invoice: {
          select: {
            invoiceNumber: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      payments: payments.map((payment) => ({
        id: payment.id,
        date: (payment.paidAt || payment.createdAt).toLocaleDateString("en-IN"),
        invoiceNumber: payment.invoice.invoiceNumber,
        amount: Number(payment.amount || 0),
        method: (payment.method || "other").toLowerCase(),
        transactionId: payment.razorpayPaymentId || payment.id,
        status: formatPaymentStatus(payment.status),
      })),
    });
  } catch (error) {
    console.error("Get portal payments error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}
