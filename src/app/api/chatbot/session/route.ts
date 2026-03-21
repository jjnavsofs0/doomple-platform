import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getChatbotSettings, getOrCreateChatbotConversation } from "@/lib/chatbot";
import { generateId } from "@/lib/utils";

export const dynamic = "force-dynamic";

const CHATBOT_VISITOR_COOKIE = "doomple_chatbot_visitor";
const CHATBOT_CONVERSATION_COOKIE = "doomple_chatbot_conversation";

export async function GET() {
  try {
    const cookieStore = await cookies();
    let visitorId = cookieStore.get(CHATBOT_VISITOR_COOKIE)?.value || "";
    const conversationId = cookieStore.get(CHATBOT_CONVERSATION_COOKIE)?.value || null;

    if (!visitorId) {
      visitorId = generateId();
    }

    const conversation = await getOrCreateChatbotConversation({
      conversationId,
      visitorId,
    });
    const settings = await getChatbotSettings();

    const response = NextResponse.json({
      success: true,
      data: {
        conversationId: conversation.id,
        visitorId,
        isCustomerVerified: conversation.isCustomerVerified,
        assistantName: settings.assistantName,
        welcomeMessage: settings.welcomeMessage,
        messages: conversation.messages,
      },
    });

    response.cookies.set(CHATBOT_VISITOR_COOKIE, visitorId, {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 180,
    });
    response.cookies.set(CHATBOT_CONVERSATION_COOKIE, conversation.id, {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    console.error("Get chatbot session error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to start chat session" },
      { status: 500 }
    );
  }
}
