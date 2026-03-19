"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Mail,
  Phone,
  Plus,
  Receipt,
  RefreshCcw,
  Search,
  Users2,
} from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "@/components/ui/status-badge"
import { Badge } from "@/components/ui/badge"
import { useAdminLiveRefetch } from "@/hooks/use-live-refetch"
import { cn } from "@/lib/utils"

interface Client {
  id: string
  companyName: string
  contactPersonName: string
  email: string
  phone: string | null
  status: "active" | "inactive"
  projects_count: number
  invoices_count: number
  createdAt?: string
}

const statusOptions = [
  { value: "", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
]

const summaryCardStyles = [
  "from-sky-50 to-white border-sky-100",
  "from-emerald-50 to-white border-emerald-100",
  "from-amber-50 to-white border-amber-100",
  "from-rose-50 to-white border-rose-100",
]

export default function ClientsPage() {
  const router = useRouter()
  const [clients, setClients] = React.useState<Client[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("")

  const fetchClients = React.useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch("/api/clients?limit=250", { cache: "no-store" })
      if (!response.ok) {
        throw new Error("Failed to fetch clients")
      }

      const data = await response.json()
      setClients(Array.isArray(data) ? data : data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setClients([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchClients()
  }, [fetchClients])

  useAdminLiveRefetch(["dashboard", "clients"], fetchClients)

  const filteredClients = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return clients.filter((client) => {
      if (statusFilter && client.status !== statusFilter) {
        return false
      }

      if (!query) {
        return true
      }

      return [
        client.companyName,
        client.contactPersonName,
        client.email,
        client.phone || "",
      ].some((value) => value.toLowerCase().includes(query))
    })
  }, [clients, searchQuery, statusFilter])

  const summary = React.useMemo(() => {
    const activeClients = clients.filter((client) => client.status === "active").length
    const inactiveClients = clients.length - activeClients
    const activeProjects = clients.reduce((sum, client) => sum + (client.projects_count || 0), 0)
    const invoiceRelationships = clients.reduce((sum, client) => sum + (client.invoices_count || 0), 0)

    return [
      {
        label: "Client accounts",
        value: clients.length,
        helper: `${activeClients} active and engaged`,
        icon: Users2,
      },
      {
        label: "Active accounts",
        value: activeClients,
        helper: `${inactiveClients} inactive on file`,
        icon: Building2,
      },
      {
        label: "Linked projects",
        value: activeProjects,
        helper: "Projects currently mapped to clients",
        icon: BriefcaseBusiness,
      },
      {
        label: "Invoice relationships",
        value: invoiceRelationships,
        helper: "Invoices connected to these accounts",
        icon: Receipt,
      },
    ]
  }, [clients])

  if (error) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <Card className="border-destructive/40 bg-destructive/5 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-destructive">Clients area unavailable</p>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={fetchClients}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Retry
              </Button>
              <Link href="/admin/clients/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Client
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
        <div className="grid gap-8 px-6 py-7 md:px-8 lg:grid-cols-[1.25fr_0.95fr] lg:items-end">
          <div className="space-y-5">
            <Badge variant="outline" className="w-fit border-white/20 text-white/90">
              Client operations
            </Badge>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Keep every client relationship visible, current, and easy to act on.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-white/72 md:text-base">
                Track account health, communication ownership, and delivery load from one place
                so the team can move from follow-up to invoicing without hopping between pages.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/admin/clients/new">
                <Button className="bg-white text-slate-900 hover:bg-white/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Client
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={fetchClients}
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
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-600">{item.label}</p>
                    <Icon className="h-5 w-5 text-slate-500" />
                  </div>
                  <p className="mt-4 text-3xl font-semibold tracking-tight">{item.value}</p>
                  <p className="mt-2 text-sm leading-5 text-slate-600">{item.helper}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <Card className="rounded-[28px] border-slate-200 shadow-sm">
        <div className="flex flex-col gap-5 border-b border-slate-100 p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">Client directory</h2>
              <p className="text-sm text-muted-foreground">
                Search accounts by company, contact, or email and move directly into the client
                workspace.
              </p>
            </div>
            {(searchQuery || statusFilter) && (
              <Button
                variant="ghost"
                className="justify-start text-slate-600 hover:text-slate-900"
                onClick={() => {
                  setSearchQuery("")
                  setStatusFilter("")
                }}
              >
                Reset filters
              </Button>
            )}
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by company, contact, email, or phone"
                className="h-11 rounded-2xl border-slate-200 bg-slate-50 pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
              className="h-11 rounded-2xl border-slate-200 bg-slate-50"
              options={statusOptions}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4 p-6">
            <Skeleton className="h-24 rounded-3xl" />
            <Skeleton className="h-24 rounded-3xl" />
            <Skeleton className="h-24 rounded-3xl" />
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
            <div className="rounded-full bg-slate-100 p-4 text-slate-500">
              <Users2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-slate-900">No clients match these filters</h3>
              <p className="text-sm text-muted-foreground">
                Clear the filters or add a new client to start building your account pipeline.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setStatusFilter("")
                }}
              >
                Clear filters
              </Button>
              <Link href="/admin/clients/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Client
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredClients.map((client) => {
              const initials = client.companyName
                .split(" ")
                .slice(0, 2)
                .map((part) => part.charAt(0).toUpperCase())
                .join("")

              return (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => router.push(`/admin/clients/${client.id}`)}
                  className="w-full text-left transition-colors hover:bg-slate-50/80"
                >
                  <div className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white shadow-sm">
                        {initials || "CL"}
                      </div>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-slate-900">{client.companyName}</h3>
                            <StatusBadge status={client.status} />
                          </div>
                          <p className="text-sm text-slate-600">{client.contactPersonName}</p>
                        </div>
                        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {client.email}
                          </span>
                          {client.phone && (
                            <span className="inline-flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              {client.phone}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Joined{" "}
                            {client.createdAt ? format(new Date(client.createdAt), "dd MMM yyyy") : "recently"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 lg:min-w-[320px] lg:items-end">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="rounded-full border-slate-200 px-3 py-1 text-slate-600">
                          {client.projects_count || 0} projects
                        </Badge>
                        <Badge variant="outline" className="rounded-full border-slate-200 px-3 py-1 text-slate-600">
                          {client.invoices_count || 0} invoices
                        </Badge>
                      </div>
                      <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-900">
                        Open client workspace
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
