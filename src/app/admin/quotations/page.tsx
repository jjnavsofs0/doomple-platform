"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  BadgeDollarSign,
  FileStack,
  Plus,
  RefreshCcw,
  Search,
  ShieldCheck,
} from "lucide-react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "@/components/ui/status-badge"
import { useAdminLiveRefetch } from "@/hooks/use-live-refetch"
import { cn, formatCurrency } from "@/lib/utils"

interface Quotation {
  id: string
  quotationNumber: string
  clientId?: string
  leadId?: string
  clientName: string
  title: string
  total: number
  currency?: string
  status: "Draft" | "Sent" | "Accepted" | "Rejected" | "Expired"
  validUntil: string | null
  createdBy: string
  createdAt: string
}

const summaryCardStyles = [
  "from-sky-50 to-white border-sky-100",
  "from-emerald-50 to-white border-emerald-100",
  "from-amber-50 to-white border-amber-100",
  "from-violet-50 to-white border-violet-100",
]

const statusColorMap = {
  draft: "outline",
  sent: "default",
  accepted: "success",
  rejected: "destructive",
  expired: "warning",
} as const

export default function QuotationsPage() {
  const router = useRouter()
  const [quotations, setQuotations] = React.useState<Quotation[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [filters, setFilters] = React.useState({ status: "", client: "" })

  const fetchQuotations = React.useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch("/api/quotations?limit=250", { cache: "no-store" })
      if (!response.ok) {
        throw new Error("Failed to fetch quotations")
      }

      const data = await response.json()
      setQuotations(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setQuotations([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchQuotations()
  }, [fetchQuotations])

  useAdminLiveRefetch(["dashboard", "quotations"], fetchQuotations)

  const options = React.useMemo(() => {
    const statusOptions = [
      { value: "", label: "All statuses" },
      ...Array.from(new Set(quotations.map((quotation) => quotation.status))).map((value) => ({
        value,
        label: value,
      })),
    ]

    const clientOptions = [
      { value: "", label: "All clients" },
      ...Array.from(new Set(quotations.map((quotation) => quotation.clientName).filter(Boolean))).map((value) => ({
        value,
        label: value,
      })),
    ]

    return { statusOptions, clientOptions }
  }, [quotations])

  const filteredQuotations = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return quotations.filter((quotation) => {
      if (filters.status && quotation.status !== filters.status) return false
      if (filters.client && quotation.clientName !== filters.client) return false

      if (!query) return true

      return [
        quotation.quotationNumber,
        quotation.clientName,
        quotation.title,
        quotation.createdBy,
        quotation.status,
      ].some((value) => value.toLowerCase().includes(query))
    })
  }, [filters.client, filters.status, quotations, searchQuery])

  const sumByCurrency = React.useCallback((rows: Quotation[]) => {
    return Object.entries(
      rows.reduce<Record<string, number>>((acc, row) => {
        const currency = row.currency || "INR"
        acc[currency] = (acc[currency] || 0) + Number(row.total || 0)
        return acc
      }, {})
    )
  }, [])

  const summary = React.useMemo(() => {
    const awaitingDecision = quotations.filter((quotation) => quotation.status === "Sent")
    const accepted = quotations.filter((quotation) => quotation.status === "Accepted")
    const drafts = quotations.filter((quotation) => quotation.status === "Draft")

    return [
      {
        label: "Pipeline value",
        value: sumByCurrency(quotations).map(([currency, total]) => formatCurrency(total, currency)).join(" · ") || formatCurrency(0, "INR"),
        helper: `${quotations.length} quotations currently tracked`,
        icon: FileStack,
      },
      {
        label: "Accepted value",
        value: sumByCurrency(accepted).map(([currency, total]) => formatCurrency(total, currency)).join(" · ") || formatCurrency(0, "INR"),
        helper: `${accepted.length} accepted opportunities ready for conversion`,
        icon: ShieldCheck,
      },
      {
        label: "Awaiting response",
        value: awaitingDecision.length,
        helper: "Quotations sent and waiting on the client",
        icon: BadgeDollarSign,
      },
      {
        label: "Drafts in progress",
        value: drafts.length,
        helper: "Commercial proposals still being prepared internally",
        icon: RefreshCcw,
      },
    ]
  }, [quotations, sumByCurrency])

  const activeFilters = React.useMemo(
    () => [searchQuery, filters.status, filters.client].filter(Boolean).length,
    [filters.client, filters.status, searchQuery]
  )

  if (error) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <Card className="border-destructive/40 bg-destructive/5 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-destructive">Quotations area unavailable</p>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={fetchQuotations}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Retry
              </Button>
              <Link href="/admin/quotations/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Quotation
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white shadow-xl">
        <div className="grid gap-8 px-6 py-7 md:px-8 lg:grid-cols-[1.18fr_1fr] lg:items-end">
          <div className="space-y-5">
            <Badge variant="outline" className="w-fit border-white/20 text-white/90">
              Commercial pipeline
            </Badge>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Keep proposals readable, valuable, and easy to act on before they turn into billing.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-white/72 md:text-base">
                Review quotation value, decision stage, and owner context at a glance so sales and finance never lose the commercial thread.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/admin/quotations/bin">
                <Button variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                  Bin
                </Button>
              </Link>
              <Link href="/admin/audit">
                <Button variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                  Audit Log
                </Button>
              </Link>
              <Link href="/admin/quotations/new">
                <Button className="bg-white text-slate-900 hover:bg-white/90">
                  <Plus className="mr-2 h-4 w-4" />
                  New Quotation
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {summary.map((item, index) => {
              const Icon = item.icon

              return (
                <div
                  key={item.label}
                  className={cn(
                    "rounded-3xl border bg-gradient-to-br p-5 text-slate-900",
                    summaryCardStyles[index]
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-slate-600">{item.label}</p>
                    <Icon className="h-5 w-5 text-slate-500" />
                  </div>
                  <p className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">{item.value}</p>
                  <p className="mt-2 text-sm leading-5 text-slate-600">{item.helper}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <Card className="rounded-[28px] border-slate-200 shadow-sm">
        <div className="space-y-5 border-b border-slate-100 p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">Quotation queue</h2>
              <p className="text-sm text-muted-foreground">
                Search by number, title, client, or owner and move directly into the quotation workspace.
              </p>
            </div>
            {activeFilters > 0 && (
              <Button
                variant="ghost"
                className="justify-start text-slate-600 hover:text-slate-900"
                onClick={() => {
                  setSearchQuery("")
                  setFilters({ status: "", client: "" })
                }}
              >
                Reset filters
              </Button>
            )}
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.25fr_0.8fr_0.8fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by quotation number, client, title, or owner"
                className="h-11 rounded-2xl border-slate-200 bg-slate-50 pl-10"
              />
            </div>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters((current) => ({ ...current, status: value }))}
              className="h-11 rounded-2xl border-slate-200 bg-slate-50"
              options={options.statusOptions}
            />
            <Select
              value={filters.client}
              onValueChange={(value) => setFilters((current) => ({ ...current, client: value }))}
              className="h-11 rounded-2xl border-slate-200 bg-slate-50"
              options={options.clientOptions}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4 p-6">
            <Skeleton className="h-32 rounded-3xl" />
            <Skeleton className="h-32 rounded-3xl" />
            <Skeleton className="h-32 rounded-3xl" />
          </div>
        ) : filteredQuotations.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
            <div className="rounded-full bg-slate-100 p-4 text-slate-500">
              <FileStack className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-slate-900">No quotations match these filters</h3>
              <p className="text-sm text-muted-foreground">
                Reset the filters or create a new quotation to keep the commercial pipeline moving.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setFilters({ status: "", client: "" })
                }}
              >
                Clear filters
              </Button>
              <Link href="/admin/quotations/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Quotation
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredQuotations.map((quotation) => (
              <button
                key={quotation.id}
                type="button"
                onClick={() => router.push(`/admin/quotations/${quotation.id}`)}
                className="w-full text-left transition-colors hover:bg-slate-50/80"
              >
                <div className="flex flex-col gap-5 p-6 xl:flex-row xl:items-center xl:justify-between">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-slate-900">{quotation.title}</h3>
                        <StatusBadge status={quotation.status} customColorMap={statusColorMap} />
                      </div>
                      <p className="text-sm text-slate-600">
                        {quotation.quotationNumber} · {quotation.clientName}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="rounded-full border-slate-200 px-3 py-1 text-slate-600">
                        Created by {quotation.createdBy}
                      </Badge>
                      <Badge variant="outline" className="rounded-full border-slate-200 px-3 py-1 text-slate-600">
                        Created {format(new Date(quotation.createdAt), "dd MMM yyyy")}
                      </Badge>
                      <Badge variant="outline" className="rounded-full border-slate-200 px-3 py-1 text-slate-600">
                        Valid until{" "}
                        {quotation.validUntil ? format(new Date(quotation.validUntil), "dd MMM yyyy") : "Not set"}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 xl:min-w-[250px] xl:items-end">
                    <div className="space-y-1 text-left xl:text-right">
                      <p className="text-sm text-slate-500">Quoted value</p>
                      <p className="text-lg font-semibold text-slate-900">
                        {formatCurrency(quotation.total || 0, quotation.currency || "INR")}
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-900">
                      Open quotation workspace
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
