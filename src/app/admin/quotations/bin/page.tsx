"use client"

import * as React from "react"
import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/utils"

type DeletedQuotation = {
  id: string
  quotationNumber: string
  clientName: string
  title: string
  total: number
  currency?: string
  deletedAt?: string | null
  deletedBy?: string | null
  deleteReason?: string
}

export default function QuotationBinPage() {
  const [rows, setRows] = React.useState<DeletedQuotation[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [restoringId, setRestoringId] = React.useState<string | null>(null)

  const fetchRows = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/quotations?deleted=only")
      if (!response.ok) throw new Error("Failed to fetch quotation bin")
      const result = await response.json()
      setRows(result.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch quotation bin")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchRows()
  }, [fetchRows])

  const handleRestore = async (id: string) => {
    try {
      setRestoringId(id)
      const response = await fetch(`/api/quotations/${id}/restore`, {
        method: "POST",
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Failed to restore quotation")
      await fetchRows()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to restore quotation")
    } finally {
      setRestoringId(null)
    }
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Quotation Bin"
        description="Restore draft quotations that were moved out of the active pipeline."
        action={
          <Link href="/admin/quotations">
            <Button variant="outline">Back to Quotations</Button>
          </Link>
        }
      />

      <Card>
        {error && <div className="border-b p-6 text-sm font-medium text-red-700">{error}</div>}

        {loading ? (
          <div className="space-y-3 p-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">No quotations in bin.</div>
        ) : (
          <div className="divide-y">
            {rows.map((row) => (
              <div key={row.id} className="flex flex-wrap items-center justify-between gap-4 p-6">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    {row.quotationNumber} • {row.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {row.clientName} • {formatCurrency(row.total, row.currency || "INR")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Deleted {row.deletedAt ? new Date(row.deletedAt).toLocaleString("en-IN") : "recently"}
                    {row.deletedBy ? ` by ${row.deletedBy}` : ""}
                  </p>
                  {row.deleteReason && (
                    <p className="text-xs text-muted-foreground">Reason: {row.deleteReason}</p>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={() => handleRestore(row.id)}
                  disabled={restoringId === row.id}
                >
                  {restoringId === row.id ? "Restoring..." : "Restore"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
