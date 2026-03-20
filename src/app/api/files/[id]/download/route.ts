import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStoredFileUrl } from "@/lib/storage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canAccessInvoiceForPayment } from "@/lib/invoice-access";

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

    const file = await prisma.fileAttachment.findUnique({
      where: { id: params.id },
    });

    if (!file) {
      return NextResponse.json(
        { success: false, error: "File not found" },
        { status: 404 }
      );
    }

    if (
      !["SUPER_ADMIN", "ADMIN", "SALES", "PROJECT_MANAGER", "FINANCE"].includes(
        session.user.role
      )
    ) {
      if (session.user.role !== "CLIENT" || !session.user.email) {
        return NextResponse.json(
          { success: false, error: "Forbidden" },
          { status: 403 }
        );
      }

      let hasAccess = false;

      if (file.entityType === "client") {
        const client = await prisma.client.findUnique({
          where: { id: file.entityId },
          select: { email: true },
        });
        hasAccess = Boolean(client && client.email === session.user.email);
      }

      if (!hasAccess && file.entityType === "project") {
        const project = await prisma.project.findUnique({
          where: { id: file.entityId },
          select: {
            id: true,
            client: {
              select: { email: true },
            },
          },
        });
        hasAccess = Boolean(project && project.client.email === session.user.email);
      }

      if (!hasAccess && (file.entityType === "invoice" || file.entityType === "invoice_pdf")) {
        const invoice = await prisma.invoice.findUnique({
          where: { id: file.entityId },
          include: {
            client: {
              select: { email: true },
            },
          },
        });
        hasAccess = Boolean(
          invoice && canAccessInvoiceForPayment(session.user, invoice.client.email)
        );
      }

      if (!hasAccess) {
        return NextResponse.json(
          { success: false, error: "Forbidden" },
          { status: 403 }
        );
      }
    }

    const downloadUrl = await getStoredFileUrl({
      id: file.id,
      provider: file.storageProvider,
      storageKey: file.storageKey,
      fallbackUrl: file.url,
    });

    return NextResponse.redirect(new URL(downloadUrl, request.url));
  } catch (error) {
    console.error("Download file error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to download file" },
      { status: 500 }
    );
  }
}
