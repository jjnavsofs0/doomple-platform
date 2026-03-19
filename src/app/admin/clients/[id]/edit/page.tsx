"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { ClientForm, type ClientFormData } from "@/components/admin/client-form"

export default function EditClientPage() {
  const router = useRouter()
  const params = useParams()
  const clientId = params.id as string

  const [initialData, setInitialData] = React.useState<ClientFormData | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await fetch(`/api/clients/${clientId}`)
        if (!response.ok) throw new Error("Failed to fetch client")
        const result = await response.json()
        const client = result.data || result
        setInitialData({
          companyName: client.companyName || "",
          contactPersonName: client.contactPersonName || "",
          email: client.email || "",
          phone: client.phone || "",
          address: client.address || "",
          city: client.city || "",
          state: client.state || "",
          postalCode: client.postalCode || "",
          country: client.country || "",
          gstNumber: client.gstNumber || "",
          panNumber: client.panNumber || "",
          bankName: client.bankName || "",
          bankAccountNumber: client.bankAccountNumber || "",
          ifscCode: client.ifscCode || "",
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load client")
      } finally {
        setIsLoading(false)
      }
    }

    fetchClient()
  }, [clientId])

  const handleSubmit = async (data: ClientFormData) => {
    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || err.message || "Failed to update client")
      }

      router.push(`/admin/clients/${clientId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update client")
      setIsSaving(false)
      throw err
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-6 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-8 w-64" />
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  if (error && !initialData) {
    return (
      <div className="space-y-6 p-6 max-w-4xl mx-auto">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="p-4 rounded-md bg-destructive/10 text-destructive">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div>
        <Button variant="outline" onClick={() => router.push(`/admin/clients/${clientId}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Client
        </Button>
      </div>

      <PageHeader
        title="Edit Client"
        description="Update client contact and billing information"
      />

      {error && (
        <div className="p-4 rounded-md bg-destructive/10 text-destructive">
          {error}
        </div>
      )}

      {initialData && (
        <ClientForm
          initialData={initialData}
          onSubmit={handleSubmit}
          isLoading={isSaving}
          submitLabel="Save Changes"
        />
      )}
    </div>
  )
}
