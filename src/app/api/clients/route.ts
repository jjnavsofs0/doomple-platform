import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { getClientCoreSelect, supportsClientBankingFields } from "@/lib/client-db-compat";
import { prisma } from "@/lib/prisma";
import { notifyAdmins } from "@/lib/realtime";
import { clientSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const search = url.searchParams.get("search");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;
    const clientSelect = getClientCoreSelect(false);

    const where: any = {};
    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: "insensitive" } },
        { contactName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const clients = await prisma.client.findMany({
      where,
      select: {
        ...clientSelect,
        _count: {
          select: {
            projects: true,
            invoices: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.client.count({ where });

    const data = clients.map((client) => ({
      ...client,
      panNumber: null,
      bankName: null,
      bankAccountNumber: null,
      ifscCode: null,
      contactPersonName: client.contactName,
      status: client.isActive ? "active" : "inactive",
      projects_count: client._count.projects,
      invoices_count: client._count.invoices,
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
    console.error("Get clients error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch clients" },
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

    const bankingFieldsSupported = await supportsClientBankingFields();

    const body = await request.json();
    const normalizedData = {
      companyName: body.companyName || body.company || "",
      contactName: body.contactPersonName || body.contactName || body.name || "",
      email: body.email || "",
      phone: body.phone || "",
      address: body.address || body.billingAddress || "",
      city: body.city || "",
      state: body.state || "",
      postalCode: body.postalCode || body.zipCode || "",
      country: body.country || "",
      gstNumber: body.gstNumber || body.gstin || "",
      panNumber: body.panNumber || "",
      bankName: body.bankName || "",
      bankAccountNumber: body.bankAccountNumber || "",
      ifscCode: body.ifscCode || "",
    };

    if (!normalizedData.companyName || !normalizedData.contactName || !normalizedData.email) {
      return NextResponse.json(
        { success: false, error: "Company name, contact name, and email are required" },
        { status: 400 }
      );
    }

    const validatedData = clientSchema.parse({
      name: normalizedData.contactName,
      company: normalizedData.companyName,
      email: normalizedData.email,
      phone: normalizedData.phone,
      address: normalizedData.address,
      city: normalizedData.city,
      state: normalizedData.state,
      zipCode: normalizedData.postalCode,
      country: normalizedData.country,
      gstin: normalizedData.gstNumber,
    });

    // Check if email already exists
    const existingClient = await prisma.client.findUnique({
      where: { email: validatedData.email },
      select: { id: true },
    });

    if (existingClient) {
      return NextResponse.json(
        { success: false, error: "Client with this email already exists" },
        { status: 400 }
      );
    }

    // Phone uniqueness check (if phone provided)
    if (validatedData.phone) {
      const clientWithPhone = await prisma.client.findFirst({
        where: { phone: validatedData.phone, isActive: true },
        select: { id: true, companyName: true, contactName: true, email: true },
      });
      if (clientWithPhone) {
        return NextResponse.json(
          {
            success: false,
            error: `A client with this phone number already exists: ${clientWithPhone.companyName || clientWithPhone.contactName || clientWithPhone.email}`,
            existingClientId: clientWithPhone.id,
          },
          { status: 400 }
        );
      }
    }

    const clientData: Prisma.ClientCreateInput = {
      type: body.type || "company",
      companyName: validatedData.company,
      contactName: validatedData.name,
      email: validatedData.email,
      phone: validatedData.phone || null,
      billingAddress: validatedData.address || null,
      city: validatedData.city || null,
      state: validatedData.state || null,
      postalCode: validatedData.zipCode || null,
      country: validatedData.country || null,
      gstNumber: validatedData.gstin || null,
      isActive: true,
    };

    if (bankingFieldsSupported) {
      clientData.panNumber = normalizedData.panNumber || null;
      clientData.bankName = normalizedData.bankName || null;
      clientData.bankAccountNumber = normalizedData.bankAccountNumber || null;
      clientData.ifscCode = normalizedData.ifscCode || null;
    }

    const client = await prisma.client.create({
      data: clientData,
    });

    await notifyAdmins({
      title: "Client created",
      message: `${client.companyName} was added to the client roster.`,
      link: `/admin/clients/${client.id}`,
      topics: ["dashboard", "clients", "notifications"],
      metadata: {
        clientId: client.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Client created successfully",
        data: client,
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

    console.error("Create client error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create client" },
      { status: 500 }
    );
  }
}
