import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { prisma } from "@/lib/prisma";
import { getAppSettingValue } from "@/lib/app-settings";
import { reportOperationalIssue } from "@/lib/operational-issues";
import { getStoredFileUrl, uploadFile } from "@/lib/storage";

export async function getInvoicePdfData(invoiceId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      client: {
        select: {
          companyName: true,
          contactName: true,
          email: true,
          phone: true,
          billingAddress: true,
          city: true,
          state: true,
          country: true,
          postalCode: true,
        },
      },
      project: {
        select: {
          name: true,
        },
      },
      createdBy: {
        select: {
          name: true,
          email: true,
        },
      },
      items: {
        orderBy: { order: "asc" },
      },
      payments: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!invoice) {
    return null;
  }

  const companyProfile = await getAppSettingValue<{
    companyName: string;
    legalName: string;
    email: string;
    phone: string;
    website: string;
    address: string;
    gstNumber: string;
  }>("company_profile");

  const invoicePreferences = await getAppSettingValue<{
    footerNote: string;
    paymentTerms: string;
  }>("invoice_preferences");

  return {
    invoice,
    companyProfile,
    invoicePreferences,
  };
}

export async function generateInvoicePdf(invoiceId: string) {
  const data = await getInvoicePdfData(invoiceId);
  if (!data) {
    return null;
  }

  const { invoice, companyProfile, invoicePreferences } = data;
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const { height } = page.getSize();

  let cursorY = height - 50;

  const drawText = (
    text: string,
    options: { x?: number; size?: number; bold?: boolean; color?: [number, number, number] } = {}
  ) => {
    page.drawText(text, {
      x: options.x ?? 50,
      y: cursorY,
      size: options.size ?? 11,
      font: options.bold ? boldFont : regularFont,
      color: rgb(...(options.color ?? [0.1, 0.1, 0.1])),
    });
    cursorY -= (options.size ?? 11) + 6;
  };

  drawText(companyProfile.companyName || "Doomple", {
    size: 22,
    bold: true,
    color: [0.07, 0.24, 0.53],
  });
  drawText(companyProfile.legalName || "", { size: 10 });
  drawText(companyProfile.address || "", { size: 10 });
  drawText(
    [companyProfile.email, companyProfile.phone, companyProfile.website]
      .filter(Boolean)
      .join("  |  "),
    { size: 10 }
  );

  cursorY -= 12;
  drawText(`Invoice ${invoice.invoiceNumber}`, { size: 18, bold: true });
  drawText(`Status: ${invoice.status.replaceAll("_", " ")}`, { size: 10 });
  drawText(
    `Issue Date: ${invoice.issueDate.toLocaleDateString("en-IN")}  |  Due Date: ${invoice.dueDate.toLocaleDateString("en-IN")}`,
    { size: 10 }
  );

  cursorY -= 10;
  drawText("Bill To", { size: 14, bold: true });
  drawText(invoice.client.companyName || invoice.client.contactName || invoice.client.email, {
    bold: true,
  });
  drawText(invoice.client.contactName || "", { size: 10 });
  drawText(invoice.client.email, { size: 10 });
  drawText(invoice.client.phone || "", { size: 10 });
  drawText(
    [
      invoice.client.billingAddress,
      invoice.client.city,
      invoice.client.state,
      invoice.client.country,
      invoice.client.postalCode,
    ]
      .filter(Boolean)
      .join(", "),
    { size: 10 }
  );

  cursorY -= 8;
  drawText("Items", { size: 14, bold: true });

  invoice.items.forEach((item) => {
    const itemTotal = Number(item.total || 0);
    drawText(
      `${item.description}  |  Qty ${Number(item.quantity || 0)}  |  Rate ${Number(item.unitPrice || 0).toFixed(2)}  |  Total ${itemTotal.toFixed(2)}`,
      { size: 10 }
    );
  });

  cursorY -= 6;
  drawText(`Subtotal: INR ${Number(invoice.subtotal || 0).toFixed(2)}`, {
    x: 320,
    bold: true,
  });
  drawText(`Tax: INR ${Number(invoice.taxAmount || 0).toFixed(2)}`, { x: 320 });
  drawText(`Paid: INR ${Number(invoice.paidAmount || 0).toFixed(2)}`, { x: 320 });
  drawText(`Total Due: INR ${Number(invoice.total || 0).toFixed(2)}`, {
    x: 320,
    bold: true,
    size: 12,
  });

  cursorY -= 10;
  drawText("Payment Terms", { size: 14, bold: true });
  drawText(invoicePreferences.paymentTerms || "", { size: 10 });
  drawText(invoicePreferences.footerNote || "", { size: 10 });

  if (invoice.notes) {
    cursorY -= 8;
    drawText("Notes", { size: 14, bold: true });
    drawText(invoice.notes, { size: 10 });
  }

  if (companyProfile.gstNumber) {
    cursorY -= 8;
    drawText(`GSTIN: ${companyProfile.gstNumber}`, { size: 10 });
  }

  const bytes = await pdfDoc.save();

  return {
    bytes: Buffer.from(bytes),
    fileName: `${invoice.invoiceNumber}.pdf`,
    invoice,
  };
}

export async function ensureInvoicePdfAttachment(invoiceId: string) {
  const generated = await generateInvoicePdf(invoiceId);
  if (!generated) {
    return null;
  }

  try {
    const existingAttachment = await prisma.fileAttachment.findFirst({
      where: {
        entityType: "invoice_pdf",
        entityId: invoiceId,
      },
    });

    const uploaded = await uploadFile({
      buffer: generated.bytes,
      fileName: generated.fileName,
      contentType: "application/pdf",
      folder: `invoices/${invoiceId}`,
      visibility: "private",
    });

    const attachment = existingAttachment
      ? await prisma.fileAttachment.update({
          where: { id: existingAttachment.id },
          data: {
            name: generated.fileName,
            url: existingAttachment.url,
            storageKey: uploaded.storageKey,
            storageProvider: uploaded.provider,
            mimeType: "application/pdf",
            size: generated.bytes.length,
          },
        })
      : await prisma.fileAttachment.create({
          data: {
            entityType: "invoice_pdf",
            entityId: invoiceId,
            name: generated.fileName,
            url: "",
            storageKey: uploaded.storageKey,
            storageProvider: uploaded.provider,
            mimeType: "application/pdf",
            size: generated.bytes.length,
          },
        });

    const downloadUrl = `/api/files/${attachment.id}/download`;

    if (attachment.url !== downloadUrl) {
      await prisma.fileAttachment.update({
        where: { id: attachment.id },
        data: { url: downloadUrl },
      });
    }

    return {
      attachment: {
        ...attachment,
        url: downloadUrl,
      },
      bytes: generated.bytes,
      fileName: generated.fileName,
      invoice: generated.invoice,
      signedUrl: await getStoredFileUrl({
        id: attachment.id,
        provider: uploaded.provider,
        storageKey: uploaded.storageKey,
        fallbackUrl: downloadUrl,
      }),
    };
  } catch (error) {
    await reportOperationalIssue({
      title: "Invoice PDF storage sync failed",
      error,
      severity: "WARNING",
      area: "invoice.pdf.storage-sync",
      metadata: {
        invoiceId,
      },
    });
    console.warn(
      "Invoice PDF storage sync failed; serving generated PDF without attachment:",
      error instanceof Error ? error.message : error
    );

    return {
      attachment: null,
      bytes: generated.bytes,
      fileName: generated.fileName,
      invoice: generated.invoice,
      signedUrl: null,
    };
  }
}
