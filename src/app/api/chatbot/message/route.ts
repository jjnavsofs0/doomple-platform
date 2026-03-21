import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { handleChatbotMessage } from "@/lib/chatbot";
import { generateId } from "@/lib/utils";

export const dynamic = "force-dynamic";

const CHATBOT_VISITOR_COOKIE = "doomple_chatbot_visitor";
const CHATBOT_CONVERSATION_COOKIE = "doomple_chatbot_conversation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = String(body.message || "").trim();

    if (!message) {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const visitorId = cookieStore.get(CHATBOT_VISITOR_COOKIE)?.value || generateId();

    const result = await handleChatbotMessage({
      conversationId: body.conversationId || cookieStore.get(CHATBOT_CONVERSATION_COOKIE)?.value || null,
      visitorId,
      message,
    });

    const response = NextResponse.json({
      success: true,
      data: result,
    });

    response.cookies.set(CHATBOT_VISITOR_COOKIE, visitorId, {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 180,
    });
    response.cookies.set(CHATBOT_CONVERSATION_COOKIE, result.conversationId, {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    console.error("Chatbot message error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to process message",
      },
      { status: 500 }
    );
  }
}
