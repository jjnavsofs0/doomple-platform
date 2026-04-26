import { createHash, randomInt } from "crypto";
import type { ChatbotIntent, LeadCategory, LeadPriority, Prisma } from "@prisma/client";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getChatbotVectorStore, getKnowledgeContext } from "@/lib/chatbot-kb";
import { sendTransactionalEmail } from "@/lib/email";
import { getOpenAIChatModel, getOpenAIClient, isOpenAIConfigured } from "@/lib/openai";
import { notifyAdmins } from "@/lib/realtime";
import { recordAuditLog } from "@/lib/audit-log";
import { truncate } from "@/lib/utils";

const DEFAULT_CHATBOT_SETTINGS = {
  enabled: true,
  assistantName: "Doomple AI Advisor",
  welcomeMessage:
    "Hi, welcome to Doomple. Tell me a bit about what you're looking to build or improve, and I'll help you figure out the right next step.",
  systemPrompt:
    "You are Doomple's sales and support assistant. Be tactful, commercially sharp, concise, and trustworthy. Sound like a thoughtful business consultant, not a form. Keep replies short and easy to answer, usually 1 to 2 short sentences unless the visitor asks for more detail. Each message should carry one clear intent and usually one clear ask. Answer the visitor's question first, give helpful direction, and then move the conversation forward naturally. Help visitors understand relevant services or solutions, move sales conversations toward lead capture in phases, and handle support issues calmly. Never invent pricing, implementation guarantees, or product claims not present in the provided knowledge context.",
  salesObjective:
    "Qualify visitors, identify the best Doomple service or solution, and collect enough detail to create a strong lead for the sales team without making the conversation feel like a long intake form. Gather details in phased, low-friction steps.",
  supportObjective:
    "If the visitor is an existing customer with an issue, identify them via email and OTP, then capture a support ticket with a clear summary and urgency.",
};

type ChatbotSettings = typeof DEFAULT_CHATBOT_SETTINGS;

const assistantOutputSchema = z.object({
  reply: z.string().default(""),
  intent: z.enum(["GENERAL", "SALES", "SUPPORT"]).default("GENERAL"),
  captured: z
    .object({
      name: z.string().nullable().optional(),
      email: z.string().nullable().optional(),
      phone: z.string().nullable().optional(),
      company: z.string().nullable().optional(),
      requirements: z.string().nullable().optional(),
      offeringType: z.string().nullable().optional(),
      selectedService: z.string().nullable().optional(),
      selectedSolution: z.string().nullable().optional(),
      budgetRange: z.string().nullable().optional(),
      timeline: z.string().nullable().optional(),
      supportIssue: z.string().nullable().optional(),
      priority: z.string().nullable().optional(),
    })
    .default({}),
  actions: z
    .object({
      shouldCreateLead: z.boolean().optional(),
      shouldCreateTicket: z.boolean().optional(),
      shouldSendOtp: z.boolean().optional(),
      customerEmail: z.string().nullable().optional(),
      leadCategory: z
        .enum([
          "SERVICE_INQUIRY",
          "SOLUTION_INQUIRY",
          "UEP_INQUIRY",
          "SAAS_TOOLKIT_INQUIRY",
          "WORKFORCE_INQUIRY",
          "SUPPORT_INQUIRY",
          "PARTNERSHIP_INQUIRY",
        ])
        .nullable()
        .optional(),
      ticketSubject: z.string().nullable().optional(),
      ticketPriority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).nullable().optional(),
    })
    .default({}),
  missingFields: z.array(z.string()).default([]),
});

type AssistantOutput = z.infer<typeof assistantOutputSchema>;

const EMAIL_ONLY_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const PHONE_ONLY_PATTERN = /^[+()\d\s-]{7,}$/;
const SALES_SCOPE_KEYWORDS = [
  "doomple",
  "service",
  "solution",
  "project",
  "build",
  "develop",
  "website",
  "web app",
  "portal",
  "dashboard",
  "platform",
  "mobile app",
  "ios",
  "android",
  "backend",
  "api",
  "integration",
  "automation",
  "agentic ai",
  "ai agent",
  "ai agents",
  "workflow agent",
  "whatsapp agent",
  "document agent",
  "proposal agent",
  "lead agent",
  "crm",
  "erp",
  "ai",
  "analytics",
  "data",
  "pipeline",
  "saas",
  "ecommerce",
  "devops",
  "kubernetes",
  "cloud",
  "migration",
  "quote",
  "estimate",
  "proposal",
  "consultation",
  "demo",
  "team",
];
const SUPPORT_ISSUE_KEYWORDS = [
  "bug",
  "issue",
  "error",
  "problem",
  "broken",
  "failing",
  "failure",
  "incident",
  "ticket",
  "payment",
  "invoice",
  "portal",
  "webhook",
  "login",
  "downtime",
  "support",
  "fix",
  "triage",
  "qa",
];
const EXISTING_CUSTOMER_KEYWORDS = [
  "existing customer",
  "existing client",
  "current client",
  "our doomple",
  "your team built",
  "you built",
  "our account",
  "our portal",
  "our invoice",
  "our project with doomple",
  "already a client",
  "already your customer",
];
const BUYING_INTENT_KEYWORDS = [
  "consultation",
  "consult",
  "schedule",
  "book",
  "proposal",
  "quote",
  "estimate",
  "pricing",
  "cost",
  "budget",
  "timeline",
  "next step",
  "talk to",
  "speak to",
  "call",
  "demo",
];
const DISCOVERY_DEFERRAL_PATTERNS = [
  "rest we can discuss later",
  "rest we can discuss",
  "discuss later",
  "share later",
  "project finalisation",
  "project finalization",
  "later stage",
];
const DELIVERABLE_REQUEST_VERBS = [
  "write",
  "generate",
  "create",
  "draft",
  "make",
  "build me",
  "give me",
  "provide",
  "show me",
  "send me",
];
const DELIVERABLE_KEYWORDS = [
  "yaml",
  "yml",
  "manifest",
  "kubernetes",
  "dockerfile",
  "code",
  "script",
  "function",
  "component",
  "sql",
  "query",
  "regex",
  "prompt",
  "blog",
  "article",
  "essay",
  "tweet",
  "email copy",
  "caption",
];
const GENERAL_ASSISTANT_PATTERNS = [
  "tell me a joke",
  "write a poem",
  "write a story",
  "translate this",
  "summarize this",
  "improve my grammar",
  "who is ",
  "what is ",
  "explain ",
  "recipe",
];
const HARD_GUARDRAILS = [
  "You are not a general-purpose assistant or substitute for ChatGPT.",
  "Stay strictly inside Doomple sales, delivery qualification, and support workflows.",
  "Do not generate code, YAML, configs, scripts, architecture files, essays, social copy, prompts, or other work product for the visitor.",
  "If the visitor asks for general-purpose help or implementation artifacts, briefly refuse and redirect to project scoping or support.",
  "Treat bug-fix, QA, rescue, remediation, and modernization requests for non-Doomple projects as sales inquiries unless the visitor clearly says they are an existing Doomple customer.",
  "Once you understand the project type and the main goal or pain point, stop extending discovery and ask for the minimum lead handoff details.",
  "For sales handoff, prefer asking only for name and best email in one short message.",
];

const AGENTIC_AI_PLAYBOOK = [
  "Doomple service: Agentic AI Automation.",
  "Positioning: secure AI agents that execute repeatable business workflows across WhatsApp, email, CRM, spreadsheets, documents, accounting tools, ad platforms, CMS, and internal systems with human approval where risk is high.",
  "Best first-agent rule: recommend one narrow workflow where inputs are repetitive, outputs are reviewable, and success can be measured in saved hours, faster response time, fewer missed follow-ups, or lower rework.",
  "Common first pilots: WhatsApp lead qualification, document classification and extraction, invoice/GST reconciliation prep, proposal or quote drafting, meeting notes to follow-ups, weekly regulatory or competitor briefing, campaign reporting, SEO content-decay alerts, vendor quote comparison, and event vendor/RFP tracking.",
  "Audience mapping: CAs often fit GST/document/notice-response agents; lawyers fit intake, research, and contract-review support; traders and distributors fit vendor comparison, reconciliation, and demand/signal briefs; advertisers fit reporting, creative-variant, and lead-nurture agents; SEO agencies fit content pipeline, technical SEO, and refresh-alert agents; event planners fit vendor procurement, timelines, and attendee personalization agents; SMEs fit WhatsApp lead, support, invoice/OCR, hiring, and founder chief-of-staff agents.",
  "Safe architecture to mention when relevant: knowledge base, tool permissions, role-based access, action logs, human approval checkpoints, fallback paths, monitoring, and continuous improvement.",
  "Discovery flow for Agentic AI: first ask what workflow they hate repeating or want to speed up; then identify current tools/channels involved; then ask what action the agent should prepare or execute; then ask what must stay human-approved; then ask for name and best email if they want a pilot or consultation.",
  "Decision help: if the workflow touches money, legal commitments, tax filings, customer promises, or regulated decisions, recommend a human-in-the-loop pilot instead of full autonomy.",
  "Do not promise fixed ROI, autonomous execution, legal/tax/financial advice, or guaranteed accuracy. Frame outcomes as measurable pilot goals.",
].join("\n");

function getNonEmptyString(value: unknown, fallback: string) {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : fallback;
}

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

function normalizeIntentText(value?: string | null) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function containsAny(text: string, values: string[]) {
  return values.some((value) => text.includes(value));
}

function looksLikeStandaloneEmail(value?: string | null) {
  return EMAIL_ONLY_PATTERN.test(String(value || "").trim());
}

function looksLikeStandalonePhone(value?: string | null) {
  const trimmed = String(value || "").trim();
  return trimmed.length >= 7 && PHONE_ONLY_PATTERN.test(trimmed) && /\d/.test(trimmed);
}

function hasProjectScopeSignal(value?: string | null) {
  const text = normalizeIntentText(value);
  return (
    containsAny(text, SALES_SCOPE_KEYWORDS) ||
    /\b(build|launch|create|develop|fix|improve|automate|migrate|integrate|redesign|set up|setup|scale|audit)\b/.test(
      text
    )
  );
}

function hasSupportIssueSignal(value?: string | null) {
  return containsAny(normalizeIntentText(value), SUPPORT_ISSUE_KEYWORDS);
}

function hasExistingCustomerSignal(value?: string | null) {
  return containsAny(normalizeIntentText(value), EXISTING_CUSTOMER_KEYWORDS);
}

function hasBuyingIntentSignal(value?: string | null) {
  return containsAny(normalizeIntentText(value), BUYING_INTENT_KEYWORDS);
}

function isLikelyDeliverableRequest(value?: string | null) {
  const raw = String(value || "");
  const text = normalizeIntentText(raw);
  const asksToProduce =
    containsAny(text, DELIVERABLE_REQUEST_VERBS) ||
    /(can you|could you|please|pls)\b/.test(text);
  const mentionsDeliverable = containsAny(text, DELIVERABLE_KEYWORDS) || raw.includes("```");

  return asksToProduce && mentionsDeliverable;
}

function isLikelyGenericAssistantPrompt(value?: string | null) {
  const text = normalizeIntentText(value);
  if (!text) {
    return false;
  }

  if (isLikelyDeliverableRequest(text)) {
    return true;
  }

  return (
    containsAny(text, GENERAL_ASSISTANT_PATTERNS) &&
    !hasProjectScopeSignal(text) &&
    !hasSupportIssueSignal(text)
  );
}

function looksLikeImplementationArtifact(value?: string | null) {
  const raw = String(value || "");
  const text = normalizeIntentText(raw);

  return (
    raw.includes("```") ||
    /\b(apiVersion:|kind:|metadata:|SELECT\b|INSERT\b|UPDATE\b|function\s+\w+|const\s+\w+\s*=|<html)\b/i.test(
      raw
    ) ||
    (containsAny(text, DELIVERABLE_KEYWORDS) && raw.length > 180)
  );
}

function hasMeaningfulRequirement(value?: string | null) {
  const text = String(value || "").trim();
  return (
    text.length >= 20 &&
    !looksLikeStandaloneEmail(text) &&
    !looksLikeStandalonePhone(text) &&
    !isOtpCode(text)
  );
}

function getConversationUserMessages(
  conversation: Awaited<ReturnType<typeof getOrCreateChatbotConversation>>
) {
  return conversation.messages
    .filter((message) => message.role === "USER")
    .map((message) => message.content);
}

function extractRequirementSummary(params: {
  userMessages: string[];
  capturedRequirements?: string | null;
  capturedSupportIssue?: string | null;
  existingSummary?: string | null;
}) {
  if (hasMeaningfulRequirement(params.capturedRequirements)) {
    return params.capturedRequirements!.trim();
  }

  if (hasMeaningfulRequirement(params.capturedSupportIssue)) {
    return params.capturedSupportIssue!.trim();
  }

  const meaningfulMessages = params.userMessages.filter((message) => {
    const trimmed = message.trim();
    if (
      !trimmed ||
      isOtpCode(trimmed) ||
      looksLikeStandaloneEmail(trimmed) ||
      looksLikeStandalonePhone(trimmed) ||
      isLikelyGenericAssistantPrompt(trimmed)
    ) {
      return false;
    }

    if (trimmed.split(/\s+/).length < 3) {
      return false;
    }

    return hasProjectScopeSignal(trimmed) || hasSupportIssueSignal(trimmed) || hasBuyingIntentSignal(trimmed);
  });

  if (meaningfulMessages.length) {
    return truncate(meaningfulMessages.slice(0, 3).join(" ").replace(/\s+/g, " ").trim(), 280);
  }

  return hasMeaningfulRequirement(params.existingSummary) ? params.existingSummary!.trim() : null;
}

function isSupportConversation(params: {
  assistantIntent: ChatbotIntent;
  conversation: Awaited<ReturnType<typeof getOrCreateChatbotConversation>>;
  latestMessage: string;
  userMessages: string[];
  matchedClient: Awaited<ReturnType<typeof lookupExistingCustomer>>;
}) {
  const combinedVisitorText = params.userMessages.join(" ");
  const supportSignal =
    hasSupportIssueSignal(params.latestMessage) ||
    hasSupportIssueSignal(combinedVisitorText) ||
    params.assistantIntent === "SUPPORT";

  if (params.conversation.isCustomerVerified) {
    return true;
  }

  if (params.matchedClient?.id && supportSignal) {
    return true;
  }

  if (hasExistingCustomerSignal(params.latestMessage) || hasExistingCustomerSignal(combinedVisitorText)) {
    return true;
  }

  return supportSignal && hasExistingCustomerSignal(combinedVisitorText);
}

function isSalesConversation(params: {
  assistantIntent: ChatbotIntent;
  latestMessage: string;
  userMessages: string[];
  supportConversation: boolean;
}) {
  if (params.supportConversation) {
    return false;
  }

  if (params.assistantIntent === "SALES") {
    return true;
  }

  const combinedVisitorText = params.userMessages.join(" ");
  return (
    hasProjectScopeSignal(params.latestMessage) ||
    hasProjectScopeSignal(combinedVisitorText) ||
    hasBuyingIntentSignal(params.latestMessage) ||
    hasBuyingIntentSignal(combinedVisitorText) ||
    hasSupportIssueSignal(combinedVisitorText)
  );
}

function shouldFastTrackLeadCapture(params: {
  userMessages: string[];
  latestMessage: string;
  requirementsSummary?: string | null;
  supportConversation: boolean;
  resolvedName?: string | null;
  resolvedEmail?: string | null;
}) {
  if (params.supportConversation) {
    return false;
  }

  if (params.resolvedName && params.resolvedEmail) {
    return false;
  }

  if (!hasMeaningfulRequirement(params.requirementsSummary)) {
    return false;
  }

  const latestText = normalizeIntentText(params.latestMessage);
  const userTurnCount = params.userMessages.length;
  const hasBuyingIntent = params.userMessages.some((message) => hasBuyingIntentSignal(message));

  return (
    hasBuyingIntent ||
    containsAny(latestText, DISCOVERY_DEFERRAL_PATTERNS) ||
    userTurnCount >= 3
  );
}

function buildLeadCaptureReply(params: {
  resolvedName?: string | null;
  resolvedEmail?: string | null;
}) {
  if (params.resolvedName && params.resolvedEmail) {
    return "This looks like a fit. I have what I need to line up the right next step.";
  }

  if (!params.resolvedName && !params.resolvedEmail) {
    return "This looks like a fit. Share your name and best email, and I’ll line up the right next step.";
  }

  if (!params.resolvedEmail) {
    return "This looks like a fit. Share your best email, and I’ll line up the right next step.";
  }

  return "This looks like a fit. Share your name, and I’ll line up the right next step.";
}

function buildOutOfScopeReply(params: {
  hasEstablishedScope: boolean;
  resolvedName?: string | null;
  resolvedEmail?: string | null;
}) {
  if (params.hasEstablishedScope) {
    return buildLeadCaptureReply(params).replace(
      "This looks like a fit.",
      "I can help scope the Doomple work, but I can’t generate implementation files here."
    );
  }

  return "I’m here to help with Doomple projects and support, not general-purpose prompts. Tell me what you want to build, improve, or fix.";
}

function tightenAssistantReply(reply: string) {
  const normalized = reply.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "How can I help you next?";
  }

  const sentences = normalized.split(/(?<=[.!?])\s+/).filter(Boolean);
  let compact = sentences.slice(0, 2).join(" ").trim();

  const firstQuestionIndex = compact.indexOf("?");
  if (firstQuestionIndex >= 0) {
    compact = compact.slice(0, firstQuestionIndex + 1).trim();
  }

  return compact || normalized;
}

export function buildTicketNumber(sequence: number) {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  return `DTK-${now.getFullYear()}${month}-${String(sequence).padStart(3, "0")}`;
}

function getConversationTitle(params: {
  summary?: string | null;
  visitorName?: string | null;
  visitorEmail?: string | null;
  supportTicketNumber?: string | null;
  latestMessage?: string | null;
}) {
  if (params.summary?.trim()) {
    return truncate(params.summary.trim(), 48);
  }

  if (params.latestMessage?.trim()) {
    return truncate(params.latestMessage.trim(), 48);
  }

  if (params.supportTicketNumber) {
    return `Support ${params.supportTicketNumber}`;
  }

  if (params.visitorName?.trim()) {
    return params.visitorName.trim();
  }

  if (params.visitorEmail?.trim()) {
    return params.visitorEmail.trim();
  }

  return "New conversation";
}

export async function getChatbotSettings(): Promise<ChatbotSettings> {
  const row = await prisma.appSetting.findUnique({
    where: { key: "chatbot_assistant" },
  });

  const value = (row?.value as Partial<ChatbotSettings> | null) || null;

  return {
    enabled: value?.enabled ?? DEFAULT_CHATBOT_SETTINGS.enabled,
    assistantName: getNonEmptyString(
      value?.assistantName,
      DEFAULT_CHATBOT_SETTINGS.assistantName
    ),
    welcomeMessage: getNonEmptyString(
      value?.welcomeMessage,
      DEFAULT_CHATBOT_SETTINGS.welcomeMessage
    ),
    systemPrompt: getNonEmptyString(
      value?.systemPrompt,
      DEFAULT_CHATBOT_SETTINGS.systemPrompt
    ),
    salesObjective: getNonEmptyString(
      value?.salesObjective,
      DEFAULT_CHATBOT_SETTINGS.salesObjective
    ),
    supportObjective: getNonEmptyString(
      value?.supportObjective,
      DEFAULT_CHATBOT_SETTINGS.supportObjective
    ),
  };
}

export async function getOrCreateChatbotConversation(params: {
  conversationId?: string | null;
  visitorId: string;
}) {
  if (params.conversationId) {
    const existing = await prisma.chatbotConversation.findFirst({
      where: {
        id: params.conversationId,
        visitorId: params.visitorId,
      },
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

export async function createChatbotConversation(visitorId: string) {
  return prisma.chatbotConversation.create({
    data: {
      visitorId,
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
    issueContext: {
      title: "Chatbot OTP email failed",
      severity: "ERROR",
      area: "chatbot.otp-email.send",
      metadata: {
        conversationId: params.conversationId,
        email: params.email,
      },
    },
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
    "<role_guidance>",
    params.settings.systemPrompt,
    ...HARD_GUARDRAILS,
    `Primary sales objective: ${params.settings.salesObjective}`,
    `Primary support objective: ${params.settings.supportObjective}`,
    "</role_guidance>",
    "<known_visitor_data>",
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
    "</known_visitor_data>",
    "<knowledge_context>",
    params.knowledge.length
      ? params.knowledge
          .map((item, index) => `#${index + 1} ${item.title}\n${item.content}`)
          .join("\n\n")
      : "No knowledge snippets were found.",
    "</knowledge_context>",
    "<agentic_ai_playbook>",
    AGENTIC_AI_PLAYBOOK,
    "</agentic_ai_playbook>",
    "<conversation_history>",
    params.history.length
      ? params.history.map((item) => `${item.role.toUpperCase()}: ${item.content}`).join("\n")
      : "No prior messages.",
    "</conversation_history>",
    "<latest_visitor_message>",
    params.message,
    "</latest_visitor_message>",
    "<output_contract>",
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
    "</output_contract>",
    "<rules>",
    "- Keep the reply natural, tactful, and helpful.",
    "- Do not sound blunt, robotic, or overly process-driven.",
    "- Keep most replies to 1 or 2 short sentences unless the visitor asks for detail.",
    "- Never act like a general-purpose assistant.",
    "- Each message should have one clear intent only: answer, qualify, verify, or ask for the next detail.",
    "- Ask for only one thing at a time.",
    "- Ask at most one focused question in a message.",
    "- Do not stack multiple requests with words like 'also', 'while you wait', or 'and one more thing'.",
    "- Follow phased discovery: first understand the broad need, then collect only the next most useful detail, then contact details when there is genuine buying intent.",
    "- Never turn the conversation into a questionnaire or numbered intake form unless the visitor explicitly asks for a checklist.",
    "- Do not ask for name, email, phone, and company all at once at the start of a sales conversation.",
    "- Once you know the project type and the main goal or pain point, stop stretching discovery and ask for name plus best email.",
    "- For new sales inquiries, ask for contact details only after you understand the project well enough to give direction or the visitor clearly wants a proposal, estimate, or callback.",
    "- Ask for budget and timeline later in the conversation, after the project scope is clearer.",
    "- If the visitor asks whether Doomple can help with something, answer that clearly first before collecting data.",
    "- When appropriate, suggest a likely-fit service or solution before asking for more details.",
    "- For Agentic AI inquiries, help the visitor decide whether their workflow is a good first-agent candidate. Focus on one workflow, tools involved, review/approval needs, and measurable outcome.",
    "- For Agentic AI inquiries, suggest a relevant first pilot based on their profession or business type, then ask only one focused next question.",
    "- For Agentic AI inquiries, prefer practical language like 'workflow agent', 'WhatsApp lead agent', 'document ops agent', or 'proposal agent' over abstract AI jargon.",
    "- If the visitor asks whether an AI agent can fully replace a person for legal, tax, finance, trading, or customer-commitment decisions, recommend human review and approval rather than full autonomy.",
    "- Prefer grouped, low-friction prompts like 'Could you share your name and best email?' instead of a long numbered checklist.",
    "- Once enough context exists, ask for the remaining essentials in the smallest possible next step.",
    "- If the visitor asks for an estimate or recommendation, give a directional answer first, then ask only the next 1 or 2 highest-leverage details needed to refine it.",
    "- For mobile app inquiries, use this flow: first confirm Doomple can help and ask whether it is a new app or an existing product plus target platform; next ask for 2 to 4 core features or key user flows and any must-have integrations; later ask about users or scale, then timeline or budget; only after that ask for contact details if the visitor wants a proposal or follow-up.",
    "- Good example for a mobile app inquiry: 'Yes, we can help with custom mobile app development. Is this a new app or an existing product, and are you targeting iOS, Android, or both?'",
    "- Good second-step example: 'Helpful. What are the main things users need to do in the app, and do you need any integrations like payments, auth, or an existing backend?'",
    "- Good later-step example: 'That sounds like a strong fit. If you'd like, share your name and best email and I can recommend the best engagement model and next step.'",
    "- If the visitor asks for code, YAML, scripts, configs, or other implementation artifacts, do not provide them. Briefly say you can help scope the work and then ask for the next business detail.",
    "- If the visitor asks for general knowledge, jokes, writing, or other off-topic help, politely redirect them to Doomple project or support needs.",
    "- If a visitor says their own project has bugs or needs rescue work, treat that as a service inquiry unless they clearly say they are an existing Doomple customer.",
    "- For support issues from existing customers, ask for email verification via OTP before creating a linked ticket.",
    "- If you ask for email verification or OTP, do not ask for platform, bug details, urgency, or any other detail in the same message.",
    "- After verification, ask for the single most useful next detail only. For example, ask for the main bug first, then ask platform in the next turn if still needed.",
    "- Set shouldCreateLead true only when you have at least name, email, and a meaningful requirement summary.",
    "- Set shouldCreateTicket true only when you have a clear support issue summary.",
    "- If the visitor mentions an existing client issue and provides an email, set shouldSendOtp true and customerEmail to that email.",
    "</rules>",
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
  const history = params.conversation.messages
    .slice(0, -1)
    .slice(-8)
    .map((message) => ({
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
  let output: AssistantOutput;

  try {
    const response = await client.responses.parse({
      model: getOpenAIChatModel(),
      input: prompt,
      text: {
        format: zodTextFormat(assistantOutputSchema, "doomple_chatbot_output"),
      },
    });

    output = assistantOutputSchema.parse(
      response.output_parsed || extractJsonObject(response.output_text || "")
    );
  } catch {
    const response = await client.responses.create({
      model: getOpenAIChatModel(),
      input: prompt,
    });

    output = assistantOutputSchema.parse(extractJsonObject(response.output_text || ""));
  }

  output.reply = tightenAssistantReply(output.reply || "");
  return output;
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
      ? `You're verified${otpResult.client?.companyName ? ` for ${otpResult.client.companyName}` : ""}. Briefly describe the issue.`
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

  const userMessages = getConversationUserMessages(freshConversation);
  const preModelRequirementSummary = extractRequirementSummary({
    userMessages,
    existingSummary: freshConversation.summary,
  });
  const hasEstablishedScope = hasMeaningfulRequirement(preModelRequirementSummary);

  if (isLikelyDeliverableRequest(params.message) || (!hasEstablishedScope && isLikelyGenericAssistantPrompt(params.message))) {
    let createdLeadId: string | null = null;
    let reply = buildOutOfScopeReply({
      hasEstablishedScope,
      resolvedName: freshConversation.visitorName,
      resolvedEmail: freshConversation.visitorEmail,
    });

    if (
      !freshConversation.leadId &&
      freshConversation.visitorName &&
      freshConversation.visitorEmail &&
      hasMeaningfulRequirement(preModelRequirementSummary)
    ) {
      const lead = await createLeadFromConversation({
        conversationId: conversation.id,
        fullName: freshConversation.visitorName,
        email: freshConversation.visitorEmail,
        phone: freshConversation.visitorPhone,
        companyName: freshConversation.companyName,
        requirements: preModelRequirementSummary!,
      });
      createdLeadId = lead.id;
      reply = `I can’t generate implementation files here, but I’ve shared your project with our team as lead ${lead.id.slice(-6).toUpperCase()}.`;
    }

    await prisma.chatbotConversation.update({
      where: { id: conversation.id },
      data: {
        intent: hasEstablishedScope ? "SALES" : "GENERAL",
        summary: preModelRequirementSummary || freshConversation.summary || undefined,
        lastMessageAt: new Date(),
      },
    });

    await prisma.chatbotMessage.create({
      data: {
        conversationId: conversation.id,
        role: "ASSISTANT",
        content: reply,
        metadata: {
          intent: hasEstablishedScope ? "SALES" : "GENERAL",
          guardrail: "out_of_scope_redirect",
          createdLeadId,
        } as Prisma.InputJsonValue,
      },
    });

    return {
      conversationId: conversation.id,
      reply,
      requiresOtp: false,
      createdLeadId,
      createdTicketId: null,
      isCustomerVerified: freshConversation.isCustomerVerified,
    };
  }

  const assistant = await runAssistant({
    settings,
    conversation: freshConversation,
    message: params.message,
  });

  const captured = assistant.captured || {};
  const actions = assistant.actions || {};
  const resolvedName = captured.name?.trim() || freshConversation.visitorName || null;
  const nextEmail = (captured.email || actions.customerEmail || freshConversation.visitorEmail || "").trim();
  const resolvedPhone = sanitizePhone(captured.phone) || freshConversation.visitorPhone || null;
  const resolvedCompany = captured.company?.trim() || freshConversation.companyName || null;
  const matchedClient = nextEmail ? await lookupExistingCustomer(nextEmail) : null;
  const requirementSummary = extractRequirementSummary({
    userMessages,
    capturedRequirements: captured.requirements,
    capturedSupportIssue: captured.supportIssue,
    existingSummary: freshConversation.summary,
  });
  const supportConversation = isSupportConversation({
    assistantIntent: assistant.intent || "GENERAL",
    conversation: freshConversation,
    latestMessage: params.message,
    userMessages,
    matchedClient,
  });
  const salesConversation = isSalesConversation({
    assistantIntent: assistant.intent || "GENERAL",
    latestMessage: params.message,
    userMessages,
    supportConversation,
  });
  const resolvedIntent: ChatbotIntent = supportConversation
    ? "SUPPORT"
    : salesConversation
      ? "SALES"
      : assistant.intent || "GENERAL";
  const resolvedSupportIssue =
    captured.supportIssue?.trim() ||
    (supportConversation && hasMeaningfulRequirement(requirementSummary) ? requirementSummary : null);
  const fastTrackLeadCapture = shouldFastTrackLeadCapture({
    userMessages,
    latestMessage: params.message,
    requirementsSummary: requirementSummary,
    supportConversation,
    resolvedName,
    resolvedEmail: nextEmail,
  });

  await prisma.chatbotConversation.update({
    where: { id: conversation.id },
    data: {
      intent: resolvedIntent,
      visitorName: resolvedName || undefined,
      visitorEmail: nextEmail || freshConversation.visitorEmail || undefined,
      visitorPhone: resolvedPhone || undefined,
      companyName: resolvedCompany || undefined,
      summary: requirementSummary || freshConversation.summary || undefined,
      lastMessageAt: new Date(),
    },
  });

  let reply = assistant.reply || "How can I help you next?";
  let createdLeadId: string | null = null;
  let createdTicketId: string | null = null;
  let requiresOtp = false;

  if (looksLikeImplementationArtifact(reply)) {
    reply = buildOutOfScopeReply({
      hasEstablishedScope: salesConversation || hasMeaningfulRequirement(requirementSummary),
      resolvedName,
      resolvedEmail: nextEmail,
    });
  }

  if (
    actions.shouldSendOtp &&
    nextEmail &&
    matchedClient &&
    !freshConversation.isCustomerVerified &&
    supportConversation
  ) {
    await sendCustomerOtp({
      conversationId: conversation.id,
      email: matchedClient.email,
      name: matchedClient.contactName || matchedClient.companyName || null,
    });

    requiresOtp = true;
    reply = `I found your client record for ${matchedClient.email} and emailed a 6-digit OTP. Enter it here to continue.`;
  }

  if (
    !requiresOtp &&
    fastTrackLeadCapture &&
    (!resolvedName || !nextEmail)
  ) {
    reply = buildLeadCaptureReply({
      resolvedName,
      resolvedEmail: nextEmail,
    });
  }

  if (
    !freshConversation.leadId &&
    resolvedIntent === "SALES" &&
    resolvedName &&
    nextEmail &&
    requirementSummary &&
    (actions.shouldCreateLead || fastTrackLeadCapture || userMessages.some((message) => hasBuyingIntentSignal(message)))
  ) {
    const lead = await createLeadFromConversation({
      conversationId: conversation.id,
      fullName: resolvedName,
      email: nextEmail,
      phone: resolvedPhone,
      companyName: resolvedCompany,
      requirements: requirementSummary,
      priority: captured.priority,
      selectedService: captured.selectedService,
      selectedSolution: captured.selectedSolution,
      offeringType: captured.offeringType,
      budgetRange: captured.budgetRange,
      timeline: captured.timeline,
      category: actions.leadCategory,
    });
    createdLeadId = lead.id;
    reply = `I’ve shared this with our team as lead ${lead.id.slice(-6).toUpperCase()}.`;
  }

  if (
    actions.shouldCreateTicket &&
    !freshConversation.supportTicket &&
    resolvedSupportIssue &&
    supportConversation &&
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
        description: resolvedSupportIssue,
        requesterName:
          resolvedName ||
          freshConversation.visitorName ||
          matchedClient?.contactName ||
          matchedClient?.companyName ||
          nextEmail,
        requesterEmail: nextEmail,
        requesterPhone: resolvedPhone || freshConversation.visitorPhone,
        companyName: resolvedCompany || freshConversation.companyName || matchedClient?.companyName,
        clientId: freshConversation.clientId || matchedClient?.id || null,
        priority: actions.ticketPriority || captured.priority,
      });
      createdTicketId = ticket.id;
      reply = `I’ve opened support ticket ${ticket.ticketNumber}. Our team now has the issue context.`;
    }
  }

  if (
    resolvedIntent === "SUPPORT" &&
    !createdTicketId &&
    !requiresOtp &&
    !matchedClient &&
    resolvedName &&
    nextEmail &&
    resolvedSupportIssue &&
    !freshConversation.leadId
  ) {
    const supportLead = await createLeadFromConversation({
      conversationId: conversation.id,
      fullName: resolvedName,
      email: nextEmail,
      phone: resolvedPhone,
      companyName: resolvedCompany,
      requirements: resolvedSupportIssue,
      priority: captured.priority,
      category: "SUPPORT_INQUIRY",
    });
    createdLeadId = supportLead.id;
    reply = `I couldn’t match that email to an existing client account, so I’ve routed this as support inquiry ${supportLead.id.slice(-6).toUpperCase()}.`;
  }

  await prisma.chatbotMessage.create({
    data: {
      conversationId: conversation.id,
      role: "ASSISTANT",
      content: reply,
      metadata: {
        intent: resolvedIntent,
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
    where: {
      messages: {
        some: {},
      },
    },
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

export async function getVisitorChatbotConversations(visitorId: string, limit = 12) {
  const conversations = await prisma.chatbotConversation.findMany({
    where: {
      visitorId,
      messages: {
        some: {},
      },
    },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      supportTicket: {
        select: {
          id: true,
          ticketNumber: true,
          status: true,
        },
      },
      lead: {
        select: {
          id: true,
          status: true,
        },
      },
    },
    orderBy: {
      lastMessageAt: "desc",
    },
    take: limit,
  });

  return conversations.map((conversation) => {
    const latestMessage = conversation.messages[0]?.content || null;

    return {
      id: conversation.id,
      title: getConversationTitle({
        summary: conversation.summary,
        visitorName: conversation.visitorName,
        visitorEmail: conversation.visitorEmail,
        supportTicketNumber: conversation.supportTicket?.ticketNumber || null,
        latestMessage,
      }),
      preview: latestMessage ? truncate(latestMessage, 88) : "No messages yet",
      status: conversation.status,
      intent: conversation.intent,
      isCustomerVerified: conversation.isCustomerVerified,
      lastMessageAt: conversation.lastMessageAt,
      createdAt: conversation.createdAt,
      supportTicket: conversation.supportTicket,
      lead: conversation.lead,
    };
  });
}

export async function getChatbotConversationForVisitor(params: {
  visitorId: string;
  conversationId: string;
}) {
  return prisma.chatbotConversation.findFirst({
    where: {
      id: params.conversationId,
      visitorId: params.visitorId,
    },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
      supportTicket: true,
      lead: true,
      client: true,
    },
  });
}

export async function getChatbotConversationDetail(id: string) {
  return prisma.chatbotConversation.findUnique({
    where: { id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
      lead: {
        select: {
          id: true,
          fullName: true,
          status: true,
          email: true,
        },
      },
      supportTicket: {
        select: {
          id: true,
          ticketNumber: true,
          status: true,
          priority: true,
          subject: true,
        },
      },
      client: {
        select: {
          id: true,
          companyName: true,
          contactName: true,
          email: true,
          phone: true,
        },
      },
    },
  });
}

export async function updateChatbotConversation(params: {
  id: string;
  status?: string;
  summary?: string;
}) {
  return prisma.chatbotConversation.update({
    where: { id: params.id },
    data: {
      status: params.status ? (params.status as never) : undefined,
      summary: typeof params.summary === "string" ? params.summary.trim() || null : undefined,
    },
  });
}

export async function getChatbotConversations(params: {
  status?: string | null;
  intent?: string | null;
  verified?: string | null;
  q?: string | null;
  limit?: number;
}) {
  const conversations = await prisma.chatbotConversation.findMany({
    where: {
      messages: {
        some: {},
      },
      ...(params.status ? { status: params.status as never } : {}),
      ...(params.intent ? { intent: params.intent as never } : {}),
      ...(params.verified === "true"
        ? { isCustomerVerified: true }
        : params.verified === "false"
          ? { isCustomerVerified: false }
          : {}),
      ...(params.q
        ? {
            OR: [
              { visitorName: { contains: params.q, mode: "insensitive" } },
              { visitorEmail: { contains: params.q, mode: "insensitive" } },
              { companyName: { contains: params.q, mode: "insensitive" } },
              { summary: { contains: params.q, mode: "insensitive" } },
              {
                supportTicket: {
                  is: {
                    ticketNumber: { contains: params.q, mode: "insensitive" },
                  },
                },
              },
            ],
          }
        : {}),
    },
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
          priority: true,
        },
      },
      client: {
        select: {
          id: true,
          companyName: true,
          contactName: true,
        },
      },
      _count: {
        select: {
          messages: true,
        },
      },
    },
    orderBy: { lastMessageAt: "desc" },
    take: params.limit || 50,
  });

  return conversations.map((conversation) => {
    const latestMessage = conversation.messages[0]?.content || null;

    return {
      id: conversation.id,
      title: getConversationTitle({
        summary: conversation.summary,
        visitorName: conversation.visitorName,
        visitorEmail: conversation.visitorEmail,
        supportTicketNumber: conversation.supportTicket?.ticketNumber || null,
        latestMessage,
      }),
      preview: latestMessage ? truncate(latestMessage, 140) : "No messages yet",
      status: conversation.status,
      intent: conversation.intent,
      visitorName: conversation.visitorName,
      visitorEmail: conversation.visitorEmail,
      companyName: conversation.companyName,
      isCustomerVerified: conversation.isCustomerVerified,
      lastMessageAt: conversation.lastMessageAt,
      createdAt: conversation.createdAt,
      messageCount: conversation._count.messages,
      lead: conversation.lead,
      supportTicket: conversation.supportTicket,
      client: conversation.client,
    };
  });
}

export async function getChatbotDashboardData() {
  const [knowledgeDocuments, conversations, tickets, settings, vectorStore] = await Promise.all([
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
    getChatbotVectorStore(),
  ]);

  return {
    settings,
    knowledgeDocuments,
    conversations,
    tickets,
    vectorStore,
  };
}
