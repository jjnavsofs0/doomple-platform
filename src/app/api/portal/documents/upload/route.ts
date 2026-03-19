import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPortalClient } from "@/lib/portal";
import { FILE_LIMITS } from "@/lib/constants";
import { uploadFile } from "@/lib/storage";
import { broadcastUserRefresh, notifyAdmins } from "@/lib/realtime";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const portalClient = await getPortalClient();
    if ("error" in portalClient) {
      return NextResponse.json({ error: portalClient.error }, { status: portalClient.status });
    }

    const formData = await request.formData();
    const files = formData.getAll("files").filter((file): file is File => file instanceof File);

    if (files.length === 0) {
      return NextResponse.json(
        { success: false, error: "No files were provided" },
        { status: 400 }
      );
    }

    const allowedTypes = new Set<string>([
      ...FILE_LIMITS.ALLOWED_DOCUMENT_TYPES,
      ...FILE_LIMITS.ALLOWED_IMAGE_TYPES,
    ]);

    const uploadedFiles = [];

    for (const file of files) {
      if (file.size > FILE_LIMITS.MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, error: `${file.name} exceeds the 10MB limit` },
          { status: 400 }
        );
      }

      if (file.type && !allowedTypes.has(file.type)) {
        return NextResponse.json(
          { success: false, error: `${file.name} is not a supported file type` },
          { status: 400 }
        );
      }

      const uploaded = await uploadFile({
        buffer: Buffer.from(await file.arrayBuffer()),
        fileName: file.name,
        contentType: file.type,
        folder: `client/${portalClient.client.id}`,
        visibility: "private",
      });

      const attachment = await prisma.fileAttachment.create({
        data: {
          entityType: "client",
          entityId: portalClient.client.id,
          name: file.name,
          url: "",
          storageKey: uploaded.storageKey,
          storageProvider: uploaded.provider,
          mimeType: file.type || null,
          size: file.size,
        },
      });

      const url = `/api/files/${attachment.id}/download`;
      await prisma.fileAttachment.update({
        where: { id: attachment.id },
        data: { url },
      });

      uploadedFiles.push({
        id: attachment.id,
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
        uploadedAt: attachment.createdAt,
        uploadedBy: portalClient.client.contactName || portalClient.client.email,
        url,
      });
    }

    await notifyAdmins({
      title: "Client documents uploaded",
      message: `${uploadedFiles.length} new document${uploadedFiles.length === 1 ? "" : "s"} were uploaded for ${portalClient.client.companyName || portalClient.client.email}.`,
      type: "PROJECT",
      link: `/admin/clients/${portalClient.client.id}`,
      topics: ["clients", "notifications"],
      metadata: {
        clientId: portalClient.client.id,
        uploadCount: uploadedFiles.length,
      },
    });

    await broadcastUserRefresh([portalClient.user.id], ["documents", "notifications"], {
      clientId: portalClient.client.id,
      uploadCount: uploadedFiles.length,
    });

    return NextResponse.json({
      success: true,
      documents: uploadedFiles,
    });
  } catch (error) {
    console.error("Upload portal documents error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload documents" },
      { status: 500 }
    );
  }
}
