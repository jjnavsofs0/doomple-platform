import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { prisma } from "@/lib/prisma";
import { getAppSettingValue } from "@/lib/app-settings";

export async function generateQuotationPdf(quotationId: string) {
  const quotation = await prisma.quotation.findUnique({
    where: { id: quotationId },
    include: {
      client: true,
      lead: { select: { fullName: true, email: true, phone: true } },
      createdBy: { select: { name: true, email: true } },
      items: { orderBy: { order: "asc" } },
    },
  });

  if (!quotation) return null;

  const companyProfile = await getAppSettingValue<{
    companyName: string;
    legalName: string;
    email: string;
    phone: string;
    website: string;
    address: string;
    gstNumber: string;
  }>("company_profile");

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
    if (!text) return;
    page.drawText(String(text), {
      x: options.x ?? 50,
      y: cursorY,
      size: options.size ?? 11,
      font: options.bold ? boldFont : regularFont,
      color: rgb(...(options.color ?? [0.1, 0.1, 0.1])),
    });
    cursorY -= (options.size ?? 11) + 6;
  };

  const drawLine = () => {
    page.drawLine({
      start: { x: 50, y: cursorY + 4 },
      end: { x: 545, y: cursorY + 4 },
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.8),
    });
    cursorY -= 10;
  };

  // Header — Company
  drawText(companyProfile?.companyName || "Doomple", { size: 22, bold: true, color: [0.07, 0.24, 0.53] });
  if (companyProfile?.legalName) drawText(companyProfile.legalName, { size: 10 });
  if (companyProfile?.address) drawText(companyProfile.address, { size: 10 });
  const contactLine = [companyProfile?.email, companyProfile?.phone, companyProfile?.website]
    .filter(Boolean)
    .join("  |  ");
  if (contactLine) drawText(contactLine, { size: 10 });

  cursorY -= 12;
  drawLine();

  // Quotation title
  drawText(`Quotation ${quotation.quotationNumber}`, { size: 18, bold: true });
  drawText(`Status: ${quotation.status}`, { size: 10 });
  const validUntilText = quotation.validUntil
    ? new Date(quotation.validUntil).toLocaleDateString("en-IN")
    : "Not specified";
  drawText(
    `Issue Date: ${new Date(quotation.createdAt).toLocaleDateString("en-IN")}  |  Valid Until: ${validUntilText}`,
    { size: 10 }
  );
  if (quotation.title) drawText(quotation.title, { size: 12, bold: true });

  cursorY -= 8;
  drawLine();

  // Bill to
  drawText("Quote For", { size: 14, bold: true });
  const clientName = quotation.client?.companyName || quotation.lead?.fullName || "";
  if (clientName) drawText(clientName, { bold: true });
  const clientEmail = quotation.client?.email || quotation.lead?.email || "";
  if (clientEmail) drawText(clientEmail, { size: 10 });
  const clientPhone = quotation.client?.phone || quotation.lead?.phone || "";
  if (clientPhone) drawText(clientPhone, { size: 10 });
  const clientAddress = [
    quotation.client?.billingAddress,
    quotation.client?.city,
    quotation.client?.state,
    quotation.client?.country,
  ]
    .filter(Boolean)
    .join(", ");
  if (clientAddress) drawText(clientAddress, { size: 10 });

  cursorY -= 8;
  drawLine();

  // Line items
  drawText("Items", { size: 14, bold: true });
  quotation.items.forEach((item) => {
    const itemTotal =
      Number(item.quantity) * Number(item.unitPrice) * (1 + Number(item.taxPercent) / 100) -
      Number(item.discount || 0);
    drawText(
      `${item.description}  |  Qty ${Number(item.quantity)}  |  Rate ${Number(item.unitPrice).toFixed(2)}  |  Total ${itemTotal.toFixed(2)}`,
      { size: 10 }
    );
  });

  cursorY -= 6;
  const subtotal = Number(quotation.subtotal || 0);
  const taxAmount = Number(quotation.taxAmount || 0);
  const discount = Number(quotation.discountAmount || 0);
  const total = Number(quotation.total || 0);

  drawText(`Subtotal: INR ${subtotal.toFixed(2)}`, { x: 320, bold: true });
  drawText(`Tax: INR ${taxAmount.toFixed(2)}`, { x: 320 });
  if (discount > 0) drawText(`Discount: INR ${discount.toFixed(2)}`, { x: 320 });
  drawText(`Total: INR ${total.toFixed(2)}`, { x: 320, bold: true, size: 12 });

  if (quotation.description) {
    cursorY -= 8;
    drawLine();
    drawText("Description", { size: 14, bold: true });
    drawText(quotation.description, { size: 10 });
  }

  if (quotation.termsNotes) {
    cursorY -= 8;
    drawLine();
    drawText("Terms & Notes", { size: 14, bold: true });
    drawText(quotation.termsNotes, { size: 10 });
  }

  if (companyProfile?.gstNumber) {
    cursorY -= 8;
    drawText(`GSTIN: ${companyProfile.gstNumber}`, { size: 10 });
  }

  const bytes = await pdfDoc.save();
  return {
    bytes: Buffer.from(bytes),
    fileName: `${quotation.quotationNumber}.pdf`,
    quotation,
  };
}
