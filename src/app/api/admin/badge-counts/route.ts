import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as { role?: string })?.role || "";

    const canViewErrors = role === "SUPER_ADMIN" || role === "ADMIN";
    const canViewLeads = role === "SUPER_ADMIN" || role === "ADMIN" || role === "SALES";
    const canViewInvoices =
      role === "SUPER_ADMIN" ||
      role === "ADMIN" ||
      role === "FINANCE" ||
      role === "PROJECT_MANAGER";

    const [openErrors, newLeads, overdueInvoices] = await Promise.all([
      canViewErrors
        ? prisma.appErrorLog.count({ where: { isResolved: false } })
        : Promise.resolve(0),
      canViewLeads
        ? prisma.lead.count({ where: { status: "NEW" } })
        : Promise.resolve(0),
      canViewInvoices
        ? prisma.invoice.count({ where: { status: "OVERDUE" } })
        : Promise.resolve(0),
    ]);

    return NextResponse.json({
      openErrors,
      newLeads,
      overdueInvoices,
    });
  } catch (error) {
    console.error("Badge counts error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch badge counts" },
      { status: 500 }
    );
  }
}
