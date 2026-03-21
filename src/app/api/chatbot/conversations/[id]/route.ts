import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import {
  getChatbotConversationDetail,
  updateChatbotConversation,
} from "@/lib/chatbot";
import { recordAuditLog } from "@/lib/audit-log";

export const dynamic = "force-dynamic";

const ALLOWED_ROLES = ["SUPER_ADMIN", "ADMIN", "SALES", "PROJECT_MANAGER"];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminSession(ALLOWED_ROLES);
    if ("error" in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const conversation = await getChatbotConversationDetail(id);

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: "Conversation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error("Get chatbot conversation detail error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load conversation" },
      { status: 500 }
    );
  }
}

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
    const updated = await updateChatbotConversation({
      id,
      status: typeof body.status === "string" ? body.status : undefined,
      summary: typeof body.summary === "string" ? body.summary : undefined,
    });

    await recordAuditLog({
      entityType: "chatbot_conversation",
      entityId: updated.id,
      action: "updated",
      summary: `Conversation ${updated.id.slice(-6).toUpperCase()} updated`,
      userId: auth.session.user.id,
      metadata: {
        status: updated.status,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("Update chatbot conversation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update conversation" },
      { status: 500 }
    );
  }
}
