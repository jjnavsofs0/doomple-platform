import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit-log";
import { normalizeCurrency } from "@/lib/billing";
import { prisma } from "@/lib/prisma";
import { notifyAdmins } from "@/lib/realtime";
import { invoiceSchema } from "@/lib/validations";
import { getAppSettingValue } from "@/lib/app-settings";

async function generateInvoiceNumber(): Promise<string> {
  const invoicePreferences = await getAppSettingValue<{
    prefix: string;
  }>("invoice_preferences");
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `${invoicePreferences.prefix || "DINV"}-${year}${month}-${random}`;
}

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const clientId = url.searchParams.get("clientId");
    const projectId = url.searchParams.get("projectId");
    const search = url.searchParams.get("search");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (clientId) where.clientId = clientId;
    if (projectId) where.projectId = projectId;
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            companyName: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            paidAt: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.invoice.count({ where });

    const data = invoices.map((invoice) => ({
      ...invoice,
      clientName: invoice.client?.companyName || "Unknown Client",
      projectName: invoice.project?.name || null,
      total: Number(invoice.total || 0),
      amountPaid: Number(invoice.paidAmount || 0),
      billingCategory: invoice.billingCategory || "General",
      currency: invoice.currency || "INR",
      status: invoice.status
        .toLowerCase()
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" "),
    }));

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get invoices error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    let quotationSource: any = null;
    const invoicePreferences = await getAppSettingValue<{
      dueDays: number;
    }>("invoice_preferences");

    if (body.quotationId) {
      quotationSource = await prisma.quotation.findUnique({
        where: { id: body.quotationId },
        include: {
          items: { orderBy: { order: "asc" } },
          client: { select: { id: true } },
        },
      });
    }

    if (body.quotationId && quotationSource) {
      if (quotationSource.status !== "ACCEPTED") {
        return NextResponse.json(
          {
            success: false,
            error: "Only accepted quotations can be converted into invoices.",
          },
          { status: 400 }
        );
      }

      const existingInvoices = await prisma.invoice.findMany({
        where: { quotationId: body.quotationId },
        select: {
          id: true,
          invoiceNumber: true,
          status: true,
          currency: true,
          total: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      });

      if (existingInvoices.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error:
              existingInvoices.length === 1
                ? "An invoice has already been created from this quotation."
                : "Multiple invoices are already linked to this quotation.",
            data: {
              existingInvoice:
                existingInvoices.length === 1
                  ? {
                      ...existingInvoices[0],
                      total: Number(existingInvoices[0].total || 0),
                      status: existingInvoices[0].status
                        .toLowerCase()
                        .split("_")
                        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                        .join(" "),
                    }
                  : null,
              existingInvoices: existingInvoices.map((invoice) => ({
                ...invoice,
                total: Number(invoice.total || 0),
                status: invoice.status
                  .toLowerCase()
                  .split("_")
                  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                  .join(" "),
              })),
            },
          },
          { status: 409 }
        );
      }
    }

    const items = Array.isArray(body.items)
      ? body.items
      : Array.isArray(body.lineItems)
        ? body.lineItems.map((item: any) => ({
            description: item.description,
            quantity: Number(item.quantity),
            rate: Number(item.unitPrice),
            taxRate: Number(item.taxPercent || 0),
          }))
        : quotationSource?.items.map((item: any) => ({
            description: item.description,
            quantity: Number(item.quantity),
            rate: Number(item.unitPrice),
            taxRate: Number(item.taxPercent || 0),
          })) || [];

    const normalizedData = {
      clientId: body.clientId || quotationSource?.clientId || quotationSource?.client?.id || "",
      projectId: body.projectId || "",
      quotationId: body.quotationId || "",
      issueDate: body.issueDate || new Date().toISOString().slice(0, 10),
      dueDate:
        body.dueDate ||
        new Date(
          Date.now() + Number(invoicePreferences.dueDays || 14) * 24 * 60 * 60 * 1000
        )
          .toISOString()
          .slice(0, 10),
      billingCategory: body.billingCategory || "Development",
      currency: normalizeCurrency(body.currency || quotationSource?.currency || "INR"),
      notes: body.notes || "",
      items,
    };

    if (!normalizedData.clientId || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Client and at least one invoice item are required" },
        { status: 400 }
      );
    }

    invoiceSchema.parse({
      clientId: normalizedData.clientId,
      projectId: normalizedData.projectId,
      invoiceNumber: "AUTO-GENERATED",
      issueDate: new Date(normalizedData.issueDate).toISOString(),
      dueDate: new Date(normalizedData.dueDate).toISOString(),
      items: normalizedData.items.map((item: any) => ({
        description: item.description,
        quantity: Number(item.quantity),
        rate: Number(item.rate),
      })),
      notes: normalizedData.notes,
    });

    // Check if client exists
    const clientExists = await prisma.client.findUnique({
      where: { id: normalizedData.clientId },
      select: { id: true },
    });

    if (!clientExists) {
      return NextResponse.json(
        { success: false, error: "Client not found" },
        { status: 404 }
      );
    }

    // Auto-generate invoice number
    const invoiceNumber = await generateInvoiceNumber();

    // Calculate totals
    let subtotal = 0;
    let taxAmount = 0;

    for (const item of normalizedData.items) {
      const itemTotal = Number(item.quantity) * Number(item.rate);
      subtotal += itemTotal;
      taxAmount += (itemTotal * Number(item.taxRate || 0)) / 100 || 0;
    }

    const total = subtotal + taxAmount;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        currency: normalizedData.currency,
        issueDate: new Date(normalizedData.issueDate),
        dueDate: new Date(normalizedData.dueDate),
        subtotal,
        taxAmount,
        total,
        notes: normalizedData.notes || null,
        status: "DRAFT",
        billingCategory: normalizedData.billingCategory,
        clientId: normalizedData.clientId,
        projectId: normalizedData.projectId || null,
        quotationId: normalizedData.quotationId || null,
        createdById: session.user.id,
        items: {
          createMany: {
            data: normalizedData.items.map((item: any, index: number) => ({
              description: item.description,
              quantity: Number(item.quantity),
              unitPrice: Number(item.rate),
              taxPercent: Number(item.taxRate || 0),
              total: Number(item.quantity) * Number(item.rate),
              order: index,
            })),
          },
        },
      },
      include: {
        client: {
          select: {
            id: true,
            companyName: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        items: {
          orderBy: { order: "asc" },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    await recordAuditLog({
      entityType: "invoice",
      entityId: invoice.id,
      action: "created",
      summary: `Invoice ${invoice.invoiceNumber} was created`,
      userId: session.user.id,
      metadata: {
        invoiceNumber: invoice.invoiceNumber,
        currency: invoice.currency || "INR",
        total: Number(invoice.total || 0),
        status: invoice.status,
        quotationId: invoice.quotationId || null,
      },
    });

    await notifyAdmins({
      title: "Invoice created",
      message: `${invoice.invoiceNumber} was created${invoice.client?.companyName ? ` for ${invoice.client.companyName}` : ""}.`,
      type: "INVOICE",
      link: `/admin/invoices/${invoice.id}`,
      topics: ["dashboard", "invoices", "notifications"],
      metadata: {
        invoiceId: invoice.id,
        status: invoice.status,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Invoice created successfully",
        data: invoice,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("validation")) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        );
      }
    }

    console.error("Create invoice error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
