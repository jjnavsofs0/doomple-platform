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

interface Invoice {
  id: string
  invoiceNumber: string
  clientName: string
  projectName?: string
  issueDate: string
  dueDate: string
  total: number
  amountPaid: number
  status: "Draft" | "Sent" | "Partially Paid" | "Paid" | "Overdue" | "Cancelled"
  billingCategory: string
  createdAt: string
}

const statusColors = {
  Draft: "bg-gray-100 text-gray-800",
  Sent: "bg-blue-100 text-blue-800",
  "Partially Paid": "bg-yellow-100 text-yellow-800",
  Paid: "bg-green-100 text-green-800",
  Overdue: "bg-red-100 text-red-800",
  Cancelled: "bg-orange-100 text-orange-800",
}

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
})

export default function InvoicesPage() {
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/invoices")
      if (!response.ok) throw new Error("Failed to fetch invoices")
      const data = await response.json()
      setInvoices(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch = searchTerm
      ? inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.clientName.toLowerCase().includes(searchTerm.toLowerCase())
      : true

    const matchesStatus = statusFilter ? inv.status === statusFilter : true
    const matchesCategory = categoryFilter ? inv.billingCategory === categoryFilter : true

    return matchesSearch && matchesStatus && matchesCategory
  })

  const uniqueCategories = Array.from(new Set(invoices.map((inv) => inv.billingCategory)))
  const uniqueStatuses = Array.from(new Set(invoices.map((inv) => inv.status)))

  const isOverdue = (invoice: Invoice) => {
    return invoice.status === "Overdue" || (new Date(invoice.dueDate) < new Date() && invoice.status !== "Paid")
  }

  const columns: ColumnDef<Invoice>[] = [
    {
      id: "invoiceNumber",
      header: "Invoice #",
      accessor: (row: Invoice) => row.invoiceNumber,
      sortable: true,
    },
    {
      id: "clientName",
      header: "Client",
      accessor: (row: Invoice) => row.clientName,
      sortable: true,
    },
    {
      id: "projectName",
      header: "Project",
      accessor: (row: Invoice) => row.projectName || "-",
      sortable: true,
    },
    {
      id: "issueDate",
      header: "Issue Date",
      accessor: (row: Invoice) => new Date(row.issueDate).toLocaleDateString("en-IN"),
      sortable: true,
    },
    {
      id: "dueDate",
      header: "Due Date",
      accessor: (row: Invoice) => new Date(row.dueDate).toLocaleDateString("en-IN"),
      sortable: true,
    },
    {
      id: "total",
      header: "Total",
      accessor: (row: Invoice) => currencyFormatter.format(row.total),
      sortable: true,
    },
    {
      id: "status",
      header: "Status",
      accessor: (row: Invoice) => (
        <Badge className={statusColors[row.status as keyof typeof statusColors]}>
          {row.status}
        </Badge>
      ),
      sortable: true,
    },
    {
      id: "payment",
      header: "Payment",
      accessor: (row: Invoice) => {
        const pending = row.total - row.amountPaid
        return (
          <div className="text-sm">
            <p className="text-green-600 font-medium">{currencyFormatter.format(row.amountPaid)}</p>
            <p className="text-orange-600 text-xs">{currencyFormatter.format(pending)} pending</p>
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      accessor: (row: Invoice) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/admin/invoices/${row.id}`)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        action={
          <Link href="/admin/invoices/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Button>
          </Link>
        }
      />

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {currencyFormatter.format(
                invoices.reduce((sum, inv) => sum + inv.amountPaid, 0)
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {currencyFormatter.format(
                invoices.reduce((sum, inv) => sum + (inv.total - inv.amountPaid), 0)
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {currencyFormatter.format(
                invoices
                  .filter((inv) => {
                    const invDate = new Date(inv.issueDate)
                    const now = new Date()
                    return (
                      invDate.getMonth() === now.getMonth() &&
                      invDate.getFullYear() === now.getFullYear()
                    )
                  })
                  .reduce((sum, inv) => sum + inv.amountPaid, 0)
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Search</label>
              <input
                type="text"
                placeholder="Invoice # or client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">All Statuses</option>
                {uniqueStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">All Categories</option>
                {uniqueCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-red-800">{error}</CardContent>
        </Card>
      )}

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : invoices.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No invoices found. Create one to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    {columns.map((col) => (
                      <th key={col.id} className="px-4 py-3 text-left font-medium text-gray-700">
                        {col.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className={`border-b border-gray-200 hover:bg-gray-50 ${
                        isOverdue(invoice) ? "bg-red-50" : ""
                      }`}
                    >
                      {columns.map((col) => (
                        <td key={col.id} className="px-4 py-3">
                          {col.accessor(invoice)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
