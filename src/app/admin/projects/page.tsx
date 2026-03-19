"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  FolderKanban,
  Plus,
  RefreshCcw,
  Search,
  Users2,
} from "lucide-react"
import { format } from "date-fns"
import { ProgressBar } from "@/components/admin/progress-bar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "@/components/ui/status-badge"
import { useAdminLiveRefetch } from "@/hooks/use-live-refetch"
import { cn, formatCurrency } from "@/lib/utils"

interface Project {
  id: string
  name: string
  clientName: string
  category: string
  status: string
  progress: number
  managerName: string
  budget: number
  currency?: string
  startDate: string | null
  createdAt?: string
}

const summaryCardStyles = [
  "from-sky-50 to-white border-sky-100",
  "from-emerald-50 to-white border-emerald-100",
  "from-amber-50 to-white border-amber-100",
  "from-violet-50 to-white border-violet-100",
]

const statusColorMap = {
  draft: "outline",
  active: "success",
  discovery: "default",
  in_design: "default",
  in_development: "warning",
  in_review: "warning",
  on_hold: "destructive",
  completed: "success",
  cancelled: "destructive",
} as const

const prettifyLabel = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = React.useState<Project[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [filters, setFilters] = React.useState({
    status: "",
    category: "",
    client: "",
    manager: "",
  })

  const fetchProjects = React.useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch("/api/projects?limit=250", { cache: "no-store" })
      if (!response.ok) {
        throw new Error("Failed to fetch projects")
      }

      const data = await response.json()
      setProjects(Array.isArray(data) ? data : data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setProjects([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  useAdminLiveRefetch(["dashboard", "projects"], fetchProjects)

  const filterOptions = React.useMemo(() => {
    const getOptions = (values: string[]) =>
      Array.from(new Set(values.filter(Boolean))).map((value) => ({
        value,
        label: prettifyLabel(value),
      }))

    return {
      status: [{ value: "", label: "All statuses" }, ...getOptions(projects.map((project) => project.status))],
      category: [
        { value: "", label: "All categories" },
        ...getOptions(projects.map((project) => project.category)),
      ],
      client: [
        { value: "", label: "All clients" },
        ...Array.from(new Set(projects.map((project) => project.clientName).filter(Boolean))).map((value) => ({
          value,
          label: value,
        })),
      ],
      manager: [
        { value: "", label: "All managers" },
        ...Array.from(new Set(projects.map((project) => project.managerName).filter(Boolean))).map((value) => ({
          value,
          label: value,
        })),
      ],
    }
  }, [projects])

  const filteredProjects = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return projects.filter((project) => {
      if (filters.status && project.status !== filters.status) return false
      if (filters.category && project.category !== filters.category) return false
      if (filters.client && project.clientName !== filters.client) return false
      if (filters.manager && project.managerName !== filters.manager) return false

      if (!query) return true

      return [
        project.name,
        project.clientName,
        project.category,
        project.managerName,
        project.status,
      ].some((value) => value.toLowerCase().includes(query))
    })
  }, [filters, projects, searchQuery])

  const summary = React.useMemo(() => {
    const activeProjects = projects.filter(
      (project) => !["COMPLETED", "CANCELLED"].includes(project.status)
    ).length
    const deliveryProjects = projects.filter((project) =>
      ["IN_DEVELOPMENT", "IN_REVIEW", "IN_DESIGN"].includes(project.status)
    ).length
    const uniqueManagers = new Set(
      projects.map((project) => project.managerName).filter((name) => name && name !== "Unassigned")
    ).size
    const budgetByCurrency = Object.entries(
      projects.reduce<Record<string, number>>((acc, project) => {
        const currency = project.currency || "INR"
        acc[currency] = (acc[currency] || 0) + Number(project.budget || 0)
        return acc
      }, {})
    )

    return [
      {
        label: "Projects in workspace",
        value: projects.length,
        helper: `${activeProjects} still active across delivery`,
        icon: FolderKanban,
      },
      {
        label: "Delivery in motion",
        value: deliveryProjects,
        helper: "Projects currently in design, build, or review",
        icon: BriefcaseBusiness,
      },
      {
        label: "Budget coverage",
        value: budgetByCurrency.length > 0 ? budgetByCurrency.map(([currency, total]) => formatCurrency(total, currency)).join(" · ") : formatCurrency(0, "INR"),
        helper: "Total booked value across all project currencies",
        icon: CalendarDays,
      },
      {
        label: "Assigned managers",
        value: uniqueManagers,
        helper: "People currently carrying project ownership",
        icon: Users2,
      },
    ]
  }, [projects])

  const activeFilters = React.useMemo(
    () => [searchQuery, filters.status, filters.category, filters.client, filters.manager].filter(Boolean).length,
    [filters.category, filters.client, filters.manager, filters.status, searchQuery]
  )

  if (error) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <Card className="border-destructive/40 bg-destructive/5 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-destructive">Projects area unavailable</p>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={fetchProjects}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Retry
              </Button>
              <Link href="/admin/projects/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Project
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
              Delivery workspace
            </Badge>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Track delivery load, ownership, and momentum without falling back to a spreadsheet view.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-white/72 md:text-base">
                Review every active project by client, stage, budget, and progress so delivery, finance, and account teams all stay aligned.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/admin/projects/new">
                <Button className="bg-white text-slate-900 hover:bg-white/90">
                  <Plus className="mr-2 h-4 w-4" />
                  New Project
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={fetchProjects}
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
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">Project roster</h2>
              <p className="text-sm text-muted-foreground">
                Filter by delivery stage, category, client, or manager and move straight into the project workspace.
              </p>
            </div>
            {activeFilters > 0 && (
              <Button
                variant="ghost"
                className="justify-start text-slate-600 hover:text-slate-900"
                onClick={() => {
                  setSearchQuery("")
                  setFilters({ status: "", category: "", client: "", manager: "" })
                }}
              >
                Reset filters
              </Button>
            )}
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.25fr_0.9fr_0.9fr_0.9fr_0.9fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by project, client, category, or manager"
                className="h-11 rounded-2xl border-slate-200 bg-slate-50 pl-10"
              />
            </div>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters((current) => ({ ...current, status: value }))}
              className="h-11 rounded-2xl border-slate-200 bg-slate-50"
              options={filterOptions.status}
            />
            <Select
              value={filters.category}
              onValueChange={(value) => setFilters((current) => ({ ...current, category: value }))}
              className="h-11 rounded-2xl border-slate-200 bg-slate-50"
              options={filterOptions.category}
            />
            <Select
              value={filters.client}
              onValueChange={(value) => setFilters((current) => ({ ...current, client: value }))}
              className="h-11 rounded-2xl border-slate-200 bg-slate-50"
              options={filterOptions.client}
            />
            <Select
              value={filters.manager}
              onValueChange={(value) => setFilters((current) => ({ ...current, manager: value }))}
              className="h-11 rounded-2xl border-slate-200 bg-slate-50"
              options={filterOptions.manager}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4 p-6">
            <Skeleton className="h-32 rounded-3xl" />
            <Skeleton className="h-32 rounded-3xl" />
            <Skeleton className="h-32 rounded-3xl" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
            <div className="rounded-full bg-slate-100 p-4 text-slate-500">
              <FolderKanban className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-slate-900">No projects match these filters</h3>
              <p className="text-sm text-muted-foreground">
                Clear the filters or create a new project to bring delivery work into the workspace.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setFilters({ status: "", category: "", client: "", manager: "" })
                }}
              >
                Clear filters
              </Button>
              <Link href="/admin/projects/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Project
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredProjects.map((project) => {
              const initials = project.name
                .split(" ")
                .slice(0, 2)
                .map((part) => part.charAt(0).toUpperCase())
                .join("")

              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => router.push(`/admin/projects/${project.id}`)}
                  className="w-full text-left transition-colors hover:bg-slate-50/80"
                >
                  <div className="flex flex-col gap-5 p-6 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white shadow-sm">
                        {initials || "PR"}
                      </div>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-slate-900">{project.name}</h3>
                            <StatusBadge status={project.status} customColorMap={statusColorMap} />
                          </div>
                          <p className="text-sm text-slate-600">{project.clientName}</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="rounded-full border-slate-200 px-3 py-1 text-slate-600">
                            {prettifyLabel(project.category)}
                          </Badge>
                          <Badge variant="outline" className="rounded-full border-slate-200 px-3 py-1 text-slate-600">
                            {project.managerName || "Unassigned"}
                          </Badge>
                          <Badge variant="outline" className="rounded-full border-slate-200 px-3 py-1 text-slate-600">
                            {project.currency || "INR"}
                          </Badge>
                          <Badge variant="outline" className="rounded-full border-slate-200 px-3 py-1 text-slate-600">
                            Started{" "}
                            {project.startDate ? format(new Date(project.startDate), "dd MMM yyyy") : "To be scheduled"}
                          </Badge>
                        </div>

                        <div className="max-w-xl">
                          <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                            <span>Delivery progress</span>
                            <span>{Math.round(project.progress || 0)}%</span>
                          </div>
                          <ProgressBar
                            percentage={project.progress || 0}
                            size="sm"
                            showLabel={false}
                            variant={
                              project.status === "COMPLETED"
                                ? "success"
                                : project.status === "ON_HOLD" || project.status === "CANCELLED"
                                  ? "destructive"
                                  : "default"
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 xl:min-w-[260px] xl:items-end">
                      <div className="space-y-1 text-left xl:text-right">
                        <p className="text-sm text-slate-500">Budget</p>
                        <p className="text-lg font-semibold text-slate-900">
                          {formatCurrency(project.budget || 0, project.currency || "INR")}
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-900">
                        Open project workspace
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
