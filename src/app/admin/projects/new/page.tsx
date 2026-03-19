"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import { ProjectForm, type ProjectFormData } from "@/components/admin/project-form"
import { Skeleton } from "@/components/ui/skeleton"

interface ClientOption {
  id: string
  name: string
}

interface ManagerOption {
  id: string
  name: string
}

function NewProjectContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedClientId = searchParams.get("clientId") || ""

  const [clients, setClients] = React.useState<ClientOption[]>([])
  const [managers, setManagers] = React.useState<ManagerOption[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [clientsRes, managersRes] = await Promise.all([
          fetch("/api/clients"),
          fetch("/api/managers"),
        ])

        if (clientsRes.ok) {
          const data = await clientsRes.json()
          const list = Array.isArray(data) ? data : data.data || []
          setClients(
            list.map((c: any) => ({
              id: c.id,
              name: c.companyName || c.name,
            }))
          )
        }

        if (managersRes.ok) {
          const data = await managersRes.json()
          const list = Array.isArray(data) ? data : data.data || []
          setManagers(
            list.map((m: any) => ({
              id: m.id,
              name: m.name || m.email,
            }))
          )
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSubmit = async (data: ProjectFormData) => {
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || err.message || "Failed to create project")
      }

      const result = await response.json()
      router.push(`/admin/projects/${result.data?.id || result.id}`)
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to create project")
    }
  }

  if (error) {
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
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <PageHeader
        title="Create New Project"
        description="Set up a new project with client, timeline, and team information"
      />

      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : (
        <ProjectForm
          clients={clients}
          managers={managers}
          onSubmit={handleSubmit}
          submitLabel="Create Project"
          initialData={preselectedClientId ? { clientId: preselectedClientId } : undefined}
        />
      )}
    </div>
  )
}

export default function NewProjectPage() {
  return (
    <React.Suspense fallback={
      <div className="space-y-6 p-6 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-20 w-full" />
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    }>
      <NewProjectContent />
    </React.Suspense>
  )
}
