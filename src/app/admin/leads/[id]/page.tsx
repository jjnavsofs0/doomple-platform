"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Edit2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Target,
  UserRound,
} from "lucide-react"
import { format } from "date-fns"
import type { Lead, LeadActivity, LeadNote, User } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusBadge } from "@/components/ui/status-badge"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/toast"
import { LeadPipeline } from "@/components/admin/lead-pipeline"
import { ActivityTimeline } from "@/components/admin/activity-timeline"

interface LeadWithRelations extends Lead {
  assignedTo: User | null
  notes: (LeadNote & { user?: User | null })[]
  activities: (LeadActivity & { user: User | null })[]
  convertedClient?: {
    id: string
    companyName: string | null
    email: string
  } | null
  convertedProject?: {
    id: string
    name: string
    status: string
  } | null
}

const LEAD_STATUSES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "DISCOVERY_SCHEDULED",
  "PROPOSAL_SENT",
  "NEGOTIATION",
  "WON",
  "LOST",
  "ON_HOLD",
]

const statusColorMap = {
  NEW: "outline",
  CONTACTED: "default",
  QUALIFIED: "success",
  DISCOVERY_SCHEDULED: "warning",
  PROPOSAL_SENT: "warning",
  NEGOTIATION: "default",
  WON: "success",
  LOST: "destructive",
  ON_HOLD: "outline",
} as const

const priorityColorMap = {
  LOW: "outline",
  MEDIUM: "default",
  HIGH: "warning",
  URGENT: "destructive",
} as const

const heroStatusStyles = {
  NEW: "border-slate-200 bg-slate-100 text-slate-800",
  CONTACTED: "border-sky-200 bg-sky-100 text-sky-800",
  QUALIFIED: "border-emerald-200 bg-emerald-100 text-emerald-800",
  DISCOVERY_SCHEDULED: "border-amber-200 bg-amber-100 text-amber-800",
  PROPOSAL_SENT: "border-violet-200 bg-violet-100 text-violet-800",
  NEGOTIATION: "border-cyan-200 bg-cyan-100 text-cyan-800",
  WON: "border-emerald-200 bg-emerald-100 text-emerald-800",
  LOST: "border-rose-200 bg-rose-100 text-rose-800",
  ON_HOLD: "border-slate-200 bg-slate-100 text-slate-700",
} as const

function formatStatusLabel(value?: string | null) {
  if (!value) return "Not set"
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function formatDate(value?: string | Date | null, pattern = "dd MMM yyyy") {
  if (!value) return "Not available"
  return format(new Date(value), pattern)
}

function DetailTile({
  label,
  value,
  tone = "cool",
}: {
  label: string
  value: string
  tone?: "cool" | "warm"
}) {
  return (
    <div
      className={`rounded-3xl border px-5 py-5 ${
        tone === "warm"
          ? "border-[#EADACB] bg-[#FFF8F1]"
          : "border-[#E7EEF6] bg-[#F8FBFF]"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#4B6B88]">{label}</p>
      <p className="mt-3 text-sm leading-7 text-[#374151]">{value}</p>
    </div>
  )
}

function CompactDataCard({
  title,
  tone = "cool",
  items,
}: {
  title: string
  tone?: "cool" | "warm"
  items: Array<{ label: string; value: string }>
}) {
  return (
    <div
      className={`rounded-3xl border px-5 py-5 ${
        tone === "warm"
          ? "border-[#EADACB] bg-[#FFF8F1]"
          : "border-[#E7EEF6] bg-[#F8FBFF]"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#4B6B88]">{title}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <div key={`${title}-${item.label}`} className="rounded-2xl bg-white/70 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
              {item.label}
            </p>
            <p className="mt-2 text-sm font-medium leading-6 text-[#042042]">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function SnapshotMetric({
  label,
  value,
  tone = "cool",
}: {
  label: string
  value: string
  tone?: "cool" | "warm"
}) {
  return (
    <div
      className={`rounded-2xl border px-4 py-4 ${
        tone === "warm"
          ? "border-[#F0D9C7] bg-[#FFF7EE]"
          : "border-[#E1EAF3] bg-[#F8FBFF]"
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">{label}</p>
      <p className="mt-2 text-base font-semibold text-[#042042]">{value}</p>
    </div>
  )
}

function EmptyState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-3xl border border-dashed border-[#D5E1EC] bg-[#FBFDFF] px-6 py-10 text-center">
      <p className="text-lg font-semibold text-[#042042]">{title}</p>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-[#6B7280]">{description}</p>
    </div>
  )
}

export default function LeadDetailPage() {
  const router = useRouter()
  const params = useParams()
  const leadId = params.id as string
  const { toast } = useToast()

  const [lead, setLead] = useState<LeadWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [noteContent, setNoteContent] = useState("")
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [users, setUsers] = useState<Array<{ id: string; name: string; role: string; isActive: boolean }>>([])

  const fetchLead = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/leads/${leadId}`, { cache: "no-store" })
      if (!response.ok) throw new Error("Failed to fetch lead")
      const data = await response.json()
      setLead(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load lead")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLead()
  }, [leadId])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users?limit=100", { cache: "no-store" })
        if (!response.ok) return
        const result = await response.json()
        setUsers(
          (result.data || []).filter(
            (user: { role: string; isActive: boolean }) => user.isActive && user.role !== "CLIENT"
          )
        )
      } catch {
        setUsers([])
      }
    }

    fetchUsers()
  }, [])

  const handleStatusChange = async (newStatus: string) => {
    if (!lead) return

    try {
      setIsUpdating(true)
      setError(null)
      const response = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error("Failed to update status")
      await fetchLead()
      toast({
        type: "success",
        title: "Lead status updated",
        description: `The lead is now ${formatStatusLabel(newStatus)}.`,
      })
    } catch (err) {
      toast({
        type: "error",
        title: "Could not update lead status",
        description:
          err instanceof Error ? err.message : "Failed to update status",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleAddNote = async () => {
    if (!noteContent.trim() || !lead) return

    try {
      setIsAddingNote(true)
      setError(null)
      const response = await fetch(`/api/leads/${leadId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: noteContent }),
      })

      if (!response.ok) throw new Error("Failed to add note")
      setNoteContent("")
      await fetchLead()
      toast({
        type: "success",
        title: "Note added",
        description: "The lead note was saved.",
      })
    } catch (err) {
      toast({
        type: "error",
        title: "Could not add note",
        description:
          err instanceof Error ? err.message : "Failed to add note",
      })
    } finally {
      setIsAddingNote(false)
    }
  }

  const handleConvertToClient = async () => {
    if (!lead) return

    try {
      setIsUpdating(true)
      setError(null)
      const response = await fetch(`/api/leads/${leadId}/convert`, {
        method: "POST",
      })

      if (!response.ok) throw new Error("Failed to convert lead to client")
      const result = await response.json()
      const clientId = result?.data?.client?.id
      if (clientId) {
        toast({
          type: "success",
          title: "Lead converted",
          description: "The lead was linked to a client record.",
        })
        router.push(`/admin/clients/${clientId}`)
        return
      }

      await fetchLead()
      toast({
        type: "success",
        title: "Lead converted",
        description: "The lead conversion was completed.",
      })
    } catch (err) {
      toast({
        type: "error",
        title: "Could not convert lead",
        description:
          err instanceof Error ? err.message : "Failed to convert lead",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleAssigneeChange = async (assignedToId: string) => {
    if (!lead) return

    try {
      setIsUpdating(true)
      setError(null)
      const response = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignedToId: assignedToId || null,
        }),
      })

      if (!response.ok) throw new Error("Failed to update assignee")
      await fetchLead()
      toast({
        type: "success",
        title: "Assignee updated",
        description: assignedToId
          ? "The lead owner was updated."
          : "The lead was unassigned.",
      })
    } catch (err) {
      toast({
        type: "error",
        title: "Could not update assignee",
        description:
          err instanceof Error ? err.message : "Failed to update assignee",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const leadSummary = useMemo(() => {
    if (!lead) return null

    return [
      {
        label: "Priority",
        value: formatStatusLabel(lead.priority),
        note: "Current urgency",
      },
      {
        label: "Assigned",
        value: lead.assignedTo?.name || "Unassigned",
        note: "Responsible owner",
      },
      {
        label: "Source",
        value: formatStatusLabel(lead.source),
        note: "Lead acquisition source",
      },
      {
        label: "Updated",
        value: formatDate(lead.updatedAt),
        note: "Last change in workspace",
      },
    ]
  }, [lead])

  const isConverted = Boolean(lead?.convertedClientId && lead?.convertedClient)

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[240px] rounded-[30px]" />
        <div className="grid gap-6 xl:grid-cols-[1.55fr_0.9fr]">
          <Skeleton className="h-[620px] rounded-[28px]" />
          <Skeleton className="h-[420px] rounded-[28px]" />
        </div>
      </div>
    )
  }

  if (error || !lead) {
    return (
      <Card className="rounded-[28px] border-rose-200 bg-rose-50 shadow-sm">
        <CardContent className="space-y-4 p-8">
          <p className="text-2xl font-semibold text-[#042042]">{error || "Lead not found"}</p>
          <Button onClick={() => router.back()} className="bg-[#042042] text-white hover:bg-[#0A2C54]">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go back
          </Button>
        </CardContent>
      </Card>
    )
  }

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
            <Badge className={heroStatusStyles[lead.status] || heroStatusStyles.NEW}>
              {formatStatusLabel(lead.status)}
            </Badge>
            <Button
              variant="outline"
              onClick={() => router.push(`/admin/leads/${leadId}/edit`)}
              className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            >
              <Edit2 className="mr-2 h-4 w-4" />
              Edit Lead
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7CE6DA]">
              Lead Workspace
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{lead.fullName}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72 sm:text-base">
              {lead.companyName || "Independent inquiry"} · {lead.email}
              {lead.phone ? ` · ${lead.phone}` : ""}
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65">
              {lead.requirementsSummary?.trim()
                ? lead.requirementsSummary
                : "Use this workspace to move the lead through the pipeline, capture discovery notes, and keep conversion context visible for the full team."}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {isConverted ? (
                <>
                  <Button
                    onClick={() => router.push(`/admin/clients/${lead.convertedClientId}`)}
                    className="bg-[#1ABFAD] text-white hover:bg-[#18AA9A]"
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    Open Client Record
                  </Button>
                  {lead.convertedProjectId ? (
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/admin/projects/${lead.convertedProjectId}`)}
                      className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                    >
                      <Target className="mr-2 h-4 w-4" />
                      Open Project
                    </Button>
                  ) : null}
                </>
              ) : (
                <Button
                  onClick={handleConvertToClient}
                  disabled={isUpdating}
                  className="bg-[#1ABFAD] text-white hover:bg-[#18AA9A]"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Convert to Client
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setActiveTab("notes")}
                className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              >
                Add Note
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {leadSummary?.map((item) => (
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
        <Card className="rounded-[24px] border-rose-200 bg-rose-50">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-rose-700">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.55fr_0.9fr]">
        <div className="space-y-6">
          <Card className="rounded-[28px] border-[#E7EEF6] shadow-sm">
            <CardContent className="space-y-6 p-6 sm:p-7">
              <div className="rounded-3xl border border-[#E7EEF6] bg-[#F8FBFF] p-5">
                <p className="text-sm font-semibold text-[#042042]">Pipeline</p>
                <div className="mt-6 overflow-x-auto pb-2">
                  <div className="min-w-[760px]">
                    <LeadPipeline currentStatus={lead.status} />
                  </div>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="notes">Notes ({lead.notes.length})</TabsTrigger>
                  <TabsTrigger value="activity">Activity ({lead.activities.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 pt-6">
                  <CompactDataCard
                    title="Lead Essentials"
                    items={[
                      { label: "Category", value: formatStatusLabel(lead.category) },
                      { label: "Source", value: formatStatusLabel(lead.source) },
                      { label: "Priority", value: formatStatusLabel(lead.priority) },
                      { label: "Assigned To", value: lead.assignedTo?.name || "Unassigned" },
                      {
                        label: "Location",
                        value: [lead.location, lead.country].filter(Boolean).join(", ") || "Not available",
                      },
                      { label: "Created", value: formatDate(lead.createdAt) },
                    ]}
                  />

                  <CompactDataCard
                    title="Business Context"
                    tone="warm"
                    items={[
                      { label: "Budget Range", value: lead.budgetRange || "Not specified" },
                      { label: "Timeline", value: lead.timeline || "Not specified" },
                      { label: "Business Stage", value: lead.businessStage || "Not specified" },
                      { label: "Project Type", value: lead.projectType || "Not specified" },
                      { label: "Offering Type", value: lead.offeringType || "Not specified" },
                      { label: "Follow-up Date", value: formatDate(lead.followUpDate) },
                    ]}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <DetailTile label="Selected Service" value={lead.selectedService || "Not selected"} />
                    <DetailTile label="Selected Solution" value={lead.selectedSolution || "Not selected"} />
                  </div>

                  {isConverted ? (
                    <div className="rounded-3xl border border-[#D8EDE7] bg-[#F3FCF9] px-5 py-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0F766E]">
                        Conversion Links
                      </p>
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl bg-white/80 px-4 py-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
                            Client Record
                          </p>
                          <p className="mt-2 text-sm font-medium text-[#042042]">
                            {lead.convertedClient?.companyName || lead.convertedClient?.email || "Linked client"}
                          </p>
                          <Button
                            variant="outline"
                            className="mt-3"
                            onClick={() => router.push(`/admin/clients/${lead.convertedClientId}`)}
                          >
                            Open Client
                          </Button>
                        </div>
                        <div className="rounded-2xl bg-white/80 px-4 py-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
                            Project Record
                          </p>
                          <p className="mt-2 text-sm font-medium text-[#042042]">
                            {lead.convertedProject?.name || "Linked project"}
                          </p>
                          {lead.convertedProjectId ? (
                            <Button
                              variant="outline"
                              className="mt-3"
                              onClick={() => router.push(`/admin/projects/${lead.convertedProjectId}`)}
                            >
                              Open Project
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div className="rounded-3xl border border-[#E7EEF6] bg-[#F8FBFF] px-5 py-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4B6B88]">
                      Requirements Summary
                    </p>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#4B5563]">
                      {lead.requirementsSummary || "No requirements summary captured yet."}
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="notes" className="space-y-4 pt-6">
                  <div className="rounded-3xl border border-[#E7EEF6] bg-[#F8FBFF] p-5">
                    <p className="text-sm font-semibold text-[#042042]">Add lead note</p>
                    <p className="mt-2 text-sm leading-7 text-[#6B7280]">
                      Capture discovery insights, objections, next steps, or internal context that should stay attached to this lead.
                    </p>
                    <Textarea
                      placeholder="Add a note about this lead..."
                      value={noteContent}
                      onChange={(event) => setNoteContent(event.target.value)}
                      rows={5}
                      className="mt-4 rounded-2xl border-[#DDE8F2] bg-white"
                    />
                    <div className="mt-4 flex justify-end">
                      <Button onClick={handleAddNote} disabled={isAddingNote || !noteContent.trim()}>
                        {isAddingNote ? "Adding..." : "Add Note"}
                      </Button>
                    </div>
                  </div>

                  {lead.notes.length > 0 ? (
                    <div className="space-y-3">
                      {lead.notes.map((note) => (
                        <div
                          key={note.id}
                          className="rounded-3xl border border-[#E7EEF6] bg-white px-5 py-5"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm text-[#6B7280]">
                              {formatDate(note.createdAt, "dd MMM yyyy h:mm a")}
                            </p>
                            {note.user?.name ? (
                              <Badge variant="outline">{note.user.name}</Badge>
                            ) : null}
                          </div>
                          <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#4B5563]">
                            {note.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="No notes yet"
                      description="Add the first note to capture qualification context, objections, or the next planned touchpoint."
                    />
                  )}
                </TabsContent>

                <TabsContent value="activity" className="pt-6">
                  <div className="rounded-3xl border border-[#E7EEF6] bg-white p-5">
                    <ActivityTimeline activities={lead.activities} />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[28px] border-[#E7EEF6] shadow-sm">
            <CardContent className="space-y-4 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#4B6B88]">
                Status Control
              </p>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#042042]">Pipeline Stage</label>
                <Select
                  value={lead.status}
                  onValueChange={handleStatusChange}
                  disabled={isUpdating}
                  className="h-11 rounded-2xl border-[#DDE8F2] bg-white"
                >
                  {LEAD_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {formatStatusLabel(status)}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#042042]">Assigned To</label>
                <Select
                  value={lead.assignedToId || ""}
                  onValueChange={handleAssigneeChange}
                  disabled={isUpdating}
                  className="h-11 rounded-2xl border-[#DDE8F2] bg-white"
                >
                  <option value="">Unassigned</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role.replace(/_/g, " ")})
                    </option>
                  ))}
                </Select>
              </div>
              {isConverted ? (
                <div className="grid gap-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push(`/admin/clients/${lead.convertedClientId}`)}
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    Open Client Record
                  </Button>
                  {lead.convertedProjectId ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push(`/admin/projects/${lead.convertedProjectId}`)}
                    >
                      <Target className="mr-2 h-4 w-4" />
                      Open Linked Project
                    </Button>
                  ) : null}
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleConvertToClient}
                  disabled={isUpdating}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Convert to Client
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border-[#E7EEF6] shadow-sm">
            <CardContent className="space-y-4 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#4B6B88]">
                Contact Snapshot
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="mt-1 h-4 w-4 text-[#4B6B88]" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6B7280]">Email</p>
                    <p className="mt-1 text-sm text-[#042042]">{lead.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="mt-1 h-4 w-4 text-[#4B6B88]" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6B7280]">Phone</p>
                    <p className="mt-1 text-sm text-[#042042]">{lead.phone || "Not available"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building2 className="mt-1 h-4 w-4 text-[#4B6B88]" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6B7280]">Company</p>
                    <p className="mt-1 text-sm text-[#042042]">{lead.companyName || "Independent inquiry"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 h-4 w-4 text-[#4B6B88]" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6B7280]">Location</p>
                    <p className="mt-1 text-sm text-[#042042]">
                      {[lead.location, lead.country].filter(Boolean).join(", ") || "Not available"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border-[#E7EEF6] shadow-sm">
            <CardContent className="space-y-4 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#4B6B88]">
                Workspace Snapshot
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <SnapshotMetric label="Owner" value={lead.assignedTo?.name || "Unassigned"} />
                <SnapshotMetric label="Last Updated" value={formatDate(lead.updatedAt)} />
                <SnapshotMetric label="Notes Logged" value={`${lead.notes.length}`} tone="warm" />
                <SnapshotMetric
                  label="Conversion"
                  value={isConverted ? "Linked to client" : "Not converted"}
                  tone="warm"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border-[#E7EEF6] shadow-sm">
            <CardContent className="space-y-4 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#4B6B88]">
                Quick Actions
              </p>
              <div className="grid gap-3">
                <Button onClick={() => router.push(`/admin/leads/${leadId}/edit`)}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit Lead
                </Button>
                <Button variant="outline" onClick={() => setActiveTab("activity")}>
                  <Target className="mr-2 h-4 w-4" />
                  View Activity
                </Button>
                <Button variant="outline" onClick={() => setActiveTab("notes")}>
                  <UserRound className="mr-2 h-4 w-4" />
                  Open Notes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
