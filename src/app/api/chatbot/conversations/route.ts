import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { getChatbotConversations } from "@/lib/chatbot";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ALLOWED_ROLES = ["SUPER_ADMIN", "ADMIN", "SALES", "PROJECT_MANAGER"];

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminSession(ALLOWED_ROLES);
    if ("error" in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const url = new URL(request.url);
    const q = url.searchParams.get("q");
    const status = url.searchParams.get("status");
    const intent = url.searchParams.get("intent");
    const verified = url.searchParams.get("verified");

    const [conversations, totalCount, verifiedCount, openSupportCount] = await Promise.all([
      getChatbotConversations({
        q,
        status,
        intent,
        verified,
        limit: 60,
      }),
      prisma.chatbotConversation.count(),
      prisma.chatbotConversation.count({
        where: {
          isCustomerVerified: true,
        },
      }),
      prisma.chatbotConversation.count({
        where: {
          supportTicket: {
            is: {
              status: {
                in: ["OPEN", "IN_PROGRESS", "WAITING_ON_CLIENT"],
              },
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: conversations,
      summary: {
        totalCount,
        verifiedCount,
        openSupportCount,
      },
    });
  } catch (error) {
    console.error("Get chatbot conversations error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load chatbot conversations" },
      { status: 500 }
    );
  }
}
