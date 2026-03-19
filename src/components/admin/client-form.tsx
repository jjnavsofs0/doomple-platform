"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/toast"

interface ClientFormData {
  companyName: string
  contactPersonName: string
  email: string
  phone: string
  address?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  gstNumber?: string
  panNumber?: string
  bankAccountNumber?: string
  bankName?: string
  ifscCode?: string
}

interface ClientFormProps {
  initialData?: ClientFormData
  onSubmit: (data: ClientFormData) => Promise<void>
  isLoading?: boolean
  submitLabel?: string
}

const ClientForm = React.forwardRef<HTMLFormElement, ClientFormProps>(
  (
    {
      initialData,
      onSubmit,
      isLoading = false,
      submitLabel = "Save Client",
    },
    ref
  ) => {
    const { toast } = useToast()
    const [formData, setFormData] = React.useState<ClientFormData>(
      initialData || {
        companyName: "",
        contactPersonName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        gstNumber: "",
        panNumber: "",
        bankAccountNumber: "",
        bankName: "",
        ifscCode: "",
      }
    )

    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
      setError(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setIsSubmitting(true)
      setError(null)

      try {
        await onSubmit(formData)
        toast({
          type: "success",
          title: "Client saved",
          description: "The client details were saved successfully.",
        })
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An error occurred while saving"
        setError(message)
        toast({
          type: "error",
          title: "Could not save client",
          description: message,
        })
      } finally {
        setIsSubmitting(false)
      }
    }

    return (
      <form ref={ref} onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Company Name"
              name="companyName"
              placeholder="Enter company name"
              value={formData.companyName}
              onChange={handleChange}
              required
            />

            <Input
              label="Contact Person Name"
              name="contactPersonName"
              placeholder="Enter contact person name"
              value={formData.contactPersonName}
              onChange={handleChange}
              required
            />

            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <Input
              label="Phone"
              name="phone"
              type="tel"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={handleChange}
              required
            />

            <Input
              label="Address"
              name="address"
              placeholder="Enter street address"
              value={formData.address || ""}
              onChange={handleChange}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="City"
                name="city"
                placeholder="Enter city"
                value={formData.city || ""}
                onChange={handleChange}
              />
              <Input
                label="State"
                name="state"
                placeholder="Enter state"
                value={formData.state || ""}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Postal Code"
                name="postalCode"
                placeholder="Enter postal code"
                value={formData.postalCode || ""}
                onChange={handleChange}
              />
              <Input
                label="Country"
                name="country"
                placeholder="Enter country"
                value={formData.country || ""}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tax Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="GST Number"
              name="gstNumber"
              placeholder="Enter GST number"
              value={formData.gstNumber || ""}
              onChange={handleChange}
            />

            <Input
              label="PAN Number"
              name="panNumber"
              placeholder="Enter PAN number"
              value={formData.panNumber || ""}
              onChange={handleChange}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bank Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Bank Name"
              name="bankName"
              placeholder="Enter bank name"
              value={formData.bankName || ""}
              onChange={handleChange}
            />

            <Input
              label="Account Number"
              name="bankAccountNumber"
              placeholder="Enter account number"
              value={formData.bankAccountNumber || ""}
              onChange={handleChange}
            />

            <Input
              label="IFSC Code"
              name="ifscCode"
              placeholder="Enter IFSC code"
              value={formData.ifscCode || ""}
              onChange={handleChange}
            />
          </CardContent>
        </Card>

        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={isSubmitting || isLoading}>
            {isSubmitting || isLoading ? "Saving..." : submitLabel}
          </Button>
        </div>
      </form>
    )
  }
)
ClientForm.displayName = "ClientForm"

export { ClientForm, type ClientFormData }
