import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const type = url.searchParams.get("type") || "management";

    // ---- Sales/Leads ----
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
    });

    const activeLeads = leads.filter(
      (l) => l.status !== "WON" && l.status !== "LOST"
    ).length;
    const wonLeads = leads.filter((l) => l.status === "WON").length;
    const conversionRate =
      leads.length > 0
        ? Math.round((wonLeads / leads.length) * 1000) / 10
        : 0;

    const recentLeads = leads.slice(0, 5).map((l) => ({
      id: l.id,
      fullName: l.fullName,
      companyName: l.companyName,
      email: l.email,
      status: l.status.toLowerCase(),
      createdAt: l.createdAt.toISOString(),
    }));

    const pipelineSummary = leads.reduce(
      (acc, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // ---- Projects ----
    const projects = await prisma.project.findMany({
      include: { client: { select: { companyName: true, contactName: true } } },
      orderBy: { createdAt: "desc" },
    });

    const activeProjects = projects.filter(
      (p) => p.status !== "COMPLETED" && p.status !== "CANCELLED"
    ).length;

    const recentProjects = projects.slice(0, 5).map((p) => ({
      id: p.id,
      projectName: p.name,
      clientName: p.client.companyName || p.client.contactName || "—",
      status: p.status.toLowerCase(),
      progress: p.progressPercent,
    }));

    // ---- Invoices / Billing ----
    const invoices = await prisma.invoice.findMany({
      include: { client: { select: { companyName: true } } },
      orderBy: { createdAt: "desc" },
    });

    const openInvoices = invoices.filter(
      (i) => i.status !== "PAID" && i.status !== "CANCELLED"
    ).length;

    const revenueThisMonthByCurrency = invoices.reduce(
      (acc, invoice) => {
        const current = new Date();
        const created = new Date(invoice.createdAt);
        if (
          created.getMonth() === current.getMonth() &&
          created.getFullYear() === current.getFullYear() &&
          invoice.status === "PAID"
        ) {
          const currency = invoice.currency || "INR";
          acc[currency] = (acc[currency] || 0) + Number(invoice.total);
        }
        return acc;
      },
      {} as Record<string, number>
    );

    const outstandingByCurrency = invoices.reduce(
      (acc, invoice) => {
        if (invoice.status !== "PAID" && invoice.status !== "CANCELLED") {
          const currency = invoice.currency || "INR";
          acc[currency] =
            (acc[currency] || 0) + Number(invoice.total) - Number(invoice.paidAmount);
        }
        return acc;
      },
      {} as Record<string, number>
    );

    const outstandingAmount = invoices
      .filter((i) => i.status !== "PAID" && i.status !== "CANCELLED")
      .reduce((sum, i) => sum + Number(i.total) - Number(i.paidAmount), 0);

    const now = new Date();
    const revenueThisMonth = invoices
      .filter((i) => {
        const d = new Date(i.createdAt);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear() &&
          i.status === "PAID"
        );
      })
      .reduce((sum, i) => sum + Number(i.total), 0);

    const revenueByCategory = projects.reduce(
      (acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + Number(p.budget || 0);
        return acc;
      },
      {} as Record<string, number>
    );

    const projectMixByCategory = projects.reduce(
      (acc, project) => {
        acc[project.category] = (acc[project.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const invoiceStatusSummary = invoices.reduce(
      (acc, invoice) => {
        acc[invoice.status] = (acc[invoice.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const projectStatusSummary = projects.reduce(
      (acc, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return NextResponse.json({
      success: true,
      data: {
        activeLeads,
        activeProjects,
        openInvoices,
        revenueThisMonth,
        outstandingAmount,
        conversionRate,
        recentLeads,
        recentProjects,
        pipelineSummary,
        revenueByCategory,
        revenueThisMonthByCurrency,
        outstandingByCurrency,
        projectMixByCategory,
        invoiceStatusSummary,
        projectStatusSummary,
        // preserve typed sub-objects for other dashboard views
        sales: {
          totalLeads: leads.length,
          wonLeads,
          conversionRate,
          pipelineSummary,
        },
        projects: {
          total: projects.length,
          active: activeProjects,
          byStatus: projectStatusSummary,
          byCategory: projectMixByCategory,
        },
        billing: {
          openInvoices,
          outstandingAmount,
          revenueThisMonth,
          outstandingByCurrency,
          revenueThisMonthByCurrency,
          byStatus: invoiceStatusSummary,
        },
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
