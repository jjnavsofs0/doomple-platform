"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Badge, Button, Card, CardContent, Skeleton } from "@/components/ui"
import { useToast } from "@/components/ui/toast"
import { formatCurrency } from "@/lib/utils"
import {
  AlertTriangle,
  ArrowUpRight,
  ArrowLeft,
  CalendarDays,
  Check,
  Copy,
  CreditCard,
  Download,
  Edit,
  FileText,
  Receipt,
  Send,
  Wallet,
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

interface AuditEntry {
  id: string
  action: string
  summary: string
  createdAt: string
  userName: string
}

interface Invoice {
  id: string
  invoiceNumber: string
  clientName: string
  projectName?: string
  quotationId?: string | null
  quotationNumber?: string | null
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
  currency?: string
  canEdit?: boolean
  canDelete?: boolean
  payments: Payment[]
  auditTrail?: AuditEntry[]
  createdAt: string
  createdBy: string
}

const statusColors = {
  Draft: "border-slate-200 bg-slate-100 text-slate-700",
  Sent: "border-sky-200 bg-sky-100 text-sky-700",
  "Partially Paid": "border-amber-200 bg-amber-100 text-amber-700",
  Paid: "border-emerald-200 bg-emerald-100 text-emerald-700",
  Overdue: "border-rose-200 bg-rose-100 text-rose-700",
  Cancelled: "border-orange-200 bg-orange-100 text-orange-700",
}

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
})

function formatDate(value: string) {
  return dateFormatter.format(new Date(value))
}

function getLineItemTotal(item: LineItem) {
  const baseTotal = item.quantity * item.unitPrice
  const withTax = baseTotal * (1 + item.taxPercent / 100)
  return Math.max(0, withTax - item.discount)
}

function DetailItem({
  label,
  value,
  emphasized = false,
  tone = "cool",
}: {
  label: string
  value: string
  emphasized?: boolean
  tone?: "cool" | "warm"
}) {
  return (
    <div
      className={`rounded-2xl border px-4 py-4 ${
        tone === "warm"
          ? "border-[#EADACB] bg-[#FFF8F1]"
          : "border-[#E7EEF6] bg-[#F8FBFF]"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6B7280]">{label}</p>
      <p className={`mt-2 ${emphasized ? "text-lg font-semibold text-[#042042]" : "text-sm leading-7 text-[#374151]"}`}>
        {value}
      </p>
    </div>
  )
}

function SummaryRow({
  label,
  value,
  strong = false,
  accent = false,
  danger = false,
}: {
  label: string
  value: string
  strong?: boolean
  accent?: boolean
  danger?: boolean
}) {
  return (
    <div className={`flex items-center justify-between gap-4 ${strong ? "pt-4" : ""}`}>
      <span className="text-sm text-[#6B7280]">{label}</span>
      <span
        className={[
          strong ? "text-lg font-bold" : "text-sm font-medium",
          accent ? "text-[#1ABFAD]" : "",
          danger ? "text-[#DC2626]" : "",
          !accent && !danger ? "text-[#042042]" : "",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  )
}

export default function InvoiceDetailPage() {
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()
  const invoiceId = params.id as string
  const previewSectionRef = useRef<HTMLDivElement | null>(null)

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
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchInvoice()
  }, [invoiceId])

  useEffect(() => {
    return () => {
      if (pdfPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(pdfPreviewUrl)
      }
    }
  }, [pdfPreviewUrl])

  useEffect(() => {
    if (!pdfPreviewUrl) {
      return
    }

    const timer = window.setTimeout(() => {
      previewSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }, 120)

    return () => window.clearTimeout(timer)
  }, [pdfPreviewUrl])

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
      setError(null)
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error("Failed to update invoice status")
      const updated = await response.json()
      setInvoice(updated.data || updated)
      toast({
        type: "success",
        title: "Invoice status updated",
        description: `The invoice is now ${newStatus}.`,
      })
    } catch (err) {
      toast({
        type: "error",
        title: "Could not update invoice status",
        description:
          err instanceof Error ? err.message : "Failed to update status",
      })
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

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Failed to generate payment link")
      setPaymentLink(result.data?.shortUrl || null)
      toast({
        type: "success",
        title: "Payment link generated",
        description: "The invoice payment link is ready to share.",
      })
    } catch (err) {
      toast({
        type: "error",
        title: "Could not generate payment link",
        description:
          err instanceof Error ? err.message : "Failed to generate payment link",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleRecordManualPayment = async () => {
    if (!invoice || !manualPaymentAmount) {
      toast({
        type: "error",
        title: "Payment amount required",
        description: "Please enter a payment amount before saving.",
      })
      return
    }

    const amount = parseFloat(manualPaymentAmount)
    if (amount <= 0 || amount > invoice.total - invoice.amountPaid) {
      toast({
        type: "error",
        title: "Invalid payment amount",
        description: "Enter a valid amount within the remaining balance.",
      })
      return
    }

    try {
      setActionLoading(true)
      setError(null)
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
      toast({
        type: "success",
        title: "Payment recorded",
        description: "The manual payment was saved successfully.",
      })
    } catch (err) {
      toast({
        type: "error",
        title: "Could not record payment",
        description:
          err instanceof Error ? err.message : "Failed to record payment",
      })
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

      toast({
        type: "success",
        title: "Invoice sent",
        description: result.message || "The invoice email was sent successfully.",
      })
      await fetchInvoice()
    } catch (err) {
      toast({
        type: "error",
        title: "Could not send invoice",
        description:
          err instanceof Error ? err.message : "Failed to send invoice",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleOpenPdf = async (download = false) => {
    if (!invoice) return

    const url = `/api/invoices/${invoice.id}/pdf${download ? "?download=1" : ""}`

    if (download) {
      window.open(url, "_blank", "noopener,noreferrer")
      return
    }

    try {
      setActionLoading(true)
      setError(null)
      setSuccess(null)

      if (pdfPreviewUrl) {
        previewSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
        return
      }

      const response = await fetch(url)
      if (!response.ok) {
        const result = await response.json().catch(() => null)
        throw new Error(result?.error || "Failed to load invoice PDF preview")
      }

      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      setPdfPreviewUrl(objectUrl)
      toast({
        type: "success",
        title: "PDF preview ready",
        description: "The invoice PDF preview was loaded.",
      })
    } catch (err) {
      toast({
        type: "error",
        title: "Could not load PDF preview",
        description:
          err instanceof Error ? err.message : "Failed to load invoice PDF preview",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleOpenPdfFullView = async () => {
    if (!invoice) return

    try {
      setActionLoading(true)
      setError(null)
      setSuccess(null)

      let previewUrl = pdfPreviewUrl
      if (!previewUrl) {
        const response = await fetch(`/api/invoices/${invoice.id}/pdf`)
        if (!response.ok) {
          const result = await response.json().catch(() => null)
          throw new Error(result?.error || "Failed to load invoice PDF preview")
        }

        const blob = await response.blob()
        previewUrl = URL.createObjectURL(blob)
        setPdfPreviewUrl(previewUrl)
      }

      window.open(previewUrl, "_blank", "noopener,noreferrer")
    } catch (err) {
      toast({
        type: "error",
        title: "Could not open PDF full view",
        description:
          err instanceof Error ? err.message : "Failed to open invoice PDF full view",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const closePdfPreview = () => {
    if (pdfPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(pdfPreviewUrl)
    }
    setPdfPreviewUrl(null)
  }

  const handleDeleteInvoice = async () => {
    if (!invoice) return
    const confirmed = window.confirm(
      `Delete draft invoice ${invoice.invoiceNumber}? This cannot be undone.`
    )
    if (!confirmed) return

    try {
      setDeleting(true)
      setError(null)
      const response = await fetch(`/api/invoices/${invoice.id}`, {
        method: "DELETE",
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || "Failed to delete invoice")
      }
      toast({
        type: "success",
        title: "Invoice deleted",
        description: "The draft invoice was deleted successfully.",
      })
      router.push("/admin/invoices")
    } catch (err) {
      toast({
        type: "error",
        title: "Could not delete invoice",
        description:
          err instanceof Error ? err.message : "Failed to delete invoice",
      })
    } finally {
      setDeleting(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-[28px] border border-[#DDE8F2] bg-white p-8 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-8 w-28 justify-self-start lg:justify-self-end" />
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        </div>
        <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
          <Skeleton className="h-[520px] rounded-[28px]" />
          <Skeleton className="h-[420px] rounded-[28px]" />
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <Card className="rounded-[28px] border-[#E7EEF6] shadow-sm">
        <CardContent className="space-y-4 p-8">
          <p className="text-2xl font-semibold text-[#042042]">Invoice not found</p>
          <p className="text-sm text-[#6B7280]">
            The invoice you are looking for is unavailable or may have been removed.
          </p>
          <Button onClick={() => router.back()} className="bg-[#042042] text-white hover:bg-[#0A2C54]">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go back
          </Button>
        </CardContent>
      </Card>
    )
  }

  const isOverdue = new Date(invoice.dueDate) < new Date() && invoice.status !== "Paid"
  const balanceDue = invoice.total - invoice.amountPaid
  const isDraft = invoice.status === "Draft"
  const canSendInvoiceEmail = !isDraft && invoice.status !== "Cancelled"
  const canCollectPayment =
    balanceDue > 0 && !isDraft && invoice.status !== "Cancelled"

  const heroMetrics = [
    {
      label: "Invoice Total",
      value: formatCurrency(invoice.total, invoice.currency || "INR"),
      note: `${invoice.lineItems.length} billable entries`,
    },
    {
      label: "Paid So Far",
      value: formatCurrency(invoice.amountPaid, invoice.currency || "INR"),
      note: invoice.payments.length > 0 ? `${invoice.payments.length} payment entries` : "No payments yet",
    },
    {
      label: "Balance Due",
      value: formatCurrency(balanceDue, invoice.currency || "INR"),
      note: isOverdue ? "Immediate attention required" : `Due ${formatDate(invoice.dueDate)}`,
    },
    {
      label: "Invoice Status",
      value: invoice.status,
      note: invoice.projectName || invoice.billingCategory,
    },
  ]

  return (
    <div className="space-y-6">
      {isOverdue && (
        <Card className="rounded-[24px] border-rose-200 bg-rose-50 shadow-sm">
          <CardContent className="flex items-start gap-3 p-5 text-rose-700">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Invoice overdue</p>
              <p className="mt-1 text-sm">
                This invoice passed its due date on {formatDate(invoice.dueDate)} and still has an
                outstanding balance.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <section className="overflow-hidden rounded-[30px] border border-[#DDE8F2] bg-[linear-gradient(135deg,#042042_0%,#0A2C54_52%,#0F4C6B_100%)] p-6 text-white shadow-[0_24px_60px_rgba(4,32,66,0.14)] sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Badge className={statusColors[invoice.status]}>
            {invoice.status}
          </Badge>
        </div>

        <div className="mt-6 grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7CE6DA]">
              Invoice Workspace
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              {invoice.invoiceNumber}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
              Billing for {invoice.clientName}
              {invoice.projectName ? ` on ${invoice.projectName}` : ""}. This view keeps payment
              collection, PDF distribution, and invoice status in one cleaner operating screen.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {isDraft && (
                <Button
                  onClick={() => handleStatusChange("SENT")}
                  disabled={actionLoading}
                  className="bg-[#1ABFAD] text-white hover:bg-[#18AA9A]"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Move to Sent
                </Button>
              )}
              {invoice.canEdit && (
                <Button
                  variant="outline"
                  onClick={() => router.push(`/admin/invoices/${invoice.id}/edit`)}
                  className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => handleOpenPdf(false)}
                className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              >
                <FileText className="mr-2 h-4 w-4" />
                Preview PDF
              </Button>
              <Button
                variant="outline"
                onClick={() => handleOpenPdf(true)}
                className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              >
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
              {canSendInvoiceEmail && (
                <Button
                  onClick={handleSendInvoice}
                  disabled={actionLoading}
                  className="bg-[#1ABFAD] text-white hover:bg-[#18AA9A]"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Send Invoice Email
                </Button>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {heroMetrics.map((item) => (
              <div
                key={item.label}
                className="rounded-3xl border border-white/10 bg-white/10 px-5 py-5 backdrop-blur"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
                  {item.label}
                </p>
                <p className="mt-3 text-xl font-semibold text-white">{item.value}</p>
                <p className="mt-2 text-sm text-white/55">{item.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {error && (
        <Card className="rounded-[24px] border-rose-200 bg-rose-50 shadow-sm">
          <CardContent className="p-5 text-sm font-medium text-rose-700">{error}</CardContent>
        </Card>
      )}

      {success && (
        <Card className="rounded-[24px] border-emerald-200 bg-emerald-50 shadow-sm">
          <CardContent className="p-5 text-sm font-medium text-emerald-700">{success}</CardContent>
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <div className="space-y-6">
          <Card className="rounded-[28px] border-[#E7EEF6] shadow-sm">
            <CardContent className="p-6 sm:p-7">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-[#ECF6FF] p-3 text-[#1ABFAD]">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-[#042042]">Invoice Details</h2>
                  <p className="text-sm text-[#6B7280]">
                    Billing context, issue dates, and invoice notes for finance follow-through.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <DetailItem label="Client" value={invoice.clientName} emphasized />
                <DetailItem
                  label="Project"
                  value={invoice.projectName || "Standalone billing"}
                  emphasized={Boolean(invoice.projectName)}
                />
                <DetailItem
                  label="Source Quotation"
                  value={invoice.quotationNumber || "Not linked"}
                  emphasized={Boolean(invoice.quotationNumber)}
                />
                <DetailItem label="Issue Date" value={formatDate(invoice.issueDate)} />
                <DetailItem
                  label="Due Date"
                  value={formatDate(invoice.dueDate)}
                  tone={isOverdue ? "warm" : "cool"}
                />
                <DetailItem label="Billing Category" value={invoice.billingCategory} />
                <DetailItem label="Created By" value={invoice.createdBy} />
              </div>

              {invoice.notes && (
                <div className="mt-6 rounded-3xl border border-[#EADACB] bg-[#FFF8F1] px-5 py-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B56A36]">
                    Notes
                  </p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#4B5563]">
                    {invoice.notes}
                  </p>
                </div>
              )}

              {invoice.quotationId && invoice.quotationNumber && (
                <div className="mt-4 flex justify-start">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/admin/quotations/${invoice.quotationId}`)}
                    className="border-[#DDE8F2]"
                  >
                    Open Quotation {invoice.quotationNumber}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border-[#E7EEF6] shadow-sm">
            <CardContent className="p-0">
              <div className="border-b border-[#E7EEF6] px-6 py-5">
                <h2 className="text-xl font-semibold text-[#042042]">Line Items</h2>
                <p className="mt-1 text-sm text-[#6B7280]">
                  Full billing breakdown with taxes, discounts, and payable totals.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-[#F8FBFF]">
                    <tr className="text-left text-xs uppercase tracking-[0.18em] text-[#6B7280]">
                      <th className="px-6 py-4">Description</th>
                      <th className="px-4 py-4">Qty</th>
                      <th className="px-4 py-4">Unit Price</th>
                      <th className="px-4 py-4">Tax</th>
                      <th className="px-4 py-4">Discount</th>
                      <th className="px-6 py-4 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.lineItems.map((item) => (
                      <tr key={item.id} className="border-t border-[#E7EEF6] align-top">
                        <td className="px-6 py-5">
                          <p className="font-medium text-[#042042]">{item.description}</p>
                        </td>
                        <td className="px-4 py-5 text-sm text-[#4B5563]">{item.quantity}</td>
                        <td className="px-4 py-5 text-sm text-[#4B5563]">
                          {formatCurrency(item.unitPrice, invoice.currency || "INR")}
                        </td>
                        <td className="px-4 py-5 text-sm text-[#4B5563]">{item.taxPercent}%</td>
                        <td className="px-4 py-5 text-sm text-[#4B5563]">
                          {formatCurrency(item.discount, invoice.currency || "INR")}
                        </td>
                        <td className="px-6 py-5 text-right text-sm font-semibold text-[#042042]">
                          {formatCurrency(getLineItemTotal(item), invoice.currency || "INR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {invoice.payments && invoice.payments.length > 0 && (
            <Card className="rounded-[28px] border-[#E7EEF6] shadow-sm">
              <CardContent className="p-6 sm:p-7">
                <h2 className="text-xl font-semibold text-[#042042]">Payment History</h2>
                <p className="mt-1 text-sm text-[#6B7280]">
                  Recorded payments, methods used, and traceable references.
                </p>
                <div className="mt-6 space-y-4">
                  {invoice.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="rounded-3xl border border-[#E7EEF6] bg-[#F8FBFF] px-5 py-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-lg font-semibold text-[#042042]">
                            {formatCurrency(payment.amount, invoice.currency || "INR")}
                          </p>
                          <p className="mt-1 text-sm text-[#4B5563]">{payment.method}</p>
                          {payment.razorpayPaymentId && (
                            <p className="mt-2 text-xs text-[#6B7280]">
                              Reference: {payment.razorpayPaymentId}
                            </p>
                          )}
                        </div>
                        <span className="text-sm text-[#6B7280]">{formatDate(payment.date)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {pdfPreviewUrl && (
            <div ref={previewSectionRef} className="scroll-mt-24">
              <Card className="rounded-[28px] border-[#E7EEF6] shadow-sm">
              <CardContent className="p-0">
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E7EEF6] px-6 py-5">
                    <div>
                      <h2 className="text-xl font-semibold text-[#042042]">Invoice PDF Preview</h2>
                      <p className="mt-1 text-sm text-[#6B7280]">
                        Review the final invoice exactly as the client will receive it.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant="outline"
                        onClick={handleOpenPdfFullView}
                        className="border-[#DDE8F2]"
                      >
                        <ArrowUpRight className="mr-2 h-4 w-4" />
                        Full View
                      </Button>
                      <Button
                        variant="outline"
                        onClick={closePdfPreview}
                        className="border-[#DDE8F2]"
                      >
                        Close Preview
                      </Button>
                    </div>
                  </div>
                  <iframe
                    src={pdfPreviewUrl}
                    className="h-[720px] w-full rounded-b-[28px]"
                    title="Invoice PDF Preview"
                  />
              </CardContent>
              </Card>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card className="rounded-[28px] border-[#DDE8F2] shadow-sm">
            <CardContent className="p-6 sm:p-7">
              <h2 className="text-xl font-semibold text-[#042042]">Financial Summary</h2>
              <p className="mt-1 text-sm text-[#6B7280]">
                Total due, collected amount, and remaining balance at a glance.
              </p>

              <div className="mt-6 space-y-3 rounded-3xl border border-[#E7EEF6] bg-[#F8FBFF] p-5">
                <SummaryRow label="Subtotal" value={formatCurrency(invoice.subtotal, invoice.currency || "INR")} />
                <SummaryRow label="Tax Amount" value={formatCurrency(invoice.taxAmount, invoice.currency || "INR")} />
                <SummaryRow
                  label="Discount"
                  value={`-${formatCurrency(invoice.totalDiscount, invoice.currency || "INR")}`}
                />
                <div className="border-t border-[#DDE8F2]" />
                <SummaryRow label="Invoice Total" value={formatCurrency(invoice.total, invoice.currency || "INR")} strong />
                <SummaryRow
                  label="Amount Paid"
                  value={formatCurrency(invoice.amountPaid, invoice.currency || "INR")}
                  accent
                />
                <SummaryRow
                  label="Balance Due"
                  value={formatCurrency(balanceDue, invoice.currency || "INR")}
                  strong
                  danger={balanceDue > 0}
                  accent={balanceDue <= 0}
                />
              </div>
            </CardContent>
          </Card>

          {canCollectPayment && (
            <Card className="rounded-[28px] border-[#EADACB] bg-[#FFF8F1] shadow-sm">
              <CardContent className="p-6 sm:p-7">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-white p-3 text-[#B56A36] shadow-sm">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-[#042042]">Collect Payment</h2>
                    <p className="text-sm text-[#6B7280]">
                      Generate a client payment link or record a manual collection.
                    </p>
                  </div>
                </div>

                {paymentLink && (
                  <div className="mt-6 rounded-3xl border border-[#D8E8F8] bg-white p-4">
                    <p className="text-sm font-semibold text-[#042042]">Payment link ready</p>
                    <code className="mt-3 block break-all rounded-2xl bg-[#F8FBFF] px-3 py-3 text-xs text-[#4B5563]">
                      {paymentLink}
                    </code>
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(paymentLink)}
                      className="mt-3 border-[#DDE8F2]"
                    >
                      {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                      {copied ? "Copied" : "Copy Payment Link"}
                    </Button>
                  </div>
                )}

                {!showManualPaymentForm && (
                  <div className="mt-6 flex flex-col gap-3">
                    <Button
                      onClick={handleGeneratePaymentLink}
                      disabled={actionLoading}
                      className="bg-[#1ABFAD] text-white hover:bg-[#18AA9A]"
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Generate Payment Link
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowManualPaymentForm(true)}
                      className="border-[#DDE8F2]"
                    >
                      Record Manual Payment
                    </Button>
                  </div>
                )}

                {showManualPaymentForm && (
                  <div className="mt-6 space-y-4 rounded-3xl border border-[#D8E8F8] bg-white p-4">
                    <div>
                      <label className="block text-sm font-medium text-[#374151]">
                        Payment Amount
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={balanceDue}
                        step="0.01"
                        value={manualPaymentAmount}
                        onChange={(e) => setManualPaymentAmount(e.target.value)}
                        placeholder={`Up to ${formatCurrency(balanceDue, invoice.currency || "INR")}`}
                        className="mt-2 w-full rounded-2xl border border-[#DDE8F2] px-4 py-3 text-sm text-[#042042] outline-none transition focus:border-[#1ABFAD]"
                      />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        onClick={handleRecordManualPayment}
                        disabled={actionLoading}
                        className="bg-emerald-500 text-white hover:bg-emerald-600"
                      >
                        Record Payment
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowManualPaymentForm(false)
                          setManualPaymentAmount("")
                        }}
                        className="border-[#DDE8F2]"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {invoice.status !== "Paid" && invoice.status !== "Cancelled" && (
            <Card className="rounded-[28px] border-[#E7EEF6] shadow-sm">
              <CardContent className="p-6 sm:p-7">
                <h2 className="text-xl font-semibold text-[#042042]">Workflow Actions</h2>
                <p className="mt-1 text-sm text-[#6B7280]">
                  Move the invoice forward based on where it is in the billing lifecycle.
                </p>
                <div className="mt-6 flex flex-col gap-3">
                  {isDraft && (
                    <Button
                      onClick={() => handleStatusChange("SENT")}
                      disabled={actionLoading}
                      className="bg-[#042042] text-white hover:bg-[#0A2C54]"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Move to Sent
                    </Button>
                  )}
                  <Button
                    onClick={() => handleStatusChange("CANCELLED")}
                    disabled={actionLoading}
                    className="bg-rose-500 text-white hover:bg-rose-600"
                  >
                    Cancel Invoice
                  </Button>
                  {invoice.canDelete && (
                    <Button
                      variant="outline"
                      onClick={handleDeleteInvoice}
                      disabled={deleting}
                      className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                    >
                      {deleting ? "Deleting..." : "Delete Draft Invoice"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {invoice.auditTrail && invoice.auditTrail.length > 0 && (
            <Card className="rounded-[28px] border-[#E7EEF6] shadow-sm">
              <CardContent className="p-6 sm:p-7">
                <h2 className="text-xl font-semibold text-[#042042]">Audit Trail</h2>
                <p className="mt-1 text-sm text-[#6B7280]">
                  Recorded workflow and deletion actions for this invoice.
                </p>
                <div className="mt-6 space-y-4">
                  {invoice.auditTrail.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-3xl border border-[#E7EEF6] bg-[#F8FBFF] px-5 py-4"
                    >
                      <p className="text-sm font-medium text-[#042042]">{entry.summary}</p>
                      <p className="mt-1 text-xs text-[#6B7280]">
                        {new Date(entry.createdAt).toLocaleString("en-IN")} by {entry.userName}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="rounded-[28px] border-[#E7EEF6] shadow-sm">
            <CardContent className="p-6 sm:p-7">
              <h2 className="text-xl font-semibold text-[#042042]">Ops Notes</h2>
              <div className="mt-5 space-y-4">
                <div className="flex items-start gap-3">
                  <CalendarDays className="mt-0.5 h-4 w-4 text-[#1ABFAD]" />
                  <p className="text-sm leading-7 text-[#4B5563]">
                    Watch due dates alongside payment status so invoices do not stay in a silent
                    overdue state.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Receipt className="mt-0.5 h-4 w-4 text-[#1ABFAD]" />
                  <p className="text-sm leading-7 text-[#4B5563]">
                    Send the invoice PDF from this screen once line items and notes are final.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Wallet className="mt-0.5 h-4 w-4 text-[#1ABFAD]" />
                  <p className="text-sm leading-7 text-[#4B5563]">
                    Use manual payment capture only for offline collections that should update the
                    balance immediately.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
