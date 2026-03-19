import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPortalClient } from "@/lib/portal";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const portalClient = await getPortalClient();
    if ("error" in portalClient) {
      return NextResponse.json({ error: portalClient.error }, { status: portalClient.status });
    }

    const [projects, invoices] = await Promise.all([
      prisma.project.findMany({
        where: { clientId: portalClient.client.id },
        select: { id: true },
      }),
      prisma.invoice.findMany({
        where: { clientId: portalClient.client.id },
        select: { id: true },
      }),
    ]);

    const files = await prisma.fileAttachment.findMany({
      where: {
        OR: [
          { entityType: "client", entityId: portalClient.client.id },
          ...projects.map((project) => ({
            entityType: "project",
            entityId: project.id,
          })),
          ...invoices.flatMap((invoice) => [
            {
              entityType: "invoice",
              entityId: invoice.id,
            },
            {
              entityType: "invoice_pdf",
              entityId: invoice.id,
            },
          ]),
        ],
      },
      include: {
        uploadedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      documents: files.map((file) => ({
        id: file.id,
        name: file.name,
        type: file.mimeType || "application/octet-stream",
        size: file.size || 0,
        uploadedAt: file.createdAt,
        uploadedBy: file.uploadedBy?.name || file.uploadedBy?.email || "",
        url: file.url,
      })),
    });
  } catch (error) {
    console.error("Get portal documents error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}
