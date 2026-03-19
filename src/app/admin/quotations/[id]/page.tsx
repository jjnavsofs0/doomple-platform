"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Badge, Button, Card, CardContent, Skeleton } from "@/components/ui"
import { useToast } from "@/components/ui/toast"
import { formatCurrency } from "@/lib/utils"
import {
  ArrowUpRight,
  ArrowLeft,
  CalendarDays,
  Check,
  Clock3,
  Download,
  Edit,
  FileText,
  Send,
  UserRound,
  X,
} from "lucide-react"

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

interface LinkedInvoice {
  id: string
  invoiceNumber: string
  status: string
  currency: string
  total: number
  createdAt: string
}

interface AuditEntry {
  id: string
  action: string
  summary: string
  createdAt: string
  userName: string
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
  currency?: string
  canEdit?: boolean
  canDelete?: boolean
  statusHistory?: StatusHistory[]
  linkedInvoices?: LinkedInvoice[]
  auditTrail?: AuditEntry[]
  createdAt: string
  createdBy: string
}

const statusColors = {
  Draft: "border-slate-200 bg-slate-100 text-slate-700",
  Sent: "border-sky-200 bg-sky-100 text-sky-700",
  Accepted: "border-emerald-200 bg-emerald-100 text-emerald-700",
  Rejected: "border-rose-200 bg-rose-100 text-rose-700",
  Expired: "border-amber-200 bg-amber-100 text-amber-700",
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
}: {
  label: string
  value: string
  emphasized?: boolean
}) {
  return (
    <div className="rounded-2xl border border-[#E7EEF6] bg-[#F8FBFF] px-4 py-4">
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
}: {
  label: string
  value: string
  strong?: boolean
  accent?: boolean
}) {
  return (
    <div className={`flex items-center justify-between gap-4 ${strong ? "pt-4" : ""}`}>
      <span className="text-sm text-[#6B7280]">{label}</span>
      <span
        className={[
          strong ? "text-lg font-bold" : "text-sm font-medium",
          accent ? "text-[#1ABFAD]" : "text-[#042042]",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  )
}

export default function QuotationDetailPage() {
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()
  const quotationId = params.id as string
  const previewSectionRef = useRef<HTMLDivElement | null>(null)

  const [quotation, setQuotation] = useState<Quotation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchQuotation()
  }, [quotationId])

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
      setError(null)
      const response = await fetch(`/api/quotations/${quotationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error("Failed to update quotation status")
      const updated = await response.json()
      setQuotation(updated.data || updated)
      toast({
        type: "success",
        title: "Quotation status updated",
        description: `The quotation is now ${newStatus}.`,
      })
    } catch (err) {
      toast({
        type: "error",
        title: "Could not update quotation status",
        description:
          err instanceof Error ? err.message : "Failed to update status",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleCreateInvoice = async () => {
    if (!quotation) return

    try {
      setActionLoading(true)
      setError(null)
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quotationId: quotation.id,
          currency: quotation.currency,
          clientName: quotation.clientName,
          lineItems: quotation.lineItems,
          subtotal: quotation.subtotal,
          taxAmount: quotation.taxAmount,
          totalDiscount: quotation.totalDiscount,
          total: quotation.total,
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        if (response.status === 409 && result?.data?.existingInvoice?.id) {
          router.push(`/admin/invoices/${result.data.existingInvoice.id}`)
          return
        }
        throw new Error(result?.error || "Failed to create invoice")
      }

      toast({
        type: "success",
        title: "Invoice created",
        description: "The quotation was converted into an invoice.",
      })
      router.push(`/admin/invoices/${result.data?.id || result.id}`)
    } catch (err) {
      toast({
        type: "error",
        title: "Could not create invoice",
        description:
          err instanceof Error ? err.message : "Failed to create invoice",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleOpenPdf = async (download = false) => {
    if (!quotation) return

    const url = `/api/quotations/${quotation.id}/pdf${download ? "?download=1" : ""}`
    if (download) {
      window.open(url, "_blank", "noopener,noreferrer")
      return
    }

    try {
      setActionLoading(true)
      setError(null)
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
        throw new Error(result?.error || "Failed to load quotation PDF preview")
      }

      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      setPdfPreviewUrl(objectUrl)
      toast({
        type: "success",
        title: "PDF preview ready",
        description: "The quotation PDF preview was loaded.",
      })
    } catch (err) {
      toast({
        type: "error",
        title: "Could not load PDF preview",
        description:
          err instanceof Error ? err.message : "Failed to load quotation PDF preview",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleOpenPdfFullView = async () => {
    if (!quotation) return

    try {
      setActionLoading(true)
      setError(null)

      let previewUrl = pdfPreviewUrl
      if (!previewUrl) {
        const response = await fetch(`/api/quotations/${quotation.id}/pdf`)
        if (!response.ok) {
          const result = await response.json().catch(() => null)
          throw new Error(result?.error || "Failed to load quotation PDF preview")
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
          err instanceof Error ? err.message : "Failed to open quotation PDF full view",
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

  const handleDeleteQuotation = async () => {
    if (!quotation) return
    const confirmed = window.confirm(
      `Move draft quotation ${quotation.quotationNumber} to the bin?`
    )
    if (!confirmed) return

    try {
      setDeleting(true)
      setError(null)
      const response = await fetch(`/api/quotations/${quotation.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || "Failed to delete quotation")
      }
      toast({
        type: "success",
        title: "Quotation moved to bin",
        description: "The draft quotation was moved to the bin.",
      })
      router.push("/admin/quotations")
    } catch (err) {
      toast({
        type: "error",
        title: "Could not delete quotation",
        description:
          err instanceof Error ? err.message : "Failed to delete quotation",
      })
    } finally {
      setDeleting(false)
    }
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
          <Skeleton className="h-[420px] rounded-[28px]" />
          <Skeleton className="h-[320px] rounded-[28px]" />
        </div>
      </div>
    )
  }

  if (!quotation) {
    return (
      <Card className="rounded-[28px] border-[#E7EEF6] shadow-sm">
        <CardContent className="space-y-4 p-8">
          <p className="text-2xl font-semibold text-[#042042]">Quotation not found</p>
          <p className="text-sm text-[#6B7280]">
            The quotation you are looking for is unavailable or may have been removed.
          </p>
          <Button onClick={() => router.back()} className="bg-[#042042] text-white hover:bg-[#0A2C54]">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go back
          </Button>
        </CardContent>
      </Card>
    )
  }

  const heroMetrics = [
    {
      label: "Quoted Value",
      value: formatCurrency(quotation.total, quotation.currency || "INR"),
      note: `${quotation.lineItems.length} line items`,
    },
    {
      label: "Valid Until",
      value: formatDate(quotation.validUntil),
      note: quotation.status === "Expired" ? "Needs review" : "Ready for approval",
    },
    {
      label: "Created By",
      value: quotation.createdBy,
      note: formatDate(quotation.createdAt),
    },
    {
      label: "Current Status",
      value: quotation.status,
      note: "Keep finance and delivery aligned",
    },
  ]
  const linkedInvoices = quotation.linkedInvoices || []
  const hasSingleLinkedInvoice = linkedInvoices.length === 1
  const hasMultipleLinkedInvoices = linkedInvoices.length > 1

  return (
    <div className="space-y-6">
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
          <Badge className={statusColors[quotation.status]}>
            {quotation.status}
          </Badge>
        </div>

        <div className="mt-6 grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7CE6DA]">
              Quotation Workspace
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              {quotation.quotationNumber}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
              {quotation.title} for {quotation.clientName}. This view brings commercial summary,
              approvals, PDF access, and invoice conversion into one cleaner workspace.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {quotation.status === "Draft" && (
                <Button
                  onClick={() => handleStatusChange("SENT")}
                  disabled={actionLoading}
                  className="bg-[#1ABFAD] text-white hover:bg-[#18AA9A]"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Move to Sent
                </Button>
              )}

              {quotation.status === "Sent" && (
                <>
                  <Button
                    onClick={() => handleStatusChange("ACCEPTED")}
                    disabled={actionLoading}
                    className="bg-emerald-500 text-white hover:bg-emerald-600"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Accept Quotation
                  </Button>
                  <Button
                    onClick={() => handleStatusChange("REJECTED")}
                    disabled={actionLoading}
                    className="bg-rose-500 text-white hover:bg-rose-600"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </>
              )}

              {quotation.status === "Accepted" && linkedInvoices.length === 0 && (
                <Button
                  onClick={handleCreateInvoice}
                  disabled={actionLoading}
                  className="bg-violet-600 text-white hover:bg-violet-700"
                >
                  Create Invoice
                </Button>
              )}

              {quotation.status === "Accepted" && hasSingleLinkedInvoice && (
                <Button
                  onClick={() => router.push(`/admin/invoices/${linkedInvoices[0].id}`)}
                  className="bg-violet-600 text-white hover:bg-violet-700"
                >
                  Open Linked Invoice
                </Button>
              )}

              {quotation.status === "Accepted" && hasMultipleLinkedInvoices && (
                <Button
                  variant="outline"
                  onClick={() =>
                    document.getElementById("linked-invoices-section")?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    })
                  }
                  className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                >
                  View Linked Invoices
                </Button>
              )}

              {quotation.canEdit && (
                <Button
                  variant="outline"
                  onClick={() => router.push(`/admin/quotations/${quotation.id}/edit`)}
                  className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
              {quotation.canDelete && (
                <Button
                  variant="outline"
                  onClick={handleDeleteQuotation}
                  disabled={deleting}
                  className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                >
                  {deleting ? "Moving to Bin..." : "Move to Bin"}
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

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <div className="space-y-6">
          <Card className="rounded-[28px] border-[#E7EEF6] shadow-sm">
            <CardContent className="p-6 sm:p-7">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-[#ECF6FF] p-3 text-[#1ABFAD]">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-[#042042]">Quotation Details</h2>
                  <p className="text-sm text-[#6B7280]">
                    Client context, scope, and approval notes in one place.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <DetailItem label="Client" value={quotation.clientName} emphasized />
                <DetailItem label="Title" value={quotation.title} emphasized />
                <DetailItem label="Valid Until" value={formatDate(quotation.validUntil)} />
                <DetailItem label="Created By" value={quotation.createdBy} />
              </div>

              {quotation.description && (
                <div className="mt-6 rounded-3xl border border-[#EADACB] bg-[#FFF8F1] px-5 py-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B56A36]">
                    Description
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[#4B5563]">{quotation.description}</p>
                </div>
              )}

              {quotation.termsNotes && (
                <div className="mt-4 rounded-3xl border border-[#E7EEF6] bg-[#F8FBFF] px-5 py-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4B6B88]">
                    Terms and Notes
                  </p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#4B5563]">
                    {quotation.termsNotes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border-[#E7EEF6] shadow-sm">
            <CardContent className="p-0">
              <div className="border-b border-[#E7EEF6] px-6 py-5">
                <h2 className="text-xl font-semibold text-[#042042]">Commercial Breakdown</h2>
                <p className="mt-1 text-sm text-[#6B7280]">
                  Clear line-item pricing with quantity, discount, and tax impact.
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
                    {quotation.lineItems.map((item) => (
                      <tr key={item.id} className="border-t border-[#E7EEF6] align-top">
                        <td className="px-6 py-5">
                          <p className="font-medium text-[#042042]">{item.description}</p>
                        </td>
                        <td className="px-4 py-5 text-sm text-[#4B5563]">{item.quantity}</td>
                        <td className="px-4 py-5 text-sm text-[#4B5563]">
                          {formatCurrency(item.unitPrice, quotation.currency || "INR")}
                        </td>
                        <td className="px-4 py-5 text-sm text-[#4B5563]">{item.taxPercent}%</td>
                        <td className="px-4 py-5 text-sm text-[#4B5563]">
                          {formatCurrency(item.discount, quotation.currency || "INR")}
                        </td>
                        <td className="px-6 py-5 text-right text-sm font-semibold text-[#042042]">
                          {formatCurrency(getLineItemTotal(item), quotation.currency || "INR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {pdfPreviewUrl && (
            <div ref={previewSectionRef} className="scroll-mt-24">
              <Card className="rounded-[28px] border-[#E7EEF6] shadow-sm">
              <CardContent className="p-0">
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E7EEF6] px-6 py-5">
                    <div>
                      <h2 className="text-xl font-semibold text-[#042042]">Quotation PDF Preview</h2>
                      <p className="mt-1 text-sm text-[#6B7280]">
                        Review the generated client-ready quotation without leaving the page.
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
                    title="Quotation PDF Preview"
                  />
              </CardContent>
              </Card>
            </div>
          )}

          {quotation.statusHistory && quotation.statusHistory.length > 0 && (
            <Card className="rounded-[28px] border-[#E7EEF6] shadow-sm">
              <CardContent className="p-6 sm:p-7">
                <h2 className="text-xl font-semibold text-[#042042]">Status Timeline</h2>
                <p className="mt-1 text-sm text-[#6B7280]">
                  A quick audit trail of who changed the commercial state and when.
                </p>
                <div className="mt-6 space-y-4">
                  {quotation.statusHistory.map((entry, idx) => (
                    <div
                      key={`${entry.status}-${entry.changedAt}-${idx}`}
                      className="flex gap-4 rounded-3xl border border-[#E7EEF6] bg-[#F8FBFF] px-5 py-4"
                    >
                      <div className="mt-1 rounded-full bg-[#1ABFAD]/10 p-2 text-[#1ABFAD]">
                        <Clock3 className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <Badge className={statusColors[entry.status as keyof typeof statusColors]}>
                            {entry.status}
                          </Badge>
                          <span className="text-sm text-[#6B7280]">{formatDate(entry.changedAt)}</span>
                        </div>
                        <p className="mt-2 text-sm text-[#4B5563]">Updated by {entry.changedBy}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {linkedInvoices.length > 0 && (
            <Card
              id="linked-invoices-section"
              className="rounded-[28px] border-[#E7EEF6] shadow-sm"
            >
              <CardContent className="p-6 sm:p-7">
                <h2 className="text-xl font-semibold text-[#042042]">Linked Invoices</h2>
                <p className="mt-1 text-sm text-[#6B7280]">
                  Invoices generated from this quotation. Currency and billing handoff stay visible here.
                </p>
                <div className="mt-6 space-y-4">
                  {linkedInvoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#E7EEF6] bg-[#F8FBFF] px-5 py-4"
                    >
                      <div>
                        <p className="text-lg font-semibold text-[#042042]">{invoice.invoiceNumber}</p>
                        <p className="mt-1 text-sm text-[#4B5563]">
                          {formatCurrency(invoice.total, invoice.currency)} • {invoice.status}
                        </p>
                        <p className="mt-1 text-xs text-[#6B7280]">
                          Created {formatDate(invoice.createdAt)}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/admin/invoices/${invoice.id}`)}
                        className="border-[#DDE8F2]"
                      >
                        Open Invoice
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {quotation.auditTrail && quotation.auditTrail.length > 0 && (
            <Card className="rounded-[28px] border-[#E7EEF6] shadow-sm">
              <CardContent className="p-6 sm:p-7">
                <h2 className="text-xl font-semibold text-[#042042]">Audit Trail</h2>
                <p className="mt-1 text-sm text-[#6B7280]">
                  Recorded workflow, deletion, and restore actions for this quotation.
                </p>
                <div className="mt-6 space-y-4">
                  {quotation.auditTrail.map((entry) => (
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
        </div>

        <div className="space-y-6">
          <Card className="rounded-[28px] border-[#DDE8F2] shadow-sm">
            <CardContent className="p-6 sm:p-7">
              <h2 className="text-xl font-semibold text-[#042042]">Financial Summary</h2>
              <p className="mt-1 text-sm text-[#6B7280]">
                Snapshot of totals before the quotation moves into invoicing.
              </p>

              <div className="mt-6 space-y-3 rounded-3xl border border-[#E7EEF6] bg-[#F8FBFF] p-5">
                <SummaryRow label="Subtotal" value={formatCurrency(quotation.subtotal, quotation.currency || "INR")} />
                <SummaryRow label="Tax Amount" value={formatCurrency(quotation.taxAmount, quotation.currency || "INR")} />
                <SummaryRow
                  label="Discount"
                  value={`-${formatCurrency(quotation.totalDiscount, quotation.currency || "INR")}`}
                />
                <div className="border-t border-[#DDE8F2]" />
                <SummaryRow
                  label="Total Quoted"
                  value={formatCurrency(quotation.total, quotation.currency || "INR")}
                  strong
                  accent
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border-[#EADACB] bg-[#FFF8F1] shadow-sm">
            <CardContent className="p-6 sm:p-7">
              <h2 className="text-xl font-semibold text-[#042042]">Commercial Checklist</h2>
              <div className="mt-5 space-y-4">
                <div className="flex items-start gap-3">
                  <UserRound className="mt-0.5 h-4 w-4 text-[#B56A36]" />
                  <p className="text-sm leading-7 text-[#5B4638]">
                    Confirm client-facing scope wording, assumptions, and pricing before marking the
                    quotation as sent.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CalendarDays className="mt-0.5 h-4 w-4 text-[#B56A36]" />
                  <p className="text-sm leading-7 text-[#5B4638]">
                    Watch validity dates closely to avoid an accepted quotation slipping into an
                    expired state.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 h-4 w-4 text-[#B56A36]" />
                  <p className="text-sm leading-7 text-[#5B4638]">
                    Once accepted, convert directly into an invoice to keep the handoff clean for
                    finance and delivery.
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
