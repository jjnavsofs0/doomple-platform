"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Edit,
  FileText,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  Receipt,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusBadge } from "@/components/ui/status-badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { AttachmentManager } from "@/components/admin/attachment-manager"
import { useToast } from "@/components/ui/toast"
import { formatCurrency } from "@/lib/utils"

interface ClientDocument {
  id: string
}

interface ClientDetail {
  id: string
  companyName: string
  contactPersonName: string
  email: string
  phone: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  postalCode?: string | null
  country?: string | null
  gstNumber?: string | null
  panNumber?: string | null
  bankName?: string | null
  bankAccountNumber?: string | null
  ifscCode?: string | null
  status: "active" | "inactive"
  notes?: string | null
  createdAt?: string
  documents?: ClientDocument[]
  convertedFromLeads?: Array<{
    id: string
    fullName: string
    email: string
    companyName?: string | null
    status: string
    convertedProjectId?: string | null
  }>
}

interface Project {
  id: string
  name: string
  status: "active" | "completed" | "on_hold" | "cancelled"
  progress: number
  category: string
}

interface Invoice {
  id: string
  invoiceNumber: string
  amount: number
  currency?: string
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
  dueDate: string
}

interface CommunicationLog {
  id: string
  type: "email" | "call" | "meeting" | "note"
  subject: string
  date: string
  notes?: string
}

const heroStatusStyles = {
  active: "border-emerald-200 bg-emerald-100 text-emerald-800",
  inactive: "border-slate-200 bg-slate-100 text-slate-700",
}

const communicationTypeOptions = [
  { value: "note", label: "Note" },
  { value: "email", label: "Email" },
  { value: "call", label: "Call" },
  { value: "meeting", label: "Meeting" },
]

function formatDate(value?: string | null) {
  if (!value) return "Not available"
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

function formatStatusLabel(value?: string | null) {
  if (!value) return "Not set"
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
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

function BillingReadinessRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl bg-[#FFFDF9] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9A6A42]">{label}</p>
      <p className="max-w-[65%] text-right text-sm font-medium leading-6 text-[#042042]">{value}</p>
    </div>
  )
}

function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="rounded-3xl border border-dashed border-[#D5E1EC] bg-[#FBFDFF] px-6 py-10 text-center">
      <p className="text-lg font-semibold text-[#042042]">{title}</p>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-[#6B7280]">{description}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  )
}

export default function ClientDetailPage() {
  const router = useRouter()
  const params = useParams()
  const clientId = params.id as string
  const { toast } = useToast()

  const [client, setClient] = React.useState<ClientDetail | null>(null)
  const [projects, setProjects] = React.useState<Project[]>([])
  const [invoices, setInvoices] = React.useState<Invoice[]>([])
  const [communications, setCommunications] = React.useState<CommunicationLog[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [activeTab, setActiveTab] = React.useState("overview")
  const [clientNotes, setClientNotes] = React.useState("")
  const [notesSaving, setNotesSaving] = React.useState(false)
  const [showCommunicationForm, setShowCommunicationForm] = React.useState(false)
  const [communicationType, setCommunicationType] = React.useState<CommunicationLog["type"]>("note")
  const [communicationSubject, setCommunicationSubject] = React.useState("")
  const [communicationNotes, setCommunicationNotes] = React.useState("")
  const [communicationSaving, setCommunicationSaving] = React.useState(false)

  const sourceLeads = client?.convertedFromLeads || []
  const primarySourceLead = sourceLeads[0] || null

  const fetchData = React.useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [clientRes, projectsRes, invoicesRes, commRes] = await Promise.all([
        fetch(`/api/clients/${clientId}`, { cache: "no-store" }),
        fetch(`/api/clients/${clientId}/projects`, { cache: "no-store" }),
        fetch(`/api/clients/${clientId}/invoices`, { cache: "no-store" }),
        fetch(`/api/clients/${clientId}/communications`, { cache: "no-store" }),
      ])

      if (!clientRes.ok) {
        throw new Error("Failed to fetch client")
      }

      const clientData = await clientRes.json()
      const resolvedClient = clientData.data || clientData
      setClient(resolvedClient)
      setClientNotes(resolvedClient.notes || "")

      if (projectsRes.ok) {
        const projectsData = await projectsRes.json()
        setProjects(Array.isArray(projectsData) ? projectsData : projectsData.data || [])
      } else {
        setProjects([])
      }

      if (invoicesRes.ok) {
        const invoicesData = await invoicesRes.json()
        setInvoices(Array.isArray(invoicesData) ? invoicesData : invoicesData.data || [])
      } else {
        setInvoices([])
      }

      if (commRes.ok) {
        const commData = await commRes.json()
        setCommunications(Array.isArray(commData) ? commData : commData.data || [])
      } else {
        setCommunications([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }, [clientId])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSaveNotes = async () => {
    try {
      setNotesSaving(true)
      setError(null)
      const response = await fetch(`/api/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: clientNotes }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || "Failed to save notes")
      }

      setClient((current) =>
        current
          ? {
              ...current,
              notes: clientNotes,
            }
          : current
      )
      toast({
        type: "success",
        title: "Notes saved",
        description: "The client notes were updated.",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save notes")
      toast({
        type: "error",
        title: "Could not save notes",
        description:
          err instanceof Error ? err.message : "Please try again.",
      })
    } finally {
      setNotesSaving(false)
    }
  }

  const handleAddCommunication = async () => {
    if (!communicationNotes.trim()) return

    try {
      setCommunicationSaving(true)
      setError(null)
      const response = await fetch(`/api/clients/${clientId}/communications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: communicationType,
          subject: communicationSubject,
          notes: communicationNotes,
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || "Failed to add communication entry")
      }

      setCommunications((current) => [result.data || result, ...current])
      setCommunicationType("note")
      setCommunicationSubject("")
      setCommunicationNotes("")
      setShowCommunicationForm(false)
      toast({
        type: "success",
        title: "Log entry added",
        description: "The communication entry was saved to this client.",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add communication entry")
      toast({
        type: "error",
        title: "Could not add log entry",
        description:
          err instanceof Error ? err.message : "Please try again.",
      })
    } finally {
      setCommunicationSaving(false)
    }
  }

  const handleDeleteCommunication = async (communicationId: string) => {
    const confirmed = window.confirm("Delete this communication log entry?")
    if (!confirmed) return

    try {
      const response = await fetch(
        `/api/clients/${clientId}/communications/${communicationId}`,
        {
          method: "DELETE",
        }
      )

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || "Failed to delete communication entry")
      }

      setCommunications((current) =>
        current.filter((entry) => entry.id !== communicationId)
      )
      toast({
        type: "success",
        title: "Log entry deleted",
        description: "The communication entry was removed.",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete communication entry")
      toast({
        type: "error",
        title: "Could not delete log entry",
        description:
          err instanceof Error ? err.message : "Please try again.",
      })
    }
  }

  if (isLoading) {
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

  if (error || !client) {
    return (
      <Card className="rounded-[28px] border-rose-200 bg-rose-50 shadow-sm">
        <CardContent className="space-y-4 p-8">
          <p className="text-2xl font-semibold text-[#042042]">{error || "Client not found"}</p>
          <Button onClick={() => router.back()} className="bg-[#042042] text-white hover:bg-[#0A2C54]">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go back
          </Button>
        </CardContent>
      </Card>
    )
  }

  const openInvoices = invoices.filter((invoice) => !["paid", "cancelled"].includes(invoice.status)).length
  const activeProjects = projects.filter((project) => !["completed", "cancelled"].includes(project.status)).length
  const documentCount = client.documents?.length || 0
  const locationLine = [client.city, client.state, client.country].filter(Boolean).join(", ")

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
            <Badge className={heroStatusStyles[client.status] || heroStatusStyles.active}>
              {formatStatusLabel(client.status)}
            </Badge>
            <Button
              variant="outline"
              onClick={() => router.push(`/admin/clients/${clientId}/edit`)}
              className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Client
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7CE6DA]">
              Client Workspace
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{client.companyName}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72 sm:text-base">
              {client.contactPersonName} · {client.email}
              {client.phone ? ` · ${client.phone}` : ""}
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65">
              {client.notes?.trim()
                ? client.notes
                : "Keep billing details, delivery context, documents, and relationship history together so the team can move quickly from account review to project execution."}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                onClick={() => router.push(`/admin/projects/new?clientId=${clientId}`)}
                className="bg-[#1ABFAD] text-white hover:bg-[#18AA9A]"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(`/admin/invoices/new?clientId=${clientId}`)}
                className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              >
                <Receipt className="mr-2 h-4 w-4" />
                New Invoice
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(`/admin/quotations/new?clientId=${clientId}`)}
                className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              >
                <FileText className="mr-2 h-4 w-4" />
                New Quotation
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                label: "Projects",
                value: `${projects.length}`,
                note: `${activeProjects} active right now`,
              },
              {
                label: "Invoices",
                value: `${invoices.length}`,
                note: `${openInvoices} still open`,
              },
              {
                label: "Communication",
                value: `${communications.length}`,
                note: "Logged conversations and notes",
              },
              {
                label: "Documents",
                value: `${documentCount}`,
                note: `Added since ${formatDate(client.createdAt)}`,
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
            <CardContent className="p-6 sm:p-7">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="projects">Projects ({projects.length})</TabsTrigger>
                  <TabsTrigger value="invoices">Invoices ({invoices.length})</TabsTrigger>
                  <TabsTrigger value="communications">Communications ({communications.length})</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 pt-6">
                  <CompactDataCard
                    title="Account Overview"
                    items={[
                      { label: "Primary Contact", value: client.contactPersonName || "Not available" },
                      { label: "Status", value: formatStatusLabel(client.status) },
                      { label: "Email", value: client.email || "Not available" },
                      { label: "Phone", value: client.phone || "Not available" },
                      {
                        label: "Source Lead",
                        value: primarySourceLead ? primarySourceLead.fullName : "Direct client record",
                      },
                      { label: "Location", value: locationLine || client.address || "Not available" },
                      { label: "Joined", value: formatDate(client.createdAt) },
                    ]}
                  />

                  <CompactDataCard
                    title="Billing Profile"
                    tone="warm"
                    items={[
                      { label: "Billing Address", value: client.address || "Not available" },
                      {
                        label: "Postal / Country",
                        value:
                          [client.postalCode, client.country].filter(Boolean).join(" · ") || "Not available",
                      },
                      { label: "GST Number", value: client.gstNumber || "Not available" },
                      { label: "PAN Number", value: client.panNumber || "Not available" },
                      { label: "Bank Name", value: client.bankName || "Not added" },
                      {
                        label: "Bank Reference",
                        value:
                          [client.bankAccountNumber, client.ifscCode].filter(Boolean).join(" · ") ||
                          "Not added",
                      },
                    ]}
                  />

                  {sourceLeads.length > 0 ? (
                    <div className="rounded-3xl border border-[#D8EDE7] bg-[#F3FCF9] px-5 py-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0F766E]">
                        Lead Conversion Links
                      </p>
                      <div className="mt-4 space-y-3">
                        {sourceLeads.map((lead) => (
                          <div
                            key={lead.id}
                            className="flex flex-col gap-3 rounded-2xl bg-white/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div>
                              <p className="text-sm font-medium text-[#042042]">{lead.fullName}</p>
                              <p className="mt-1 text-sm text-[#6B7280]">
                                {lead.companyName || lead.email} · {formatStatusLabel(lead.status)}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                variant="outline"
                                onClick={() => router.push(`/admin/leads/${lead.id}`)}
                              >
                                View Lead
                              </Button>
                              {lead.convertedProjectId ? (
                                <Button
                                  variant="outline"
                                  onClick={() => router.push(`/admin/projects/${lead.convertedProjectId}`)}
                                >
                                  View Project
                                </Button>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </TabsContent>

                <TabsContent value="projects" className="space-y-4 pt-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-[#6B7280]">
                      {projects.length} project{projects.length !== 1 ? "s" : ""} linked to this client
                    </p>
                    <Button onClick={() => router.push(`/admin/projects/new?clientId=${clientId}`)}>
                      <Plus className="mr-2 h-4 w-4" />
                      New Project
                    </Button>
                  </div>

                  {projects.length === 0 ? (
                    <EmptyState
                      title="No projects yet"
                      description="Create the first project from this client workspace so delivery, milestones, and invoicing stay connected from the start."
                      action={
                        <Button onClick={() => router.push(`/admin/projects/new?clientId=${clientId}`)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Project
                        </Button>
                      }
                    />
                  ) : (
                    <div className="space-y-3">
                      {projects.map((project) => (
                        <button
                          key={project.id}
                          type="button"
                          onClick={() => router.push(`/admin/projects/${project.id}`)}
                          className="w-full rounded-3xl border border-[#E7EEF6] bg-white px-5 py-5 text-left transition hover:border-[#C4D7EA] hover:bg-[#FBFDFF]"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-lg font-semibold text-[#042042]">{project.name}</p>
                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <Badge variant="outline">{formatStatusLabel(project.category)}</Badge>
                                <StatusBadge status={project.status} />
                              </div>
                            </div>
                            <div className="text-sm text-[#6B7280]">
                              <p className="font-medium text-[#042042]">{project.progress}% complete</p>
                              <p className="mt-1">Open project workspace</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="invoices" className="space-y-4 pt-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-[#6B7280]">
                      {invoices.length} invoice{invoices.length !== 1 ? "s" : ""} linked to this client
                    </p>
                    <Button onClick={() => router.push(`/admin/invoices/new?clientId=${clientId}`)}>
                      <Plus className="mr-2 h-4 w-4" />
                      New Invoice
                    </Button>
                  </div>

                  {invoices.length === 0 ? (
                    <EmptyState
                      title="No invoices yet"
                      description="Create an invoice from here when the client is ready for billing, payment collection, or a manual settlement record."
                      action={
                        <Button onClick={() => router.push(`/admin/invoices/new?clientId=${clientId}`)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Invoice
                        </Button>
                      }
                    />
                  ) : (
                    <div className="space-y-3">
                      {invoices.map((invoice) => (
                        <button
                          key={invoice.id}
                          type="button"
                          onClick={() => router.push(`/admin/invoices/${invoice.id}`)}
                          className="w-full rounded-3xl border border-[#E7EEF6] bg-white px-5 py-5 text-left transition hover:border-[#C4D7EA] hover:bg-[#FBFDFF]"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-lg font-semibold text-[#042042]">{invoice.invoiceNumber}</p>
                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <StatusBadge status={invoice.status} />
                                <Badge variant="outline">Due {formatDate(invoice.dueDate)}</Badge>
                              </div>
                            </div>
                            <div className="text-sm text-[#6B7280]">
                              <p className="text-lg font-semibold text-[#042042]">
                                {formatCurrency(invoice.amount, invoice.currency || "INR")}
                              </p>
                              <p className="mt-1">Open invoice</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="communications" className="space-y-4 pt-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#042042]">Communication log</p>
                      <p className="text-sm text-[#6B7280]">
                        Keep outreach, call notes, and follow-ups attached to the account.
                      </p>
                    </div>
                    <Button onClick={() => setShowCommunicationForm((current) => !current)}>
                      <Plus className="mr-2 h-4 w-4" />
                      {showCommunicationForm ? "Close Form" : "Add Log Entry"}
                    </Button>
                  </div>

                  {showCommunicationForm && (
                    <div className="rounded-3xl border border-[#E7EEF6] bg-[#F8FBFF] p-5">
                      <div className="grid gap-4 md:grid-cols-2">
                        <Select
                          label="Type"
                          value={communicationType}
                          onValueChange={(value) => setCommunicationType(value as CommunicationLog["type"])}
                          options={communicationTypeOptions}
                          className="h-11 rounded-2xl border-[#DDE8F2] bg-white"
                        />
                        <div>
                          <label className="mb-2 block text-sm font-medium text-[#042042]">Subject</label>
                          <input
                            value={communicationSubject}
                            onChange={(event) => setCommunicationSubject(event.target.value)}
                            placeholder="Optional subject"
                            className="h-11 w-full rounded-2xl border border-[#DDE8F2] bg-white px-4 text-sm"
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="mb-2 block text-sm font-medium text-[#042042]">Notes</label>
                        <textarea
                          value={communicationNotes}
                          onChange={(event) => setCommunicationNotes(event.target.value)}
                          placeholder="Capture what happened, what matters, and what needs to happen next."
                          className="min-h-[140px] w-full rounded-2xl border border-[#DDE8F2] bg-white px-4 py-3 text-sm"
                        />
                      </div>

                      <div className="mt-4 flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setShowCommunicationForm(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddCommunication} disabled={communicationSaving}>
                          {communicationSaving ? "Saving..." : "Save Log Entry"}
                        </Button>
                      </div>
                    </div>
                  )}

                  {communications.length === 0 ? (
                    <EmptyState
                      title="No communication logged yet"
                      description="As conversations start, log the important context here so account history is visible to the full team."
                    />
                  ) : (
                    <div className="space-y-3">
                      {communications.map((comm) => (
                        <div
                          key={comm.id}
                          className="rounded-3xl border border-[#E7EEF6] bg-white px-5 py-5"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-base font-semibold text-[#042042]">
                                {comm.subject || formatStatusLabel(comm.type)}
                              </p>
                              <p className="mt-1 text-sm text-[#6B7280]">{formatDate(comm.date)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="capitalize">
                                {comm.type}
                              </Badge>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteCommunication(comm.id)}
                                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          {comm.notes ? (
                            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#4B5563]">
                              {comm.notes}
                            </p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="documents" className="pt-6">
                  <AttachmentManager
                    entityType="client"
                    entityId={clientId}
                    emptyMessage="No client documents uploaded yet."
                  />
                </TabsContent>

                <TabsContent value="notes" className="space-y-4 pt-6">
                  <div className="rounded-3xl border border-[#E7EEF6] bg-[#F8FBFF] p-5">
                    <p className="text-sm font-semibold text-[#042042]">Internal account notes</p>
                    <p className="mt-2 text-sm leading-7 text-[#6B7280]">
                      Keep onboarding context, billing history, relationship signals, and delivery caveats attached to the client record.
                    </p>
                    <textarea
                      value={clientNotes}
                      onChange={(event) => setClientNotes(event.target.value)}
                      placeholder="Add private notes about this client..."
                      className="mt-4 min-h-[220px] w-full rounded-2xl border border-[#DDE8F2] bg-white px-4 py-3 text-sm"
                    />
                    <div className="mt-4 flex justify-end">
                      <Button onClick={handleSaveNotes} disabled={notesSaving}>
                        {notesSaving ? "Saving..." : "Save Notes"}
                      </Button>
                    </div>
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
                Account Snapshot
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Building2 className="mt-1 h-4 w-4 text-[#4B6B88]" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6B7280]">Company</p>
                    <p className="mt-1 text-sm text-[#042042]">{client.companyName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="mt-1 h-4 w-4 text-[#4B6B88]" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6B7280]">Email</p>
                    <p className="mt-1 text-sm text-[#042042]">{client.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="mt-1 h-4 w-4 text-[#4B6B88]" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6B7280]">Phone</p>
                    <p className="mt-1 text-sm text-[#042042]">{client.phone || "Not available"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 h-4 w-4 text-[#4B6B88]" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6B7280]">Location</p>
                    <p className="mt-1 text-sm text-[#042042]">{locationLine || "Not available"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CalendarDays className="mt-1 h-4 w-4 text-[#4B6B88]" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6B7280]">Created</p>
                    <p className="mt-1 text-sm text-[#042042]">{formatDate(client.createdAt)}</p>
                  </div>
                </div>
                {primarySourceLead ? (
                  <div className="flex items-start gap-3">
                    <FileText className="mt-1 h-4 w-4 text-[#4B6B88]" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6B7280]">Source Lead</p>
                      <p className="mt-1 text-sm text-[#042042]">{primarySourceLead.fullName}</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border-[#E7EEF6] shadow-sm">
            <CardContent className="space-y-4 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#4B6B88]">
                Billing Readiness
              </p>
              <div className="space-y-3 rounded-3xl border border-[#F1DFC9] bg-[#FFF8F1] p-4">
                <BillingReadinessRow label="GST" value={client.gstNumber || "Not available"} />
                <BillingReadinessRow label="PAN" value={client.panNumber || "Not available"} />
                <BillingReadinessRow label="Bank" value={client.bankName || "Not added"} />
                <BillingReadinessRow
                  label="Reference"
                  value={
                    [client.bankAccountNumber, client.ifscCode].filter(Boolean).join(" · ") || "Not added"
                  }
                />
                <BillingReadinessRow
                  label="Address"
                  value={[client.address, client.postalCode].filter(Boolean).join(" · ") || "Not available"}
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
                <Button onClick={() => router.push(`/admin/projects/new?clientId=${clientId}`)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Project
                </Button>
                <Button variant="outline" onClick={() => router.push(`/admin/invoices/new?clientId=${clientId}`)}>
                  <Receipt className="mr-2 h-4 w-4" />
                  Create Invoice
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("communications")}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Open Communication Log
                </Button>
                {primarySourceLead ? (
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/admin/leads/${primarySourceLead.id}`)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    View Source Lead
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
