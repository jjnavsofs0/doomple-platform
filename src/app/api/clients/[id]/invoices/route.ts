import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invoices = await prisma.invoice.findMany({
      where: { clientId: params.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: invoices.map((invoice) => ({
        ...invoice,
        amount: Number(invoice.total || 0),
        currency: invoice.currency || "INR",
        status: String(invoice.status || "").toLowerCase(),
      })),
    });
  } catch (error) {
    console.error("Get client invoices error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch client invoices" },
      { status: 500 }
    );
  }
}
