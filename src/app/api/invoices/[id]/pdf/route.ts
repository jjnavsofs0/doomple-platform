import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessInvoiceForPayment } from "@/lib/invoice-access";
import { ensureInvoicePdfAttachment, generateInvoicePdf } from "@/lib/invoice-pdf";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        client: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: "Invoice not found" },
        { status: 404 }
      );
    }

    if (!canAccessInvoiceForPayment(session.user, invoice.client.email)) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const generated = await generateInvoicePdf(params.id);
    if (!generated) {
      return NextResponse.json(
        { success: false, error: "Invoice not found" },
        { status: 404 }
      );
    }

    // Storage sync should never block preview/download.
    void ensureInvoicePdfAttachment(params.id).catch((error) => {
      console.warn(
        "Invoice PDF attachment sync failed during preview/download:",
        error instanceof Error ? error.message : error
      );
    });

    const shouldDownload = new URL(request.url).searchParams.get("download") === "1";

    return new NextResponse(generated.bytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${shouldDownload ? "attachment" : "inline"}; filename="${generated.fileName}"`,
        "Cache-Control": "private, max-age=0, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Get invoice PDF error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate invoice PDF" },
      { status: 500 }
    );
  }
}
