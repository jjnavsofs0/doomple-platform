"use client"

import { Suspense, useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Flame,
  Plus,
  RefreshCcw,
  Search,
  Target,
  Upload,
} from "lucide-react"
import { format } from "date-fns"
import type { Lead, User } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "@/components/ui/status-badge"
import { Badge } from "@/components/ui/badge"
import { LeadImportModal } from "@/components/admin/lead-import-modal"
import { useAdminLiveRefetch } from "@/hooks/use-live-refetch"
import { cn } from "@/lib/utils"

interface LeadWithRelations extends Lead {
  assignedTo: User | null
}

interface PaginatedResponse {
  success: boolean
  data: LeadWithRelations[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface LeadSummary {
  total: number
  fresh: number
  active: number
  hot: number
  converted: number
}

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "DISCOVERY_SCHEDULED", label: "Discovery Scheduled" },
  { value: "PROPOSAL_SENT", label: "Proposal Sent" },
  { value: "NEGOTIATION", label: "Negotiation" },
  { value: "WON", label: "Won" },
  { value: "LOST", label: "Lost" },
  { value: "ON_HOLD", label: "On Hold" },
]

const CATEGORY_OPTIONS = [
  { value: "", label: "All categories" },
  { value: "SERVICE_INQUIRY", label: "Service inquiry" },
  { value: "SOLUTION_INQUIRY", label: "Solution inquiry" },
  { value: "UEP_INQUIRY", label: "UEP inquiry" },
  { value: "SAAS_TOOLKIT_INQUIRY", label: "SaaS toolkit inquiry" },
  { value: "WORKFORCE_INQUIRY", label: "Workforce inquiry" },
  { value: "SUPPORT_INQUIRY", label: "Support inquiry" },
  { value: "PARTNERSHIP_INQUIRY", label: "Partnership inquiry" },
]

const PRIORITY_OPTIONS = [
  { value: "", label: "All priorities" },
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
]

const statusColorMap = {
  NEW: "outline",
  CONTACTED: "default",
  QUALIFIED: "success",
  DISCOVERY_SCHEDULED: "warning",
  PROPOSAL_SENT: "warning",
  NEGOTIATION: "default",
  WON: "success",
  LOST: "destructive",
  ON_HOLD: "outline",
} as const

const priorityColorMap = {
  LOW: "outline",
  MEDIUM: "default",
  HIGH: "warning",
  URGENT: "destructive",
} as const

const summaryCardStyles = [
  "from-sky-50 to-white border-sky-100",
  "from-violet-50 to-white border-violet-100",
  "from-amber-50 to-white border-amber-100",
  "from-emerald-50 to-white border-emerald-100",
]

function LeadsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentPage = Math.max(1, Number(searchParams.get("page") || "1"))
  const currentStatus = searchParams.get("status") || ""
  const currentCategory = searchParams.get("category") || ""
  const currentPriority = searchParams.get("priority") || ""
  const currentSearch = searchParams.get("search") || ""

  const [leads, setLeads] = useState<LeadWithRelations[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 })
  const [summary, setSummary] = useState<LeadSummary>({
    total: 0,
    fresh: 0,
    active: 0,
    hot: 0,
    converted: 0,
  })
  const [loading, setLoading] = useState(true)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState(currentSearch)
  const [showImportModal, setShowImportModal] = useState(false)

  const updateSearchParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())

      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      })

      if (!("page" in updates)) {
        params.set("page", "1")
      }

      const query = params.toString()
      router.push(query ? `?${query}` : "?")
    },
    [router, searchParams]
  )

  useEffect(() => {
    setSearchInput(currentSearch)
  }, [currentSearch])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (searchInput !== currentSearch) {
        updateSearchParams({ search: searchInput || null })
      }
    }, 250)

    return () => window.clearTimeout(timeout)
  }, [currentSearch, searchInput, updateSearchParams])

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "12",
        ...(currentStatus && { status: currentStatus }),
        ...(currentCategory && { category: currentCategory }),
        ...(currentPriority && { priority: currentPriority }),
        ...(currentSearch && { search: currentSearch }),
      })

      const response = await fetch(`/api/leads?${params.toString()}`, { cache: "no-store" })
      if (!response.ok) {
        throw new Error("Failed to fetch leads")
      }

      const data: PaginatedResponse = await response.json()
      setLeads(data.data || [])
      setPagination({
        page: data.pagination?.page || 1,
        limit: data.pagination?.limit || 12,
        total: data.pagination?.total || 0,
        totalPages: data.pagination?.totalPages || 1,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load leads")
      setLeads([])
    } finally {
      setLoading(false)
    }
  }, [currentCategory, currentPage, currentPriority, currentSearch, currentStatus])

  const fetchSummary = useCallback(async () => {
    const countLeads = async (params?: Record<string, string>) => {
      const query = new URLSearchParams({ limit: "1", ...params }).toString()
      const response = await fetch(`/api/leads?${query}`, { cache: "no-store" })
      if (!response.ok) {
        throw new Error("Failed to fetch lead summary")
      }

      const data: PaginatedResponse = await response.json()
      return data.pagination?.total || 0
    }

    try {
      setSummaryLoading(true)
      const [total, fresh, converted, lost, high, urgent] = await Promise.all([
        countLeads(),
        countLeads({ status: "NEW" }),
        countLeads({ status: "WON" }),
        countLeads({ status: "LOST" }),
        countLeads({ priority: "HIGH" }),
        countLeads({ priority: "URGENT" }),
      ])

      setSummary({
        total,
        fresh,
        active: Math.max(0, total - converted - lost),
        hot: high + urgent,
        converted,
      })
    } catch {
      setSummary({
        total: 0,
        fresh: 0,
        active: 0,
        hot: 0,
        converted: 0,
      })
    } finally {
      setSummaryLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  useAdminLiveRefetch(["dashboard", "leads"], async () => {
    await Promise.all([fetchLeads(), fetchSummary()])
  })

  const activeFilters = useMemo(
    () => [currentSearch, currentStatus, currentCategory, currentPriority].filter(Boolean).length,
    [currentCategory, currentPriority, currentSearch, currentStatus]
  )

  const summaryCards = useMemo(
    () => [
      {
        label: "Total leads",
        value: summary.total,
        helper: "All lead records across the pipeline",
        icon: Target,
      },
      {
        label: "Fresh leads",
        value: summary.fresh,
        helper: "Still in new intake and waiting on first movement",
        icon: CircleDot,
      },
      {
        label: "Hot follow-ups",
        value: summary.hot,
        helper: "High and urgent opportunities needing close attention",
        icon: Flame,
      },
      {
        label: "Converted",
        value: summary.converted,
        helper: `${summary.active} still active in the pipeline`,
        icon: ArrowRight,
      },
    ],
    [summary]
  )

  if (error) {
    return (
      <div className="space-y-6 p-6 md:p-8">
        <Card className="border-destructive/40 bg-destructive/5 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-destructive">Lead pipeline unavailable</p>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={fetchLeads}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Retry
              </Button>
              <Link href="/admin/leads/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Lead
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white shadow-xl">
        <div className="grid gap-8 px-6 py-7 md:px-8 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div className="space-y-5">
            <Badge variant="outline" className="w-fit border-white/20 text-white/90">
              Lead pipeline
            </Badge>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Review pipeline movement, urgency, and next conversations from one screen.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-white/72 md:text-base">
                Keep intake quality high, move the right leads faster, and spot stalled deals
                before they disappear from the team&apos;s attention.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/admin/leads/new">
                <Button className="bg-white text-slate-900 hover:bg-white/90">
                  <Plus className="mr-2 h-4 w-4" />
                  New Lead
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => setShowImportModal(true)}
                className="gap-2 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              >
                <Upload className="h-4 w-4" />
                Import
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  fetchLeads()
                  fetchSummary()
                }}
                className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {summaryCards.map((item, index) => {
              const Icon = item.icon

              return (
                <div
                  key={item.label}
                  className={cn(
                    "rounded-3xl border bg-gradient-to-br p-5 text-slate-900",
                    summaryCardStyles[index]
                  )}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-600">{item.label}</p>
                    <Icon className="h-5 w-5 text-slate-500" />
                  </div>
                  {summaryLoading ? (
                    <Skeleton className="mt-4 h-9 w-16 rounded-xl bg-slate-200" />
                  ) : (
                    <p className="mt-4 text-3xl font-semibold tracking-tight">{item.value}</p>
                  )}
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
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">Lead queue</h2>
              <p className="text-sm text-muted-foreground">
                Filter by stage, inquiry type, and urgency, then jump straight into the lead
                workspace.
              </p>
            </div>
            {activeFilters > 0 && (
              <Button
                variant="ghost"
                className="justify-start text-slate-600 hover:text-slate-900"
                onClick={() =>
                  updateSearchParams({
                    search: null,
                    status: null,
                    category: null,
                    priority: null,
                    page: "1",
                  })
                }
              >
                Reset filters
              </Button>
            )}
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.3fr_0.9fr_0.9fr_0.9fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by lead, company, or email"
                className="h-11 rounded-2xl border-slate-200 bg-slate-50 pl-10"
              />
            </div>
            <Select
              value={currentStatus}
              onValueChange={(value) => updateSearchParams({ status: value || null })}
              className="h-11 rounded-2xl border-slate-200 bg-slate-50"
              options={STATUS_OPTIONS}
            />
            <Select
              value={currentCategory}
              onValueChange={(value) => updateSearchParams({ category: value || null })}
              className="h-11 rounded-2xl border-slate-200 bg-slate-50"
              options={CATEGORY_OPTIONS}
            />
            <Select
              value={currentPriority}
              onValueChange={(value) => updateSearchParams({ priority: value || null })}
              className="h-11 rounded-2xl border-slate-200 bg-slate-50"
              options={PRIORITY_OPTIONS}
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-4 p-6">
            <Skeleton className="h-28 rounded-3xl" />
            <Skeleton className="h-28 rounded-3xl" />
            <Skeleton className="h-28 rounded-3xl" />
          </div>
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
            <div className="rounded-full bg-slate-100 p-4 text-slate-500">
              <Target className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-slate-900">No leads found</h3>
              <p className="text-sm text-muted-foreground">
                Try loosening the filters or create a new lead to keep the pipeline moving.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() =>
                  updateSearchParams({
                    search: null,
                    status: null,
                    category: null,
                    priority: null,
                    page: "1",
                  })
                }
              >
                Clear filters
              </Button>
              <Link href="/admin/leads/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Lead
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="divide-y divide-slate-100">
              {leads.map((lead) => {
                const initials = lead.fullName
                  .split(" ")
                  .slice(0, 2)
                  .map((part) => part.charAt(0).toUpperCase())
                  .join("")

                return (
                  <button
                    key={lead.id}
                    type="button"
                    onClick={() => router.push(`/admin/leads/${lead.id}`)}
                    className="w-full text-left transition-colors hover:bg-slate-50/80"
                  >
                    <div className="flex flex-col gap-5 p-6 xl:flex-row xl:items-center xl:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white shadow-sm">
                          {initials || "LD"}
                        </div>
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-semibold text-slate-900">{lead.fullName}</h3>
                              <StatusBadge status={lead.status} customColorMap={statusColorMap} />
                              <StatusBadge status={lead.priority} customColorMap={priorityColorMap} />
                            </div>
                            <p className="text-sm text-slate-600">
                              {lead.companyName || "Independent inquiry"} · {lead.email}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="rounded-full border-slate-200 px-3 py-1 text-slate-600">
                              {lead.category.replace(/_/g, " ").toLowerCase()}
                            </Badge>
                            {lead.assignedTo?.name ? (
                              <Badge
                                variant="outline"
                                className="rounded-full border-slate-200 px-3 py-1 text-slate-600"
                              >
                                {lead.assignedTo.name}
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="rounded-full border-amber-200 px-3 py-1 text-amber-700"
                              >
                                Unassigned
                              </Badge>
                            )}
                            <Badge variant="outline" className="rounded-full border-slate-200 px-3 py-1 text-slate-600">
                              Added {format(new Date(lead.createdAt), "dd MMM yyyy")}
                            </Badge>
                          </div>
                          {lead.requirementsSummary && (
                            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                              {lead.requirementsSummary.length > 180
                                ? `${lead.requirementsSummary.slice(0, 180).trim()}...`
                                : lead.requirementsSummary}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 xl:min-w-[210px] xl:items-end">
                        {lead.phone && (
                          <p className="text-sm text-slate-600">{lead.phone}</p>
                        )}
                        <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-900">
                          Open lead workspace
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex flex-col gap-4 border-t border-slate-100 px-6 py-5 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} leads
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateSearchParams({ page: String(Math.max(1, currentPage - 1)) })}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateSearchParams({
                        page: String(Math.min(pagination.totalPages, currentPage + 1)),
                      })
                    }
                    disabled={currentPage >= pagination.totalPages}
                  >
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
      <LeadImportModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImported={() => {
          setShowImportModal(false)
          fetchLeads()
          fetchSummary()
        }}
      />
    </div>
  )
}

export default function LeadsPage() {
  return (
    <Suspense fallback={<div className="space-y-6 p-6 md:p-8" />}>
      <LeadsPageContent />
    </Suspense>
  )
}
