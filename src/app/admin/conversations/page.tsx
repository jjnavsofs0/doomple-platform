"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Filter, MessageSquareMore, Search, ShieldCheck, Ticket } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";

type Conversation = {
  id: string;
  title: string;
  preview: string;
  status: string;
  intent: string;
  visitorName: string | null;
  visitorEmail: string | null;
  companyName: string | null;
  isCustomerVerified: boolean;
  lastMessageAt: string;
  createdAt: string;
  messageCount: number;
  lead: { id: string; fullName: string; status: string } | null;
  supportTicket: { id: string; ticketNumber: string; status: string; priority: string } | null;
  client: { id: string; companyName: string | null; contactName: string | null } | null;
};

type ConversationResponse = {
  data: Conversation[];
  summary: {
    totalCount: number;
    verifiedCount: number;
    openSupportCount: number;
  };
};

const statusOptions = ["ALL", "ACTIVE", "LEAD_CAPTURED", "SUPPORT_CAPTURED", "VERIFIED_CUSTOMER", "CLOSED"];
const intentOptions = ["ALL", "GENERAL", "SALES", "SUPPORT"];

export default function AdminConversationsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [intent, setIntent] = useState("ALL");
  const [verified, setVerified] = useState("ALL");
  const [result, setResult] = useState<ConversationResponse>({
    data: [],
    summary: {
      totalCount: 0,
      verifiedCount: 0,
      openSupportCount: 0,
    },
  });

  async function load() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      if (status !== "ALL") params.set("status", status);
      if (intent !== "ALL") params.set("intent", intent);
      if (verified === "YES") params.set("verified", "true");
      if (verified === "NO") params.set("verified", "false");

      const response = await fetch(`/api/chatbot/conversations?${params.toString()}`, {
        cache: "no-store",
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Failed to load conversations");
      }

      setResult({
        data: payload.data,
        summary: payload.summary,
      });
    } catch (error) {
      toast({
        title: "Could not load conversations",
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

  const filteredCount = useMemo(() => result.data.length, [result.data.length]);

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <section className="overflow-hidden rounded-[32px] border border-[#D9E5F2] bg-[radial-gradient(circle_at_top_left,_rgba(26,191,173,0.18),_transparent_34%),linear-gradient(135deg,#06203C_0%,#0A3158_100%)] px-6 py-7 text-white shadow-[0_25px_80px_-40px_rgba(7,34,63,0.65)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#8FF3E7]">Conversation Desk</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">A cleaner place to manage chatbot threads</h1>
            <p className="mt-3 text-sm leading-6 text-slate-200">
              Review visitor intent, verified customer chats, and follow-through into leads or tickets
              without digging through the chatbot configuration page.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "All conversations", value: result.summary.totalCount, icon: MessageSquareMore },
              { label: "Verified customers", value: result.summary.verifiedCount, icon: ShieldCheck },
              { label: "Open support threads", value: result.summary.openSupportCount, icon: Ticket },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 backdrop-blur">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-200">{item.label}</p>
                    <Icon className="h-4 w-4 text-[#8FF3E7]" />
                  </div>
                  <p className="mt-4 text-3xl font-semibold">{item.value}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-[#D9E5F2] bg-white p-6 shadow-[0_20px_60px_-40px_rgba(7,34,63,0.45)]">
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
              placeholder="Search by visitor, company, ticket number, or summary"
              className="w-full rounded-full border border-slate-200 bg-[#F8FBFF] px-11 py-3 text-sm text-slate-700 outline-none transition focus:border-[#1ABFAD]"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-500">
              <Filter className="h-4 w-4" />
              Filters
            </div>
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
              value={intent}
              onChange={(event) => setIntent(event.target.value)}
              className="rounded-full border border-slate-200 px-4 py-2.5 text-sm text-slate-700"
            >
              {intentOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "ALL" ? "All intents" : option}
                </option>
              ))}
            </select>
            <select
              value={verified}
              onChange={(event) => setVerified(event.target.value)}
              className="rounded-full border border-slate-200 px-4 py-2.5 text-sm text-slate-700"
            >
              <option value="ALL">All visitors</option>
              <option value="YES">Verified customers</option>
              <option value="NO">Unverified visitors</option>
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

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-slate-500">
          <p>{filteredCount} conversations in view</p>
          <p>Sorted by most recent activity</p>
        </div>
      </section>

      <section className="space-y-4">
        {loading ? (
          <div className="rounded-[28px] border border-[#D9E5F2] bg-white p-6 text-sm text-slate-500">
            Loading conversations...
          </div>
        ) : result.data.length ? (
          result.data.map((conversation) => (
            <Link
              key={conversation.id}
              href={`/admin/conversations/${conversation.id}`}
              className="block rounded-[28px] border border-[#D9E5F2] bg-white p-6 shadow-[0_20px_60px_-40px_rgba(7,34,63,0.28)] transition hover:-translate-y-0.5 hover:border-[#9DD8D1]"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#EAFBF8] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0E7A6D]">
                      {conversation.intent}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      {conversation.status.replaceAll("_", " ")}
                    </span>
                    {conversation.isCustomerVerified ? (
                      <span className="rounded-full bg-[#EEF6FF] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0B63CE]">
                        Verified
                      </span>
                    ) : null}
                  </div>
                  <h2 className="mt-4 text-xl font-semibold tracking-tight text-[#042042]">{conversation.title}</h2>
                  <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">{conversation.preview}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                    <span>
                      {conversation.visitorName || conversation.visitorEmail || "Anonymous visitor"}
                    </span>
                    {conversation.companyName ? <span>{conversation.companyName}</span> : null}
                    <span>{conversation.messageCount} messages</span>
                    <span>{formatDate(conversation.lastMessageAt, "MMM d, yyyy h:mm a")}</span>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:w-[320px]">
                  <div className="rounded-2xl border border-slate-200 bg-[#F8FBFF] px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Linked lead</p>
                    {conversation.lead ? (
                      <>
                        <p className="mt-2 font-semibold text-[#042042]">{conversation.lead.fullName}</p>
                        <p className="mt-1 text-sm text-slate-500">{conversation.lead.status}</p>
                      </>
                    ) : (
                      <p className="mt-2 text-sm text-slate-500">No lead attached</p>
                    )}
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-[#F8FBFF] px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Linked ticket</p>
                    {conversation.supportTicket ? (
                      <>
                        <p className="mt-2 font-semibold text-[#042042]">{conversation.supportTicket.ticketNumber}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {conversation.supportTicket.status} · {conversation.supportTicket.priority}
                        </p>
                      </>
                    ) : (
                      <p className="mt-2 text-sm text-slate-500">No ticket attached</p>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-sm font-medium text-slate-700">No conversations match the current filters.</p>
            <p className="mt-2 text-sm text-slate-500">Try broadening the search or clearing one of the filters above.</p>
          </div>
        )}
      </section>
    </div>
  );
}
