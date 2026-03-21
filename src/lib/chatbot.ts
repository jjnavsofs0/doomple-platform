import { createHash, randomInt } from "crypto";
import type { ChatbotIntent, LeadCategory, LeadPriority, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getKnowledgeContext } from "@/lib/chatbot-kb";
import { sendTransactionalEmail } from "@/lib/email";
import { getOpenAIChatModel, getOpenAIClient, isOpenAIConfigured } from "@/lib/openai";
import { notifyAdmins } from "@/lib/realtime";
import { recordAuditLog } from "@/lib/audit-log";

const DEFAULT_CHATBOT_SETTINGS = {
  enabled: true,
  assistantName: "Doomple AI Advisor",
  welcomeMessage:
    "Hi, welcome to Doomple. I can help you explore the right service or solution, answer questions, and guide you step by step if you'd like a proposal or callback.",
  systemPrompt:
    "You are Doomple's sales and support assistant. Be tactful, commercially sharp, concise, and trustworthy. Sound like a thoughtful business consultant, not a form. Answer the visitor's question first, give helpful direction, and then move the conversation forward naturally. Help visitors understand relevant services or solutions, move sales conversations toward lead capture, and handle support issues calmly. Never invent pricing, implementation guarantees, or product claims not present in the provided knowledge context.",
  salesObjective:
    "Qualify visitors, identify the best Doomple service or solution, and collect enough detail to create a strong lead for the sales team without making the conversation feel like a long intake form.",
  supportObjective:
    "If the visitor is an existing customer with an issue, identify them via email and OTP, then capture a support ticket with a clear summary and urgency.",
};

type ChatbotSettings = typeof DEFAULT_CHATBOT_SETTINGS;

type AssistantOutput = {
  reply: string;
  intent: ChatbotIntent;
  captured?: {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    requirements?: string;
    offeringType?: string;
    selectedService?: string;
    selectedSolution?: string;
    budgetRange?: string;
    timeline?: string;
    supportIssue?: string;
    priority?: string;
  };
  actions?: {
    shouldCreateLead?: boolean;
    shouldCreateTicket?: boolean;
    shouldSendOtp?: boolean;
    customerEmail?: string;
    leadCategory?: string;
    ticketSubject?: string;
    ticketPriority?: string;
  };
  missingFields?: string[];
};

function normalizeJsonText(value: string) {
  return value
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function extractJsonObject(value: string) {
  const normalized = normalizeJsonText(value);
  try {
    return JSON.parse(normalized) as AssistantOutput;
  } catch {
    const start = normalized.indexOf("{");
    const end = normalized.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(normalized.slice(start, end + 1)) as AssistantOutput;
    }
    throw new Error("The assistant response was not valid JSON.");
  }
}

function buildOtpCode() {
  return String(randomInt(100000, 1000000));
}

function hashOtp(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

function sanitizePhone(phone?: string | null) {
  const digits = String(phone || "").replace(/[^\d+]/g, "");
  return digits || null;
}

function normalizePriority(priority?: string | null): LeadPriority {
  const value = String(priority || "MEDIUM").toUpperCase();
  return value === "LOW" || value === "HIGH" || value === "URGENT" ? value : "MEDIUM";
}

function normalizeLeadCategory(category?: string | null): LeadCategory {
  const value = String(category || "SERVICE_INQUIRY").toUpperCase();
  const allowed: LeadCategory[] = [
    "SERVICE_INQUIRY",
    "SOLUTION_INQUIRY",
    "UEP_INQUIRY",
    "SAAS_TOOLKIT_INQUIRY",
    "WORKFORCE_INQUIRY",
    "SUPPORT_INQUIRY",
    "PARTNERSHIP_INQUIRY",
  ];
  return allowed.includes(value as LeadCategory) ? (value as LeadCategory) : "SERVICE_INQUIRY";
}

function isOtpCode(value: string) {
  return /^\d{6}$/.test(value.trim());
}

function buildTicketNumber(sequence: number) {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  return `DTK-${now.getFullYear()}${month}-${String(sequence).padStart(3, "0")}`;
}

export async function getChatbotSettings(): Promise<ChatbotSettings> {
  const row = await prisma.appSetting.findUnique({
    where: { key: "chatbot_assistant" },
  });

  return {
    ...DEFAULT_CHATBOT_SETTINGS,
    ...(row?.value as Partial<ChatbotSettings> | null),
  };
}

export async function getOrCreateChatbotConversation(params: {
  conversationId?: string | null;
  visitorId: string;
}) {
  if (params.conversationId) {
    const existing = await prisma.chatbotConversation.findUnique({
      where: { id: params.conversationId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          take: 20,
        },
        supportTicket: true,
      },
    });

    if (existing) {
      return existing;
    }
  }

  return prisma.chatbotConversation.create({
    data: {
      visitorId: params.visitorId,
    },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
      supportTicket: true,
    },
  });
}

async function createLeadFromConversation(params: {
  conversationId: string;
  fullName: string;
  email: string;
  phone?: string | null;
  companyName?: string | null;
  requirements: string;
  priority?: string | null;
  selectedService?: string | null;
  selectedSolution?: string | null;
  offeringType?: string | null;
  budgetRange?: string | null;
  timeline?: string | null;
  category?: string | null;
}) {
  const lead = await prisma.lead.create({
    data: {
      fullName: params.fullName,
      email: params.email,
      phone: sanitizePhone(params.phone),
      companyName: params.companyName || null,
      source: "WEBSITE",
      category: normalizeLeadCategory(params.category),
      priority: normalizePriority(params.priority),
      selectedService: params.selectedService || null,
      selectedSolution: params.selectedSolution || null,
      offeringType: params.offeringType || null,
      budgetRange: params.budgetRange || null,
      timeline: params.timeline || null,
      requirementsSummary: params.requirements,
      status: "NEW",
    },
  });

  await prisma.leadActivity.create({
    data: {
      leadId: lead.id,
      type: "CHATBOT_CAPTURED",
      description: "Lead captured by the website chatbot",
      metadata: {
        conversationId: params.conversationId,
      },
    },
  });

  await prisma.chatbotConversation.update({
    where: { id: params.conversationId },
    data: {
      leadId: lead.id,
      status: "LEAD_CAPTURED",
    },
  });

  await notifyAdmins({
    title: "Chatbot lead captured",
    message: `${lead.fullName} was qualified and captured by the website assistant.`,
    type: "LEAD",
    link: `/admin/leads/${lead.id}`,
    topics: ["leads", "notifications", "dashboard"],
    email: true,
    metadata: {
      leadId: lead.id,
      conversationId: params.conversationId,
    },
  });

  await recordAuditLog({
    entityType: "chatbot_conversation",
    entityId: params.conversationId,
    action: "lead_created",
    summary: `Chatbot created lead ${lead.fullName}`,
    metadata: {
      leadId: lead.id,
    },
  });

  return lead;
}

async function lookupExistingCustomer(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return null;
  }

  const client = await prisma.client.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      email: true,
      companyName: true,
      contactName: true,
      phone: true,
    },
  });

  if (client) {
    return client;
  }

  return null;
}

async function sendCustomerOtp(params: {
  conversationId: string;
  email: string;
  name?: string | null;
}) {
  const code = buildOtpCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.chatbotOtpRequest.create({
    data: {
      conversationId: params.conversationId,
      email: params.email,
      codeHash: hashOtp(code),
      expiresAt,
    },
  });

  await sendTransactionalEmail({
    to: [params.email],
    subject: "Your Doomple verification code",
    text: [
      `Hello${params.name ? ` ${params.name}` : ""},`,
      "",
      `Your Doomple customer verification code is ${code}.`,
      "It expires in 10 minutes.",
      "",
      "If you did not request this code, you can ignore this email.",
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;color:#0f172a">
        <p>Hello${params.name ? ` ${params.name}` : ""},</p>
        <p>Your Doomple customer verification code is:</p>
        <p style="font-size:28px;font-weight:700;letter-spacing:0.18em">${code}</p>
        <p>It expires in 10 minutes.</p>
      </div>
    `,
    replyTo: process.env.AWS_SES_REPLY_TO || undefined,
  });
}

async function verifyCustomerOtp(params: {
  conversationId: string;
  otpCode: string;
}) {
  const request = await prisma.chatbotOtpRequest.findFirst({
    where: {
      conversationId: params.conversationId,
      verifiedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!request) {
    return { success: false, error: "There is no active verification code. Ask me to send a new OTP." };
  }

  if (request.codeHash !== hashOtp(params.otpCode)) {
    await prisma.chatbotOtpRequest.update({
      where: { id: request.id },
      data: {
        attempts: {
          increment: 1,
        },
      },
    });
    return { success: false, error: "That OTP is not valid. Please try again." };
  }

  const client = await lookupExistingCustomer(request.email);
  if (!client) {
    return { success: false, error: "We could not match that email to an existing client record." };
  }

  await prisma.$transaction([
    prisma.chatbotOtpRequest.update({
      where: { id: request.id },
      data: {
        verifiedAt: new Date(),
      },
    }),
    prisma.chatbotConversation.update({
      where: { id: params.conversationId },
      data: {
        isCustomerVerified: true,
        verifiedAt: new Date(),
        visitorEmail: client.email,
        visitorName: client.contactName || client.companyName || client.email,
        visitorPhone: client.phone || undefined,
        companyName: client.companyName || undefined,
        clientId: client.id,
        status: "VERIFIED_CUSTOMER",
      },
    }),
  ]);

  return {
    success: true,
    client,
  };
}

async function createSupportTicket(params: {
  conversationId: string;
  subject: string;
  description: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone?: string | null;
  companyName?: string | null;
  clientId?: string | null;
  priority?: string | null;
}) {
  const count = await prisma.supportTicket.count();
  const ticket = await prisma.supportTicket.create({
    data: {
      ticketNumber: buildTicketNumber(count + 1),
      subject: params.subject,
      description: params.description,
      requesterName: params.requesterName,
      requesterEmail: params.requesterEmail,
      requesterPhone: sanitizePhone(params.requesterPhone),
      companyName: params.companyName || null,
      clientId: params.clientId || null,
      conversationId: params.conversationId,
      priority: normalizePriority(params.priority),
      source: "CHATBOT",
    },
  });

  await prisma.chatbotConversation.update({
    where: { id: params.conversationId },
    data: {
      status: "SUPPORT_CAPTURED",
    },
  });

  await notifyAdmins({
    title: "Chatbot support ticket created",
    message: `${ticket.ticketNumber} was opened through the website assistant.`,
    link: `/admin/tickets/${ticket.id}`,
    topics: ["notifications", "tickets"],
    email: true,
    metadata: {
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
    },
  });

  await recordAuditLog({
    entityType: "support_ticket",
    entityId: ticket.id,
    action: "created",
    summary: `Support ticket ${ticket.ticketNumber} created by chatbot`,
    metadata: {
      conversationId: params.conversationId,
    },
  });

  return ticket;
}

function buildPromptContext(params: {
  settings: ChatbotSettings;
  conversation: {
    visitorName?: string | null;
    visitorEmail?: string | null;
    visitorPhone?: string | null;
    companyName?: string | null;
    isCustomerVerified: boolean;
  };
  knowledge: Array<{ title: string; content: string }>;
  history: Array<{ role: string; content: string }>;
  message: string;
}) {
  return [
    params.settings.systemPrompt,
    `Primary sales objective: ${params.settings.salesObjective}`,
    `Primary support objective: ${params.settings.supportObjective}`,
    "Known visitor data:",
    JSON.stringify(
      {
        name: params.conversation.visitorName || null,
        email: params.conversation.visitorEmail || null,
        phone: params.conversation.visitorPhone || null,
        company: params.conversation.companyName || null,
        isCustomerVerified: params.conversation.isCustomerVerified,
      },
      null,
      2
    ),
    "Relevant knowledge snippets:",
    params.knowledge.length
      ? params.knowledge
          .map((item, index) => `#${index + 1} ${item.title}\n${item.content}`)
          .join("\n\n")
      : "No knowledge snippets were found.",
    "Conversation history:",
    params.history.length
      ? params.history.map((item) => `${item.role.toUpperCase()}: ${item.content}`).join("\n")
      : "No prior messages.",
    "Latest visitor message:",
    params.message,
    "Return ONLY valid JSON with this shape:",
    JSON.stringify(
      {
        reply: "string",
        intent: "GENERAL",
        captured: {
          name: "string|null",
          email: "string|null",
          phone: "string|null",
          company: "string|null",
          requirements: "string|null",
          offeringType: "string|null",
          selectedService: "string|null",
          selectedSolution: "string|null",
          budgetRange: "string|null",
          timeline: "string|null",
          supportIssue: "string|null",
          priority: "LOW|MEDIUM|HIGH|URGENT|null",
        },
        actions: {
          shouldCreateLead: false,
          shouldCreateTicket: false,
          shouldSendOtp: false,
          customerEmail: "string|null",
          leadCategory: "SERVICE_INQUIRY|SOLUTION_INQUIRY|UEP_INQUIRY|SAAS_TOOLKIT_INQUIRY|WORKFORCE_INQUIRY|SUPPORT_INQUIRY|PARTNERSHIP_INQUIRY|null",
          ticketSubject: "string|null",
          ticketPriority: "LOW|MEDIUM|HIGH|URGENT|null",
        },
        missingFields: ["string"],
      },
      null,
      2
    ),
    "Rules:",
    "- Keep the reply natural, tactful, and helpful.",
    "- Do not sound blunt, robotic, or overly process-driven.",
    "- Do not ask a long list of questions in one message.",
    "- Ask at most 1 or 2 focused follow-up questions at a time.",
    "- Follow phased discovery: first understand the broad need, then collect only the next most useful detail, then contact details when there is genuine buying intent.",
    "- If the visitor asks whether Doomple can help with something, answer that clearly first before collecting data.",
    "- When appropriate, suggest a likely-fit service or solution before asking for more details.",
    "- Prefer grouped, low-friction prompts like 'Could you share your name and best email?' instead of a long numbered checklist.",
    "- Once enough context exists, ask for the remaining essentials in the smallest possible next step.",
    "- For support issues from existing customers, ask for email verification via OTP before creating a linked ticket.",
    "- Set shouldCreateLead true only when you have at least name, email, and a meaningful requirement summary.",
    "- Set shouldCreateTicket true only when you have a clear support issue summary.",
    "- If the visitor mentions an existing client issue and provides an email, set shouldSendOtp true and customerEmail to that email.",
  ].join("\n\n");
}

async function runAssistant(params: {
  settings: ChatbotSettings;
  conversation: Awaited<ReturnType<typeof getOrCreateChatbotConversation>>;
  message: string;
}) {
  if (!isOpenAIConfigured()) {
    throw new Error("OpenAI is not configured. Set OPENAI_API_KEY before using the chatbot.");
  }

  const knowledge = await getKnowledgeContext(params.message);
  const history = params.conversation.messages.slice(-8).map((message) => ({
    role: message.role.toLowerCase(),
    content: message.content,
  }));
  const prompt = buildPromptContext({
    settings: params.settings,
    conversation: params.conversation,
    knowledge,
    history,
    message: params.message,
  });

  const client = getOpenAIClient();
  const response = await client.responses.create({
    model: getOpenAIChatModel(),
    input: prompt,
  });

  return extractJsonObject(response.output_text || "");
}

export async function handleChatbotMessage(params: {
  conversationId?: string | null;
  visitorId: string;
  message: string;
}) {
  const settings = await getChatbotSettings();
  if (!settings.enabled) {
    throw new Error("The chatbot is currently disabled.");
  }

  const conversation = await getOrCreateChatbotConversation({
    conversationId: params.conversationId,
    visitorId: params.visitorId,
  });

  await prisma.chatbotMessage.create({
    data: {
      conversationId: conversation.id,
      role: "USER",
      content: params.message,
    },
  });

  if (isOtpCode(params.message)) {
    const otpResult = await verifyCustomerOtp({
      conversationId: conversation.id,
      otpCode: params.message.trim(),
    });

    const otpReply = otpResult.success
      ? `Thanks. I verified your account${otpResult.client?.companyName ? ` for ${otpResult.client.companyName}` : ""}. I can now help create a support ticket for your issue. Please briefly describe the problem you’re facing.`
      : otpResult.error || "We could not verify that OTP. Please try again.";

    await prisma.chatbotMessage.create({
      data: {
        conversationId: conversation.id,
        role: "ASSISTANT",
        content: otpReply,
      },
    });

    return {
      conversationId: conversation.id,
      reply: otpReply,
      requiresOtp: !otpResult.success,
      isCustomerVerified: otpResult.success,
    };
  }

  const freshConversation = await getOrCreateChatbotConversation({
    conversationId: conversation.id,
    visitorId: params.visitorId,
  });

  const assistant = await runAssistant({
    settings,
    conversation: freshConversation,
    message: params.message,
  });

  const captured = assistant.captured || {};
  const actions = assistant.actions || {};
  const nextEmail = (captured.email || actions.customerEmail || freshConversation.visitorEmail || "").trim();
  const matchedClient = nextEmail ? await lookupExistingCustomer(nextEmail) : null;

  await prisma.chatbotConversation.update({
    where: { id: conversation.id },
    data: {
      intent: assistant.intent || "GENERAL",
      visitorName: captured.name || freshConversation.visitorName || undefined,
      visitorEmail: nextEmail || freshConversation.visitorEmail || undefined,
      visitorPhone: sanitizePhone(captured.phone) || freshConversation.visitorPhone || undefined,
      companyName: captured.company || freshConversation.companyName || undefined,
      summary: captured.requirements || captured.supportIssue || params.message,
      lastMessageAt: new Date(),
    },
  });

  let reply = assistant.reply || "How can I help you next?";
  let createdLeadId: string | null = null;
  let createdTicketId: string | null = null;
  let requiresOtp = false;

  if (
    actions.shouldSendOtp &&
    nextEmail &&
    matchedClient &&
    !freshConversation.isCustomerVerified
  ) {
    await sendCustomerOtp({
      conversationId: conversation.id,
      email: matchedClient.email,
      name: matchedClient.contactName || matchedClient.companyName || null,
    });

    requiresOtp = true;
    reply = `${reply}\n\nI found an existing client record for ${matchedClient.email}. I’ve emailed a 6-digit OTP. Please enter it here so I can securely create a support ticket for you.`;
  }

  if (
    actions.shouldCreateLead &&
    !freshConversation.leadId &&
    captured.name &&
    nextEmail &&
    captured.requirements
  ) {
    const lead = await createLeadFromConversation({
      conversationId: conversation.id,
      fullName: captured.name,
      email: nextEmail,
      phone: captured.phone,
      companyName: captured.company,
      requirements: captured.requirements,
      priority: captured.priority,
      selectedService: captured.selectedService,
      selectedSolution: captured.selectedSolution,
      offeringType: captured.offeringType,
      budgetRange: captured.budgetRange,
      timeline: captured.timeline,
      category: actions.leadCategory,
    });
    createdLeadId = lead.id;
    reply = `${reply}\n\nI’ve passed your details to our team as lead ${lead.id.slice(-6).toUpperCase()}. They can pick up the conversation with full context.`;
  }

  if (
    actions.shouldCreateTicket &&
    !freshConversation.supportTicket &&
    captured.supportIssue &&
    (freshConversation.isCustomerVerified || matchedClient?.id)
  ) {
    if (matchedClient && !freshConversation.isCustomerVerified) {
      await sendCustomerOtp({
        conversationId: conversation.id,
        email: matchedClient.email,
        name: matchedClient.contactName || matchedClient.companyName || null,
      });
      requiresOtp = true;
      reply = "Before I open a ticket against your account, please enter the 6-digit OTP I’ve sent to your email.";
    } else {
      const ticket = await createSupportTicket({
        conversationId: conversation.id,
        subject: actions.ticketSubject || "Client support request",
        description: captured.supportIssue,
        requesterName:
          captured.name ||
          freshConversation.visitorName ||
          matchedClient?.contactName ||
          matchedClient?.companyName ||
          nextEmail,
        requesterEmail: nextEmail,
        requesterPhone: captured.phone || freshConversation.visitorPhone,
        companyName: captured.company || freshConversation.companyName || matchedClient?.companyName,
        clientId: freshConversation.clientId || matchedClient?.id || null,
        priority: actions.ticketPriority || captured.priority,
      });
      createdTicketId = ticket.id;
      reply = `${reply}\n\nI’ve opened support ticket ${ticket.ticketNumber}. Our team can now continue from that record with the issue context attached.`;
    }
  }

  if (
    assistant.intent === "SUPPORT" &&
    !createdTicketId &&
    !requiresOtp &&
    !matchedClient &&
    captured.name &&
    nextEmail &&
    captured.supportIssue &&
    !freshConversation.leadId
  ) {
    const supportLead = await createLeadFromConversation({
      conversationId: conversation.id,
      fullName: captured.name,
      email: nextEmail,
      phone: captured.phone,
      companyName: captured.company,
      requirements: captured.supportIssue,
      priority: captured.priority,
      category: "SUPPORT_INQUIRY",
    });
    createdLeadId = supportLead.id;
    reply = `${reply}\n\nI couldn’t match that email to an existing client account, so I’ve routed this as a support inquiry for our team to follow up.`;
  }

  await prisma.chatbotMessage.create({
    data: {
      conversationId: conversation.id,
      role: "ASSISTANT",
      content: reply,
      metadata: {
        intent: assistant.intent,
        missingFields: assistant.missingFields || [],
        createdLeadId,
        createdTicketId,
        requiresOtp,
      } as Prisma.InputJsonValue,
    },
  });

  return {
    conversationId: conversation.id,
    reply,
    requiresOtp,
    createdLeadId,
    createdTicketId,
    isCustomerVerified: freshConversation.isCustomerVerified,
  };
}

export async function getRecentChatbotConversations(limit = 20) {
  return prisma.chatbotConversation.findMany({
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      lead: {
        select: {
          id: true,
          fullName: true,
          status: true,
        },
      },
      supportTicket: {
        select: {
          id: true,
          ticketNumber: true,
          status: true,
        },
      },
      client: {
        select: {
          id: true,
          companyName: true,
          contactName: true,
        },
      },
    },
    orderBy: { lastMessageAt: "desc" },
    take: limit,
  });
}

export async function getChatbotDashboardData() {
  const [knowledgeDocuments, conversations, tickets, settings] = await Promise.all([
    prisma.chatbotKnowledgeDocument.findMany({
      include: {
        _count: {
          select: {
            chunks: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 50,
    }),
    getRecentChatbotConversations(20),
    prisma.supportTicket.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    getChatbotSettings(),
  ]);

  return {
    settings,
    knowledgeDocuments,
    conversations,
    tickets,
  };
}
