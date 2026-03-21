import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  createChatbotConversation,
  getChatbotConversationForVisitor,
  getChatbotSettings,
  getVisitorChatbotConversations,
} from "@/lib/chatbot";
import { generateId } from "@/lib/utils";

export const dynamic = "force-dynamic";

const CHATBOT_VISITOR_COOKIE = "doomple_chatbot_visitor";
const CHATBOT_CONVERSATION_COOKIE = "doomple_chatbot_conversation";

async function buildSessionResponse(params: {
  visitorId: string;
  conversationId?: string | null;
}) {
  const settings = await getChatbotSettings();
  let activeConversationId = "";

  if (params.conversationId) {
    const selectedConversation = await getChatbotConversationForVisitor({
      visitorId: params.visitorId,
      conversationId: params.conversationId,
    });
    activeConversationId = selectedConversation?.id || "";
  }

  if (!activeConversationId) {
    const previousConversations = await getVisitorChatbotConversations(params.visitorId, 1);
    activeConversationId = previousConversations[0]?.id || "";
  }

  const conversation = activeConversationId
    ? await getChatbotConversationForVisitor({
        visitorId: params.visitorId,
        conversationId: activeConversationId,
      })
    : await createChatbotConversation(params.visitorId);

  if (!conversation) {
    throw new Error("Failed to resolve chatbot conversation");
  }

  const conversations = await getVisitorChatbotConversations(params.visitorId);

  return {
    conversationId: conversation.id,
    visitorId: params.visitorId,
    isCustomerVerified: conversation.isCustomerVerified,
    assistantName: settings.assistantName,
    welcomeMessage: settings.welcomeMessage,
    messages: conversation.messages,
    conversations,
  };
}

function applyChatCookies(response: NextResponse, params: {
  visitorId: string;
  conversationId: string;
}) {
  response.cookies.set(CHATBOT_VISITOR_COOKIE, params.visitorId, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });
  response.cookies.set(CHATBOT_CONVERSATION_COOKIE, params.conversationId, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const visitorId = cookieStore.get(CHATBOT_VISITOR_COOKIE)?.value || generateId();
    const conversationId = cookieStore.get(CHATBOT_CONVERSATION_COOKIE)?.value || null;
    const data = await buildSessionResponse({
      visitorId,
      conversationId,
    });

    return applyChatCookies(
      NextResponse.json({
        success: true,
        data,
      }),
      {
        visitorId,
        conversationId: data.conversationId,
      }
    );
  } catch (error) {
    console.error("Get chatbot session error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to start chat session" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const cookieStore = await cookies();
    const visitorId = cookieStore.get(CHATBOT_VISITOR_COOKIE)?.value || generateId();

    let conversationId = "";

    if (body?.action === "new") {
      const conversation = await createChatbotConversation(visitorId);
      conversationId = conversation.id;
    } else if (typeof body?.conversationId === "string" && body.conversationId.trim()) {
      const existing = await getChatbotConversationForVisitor({
        visitorId,
        conversationId: body.conversationId.trim(),
      });

      if (!existing) {
        return NextResponse.json(
          { success: false, error: "Conversation not found" },
          { status: 404 }
        );
      }

      conversationId = existing.id;
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid session action" },
        { status: 400 }
      );
    }

    const data = await buildSessionResponse({
      visitorId,
      conversationId,
    });

    return applyChatCookies(
      NextResponse.json({
        success: true,
        data,
      }),
      {
        visitorId,
        conversationId: data.conversationId,
      }
    );
  } catch (error) {
    console.error("Update chatbot session error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update chat session" },
      { status: 500 }
    );
  }
}
