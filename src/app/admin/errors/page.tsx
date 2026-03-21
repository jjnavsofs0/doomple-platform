"use client";

import * as React from "react";
import { AlertCircle, CheckCircle2, Copy, RefreshCcw, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

type AppErrorLog = {
  id: string;
  title: string;
  message: string;
  severity: "INFO" | "WARNING" | "ERROR" | "CRITICAL";
  source: "CLIENT" | "SERVER" | "RENDER";
  route: string | null;
  area: string | null;
  method: string | null;
  statusCode: number | null;
  stack: string | null;
  metadata: Record<string, unknown> | null;
  occurrences: number;
  lastSeenAt: string;
  firstSeenAt: string;
  lastAlertedAt: string | null;
  isResolved: boolean;
  resolvedAt: string | null;
  actorName: string | null;
  resolvedByName: string | null;
};

type ErrorSummary = {
  openCount: number;
  bySeverity: Record<string, number>;
};

const severityStyles: Record<AppErrorLog["severity"], string> = {
  INFO: "bg-slate-100 text-slate-700",
  WARNING: "bg-amber-100 text-amber-700",
  ERROR: "bg-red-100 text-red-700",
  CRITICAL: "bg-rose-100 text-rose-700",
};

function buildCopyPayload(log: AppErrorLog) {
  return JSON.stringify(
    {
      title: log.title,
      message: log.message,
      severity: log.severity,
      source: log.source,
      route: log.route,
      area: log.area,
      method: log.method,
      statusCode: log.statusCode,
      occurrences: log.occurrences,
      firstSeenAt: log.firstSeenAt,
      lastSeenAt: log.lastSeenAt,
      lastAlertedAt: log.lastAlertedAt,
      isResolved: log.isResolved,
      resolvedAt: log.resolvedAt,
      actorName: log.actorName,
      resolvedByName: log.resolvedByName,
      metadata: log.metadata,
      stack: log.stack,
    },
    null,
    2
  );
}

export default function AdminErrorsPage() {
  const { toast } = useToast();
  const [logs, setLogs] = React.useState<AppErrorLog[]>([]);
  const [summary, setSummary] = React.useState<ErrorSummary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [severity, setSeverity] = React.useState("");
  const [source, setSource] = React.useState("");
  const [status, setStatus] = React.useState("open");
  const [query, setQuery] = React.useState("");
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  const fetchLogs = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (severity) params.set("severity", severity);
      if (source) params.set("source", source);
      if (status) params.set("status", status);
      if (query.trim()) params.set("q", query.trim());

      const response = await fetch(`/api/error-logs?${params.toString()}`, {
        cache: "no-store",
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to fetch error logs");
      }

      setLogs(result.data || []);
      setSummary(result.summary || { openCount: 0, bySeverity: {} });
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Failed to fetch error logs");
      setLogs([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [query, severity, source, status]);

  React.useEffect(() => {
    void fetchLogs();
  }, [fetchLogs]);

  const updateResolution = React.useCallback(
    async (log: AppErrorLog, isResolved: boolean) => {
      try {
        setPendingId(log.id);
        const response = await fetch(`/api/error-logs/${log.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isResolved }),
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Failed to update error resolution");
        }

        toast({
          type: "success",
          title: isResolved ? "Error marked resolved" : "Error reopened",
          description: log.title,
        });
        await fetchLogs();
      } catch (updateError) {
        toast({
          type: "error",
          title: "Resolution update failed",
          description:
            updateError instanceof Error ? updateError.message : "Failed to update error resolution",
        });
      } finally {
        setPendingId(null);
      }
    },
    [fetchLogs, toast]
  );

  const copyErrorDetails = React.useCallback(
    async (log: AppErrorLog) => {
      try {
        await navigator.clipboard.writeText(buildCopyPayload(log));
        toast({
          type: "success",
          title: "Error details copied",
          description: "The full error payload is ready to paste into a ticket or editor.",
        });
      } catch (copyError) {
        toast({
          type: "error",
          title: "Copy failed",
          description:
            copyError instanceof Error ? copyError.message : "Could not copy the error payload.",
        });
      }
    },
    [toast]
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <PageHeader
        title="Errors"
        description="Track runtime issues, review critical alerts, and resolve incidents from one admin audit view."
        action={
          <Button variant="outline" onClick={() => void fetchLogs()}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="rounded-[24px] p-5">
          <p className="text-sm text-slate-500">Open incidents</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {summary?.openCount ?? 0}
          </p>
        </Card>
        {["CRITICAL", "ERROR", "WARNING"].map((level) => (
          <Card key={level} className="rounded-[24px] p-5">
            <p className="text-sm text-slate-500">{level.toLowerCase()} incidents</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              {summary?.bySeverity?.[level] ?? 0}
            </p>
          </Card>
        ))}
      </div>

      <Card className="rounded-[28px] border border-slate-200 bg-white">
        <div className="grid gap-4 border-b border-slate-100 p-6 md:grid-cols-[180px_180px_180px_minmax(0,1fr)]">
          <Select
            label="Severity"
            value={severity}
            onChange={(event) => setSeverity(event.target.value)}
            placeholder="All severities"
            options={[
              { value: "CRITICAL", label: "Critical" },
              { value: "ERROR", label: "Error" },
              { value: "WARNING", label: "Warning" },
              { value: "INFO", label: "Info" },
            ]}
          />
          <Select
            label="Source"
            value={source}
            onChange={(event) => setSource(event.target.value)}
            placeholder="All sources"
            options={[
              { value: "SERVER", label: "Server" },
              { value: "CLIENT", label: "Client" },
              { value: "RENDER", label: "Render" },
            ]}
          />
          <Select
            label="Status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            options={[
              { value: "open", label: "Open only" },
              { value: "resolved", label: "Resolved only" },
              { value: "all", label: "All statuses" },
            ]}
          />
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Search</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title, route, area, or message"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-900/5"
            />
          </label>
        </div>

        {error ? (
          <div className="flex items-center gap-3 p-6 text-sm font-medium text-red-700">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        ) : loading ? (
          <div className="space-y-4 p-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-40 rounded-[24px]" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="p-10 text-center">
            <ShieldAlert className="mx-auto h-10 w-10 text-slate-300" />
            <h2 className="mt-4 text-lg font-semibold text-slate-900">No matching errors</h2>
            <p className="mt-2 text-sm text-slate-500">
              Adjust the filters or check again after the next activity cycle.
            </p>
          </div>
        ) : (
          <div className="space-y-4 p-6">
            {logs.map((log) => (
              <Card key={log.id} className="rounded-[24px] border border-slate-200 bg-slate-50/40 p-5 shadow-none">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
                          severityStyles[log.severity]
                        )}
                      >
                        {log.severity}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                        {log.source}
                      </span>
                      {log.isResolved ? (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                          Resolved
                        </span>
                      ) : null}
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold tracking-tight text-slate-950">{log.title}</h2>
                      <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">{log.message}</p>
                    </div>

                    <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-4">
                      <p>
                        <span className="font-medium text-slate-900">Route:</span>{" "}
                        {log.route || "Unknown"}
                      </p>
                      <p>
                        <span className="font-medium text-slate-900">Area:</span>{" "}
                        {log.area || "Unknown"}
                      </p>
                      <p>
                        <span className="font-medium text-slate-900">Occurrences:</span>{" "}
                        {log.occurrences}
                      </p>
                      <p>
                        <span className="font-medium text-slate-900">Last seen:</span>{" "}
                        {new Date(log.lastSeenAt).toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div className="grid gap-3 text-sm text-slate-500 md:grid-cols-2 xl:grid-cols-4">
                      <p>First seen: {new Date(log.firstSeenAt).toLocaleString("en-IN")}</p>
                      <p>Actor: {log.actorName || "System"}</p>
                      <p>
                        Alerted: {log.lastAlertedAt ? new Date(log.lastAlertedAt).toLocaleString("en-IN") : "No"}
                      </p>
                      <p>
                        Resolved by: {log.resolvedByName || "Not yet resolved"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-row gap-3 xl:flex-col">
                    <Button variant="outline" onClick={() => void copyErrorDetails(log)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy details
                    </Button>
                    <Button
                      variant={log.isResolved ? "outline" : "default"}
                      onClick={() => void updateResolution(log, !log.isResolved)}
                      disabled={pendingId === log.id}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      {log.isResolved ? "Reopen" : "Mark Resolved"}
                    </Button>
                  </div>
                </div>

                {(log.stack || log.metadata) && (
                  <details className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
                    <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900">
                      Technical details
                    </summary>
                    {log.metadata ? (
                      <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    ) : null}
                    {log.stack ? (
                      <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100">
                        {log.stack}
                      </pre>
                    ) : null}
                  </details>
                )}
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
