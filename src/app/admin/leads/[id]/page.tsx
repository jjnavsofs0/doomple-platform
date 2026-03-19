"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Edit2, Mail, Phone, MapPin, Building2, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/ui/status-badge";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { LeadPipeline } from "@/components/admin/lead-pipeline";
import { ActivityTimeline } from "@/components/admin/activity-timeline";
import { format } from "date-fns";
import type { Lead, LeadNote, LeadActivity, User } from "@prisma/client";

interface LeadWithRelations extends Lead {
  assignedTo: User | null;
  notes: LeadNote[];
  activities: (LeadActivity & { user: User | null })[];
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
];

export default function LeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const leadId = params.id as string;

  const [lead, setLead] = useState<LeadWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const response = await fetch(`/api/leads/${leadId}`);
        if (!response.ok) throw new Error("Failed to fetch lead");
        const data = await response.json();
        setLead(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load lead");
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
  }, [leadId]);

  const handleStatusChange = async (newStatus: string) => {
    if (!lead) return;

    try {
      setIsUpdating(true);
      const response = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update status");
      const data = await response.json();
      setLead(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteContent.trim() || !lead) return;

    try {
      setIsAddingNote(true);
      const response = await fetch(`/api/leads/${leadId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: noteContent }),
      });

      if (!response.ok) throw new Error("Failed to add note");
      setNoteContent("");

      // Refresh lead data
      const leadResponse = await fetch(`/api/leads/${leadId}`);
      if (leadResponse.ok) {
        const data = await leadResponse.json();
        setLead(data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add note");
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleConvertToClient = async () => {
    if (!lead) return;

    try {
      setIsUpdating(true);
      const response = await fetch(`/api/leads/${leadId}/convert`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to convert lead to client");
      router.push("/admin/clients");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to convert lead");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6 md:p-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="p-6 md:p-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-destructive font-medium">{error || "Lead not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <Button variant="ghost" onClick={() => router.back()} className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{lead.fullName}</h1>
            <p className="text-muted-foreground">{lead.companyName || "Individual Lead"}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/admin/leads/${leadId}/edit`)}>
            <Edit2 className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-destructive font-medium">{error}</p>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pipeline */}
          <Card>
            <CardHeader>
              <CardTitle>Lead Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <LeadPipeline currentStatus={lead.status} />
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <a href={`mailto:${lead.email}`} className="text-sm font-medium hover:underline">
                        {lead.email}
                      </a>
                    </div>
                  </div>
                  {lead.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <a href={`tel:${lead.phone}`} className="text-sm font-medium hover:underline">
                          {lead.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  {lead.location && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="text-sm font-medium">
                          {lead.location}
                          {lead.country && `, ${lead.country}`}
                        </p>
                      </div>
                    </div>
                  )}
                  {lead.companyName && (
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Company</p>
                        <p className="text-sm font-medium">{lead.companyName}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Lead Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Lead Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="text-sm font-medium mt-1">{lead.category.replace(/_/g, " ")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Source</p>
                    <p className="text-sm font-medium mt-1">{lead.source.replace(/_/g, " ")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Priority</p>
                    <div className="mt-1">
                      <StatusBadge
                        status={lead.priority}
                        customColorMap={{
                          LOW: "outline",
                          MEDIUM: "default",
                          HIGH: "warning",
                          URGENT: "destructive",
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div className="mt-1">
                      <StatusBadge status={lead.status} />
                    </div>
                  </div>
                  {lead.budgetRange && (
                    <div>
                      <p className="text-sm text-muted-foreground">Budget Range</p>
                      <p className="text-sm font-medium mt-1">{lead.budgetRange}</p>
                    </div>
                  )}
                  {lead.timeline && (
                    <div>
                      <p className="text-sm text-muted-foreground">Timeline</p>
                      <p className="text-sm font-medium mt-1">{lead.timeline}</p>
                    </div>
                  )}
                  {lead.businessStage && (
                    <div>
                      <p className="text-sm text-muted-foreground">Business Stage</p>
                      <p className="text-sm font-medium mt-1">{lead.businessStage}</p>
                    </div>
                  )}
                  {lead.projectType && (
                    <div>
                      <p className="text-sm text-muted-foreground">Project Type</p>
                      <p className="text-sm font-medium mt-1">{lead.projectType}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Requirements */}
              {lead.requirementsSummary && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Requirements Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{lead.requirementsSummary}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Add Note</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    placeholder="Add a note about this lead..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    rows={4}
                  />
                  <Button
                    onClick={handleAddNote}
                    disabled={isAddingNote || !noteContent.trim()}
                  >
                    {isAddingNote ? "Adding..." : "Add Note"}
                  </Button>
                </CardContent>
              </Card>

              {/* Notes List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notes ({lead.notes.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {lead.notes.length > 0 ? (
                    <div className="space-y-4">
                      {lead.notes.map((note) => (
                        <div key={note.id} className="pb-4 border-b last:border-b-0">
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(note.createdAt), "MMM d, yyyy h:mm a")}
                          </p>
                          <p className="text-sm mt-2 whitespace-pre-wrap">{note.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No notes yet</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <ActivityTimeline
                    activities={lead.activities.sort((a, b) =>
                      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status and Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status & Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Change Status</label>
                <Select
                  value={lead.status}
                  onValueChange={handleStatusChange}
                  disabled={isUpdating}
                  className="mt-2"
                >
                  {LEAD_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status.replace(/_/g, " ")}
                    </option>
                  ))}
                </Select>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleConvertToClient}
                disabled={isUpdating}
              >
                <Plus className="mr-2 h-4 w-4" />
                Convert to Client
              </Button>
            </CardContent>
          </Card>

          {/* Key Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Key Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Assigned To</p>
                <p className="text-sm font-medium mt-1">{lead.assignedTo?.name || "Unassigned"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-sm font-medium mt-1">
                  {format(new Date(lead.createdAt), "MMM d, yyyy")}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Last Updated</p>
                <p className="text-sm font-medium mt-1">
                  {format(new Date(lead.updatedAt), "MMM d, yyyy")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
