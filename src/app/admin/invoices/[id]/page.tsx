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
import {
  ArrowLeft,
  Download,
  Send,
  CreditCard,
  AlertTriangle,
  Copy,
  Check,
} from "lucide-react"

interface LineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  taxPercent: number
  discount: number
}

interface Payment {
  id: string
  amount: number
  method: string
  razorpayPaymentId?: string
  date: string
}

interface Invoice {
  id: string
  invoiceNumber: string
  clientName: string
  projectName?: string
  issueDate: string
  dueDate: string
  billingCategory: string
  notes: string
  status: "Draft" | "Sent" | "Partially Paid" | "Paid" | "Overdue" | "Cancelled"
  lineItems: LineItem[]
  subtotal: number
  taxAmount: number
  totalDiscount: number
  total: number
  amountPaid: number
  payments: Payment[]
  createdAt: string
  createdBy: string
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

export default function InvoiceDetailPage() {
  const router = useRouter()
  const params = useParams()
  const invoiceId = params.id as string

  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [paymentLink, setPaymentLink] = useState<string | null>(null)
  const [manualPaymentAmount, setManualPaymentAmount] = useState("")
  const [showManualPaymentForm, setShowManualPaymentForm] = useState(false)
  const [copied, setCopied] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    fetchInvoice()
  }, [invoiceId])

  const fetchInvoice = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)
      const response = await fetch(`/api/invoices/${invoiceId}`)
      if (!response.ok) throw new Error("Failed to fetch invoice")
      const data = await response.json()
      setInvoice(data.data || data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!invoice) return

    try {
      setActionLoading(true)
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error("Failed to update invoice status")
      const updated = await response.json()
      setInvoice(updated.data || updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status")
    } finally {
      setActionLoading(false)
    }
  }

  const handleGeneratePaymentLink = async () => {
    if (!invoice) return

    try {
      setActionLoading(true)
      setError(null)
      setSuccess(null)
      const response = await fetch("/api/razorpay/create-payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: invoice.id,
        }),
      })

      if (!response.ok) throw new Error("Failed to generate payment link")
      const result = await response.json()
      setPaymentLink(result.data?.shortUrl || null)
      setSuccess("Payment link generated successfully")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate payment link")
    } finally {
      setActionLoading(false)
    }
  }

  const handleRecordManualPayment = async () => {
    if (!invoice || !manualPaymentAmount) {
      setError("Please enter a payment amount")
      return
    }

    const amount = parseFloat(manualPaymentAmount)
    if (amount <= 0 || amount > invoice.total - invoice.amountPaid) {
      setError("Invalid payment amount")
      return
    }

    try {
      setActionLoading(true)
      setSuccess(null)
      const response = await fetch(`/api/invoices/${invoiceId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          method: "Manual",
          date: new Date().toISOString(),
        }),
      })

      if (!response.ok) throw new Error("Failed to record payment")
      const updated = await response.json()
      setInvoice(updated.data || updated)
      setManualPaymentAmount("")
      setShowManualPaymentForm(false)
      setSuccess("Payment recorded successfully")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record payment")
    } finally {
      setActionLoading(false)
    }
  }

  const handleSendInvoice = async () => {
    if (!invoice) return

    try {
      setActionLoading(true)
      setError(null)
      setSuccess(null)

      const response = await fetch(`/api/invoices/${invoice.id}/send`, {
        method: "POST",
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to send invoice")
      }

      setSuccess(result.message || "Invoice email sent successfully")
      await fetchInvoice()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invoice")
    } finally {
      setActionLoading(false)
    }
  }

  const handleOpenPdf = (download = false) => {
    if (!invoice) return

    const url = `/api/invoices/${invoice.id}/pdf${download ? "?download=1" : ""}`

    if (download) {
      window.open(url, "_blank", "noopener,noreferrer")
      return
    }

    setPdfPreviewUrl(url)
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Invoice Details" />
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

  if (!invoice) {
    return (
      <div className="space-y-6">
        <PageHeader title="Invoice Not Found" />
        <Card>
          <CardContent className="pt-6">
            <Button onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isOverdue = new Date(invoice.dueDate) < new Date() && invoice.status !== "Paid"
  const balanceDue = invoice.total - invoice.amountPaid

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
      {isOverdue && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-3 pt-6 text-red-800">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-medium">Invoice Overdue</p>
              <p className="text-sm">This invoice was due on {new Date(invoice.dueDate).toLocaleDateString("en-IN")}</p>
            </div>
          </CardContent>
        </Card>
      )}

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
            <PageHeader title={`Invoice ${invoice.invoiceNumber}`} />
          </div>
        </div>
        <Badge className={statusColors[invoice.status as keyof typeof statusColors]}>
          {invoice.status}
        </Badge>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-red-800">{error}</CardContent>
        </Card>
      )}

      {success && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6 text-green-800">{success}</CardContent>
        </Card>
      )}

      {/* Invoice Info */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-gray-600">Client</p>
            <p className="mt-1 text-lg text-gray-900">{invoice.clientName}</p>
          </div>
          {invoice.projectName && (
            <div>
              <p className="text-sm font-medium text-gray-600">Project</p>
              <p className="mt-1 text-lg text-gray-900">{invoice.projectName}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-600">Issue Date</p>
            <p className="mt-1 text-lg text-gray-900">
              {new Date(invoice.issueDate).toLocaleDateString("en-IN")}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Due Date</p>
            <p className={`mt-1 text-lg font-medium ${isOverdue ? "text-red-600" : "text-gray-900"}`}>
              {new Date(invoice.dueDate).toLocaleDateString("en-IN")}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Category</p>
            <p className="mt-1 text-lg text-gray-900">{invoice.billingCategory}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Created By</p>
            <p className="mt-1 text-lg text-gray-900">{invoice.createdBy}</p>
          </div>
          {invoice.notes && (
            <div className="sm:col-span-2">
              <p className="text-sm font-medium text-gray-600">Notes</p>
              <p className="mt-1 text-gray-900">{invoice.notes}</p>
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
          <DataTable columns={lineItemColumns} data={invoice.lineItems} />
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
            <span>{currencyFormatter.format(invoice.subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Tax Amount:</span>
            <span>{currencyFormatter.format(invoice.taxAmount)}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Discount:</span>
            <span>-{currencyFormatter.format(invoice.totalDiscount)}</span>
          </div>
          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between text-lg font-bold text-gray-900">
              <span>Total:</span>
              <span>{currencyFormatter.format(invoice.total)}</span>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between text-lg text-gray-900">
              <span>Amount Paid:</span>
              <span className="text-green-600 font-medium">{currencyFormatter.format(invoice.amountPaid)}</span>
            </div>
            <div className="mt-2 flex justify-between text-lg font-bold">
              <span>Balance Due:</span>
              <span className={balanceDue > 0 ? "text-red-600" : "text-green-600"}>
                {currencyFormatter.format(balanceDue)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments */}
      {invoice.payments && invoice.payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invoice.payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between border-b border-gray-200 pb-3 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">{currencyFormatter.format(payment.amount)}</p>
                    <p className="text-sm text-gray-600">{payment.method}</p>
                    {payment.razorpayPaymentId && (
                      <p className="text-xs text-gray-500">ID: {payment.razorpayPaymentId}</p>
                    )}
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    {new Date(payment.date).toLocaleDateString("en-IN")}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Section */}
      {balanceDue > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Collect Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentLink && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">Payment Link Generated</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 break-all rounded bg-white px-3 py-2 text-sm font-mono text-gray-700">
                    {paymentLink}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(paymentLink)}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}

            {!showManualPaymentForm && (
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={handleGeneratePaymentLink}
                  disabled={actionLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Generate Payment Link
                </Button>
                <Button
                  onClick={() => setShowManualPaymentForm(true)}
                  variant="outline"
                >
                  Record Manual Payment
                </Button>
              </div>
            )}

            {showManualPaymentForm && (
              <div className="space-y-3 rounded-lg border border-gray-200 p-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Payment Amount
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={balanceDue}
                    step="0.01"
                    value={manualPaymentAmount}
                    onChange={(e) => setManualPaymentAmount(e.target.value)}
                    placeholder={`Up to ${currencyFormatter.format(balanceDue)}`}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleRecordManualPayment}
                    disabled={actionLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Record Payment
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowManualPaymentForm(false)
                      setManualPaymentAmount("")
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Invoice PDF</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => handleOpenPdf(false)}>
              Open PDF
            </Button>
            <Button variant="outline" onClick={() => handleOpenPdf(true)}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button onClick={handleSendInvoice} disabled={actionLoading}>
              <Send className="mr-2 h-4 w-4" />
              Send Invoice Email
            </Button>
          </div>

          {pdfPreviewUrl && (
            <iframe
              src={pdfPreviewUrl}
              className="h-[640px] w-full rounded-md border"
              title="Invoice PDF Preview"
            />
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {invoice.status === "Draft" && (
            <Button
              onClick={() => handleStatusChange("Sent")}
              disabled={actionLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="mr-2 h-4 w-4" />
              Mark as Sent
            </Button>
          )}

          {invoice.status !== "Paid" && invoice.status !== "Cancelled" && (
            <Button
              onClick={() => handleStatusChange("Cancelled")}
              disabled={actionLoading}
              variant="destructive"
            >
              Cancel Invoice
            </Button>
          )}

          <Button variant="outline" onClick={() => handleOpenPdf(true)}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
