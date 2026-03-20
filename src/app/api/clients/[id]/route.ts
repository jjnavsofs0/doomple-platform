import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getClientCoreSelect, supportsClientBankingFields } from "@/lib/client-db-compat";
import { prisma } from "@/lib/prisma";
import { notifyAdmins } from "@/lib/realtime";

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

    const bankingFieldsSupported = await supportsClientBankingFields();

    const client = await prisma.client.findUnique({
      where: { id: params.id },
      select: {
        ...getClientCoreSelect(bankingFieldsSupported),
        projects: {
          select: {
            id: true,
            name: true,
            status: true,
            budget: true,
            createdAt: true,
          },
        },
        invoices: {
          select: {
            id: true,
            invoiceNumber: true,
            total: true,
            status: true,
            createdAt: true,
          },
        },
        documents: {
          select: {
            id: true,
            name: true,
            url: true,
            uploadedAt: true,
          },
        },
        communications: {
          select: {
            id: true,
            type: true,
            subject: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        convertedFromLeads: {
          select: {
            id: true,
            fullName: true,
            email: true,
            companyName: true,
            status: true,
            convertedProjectId: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Client not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...client,
        panNumber: "panNumber" in client ? client.panNumber : null,
        bankName: "bankName" in client ? client.bankName : null,
        bankAccountNumber:
          "bankAccountNumber" in client ? client.bankAccountNumber : null,
        ifscCode: "ifscCode" in client ? client.ifscCode : null,
        contactPersonName: client.contactName,
        address: client.billingAddress,
        status: client.isActive ? "active" : "inactive",
      },
    });
  } catch (error) {
    console.error("Get client error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch client" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bankingFieldsSupported = await supportsClientBankingFields();
    const body = await request.json();

    const existingClient = await prisma.client.findUnique({
      where: { id: params.id },
      select: getClientCoreSelect(bankingFieldsSupported),
    });

    if (!existingClient) {
      return NextResponse.json(
        { success: false, error: "Client not found" },
        { status: 404 }
      );
    }

    // Check email uniqueness if being updated
    if (body.email && body.email !== existingClient.email) {
      const emailExists = await prisma.client.findUnique({
        where: { email: body.email },
      });

      if (emailExists) {
        return NextResponse.json(
          { success: false, error: "Email already in use" },
          { status: 400 }
        );
      }
    }

    const updateData: Record<string, unknown> = {
      type: body.type || existingClient.type,
      companyName:
        body.companyName !== undefined
          ? body.companyName
          : existingClient.companyName,
      contactName:
        body.contactName !== undefined
          ? body.contactName
          : existingClient.contactName,
      email: body.email || existingClient.email,
      phone: body.phone !== undefined ? body.phone : existingClient.phone,
      billingAddress:
        body.billingAddress !== undefined
          ? body.billingAddress
          : existingClient.billingAddress,
      city: body.city !== undefined ? body.city : existingClient.city,
      state: body.state !== undefined ? body.state : existingClient.state,
      postalCode:
        body.postalCode !== undefined
          ? body.postalCode
          : existingClient.postalCode,
      country:
        body.country !== undefined ? body.country : existingClient.country,
      gstNumber:
        body.gstNumber !== undefined ? body.gstNumber : existingClient.gstNumber,
      notes: body.notes !== undefined ? body.notes : existingClient.notes,
      isActive:
        body.isActive !== undefined ? body.isActive : existingClient.isActive,
    };

    if (bankingFieldsSupported) {
      updateData.panNumber =
        body.panNumber !== undefined
          ? body.panNumber
          : "panNumber" in existingClient
            ? existingClient.panNumber
            : null;
      updateData.bankName =
        body.bankName !== undefined
          ? body.bankName
          : "bankName" in existingClient
            ? existingClient.bankName
            : null;
      updateData.bankAccountNumber =
        body.bankAccountNumber !== undefined
          ? body.bankAccountNumber
          : "bankAccountNumber" in existingClient
            ? existingClient.bankAccountNumber
            : null;
      updateData.ifscCode =
        body.ifscCode !== undefined
          ? body.ifscCode
          : "ifscCode" in existingClient
            ? existingClient.ifscCode
            : null;
    }

    const updatedClient = await prisma.client.update({
      where: { id: params.id },
      data: updateData,
    });

    await notifyAdmins({
      title: "Client updated",
      message: `${updatedClient.companyName} account details were updated.`,
      link: `/admin/clients/${updatedClient.id}`,
      topics: ["dashboard", "clients", "notifications"],
      metadata: {
        clientId: updatedClient.id,
        isActive: updatedClient.isActive,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Client updated successfully",
      data: updatedClient,
    });
  } catch (error) {
    console.error("Update client error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update client" },
      { status: 500 }
    );
  }
}

export const PATCH = PUT;

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await prisma.client.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        companyName: true,
        projects: true,
      },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Client not found" },
        { status: 404 }
      );
    }

    // Check for active projects
    const activeProjects = client.projects.filter(
      (p) =>
        p.status !== "CANCELLED" &&
        p.status !== "COMPLETED"
    );

    if (activeProjects.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete client with ${activeProjects.length} active project(s)`,
        },
        { status: 400 }
      );
    }

    // Soft delete by marking as inactive
    await prisma.client.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    await notifyAdmins({
      title: "Client archived",
      message: `${client.companyName} was marked inactive.`,
      topics: ["dashboard", "clients", "notifications"],
      metadata: {
        clientId: client.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Client deleted successfully",
    });
  } catch (error) {
    console.error("Delete client error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete client" },
      { status: 500 }
    );
  }
}
