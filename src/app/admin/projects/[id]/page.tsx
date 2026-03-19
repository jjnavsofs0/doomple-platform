"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Edit, Plus } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { StatusBadge } from "@/components/ui/status-badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { ProgressBar } from "@/components/admin/progress-bar"
import { MilestoneList, type Milestone } from "@/components/admin/milestone-list"
import { AttachmentManager } from "@/components/admin/attachment-manager"

interface ProjectDetail {
  id: string
  name: string
  clientName: string
  category: string
  status: "active" | "completed" | "on_hold" | "cancelled"
  progress: number
  description: string
  scope: string
  budget: number
  billingModel: string
  managerName: string
  startDate: string
  estimatedEndDate: string
  institutionType?: string
  selectedModules?: string[]
  customizationScope?: string
  deploymentModel?: string
  onboardingPlan?: string
  supportPlan?: string
  baseModules?: string[]
  customModules?: string
  architecturePlan?: string
}

interface ProjectNote {
  id: string
  content: string
  isClientVisible: boolean
  createdAt: string
  createdBy: string
}

interface StatusHistory {
  id: string
  fromStatus: string
  toStatus: string
  changedAt: string
  changedBy: string
  reason?: string
}

export default function ProjectDetailPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  const [project, setProject] = React.useState<ProjectDetail | null>(null)
  const [milestones, setMilestones] = React.useState<Milestone[]>([])
  const [notes, setNotes] = React.useState<ProjectNote[]>([])
  const [statusHistory, setStatusHistory] = React.useState<StatusHistory[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [activeTab, setActiveTab] = React.useState("overview")
  const [newNote, setNewNote] = React.useState("")
  const [isClientVisible, setIsClientVisible] = React.useState(false)

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [projectRes, milestonesRes, notesRes, historyRes] = await Promise.all([
          fetch(`/api/projects/${projectId}`),
          fetch(`/api/projects/${projectId}/milestones`),
          fetch(`/api/projects/${projectId}/notes`),
          fetch(`/api/projects/${projectId}/history`),
        ])

        if (!projectRes.ok) throw new Error("Failed to fetch project")

        const projectData = await projectRes.json()
        setProject(projectData.data || projectData)

        if (milestonesRes.ok) {
          const data = await milestonesRes.json()
          setMilestones(Array.isArray(data) ? data : data.data || [])
        }

        if (notesRes.ok) {
          const data = await notesRes.json()
          setNotes(Array.isArray(data) ? data : data.data || [])
        }

        if (historyRes.ok) {
          const data = await historyRes.json()
          setStatusHistory(Array.isArray(data) ? data : data.data || [])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [projectId])

  const handleAddNote = async () => {
    if (!newNote.trim()) return

    try {
      const response = await fetch(`/api/projects/${projectId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newNote,
          isClientVisible,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setNotes([...notes, data.data || data])
        setNewNote("")
        setIsClientVisible(false)
      }
    } catch (err) {
      console.error("Failed to add note", err)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Card className="p-4 border-destructive/50 bg-destructive/5">
          <p className="text-destructive">{error || "Project not found"}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground">{project.clientName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={project.status} />
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Status</p>
            <StatusBadge status={project.status} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Progress</p>
            <div className="mt-2">
              <ProgressBar percentage={project.progress} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Budget</p>
            <p className="text-2xl font-bold mt-2">
              {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(project.budget)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Manager</p>
            <p className="font-medium mt-2">{project.managerName}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Category</p>
              <Badge variant="outline" className="capitalize mt-1">
                {project.category}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Billing Model</p>
              <Badge variant="outline" className="capitalize mt-1">
                {project.billingModel}
              </Badge>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="mt-1">{project.description || "No description"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Scope</p>
            <p className="mt-1">{project.scope || "No scope defined"}</p>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Start Date</p>
              <p className="font-medium mt-1">
                {new Date(project.startDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Est. End Date</p>
              <p className="font-medium mt-1">
                {new Date(project.estimatedEndDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="font-medium mt-1">
                {Math.ceil(
                  (new Date(project.estimatedEndDate).getTime() -
                    new Date(project.startDate).getTime()) /
                    (1000 * 60 * 60 * 24)
                )}{" "}
                days
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {project.category === "UEP_IMPLEMENTATION" && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle>UEP Implementation Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Institution Type</p>
                <p className="font-medium mt-1">
                  {project.institutionType || "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Deployment Model</p>
                <p className="font-medium mt-1">
                  {project.deploymentModel || "Not specified"}
                </p>
              </div>
            </div>

            {project.selectedModules && project.selectedModules.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Selected Modules
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.selectedModules.map((mod) => (
                    <Badge key={mod} variant="secondary">
                      {mod}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {project.customizationScope && (
              <div>
                <p className="text-sm text-muted-foreground">
                  Customization Scope
                </p>
                <p className="mt-1">{project.customizationScope}</p>
              </div>
            )}

            {project.onboardingPlan && (
              <div>
                <p className="text-sm text-muted-foreground">Onboarding Plan</p>
                <p className="mt-1">{project.onboardingPlan}</p>
              </div>
            )}

            {project.supportPlan && (
              <div>
                <p className="text-sm text-muted-foreground">Support Plan</p>
                <p className="mt-1">{project.supportPlan}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {project.category === "SAAS_TOOLKIT_BUILD" && (
        <Card className="border-purple-200 bg-purple-50/50">
          <CardHeader>
            <CardTitle>SaaS Toolkit Build Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.baseModules && project.baseModules.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Base Modules
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.baseModules.map((mod) => (
                    <Badge key={mod} variant="secondary">
                      {mod}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {project.customModules && (
              <div>
                <p className="text-sm text-muted-foreground">Custom Modules</p>
                <p className="mt-1">{project.customModules}</p>
              </div>
            )}

            {project.architecturePlan && (
              <div>
                <p className="text-sm text-muted-foreground">Architecture Plan</p>
                <p className="mt-1">{project.architecturePlan}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="milestones">
                Milestones ({milestones.length})
              </TabsTrigger>
              <TabsTrigger value="notes">Notes ({notes.length})</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Client</p>
                  <p className="font-medium mt-1">{project.clientName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Manager</p>
                  <p className="font-medium mt-1">{project.managerName}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="milestones" className="pt-4">
              <MilestoneList
                milestones={milestones}
                onAddMilestone={async (data) => {
                  const response = await fetch(
                    `/api/projects/${projectId}/milestones`,
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(data),
                    }
                  )
                  if (response.ok) {
                    const result = await response.json()
                    setMilestones([
                      ...milestones,
                      result.data || result,
                    ])
                  }
                }}
                onUpdateMilestone={async (id, data) => {
                  const response = await fetch(
                    `/api/projects/${projectId}/milestones/${id}`,
                    {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(data),
                    }
                  )
                  if (response.ok) {
                    const result = await response.json()
                    setMilestones(
                      milestones.map((m) =>
                        m.id === id ? (result.data || result) : m
                      )
                    )
                  }
                }}
                onDeleteMilestone={async (id) => {
                  await fetch(`/api/projects/${projectId}/milestones/${id}`, {
                    method: "DELETE",
                  })
                  setMilestones(milestones.filter((m) => m.id !== id))
                }}
              />
            </TabsContent>

            <TabsContent value="notes" className="space-y-4 pt-4">
              <Card className="bg-muted/50">
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Add Note
                    </label>
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Enter project note..."
                      className="w-full h-24 p-2 border rounded-md"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isClientVisible}
                      onChange={(e) => setIsClientVisible(e.target.checked)}
                    />
                    <span className="text-sm">Visible to Client</span>
                  </label>
                  <Button onClick={handleAddNote}>Add Note</Button>
                </CardContent>
              </Card>

              <div className="space-y-2">
                {notes.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No notes yet
                  </p>
                ) : (
                  notes.map((note) => (
                    <Card key={note.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-sm text-muted-foreground">
                            {note.createdBy} - {new Date(note.createdAt).toLocaleString()}
                          </p>
                          {note.isClientVisible && (
                            <Badge variant="outline">Client Visible</Badge>
                          )}
                        </div>
                        <p>{note.content}</p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="documents" className="pt-4">
              <AttachmentManager
                entityType="project"
                entityId={projectId}
                emptyMessage="No project documents uploaded yet."
              />
            </TabsContent>

            <TabsContent value="history" className="pt-4">
              <div className="space-y-4">
                {statusHistory.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No status changes yet
                  </p>
                ) : (
                  <div className="relative">
                    <div className="space-y-4">
                      {statusHistory.map((item, index) => (
                        <div key={item.id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-4 h-4 rounded-full bg-blue-500 border-4 border-background" />
                            {index < statusHistory.length - 1 && (
                              <div className="w-0.5 h-16 bg-border mt-2" />
                            )}
                          </div>
                          <div className="pb-4">
                            <p className="font-medium">
                              {item.fromStatus} → {item.toStatus}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(item.changedAt).toLocaleString()} by{" "}
                              {item.changedBy}
                            </p>
                            {item.reason && (
                              <p className="text-sm mt-1">{item.reason}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button>Update Status</Button>
        <Button variant="outline">Update Progress</Button>
        <Button variant="outline">Create Invoice</Button>
      </div>
    </div>
  )
}
