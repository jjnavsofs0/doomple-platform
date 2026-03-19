"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Skeleton,
  DataTable,
  PageHeader,
} from "@/components/ui"
import { ArrowLeft, Download, Send, Check, X } from "lucide-react"

interface LineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  taxPercent: number
  discount: number
}

interface StatusHistory {
  status: string
  changedAt: string
  changedBy: string
}

interface Quotation {
  id: string
  quotationNumber: string
  clientName: string
  title: string
  description: string
  validUntil: string
  termsNotes: string
  status: "Draft" | "Sent" | "Accepted" | "Rejected" | "Expired"
  lineItems: LineItem[]
  subtotal: number
  taxAmount: number
  totalDiscount: number
  total: number
  statusHistory?: StatusHistory[]
  createdAt: string
  createdBy: string
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

export default function QuotationDetailPage() {
  const router = useRouter()
  const params = useParams()
  const quotationId = params.id as string

  const [quotation, setQuotation] = useState<Quotation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchQuotation()
  }, [quotationId])

  const fetchQuotation = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/quotations/${quotationId}`)
      if (!response.ok) throw new Error("Failed to fetch quotation")
      const data = await response.json()
      setQuotation(data.data || data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!quotation) return

    try {
      setActionLoading(true)
      const response = await fetch(`/api/quotations/${quotationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error("Failed to update quotation status")
      const updated = await response.json()
      setQuotation(updated.data || updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status")
    } finally {
      setActionLoading(false)
    }
  }

  const handleCreateInvoice = async () => {
    if (!quotation) return

    try {
      setActionLoading(true)
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quotationId: quotation.id,
          clientName: quotation.clientName,
          lineItems: quotation.lineItems,
          subtotal: quotation.subtotal,
          taxAmount: quotation.taxAmount,
          totalDiscount: quotation.totalDiscount,
          total: quotation.total,
        }),
      })

      if (!response.ok) throw new Error("Failed to create invoice")
      const invoice = await response.json()
      router.push(`/admin/invoices/${invoice.data?.id || invoice.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create invoice")
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Quotation Details" />
        <Card>
          <CardContent className="space-y-2 pt-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!quotation) {
    return (
      <div className="space-y-6">
        <PageHeader title="Quotation Not Found" />
        <Card>
          <CardContent className="pt-6">
            <Button onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const lineItemColumns = [
    {
      id: "index",
      header: "#",
      accessor: (_row: LineItem) => "",
    },
    {
      id: "description",
      header: "Description",
      accessor: (row: LineItem) => row.description,
    },
    {
      id: "quantity",
      header: "Qty",
      accessor: (row: LineItem) => row.quantity,
    },
    {
      id: "unitPrice",
      header: "Unit Price",
      accessor: (row: LineItem) => currencyFormatter.format(row.unitPrice),
    },
    {
      id: "taxPercent",
      header: "Tax %",
      accessor: (row: LineItem) => `${row.taxPercent}%`,
    },
    {
      id: "discount",
      header: "Discount",
      accessor: (row: LineItem) => currencyFormatter.format(row.discount),
    },
    {
      id: "total",
      header: "Total",
      accessor: (row: LineItem) => {
        const baseTotal = row.quantity * row.unitPrice
        const withTax = baseTotal * (1 + row.taxPercent / 100)
        const total = Math.max(0, withTax - row.discount)
        return currencyFormatter.format(total)
      },
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <PageHeader title={`Quotation ${quotation.quotationNumber}`} />
          </div>
        </div>
        <Badge className={statusColors[quotation.status as keyof typeof statusColors]}>
          {quotation.status}
        </Badge>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-red-800">{error}</CardContent>
        </Card>
      )}

      {/* Quotation Info */}
      <Card>
        <CardHeader>
          <CardTitle>Quotation Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-gray-600">Client</p>
            <p className="mt-1 text-lg text-gray-900">{quotation.clientName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Title</p>
            <p className="mt-1 text-lg text-gray-900">{quotation.title}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Valid Until</p>
            <p className="mt-1 text-lg text-gray-900">
              {new Date(quotation.validUntil).toLocaleDateString("en-IN")}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Created By</p>
            <p className="mt-1 text-lg text-gray-900">{quotation.createdBy}</p>
          </div>
          {quotation.description && (
            <div className="sm:col-span-2">
              <p className="text-sm font-medium text-gray-600">Description</p>
              <p className="mt-1 text-gray-900">{quotation.description}</p>
            </div>
          )}
          {quotation.termsNotes && (
            <div className="sm:col-span-2">
              <p className="text-sm font-medium text-gray-600">Terms & Notes</p>
              <p className="mt-1 text-gray-900">{quotation.termsNotes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={lineItemColumns} data={quotation.lineItems} />
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-gray-700">
            <span>Subtotal:</span>
            <span>{currencyFormatter.format(quotation.subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Tax Amount:</span>
            <span>{currencyFormatter.format(quotation.taxAmount)}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Discount:</span>
            <span>-{currencyFormatter.format(quotation.totalDiscount)}</span>
          </div>
          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between text-lg font-bold text-gray-900">
              <span>Total:</span>
              <span>{currencyFormatter.format(quotation.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status History */}
      {quotation.statusHistory && quotation.statusHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Status History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {quotation.statusHistory.map((entry, idx) => (
                <div key={idx} className="flex justify-between border-b border-gray-200 pb-2 last:border-0">
                  <div>
                    <Badge>{entry.status}</Badge>
                    <p className="mt-1 text-sm text-gray-600">by {entry.changedBy}</p>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    {new Date(entry.changedAt).toLocaleDateString("en-IN")}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {quotation.status === "Draft" && (
            <Button
              onClick={() => handleStatusChange("Sent")}
              disabled={actionLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="mr-2 h-4 w-4" />
              Mark as Sent
            </Button>
          )}

          {quotation.status === "Sent" && (
            <>
              <Button
                onClick={() => handleStatusChange("Accepted")}
                disabled={actionLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="mr-2 h-4 w-4" />
                Accept
              </Button>
              <Button
                onClick={() => handleStatusChange("Rejected")}
                disabled={actionLoading}
                variant="destructive"
              >
                <X className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </>
          )}

          {quotation.status === "Accepted" && (
            <Button
              onClick={handleCreateInvoice}
              disabled={actionLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Create Invoice
            </Button>
          )}

          <Button
            variant="outline"
            disabled
          >
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
