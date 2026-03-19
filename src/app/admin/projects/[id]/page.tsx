"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  CalendarDays,
  Edit,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Plus,
  Target,
  UserRound,
  X,
} from "lucide-react"
import { AttachmentManager } from "@/components/admin/attachment-manager"
import { MilestoneList, type Milestone } from "@/components/admin/milestone-list"
import { ProgressBar } from "@/components/admin/progress-bar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/toast"
import { formatCurrency } from "@/lib/utils"

interface ProjectDetail {
  id: string
  name: string
  clientId: string
  clientName: string
  category: string
  status: string
  progress: number
  description: string
  scope: string
  budget: number
  currency?: string
  billingModel: string
  managerName: string
  managerId?: string
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

interface ProjectInvoice {
  id: string
  invoiceNumber: string
  status: string
  total: number
  currency?: string
  dueDate: string
  createdAt: string
}

const heroStatusStyles: Record<string, string> = {
  ACTIVE: "border-emerald-200 bg-emerald-100 text-emerald-700",
  COMPLETED: "border-sky-200 bg-sky-100 text-sky-700",
  ON_HOLD: "border-amber-200 bg-amber-100 text-amber-700",
  CANCELLED: "border-rose-200 bg-rose-100 text-rose-700",
  DRAFT: "border-slate-200 bg-slate-100 text-slate-700",
  DISCOVERY: "border-cyan-200 bg-cyan-100 text-cyan-700",
  IN_DESIGN: "border-violet-200 bg-violet-100 text-violet-700",
  IN_DEVELOPMENT: "border-indigo-200 bg-indigo-100 text-indigo-700",
  IN_REVIEW: "border-fuchsia-200 bg-fuchsia-100 text-fuchsia-700",
}

function formatDate(value?: string | null) {
  if (!value) return "Not set"
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function formatStatusLabel(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function DetailTile({
  label,
  value,
  tone = "cool",
}: {
  label: string
  value: React.ReactNode
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
      <div className="mt-2 text-sm leading-7 text-[#374151]">{value}</div>
    </div>
  )
}

export default function ProjectDetailPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  const { toast } = useToast()

  const [project, setProject] = React.useState<ProjectDetail | null>(null)
  const [milestones, setMilestones] = React.useState<Milestone[]>([])
  const [notes, setNotes] = React.useState<ProjectNote[]>([])
  const [statusHistory, setStatusHistory] = React.useState<StatusHistory[]>([])
  const [invoices, setInvoices] = React.useState<ProjectInvoice[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [activeTab, setActiveTab] = React.useState("overview")
  const [newNote, setNewNote] = React.useState("")
  const [isClientVisible, setIsClientVisible] = React.useState(false)
  const [showStatusModal, setShowStatusModal] = React.useState(false)
  const [showProgressModal, setShowProgressModal] = React.useState(false)
  const [selectedStatus, setSelectedStatus] = React.useState("")
  const [selectedProgress, setSelectedProgress] = React.useState(0)
  const [statusReason, setStatusReason] = React.useState("")
  const [isUpdating, setIsUpdating] = React.useState(false)

  const projectCurrency = project?.currency || "INR"

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const [projectRes, milestonesRes, notesRes, historyRes, invoicesRes] = await Promise.all([
          fetch(`/api/projects/${projectId}`),
          fetch(`/api/projects/${projectId}/milestones`),
          fetch(`/api/projects/${projectId}/notes`),
          fetch(`/api/projects/${projectId}/history`),
          fetch(`/api/invoices?projectId=${projectId}&limit=50`),
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

        if (invoicesRes.ok) {
          const data = await invoicesRes.json()
          setInvoices(Array.isArray(data) ? data : data.data || [])
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

      if (!response.ok) throw new Error("Failed to add note")

      const data = await response.json()
      setNotes((current) => [data.data || data, ...current])
      setNewNote("")
      setIsClientVisible(false)
      toast({
        type: "success",
        title: "Note added",
        description: "The project note was saved.",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add note")
      toast({
        type: "error",
        title: "Could not add note",
        description:
          err instanceof Error ? err.message : "Please try again.",
      })
    }
  }

  const handleUpdateStatus = async () => {
    if (!project || !selectedStatus) return
    try {
      setIsUpdating(true)
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: selectedStatus, statusNote: statusReason }),
      })
      if (!response.ok) throw new Error("Failed to update status")
      const data = await response.json()
      setProject((data.data || data) as ProjectDetail)
      setShowStatusModal(false)
      setStatusReason("")
      toast({
        type: "success",
        title: "Project status updated",
        description: `The project is now ${formatStatusLabel(selectedStatus)}.`,
      })

      const historyResponse = await fetch(`/api/projects/${projectId}/history`)
      if (historyResponse.ok) {
        const historyData = await historyResponse.json()
        setStatusHistory(Array.isArray(historyData) ? historyData : historyData.data || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status")
      toast({
        type: "error",
        title: "Could not update status",
        description:
          err instanceof Error ? err.message : "Please try again.",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUpdateProgress = async () => {
    if (!project) return
    try {
      setIsUpdating(true)
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progressPercent: selectedProgress }),
      })
      if (!response.ok) throw new Error("Failed to update progress")
      const data = await response.json()
      setProject((data.data || data) as ProjectDetail)
      setShowProgressModal(false)
      toast({
        type: "success",
        title: "Project progress updated",
        description: `Progress is now ${selectedProgress}%.`,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update progress")
      toast({
        type: "error",
        title: "Could not update progress",
        description:
          err instanceof Error ? err.message : "Please try again.",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleReorderMilestones = async (nextMilestones: Milestone[]) => {
    const previousMilestones = milestones
    const reordered = nextMilestones.map((item, index) => ({
      ...item,
      order: index + 1,
    }))

    setMilestones(reordered)

    try {
      const responses = await Promise.all(
        reordered.map((milestone) =>
          fetch(`/api/projects/${projectId}/milestones/${milestone.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order: milestone.order }),
          })
        )
      )

      const failedResponse = responses.find((response) => !response.ok)
      if (failedResponse) {
        throw new Error("Failed to save the new milestone order")
      }
    } catch (err) {
      setMilestones(previousMilestones)
      setError(err instanceof Error ? err.message : "Failed to reorder milestones")
      throw err instanceof Error ? err : new Error("Failed to reorder milestones")
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[240px] rounded-[30px]" />
        <div className="grid gap-6 xl:grid-cols-[1.55fr_0.9fr]">
          <Skeleton className="h-[560px] rounded-[28px]" />
          <Skeleton className="h-[420px] rounded-[28px]" />
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <Card className="rounded-[28px] border-rose-200 bg-rose-50 shadow-sm">
        <CardContent className="space-y-4 p-8">
          <p className="text-2xl font-semibold text-[#042042]">
            {error || "Project not found"}
          </p>
          <Button onClick={() => router.back()} className="bg-[#042042] text-white hover:bg-[#0A2C54]">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go back
          </Button>
        </CardContent>
      </Card>
    )
  }

  const remainingDays =
    project.startDate && project.estimatedEndDate
      ? Math.max(
          0,
          Math.ceil(
            (new Date(project.estimatedEndDate).getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : null

  const completedMilestones = milestones.filter((milestone) => milestone.status === "completed").length

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
          <div className="flex flex-wrap items-center gap-3">
            <Badge className={heroStatusStyles[project.status] || heroStatusStyles.DRAFT}>
              {formatStatusLabel(project.status)}
            </Badge>
            <Button
              variant="outline"
              onClick={() => router.push(`/admin/projects/${projectId}/edit`)}
              className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Project
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7CE6DA]">
              Project Workspace
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              {project.name}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
              {project.clientName} · {formatStatusLabel(project.category)} · {formatStatusLabel(project.billingModel)}
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65">
              {project.description || "This project record is ready for milestones, notes, invoicing, and delivery tracking."}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                onClick={() => {
                  setSelectedStatus(project.status)
                  setShowStatusModal(true)
                }}
                className="bg-[#1ABFAD] text-white hover:bg-[#18AA9A]"
              >
                Update Status
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedProgress(project.progress)
                  setShowProgressModal(true)
                }}
                className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              >
                Update Progress
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  router.push(`/admin/invoices/new?projectId=${projectId}&clientId=${project.clientId}`)
                }
                className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                label: "Budget",
                value: formatCurrency(project.budget || 0, projectCurrency),
                note: `Currency ${projectCurrency}`,
              },
              {
                label: "Progress",
                value: `${project.progress}%`,
                note: `${completedMilestones}/${milestones.length || 0} milestones done`,
              },
              {
                label: "Manager",
                value: project.managerName || "Unassigned",
                note: "Primary owner",
              },
              {
                label: "Timeline",
                value: remainingDays !== null ? `${remainingDays} days left` : "Not scheduled",
                note: `${formatDate(project.startDate)} → ${formatDate(project.estimatedEndDate)}`,
              },
            ].map((item) => (
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

      <div className="grid gap-6 xl:grid-cols-[1.55fr_0.9fr]">
        <div className="space-y-6">
          <Card className="rounded-[28px] border-[#E7EEF6] shadow-sm">
            <CardContent className="p-6 sm:p-7">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="milestones">Milestones ({milestones.length})</TabsTrigger>
                  <TabsTrigger value="notes">Notes ({notes.length})</TabsTrigger>
                  <TabsTrigger value="invoices">Invoices ({invoices.length})</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 pt-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <DetailTile label="Client" value={project.clientName} />
                    <DetailTile label="Project Manager" value={project.managerName || "Unassigned"} />
                    <DetailTile label="Currency" value={projectCurrency} />
                    <DetailTile
                      label="Budget"
                      value={formatCurrency(project.budget || 0, projectCurrency)}
                    />
                    <DetailTile label="Start Date" value={formatDate(project.startDate)} />
                    <DetailTile label="Estimated End Date" value={formatDate(project.estimatedEndDate)} />
                    <DetailTile
                      label="Billing Model"
                      value={formatStatusLabel(project.billingModel)}
                    />
                    <DetailTile
                      label="Category"
                      value={formatStatusLabel(project.category)}
                    />
                  </div>

                  <div className="rounded-3xl border border-[#E7EEF6] bg-[#F8FBFF] px-5 py-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4B6B88]">
                      Scope
                    </p>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#4B5563]">
                      {project.scope || "No scope defined yet."}
                    </p>
                  </div>

                  {(project.category === "UEP_IMPLEMENTATION" || project.category === "SAAS_TOOLKIT_BUILD") && (
                    <div className="rounded-3xl border border-[#EADACB] bg-[#FFF8F1] px-5 py-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B56A36]">
                        Delivery-Specific Details
                      </p>
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        {project.category === "UEP_IMPLEMENTATION" && (
                          <>
                            <DetailTile label="Institution Type" value={project.institutionType || "Not specified"} tone="warm" />
                            <DetailTile label="Deployment Model" value={project.deploymentModel || "Not specified"} tone="warm" />
                            <DetailTile
                              label="Selected Modules"
                              value={(project.selectedModules || []).length ? (project.selectedModules || []).join(", ") : "No modules selected"}
                              tone="warm"
                            />
                            <DetailTile
                              label="Support Plan"
                              value={project.supportPlan || "Not specified"}
                              tone="warm"
                            />
                          </>
                        )}
                        {project.category === "SAAS_TOOLKIT_BUILD" && (
                          <>
                            <DetailTile
                              label="Base Modules"
                              value={(project.baseModules || []).length ? (project.baseModules || []).join(", ") : "No base modules selected"}
                              tone="warm"
                            />
                            <DetailTile label="Custom Modules" value={project.customModules || "None"} tone="warm" />
                            <DetailTile label="Architecture Plan" value={project.architecturePlan || "Not specified"} tone="warm" />
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="milestones" className="pt-6">
                  <MilestoneList
                    milestones={milestones}
                    currency={projectCurrency}
                    onAddMilestone={async (data) => {
                      const response = await fetch(`/api/projects/${projectId}/milestones`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(data),
                      })
                      if (!response.ok) throw new Error("Failed to create milestone")
                      const result = await response.json()
                      setMilestones((current) => [...current, result.data || result])
                    }}
                    onUpdateMilestone={async (id, data) => {
                      const response = await fetch(`/api/projects/${projectId}/milestones/${id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(data),
                      })
                      if (!response.ok) throw new Error("Failed to update milestone")
                      const result = await response.json()
                      setMilestones((current) =>
                        current.map((milestone) =>
                          milestone.id === id ? (result.data || result) : milestone
                        )
                      )
                    }}
                    onDeleteMilestone={async (id) => {
                      const response = await fetch(`/api/projects/${projectId}/milestones/${id}`, {
                        method: "DELETE",
                      })
                      if (!response.ok) throw new Error("Failed to delete milestone")
                      setMilestones((current) => current.filter((milestone) => milestone.id !== id))
                    }}
                    onReorderMilestones={handleReorderMilestones}
                  />
                </TabsContent>

                <TabsContent value="notes" className="space-y-4 pt-6">
                  <div className="rounded-3xl border border-[#E7EEF6] bg-[#F8FBFF] p-5">
                    <p className="text-sm font-semibold text-[#042042]">Add project note</p>
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Capture internal context, delivery updates, or client-facing notes."
                      className="mt-4 min-h-[120px] w-full rounded-2xl border border-[#DDE8F2] bg-white px-4 py-3 text-sm"
                    />
                    <label className="mt-4 flex items-center gap-2 text-sm text-[#4B5563]">
                      <input
                        type="checkbox"
                        checked={isClientVisible}
                        onChange={(e) => setIsClientVisible(e.target.checked)}
                      />
                      Visible to client portal
                    </label>
                    <div className="mt-4 flex justify-end">
                      <Button onClick={handleAddNote}>Add Note</Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {notes.length === 0 ? (
                      <p className="py-8 text-center text-sm text-[#6B7280]">No notes yet</p>
                    ) : (
                      notes.map((note) => (
                        <div
                          key={note.id}
                          className="rounded-3xl border border-[#E7EEF6] bg-white px-5 py-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm text-[#6B7280]">
                              {note.createdBy} · {new Date(note.createdAt).toLocaleString("en-IN")}
                            </p>
                            {note.isClientVisible && <Badge variant="outline">Client Visible</Badge>}
                          </div>
                          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#374151]">
                            {note.content}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="invoices" className="space-y-4 pt-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-[#6B7280]">
                      {invoices.length} invoice{invoices.length !== 1 ? "s" : ""} linked to this project
                    </p>
                    <Button
                      size="sm"
                      onClick={() =>
                        router.push(`/admin/invoices/new?projectId=${projectId}&clientId=${project.clientId}`)
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Invoice
                    </Button>
                  </div>

                  {invoices.length === 0 ? (
                    <p className="py-8 text-center text-sm text-[#6B7280]">
                      No invoices yet for this project
                    </p>
                  ) : (
                    invoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className="cursor-pointer rounded-3xl border border-[#E7EEF6] bg-white px-5 py-4 transition hover:border-[#1ABFAD]"
                        onClick={() => router.push(`/admin/invoices/${invoice.id}`)}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold text-[#042042]">{invoice.invoiceNumber}</p>
                            <p className="mt-1 text-sm text-[#6B7280]">
                              Due {formatDate(invoice.dueDate)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-[#042042]">
                              {formatCurrency(invoice.total, invoice.currency || projectCurrency)}
                            </p>
                            <Badge className={heroStatusStyles[invoice.status.toUpperCase().replace(/\s+/g, "_")] || "border-slate-200 bg-slate-100 text-slate-700"}>
                              {formatStatusLabel(invoice.status)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="documents" className="pt-6">
                  <AttachmentManager
                    entityType="project"
                    entityId={projectId}
                    emptyMessage="No project documents uploaded yet."
                  />
                </TabsContent>

                <TabsContent value="history" className="pt-6">
                  <div className="space-y-4">
                    {statusHistory.length === 0 ? (
                      <p className="py-8 text-center text-sm text-[#6B7280]">No status changes yet</p>
                    ) : (
                      statusHistory.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-3xl border border-[#E7EEF6] bg-[#F8FBFF] px-5 py-4"
                        >
                          <div className="flex flex-wrap items-center gap-3">
                            <Badge className={heroStatusStyles[item.toStatus] || heroStatusStyles.DRAFT}>
                              {formatStatusLabel(item.toStatus)}
                            </Badge>
                            <span className="text-sm text-[#6B7280]">
                              {new Date(item.changedAt).toLocaleString("en-IN")}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-[#374151]">
                            {formatStatusLabel(item.fromStatus)} → {formatStatusLabel(item.toStatus)} by {item.changedBy}
                          </p>
                          {item.reason && (
                            <p className="mt-2 text-sm text-[#6B7280]">{item.reason}</p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[28px] border-[#DDE8F2] shadow-sm">
            <CardContent className="p-6 sm:p-7">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-[#ECF6FF] p-3 text-[#1ABFAD]">
                  <LayoutDashboard className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-[#042042]">Delivery Snapshot</h2>
                  <p className="text-sm text-[#6B7280]">High-level operating view for the current project state.</p>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-[#6B7280]">Project progress</span>
                    <span className="font-semibold text-[#042042]">{project.progress}%</span>
                  </div>
                  <ProgressBar percentage={project.progress} />
                </div>

                <div className="space-y-3 rounded-3xl border border-[#E7EEF6] bg-[#F8FBFF] p-5">
                  <div className="flex items-start gap-3">
                    <UserRound className="mt-0.5 h-4 w-4 text-[#1ABFAD]" />
                    <div>
                      <p className="text-sm font-medium text-[#042042]">Client</p>
                      <p className="text-sm text-[#6B7280]">{project.clientName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FolderKanban className="mt-0.5 h-4 w-4 text-[#1ABFAD]" />
                    <div>
                      <p className="text-sm font-medium text-[#042042]">Milestones</p>
                      <p className="text-sm text-[#6B7280]">
                        {completedMilestones} completed · {milestones.length - completedMilestones} still moving
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileText className="mt-0.5 h-4 w-4 text-[#1ABFAD]" />
                    <div>
                      <p className="text-sm font-medium text-[#042042]">Invoices</p>
                      <p className="text-sm text-[#6B7280]">
                        {invoices.length} linked finance record{invoices.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CalendarDays className="mt-0.5 h-4 w-4 text-[#1ABFAD]" />
                    <div>
                      <p className="text-sm font-medium text-[#042042]">Timeline</p>
                      <p className="text-sm text-[#6B7280]">
                        {formatDate(project.startDate)} → {formatDate(project.estimatedEndDate)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border-[#EADACB] bg-[#FFF8F1] shadow-sm">
            <CardContent className="p-6 sm:p-7">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white p-3 text-[#B56A36] shadow-sm">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-[#042042]">Project Ops Notes</h2>
                  <p className="text-sm text-[#6B7280]">A few helpful cues while moving this project forward.</p>
                </div>
              </div>
              <div className="mt-5 space-y-4">
                <p className="text-sm leading-7 text-[#5B4638]">
                  Keep milestone completion and progress percentage aligned so the dashboard and client expectations stay consistent.
                </p>
                <p className="text-sm leading-7 text-[#5B4638]">
                  Use client-visible notes for delivery updates the client should see, and keep internal implementation detail in standard notes.
                </p>
                <p className="text-sm leading-7 text-[#5B4638]">
                  Generate invoices from the project workspace whenever billing needs to stay tied closely to delivery phases.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#042042]">Update Project Status</h3>
              <button onClick={() => setShowStatusModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#374151]">New Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1ABFAD]"
                >
                  {[
                    "DRAFT",
                    "ACTIVE",
                    "DISCOVERY",
                    "IN_DESIGN",
                    "IN_DEVELOPMENT",
                    "IN_REVIEW",
                    "ON_HOLD",
                    "COMPLETED",
                    "CANCELLED",
                  ].map((status) => (
                    <option key={status} value={status}>
                      {formatStatusLabel(status)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#374151]">Reason (optional)</label>
                <textarea
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="Reason for status change..."
                  className="h-20 w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1ABFAD]"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleUpdateStatus} disabled={isUpdating}>
                  {isUpdating ? "Updating..." : "Update Status"}
                </Button>
                <Button variant="outline" onClick={() => setShowStatusModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showProgressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#042042]">Update Project Progress</h3>
              <button onClick={() => setShowProgressModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-medium text-[#374151]">Progress</label>
                  <span className="text-lg font-bold text-[#1ABFAD]">{selectedProgress}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={selectedProgress}
                  onChange={(e) => setSelectedProgress(Number(e.target.value))}
                  className="w-full accent-[#1ABFAD]"
                />
                <div className="mt-1 flex justify-between text-xs text-gray-400">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleUpdateProgress} disabled={isUpdating}>
                  {isUpdating ? "Updating..." : "Save Progress"}
                </Button>
                <Button variant="outline" onClick={() => setShowProgressModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
