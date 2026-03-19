"use client"

import * as React from "react"
import { Plus, Edit2, Trash2, ChevronUp, ChevronDown, CheckCircle2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/toast"
import { formatCurrency } from "@/lib/utils"

interface Milestone {
  id: string
  title: string
  description?: string
  dueDate: string
  paymentAmount: number
  status: "pending" | "in_progress" | "completed" | "skipped"
  order: number
}

interface MilestoneListProps {
  milestones: Milestone[]
  onAddMilestone?: (data: Partial<Milestone>) => Promise<void>
  onUpdateMilestone?: (id: string, data: Partial<Milestone>) => Promise<void>
  onDeleteMilestone?: (id: string) => Promise<void>
  onReorderMilestones?: (milestones: Milestone[]) => Promise<void>
  isLoading?: boolean
  currency?: string
}

const MilestoneList = React.forwardRef<HTMLDivElement, MilestoneListProps>(
  (
    {
      milestones,
      onAddMilestone,
      onUpdateMilestone,
      onDeleteMilestone,
      onReorderMilestones,
      isLoading = false,
      currency = "INR",
    },
    ref
  ) => {
    const { toast } = useToast()
    const [isFormOpen, setIsFormOpen] = React.useState(false)
    const [formData, setFormData] = React.useState<Partial<Milestone>>({
      title: "",
      description: "",
      dueDate: "",
      paymentAmount: 0,
      status: "pending",
    })
    const [editingId, setEditingId] = React.useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = React.useState(false)

    const handleAddClick = () => {
      setEditingId(null)
      setFormData({
        title: "",
        description: "",
        dueDate: "",
        paymentAmount: 0,
        status: "pending",
      })
      setIsFormOpen(true)
    }

    const handleEditClick = (milestone: Milestone) => {
      setEditingId(milestone.id)
      setFormData(milestone)
      setIsFormOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setIsSubmitting(true)

      try {
        if (editingId && onUpdateMilestone) {
          await onUpdateMilestone(editingId, formData)
          toast({
            type: "success",
            title: "Milestone updated",
            description: "The milestone changes were saved.",
          })
        } else if (onAddMilestone) {
          await onAddMilestone(formData)
          toast({
            type: "success",
            title: "Milestone added",
            description: "The milestone was added to the project plan.",
          })
        }
        setIsFormOpen(false)
        setFormData({
          title: "",
          description: "",
          dueDate: "",
          paymentAmount: 0,
          status: "pending",
        })
      } catch (err) {
        toast({
          type: "error",
          title: editingId ? "Could not update milestone" : "Could not add milestone",
          description:
            err instanceof Error ? err.message : "Please try again.",
        })
      } finally {
        setIsSubmitting(false)
      }
    }

    const handleDelete = async (id: string) => {
      if (confirm("Are you sure you want to delete this milestone?")) {
        try {
          await onDeleteMilestone?.(id)
          toast({
            type: "success",
            title: "Milestone deleted",
            description: "The milestone was removed from the project.",
          })
        } catch (err) {
          toast({
            type: "error",
            title: "Could not delete milestone",
            description:
              err instanceof Error ? err.message : "Please try again.",
          })
        }
      }
    }

    const handleReorder = async (id: string, direction: "up" | "down") => {
      const index = milestones.findIndex((m) => m.id === id)
      if (index === -1) return

      const newMilestones = [...milestones]
      if (direction === "up" && index > 0) {
        [newMilestones[index], newMilestones[index - 1]] = [
          newMilestones[index - 1],
          newMilestones[index],
        ]
      } else if (direction === "down" && index < newMilestones.length - 1) {
        [newMilestones[index], newMilestones[index + 1]] = [
          newMilestones[index + 1],
          newMilestones[index],
        ]
      }

      try {
        await onReorderMilestones?.(newMilestones)
        toast({
          type: "success",
          title: "Milestone order updated",
          description: "The milestone sequence was saved.",
        })
      } catch (err) {
        toast({
          type: "error",
          title: "Could not reorder milestones",
          description:
            err instanceof Error ? err.message : "Please try again.",
        })
      }
    }

    const handleToggleStatus = async (milestone: Milestone) => {
      try {
        await onUpdateMilestone?.(milestone.id, {
          status: milestone.status === "completed" ? "pending" : "completed",
        })
        toast({
          type: "success",
          title:
            milestone.status === "completed"
              ? "Milestone reopened"
              : "Milestone marked complete",
          description:
            milestone.status === "completed"
              ? "The milestone is back in the active plan."
              : "The milestone status has been updated.",
        })
      } catch (err) {
        toast({
          type: "error",
          title: "Could not update milestone status",
          description:
            err instanceof Error ? err.message : "Please try again.",
        })
      }
    }

    if (isLoading) {
      return (
        <div ref={ref} className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )
    }

    return (
      <div ref={ref} className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Milestones</h3>
          <Button onClick={handleAddClick} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Milestone
          </Button>
        </div>

        {isFormOpen && (
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Title"
                  placeholder="Milestone title"
                  value={formData.title || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />

                <Input
                  label="Description"
                  placeholder="Milestone description (optional)"
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />

                <Input
                  label="Due Date"
                  type="date"
                  value={formData.dueDate || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  required
                />

                <Input
                  label="Payment Amount"
                  type="number"
                  placeholder="0"
                  value={formData.paymentAmount || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      paymentAmount: parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status || "pending"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as Milestone["status"],
                      })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="skipped">Skipped</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsFormOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-2">
          {milestones.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No milestones yet. Add one to get started.
            </p>
          ) : (
            milestones.map((milestone, index) => (
              <Card key={milestone.id}>
                <CardContent className="pt-6 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{milestone.title}</h4>
                        <StatusBadge status={milestone.status} />
                      </div>
                      {milestone.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {milestone.description}
                        </p>
                      )}
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Due Date:</span>{" "}
                          {new Date(milestone.dueDate).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Payment Amount:
                          </span>{" "}
                          {formatCurrency(milestone.paymentAmount, currency)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(milestone)}
                        title={
                          milestone.status === "completed"
                            ? "Mark as pending"
                            : "Mark as completed"
                        }
                      >
                        {milestone.status === "completed" ? (
                          <RotateCcw className="h-4 w-4 text-amber-600" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleReorder(milestone.id, "up")
                        }
                        disabled={index === 0}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleReorder(milestone.id, "down")
                        }
                        disabled={index === milestones.length - 1}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(milestone)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(milestone.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    )
  }
)
MilestoneList.displayName = "MilestoneList"

export { MilestoneList, type Milestone }
