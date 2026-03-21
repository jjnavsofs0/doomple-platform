"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, LifeBuoy, Plus, Search, Workflow } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";

type Ticket = {
  id: string;
  ticketNumber: string;
  subject: string;
  status: string;
  priority: string;
  source: string;
  requesterName: string;
  requesterEmail: string;
  companyName: string | null;
  createdAt: string;
};

type TicketResponse = {
  data: Ticket[];
  summary: {
    totalCount: number;
    openCount: number;
    urgentCount: number;
  };
};

const statusOptions = ["ALL", "OPEN", "IN_PROGRESS", "WAITING_ON_CLIENT", "RESOLVED", "CLOSED"];
const priorityOptions = ["ALL", "LOW", "MEDIUM", "HIGH", "URGENT"];
const sourceOptions = ["ALL", "CHATBOT", "PORTAL", "EMAIL", "PHONE", "MANUAL"];

export default function SupportTicketsPage() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [summary, setSummary] = useState<TicketResponse["summary"]>({
    totalCount: 0,
    openCount: 0,
    urgentCount: 0,
  });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [priority, setPriority] = useState("ALL");
  const [source, setSource] = useState("ALL");
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      if (status !== "ALL") params.set("status", status);
      if (priority !== "ALL") params.set("priority", priority);
      if (source !== "ALL") params.set("source", source);

      const response = await fetch(`/api/support-tickets?${params.toString()}`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to load support tickets");
      }
      setTickets(result.data);
      setSummary(result.summary);
    } catch (error) {
      toast({
        title: "Could not load tickets",
        description: error instanceof Error ? error.message : "Unknown error",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <section className="overflow-hidden rounded-[32px] border border-[#D9E5F2] bg-[radial-gradient(circle_at_top_left,_rgba(26,191,173,0.18),_transparent_32%),linear-gradient(135deg,#06203C_0%,#0A3158_100%)] px-6 py-7 text-white shadow-[0_25px_80px_-40px_rgba(7,34,63,0.65)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#8FF3E7]">Support Desk</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">Ticket management that feels operational</h1>
            <p className="mt-3 text-sm leading-6 text-slate-200">
              Create tickets manually, track chatbot-created issues with clearer filters, and keep resolution work visible.
            </p>
          </div>
          <Link
            href="/admin/tickets/new"
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-[#07223F]"
          >
            <Plus className="h-4 w-4" />
            New ticket
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { label: "All tickets", value: summary.totalCount, icon: LifeBuoy },
          { label: "Open workload", value: summary.openCount, icon: Workflow },
          { label: "Urgent active", value: summary.urgentCount, icon: AlertTriangle },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-[24px] border border-[#D9E5F2] bg-white p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{item.label}</p>
                <Icon className="h-5 w-5 text-[#1ABFAD]" />
              </div>
              <p className="mt-5 text-3xl font-bold text-[#042042]">{item.value}</p>
            </div>
          );
        })}
      </section>

      <section className="rounded-[28px] border border-[#D9E5F2] bg-white p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative max-w-xl flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void load();
                }
              }}
              placeholder="Search by ticket, subject, requester, or company"
              className="w-full rounded-full border border-slate-200 bg-[#F8FBFF] px-11 py-3"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="rounded-full border border-slate-200 px-4 py-2.5 text-sm text-slate-700"
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "ALL" ? "All statuses" : option.replaceAll("_", " ")}
                </option>
              ))}
            </select>
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              className="rounded-full border border-slate-200 px-4 py-2.5 text-sm text-slate-700"
            >
              {priorityOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "ALL" ? "All priorities" : option}
                </option>
              ))}
            </select>
            <select
              value={source}
              onChange={(event) => setSource(event.target.value)}
              className="rounded-full border border-slate-200 px-4 py-2.5 text-sm text-slate-700"
            >
              {sourceOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "ALL" ? "All sources" : option}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => void load()}
              className="rounded-full bg-[#07223F] px-5 py-2.5 text-sm font-medium text-white"
            >
              Apply
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {loading ? (
            <p className="text-sm text-slate-500">Loading tickets...</p>
          ) : tickets.length ? (
            tickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/admin/tickets/${ticket.id}`}
                className="block rounded-2xl border border-slate-200 px-4 py-4 transition hover:border-[#1ABFAD]"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#EEF6FF] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0B63CE]">
                        {ticket.ticketNumber}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        {ticket.status.replaceAll("_", " ")}
                      </span>
                      <span className="rounded-full bg-[#FFF5EC] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C45E00]">
                        {ticket.priority}
                      </span>
                      <span className="rounded-full bg-[#F5F7FA] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        {ticket.source}
                      </span>
                    </div>
                    <p className="mt-4 text-lg font-semibold text-[#042042]">{ticket.subject}</p>
                    <p className="mt-2 text-sm text-slate-600">
                      {ticket.requesterName} · {ticket.requesterEmail}
                      {ticket.companyName ? ` · ${ticket.companyName}` : ""}
                    </p>
                  </div>
                  <div className="text-sm text-slate-500 lg:text-right">
                    <p>Created</p>
                    <p className="mt-1 font-medium text-slate-700">{formatDate(ticket.createdAt, "MMM d, yyyy h:mm a")}</p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-sm text-slate-500">No support tickets match the current filters.</p>
          )}
        </div>
      </section>
    </div>
  );
}
