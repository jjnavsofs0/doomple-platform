"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp, Clock3, Loader2, MessageSquare, Plus, Send, Sparkles, X } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

type ChatMessage = {
  id: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  createdAt: string;
};

type ConversationSummary = {
  id: string;
  title: string;
  preview: string;
  status: string;
  intent: string;
  isCustomerVerified: boolean;
  lastMessageAt: string;
};

type SessionPayload = {
  conversationId: string | null;
  assistantName: string;
  welcomeMessage: string;
  messages: ChatMessage[];
  conversations: ConversationSummary[];
};

const DEFAULT_WELCOME =
  "Hi, welcome to Doomple. Tell me a bit about what you're looking to build or improve, and I'll help you figure out the right next step.";
const AUTO_PROMPT_KEY = "doomple_chatbot_auto_prompted";
const AUTO_PROMPT_DELAY_MS = 12000;
const MIN_AUTO_PROMPT_WIDTH = 960;

function formatConversationTime(value: string) {
  return formatDate(value, "MMM d, h:mm a");
}

function isHighIntentPath(pathname: string) {
  return [
    /^\/pricing(?:\/|$)/i,
    /^\/contact(?:\/|$)/i,
    /^\/agentic-ai(?:\/|$)/i,
    /^\/services(?:\/|$)/i,
    /^\/solutions(?:\/|$)/i,
    /^\/book(?:\/|$)/i,
    /^\/consult(?:\/|$)/i,
  ].some((pattern) => pattern.test(pathname));
}

function getSalesPrompt(pathname: string, fallback: string) {
  if (/^\/agentic-ai(?:\/|$)/i.test(pathname)) {
    return "Thinking about AI agents? Tell me one workflow your team repeats often and I’ll help decide if it’s a good first automation pilot.";
  }

  if (/^\/pricing(?:\/|$)/i.test(pathname)) {
    return "Working out scope or price? Tell me what you want to build and I can suggest the right engagement model and next step.";
  }

  if (/^\/services(?:\/|$)/i.test(pathname)) {
    return "Exploring services? Share the business outcome you need and I’ll point you to the best-fit service path.";
  }

  if (/^\/solutions(?:\/|$)/i.test(pathname)) {
    return "Looking at solutions? Tell me your use case and I can help narrow the best fit before you talk to the team.";
  }

  if (/^\/contact(?:\/|$)/i.test(pathname)) {
    return "Before you reach out, tell me what you need help with and I’ll help frame the fastest next step.";
  }

  return fallback;
}

function getInputPlaceholder(pathname: string) {
  if (/^\/agentic-ai(?:\/|$)/i.test(pathname)) {
    return "Describe one workflow you want an AI agent to handle...";
  }

  if (/^\/pricing(?:\/|$)/i.test(pathname)) {
    return "Describe the project or budget question you have...";
  }

  if (/^\/services(?:\/|$)|^\/solutions(?:\/|$)/i.test(pathname)) {
    return "Tell me what you're trying to achieve...";
  }

  return "Tell me what you're planning, and I'll guide you from there...";
}

function getRenderableMessages(messages: ChatMessage[], welcomeMessage: string) {
  if (messages.length) {
    return messages;
  }

  return [
    {
      id: "welcome",
      role: "ASSISTANT" as const,
      content: welcomeMessage,
      createdAt: new Date().toISOString(),
    },
  ];
}

export function ChatWidget() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [assistantName, setAssistantName] = useState("Doomple AI Advisor");
  const [welcomeMessage, setWelcomeMessage] = useState(DEFAULT_WELCOME);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  function applySession(payload: SessionPayload) {
    const nextWelcome = payload.welcomeMessage || DEFAULT_WELCOME;

    setConversationId(payload.conversationId);
    setAssistantName(payload.assistantName || "Doomple AI Advisor");
    setWelcomeMessage(nextWelcome);
    setConversations(payload.conversations || []);
    setMessages(payload.messages || []);
  }

  async function loadSession(requestInit?: RequestInit) {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/chatbot/session", {
        cache: "no-store",
        ...requestInit,
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to start chat");
      }

      applySession(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start chat");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSession();
  }, []);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 480);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (
      loading ||
      open ||
      conversationId ||
      messages.length > 0 ||
      conversations.length > 0 ||
      !isHighIntentPath(pathname) ||
      typeof window === "undefined" ||
      window.innerWidth < MIN_AUTO_PROMPT_WIDTH ||
      window.sessionStorage.getItem(AUTO_PROMPT_KEY) === "1"
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      window.sessionStorage.setItem(AUTO_PROMPT_KEY, "1");
      setOpen(true);
    }, AUTO_PROMPT_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [conversationId, conversations.length, loading, messages.length, open, pathname]);

  const displayWelcomeMessage = useMemo(() => {
    if (conversationId || conversations.length > 0) {
      return welcomeMessage;
    }

    return getSalesPrompt(pathname, welcomeMessage);
  }, [conversationId, conversations.length, pathname, welcomeMessage]);

  const renderableMessages = useMemo(
    () => getRenderableMessages(messages, displayWelcomeMessage),
    [displayWelcomeMessage, messages]
  );

  const canSend = useMemo(() => input.trim().length > 0 && !sending && !loading, [input, sending, loading]);

  async function handleSend() {
    if (!canSend) return;

    const text = input.trim();
    const optimisticId = `local-${Date.now()}`;
    const optimistic: ChatMessage = {
      id: optimisticId,
      role: "USER",
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => [...current, optimistic]);
    setInput("");
    setSending(true);
    setError("");

    try {
      const response = await fetch("/api/chatbot/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId,
          message: text,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to send message");
      }

      setConversationId(result.data.conversationId);
      setConversations(result.data.conversations || []);
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "ASSISTANT",
          content: result.data.reply,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      setMessages((current) => current.filter((message) => message.id !== optimisticId));
      setInput(text);
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  }

  async function handleStartNewConversation() {
    setError("");
    setInput("");
    setConversationId(null);
    setMessages([]);
    await loadSession({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "new",
      }),
    });
  }

  async function handleSelectConversation(nextConversationId: string) {
    if (nextConversationId === conversationId) {
      return;
    }

    await loadSession({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conversationId: nextConversationId,
      }),
    });
  }

  function handleToggleChat() {
    if (
      typeof window !== "undefined" &&
      isHighIntentPath(pathname) &&
      !conversationId &&
      messages.length === 0
    ) {
      window.sessionStorage.setItem(AUTO_PROMPT_KEY, "1");
    }

    setOpen((current) => !current);
  }

  function handleBackToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <>
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
        <button
          type="button"
          onClick={handleBackToTop}
          className={cn(
            "inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-[#07223F] shadow-[0_16px_38px_-18px_rgba(7,34,63,0.45)] transition-all",
            showBackToTop
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-3 opacity-0"
          )}
          aria-label="Go to top"
        >
          <ArrowUp className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={handleToggleChat}
          className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/85 bg-[linear-gradient(135deg,#07223F_0%,#0A6E74_100%)] text-white shadow-[0_22px_52px_-22px_rgba(7,34,63,0.9)] ring-4 ring-white/70 transition-transform hover:scale-[1.02]"
          aria-label={open ? "Close chat" : "Open chat"}
        >
          {open ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="fixed bottom-24 right-5 z-40 w-[calc(100vw-2rem)] max-w-[410px] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_32px_80px_-32px_rgba(7,34,63,0.45)]">
          <div className="bg-[#07223F] px-5 py-4 text-white">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                  <Sparkles className="h-5 w-5 text-[#6DEADB]" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-[#6DEADB]">AI Assistant</p>
                  <h3 className="text-base font-semibold">{assistantName}</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => void handleStartNewConversation()}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/15 disabled:opacity-60"
              >
                <Plus className="h-3.5 w-3.5" />
                New
              </button>
            </div>
          </div>

          {conversations.length ? (
            <div className="border-b border-slate-200 bg-[#F4F8FC] px-4 py-3">
              <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                <Clock3 className="h-3.5 w-3.5" />
                Recent
              </div>
              <div className="max-h-[168px] space-y-2 overflow-y-auto pr-1">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => void handleSelectConversation(conversation.id)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-2xl border px-3 py-2.5 text-left transition",
                      conversation.id === conversationId
                        ? "border-[#1ABFAD] bg-white shadow-sm"
                        : "border-slate-200 bg-white/80 hover:border-slate-300"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full",
                        conversation.id === conversationId ? "bg-[#1ABFAD]" : "bg-slate-300"
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="truncate text-sm font-semibold text-[#042042]">{conversation.title}</p>
                        <p className="flex-shrink-0 text-[10px] uppercase tracking-[0.14em] text-slate-400">
                          {formatConversationTime(conversation.lastMessageAt)}
                        </p>
                      </div>
                      <p className="mt-0.5 truncate text-xs leading-5 text-slate-500">
                        {conversation.preview}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {!loading && !conversationId && messages.length === 0 ? (
            <div className="border-b border-slate-200 bg-[#F8FBFF] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0A6E74]">
                New conversation
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Start fresh.
              </p>
            </div>
          ) : null}

          <div ref={scrollRef} className="max-h-[360px] space-y-3 overflow-y-auto bg-[#F8FBFF] px-4 py-4">
            {loading ? (
              <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading your conversations...
              </div>
            ) : (
              renderableMessages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm",
                    message.role === "USER"
                      ? "ml-auto bg-[#07223F] text-white"
                      : "bg-white text-slate-700"
                  )}
                >
                  {message.content}
                </div>
              ))
            )}
            {sending ? (
              <div className="max-w-[88%] rounded-2xl bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="inline-flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#0A6E74] [animation-delay:-0.2s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#0A6E74] [animation-delay:-0.1s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#0A6E74]" />
                  </span>
                  <span>Writing a reply...</span>
                </div>
              </div>
            ) : null}
          </div>

          <div className="border-t border-slate-200 bg-white px-4 py-4">
            {error ? <p className="mb-2 text-xs text-red-600">{error}</p> : null}
            <div className="flex items-end gap-3">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void handleSend();
                  }
                }}
                rows={2}
                placeholder={getInputPlaceholder(pathname)}
                className="min-h-[52px] flex-1 resize-none rounded-2xl border border-slate-200 bg-[#F8FBFF] px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#1ABFAD] focus:ring-2 focus:ring-[#1ABFAD]/20"
              />
              <button
                type="button"
                onClick={() => void handleSend()}
                disabled={!canSend}
                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#07223F] text-white transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              Existing clients can verify with email OTP for faster ticket routing.
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
