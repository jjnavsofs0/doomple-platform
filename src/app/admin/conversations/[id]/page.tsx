"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MessageSquareMore, Save } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";

type ConversationDetail = {
  id: string;
  status: string;
  intent: string;
  visitorName: string | null;
  visitorEmail: string | null;
  visitorPhone: string | null;
  companyName: string | null;
  summary: string | null;
  isCustomerVerified: boolean;
  verifiedAt: string | null;
  createdAt: string;
  lastMessageAt: string;
  lead: { id: string; fullName: string; status: string; email: string } | null;
  supportTicket: { id: string; ticketNumber: string; status: string; priority: string; subject: string } | null;
  client: { id: string; companyName: string | null; contactName: string | null; email: string; phone: string | null } | null;
  messages: Array<{ id: string; role: string; content: string; createdAt: string }>;
};

const statusOptions = ["ACTIVE", "LEAD_CAPTURED", "SUPPORT_CAPTURED", "VERIFIED_CUSTOMER", "CLOSED"];

export default function AdminConversationDetailPage() {
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [conversation, setConversation] = useState<ConversationDetail | null>(null);

  async function load() {
    try {
      setLoading(true);
      const response = await fetch(`/api/chatbot/conversations/${params.id}`, {
        cache: "no-store",
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Failed to load conversation");
      }

      setConversation(payload.data);
    } catch (error) {
      toast({
        title: "Could not load conversation",
        description: error instanceof Error ? error.message : "Unknown error",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [params.id]);

  async function saveConversation() {
    if (!conversation) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/chatbot/conversations/${conversation.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: conversation.status,
          summary: conversation.summary,
        }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Failed to save conversation");
      }

      toast({
        title: "Conversation updated",
        description: "Status and summary were saved.",
      });
      await load();
    } catch (error) {
      toast({
        title: "Could not update conversation",
        description: error instanceof Error ? error.message : "Unknown error",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading || !conversation) {
    return (
      <div className="p-6 lg:p-8">
        <div className="rounded-[28px] border border-[#D9E5F2] bg-white p-6 text-sm text-slate-500">
          Loading conversation...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <section className="rounded-[32px] border border-[#D9E5F2] bg-white px-6 py-6 shadow-[0_25px_80px_-40px_rgba(7,34,63,0.35)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#1ABFAD]">Conversation detail</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#042042]">
              {conversation.summary || conversation.visitorName || conversation.visitorEmail || "Anonymous visitor"}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.16em]">
              <span className="rounded-full bg-[#EAFBF8] px-3 py-1 font-semibold text-[#0E7A6D]">
                {conversation.intent}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-500">
                {conversation.status.replaceAll("_", " ")}
              </span>
              {conversation.isCustomerVerified ? (
                <span className="rounded-full bg-[#EEF6FF] px-3 py-1 font-semibold text-[#0B63CE]">
                  Verified customer
                </span>
              ) : null}
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Started {formatDate(conversation.createdAt, "MMM d, yyyy h:mm a")} and last active{" "}
              {formatDate(conversation.lastMessageAt, "MMM d, yyyy h:mm a")}.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void saveConversation()}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#07223F] px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-6">
          <div className="rounded-[28px] border border-[#D9E5F2] bg-white p-6">
            <h2 className="text-xl font-semibold text-[#042042]">Conversation control</h2>
            <div className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm text-slate-700">
                Status
                <select
                  value={conversation.status}
                  onChange={(event) =>
                    setConversation((current) =>
                      current ? { ...current, status: event.target.value } : current
                    )
                  }
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm text-slate-700">
                Summary
                <textarea
                  value={conversation.summary || ""}
                  onChange={(event) =>
                    setConversation((current) =>
                      current ? { ...current, summary: event.target.value } : current
                    )
                  }
                  rows={5}
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                />
              </label>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#D9E5F2] bg-white p-6">
            <h2 className="text-xl font-semibold text-[#042042]">Visitor profile</h2>
            <div className="mt-5 space-y-3 text-sm text-slate-600">
              <p><span className="font-medium text-[#042042]">Name:</span> {conversation.visitorName || "Not captured"}</p>
              <p><span className="font-medium text-[#042042]">Email:</span> {conversation.visitorEmail || "Not captured"}</p>
              <p><span className="font-medium text-[#042042]">Phone:</span> {conversation.visitorPhone || "Not captured"}</p>
              <p><span className="font-medium text-[#042042]">Company:</span> {conversation.companyName || "Not captured"}</p>
              <p><span className="font-medium text-[#042042]">Verified at:</span> {conversation.verifiedAt ? formatDate(conversation.verifiedAt, "MMM d, yyyy h:mm a") : "Not verified"}</p>
              {conversation.client ? (
                <p>
                  <span className="font-medium text-[#042042]">Client record:</span>{" "}
                  <Link href={`/admin/clients/${conversation.client.id}`} className="text-[#0E7A6D]">
                    {conversation.client.companyName || conversation.client.contactName || conversation.client.email}
                  </Link>
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[28px] border border-[#D9E5F2] bg-white p-6">
              <h2 className="text-lg font-semibold text-[#042042]">Lead handoff</h2>
              {conversation.lead ? (
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p className="font-semibold text-[#042042]">{conversation.lead.fullName}</p>
                  <p>{conversation.lead.email}</p>
                  <p>{conversation.lead.status}</p>
                  <Link href={`/admin/leads/${conversation.lead.id}`} className="inline-block text-sm font-medium text-[#0E7A6D]">
                    Open lead
                  </Link>
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500">No lead has been created from this conversation yet.</p>
              )}
            </div>
            <div className="rounded-[28px] border border-[#D9E5F2] bg-white p-6">
              <h2 className="text-lg font-semibold text-[#042042]">Support routing</h2>
              {conversation.supportTicket ? (
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p className="font-semibold text-[#042042]">{conversation.supportTicket.ticketNumber}</p>
                  <p>{conversation.supportTicket.subject}</p>
                  <p>
                    {conversation.supportTicket.status} · {conversation.supportTicket.priority}
                  </p>
                  <Link href={`/admin/tickets/${conversation.supportTicket.id}`} className="inline-block text-sm font-medium text-[#0E7A6D]">
                    Open ticket
                  </Link>
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500">No support ticket is linked to this thread yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-[#D9E5F2] bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F1F8FF] text-[#0B63CE]">
              <MessageSquareMore className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#042042]">Transcript</h2>
              <p className="text-sm text-slate-500">{conversation.messages.length} messages captured</p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {conversation.messages.length ? (
              conversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                    message.role === "USER"
                      ? "ml-auto bg-[#07223F] text-white"
                      : "bg-[#F8FBFF] text-slate-700"
                  }`}
                >
                  <p>{message.content}</p>
                  <p className={`mt-2 text-[11px] uppercase tracking-[0.16em] ${message.role === "USER" ? "text-white/70" : "text-slate-400"}`}>
                    {message.role} · {formatDate(message.createdAt, "MMM d, h:mm a")}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No transcript is available for this conversation.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
