"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { LeadForm } from "@/components/admin/lead-form";
import { Skeleton } from "@/components/ui/skeleton";
import type { Lead, User } from "@prisma/client";

interface LeadWithRelations extends Lead {
  assignedTo: User | null;
}

export default function EditLeadPage() {
  const router = useRouter();
  const params = useParams();
  const leadId = params.id as string;

  const [lead, setLead] = useState<LeadWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return (
      <div className="space-y-6 p-6 md:p-8">
        <Skeleton className="h-10 w-64" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))}
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
      <div>
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <PageHeader
          title="Edit Lead"
          description={`Update information for ${lead.fullName}`}
        />
      </div>

      <LeadForm
        leadId={leadId}
        initialData={{
          ...lead,
          companyName: lead.companyName ?? undefined,
          phone: lead.phone ?? undefined,
          location: lead.location ?? undefined,
          country: lead.country ?? undefined,
          offeringType: lead.offeringType ?? undefined,
          selectedService: lead.selectedService ?? undefined,
          selectedSolution: lead.selectedSolution ?? undefined,
          budgetRange: lead.budgetRange ?? undefined,
          projectType: lead.projectType ?? undefined,
          businessStage: lead.businessStage ?? undefined,
          timeline: lead.timeline ?? undefined,
          requirementsSummary: lead.requirementsSummary ?? undefined,
        }}
        onSuccess={() => {
          router.push(`/admin/leads/${leadId}`);
        }}
      />
    </div>
  );
}
