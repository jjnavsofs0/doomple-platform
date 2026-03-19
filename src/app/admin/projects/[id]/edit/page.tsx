"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { ProjectForm, type ProjectFormData } from "@/components/admin/project-form"

interface ClientOption {
  id: string
  name: string
}

interface ManagerOption {
  id: string
  name: string
}

export default function EditProjectPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  const [initialData, setInitialData] = React.useState<Partial<ProjectFormData> | null>(null)
  const [clients, setClients] = React.useState<ClientOption[]>([])
  const [managers, setManagers] = React.useState<ManagerOption[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [projectRes, clientsRes, managersRes] = await Promise.all([
          fetch(`/api/projects/${projectId}`),
          fetch("/api/clients"),
          fetch("/api/managers"),
        ])

        if (!projectRes.ok) throw new Error("Failed to fetch project")

        const projectData = await projectRes.json()
        const project = projectData.data || projectData

        setInitialData({
          name: project.name || "",
          clientId: project.clientId || "",
          category: project.category || "CUSTOM_DEVELOPMENT",
          description: project.description || "",
          scope: project.scope || "",
          startDate: project.startDate ? project.startDate.split("T")[0] : "",
          estimatedEndDate: project.estimatedEndDate ? project.estimatedEndDate.split("T")[0] : "",
          priority: project.priority || "MEDIUM",
          managerId: project.managerId || "",
          budget: project.budget || 0,
          billingModel: project.billingModel || "FIXED_PRICE",
          institutionType: project.institutionType || "",
          selectedModules: project.selectedModules || [],
          customizationScope: project.customizationScope || "",
          deploymentModel: project.deploymentModel || "",
          onboardingPlan: project.onboardingPlan || "",
          supportPlan: project.supportPlan || "",
          baseModules: project.baseModules || [],
          customModules: project.customModules || "",
          architecturePlan: project.architecturePlan || "",
        })

        if (clientsRes.ok) {
          const data = await clientsRes.json()
          const list = Array.isArray(data) ? data : data.data || []
          setClients(list.map((c: any) => ({ id: c.id, name: c.companyName || c.name })))
        }

        if (managersRes.ok) {
          const data = await managersRes.json()
          const list = Array.isArray(data) ? data : data.data || []
          setManagers(list.map((m: any) => ({ id: m.id, name: m.name || m.email })))
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load project")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [projectId])

  const handleSubmit = async (data: ProjectFormData) => {
    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || err.message || "Failed to update project")
      }

      router.push(`/admin/projects/${projectId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update project")
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
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
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
        <Button variant="outline" onClick={() => router.push(`/admin/projects/${projectId}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Project
        </Button>
      </div>

      <PageHeader
        title="Edit Project"
        description="Update project details, timeline, and team information"
      />

      {error && (
        <div className="p-4 rounded-md bg-destructive/10 text-destructive">
          {error}
        </div>
      )}

      {initialData && (
        <ProjectForm
          initialData={initialData}
          clients={clients}
          managers={managers}
          onSubmit={handleSubmit}
          isLoading={isSaving}
          submitLabel="Save Changes"
        />
      )}
    </div>
  )
}
