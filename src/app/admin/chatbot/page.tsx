"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bot, FileText, MessageSquareMore, RefreshCcw, Upload } from "lucide-react";
import { useToast } from "@/components/ui/toast";

type ChatbotAdminData = {
  settings: {
    enabled: boolean;
    assistantName: string;
    welcomeMessage: string;
    systemPrompt: string;
    salesObjective: string;
    supportObjective: string;
  };
  knowledgeDocuments: Array<{
    id: string;
    title: string;
    type: "TEXT" | "FILE";
    status: "PROCESSING" | "READY" | "FAILED";
    excerpt: string | null;
    _count: { chunks: number };
    updatedAt: string;
  }>;
  conversations: Array<{
    id: string;
    visitorName: string | null;
    visitorEmail: string | null;
    status: string;
    intent: string;
    isCustomerVerified: boolean;
    lastMessageAt: string;
    lead: { id: string; fullName: string; status: string } | null;
    supportTicket: { id: string; ticketNumber: string; status: string } | null;
    messages: Array<{ content: string }>;
  }>;
  tickets: Array<{
    id: string;
    ticketNumber: string;
    subject: string;
    status: string;
  }>;
};

const emptySettings = {
  enabled: true,
  assistantName: "Doomple AI Advisor",
  welcomeMessage: "",
  systemPrompt: "",
  salesObjective: "",
  supportObjective: "",
};

export default function AdminChatbotPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [data, setData] = useState<ChatbotAdminData | null>(null);
  const [settings, setSettings] = useState(emptySettings);
  const [textTitle, setTextTitle] = useState("");
  const [textBody, setTextBody] = useState("");
  const [fileTitle, setFileTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);

  async function load() {
    try {
      setLoading(true);
      const response = await fetch("/api/chatbot/admin", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to load chatbot admin data");
      }

      setData(result.data);
      setSettings(result.data.settings || emptySettings);
    } catch (error) {
      toast({
        title: "Could not load chatbot data",
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

  const stats = useMemo(() => {
    const documents = data?.knowledgeDocuments.length || 0;
    const readyDocuments = data?.knowledgeDocuments.filter((item) => item.status === "READY").length || 0;
    const openTickets =
      data?.tickets.filter((ticket) => ticket.status !== "RESOLVED" && ticket.status !== "CLOSED")
        .length || 0;

    return { documents, readyDocuments, openTickets };
  }, [data]);

  async function saveSettings() {
    try {
      setSaving(true);
      const response = await fetch("/api/chatbot/admin", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to save settings");
      }

      toast({
        title: "Chatbot settings updated",
        description: "The assistant configuration was saved.",
      });
      await load();
    } catch (error) {
      toast({
        title: "Could not save settings",
        description: error instanceof Error ? error.message : "Unknown error",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  async function addTextKnowledge() {
    try {
      if (!textTitle.trim() || !textBody.trim()) {
        throw new Error("Add a title and text content.");
      }

      setUploading(true);
      const formData = new FormData();
      formData.set("title", textTitle.trim());
      formData.set("text", textBody.trim());

      const response = await fetch("/api/chatbot/knowledge", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to add knowledge text");
      }

      setTextTitle("");
      setTextBody("");
      toast({
        title: "Knowledge text added",
        description: "The chatbot can use this text in future conversations.",
      });
      await load();
    } catch (error) {
      toast({
        title: "Could not add knowledge text",
        description: error instanceof Error ? error.message : "Unknown error",
        type: "error",
      });
    } finally {
      setUploading(false);
    }
  }

  async function uploadKnowledgeFile() {
    try {
      if (!fileTitle.trim() || !file) {
        throw new Error("Choose a file and give it a title.");
      }

      setUploading(true);
      const formData = new FormData();
      formData.set("title", fileTitle.trim());
      formData.set("file", file);

      const response = await fetch("/api/chatbot/knowledge", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to upload knowledge file");
      }

      setFileTitle("");
      setFile(null);
      toast({
        title: "Knowledge document uploaded",
        description: "The document was ingested for chatbot retrieval.",
      });
      await load();
    } catch (error) {
      toast({
        title: "Could not upload knowledge file",
        description: error instanceof Error ? error.message : "Unknown error",
        type: "error",
      });
    } finally {
      setUploading(false);
    }
  }

  async function deleteDocument(documentId: string) {
    try {
      const response = await fetch(`/api/chatbot/knowledge/${documentId}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to delete document");
      }
      toast({
        title: "Knowledge document deleted",
      });
      await load();
    } catch (error) {
      toast({
        title: "Could not delete document",
        description: error instanceof Error ? error.message : "Unknown error",
        type: "error",
      });
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[#D9E5F2] bg-white px-6 py-6 shadow-[0_20px_60px_-40px_rgba(7,34,63,0.45)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1ABFAD]">AI Assistant</p>
            <h1 className="mt-3 text-3xl font-bold text-[#042042]">OpenAI chatbot control room</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Manage how the assistant sells Doomple services, verifies existing customers, and
              uses your knowledge base to capture leads or support tickets.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Knowledge docs", value: stats.documents, icon: FileText },
          { label: "Ready for retrieval", value: stats.readyDocuments, icon: Bot },
          { label: "Open tickets", value: stats.openTickets, icon: MessageSquareMore },
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

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-[#D9E5F2] bg-white p-6">
          <h2 className="text-xl font-semibold text-[#042042]">Assistant settings</h2>
          <div className="mt-5 grid gap-4">
            <label className="grid gap-2 text-sm text-slate-700">
              Assistant name
              <input
                value={settings.assistantName}
                onChange={(event) => setSettings((current) => ({ ...current, assistantName: event.target.value }))}
                className="rounded-2xl border border-slate-200 px-4 py-3"
              />
            </label>
            <label className="grid gap-2 text-sm text-slate-700">
              Welcome message
              <textarea
                value={settings.welcomeMessage}
                onChange={(event) => setSettings((current) => ({ ...current, welcomeMessage: event.target.value }))}
                rows={3}
                className="rounded-2xl border border-slate-200 px-4 py-3"
              />
            </label>
            <label className="grid gap-2 text-sm text-slate-700">
              Core system prompt
              <textarea
                value={settings.systemPrompt}
                onChange={(event) => setSettings((current) => ({ ...current, systemPrompt: event.target.value }))}
                rows={6}
                className="rounded-2xl border border-slate-200 px-4 py-3"
              />
            </label>
            <label className="grid gap-2 text-sm text-slate-700">
              Sales objective
              <textarea
                value={settings.salesObjective}
                onChange={(event) => setSettings((current) => ({ ...current, salesObjective: event.target.value }))}
                rows={3}
                className="rounded-2xl border border-slate-200 px-4 py-3"
              />
            </label>
            <label className="grid gap-2 text-sm text-slate-700">
              Support objective
              <textarea
                value={settings.supportObjective}
                onChange={(event) => setSettings((current) => ({ ...current, supportObjective: event.target.value }))}
                rows={3}
                className="rounded-2xl border border-slate-200 px-4 py-3"
              />
            </label>
            <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(event) => setSettings((current) => ({ ...current, enabled: event.target.checked }))}
              />
              Enable website assistant
            </label>
            <button
              type="button"
              onClick={() => void saveSettings()}
              disabled={saving}
              className="inline-flex items-center justify-center rounded-full bg-[#07223F] px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save assistant settings"}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-[#D9E5F2] bg-white p-6">
            <h2 className="text-xl font-semibold text-[#042042]">Add text knowledge</h2>
            <div className="mt-5 grid gap-4">
              <input
                value={textTitle}
                onChange={(event) => setTextTitle(event.target.value)}
                placeholder="Title"
                className="rounded-2xl border border-slate-200 px-4 py-3"
              />
              <textarea
                value={textBody}
                onChange={(event) => setTextBody(event.target.value)}
                rows={8}
                placeholder="Paste product, process, support, or policy knowledge here..."
                className="rounded-2xl border border-slate-200 px-4 py-3"
              />
              <button
                type="button"
                onClick={() => void addTextKnowledge()}
                disabled={uploading}
                className="rounded-full bg-[#0E7A6D] px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
              >
                Add text knowledge
              </button>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#D9E5F2] bg-white p-6">
            <h2 className="text-xl font-semibold text-[#042042]">Upload document</h2>
            <div className="mt-5 grid gap-4">
              <input
                value={fileTitle}
                onChange={(event) => setFileTitle(event.target.value)}
                placeholder="Document title"
                className="rounded-2xl border border-slate-200 px-4 py-3"
              />
              <input
                type="file"
                onChange={(event) => setFile(event.target.files?.[0] || null)}
                className="rounded-2xl border border-slate-200 px-4 py-3"
              />
              <button
                type="button"
                onClick={() => void uploadKnowledgeFile()}
                disabled={uploading}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#07223F] px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
              >
                <Upload className="h-4 w-4" />
                Upload knowledge document
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[28px] border border-[#D9E5F2] bg-white p-6">
          <h2 className="text-xl font-semibold text-[#042042]">Knowledge base</h2>
          <div className="mt-5 space-y-3">
            {loading ? (
              <p className="text-sm text-slate-500">Loading knowledge documents...</p>
            ) : data?.knowledgeDocuments.length ? (
              data.knowledgeDocuments.map((document) => (
                <div key={document.id} className="rounded-2xl border border-slate-200 px-4 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-[#042042]">{document.title}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                        {document.type} · {document.status} · {document._count.chunks} chunks
                      </p>
                      {document.excerpt ? (
                        <p className="mt-3 text-sm leading-6 text-slate-600">{document.excerpt}</p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => void deleteDocument(document.id)}
                      className="text-sm font-medium text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No chatbot knowledge has been added yet.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-[#D9E5F2] bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#042042]">Recent conversations</h2>
              <span className="text-sm text-slate-500">{data?.conversations.length || 0}</span>
            </div>
            <div className="mt-5 space-y-3">
              {data?.conversations.length ? (
                data.conversations.map((conversation) => (
                  <div key={conversation.id} className="rounded-2xl border border-slate-200 px-4 py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-[#042042]">
                          {conversation.visitorName || conversation.visitorEmail || "Anonymous visitor"}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                          {conversation.intent} · {conversation.status}
                        </p>
                      </div>
                      {conversation.supportTicket ? (
                        <Link href={`/admin/tickets/${conversation.supportTicket.id}`} className="text-sm font-medium text-[#0E7A6D]">
                          {conversation.supportTicket.ticketNumber}
                        </Link>
                      ) : conversation.lead ? (
                        <Link href={`/admin/leads/${conversation.lead.id}`} className="text-sm font-medium text-[#0E7A6D]">
                          Open lead
                        </Link>
                      ) : null}
                    </div>
                    {conversation.messages[0]?.content ? (
                      <p className="mt-3 text-sm leading-6 text-slate-600">{conversation.messages[0].content}</p>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No chatbot conversations yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-[#D9E5F2] bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#042042]">Support tickets</h2>
              <Link href="/admin/tickets" className="text-sm font-medium text-[#0E7A6D]">
                View all
              </Link>
            </div>
            <div className="mt-5 space-y-3">
              {data?.tickets.length ? (
                data.tickets.slice(0, 5).map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/admin/tickets/${ticket.id}`}
                    className="block rounded-2xl border border-slate-200 px-4 py-4"
                  >
                    <p className="font-semibold text-[#042042]">{ticket.ticketNumber}</p>
                    <p className="mt-1 text-sm text-slate-600">{ticket.subject}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">{ticket.status}</p>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-slate-500">No support tickets captured yet.</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
