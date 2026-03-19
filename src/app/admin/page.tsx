"use client"

import * as React from "react"
import { Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  AlertCircle,
  ArrowRight,
  BadgeIndianRupee,
  BriefcaseBusiness,
  CreditCard,
  FileText,
  FolderKanban,
  Plus,
  RefreshCcw,
  Target,
  TrendingUp,
  Users2,
} from "lucide-react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "@/components/ui/status-badge"
import { useAdminLiveRefetch } from "@/hooks/use-live-refetch"
import { formatCurrency } from "@/lib/utils"

interface DashboardStats {
  activeLeads: number
  activeProjects: number
  openInvoices: number
  revenueThisMonth: number
  outstandingAmount: number
  conversionRate: number
  recentLeads: Array<{
    id: string
    fullName: string
    companyName: string | null
    email: string
    status: string
    createdAt: string
  }>
  recentProjects: Array<{
    id: string
    projectName: string
    clientName: string
    status: string
    progress: number
  }>
  pipelineSummary: Record<string, number>
  revenueByCategory: Record<string, number>
  revenueThisMonthByCurrency?: Record<string, number>
  outstandingByCurrency?: Record<string, number>
  projectMixByCategory?: Record<string, number>
  invoiceStatusSummary?: Record<string, number>
  projectStatusSummary?: Record<string, number>
}

const prettifyLabel = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")

const formatCurrencyBreakdown = (values?: Record<string, number>) => {
  const entries = Object.entries(values || {}).filter(([, amount]) => amount > 0)
  if (entries.length === 0) {
    return formatCurrency(0, "INR")
  }

  return entries.map(([currency, amount]) => formatCurrency(amount, currency)).join(" · ")
}

function AdminDashboardContent() {
  const searchParams = useSearchParams()
  const isForbidden = searchParams.get("error") === "forbidden"
  const [stats, setStats] = React.useState<DashboardStats | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchStats = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/dashboard", { cache: "no-store" })
      const payload = await response.json()

      if (!response.ok || !payload?.data) {
        throw new Error(payload?.error || "Failed to fetch dashboard")
      }

      setStats(payload.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch dashboard")
      setStats(null)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchStats()
  }, [fetchStats])

  useAdminLiveRefetch(["dashboard", "leads", "projects", "invoices", "payments"], fetchStats)

  const topPipelineStage = React.useMemo(() => {
    if (!stats) return null

    const entries = Object.entries(stats.pipelineSummary || {})
    if (entries.length === 0) return null

    return entries.sort((a, b) => b[1] - a[1])[0]
  }, [stats])

  const topProjectCategory = React.useMemo(() => {
    if (!stats) return null

    const entries = Object.entries(stats.projectMixByCategory || {})
    if (entries.length === 0) return null

    return entries.sort((a, b) => b[1] - a[1])[0]
  }, [stats])

  const summaryCards = React.useMemo(() => {
    if (!stats) return []

    return [
      {
        label: "Active leads",
        value: stats.activeLeads,
        helper: `${stats.conversionRate}% current conversion rate`,
        icon: Target,
      },
      {
        label: "Active projects",
        value: stats.activeProjects,
        helper:
          topProjectCategory
            ? `${prettifyLabel(topProjectCategory[0])} is the busiest delivery lane`
            : "Project delivery distribution available as projects grow",
        icon: FolderKanban,
      },
      {
        label: "Outstanding",
        value: formatCurrencyBreakdown(stats.outstandingByCurrency),
        helper: `${stats.openInvoices} invoices still waiting on collection`,
        icon: FileText,
      },
      {
        label: "Collected this month",
        value: formatCurrencyBreakdown(stats.revenueThisMonthByCurrency),
        helper: "Paid invoices closed in the current month",
        icon: BadgeIndianRupee,
      },
    ]
  }, [stats, topPipelineStage, topProjectCategory])

  const watchlistItems = React.useMemo(() => {
    if (!stats) return []

    return [
      {
        label: "Pipeline leader",
        value: topPipelineStage ? prettifyLabel(topPipelineStage[0]) : "No lead data",
        helper: topPipelineStage ? `${topPipelineStage[1]} leads currently in this stage` : "Lead volume will appear here",
        icon: TrendingUp,
      },
      {
        label: "Open invoices",
        value: stats.openInvoices,
        helper: `${stats.invoiceStatusSummary?.OVERDUE || 0} overdue need follow-up`,
        icon: CreditCard,
      },
      {
        label: "Collections focus",
        value:
          (stats.invoiceStatusSummary?.OVERDUE || 0) > 0
            ? `${stats.invoiceStatusSummary?.OVERDUE} overdue`
            : "Collections stable",
        helper: "Billing exceptions surfaced before they get buried",
        icon: FileText,
      },
    ]
  }, [stats, topPipelineStage])

  const totalPipelineCount = React.useMemo(
    () => Object.values(stats?.pipelineSummary || {}).reduce((sum, count) => sum + count, 0),
    [stats]
  )

  const totalProjectMixCount = React.useMemo(
    () => Object.values(stats?.projectMixByCategory || {}).reduce((sum, count) => sum + count, 0),
    [stats]
  )

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <Skeleton className="h-32 rounded-[28px]" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-36 rounded-[28px]" />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          <Skeleton className="h-[420px] rounded-[28px]" />
          <Skeleton className="h-[420px] rounded-[28px]" />
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <Card className="border-destructive/40 bg-destructive/5 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-destructive">Dashboard unavailable</p>
              <p className="mt-1 text-sm text-muted-foreground">{error || "Failed to load dashboard"}</p>
            </div>
            <Button variant="outline" onClick={fetchStats}>
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
      {isForbidden && (
        <Card className="border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3 text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium">
              You do not have permission to access that page. Contact your Super Admin if you need access.
            </p>
          </div>
        </Card>
      )}

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <Badge variant="outline" className="w-fit border-slate-200 text-slate-600">
              Admin overview
            </Badge>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                Clean visibility across leads, delivery, and billing.
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
                Review the numbers that need attention first, then jump into pipeline, projects, and collections without a noisy control-room layout.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/admin/leads/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Lead
              </Button>
            </Link>
            <Link href="/admin/projects/new">
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </Link>
            <Button variant="outline" onClick={fetchStats}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((item) => {
          const Icon = item.icon

          return (
            <Card key={item.label} className="rounded-[24px] border-slate-200 shadow-sm">
              <div className="space-y-4 p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-600">{item.label}</p>
                  <div className="rounded-2xl bg-slate-100 p-2.5 text-slate-600">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-2xl font-semibold tracking-tight text-slate-900">{item.value}</p>
                  <p className="text-sm leading-5 text-slate-500">{item.helper}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <Card className="rounded-[28px] border-slate-200 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-6">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">Lead pipeline</h2>
              <p className="text-sm text-muted-foreground">
                A compact view of the current lead flow and the newest opportunities.
              </p>
            </div>
            <Link href="/admin/leads">
              <Button variant="ghost" className="text-slate-700 hover:text-slate-900">
                View all
              </Button>
            </Link>
          </div>
          <div className="space-y-5 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Pipeline leader
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {topPipelineStage ? prettifyLabel(topPipelineStage[0]) : "No lead data"}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {topPipelineStage ? `${topPipelineStage[1]} leads in this stage` : "Lead volume will appear here"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Current conversion
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{stats.conversionRate}%</p>
                <p className="mt-1 text-sm text-slate-500">{totalPipelineCount} active opportunities</p>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">Stage summary</h3>
                  <Badge variant="outline" className="border-slate-200 text-slate-600">
                    {totalPipelineCount} total
                  </Badge>
                </div>
                {Object.entries(stats.pipelineSummary).length === 0 ? (
                  <p className="text-sm text-muted-foreground">Pipeline stage counts will appear here.</p>
                ) : (
                  Object.entries(stats.pipelineSummary)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([stage, count]) => {
                      const width = (count / Math.max(1, totalPipelineCount)) * 100

                      return (
                        <div key={stage} className="space-y-1.5 rounded-2xl border border-slate-200 px-4 py-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-slate-700">{prettifyLabel(stage)}</span>
                            <span className="text-muted-foreground">{count}</span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-sky-500" style={{ width: `${width}%` }} />
                          </div>
                        </div>
                      )
                    })
                )}
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900">Recent leads</h3>
                {stats.recentLeads.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent leads yet.</p>
                ) : (
                  stats.recentLeads.slice(0, 3).map((lead) => (
                    <Link
                      key={lead.id}
                      href={`/admin/leads/${lead.id}`}
                      className="block rounded-2xl border border-slate-200 px-4 py-3 transition-colors hover:bg-slate-50"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 space-y-1">
                          <p className="truncate font-semibold text-slate-900">{lead.fullName}</p>
                          <p className="truncate text-sm text-slate-600">{lead.companyName || lead.email}</p>
                        </div>
                        <StatusBadge status={lead.status} />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                        <span className="truncate">{lead.email}</span>
                        <span>{format(new Date(lead.createdAt), "dd MMM")}</span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card className="rounded-[28px] border-slate-200 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-6">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">Billing overview</h2>
              <p className="text-sm text-muted-foreground">
                Collection status across currencies, with invoice pressure surfaced clearly.
              </p>
            </div>
            <Link href="/admin/invoices">
              <Button variant="ghost" className="text-slate-700 hover:text-slate-900">
                View all
              </Button>
            </Link>
          </div>
          <div className="space-y-6 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Collected this month</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {formatCurrencyBreakdown(stats.revenueThisMonthByCurrency)}
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Outstanding</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {formatCurrencyBreakdown(stats.outstandingByCurrency)}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-slate-900">Invoice status</h3>
              {Object.entries(stats.invoiceStatusSummary || {}).length === 0 ? (
                <p className="text-sm text-muted-foreground">Invoice status distribution will appear here.</p>
              ) : (
                Object.entries(stats.invoiceStatusSummary || {})
                  .sort((a, b) => b[1] - a[1])
                  .map(([status, count]) => (
                    <div
                      key={status}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3"
                    >
                      <span className="text-sm font-medium text-slate-700">{prettifyLabel(status)}</span>
                      <Badge variant="outline" className="border-slate-200 text-slate-600">
                        {count}
                      </Badge>
                    </div>
                  ))
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <Card className="rounded-[28px] border-slate-200 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-6">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">Project activity</h2>
              <p className="text-sm text-muted-foreground">
                Delivery coverage and the latest active projects, kept intentionally compact.
              </p>
            </div>
            <Link href="/admin/projects">
              <Button variant="ghost" className="text-slate-700 hover:text-slate-900">
                View all
              </Button>
            </Link>
          </div>
          <div className="space-y-5 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Active projects
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{stats.activeProjects}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {topProjectCategory
                    ? `${prettifyLabel(topProjectCategory[0])} is the busiest lane`
                    : "Project mix will appear here"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Delivery spread
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{totalProjectMixCount || 0}</p>
                <p className="mt-1 text-sm text-slate-500">Tracked category allocations</p>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">Project mix</h3>
                  <Badge variant="outline" className="border-slate-200 text-slate-600">
                    {stats.activeProjects} active
                  </Badge>
                </div>
                {Object.entries(stats.projectMixByCategory || {}).length === 0 ? (
                  <p className="text-sm text-muted-foreground">Project category distribution will appear here.</p>
                ) : (
                  Object.entries(stats.projectMixByCategory || {})
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 4)
                    .map(([category, count]) => {
                      const width = (count / Math.max(1, totalProjectMixCount)) * 100

                      return (
                        <div key={category} className="space-y-1.5 rounded-2xl border border-slate-200 px-4 py-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-slate-700">{prettifyLabel(category)}</span>
                            <span className="text-muted-foreground">{count}</span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-violet-500" style={{ width: `${width}%` }} />
                          </div>
                        </div>
                      )
                    })
                )}
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900">Recent projects</h3>
                {stats.recentProjects.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent projects yet.</p>
                ) : (
                  stats.recentProjects.slice(0, 3).map((project) => (
                    <Link
                      key={project.id}
                      href={`/admin/projects/${project.id}`}
                      className="block rounded-2xl border border-slate-200 px-4 py-3 transition-colors hover:bg-slate-50"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 space-y-1">
                          <p className="truncate font-semibold text-slate-900">{project.projectName}</p>
                          <p className="truncate text-sm text-slate-600">{project.clientName}</p>
                        </div>
                        <StatusBadge status={project.status} />
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="w-14 shrink-0">Progress</span>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${project.progress}%` }} />
                        </div>
                        <span className="w-10 text-right">{project.progress}%</span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-[28px] border-slate-200 shadow-sm">
            <div className="space-y-5 p-6">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">Watchlist</h2>
                <p className="text-sm text-muted-foreground">
                  A smaller set of callouts for what needs follow-up right now.
                </p>
              </div>

              <div className="space-y-3">
                {watchlistItems.map((item) => {
                  const Icon = item.icon

                  return (
                    <div
                      key={item.label}
                      className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-slate-600">{item.label}</p>
                        <Icon className="h-4 w-4 text-slate-500" />
                      </div>
                      <p className="mt-3 text-lg font-semibold tracking-tight text-slate-900">{item.value}</p>
                      <p className="mt-1 text-sm leading-5 text-slate-500">{item.helper}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </Card>

          <Card className="rounded-[28px] border-slate-200 shadow-sm">
            <div className="space-y-4 p-6">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">Quick actions</h2>
                <p className="text-sm text-muted-foreground">
                  Jump directly into the highest-frequency admin tasks.
                </p>
              </div>
              {[
                { href: "/admin/leads/new", label: "Create lead", icon: Target },
                { href: "/admin/clients/new", label: "Add client", icon: Users2 },
                { href: "/admin/projects/new", label: "Start project", icon: BriefcaseBusiness },
                { href: "/admin/invoices/new", label: "Issue invoice", icon: FileText },
              ].map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50"
                >
                  <span className="inline-flex items-center gap-3">
                    <Icon className="h-4 w-4 text-slate-500" />
                    {label}
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-slate-500">Loading dashboard...</div>}>
      <AdminDashboardContent />
    </Suspense>
  )
}
