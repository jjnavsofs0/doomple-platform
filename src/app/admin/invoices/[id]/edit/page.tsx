"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { getCurrencyOptions } from "@/lib/billing"
import { formatCurrency } from "@/lib/utils"
import { Button, Card, CardContent, CardHeader, CardTitle, Input, PageHeader } from "@/components/ui"

interface LineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  taxPercent: number
  discount: number
}

export default function EditInvoicePage() {
  const router = useRouter()
  const params = useParams()
  const invoiceId = params.id as string

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [dueDate, setDueDate] = useState("")
  const [billingCategory, setBillingCategory] = useState("")
  const [currency, setCurrency] = useState("INR")
  const [notes, setNotes] = useState("")
  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      id: "1",
      description: "",
      quantity: 1,
      unitPrice: 0,
      taxPercent: 18,
      discount: 0,
    },
  ])

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/invoices/${invoiceId}`)
        if (!response.ok) throw new Error("Failed to fetch invoice")
        const result = await response.json()
        const invoice = result.data || result

        if (!invoice.canEdit) {
          throw new Error("Only draft invoices can be edited.")
        }

        setDueDate(invoice.dueDate ? invoice.dueDate.split("T")[0] : "")
        setBillingCategory(invoice.billingCategory || "")
        setCurrency(invoice.currency || "INR")
        setNotes(invoice.notes || "")
        if (invoice.lineItems?.length) {
          setLineItems(
            invoice.lineItems.map((item: any, index: number) => ({
              id: item.id || String(index + 1),
              description: item.description || "",
              quantity: Number(item.quantity) || 1,
              unitPrice: Number(item.unitPrice) || 0,
              taxPercent: Number(item.taxPercent) || 0,
              discount: Number(item.discount) || 0,
            }))
          )
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load invoice")
      } finally {
        setLoading(false)
      }
    }

    fetchInvoice()
  }, [invoiceId])

  const addLineItem = () => {
    const newId = String(Math.max(...lineItems.map((item) => parseInt(item.id, 10) || 0), 0) + 1)
    setLineItems((current) => [
      ...current,
      { id: newId, description: "", quantity: 1, unitPrice: 0, taxPercent: 18, discount: 0 },
    ])
  }

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems((current) => current.filter((item) => item.id !== id))
    }
  }

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems((current) =>
      current.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!dueDate || !billingCategory) {
      setError("Due date and billing category are required")
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dueDate,
          billingCategory,
          currency,
          notes,
          items: lineItems.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxPercent: item.taxPercent,
            discount: item.discount,
          })),
        }),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Failed to update invoice")

      router.push(`/admin/invoices/${invoiceId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update invoice")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <PageHeader title="Edit Invoice" />
        <Card>
          <CardContent className="pt-6">Loading...</CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader title="Edit Invoice" />
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-red-800">{error}</CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Due Date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
              <Input
                label="Billing Category"
                value={billingCategory}
                onChange={(e) => setBillingCategory(e.target.value)}
                placeholder="Development"
              />
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
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
              <label className="mb-2 block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Line Items</CardTitle>
              <Button type="button" size="sm" onClick={addLineItem}>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {lineItems.map((item) => (
              <div key={item.id} className="space-y-3 rounded-lg border border-gray-200 p-4">
                <Input
                  label="Description"
                  value={item.description}
                  onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                  placeholder="Item description"
                />
                <div className="grid gap-4 sm:grid-cols-5">
                  <Input
                    label="Quantity"
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                  />
                  <Input
                    label="Unit Price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateLineItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                  />
                  <Input
                    label="Tax %"
                    type="number"
                    min="0"
                    max="100"
                    value={item.taxPercent}
                    onChange={(e) => updateLineItem(item.id, "taxPercent", parseFloat(e.target.value) || 0)}
                  />
                  <Input
                    label="Discount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.discount}
                    onChange={(e) => updateLineItem(item.id, "discount", parseFloat(e.target.value) || 0)}
                  />
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeLineItem(item.id)}
                      disabled={lineItems.length === 1}
                      className="w-full"
                    >
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

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal, currency)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Tax Amount:</span>
              <span>{formatCurrency(taxAmount, currency)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Discount:</span>
              <span>-{formatCurrency(totalDiscount, currency)}</span>
            </div>
            <div className="border-t border-gray-200 pt-2">
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Grand Total:</span>
                <span>{formatCurrency(grandTotal, currency)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}
