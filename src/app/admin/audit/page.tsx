"use client"

import * as React from "react"
import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

type AuditLog = {
  id: string
  entityType: string
  entityId: string
  action: string
  summary: string
  createdAt: string
  userName: string
}

export default function AuditPage() {
  const [logs, setLogs] = React.useState<AuditLog[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [entityType, setEntityType] = React.useState("")

  React.useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true)
        setError(null)
        const params = new URLSearchParams()
        if (entityType) params.set("entityType", entityType)
        const response = await fetch(`/api/audit-logs?${params.toString()}`)
        if (!response.ok) throw new Error("Failed to fetch audit logs")
        const result = await response.json()
        setLogs(result.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch audit logs")
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [entityType])

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Audit Log"
        description="Track invoice and quotation changes, deletions, restores, and workflow actions."
      />

      <Card>
        <div className="border-b p-6">
          <div className="grid gap-4 md:grid-cols-[260px_1fr]">
            <Select
              label="Entity Type"
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              placeholder="All entities"
              options={[
                { value: "invoice", label: "Invoices" },
                { value: "quotation", label: "Quotations" },
              ]}
            />
          </div>
        </div>

        {error && (
          <div className="p-6 text-sm font-medium text-red-700">{error}</div>
        )}

        {loading ? (
          <div className="space-y-3 p-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : logs.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">No audit entries found.</div>
        ) : (
          <div className="divide-y">
            {logs.map((log) => {
              const detailHref =
                log.action === "deleted" && log.entityType === "quotation"
                  ? "/admin/quotations/bin"
                  : log.action === "deleted" && log.entityType === "invoice"
                    ? null
                    : log.entityType === "invoice"
                      ? `/admin/invoices/${log.entityId}`
                      : `/admin/quotations/${log.entityId}`

              return (
                <div key={log.id} className="flex flex-wrap items-center justify-between gap-4 p-6">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      <span>{log.entityType}</span>
                      <span>{log.action.replaceAll("_", " ")}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{log.summary}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString("en-IN")} by {log.userName}
                    </p>
                  </div>
                  {detailHref ? (
                    <Link href={detailHref}>
                      <Button variant="outline" size="sm">
                        {log.action === "deleted" && log.entityType === "quotation"
                          ? "Open Bin"
                          : "Open Record"}
                      </Button>
                    </Link>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Record no longer exists
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
