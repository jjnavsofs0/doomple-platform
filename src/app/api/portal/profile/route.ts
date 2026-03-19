import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getPortalClient } from "@/lib/portal";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const portalClient = await getPortalClient();
    if ("error" in portalClient) {
      return NextResponse.json({ error: portalClient.error }, { status: portalClient.status });
    }

    return NextResponse.json({
      id: portalClient.client.id,
      companyName: portalClient.client.companyName || "",
      contactPerson: portalClient.client.contactName || portalClient.user.name || "",
      email: portalClient.client.email,
      phone: portalClient.client.phone || "",
      address: portalClient.client.billingAddress || "",
      gst: portalClient.client.gstNumber || "",
    });
  } catch (error) {
    console.error("Get portal profile error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const portalClient = await getPortalClient();
    if ("error" in portalClient) {
      return NextResponse.json({ error: portalClient.error }, { status: portalClient.status });
    }

    const body = await request.json();
    const companyName = String(body.companyName || "").trim();
    const contactPerson = String(body.contactPerson || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phone = String(body.phone || "").trim();
    const address = String(body.address || "").trim();
    const gst = String(body.gst || "").trim();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const client = await tx.client.update({
        where: { id: portalClient.client.id },
        data: {
          companyName: companyName || null,
          contactName: contactPerson || null,
          email,
          phone: phone || null,
          billingAddress: address || null,
          gstNumber: gst || null,
        },
        select: {
          id: true,
          companyName: true,
          contactName: true,
          email: true,
          phone: true,
          billingAddress: true,
          gstNumber: true,
        },
      });

      await tx.user.update({
        where: { id: portalClient.user.id },
        data: {
          email,
          name: contactPerson || companyName || email,
        },
      });

      return client;
    });

    return NextResponse.json({
      id: updated.id,
      companyName: updated.companyName || "",
      contactPerson: updated.contactName || "",
      email: updated.email,
      phone: updated.phone || "",
      address: updated.billingAddress || "",
      gst: updated.gstNumber || "",
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "That email address is already in use" },
        { status: 400 }
      );
    }

    console.error("Update portal profile error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
