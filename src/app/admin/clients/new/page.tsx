"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import { ClientForm, type ClientFormData } from "@/components/admin/client-form"

export default function NewClientPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (data: ClientFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || err.message || "Failed to create client")
      }

      const result = await response.json()
      router.push(`/admin/clients/${result.data?.id || result.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create client")
      setIsLoading(false)
      throw err
    }
  }

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <PageHeader
        title="Add New Client"
        description="Create a new client account with contact and billing information"
      />

      {error && (
        <div className="p-4 rounded-md bg-destructive/10 text-destructive">
          {error}
        </div>
      )}

      <ClientForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        submitLabel="Create Client"
      />
    </div>
  )
}
