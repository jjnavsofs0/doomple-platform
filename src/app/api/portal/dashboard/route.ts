import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPortalClient } from "@/lib/portal";
import { getOutstandingAmount } from "@/lib/invoice-payments";

export const dynamic = "force-dynamic";

function formatProjectStatus(status: string) {
  if (status === "ACTIVE" || status === "IN_DEVELOPMENT") return "active";
  if (status === "COMPLETED") return "completed";
  if (status === "ON_HOLD") return "on-hold";
  return "planning";
}

export async function GET() {
  try {
    const portalClient = await getPortalClient();
    if ("error" in portalClient) {
      return NextResponse.json({ error: portalClient.error }, { status: portalClient.status });
    }

    const [projects, invoices, payments] = await Promise.all([
      prisma.project.findMany({
        where: { clientId: portalClient.client.id },
        orderBy: { updatedAt: "desc" },
        take: 3,
        select: {
          id: true,
          name: true,
          status: true,
          progressPercent: true,
        },
      }),
      prisma.invoice.findMany({
        where: { clientId: portalClient.client.id },
        orderBy: { issueDate: "desc" },
        select: {
          id: true,
          invoiceNumber: true,
          total: true,
          paidAmount: true,
          dueDate: true,
          status: true,
        },
      }),
      prisma.payment.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          invoice: {
            clientId: portalClient.client.id,
          },
          status: "COMPLETED",
        },
      }),
    ]);

    const pendingInvoices = invoices
      .map((invoice) => {
        const balance = getOutstandingAmount(invoice.total, invoice.paidAmount);
        const daysOverdue = Math.max(
          0,
          Math.floor((Date.now() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24))
        );

        return {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          amount: Number(balance),
          dueDate: invoice.dueDate.toLocaleDateString("en-IN"),
          daysOverdue,
          status: invoice.status,
        };
      })
      .filter((invoice) => invoice.amount > 0)
      .slice(0, 3);

    const outstandingAmount = invoices.reduce((sum, invoice) => {
      return sum + Number(getOutstandingAmount(invoice.total, invoice.paidAmount));
    }, 0);

    const activeProjects = projects.filter((project) =>
      ["ACTIVE", "IN_DEVELOPMENT"].includes(project.status)
    ).length;

    return NextResponse.json({
      welcomeMessage: "Here is the latest view of your projects, invoices, and outstanding work.",
      clientName:
        portalClient.client.contactName ||
        portalClient.client.companyName ||
        portalClient.user.name,
      companyName: portalClient.client.companyName || portalClient.client.email,
      stats: {
        activeProjects,
        pendingInvoices: pendingInvoices.length,
        totalPaid: Number(payments._sum.amount || 0),
        outstandingAmount,
      },
      recentProjects: projects.map((project) => ({
        id: project.id,
        name: project.name,
        status: formatProjectStatus(project.status),
        progress: project.progressPercent,
      })),
      pendingInvoices,
    });
  } catch (error) {
    console.error("Get portal dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard" },
      { status: 500 }
    );
  }
}
