"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useToast } from "@/components/ui/toast";

type TicketDetail = {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string | null;
  companyName: string | null;
  client: { id: string; companyName: string | null; contactName: string | null } | null;
  conversation:
    | {
        id: string;
        lead: { id: string; fullName: string } | null;
        messages: Array<{ id: string; role: string; content: string }>;
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
    return <div className="rounded-[28px] border border-[#D9E5F2] bg-white p-6 text-sm text-slate-500">Loading support ticket...</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[#D9E5F2] bg-white px-6 py-6 shadow-[0_20px_60px_-40px_rgba(7,34,63,0.45)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1ABFAD]">Support ticket</p>
        <h1 className="mt-3 text-3xl font-bold text-[#042042]">{ticket.ticketNumber}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{ticket.subject}</p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <div className="space-y-6">
          <div className="rounded-[28px] border border-[#D9E5F2] bg-white p-6">
            <h2 className="text-xl font-semibold text-[#042042]">Issue details</h2>
            <textarea
              value={ticket.description}
              onChange={(event) => setTicket((current) => (current ? { ...current, description: event.target.value } : current))}
              rows={10}
              className="mt-5 w-full rounded-2xl border border-slate-200 px-4 py-3"
            />
          </div>

          <div className="rounded-[28px] border border-[#D9E5F2] bg-white p-6">
            <h2 className="text-xl font-semibold text-[#042042]">Chat transcript</h2>
            <div className="mt-5 space-y-3">
              {ticket.conversation?.messages.length ? (
                ticket.conversation.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "USER" ? "bg-[#F8FBFF] text-slate-700" : "bg-[#07223F] text-white"}`}
                  >
                    {message.content}
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
                Subject
                <input
                  value={ticket.subject}
                  onChange={(event) => setTicket((current) => (current ? { ...current, subject: event.target.value } : current))}
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-700">
                Status
                <select
                  value={ticket.status}
                  onChange={(event) => setTicket((current) => (current ? { ...current, status: event.target.value } : current))}
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
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
              <button
                type="button"
                onClick={() => void updateTicket()}
                disabled={saving}
                className="rounded-full bg-[#07223F] px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save ticket"}
              </button>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#D9E5F2] bg-white p-6">
            <h2 className="text-xl font-semibold text-[#042042]">Requester</h2>
            <div className="mt-5 space-y-3 text-sm text-slate-600">
              <p><span className="font-medium text-[#042042]">Name:</span> {ticket.requesterName}</p>
              <p><span className="font-medium text-[#042042]">Email:</span> {ticket.requesterEmail}</p>
              {ticket.requesterPhone ? <p><span className="font-medium text-[#042042]">Phone:</span> {ticket.requesterPhone}</p> : null}
              {ticket.companyName ? <p><span className="font-medium text-[#042042]">Company:</span> {ticket.companyName}</p> : null}
              {ticket.client ? (
                <p>
                  <span className="font-medium text-[#042042]">Client record:</span>{" "}
                  <Link href={`/admin/clients/${ticket.client.id}`} className="text-[#0E7A6D]">
                    {ticket.client.companyName || ticket.client.contactName || "Open client"}
                  </Link>
                </p>
              ) : null}
              {ticket.conversation?.lead ? (
                <p>
                  <span className="font-medium text-[#042042]">Captured lead:</span>{" "}
                  <Link href={`/admin/leads/${ticket.conversation.lead.id}`} className="text-[#0E7A6D]">
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
