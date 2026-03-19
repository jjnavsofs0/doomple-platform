import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";
import { ensureInvoicePdfAttachment } from "@/lib/invoice-pdf";
import { getAppSettingValue } from "@/lib/app-settings";
import { sendTransactionalEmail } from "@/lib/email";

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

    const generated = await ensureInvoicePdfAttachment(params.id);
    if (!generated) {
      return NextResponse.json(
        { success: false, error: "Invoice not found" },
        { status: 404 }
      );
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        client: true,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: "Invoice not found" },
        { status: 404 }
      );
    }

    const notificationSettings = await getAppSettingValue<{
      fromName: string;
      fromEmail: string;
      replyTo: string;
      invoiceEmailSubject: string;
    }>("notification_settings");

    const requestUrl = new URL(request.url);
    const baseUrl =
      process.env.NEXTAUTH_URL || `${requestUrl.protocol}//${requestUrl.host}`;
    const pdfUrl = `${baseUrl}/api/invoices/${invoice.id}/pdf`;

    const subject = notificationSettings.invoiceEmailSubject.replace(
      "{{invoiceNumber}}",
      invoice.invoiceNumber
    );

    await sendTransactionalEmail({
      to: [invoice.client.email],
      replyTo: notificationSettings.replyTo,
      subject,
      text: `Hello,\n\nYour invoice ${invoice.invoiceNumber} is ready.\nView PDF: ${pdfUrl}\n\nThank you.`,
      html: `
        <p>Hello ${invoice.client.contactName || invoice.client.companyName || ""},</p>
        <p>Your invoice <strong>${invoice.invoiceNumber}</strong> is ready.</p>
        <p>Total: <strong>INR ${Number(invoice.total || 0).toFixed(2)}</strong></p>
        <p><a href="${pdfUrl}">View invoice PDF</a></p>
        <p>Thank you.</p>
      `,
    });

    if (invoice.status === "DRAFT") {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: "SENT" },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Invoice email sent successfully",
      data: {
        pdfUrl,
        attachmentId: generated.attachment.id,
      },
    });
  } catch (error) {
    console.error("Send invoice error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to send invoice email",
      },
      { status: 500 }
    );
  }
}
