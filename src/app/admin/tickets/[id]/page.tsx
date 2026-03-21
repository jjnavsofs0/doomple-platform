"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Save } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";

type TicketDetail = {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  source: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string | null;
  companyName: string | null;
  createdAt: string;
  updatedAt: string;
  client: { id: string; companyName: string | null; contactName: string | null } | null;
  conversation:
    | {
        id: string;
        lead: { id: string; fullName: string } | null;
        messages: Array<{ id: string; role: string; content: string; createdAt: string }>;
      }
    | null;
};

const statusOptions = ["OPEN", "IN_PROGRESS", "WAITING_ON_CLIENT", "RESOLVED", "CLOSED"];
const priorityOptions = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export default function SupportTicketDetailPage() {
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      const response = await fetch(`/api/support-tickets/${params.id}`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to load support ticket");
      }
      setTicket(result.data);
    } catch (error) {
      toast({
        title: "Could not load support ticket",
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

  async function updateTicket() {
    if (!ticket) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/support-tickets/${ticket.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: ticket.status,
          priority: ticket.priority,
          subject: ticket.subject,
          description: ticket.description,
          requesterName: ticket.requesterName,
          requesterEmail: ticket.requesterEmail,
          requesterPhone: ticket.requesterPhone,
          companyName: ticket.companyName,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to update support ticket");
      }
      toast({
        title: "Support ticket updated",
        description: "The ticket state was saved.",
      });
      await load();
    } catch (error) {
      toast({
        title: "Could not update support ticket",
        description: error instanceof Error ? error.message : "Unknown error",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading || !ticket) {
    return (
      <div className="p-6 lg:p-8">
        <div className="rounded-[28px] border border-[#D9E5F2] bg-white p-6 text-sm text-slate-500">
          Loading support ticket...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <section className="rounded-[32px] border border-[#D9E5F2] bg-white px-6 py-6 shadow-[0_25px_80px_-40px_rgba(7,34,63,0.35)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#1ABFAD]">Support ticket</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#042042]">{ticket.ticketNumber}</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">{ticket.subject}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.16em]">
              <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-500">
                {ticket.status.replaceAll("_", " ")}
              </span>
              <span className="rounded-full bg-[#FFF5EC] px-3 py-1 font-semibold text-[#C45E00]">
                {ticket.priority}
              </span>
              <span className="rounded-full bg-[#F5F7FA] px-3 py-1 font-semibold text-slate-500">
                {ticket.source}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void updateTicket()}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#07223F] px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save ticket"}
          </button>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <div className="space-y-6">
          <div className="rounded-[28px] border border-[#D9E5F2] bg-white p-6">
            <h2 className="text-xl font-semibold text-[#042042]">Issue details</h2>
            <div className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm text-slate-700">
                Subject
                <input
                  value={ticket.subject}
                  onChange={(event) => setTicket((current) => (current ? { ...current, subject: event.target.value } : current))}
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-700">
                Description
                <textarea
                  value={ticket.description}
                  onChange={(event) => setTicket((current) => (current ? { ...current, description: event.target.value } : current))}
                  rows={10}
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                />
              </label>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#D9E5F2] bg-white p-6">
            <h2 className="text-xl font-semibold text-[#042042]">Chat transcript</h2>
            <div className="mt-5 space-y-3">
              {ticket.conversation?.messages.length ? (
                ticket.conversation.messages.map((message) => (
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
                <p className="text-sm text-slate-500">No conversation transcript attached.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-[#D9E5F2] bg-white p-6">
            <h2 className="text-xl font-semibold text-[#042042]">Ticket controls</h2>
            <div className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm text-slate-700">
                Status
                <select
                  value={ticket.status}
                  onChange={(event) => setTicket((current) => (current ? { ...current, status: event.target.value } : current))}
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
                Priority
                <select
                  value={ticket.priority}
                  onChange={(event) => setTicket((current) => (current ? { ...current, priority: event.target.value } : current))}
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                >
                  {priorityOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <div className="rounded-2xl border border-slate-200 bg-[#F8FBFF] px-4 py-4 text-sm text-slate-600">
                <p className="font-medium text-[#042042]">Lifecycle</p>
                <p className="mt-2">Created {formatDate(ticket.createdAt, "MMM d, yyyy h:mm a")}</p>
                <p className="mt-1">Updated {formatDate(ticket.updatedAt, "MMM d, yyyy h:mm a")}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#D9E5F2] bg-white p-6">
            <h2 className="text-xl font-semibold text-[#042042]">Requester</h2>
            <div className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm text-slate-700">
                Name
                <input
                  value={ticket.requesterName}
                  onChange={(event) => setTicket((current) => (current ? { ...current, requesterName: event.target.value } : current))}
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-700">
                Email
                <input
                  type="email"
                  value={ticket.requesterEmail}
                  onChange={(event) => setTicket((current) => (current ? { ...current, requesterEmail: event.target.value } : current))}
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-700">
                Phone
                <input
                  value={ticket.requesterPhone || ""}
                  onChange={(event) => setTicket((current) => (current ? { ...current, requesterPhone: event.target.value } : current))}
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-700">
                Company
                <input
                  value={ticket.companyName || ""}
                  onChange={(event) => setTicket((current) => (current ? { ...current, companyName: event.target.value } : current))}
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                />
              </label>
              {ticket.client ? (
                <p className="text-sm text-slate-600">
                  Client record:{" "}
                  <Link href={`/admin/clients/${ticket.client.id}`} className="font-medium text-[#0E7A6D]">
                    {ticket.client.companyName || ticket.client.contactName || "Open client"}
                  </Link>
                </p>
              ) : null}
              {ticket.conversation?.lead ? (
                <p className="text-sm text-slate-600">
                  Captured lead:{" "}
                  <Link href={`/admin/leads/${ticket.conversation.lead.id}`} className="font-medium text-[#0E7A6D]">
                    {ticket.conversation.lead.fullName}
                  </Link>
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
