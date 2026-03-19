"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/toast"
import { getCurrencyOptions } from "@/lib/billing"

type ProjectCategory =
  | "UEP_IMPLEMENTATION"
  | "SAAS_TOOLKIT_BUILD"
  | "CUSTOM_DEVELOPMENT"
  | "MOBILE_APP"
  | "DEVOPS_SUPPORT"
  | "INFRASTRUCTURE_SUPPORT"
  | "AI_CHATBOT"
  | "ERP_DEVELOPMENT"
  | "ECOMMERCE"
  | "MARKETING_RETAINER"
  | "WORKFORCE_CONSULTING"

type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT"
type BillingModel =
  | "FIXED_PRICE"
  | "MILESTONE_BASED"
  | "RECURRING_MONTHLY"
  | "CONSULTATION"

interface ProjectFormData {
  name: string
  clientId: string
  currency?: string
  category: ProjectCategory
  description: string
  scope: string
  startDate: string
  estimatedEndDate: string
  priority: Priority
  managerId: string
  budget: number
  billingModel: BillingModel
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

interface ProjectFormProps {
  initialData?: Partial<ProjectFormData>
  clients: Array<{ id: string; name: string }>
  managers: Array<{ id: string; name: string }>
  onSubmit: (data: ProjectFormData) => Promise<void>
  isLoading?: boolean
  submitLabel?: string
}

const uepModules = [
  "Student Management",
  "Faculty Management",
  "Attendance",
  "Grades & Marks",
  "Timetable",
  "Library Management",
  "Fee Management",
  "Hostel Management",
  "Transport Management",
  "Communication Portal",
  "Parent Portal",
  "Mobile App",
  "Reports & Analytics",
  "System Administration",
]

const saasBases = [
  "Authentication System",
  "User Management",
  "Database Layer",
  "API Framework",
  "Admin Dashboard",
  "Notification System",
]

const ProjectForm = React.forwardRef<HTMLFormElement, ProjectFormProps>(
  (
    {
      initialData,
      clients,
      managers,
      onSubmit,
      isLoading = false,
      submitLabel = "Create Project",
    },
    ref
  ) => {
    const { toast } = useToast()
    const [formData, setFormData] = React.useState<ProjectFormData>(
      initialData as ProjectFormData || {
        name: "",
        clientId: "",
        currency: "INR",
        category: "CUSTOM_DEVELOPMENT",
        description: "",
        scope: "",
        startDate: "",
        estimatedEndDate: "",
        priority: "MEDIUM",
        managerId: "",
        budget: 0,
        billingModel: "FIXED_PRICE",
      }
    )

    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
      const { name, value } = e.target
      setFormData((prev) => ({
        ...prev,
        [name]:
          name === "budget" || name === "paymentAmount"
            ? parseFloat(value) || 0
            : value,
      }))
      setError(null)
    }

    const handleArrayChange = (
      field: "selectedModules" | "baseModules",
      value: string
    ) => {
      setFormData((prev) => {
        const current = (prev[field] || []) as string[]
        const updated = current.includes(value)
          ? current.filter((m) => m !== value)
          : [...current, value]
        return {
          ...prev,
          [field]: updated,
        }
      })
    }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setIsSubmitting(true)
      setError(null)

      try {
        await onSubmit(formData)
        toast({
          type: "success",
          title: "Project saved",
          description: "The project details were saved successfully.",
        })
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An error occurred while saving"
        setError(message)
        toast({
          type: "error",
          title: "Could not save project",
          description: message,
        })
      } finally {
        setIsSubmitting(false)
      }
    }

    if (isLoading) {
      return (
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      )
    }

    return (
      <form ref={ref} onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Project Name"
              name="name"
              placeholder="Enter project name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <Select
              label="Client"
              name="clientId"
              options={clients.map((c) => ({
                value: c.id,
                label: c.name,
              }))}
              value={formData.clientId}
              onChange={handleChange}
              placeholder="Select a client"
              required
            />

            <Select
              label="Currency"
              name="currency"
              options={getCurrencyOptions()}
              value={formData.currency || "INR"}
              onChange={handleChange}
              required
            />

            <Select
              label="Category"
              name="category"
              options={[
                { value: "UEP_IMPLEMENTATION", label: "UEP Implementation" },
                { value: "SAAS_TOOLKIT_BUILD", label: "SaaS Toolkit Build" },
                { value: "CUSTOM_DEVELOPMENT", label: "Custom Development" },
                { value: "MOBILE_APP", label: "Mobile App Project" },
                { value: "DEVOPS_SUPPORT", label: "DevOps Support" },
                { value: "INFRASTRUCTURE_SUPPORT", label: "Infrastructure Support" },
                { value: "AI_CHATBOT", label: "AI / Chatbot Implementation" },
                { value: "ERP_DEVELOPMENT", label: "ERP Development" },
                { value: "ECOMMERCE", label: "Ecommerce Platform" },
                { value: "MARKETING_RETAINER", label: "Marketing Retainer" },
                { value: "WORKFORCE_CONSULTING", label: "Consulting" },
              ]}
              value={formData.category}
              onChange={handleChange}
              required
            />

            <Input
              label="Description"
              name="description"
              placeholder="Enter project description"
              value={formData.description}
              onChange={handleChange}
            />

            <Input
              label="Scope"
              name="scope"
              placeholder="Enter project scope"
              value={formData.scope}
              onChange={handleChange}
              required
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timeline & Budget</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Start Date"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              required
            />

            <Input
              label="Estimated End Date"
              name="estimatedEndDate"
              type="date"
              value={formData.estimatedEndDate}
              onChange={handleChange}
              required
            />

            <Input
              label="Budget"
              name="budget"
              type="number"
              placeholder="0"
              value={formData.budget}
              onChange={handleChange}
              required
            />

            <Select
              label="Billing Model"
              name="billingModel"
              options={[
                { value: "FIXED_PRICE", label: "Fixed Price" },
                { value: "MILESTONE_BASED", label: "Milestone-Based" },
                { value: "RECURRING_MONTHLY", label: "Recurring Monthly" },
                { value: "CONSULTATION", label: "Consultation" },
              ]}
              value={formData.billingModel}
              onChange={handleChange}
              required
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team & Priority</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              label="Project Manager"
              name="managerId"
              options={managers.map((m) => ({
                value: m.id,
                label: m.name,
              }))}
              value={formData.managerId}
              onChange={handleChange}
              placeholder="Select a manager"
              required
            />

            <Select
              label="Priority"
              name="priority"
              options={[
                { value: "LOW", label: "Low" },
                { value: "MEDIUM", label: "Medium" },
                { value: "HIGH", label: "High" },
                { value: "URGENT", label: "Urgent" },
              ]}
              value={formData.priority}
              onChange={handleChange}
              required
            />
          </CardContent>
        </Card>

        {formData.category === "UEP_IMPLEMENTATION" && (
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle>UEP Implementation Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Institution Type"
                name="institutionType"
                placeholder="e.g., College, University, School"
                value={formData.institutionType || ""}
                onChange={handleChange}
              />

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Selected Modules
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {uepModules.map((module) => (
                    <label
                      key={module}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={
                          (formData.selectedModules || []).includes(module)
                        }
                        onChange={() =>
                          handleArrayChange("selectedModules", module)
                        }
                        className="rounded border-input"
                      />
                      <span className="text-sm">{module}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Input
                label="Customization Scope"
                name="customizationScope"
                placeholder="Describe required customizations"
                value={formData.customizationScope || ""}
                onChange={handleChange}
              />

              <Input
                label="Deployment Model"
                name="deploymentModel"
                placeholder="e.g., Cloud, On-Premise, Hybrid"
                value={formData.deploymentModel || ""}
                onChange={handleChange}
              />

              <Input
                label="Onboarding Plan"
                name="onboardingPlan"
                placeholder="Describe onboarding approach"
                value={formData.onboardingPlan || ""}
                onChange={handleChange}
              />

              <Input
                label="Support Plan"
                name="supportPlan"
                placeholder="e.g., 24x7, Business Hours, Email"
                value={formData.supportPlan || ""}
                onChange={handleChange}
              />
            </CardContent>
          </Card>
        )}

        {formData.category === "SAAS_TOOLKIT_BUILD" && (
          <Card className="border-purple-200 bg-purple-50/50">
            <CardHeader>
              <CardTitle>SaaS Toolkit Build Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Base Modules
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {saasBases.map((module) => (
                    <label
                      key={module}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={(formData.baseModules || []).includes(module)}
                        onChange={() => handleArrayChange("baseModules", module)}
                        className="rounded border-input"
                      />
                      <span className="text-sm">{module}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Input
                label="Custom Modules (comma-separated)"
                name="customModules"
                placeholder="List any custom modules needed"
                value={formData.customModules || ""}
                onChange={handleChange}
              />

              <Input
                label="Architecture Plan"
                name="architecturePlan"
                placeholder="Describe the system architecture"
                value={formData.architecturePlan || ""}
                onChange={handleChange}
              />
            </CardContent>
          </Card>
        )}

        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={isSubmitting || isLoading}>
            {isSubmitting || isLoading ? "Saving..." : submitLabel}
          </Button>
        </div>
      </form>
    )
  }
)
ProjectForm.displayName = "ProjectForm"

export { ProjectForm, type ProjectFormData }
