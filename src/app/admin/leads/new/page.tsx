"use client";

import { PageHeader } from "@/components/ui/page-header";
import { LeadForm } from "@/components/admin/lead-form";

export default function NewLeadPage() {
  return (
    <div className="space-y-6 p-6 md:p-8">
      <PageHeader
        title="Create New Lead"
        description="Add a new lead to the system"
      />

      <LeadForm />
    </div>
  );
}
