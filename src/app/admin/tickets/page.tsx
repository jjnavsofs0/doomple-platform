"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useToast } from "@/components/ui/toast";

type Ticket = {
  id: string;
  ticketNumber: string;
  subject: string;
  status: string;
  priority: string;
  requesterName: string;
  requesterEmail: string;
  companyName: string | null;
  createdAt: string;
};

export default function SupportTicketsPage() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      const response = await fetch(`/api/support-tickets?${params.toString()}`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to load support tickets");
      }
      setTickets(result.data);
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
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[#D9E5F2] bg-white px-6 py-6 shadow-[0_20px_60px_-40px_rgba(7,34,63,0.45)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1ABFAD]">Support</p>
        <h1 className="mt-3 text-3xl font-bold text-[#042042]">Support tickets</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Review client issues raised through the chatbot and move them through resolution.
        </p>
      </section>

      <section className="rounded-[28px] border border-[#D9E5F2] bg-white p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void load();
                }
              }}
              placeholder="Search by ticket, subject, or requester"
              className="w-full rounded-full border border-slate-200 px-11 py-3"
            />
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-full bg-[#07223F] px-5 py-3 text-sm font-medium text-white"
          >
            Search
          </button>
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
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-semibold text-[#042042]">{ticket.ticketNumber}</p>
                    <p className="mt-1 text-base text-slate-700">{ticket.subject}</p>
                    <p className="mt-2 text-sm text-slate-500">
                      {ticket.requesterName} · {ticket.requesterEmail}
                      {ticket.companyName ? ` · ${ticket.companyName}` : ""}
                    </p>
                  </div>
                  <div className="text-sm text-slate-500 md:text-right">
                    <p>{ticket.status}</p>
                    <p className="mt-1">{ticket.priority}</p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-sm text-slate-500">No support tickets yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
