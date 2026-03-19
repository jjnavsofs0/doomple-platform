import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";
import { FILE_LIMITS } from "@/lib/constants";
import { uploadFile } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const auth = await requireAdminSession();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const url = new URL(request.url);
    const entityType = url.searchParams.get("entityType");
    const entityId = url.searchParams.get("entityId");

    if (!entityType || !entityId) {
      return NextResponse.json(
        { success: false, error: "entityType and entityId are required" },
        { status: 400 }
      );
    }

    const files = await prisma.fileAttachment.findMany({
      where: {
        entityType,
        entityId,
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
      data: files.map((file) => ({
        ...file,
        uploadedBy: file.uploadedBy?.name || file.uploadedBy?.email || null,
      })),
    });
  } catch (error) {
    console.error("Get files error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch files" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdminSession();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const formData = await request.formData();
    const entityType = String(formData.get("entityType") || "");
    const entityId = String(formData.get("entityId") || "");
    const files = formData.getAll("files").filter((file): file is File => file instanceof File);

    if (!entityType || !entityId || files.length === 0) {
      return NextResponse.json(
        { success: false, error: "entityType, entityId, and files are required" },
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

      const arrayBuffer = await file.arrayBuffer();
      const uploaded = await uploadFile({
        buffer: Buffer.from(arrayBuffer),
        fileName: file.name,
        contentType: file.type,
        folder: `${entityType}/${entityId}`,
        visibility: "private",
      });

      const attachment = await prisma.fileAttachment.create({
        data: {
          entityType,
          entityId,
          name: file.name,
          url: "",
          storageKey: uploaded.storageKey,
          storageProvider: uploaded.provider,
          mimeType: file.type || null,
          size: file.size,
          uploadedById: auth.session.user.id,
        },
        include: {
          uploadedBy: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      const url = `/api/files/${attachment.id}/download`;

      await prisma.fileAttachment.update({
        where: { id: attachment.id },
        data: { url },
      });

      uploadedFiles.push({
        ...attachment,
        url,
        uploadedBy: attachment.uploadedBy?.name || attachment.uploadedBy?.email || null,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Files uploaded successfully",
      data: uploadedFiles,
    });
  } catch (error) {
    console.error("Upload files error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload files" },
      { status: 500 }
    );
  }
}
