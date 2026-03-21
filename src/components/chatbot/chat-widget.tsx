"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, MessageSquare, Send, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  createdAt: string;
};

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [assistantName, setAssistantName] = useState("Doomple AI Advisor");
  const [welcomeMessage, setWelcomeMessage] = useState(
    "Hi, I’m Doomple AI Advisor. I can help you explore services, capture your requirements, or route an existing client issue."
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;
    const loadSession = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/chatbot/session", { cache: "no-store" });
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Failed to start chat");
        }

        if (!active) return;

        setConversationId(result.data.conversationId);
        setAssistantName(result.data.assistantName || "Doomple AI Advisor");
        setWelcomeMessage(result.data.welcomeMessage || welcomeMessage);
        setMessages(
          result.data.messages?.length
            ? result.data.messages
            : [
                {
                  id: "welcome",
                  role: "ASSISTANT",
                  content: result.data.welcomeMessage || welcomeMessage,
                  createdAt: new Date().toISOString(),
                },
              ]
        );
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to start chat");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadSession();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  const canSend = useMemo(() => input.trim().length > 0 && !sending, [input, sending]);

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
        <div className="fixed bottom-24 right-5 z-40 w-[calc(100vw-2rem)] max-w-[390px] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_32px_80px_-32px_rgba(7,34,63,0.45)]">
          <div className="bg-[#07223F] px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                <Sparkles className="h-5 w-5 text-[#6DEADB]" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#6DEADB]">AI Assistant</p>
                <h3 className="text-base font-semibold">{assistantName}</h3>
              </div>
            </div>
          </div>

          <div ref={scrollRef} className="max-h-[420px] space-y-3 overflow-y-auto bg-[#F8FBFF] px-4 py-4">
            {loading ? (
              <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Starting your chat...
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
                placeholder="Ask about services, request a quote, or report a client issue..."
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
