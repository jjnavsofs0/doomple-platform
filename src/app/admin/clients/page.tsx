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

interface Client {
  id: string
  companyName: string
  contactPersonName: string
  email: string
  phone: string
  status: "active" | "inactive"
  projects_count: number
  invoices_count: number
}

export default function ClientsPage() {
  const [clients, setClients] = React.useState<Client[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchClients = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/clients")
        if (!response.ok) throw new Error("Failed to fetch clients")
        const data = await response.json()
        setClients(
          Array.isArray(data) ? data : data.data || []
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        setClients([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchClients()
  }, [])

  const columns: ColumnDef<Client>[] = [
    {
      id: "companyName",
      header: "Company Name",
      accessor: (row) => row.companyName,
      searchable: true,
      sortable: true,
    },
    {
      id: "contactPersonName",
      header: "Contact",
      accessor: (row) => row.contactPersonName,
      searchable: true,
      sortable: true,
    },
    {
      id: "email",
      header: "Email",
      accessor: (row) => row.email,
      searchable: true,
      sortable: true,
    },
    {
      id: "phone",
      header: "Phone",
      accessor: (row) => row.phone,
      sortable: true,
    },
    {
      id: "projects_count",
      header: "Projects",
      accessor: (row) => row.projects_count || 0,
      sortable: true,
    },
    {
      id: "invoices_count",
      header: "Invoices",
      accessor: (row) => row.invoices_count || 0,
      sortable: true,
    },
    {
      id: "status",
      header: "Status",
      accessor: (row) => <StatusBadge status={row.status} />,
      sortable: true,
    },
  ]

  if (error) {
    return (
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        <PageHeader
          title="Clients"
          action={
            <Link href="/admin/clients/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Client
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
        title="Clients"
        description="Manage your client accounts, projects, and communications"
        action={
          <Link href="/admin/clients/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </Link>
        }
      />

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <Card>
          <div className="p-6">
            <DataTable
              columns={columns}
              data={clients}
              onRowClick={(row) => {
                window.location.href = `/admin/clients/${row.id}`
              }}
              searchPlaceholder="Search clients by name, contact, or email..."
              emptyMessage="No clients found. Create one to get started."
              pageSize={10}
            />
          </div>
        </Card>
      )}
    </div>
  )
}
