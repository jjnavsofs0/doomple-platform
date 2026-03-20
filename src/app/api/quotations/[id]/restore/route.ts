import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { recordAuditLog } from "@/lib/audit-log";
import { prisma } from "@/lib/prisma";
import { notifyAdmins } from "@/lib/realtime";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdminSession();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const quotation = await prisma.quotation.findUnique({
      where: { id: params.id },
    });

    if (!quotation) {
      return NextResponse.json(
        { success: false, error: "Quotation not found" },
        { status: 404 }
      );
    }

    if (!quotation.deletedAt) {
      return NextResponse.json(
        { success: false, error: "Quotation is not in the bin" },
        { status: 400 }
      );
    }

    await prisma.quotation.update({
      where: { id: params.id },
      data: {
        deletedAt: null,
        deletedById: null,
        deleteReason: null,
      },
    });

    await recordAuditLog({
      entityType: "quotation",
      entityId: quotation.id,
      action: "restored",
      summary: `Quotation ${quotation.quotationNumber} was restored from the bin`,
      userId: auth.session.user.id,
      metadata: {
        quotationNumber: quotation.quotationNumber,
      },
    });

    await notifyAdmins({
      title: "Quotation restored",
      message: `${quotation.quotationNumber} was restored from the bin.`,
      link: `/admin/quotations/${quotation.id}`,
      topics: ["quotations", "notifications"],
      metadata: {
        quotationId: quotation.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Quotation restored successfully",
    });
  } catch (error) {
    console.error("Restore quotation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to restore quotation" },
      { status: 500 }
    );
  }
}
