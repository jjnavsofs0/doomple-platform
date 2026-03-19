"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  CreditCard,
  Landmark,
  RefreshCcw,
  Search,
  ShieldAlert,
  Wallet,
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

interface Payment {
  id: string
  paymentId: string
  invoiceNumber: string
  invoiceId: string
  clientName: string
  amount: number
  currency?: string
  invoiceTotal?: number
  method: string
  razorpayPaymentId: string
  status: "pending" | "processing" | "completed" | "failed" | "refunded"
  createdAt: string
}

const statusOptions = [
  { value: "", label: "All statuses" },
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
]

const summaryCardStyles = [
  "from-emerald-50 to-white border-emerald-100",
  "from-amber-50 to-white border-amber-100",
  "from-sky-50 to-white border-sky-100",
  "from-rose-50 to-white border-rose-100",
]

const statusColorMap = {
  completed: "success",
  pending: "warning",
  processing: "default",
  failed: "destructive",
  refunded: "outline",
} as const

const prettifyMethod = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")

export default function PaymentsPage() {
  const router = useRouter()
  const [payments, setPayments] = React.useState<Payment[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [filters, setFilters] = React.useState({ status: "", method: "" })

  const fetchPayments = React.useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch("/api/payments?limit=250", { cache: "no-store" })
      if (!response.ok) {
        throw new Error("Failed to fetch payments")
      }

      const data = await response.json()
      setPayments(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setPayments([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  useAdminLiveRefetch(["dashboard", "payments", "invoices"], fetchPayments)

  const methodOptions = React.useMemo(
    () => [
      { value: "", label: "All methods" },
      ...Array.from(new Set(payments.map((payment) => payment.method).filter(Boolean))).map((value) => ({
        value,
        label: prettifyMethod(value),
      })),
    ],
    [payments]
  )

  const filteredPayments = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return payments.filter((payment) => {
      if (filters.status && payment.status !== filters.status) return false
      if (filters.method && payment.method !== filters.method) return false

      if (!query) return true

      return [
        payment.paymentId,
        payment.invoiceNumber,
        payment.clientName,
        payment.method,
        payment.razorpayPaymentId,
        payment.status,
      ].some((value) => value.toLowerCase().includes(query))
    })
  }, [filters.method, filters.status, payments, searchQuery])

  const sumByCurrency = React.useCallback(
    (rows: Payment[]) =>
      Object.entries(
        rows.reduce<Record<string, number>>((acc, row) => {
          const currency = row.currency || "INR"
          acc[currency] = (acc[currency] || 0) + Number(row.amount || 0)
          return acc
        }, {})
      ),
    []
  )

  const summary = React.useMemo(() => {
    const completed = payments.filter((payment) => payment.status === "completed")
    const pending = payments.filter((payment) => ["pending", "processing"].includes(payment.status))
    const failed = payments.filter((payment) => ["failed", "refunded"].includes(payment.status))
    const monthPayments = payments.filter((payment) => {
      const current = new Date()
      const created = new Date(payment.createdAt)
      return created.getMonth() === current.getMonth() && created.getFullYear() === current.getFullYear()
    })

    return [
      {
        label: "Collected",
        value:
          sumByCurrency(completed).map(([currency, total]) => formatCurrency(total, currency)).join(" · ") ||
          formatCurrency(0, "INR"),
        helper: `${completed.length} completed collections recorded`,
        icon: Wallet,
      },
      {
        label: "In flight",
        value:
          sumByCurrency(pending).map(([currency, total]) => formatCurrency(total, currency)).join(" · ") ||
          formatCurrency(0, "INR"),
        helper: `${pending.length} payments still pending or processing`,
        icon: CreditCard,
      },
      {
        label: "Logged this month",
        value: monthPayments.length,
        helper: format(new Date(), "MMMM yyyy"),
        icon: Landmark,
      },
      {
        label: "Exceptions",
        value: failed.length,
        helper: "Failed or refunded payments needing review",
        icon: ShieldAlert,
      },
    ]
  }, [payments, sumByCurrency])

  const activeFilters = React.useMemo(
    () => [searchQuery, filters.status, filters.method].filter(Boolean).length,
    [filters.method, filters.status, searchQuery]
  )

  if (error) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <Card className="border-destructive/40 bg-destructive/5 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-destructive">Payments area unavailable</p>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            </div>
            <Button variant="outline" onClick={fetchPayments}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Retry
            </Button>
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
              Collections monitor
            </Badge>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Keep every payment event readable, traceable, and tied back to the invoice it affects.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-white/72 md:text-base">
                Review collections, gateway traces, and exceptions from one cleaner payments queue built for finance operations.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={fetchPayments}
                className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
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
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">Payment log</h2>
              <p className="text-sm text-muted-foreground">
                Search by payment, invoice, client, or gateway reference and jump back to the linked invoice when needed.
              </p>
            </div>
            {activeFilters > 0 && (
              <Button
                variant="ghost"
                className="justify-start text-slate-600 hover:text-slate-900"
                onClick={() => {
                  setSearchQuery("")
                  setFilters({ status: "", method: "" })
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
                placeholder="Search by payment ID, invoice, client, method, or Razorpay ID"
                className="h-11 rounded-2xl border-slate-200 bg-slate-50 pl-10"
              />
            </div>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters((current) => ({ ...current, status: value }))}
              className="h-11 rounded-2xl border-slate-200 bg-slate-50"
              options={statusOptions}
            />
            <Select
              value={filters.method}
              onValueChange={(value) => setFilters((current) => ({ ...current, method: value }))}
              className="h-11 rounded-2xl border-slate-200 bg-slate-50"
              options={methodOptions}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4 p-6">
            <Skeleton className="h-32 rounded-3xl" />
            <Skeleton className="h-32 rounded-3xl" />
            <Skeleton className="h-32 rounded-3xl" />
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
            <div className="rounded-full bg-slate-100 p-4 text-slate-500">
              <Wallet className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-slate-900">No payments match these filters</h3>
              <p className="text-sm text-muted-foreground">
                Reset the filters to see the full collections log.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("")
                setFilters({ status: "", method: "" })
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredPayments.map((payment) => (
              <button
                key={payment.id}
                type="button"
                onClick={() => router.push(`/admin/invoices/${payment.invoiceId}`)}
                className="w-full text-left transition-colors hover:bg-slate-50/80"
              >
                <div className="flex flex-col gap-5 p-6 xl:flex-row xl:items-center xl:justify-between">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-slate-900">{payment.clientName}</h3>
                        <StatusBadge status={payment.status} customColorMap={statusColorMap} />
                      </div>
                      <p className="text-sm text-slate-600">
                        {payment.invoiceNumber} · {prettifyMethod(payment.method || "Unknown")}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="rounded-full border-slate-200 px-3 py-1 text-slate-600">
                        Logged {format(new Date(payment.createdAt), "dd MMM yyyy")}
                      </Badge>
                      <Badge variant="outline" className="rounded-full border-slate-200 px-3 py-1 font-mono text-slate-600">
                        {payment.paymentId}
                      </Badge>
                      {payment.razorpayPaymentId && (
                        <Badge variant="outline" className="rounded-full border-slate-200 px-3 py-1 font-mono text-slate-600">
                          {payment.razorpayPaymentId}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 xl:min-w-[250px] xl:items-end">
                    <div className="space-y-1 text-left xl:text-right">
                      <p className="text-sm text-slate-500">Payment amount</p>
                      <p className="text-lg font-semibold text-slate-900">
                        {formatCurrency(payment.amount || 0, payment.currency || "INR")}
                      </p>
                      {payment.invoiceTotal !== undefined && (
                        <p className="text-xs text-slate-500">
                          Against invoice {formatCurrency(payment.invoiceTotal || 0, payment.currency || "INR")}
                        </p>
                      )}
                    </div>
                    <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-900">
                      Open linked invoice
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
