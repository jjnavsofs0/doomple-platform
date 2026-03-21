import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { getChatbotDashboardData } from "@/lib/chatbot";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ALLOWED_ROLES = ["SUPER_ADMIN", "ADMIN", "SALES", "PROJECT_MANAGER"];

export async function GET() {
  try {
    const auth = await requireAdminSession(ALLOWED_ROLES);
    if ("error" in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const data = await getChatbotDashboardData();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Get chatbot admin data error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load chatbot admin data" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdminSession(ALLOWED_ROLES);
    if ("error" in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const current = await prisma.appSetting.findUnique({
      where: { key: "chatbot_assistant" },
    });

    const value = {
      enabled: Boolean(body.enabled ?? true),
      assistantName: String(body.assistantName || "Doomple AI Advisor"),
      welcomeMessage: String(body.welcomeMessage || ""),
      systemPrompt: String(body.systemPrompt || ""),
      salesObjective: String(body.salesObjective || ""),
      supportObjective: String(body.supportObjective || ""),
    };

    const saved = await prisma.appSetting.upsert({
      where: { key: "chatbot_assistant" },
      update: {
        value,
        group: current?.group || "communications",
        label: current?.label || "Chatbot Assistant",
        description:
          current?.description || "Configuration for the OpenAI-powered website assistant.",
        updatedById: auth.session.user.id,
      },
      create: {
        key: "chatbot_assistant",
        group: "communications",
        label: "Chatbot Assistant",
        description: "Configuration for the OpenAI-powered website assistant.",
        value,
        updatedById: auth.session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: saved,
    });
  } catch (error) {
    console.error("Update chatbot settings error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update chatbot settings" },
      { status: 500 }
    );
  }
}
