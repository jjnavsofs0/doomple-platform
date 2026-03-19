"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Skeleton,
  DataTable,
  PageHeader,
} from "@/components/ui"

interface Payment {
  id: string
  paymentId: string
  invoiceNumber: string
  invoiceId: string
  clientName: string
  amount: number
  method: string
  razorpayPaymentId: string
  status: "success" | "pending" | "failed"
  createdAt: string
}

const statusColors = {
  success: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-800",
}

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
})

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/payments")
      if (!response.ok) throw new Error("Failed to fetch payments")
      const data = await response.json()
      setPayments(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = searchTerm
      ? payment.paymentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.razorpayPaymentId.toLowerCase().includes(searchTerm.toLowerCase())
      : true

    const matchesStatus = statusFilter ? payment.status === statusFilter : true

    return matchesSearch && matchesStatus
  })

  const totalCollected = payments
    .filter((p) => p.status === "success")
    .reduce((sum, p) => sum + p.amount, 0)

  const totalPending = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0)

  const thisMonthCollected = payments
    .filter((p) => {
      const paymentDate = new Date(p.createdAt)
      const now = new Date()
      return (
        p.status === "success" &&
        paymentDate.getMonth() === now.getMonth() &&
        paymentDate.getFullYear() === now.getFullYear()
      )
    })
    .reduce((sum, p) => sum + p.amount, 0)

  const columns = [
    {
      id: "paymentId",
      header: "Payment ID",
      accessor: (row: Payment) => (
        <code className="rounded bg-gray-100 px-2 py-1 text-xs font-mono">
          {row.paymentId}
        </code>
      ),
      sortable: true,
    },
    {
      id: "invoiceNumber",
      header: "Invoice #",
      accessor: (row: Payment) => row.invoiceNumber,
      sortable: true,
    },
    {
      id: "clientName",
      header: "Client",
      accessor: (row: Payment) => row.clientName,
      sortable: true,
    },
    {
      id: "amount",
      header: "Amount",
      accessor: (row: Payment) => currencyFormatter.format(row.amount),
      sortable: true,
    },
    {
      id: "method",
      header: "Method",
      accessor: (row: Payment) => row.method,
      sortable: true,
    },
    {
      id: "razorpayPaymentId",
      header: "Razorpay ID",
      accessor: (row: Payment) => (
        <code className="rounded bg-gray-100 px-2 py-1 text-xs font-mono">
          {row.razorpayPaymentId}
        </code>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessor: (row: Payment) => (
        <Badge className={statusColors[row.status as keyof typeof statusColors]}>
          {row.status}
        </Badge>
      ),
      sortable: true,
    },
    {
      id: "createdAt",
      header: "Date",
      accessor: (row: Payment) => new Date(row.createdAt).toLocaleDateString("en-IN"),
      sortable: true,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Payments" />

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Collected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {currencyFormatter.format(totalCollected)}
            </p>
            <p className="mt-1 text-xs text-gray-600">
              {payments.filter((p) => p.status === "success").length} successful payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {currencyFormatter.format(totalPending)}
            </p>
            <p className="mt-1 text-xs text-gray-600">
              {payments.filter((p) => p.status === "pending").length} pending payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {currencyFormatter.format(thisMonthCollected)}
            </p>
            <p className="mt-1 text-xs text-gray-600">
              {new Date().toLocaleDateString("en-IN", {
                month: "long",
                year: "numeric",
              })}
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Search
              </label>
              <input
                type="text"
                placeholder="Payment ID, Invoice #, Client, or Razorpay ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">All Statuses</option>
                <option value="success">Success</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
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

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : payments.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No payments found yet.
            </div>
          ) : (
            <DataTable columns={columns} data={filteredPayments} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
