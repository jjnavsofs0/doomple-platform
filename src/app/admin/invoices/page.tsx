"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  ArrowRight,
  CircleDollarSign,
  FileSpreadsheet,
  Plus,
  RefreshCcw,
  Search,
  WalletCards,
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

interface Invoice {
  id: string
  invoiceNumber: string
  clientName: string
  projectName?: string | null
  issueDate: string
  dueDate: string
  total: number
  amountPaid: number
  currency?: string
  status: "Draft" | "Sent" | "Partially Paid" | "Paid" | "Overdue" | "Cancelled"
  billingCategory: string
  createdAt: string
}

const summaryCardStyles = [
  "from-emerald-50 to-white border-emerald-100",
  "from-amber-50 to-white border-amber-100",
  "from-rose-50 to-white border-rose-100",
  "from-sky-50 to-white border-sky-100",
]

const statusColorMap = {
  draft: "outline",
  sent: "default",
  partially_paid: "warning",
  paid: "success",
  overdue: "destructive",
  cancelled: "outline",
} as const

export default function InvoicesPage() {
  const router = useRouter()
  const [invoices, setInvoices] = React.useState<Invoice[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [filters, setFilters] = React.useState({ status: "", category: "" })

  const fetchInvoices = React.useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch("/api/invoices?limit=250", { cache: "no-store" })
      if (!response.ok) {
        throw new Error("Failed to fetch invoices")
      }

      const data = await response.json()
      setInvoices(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setInvoices([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  useAdminLiveRefetch(["dashboard", "invoices", "payments"], fetchInvoices)

  const options = React.useMemo(() => {
    const statusOptions = [
      { value: "", label: "All statuses" },
      ...Array.from(new Set(invoices.map((invoice) => invoice.status))).map((value) => ({
        value,
        label: value,
      })),
    ]

    const categoryOptions = [
      { value: "", label: "All categories" },
      ...Array.from(new Set(invoices.map((invoice) => invoice.billingCategory).filter(Boolean))).map((value) => ({
        value,
        label: value,
      })),
    ]

    return { statusOptions, categoryOptions }
  }, [invoices])

  const filteredInvoices = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return invoices.filter((invoice) => {
      if (filters.status && invoice.status !== filters.status) return false
      if (filters.category && invoice.billingCategory !== filters.category) return false

      if (!query) return true

      return [
        invoice.invoiceNumber,
        invoice.clientName,
        invoice.projectName || "",
        invoice.billingCategory,
        invoice.status,
      ].some((value) => value.toLowerCase().includes(query))
    })
  }, [filters.category, filters.status, invoices, searchQuery])

  const sumByCurrency = React.useCallback(
    (rows: Invoice[], selector: (invoice: Invoice) => number) =>
      Object.entries(
        rows.reduce<Record<string, number>>((acc, row) => {
          const currency = row.currency || "INR"
          acc[currency] = (acc[currency] || 0) + selector(row)
          return acc
        }, {})
      ),
    []
  )

  const summary = React.useMemo(() => {
    const openInvoices = invoices.filter((invoice) => !["Paid", "Cancelled"].includes(invoice.status))
    const overdueInvoices = invoices.filter((invoice) => invoice.status === "Overdue")
    const issuedThisMonth = invoices.filter((invoice) => {
      const current = new Date()
      const issued = new Date(invoice.issueDate)
      return issued.getMonth() === current.getMonth() && issued.getFullYear() === current.getFullYear()
    })

    return [
      {
        label: "Collected",
        value:
          sumByCurrency(invoices, (invoice) => invoice.amountPaid)
            .map(([currency, total]) => formatCurrency(total, currency))
            .join(" · ") || formatCurrency(0, "INR"),
        helper: `${invoices.filter((invoice) => invoice.status === "Paid").length} fully paid invoices`,
        icon: CircleDollarSign,
      },
      {
        label: "Outstanding",
        value:
          sumByCurrency(openInvoices, (invoice) => invoice.total - invoice.amountPaid)
            .map(([currency, total]) => formatCurrency(total, currency))
            .join(" · ") || formatCurrency(0, "INR"),
        helper: `${openInvoices.length} invoices still open for collection`,
        icon: WalletCards,
      },
      {
        label: "Overdue",
        value: overdueInvoices.length,
        helper: "Invoices needing immediate billing follow-up",
        icon: AlertTriangle,
      },
      {
        label: "Issued this month",
        value: issuedThisMonth.length,
        helper: format(new Date(), "MMMM yyyy"),
        icon: FileSpreadsheet,
      },
    ]
  }, [invoices, sumByCurrency])

  const activeFilters = React.useMemo(
    () => [searchQuery, filters.status, filters.category].filter(Boolean).length,
    [filters.category, filters.status, searchQuery]
  )

  if (error) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <Card className="border-destructive/40 bg-destructive/5 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-destructive">Invoices area unavailable</p>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={fetchInvoices}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Retry
              </Button>
              <Link href="/admin/invoices/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Invoice
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
              Billing workspace
            </Badge>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                See what has been billed, what is waiting, and what needs action before collections slip.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-white/72 md:text-base">
                Keep invoice status, client exposure, and payment progress visible from one cleaner billing view.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/admin/audit">
                <Button variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                  Audit Log
                </Button>
              </Link>
              <Link href="/admin/invoices/new">
                <Button className="bg-white text-slate-900 hover:bg-white/90">
                  <Plus className="mr-2 h-4 w-4" />
                  New Invoice
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
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">Invoice queue</h2>
              <p className="text-sm text-muted-foreground">
                Search by invoice, client, project, or billing category and move directly into the invoice workspace.
              </p>
            </div>
            {activeFilters > 0 && (
              <Button
                variant="ghost"
                className="justify-start text-slate-600 hover:text-slate-900"
                onClick={() => {
                  setSearchQuery("")
                  setFilters({ status: "", category: "" })
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
                placeholder="Search by invoice number, client, project, or category"
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
              value={filters.category}
              onValueChange={(value) => setFilters((current) => ({ ...current, category: value }))}
              className="h-11 rounded-2xl border-slate-200 bg-slate-50"
              options={options.categoryOptions}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4 p-6">
            <Skeleton className="h-32 rounded-3xl" />
            <Skeleton className="h-32 rounded-3xl" />
            <Skeleton className="h-32 rounded-3xl" />
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
            <div className="rounded-full bg-slate-100 p-4 text-slate-500">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-slate-900">No invoices match these filters</h3>
              <p className="text-sm text-muted-foreground">
                Reset the filters or create a new invoice to continue billing activity.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setFilters({ status: "", category: "" })
                }}
              >
                Clear filters
              </Button>
              <Link href="/admin/invoices/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Invoice
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredInvoices.map((invoice) => {
              const pendingAmount = Math.max(0, Number(invoice.total || 0) - Number(invoice.amountPaid || 0))

              return (
                <button
                  key={invoice.id}
                  type="button"
                  onClick={() => router.push(`/admin/invoices/${invoice.id}`)}
                  className="w-full text-left transition-colors hover:bg-slate-50/80"
                >
                  <div className="flex flex-col gap-5 p-6 xl:flex-row xl:items-center xl:justify-between">
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-slate-900">{invoice.invoiceNumber}</h3>
                          <StatusBadge status={invoice.status} customColorMap={statusColorMap} />
                        </div>
                        <p className="text-sm text-slate-600">
                          {invoice.clientName}
                          {invoice.projectName ? ` · ${invoice.projectName}` : ""}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="rounded-full border-slate-200 px-3 py-1 text-slate-600">
                          {invoice.billingCategory || "General"}
                        </Badge>
                        <Badge variant="outline" className="rounded-full border-slate-200 px-3 py-1 text-slate-600">
                          Issued {format(new Date(invoice.issueDate), "dd MMM yyyy")}
                        </Badge>
                        <Badge variant="outline" className="rounded-full border-slate-200 px-3 py-1 text-slate-600">
                          Due {format(new Date(invoice.dueDate), "dd MMM yyyy")}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
                        <span>
                          Collected{" "}
                          <span className="font-medium text-emerald-700">
                            {formatCurrency(invoice.amountPaid || 0, invoice.currency || "INR")}
                          </span>
                        </span>
                        <span>
                          Pending{" "}
                          <span className="font-medium text-amber-700">
                            {formatCurrency(pendingAmount, invoice.currency || "INR")}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 xl:min-w-[250px] xl:items-end">
                      <div className="space-y-1 text-left xl:text-right">
                        <p className="text-sm text-slate-500">Invoice total</p>
                        <p className="text-lg font-semibold text-slate-900">
                          {formatCurrency(invoice.total || 0, invoice.currency || "INR")}
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-900">
                        Open invoice workspace
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
