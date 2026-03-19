"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button, Card, CardContent, CardHeader, CardTitle, Input, PageHeader } from "@/components/ui"
import { Plus, Trash2, ArrowLeft } from "lucide-react"
import { getCurrencyOptions } from "@/lib/billing"
import { formatCurrency } from "@/lib/utils"

interface LineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  taxPercent: number
  discount: number
}

const templates = [
  "Startup MVP",
  "UEP Implementation",
  "Fixed-Scope Project",
  "Monthly Support",
  "DevOps Retainer",
  "Marketing Retainer",
  "Workforce Consulting",
]

export default function EditQuotationPage() {
  const router = useRouter()
  const params = useParams()
  const quotationId = params.id as string

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [validUntil, setValidUntil] = useState("")
  const [termsNotes, setTermsNotes] = useState("")
  const [template, setTemplate] = useState("")
  const [currency, setCurrency] = useState("INR")
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: "1", description: "", quantity: 1, unitPrice: 0, taxPercent: 18, discount: 0 },
  ])

  useEffect(() => {
    const fetchQuotation = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/quotations/${quotationId}`)
        if (!res.ok) throw new Error("Failed to fetch quotation")
        const data = await res.json()
        const q = data.data || data

        if (!q.canEdit) {
          throw new Error("Only editable draft or sent quotations can be modified.")
        }

        setTitle(q.title || "")
        setDescription(q.description || "")
        setValidUntil(q.validUntil ? q.validUntil.split("T")[0] : "")
        setTermsNotes(q.termsNotes || "")
        setTemplate(q.template || "")
        setCurrency(q.currency || "INR")
        if (q.lineItems && q.lineItems.length > 0) {
          setLineItems(
            q.lineItems.map((item: any, idx: number) => ({
              id: String(idx + 1),
              description: item.description || "",
              quantity: Number(item.quantity) || 1,
              unitPrice: Number(item.unitPrice) || 0,
              taxPercent: Number(item.taxPercent) || 18,
              discount: Number(item.discount) || 0,
            }))
          )
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load quotation")
      } finally {
        setLoading(false)
      }
    }
    fetchQuotation()
  }, [quotationId])

  const addLineItem = () => {
    const newId = String(Math.max(...lineItems.map((l) => parseInt(l.id)), 0) + 1)
    setLineItems([...lineItems, { id: newId, description: "", quantity: 1, unitPrice: 0, taxPercent: 18, discount: 0 }])
  }

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) setLineItems(lineItems.filter((item) => item.id !== id))
  }

  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setLineItems(lineItems.map((item) => item.id === id ? { ...item, [field]: value } : item))
  }

  const calculateItemTotal = (item: LineItem) => {
    const baseTotal = item.quantity * item.unitPrice
    const withTax = baseTotal * (1 + item.taxPercent / 100)
    return Math.max(0, withTax - item.discount)
  }

  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const taxAmount = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice * (item.taxPercent / 100), 0)
  const totalDiscount = lineItems.reduce((sum, item) => sum + item.discount, 0)
  const grandTotal = subtotal + taxAmount - totalDiscount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title || !validUntil) {
      setError("Please fill in required fields: title and valid until date")
      return
    }
    if (lineItems.some((item) => !item.description || item.quantity <= 0)) {
      setError("All line items must have a description and quantity > 0")
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch(`/api/quotations/${quotationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          validUntil,
          termsNotes,
          template: template || undefined,
          currency,
          items: lineItems.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxPercent: item.taxPercent,
            discount: item.discount,
          })),
          subtotal,
          taxAmount,
          discountAmount: totalDiscount,
          total: grandTotal,
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || "Failed to update quotation")
      }

      router.push(`/admin/quotations/${quotationId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update quotation")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 p-6 max-w-7xl mx-auto">
        <PageHeader title="Edit Quotation" />
        <Card><CardContent className="pt-6">Loading...</CardContent></Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader title="Edit Quotation" />
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-red-800">{error}</CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader><CardTitle>Quotation Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title *</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Mobile App Development" className="mt-1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Template</label>
                <select value={template} onChange={(e) => setTemplate(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                  <option value="">Select a template</option>
                  {templates.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  {getCurrencyOptions().map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detailed description of the quotation" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" rows={3} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Valid Until *</label>
                <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className="mt-1" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Terms & Notes</label>
              <textarea value={termsNotes} onChange={(e) => setTermsNotes(e.target.value)} placeholder="Payment terms, conditions, etc." className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" rows={3} />
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Line Items</CardTitle>
              <Button type="button" size="sm" onClick={addLineItem}>
                <Plus className="mr-2 h-4 w-4" />Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {lineItems.map((item) => (
              <div key={item.id} className="space-y-3 rounded-lg border border-gray-200 p-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <Input value={item.description} onChange={(e) => updateLineItem(item.id, "description", e.target.value)} placeholder="Item description" className="mt-1" />
                </div>
                <div className="grid gap-4 sm:grid-cols-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quantity</label>
                    <Input type="number" min="1" value={item.quantity} onChange={(e) => updateLineItem(item.id, "quantity", parseFloat(e.target.value))} className="mt-1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Unit Price</label>
                    <Input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(e) => updateLineItem(item.id, "unitPrice", parseFloat(e.target.value))} className="mt-1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tax %</label>
                    <Input type="number" min="0" max="100" value={item.taxPercent} onChange={(e) => updateLineItem(item.id, "taxPercent", parseFloat(e.target.value))} className="mt-1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Discount</label>
                    <Input type="number" min="0" step="0.01" value={item.discount} onChange={(e) => updateLineItem(item.id, "discount", parseFloat(e.target.value))} className="mt-1" />
                  </div>
                  <div className="flex items-end">
                    <Button type="button" variant="destructive" size="sm" onClick={() => removeLineItem(item.id)} disabled={lineItems.length === 1} className="w-full">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-right text-sm font-medium text-gray-700">
                  Total: {formatCurrency(calculateItemTotal(item), currency)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-gray-700"><span>Subtotal:</span><span>{formatCurrency(subtotal, currency)}</span></div>
            <div className="flex justify-between text-gray-700"><span>Tax Amount:</span><span>{formatCurrency(taxAmount, currency)}</span></div>
            <div className="flex justify-between text-gray-700"><span>Discount:</span><span>-{formatCurrency(totalDiscount, currency)}</span></div>
            <div className="border-t border-gray-200 pt-2">
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Grand Total:</span><span>{formatCurrency(grandTotal, currency)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save Changes"}</Button>
        </div>
      </form>
    </div>
  )
}
