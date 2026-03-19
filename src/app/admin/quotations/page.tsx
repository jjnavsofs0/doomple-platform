"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Skeleton,
  DataTable,
  PageHeader,
} from "@/components/ui"
import type { ColumnDef } from "@/components/ui/data-table"
import { ChevronRight, Plus } from "lucide-react"

interface Quotation {
  id: string
  quotationNumber: string
  clientId?: string
  leadId?: string
  clientName: string
  title: string
  total: number
  status: "Draft" | "Sent" | "Accepted" | "Rejected" | "Expired"
  validUntil: string
  createdBy: string
  createdAt: string
}

const statusColors = {
  Draft: "bg-gray-100 text-gray-800",
  Sent: "bg-blue-100 text-blue-800",
  Accepted: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
  Expired: "bg-orange-100 text-orange-800",
}

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
})

export default function QuotationsPage() {
  const router = useRouter()
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<keyof Quotation>("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  useEffect(() => {
    fetchQuotations()
  }, [])

  const fetchQuotations = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/quotations")
      if (!response.ok) throw new Error("Failed to fetch quotations")
      const data = await response.json()
      setQuotations(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const filteredQuotations = quotations
    .filter((q) =>
      searchTerm
        ? q.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.title.toLowerCase().includes(searchTerm.toLowerCase())
        : true
    )
    .sort((a, b) => {
      const aVal = a[sortBy]
      const bVal = b[sortBy]

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal
      }

      const aStr = String(aVal).toLowerCase()
      const bStr = String(bVal).toLowerCase()
      return sortOrder === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr)
    })

  const columns: ColumnDef<Quotation>[] = [
    {
      id: "quotationNumber",
      header: "Quotation #",
      accessor: (row: Quotation) => row.quotationNumber,
      sortable: true,
    },
    {
      id: "clientName",
      header: "Client",
      accessor: (row: Quotation) => row.clientName,
      sortable: true,
    },
    {
      id: "title",
      header: "Title",
      accessor: (row: Quotation) => row.title,
      sortable: true,
    },
    {
      id: "total",
      header: "Total",
      accessor: (row: Quotation) => currencyFormatter.format(row.total),
      sortable: true,
    },
    {
      id: "status",
      header: "Status",
      accessor: (row: Quotation) => (
        <Badge className={statusColors[row.status as keyof typeof statusColors]}>
          {row.status}
        </Badge>
      ),
      sortable: true,
    },
    {
      id: "validUntil",
      header: "Valid Until",
      accessor: (row: Quotation) => new Date(row.validUntil).toLocaleDateString("en-IN"),
      sortable: true,
    },
    {
      id: "createdBy",
      header: "Created By",
      accessor: (row: Quotation) => row.createdBy,
      sortable: true,
    },
    {
      id: "actions",
      header: "Actions",
      accessor: (row: Quotation) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/admin/quotations/${row.id}`)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quotations"
        action={
          <Link href="/admin/quotations/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Quotation
            </Button>
          </Link>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <input
              type="text"
              placeholder="Search by quotation #, client, or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-red-800">{error}</CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Quotations</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : quotations.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No quotations found. Create one to get started.
            </div>
          ) : (
            <DataTable columns={columns} data={filteredQuotations} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
