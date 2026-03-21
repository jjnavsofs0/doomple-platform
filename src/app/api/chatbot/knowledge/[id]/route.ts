import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { indexKnowledgeDocument } from "@/lib/chatbot-kb";
import { prisma } from "@/lib/prisma";
import { deleteStoredFile } from "@/lib/storage";

export const dynamic = "force-dynamic";

const ALLOWED_ROLES = ["SUPER_ADMIN", "ADMIN", "SALES", "PROJECT_MANAGER"];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminSession(ALLOWED_ROLES);
    if ("error" in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const body = await request.json();
    const title = String(body.title || "").trim();
    const rawText = String(body.rawText || "").trim();

    if (!title || !rawText) {
      return NextResponse.json(
        { success: false, error: "Title and text are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.chatbotKnowledgeDocument.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Knowledge document not found" },
        { status: 404 }
      );
    }

    await prisma.chatbotKnowledgeDocument.update({
      where: { id },
      data: {
        title,
        rawText,
        excerpt: rawText.slice(0, 280),
        status: "PROCESSING",
      },
    });

    await indexKnowledgeDocument(id, rawText);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Update chatbot knowledge error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update knowledge document" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminSession(ALLOWED_ROLES);
    if ("error" in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const existing = await prisma.chatbotKnowledgeDocument.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Knowledge document not found" },
        { status: 404 }
      );
    }

    await prisma.chatbotKnowledgeDocument.delete({
      where: { id },
    });

    await deleteStoredFile(existing.storageProvider || "local", existing.storageKey);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete chatbot knowledge error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete knowledge document" },
      { status: 500 }
    );
  }
}
