"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Clock3, Loader2, MessageSquare, Plus, Send, Sparkles, X } from "lucide-react";
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
  conversationId: string;
  assistantName: string;
  welcomeMessage: string;
  messages: ChatMessage[];
  conversations: ConversationSummary[];
};

const DEFAULT_WELCOME =
  "Hi, welcome to Doomple. Tell me a bit about what you're looking to build or improve, and I'll help you figure out the right next step.";

function formatConversationTime(value: string) {
  return formatDate(value, "MMM d, h:mm a");
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
  const scrollRef = useRef<HTMLDivElement | null>(null);

  function applySession(payload: SessionPayload) {
    const nextWelcome = payload.welcomeMessage || DEFAULT_WELCOME;

    setConversationId(payload.conversationId);
    setAssistantName(payload.assistantName || "Doomple AI Advisor");
    setWelcomeMessage(nextWelcome);
    setConversations(payload.conversations || []);
    setMessages(getRenderableMessages(payload.messages || [], nextWelcome));
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

  const canSend = useMemo(() => input.trim().length > 0 && !sending && !loading, [input, sending, loading]);

  async function handleSend() {
    if (!canSend || !conversationId) return;

    const text = input.trim();
    const optimistic: ChatMessage = {
      id: `local-${Date.now()}`,
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
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  }

  async function handleStartNewConversation() {
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

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#07223F] text-white shadow-[0_18px_40px_-18px_rgba(7,34,63,0.7)] transition-transform hover:scale-[1.02]"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
      </button>

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

          <div className="border-b border-slate-200 bg-[#F4F8FC] px-4 py-3">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              <Clock3 className="h-3.5 w-3.5" />
              Recent conversations
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => void handleSelectConversation(conversation.id)}
                  className={cn(
                    "min-w-[162px] rounded-2xl border px-3 py-3 text-left transition",
                    conversation.id === conversationId
                      ? "border-[#1ABFAD] bg-white shadow-sm"
                      : "border-slate-200 bg-white/80 hover:border-slate-300"
                  )}
                >
                  <p className="truncate text-sm font-semibold text-[#042042]">{conversation.title}</p>
                  <p className="mt-1 h-10 overflow-hidden text-xs leading-5 text-slate-500">{conversation.preview}</p>
                  <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-slate-400">
                    {formatConversationTime(conversation.lastMessageAt)}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div ref={scrollRef} className="max-h-[360px] space-y-3 overflow-y-auto bg-[#F8FBFF] px-4 py-4">
            {loading ? (
              <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading your conversations...
              </div>
            ) : (
              messages.map((message) => (
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
                <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                Thinking...
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
                placeholder="Tell me what you're planning, and I'll guide you from there..."
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
