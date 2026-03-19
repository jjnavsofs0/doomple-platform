import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPortalClient } from "@/lib/portal";
import { getOutstandingAmount } from "@/lib/invoice-payments";

export const dynamic = "force-dynamic";

function formatInvoiceStatus(status: string, balance: number) {
  if (status === "PAID") return "paid";
  if (status === "OVERDUE") return "overdue";
  if (status === "DRAFT") return "draft";
  return balance > 0 ? "pending" : "paid";
}

export async function GET() {
  try {
    const portalClient = await getPortalClient();
    if ("error" in portalClient) {
      return NextResponse.json({ error: portalClient.error }, { status: portalClient.status });
    }

    const invoices = await prisma.invoice.findMany({
      where: { clientId: portalClient.client.id },
      orderBy: { issueDate: "desc" },
      select: {
        id: true,
        invoiceNumber: true,
        issueDate: true,
        dueDate: true,
        total: true,
        paidAmount: true,
        status: true,
      },
    });

    return NextResponse.json({
      success: true,
      invoices: invoices.map((invoice) => {
        const amount = Number(invoice.total || 0);
        const balance = getOutstandingAmount(invoice.total, invoice.paidAmount);

        return {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          issueDate: invoice.issueDate.toLocaleDateString("en-IN"),
          dueDate: invoice.dueDate.toLocaleDateString("en-IN"),
          amount,
          balance,
          status: formatInvoiceStatus(invoice.status, balance),
        };
      }),
    });
  } catch (error) {
    console.error("Get portal invoices error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}
