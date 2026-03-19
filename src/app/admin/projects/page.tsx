"use client"

import * as React from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { DataTable, type ColumnDef } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { ProgressBar } from "@/components/admin/progress-bar"
import { Badge } from "@/components/ui/badge"

interface Project {
  id: string
  name: string
  clientName: string
  category: string
  status: "active" | "completed" | "on_hold" | "cancelled"
  progress: number
  managerName: string
  budget: number
  startDate: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = React.useState<Project[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [filters, setFilters] = React.useState({
    status: "",
    category: "",
    client: "",
    manager: "",
  })

  const [statusOptions, setStatusOptions] = React.useState<
    Array<{ value: string; label: string }>
  >([])
  const [categoryOptions, setCategoryOptions] = React.useState<
    Array<{ value: string; label: string }>
  >([])
  const [clientOptions, setClientOptions] = React.useState<
    Array<{ value: string; label: string }>
  >([])
  const [managerOptions, setManagerOptions] = React.useState<
    Array<{ value: string; label: string }>
  >([])

  React.useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/projects")
        if (!response.ok) throw new Error("Failed to fetch projects")
        const data = await response.json()
        const projectsList: Project[] = Array.isArray(data)
          ? data
          : (data.data || [])
        setProjects(projectsList)

        const statuses = Array.from(
          new Set(projectsList.map((p: Project) => p.status))
        ).map((s) => ({ value: s, label: s }))
        setStatusOptions(statuses)

        const categories = Array.from(
          new Set(projectsList.map((p: Project) => p.category))
        ).map((c) => ({ value: c, label: c }))
        setCategoryOptions(categories)

        const clients = Array.from(
          new Set(projectsList.map((p: Project) => p.clientName))
        ).map((c) => ({ value: c, label: c }))
        setClientOptions(clients)

        const managers = Array.from(
          new Set(projectsList.map((p: Project) => p.managerName))
        ).map((m) => ({ value: m, label: m }))
        setManagerOptions(managers)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        setProjects([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const filteredProjects = projects.filter((p) => {
    if (filters.status && p.status !== filters.status) return false
    if (filters.category && p.category !== filters.category) return false
    if (filters.client && p.clientName !== filters.client) return false
    if (filters.manager && p.managerName !== filters.manager) return false
    return true
  })

  const columns: ColumnDef<Project>[] = [
    {
      id: "name",
      header: "Project Name",
      accessor: (row) => row.name,
      searchable: true,
      sortable: true,
    },
    {
      id: "clientName",
      header: "Client",
      accessor: (row) => row.clientName,
      searchable: true,
      sortable: true,
    },
    {
      id: "category",
      header: "Category",
      accessor: (row) => (
        <Badge variant="outline" className="capitalize">
          {row.category}
        </Badge>
      ),
      sortable: true,
    },
    {
      id: "status",
      header: "Status",
      accessor: (row) => <StatusBadge status={row.status} />,
      sortable: true,
    },
    {
      id: "progress",
      header: "Progress",
      accessor: (row) => (
        <ProgressBar percentage={row.progress} size="sm" showLabel={true} />
      ),
      sortable: true,
    },
    {
      id: "managerName",
      header: "Manager",
      accessor: (row) => row.managerName,
      searchable: true,
      sortable: true,
    },
    {
      id: "budget",
      header: "Budget",
      accessor: (row) =>
        new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(row.budget),
      sortable: true,
    },
    {
      id: "startDate",
      header: "Start Date",
      accessor: (row) => new Date(row.startDate).toLocaleDateString(),
      sortable: true,
    },
  ]

  if (error) {
    return (
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        <PageHeader
          title="Projects"
          action={
            <Link href="/admin/projects/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </Link>
          }
        />
        <Card className="p-4 border-destructive/50 bg-destructive/5">
          <p className="text-destructive">{error}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Projects"
        description="Manage all projects and track their progress"
        action={
          <Link href="/admin/projects/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </Link>
        }
      />

      <Card>
        <div className="p-6 border-b space-y-4">
          <h3 className="font-semibold">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              label="Status"
              options={statusOptions}
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              placeholder="All Statuses"
            />
            <Select
              label="Category"
              options={categoryOptions}
              value={filters.category}
              onChange={(e) =>
                setFilters({ ...filters, category: e.target.value })
              }
              placeholder="All Categories"
            />
            <Select
              label="Client"
              options={clientOptions}
              value={filters.client}
              onChange={(e) => setFilters({ ...filters, client: e.target.value })}
              placeholder="All Clients"
            />
            <Select
              label="Manager"
              options={managerOptions}
              value={filters.manager}
              onChange={(e) =>
                setFilters({ ...filters, manager: e.target.value })
              }
              placeholder="All Managers"
            />
          </div>
          {Object.values(filters).some((v) => v) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setFilters({
                  status: "",
                  category: "",
                  client: "",
                  manager: "",
                })
              }
            >
              Clear Filters
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="p-6">
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        ) : (
          <div className="p-6">
            <DataTable
              columns={columns}
              data={filteredProjects}
              onRowClick={(row) => {
                window.location.href = `/admin/projects/${row.id}`
              }}
              searchPlaceholder="Search projects by name or client..."
              emptyMessage="No projects found."
              pageSize={10}
            />
          </div>
        )}
      </Card>
    </div>
  )
}
