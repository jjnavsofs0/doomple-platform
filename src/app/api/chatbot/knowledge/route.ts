import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import {
  createKnowledgeDocument,
  extractKnowledgeTextFromFile,
  indexKnowledgeDocument,
} from "@/lib/chatbot-kb";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/storage";

export const dynamic = "force-dynamic";

const ALLOWED_ROLES = ["SUPER_ADMIN", "ADMIN", "SALES", "PROJECT_MANAGER"];

export async function GET() {
  try {
    const auth = await requireAdminSession(ALLOWED_ROLES);
    if ("error" in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const documents = await prisma.chatbotKnowledgeDocument.findMany({
      include: {
        _count: {
          select: {
            chunks: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: documents,
    });
  } catch (error) {
    console.error("Get chatbot knowledge error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load knowledge documents" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdminSession(ALLOWED_ROLES);
    if ("error" in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const formData = await request.formData();
    const title = String(formData.get("title") || "").trim();
    const text = String(formData.get("text") || "").trim();
    const file = formData.get("file");

    if (!title) {
      return NextResponse.json(
        { success: false, error: "Title is required" },
        { status: 400 }
      );
    }

    if (!text && !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "Add text or upload a document" },
        { status: 400 }
      );
    }

    if (text) {
      const document = await createKnowledgeDocument({
        title,
        type: "TEXT",
        rawText: text,
        uploadedById: auth.session.user.id,
      });

      await indexKnowledgeDocument(document.id, text);

      return NextResponse.json({
        success: true,
        data: document,
      });
    }

    const uploadedFile = file as File;
    const buffer = Buffer.from(await uploadedFile.arrayBuffer());
    const extractedText = await extractKnowledgeTextFromFile({
      buffer,
      fileName: uploadedFile.name,
      mimeType: uploadedFile.type || null,
    });

    const stored = await uploadFile({
      buffer,
      fileName: uploadedFile.name,
      contentType: uploadedFile.type || undefined,
      folder: "chatbot/knowledge",
      visibility: "private",
    });

    const document = await createKnowledgeDocument({
      title,
      type: "FILE",
      rawText: extractedText,
      url: stored.url || null,
      storageKey: stored.storageKey || null,
      storageProvider: stored.provider || null,
      mimeType: uploadedFile.type || null,
      size: uploadedFile.size,
      uploadedById: auth.session.user.id,
    });

    await indexKnowledgeDocument(document.id, extractedText);

    return NextResponse.json({
      success: true,
      data: document,
    });
  } catch (error) {
    console.error("Create chatbot knowledge error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create knowledge document",
      },
      { status: 500 }
    );
  }
}
