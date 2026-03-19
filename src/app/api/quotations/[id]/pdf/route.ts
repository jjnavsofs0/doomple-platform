import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateQuotationPdf } from "@/lib/quotation-pdf";

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

    const generated = await generateQuotationPdf(params.id);
    if (!generated) {
      return NextResponse.json(
        { success: false, error: "Quotation not found" },
        { status: 404 }
      );
    }

    const shouldDownload =
      new URL(request.url).searchParams.get("download") === "1";

    return new NextResponse(generated.bytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${shouldDownload ? "attachment" : "inline"}; filename="${generated.fileName}"`,
        "Cache-Control": "private, max-age=0, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Get quotation PDF error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate quotation PDF" },
      { status: 500 }
    );
  }
}
