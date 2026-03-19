"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import type { LeadFormData } from "@/types";

const leadFormSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  companyName: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  location: z.string().optional(),
  country: z.string().optional(),
  source: z.string().min(1, "Source is required"),
  category: z.string().min(1, "Category is required"),
  offeringType: z.string().optional(),
  selectedService: z.string().optional(),
  selectedSolution: z.string().optional(),
  budgetRange: z.string().optional(),
  projectType: z.string().optional(),
  businessStage: z.string().optional(),
  timeline: z.string().optional(),
  requirementsSummary: z.string().optional(),
  priority: z.string(),
  assignedToId: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

interface LeadFormProps {
  leadId?: string;
  initialData?: Partial<LeadFormValues>;
  onSuccess?: () => void;
}

const SOURCES = [
  { value: "WEBSITE", label: "Website" },
  { value: "REFERRAL", label: "Referral" },
  { value: "SOCIAL_MEDIA", label: "Social Media" },
  { value: "CAMPAIGN", label: "Campaign" },
  { value: "DIRECT", label: "Direct" },
  { value: "PARTNER", label: "Partner" },
  { value: "OTHER", label: "Other" },
];

const CATEGORIES = [
  { value: "SERVICE_INQUIRY", label: "Service Inquiry" },
  { value: "SOLUTION_INQUIRY", label: "Solution Inquiry" },
  { value: "UEP_INQUIRY", label: "UEP Inquiry" },
  { value: "SAAS_TOOLKIT_INQUIRY", label: "SaaS Toolkit Inquiry" },
  { value: "WORKFORCE_INQUIRY", label: "Workforce Inquiry" },
  { value: "SUPPORT_INQUIRY", label: "Support Inquiry" },
  { value: "PARTNERSHIP_INQUIRY", label: "Partnership Inquiry" },
];

const PRIORITIES = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];

const TIMELINES = [
  { value: "IMMEDIATE", label: "Immediate (0-1 month)" },
  { value: "SHORT_TERM", label: "Short Term (1-3 months)" },
  { value: "MEDIUM_TERM", label: "Medium Term (3-6 months)" },
  { value: "LONG_TERM", label: "Long Term (6+ months)" },
];

const BUDGET_RANGES = [
  { value: "UNDER_50K", label: "Under ₹50K" },
  { value: "50K_100K", label: "₹50K - ₹100K" },
  { value: "100K_500K", label: "₹100K - ₹500K" },
  { value: "500K_1CR", label: "₹500K - ₹1 Cr" },
  { value: "ABOVE_1CR", label: "Above ₹1 Cr" },
];

export function LeadForm({ leadId, initialData, onSuccess }: LeadFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<Array<{ id: string; name: string; role: string; isActive: boolean }>>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      priority: "MEDIUM",
      assignedToId: "",
      ...initialData,
    },
  });

  const selectedCategory = watch("category");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users?limit=100", { cache: "no-store" });
        if (!response.ok) return;
        const result = await response.json();
        const nextUsers = (result.data || []).filter(
          (user: { role: string; isActive: boolean }) =>
            user.isActive && user.role !== "CLIENT"
        );
        setUsers(nextUsers);
      } catch {
        setUsers([]);
      }
    };

    fetchUsers();
  }, []);

  const onSubmit = async (data: LeadFormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const method = leadId ? "PATCH" : "POST";
      const url = leadId ? `/api/leads/${leadId}` : "/api/leads";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save lead");
      }

      const result = await response.json();
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/admin/leads/${result.data.id}`);
      }
      toast({
        type: "success",
        title: leadId ? "Lead updated" : "Lead created",
        description: leadId
          ? "The lead details were updated."
          : "The lead was created successfully.",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save lead";
      setError(message);
      toast({
        type: "error",
        title: leadId ? "Could not update lead" : "Could not create lead",
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-destructive font-medium">{error}</p>
        </div>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Full Name *"
              placeholder="Enter full name"
              {...register("fullName")}
              error={!!errors.fullName}
              helperText={errors.fullName?.message}
            />
            <Input
              label="Email Address *"
              type="email"
              placeholder="Enter email address"
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Company Name"
              placeholder="Enter company name"
              {...register("companyName")}
            />
            <Input
              label="Phone Number"
              placeholder="Enter phone number"
              {...register("phone")}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Location"
              placeholder="Enter city/location"
              {...register("location")}
            />
            <Input
              label="Country"
              placeholder="Enter country"
              {...register("country")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Classification */}
      <Card>
        <CardHeader>
          <CardTitle>Classification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Select
              label="Source *"
              {...register("source")}
              defaultValue=""
              error={!!errors.source}
            >
              <option value="">Select a source</option>
              {SOURCES.map((source) => (
                <option key={source.value} value={source.value}>
                  {source.label}
                </option>
              ))}
            </Select>

            <Select
              label="Category *"
              {...register("category")}
              defaultValue=""
              error={!!errors.category}
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Select
              label="Priority"
              {...register("priority")}
              defaultValue="MEDIUM"
            >
              {PRIORITIES.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </Select>

            <Select
              label="Assign To"
              {...register("assignedToId")}
              defaultValue=""
            >
              <option value="">Unassigned</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role.replace(/_/g, " ")})
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Business Details */}
      <Card>
        <CardHeader>
          <CardTitle>Business Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Offering Type"
              placeholder="e.g., Custom Development, Consulting"
              {...register("offeringType")}
            />
            <Input
              label="Selected Service"
              placeholder="e.g., Web Development, Mobile App"
              {...register("selectedService")}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Selected Solution"
              placeholder="e.g., UEP, SaaS Toolkit"
              {...register("selectedSolution")}
            />
            <Input
              label="Project Type"
              placeholder="e.g., B2B, B2C, Enterprise"
              {...register("projectType")}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Select
              label="Budget Range"
              {...register("budgetRange")}
              defaultValue=""
            >
              <option value="">Select budget range</option>
              {BUDGET_RANGES.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </Select>

            <Select
              label="Timeline"
              {...register("timeline")}
              defaultValue=""
            >
              <option value="">Select timeline</option>
              {TIMELINES.map((timeline) => (
                <option key={timeline.value} value={timeline.value}>
                  {timeline.label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Input
              label="Business Stage"
              placeholder="e.g., Startup, Scale-up, Enterprise"
              {...register("businessStage")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Requirements & Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            label="Requirements Summary"
            placeholder="Brief summary of the lead's requirements and needs"
            {...register("requirementsSummary")}
            rows={5}
          />
        </CardContent>
      </Card>

      {/* Submit Buttons */}
      <div className="flex gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : leadId ? "Update Lead" : "Create Lead"}
        </Button>
      </div>
    </form>
  );
}
