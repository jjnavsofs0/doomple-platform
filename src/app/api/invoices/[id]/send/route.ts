import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { generateInvoicePdf } from "@/lib/invoice-pdf";
import { getAppSettingValue } from "@/lib/app-settings";
import { sendEmailWithAttachment, isSesConfigured } from "@/lib/email";
import { getEmailDeliveryGuardForUser } from "@/lib/account-email";
import { notifyAdmins, notifyClientUsersByEmail } from "@/lib/realtime";

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

    // Check SES is configured before doing anything else
    if (!isSesConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Email service (AWS SES) is not configured. Please set AWS_SES_REGION, AWS_SES_FROM_EMAIL, and SES credentials in environment variables.",
        },
        { status: 503 }
      );
    }

    // Generate PDF in memory — no S3 required
    const generated = await generateInvoicePdf(params.id);
    if (!generated) {
      return NextResponse.json(
        { success: false, error: "Invoice not found" },
        { status: 404 }
      );
    }

    const { invoice, bytes, fileName } = generated;

    if (invoice.status === "DRAFT") {
      return NextResponse.json(
        {
          success: false,
          error: "Move the invoice to Sent before emailing it to the client.",
        },
        { status: 400 }
      );
    }

    const recipientGuard = await getEmailDeliveryGuardForUser(invoice.client.email);
    if (recipientGuard) {
      if (recipientGuard.emailVerificationStatus !== "VERIFIED") {
        return NextResponse.json(
          {
            success: false,
            error:
              "The recipient user account has not verified its email address yet. Verify the email before sending invoice mail.",
          },
          { status: 400 }
        );
      }

      if (!recipientGuard.transactionalEmailsEnabled) {
        return NextResponse.json(
          {
            success: false,
            error:
              "This recipient has opted out of transactional emails. Update their email preferences before sending invoice mail.",
          },
          { status: 400 }
        );
      }
    }

    // Get notification settings (with safe fallback)
    const notificationSettings = await getAppSettingValue<{
      fromName: string;
      fromEmail: string;
      replyTo: string;
      invoiceEmailSubject: string;
    }>("notification_settings");

    const subject = (
      notificationSettings?.invoiceEmailSubject ||
      "Invoice {{invoiceNumber}} from Doomple"
    ).replace("{{invoiceNumber}}", invoice.invoiceNumber);

    const clientName =
      invoice.client.contactName || invoice.client.companyName || "";
    const replyTo =
      notificationSettings?.replyTo ||
      process.env.AWS_SES_REPLY_TO ||
      "";
    const totalFormatted = `INR ${Number(invoice.total || 0).toLocaleString(
      "en-IN",
      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
    )}`;

    const html = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #042042;">Invoice ${invoice.invoiceNumber}</h2>
  <p>Hello ${clientName},</p>
  <p>Please find your invoice <strong>${invoice.invoiceNumber}</strong> attached to this email.</p>
  <table style="width:100%; border-collapse:collapse; margin:16px 0;">
    <tr>
      <td style="padding:8px; border:1px solid #e5e7eb; background:#f9fafb; font-weight:bold;">Invoice Number</td>
      <td style="padding:8px; border:1px solid #e5e7eb;">${invoice.invoiceNumber}</td>
    </tr>
    <tr>
      <td style="padding:8px; border:1px solid #e5e7eb; background:#f9fafb; font-weight:bold;">Amount Due</td>
      <td style="padding:8px; border:1px solid #e5e7eb; color:#042042; font-weight:bold;">${totalFormatted}</td>
    </tr>
    <tr>
      <td style="padding:8px; border:1px solid #e5e7eb; background:#f9fafb; font-weight:bold;">Due Date</td>
      <td style="padding:8px; border:1px solid #e5e7eb;">${new Date(
        invoice.dueDate
      ).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })}</td>
    </tr>
  </table>
  <p>The invoice PDF is attached to this email for your records.</p>
  <p>If you have any questions, please reply to this email or contact us.</p>
  <p style="margin-top:24px; color:#666; font-size:13px;">Thank you for your business.</p>
</body>
</html>`;

    const text = `Hello ${clientName},\n\nPlease find your invoice ${invoice.invoiceNumber} attached.\n\nAmount Due: ${totalFormatted}\nDue Date: ${new Date(
      invoice.dueDate
    ).toLocaleDateString("en-IN")}\n\nThank you for your business.`;

    // Send email with PDF attached
    await sendEmailWithAttachment({
      to: [invoice.client.email],
      replyTo: replyTo || undefined,
      subject,
      html,
      text,
      attachment: {
        filename: fileName,
        content: bytes,
        contentType: "application/pdf",
      },
    });

    // Optionally save PDF to S3 — non-blocking, errors are logged only
    (async () => {
      try {
        const { ensureInvoicePdfAttachment } = await import("@/lib/invoice-pdf");
        await ensureInvoicePdfAttachment(params.id);
      } catch (s3Err) {
        console.warn(
          "S3 PDF upload skipped (non-fatal):",
          s3Err instanceof Error ? s3Err.message : s3Err
        );
      }
    })();

    await notifyAdmins({
      title: "Invoice emailed",
      message: `${invoice.invoiceNumber} was emailed to ${invoice.client.email}.`,
      type: "INVOICE",
      link: `/admin/invoices/${params.id}`,
      topics: ["invoices", "payments", "notifications"],
      metadata: {
        invoiceId: params.id,
      },
    });

    await notifyClientUsersByEmail({
      email: invoice.client.email,
      title: "New invoice email sent",
      message: `${invoice.invoiceNumber} has been sent to your inbox from Doomple.`,
      type: "INVOICE",
      link: "/portal/invoices",
      topics: ["invoices", "payments", "notifications"],
      metadata: {
        invoiceId: params.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Invoice email sent to ${invoice.client.email} with PDF attached`,
    });
  } catch (error) {
    console.error("Send invoice error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to send invoice email",
      },
      { status: 500 }
    );
  }
}
