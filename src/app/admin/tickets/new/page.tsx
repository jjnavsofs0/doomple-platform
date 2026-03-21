"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";

const statusOptions = ["OPEN", "IN_PROGRESS", "WAITING_ON_CLIENT"];
const priorityOptions = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const sourceOptions = ["MANUAL", "EMAIL", "PHONE", "PORTAL"];

export default function NewSupportTicketPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    description: "",
    requesterName: "",
    requesterEmail: "",
    requesterPhone: "",
    companyName: "",
    status: "OPEN",
    priority: "MEDIUM",
    source: "MANUAL",
  });

  async function createTicket() {
    try {
      setSaving(true);
      const response = await fetch("/api/support-tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Failed to create support ticket");
      }

      toast({
        title: "Support ticket created",
        description: `Ticket ${payload.data.ticketNumber} is ready for triage.`,
      });
      router.push(`/admin/tickets/${payload.data.id}`);
      router.refresh();
    } catch (error) {
      toast({
        title: "Could not create support ticket",
        description: error instanceof Error ? error.message : "Unknown error",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <section className="rounded-[32px] border border-[#D9E5F2] bg-white px-6 py-6 shadow-[0_25px_80px_-40px_rgba(7,34,63,0.35)]">
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#1ABFAD]">New support ticket</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#042042]">Capture a ticket manually</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Use this when support work arrives outside the chatbot and still needs to enter the same operations pipeline.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[28px] border border-[#D9E5F2] bg-white p-6">
          <h2 className="text-xl font-semibold text-[#042042]">Issue details</h2>
          <div className="mt-5 grid gap-4">
            <label className="grid gap-2 text-sm text-slate-700">
              Subject
              <input
                value={form.subject}
                onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
                className="rounded-2xl border border-slate-200 px-4 py-3"
              />
            </label>
            <label className="grid gap-2 text-sm text-slate-700">
              Description
              <textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                rows={10}
                className="rounded-2xl border border-slate-200 px-4 py-3"
              />
            </label>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-[#D9E5F2] bg-white p-6">
            <h2 className="text-xl font-semibold text-[#042042]">Requester</h2>
            <div className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm text-slate-700">
                Name
                <input
                  value={form.requesterName}
                  onChange={(event) => setForm((current) => ({ ...current, requesterName: event.target.value }))}
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-700">
                Email
                <input
                  type="email"
                  value={form.requesterEmail}
                  onChange={(event) => setForm((current) => ({ ...current, requesterEmail: event.target.value }))}
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-700">
                Phone
                <input
                  value={form.requesterPhone}
                  onChange={(event) => setForm((current) => ({ ...current, requesterPhone: event.target.value }))}
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-700">
                Company
                <input
                  value={form.companyName}
                  onChange={(event) => setForm((current) => ({ ...current, companyName: event.target.value }))}
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                />
              </label>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#D9E5F2] bg-white p-6">
            <h2 className="text-xl font-semibold text-[#042042]">Routing</h2>
            <div className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm text-slate-700">
                Status
                <select
                  value={form.status}
                  onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
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
                  value={form.priority}
                  onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                >
                  {priorityOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm text-slate-700">
                Source
                <select
                  value={form.source}
                  onChange={(event) => setForm((current) => ({ ...current, source: event.target.value }))}
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                >
                  {sourceOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={() => void createTicket()}
                disabled={saving}
                className="rounded-full bg-[#07223F] px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
              >
                {saving ? "Creating..." : "Create support ticket"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
