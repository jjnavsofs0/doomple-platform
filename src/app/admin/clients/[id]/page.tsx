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
import { AttachmentManager } from "@/components/admin/attachment-manager"

interface ClientDetail {
  id: string
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
  bankName?: string
  bankAccountNumber?: string
  ifscCode?: string
  status: "active" | "inactive"
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

export default function ClientDetailPage() {
  const router = useRouter()
  const params = useParams()
  const clientId = params.id as string

  const [client, setClient] = React.useState<ClientDetail | null>(null)
  const [projects, setProjects] = React.useState<Project[]>([])
  const [invoices, setInvoices] = React.useState<Invoice[]>([])
  const [communications, setCommunications] = React.useState<CommunicationLog[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [activeTab, setActiveTab] = React.useState("projects")

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [clientRes, projectsRes, invoicesRes, commRes] = await Promise.all([
          fetch(`/api/clients/${clientId}`),
          fetch(`/api/clients/${clientId}/projects`),
          fetch(`/api/clients/${clientId}/invoices`),
          fetch(`/api/clients/${clientId}/communications`),
        ])

        if (!clientRes.ok) throw new Error("Failed to fetch client")

        const clientData = await clientRes.json()
        setClient(clientData.data || clientData)

        if (projectsRes.ok) {
          const projectsData = await projectsRes.json()
          setProjects(Array.isArray(projectsData) ? projectsData : projectsData.data || [])
        }

        if (invoicesRes.ok) {
          const invoicesData = await invoicesRes.json()
          setInvoices(Array.isArray(invoicesData) ? invoicesData : invoicesData.data || [])
        }

        if (commRes.ok) {
          const commData = await commRes.json()
          setCommunications(Array.isArray(commData) ? commData : commData.data || [])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [clientId])

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

  if (error || !client) {
    return (
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Card className="p-4 border-destructive/50 bg-destructive/5">
          <p className="text-destructive">{error || "Client not found"}</p>
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
            <h1 className="text-3xl font-bold">{client.companyName}</h1>
            <p className="text-muted-foreground">Client Details</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => router.push(`/admin/clients/${clientId}/edit`)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <p className="text-muted-foreground">Contact Person</p>
              <p className="font-medium">{client.contactPersonName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{client.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Phone</p>
              <p className="font-medium">{client.phone}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Billing Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <p className="text-muted-foreground">Address</p>
              <p className="font-medium">{client.address || "N/A"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">City / State</p>
              <p className="font-medium">
                {client.city && client.state
                  ? `${client.city}, ${client.state}`
                  : client.city || client.state || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Postal Code</p>
              <p className="font-medium">{client.postalCode || "N/A"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tax Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <p className="text-muted-foreground">GST Number</p>
              <p className="font-medium">{client.gstNumber || "N/A"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">PAN Number</p>
              <p className="font-medium">{client.panNumber || "N/A"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <StatusBadge status={client.status} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bank Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Bank Name</p>
            <p className="font-medium">{client.bankName || "N/A"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Account Number</p>
            <p className="font-medium">{client.bankAccountNumber || "N/A"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">IFSC Code</p>
            <p className="font-medium">{client.ifscCode || "N/A"}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="projects">
                Projects ({projects.length})
              </TabsTrigger>
              <TabsTrigger value="invoices">
                Invoices ({invoices.length})
              </TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="communications">
                Communications ({communications.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="space-y-4">
              <div className="flex justify-between items-center pt-4">
                <h3 className="font-semibold">Client Projects</h3>
                <Button size="sm" onClick={() => router.push(`/admin/projects/new?clientId=${clientId}`)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </div>
              {projects.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No projects yet
                </p>
              ) : (
                <div className="space-y-2">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => router.push(`/admin/projects/${project.id}`)}
                    >
                      <div className="flex-1">
                        <p className="font-medium">{project.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{project.category}</Badge>
                          <StatusBadge status={project.status} />
                          <span className="text-sm text-muted-foreground">
                            {project.progress}% complete
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="invoices" className="space-y-4">
              <div className="flex justify-between items-center pt-4">
                <h3 className="font-semibold">Client Invoices</h3>
                <Button size="sm" onClick={() => router.push(`/admin/invoices/new?clientId=${clientId}`)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Invoice
                </Button>
              </div>
              {invoices.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No invoices yet
                </p>
              ) : (
                <div className="space-y-2">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => router.push(`/admin/invoices/${invoice.id}`)}
                    >
                      <div className="flex-1">
                        <p className="font-medium">{invoice.invoiceNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          Due: {new Date(invoice.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">
                          {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(invoice.amount)}
                        </p>
                        <StatusBadge status={invoice.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <div className="pt-4">
                <AttachmentManager
                  entityType="client"
                  entityId={clientId}
                  emptyMessage="No client documents uploaded yet."
                />
              </div>
            </TabsContent>

            <TabsContent value="communications" className="space-y-4">
              <div className="flex justify-between items-center pt-4">
                <h3 className="font-semibold">Communication Log</h3>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Log Entry
                </Button>
              </div>
              {communications.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No communication logs yet
                </p>
              ) : (
                <div className="space-y-2">
                  {communications.map((comm) => (
                    <div
                      key={comm.id}
                      className="p-3 border rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium">{comm.subject}</p>
                        <Badge variant="outline" className="capitalize">
                          {comm.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(comm.date).toLocaleString()}
                      </p>
                      {comm.notes && (
                        <p className="text-sm mt-2">{comm.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={() => router.push(`/admin/projects/new?clientId=${clientId}`)}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
        <Button variant="outline" onClick={() => router.push(`/admin/invoices/new?clientId=${clientId}`)}>
          <Plus className="h-4 w-4 mr-2" />
          New Invoice
        </Button>
        <Button variant="outline" onClick={() => router.push(`/admin/quotations/new?clientId=${clientId}`)}>
          <Plus className="h-4 w-4 mr-2" />
          New Quotation
        </Button>
      </div>
    </div>
  )
}
