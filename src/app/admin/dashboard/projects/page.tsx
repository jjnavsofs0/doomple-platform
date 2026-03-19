"use client";

import { useState, useEffect } from "react";
import { Briefcase, CheckCircle, Pause, BarChart3, AlertCircle, Clock } from "lucide-react";
import { StatsCard } from "@/components/ui/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";

interface ProjectsStats {
  activeProjects: number;
  completedThisMonth: number;
  onHold: number;
  avgProgress: number;
  upcomingDeadlines: number;
  overdueMillestones: number;
  projectsByCategory: Record<string, number>;
  uepProjects: Array<{
    id: string;
    name: string;
    progress: number;
  }>;
  toolkitProjects: Array<{
    id: string;
    name: string;
    progress: number;
  }>;
  statusDistribution: Record<string, number>;
  upcomingMilestones: Array<{
    id: string;
    projectName: string;
    milestoneName: string;
    dueDate: string;
    paymentAmount: number;
  }>;
  projectsAtRisk: Array<{
    id: string;
    projectName: string;
    clientName: string;
    progress: number;
    daysUntilDeadline: number;
  }>;
}

const formatINR = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const mockData: ProjectsStats = {
  activeProjects: 12,
  completedThisMonth: 3,
  onHold: 2,
  avgProgress: 58,
  upcomingDeadlines: 4,
  overdueMillestones: 1,
  projectsByCategory: {
    "Custom Software": 5,
    UEP: 3,
    "Mobile App": 2,
    "SaaS Toolkit": 2,
  },
  uepProjects: [
    { id: "1", name: "ERP Migration - Acme Corp", progress: 72 },
    { id: "2", name: "Financial System Upgrade", progress: 45 },
    { id: "3", name: "Supply Chain Optimization", progress: 68 },
  ],
  toolkitProjects: [
    { id: "1", name: "SaaS Template Customization", progress: 85 },
    { id: "2", name: "Workflow Automation Setup", progress: 60 },
  ],
  statusDistribution: {
    Draft: 2,
    Active: 8,
    Discovery: 1,
    Design: 2,
    Development: 4,
    Review: 2,
    Hold: 2,
    Completed: 3,
  },
  upcomingMilestones: [
    {
      id: "1",
      projectName: "E-commerce Platform Redesign",
      milestoneName: "Frontend Development Complete",
      dueDate: "2026-03-25",
      paymentAmount: 350000,
    },
    {
      id: "2",
      projectName: "Mobile Banking App",
      milestoneName: "API Integration Phase",
      dueDate: "2026-03-28",
      paymentAmount: 425000,
    },
    {
      id: "3",
      projectName: "AI-Powered Analytics Dashboard",
      milestoneName: "ML Model Training",
      dueDate: "2026-04-05",
      paymentAmount: 280000,
    },
    {
      id: "4",
      projectName: "Cloud Migration Services",
      milestoneName: "Data Migration Phase 2",
      dueDate: "2026-04-10",
      paymentAmount: 195000,
    },
    {
      id: "5",
      projectName: "Custom CRM Development",
      milestoneName: "Requirements Review",
      dueDate: "2026-04-15",
      paymentAmount: 125000,
    },
  ],
  projectsAtRisk: [
    {
      id: "1",
      projectName: "Cloud Migration Services",
      clientName: "TechCorp Industries",
      progress: 48,
      daysUntilDeadline: 3,
    },
    {
      id: "2",
      projectName: "Custom CRM Development",
      clientName: "SalesFirst Systems",
      progress: 20,
      daysUntilDeadline: 8,
    },
  ],
};

export default function ProjectsDashboard() {
  const [stats, setStats] = useState<ProjectsStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/dashboard?type=projects");
        if (!response.ok) throw new Error("Failed to fetch stats");
        const data = await response.json();
        setStats(data.data || mockData);
      } catch (err) {
        setStats(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 p-6 md:p-8">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 md:p-8">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-destructive font-medium">Failed to load projects dashboard</p>
        </div>
      </div>
    );
  }

  const maxStatusValue = Math.max(...Object.values(stats.statusDistribution));

  return (
    <div className="space-y-6 p-6 md:p-8">
      <PageHeader
        title="Projects Dashboard"
        description="Project status, milestones, and progress tracking"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
        <StatsCard
          label="Active Projects"
          value={stats.activeProjects}
          icon={<Briefcase className="h-5 w-5" />}
          variant="default"
        />
        <StatsCard
          label="Completed This Month"
          value={stats.completedThisMonth}
          icon={<CheckCircle className="h-5 w-5" />}
          variant="success"
        />
        <StatsCard
          label="On Hold"
          value={stats.onHold}
          icon={<Pause className="h-5 w-5" />}
          variant="warning"
        />
        <StatsCard
          label="Avg Progress"
          value={`${stats.avgProgress}%`}
          icon={<BarChart3 className="h-5 w-5" />}
          variant="default"
        />
        <StatsCard
          label="Upcoming Deadlines"
          value={stats.upcomingDeadlines}
          icon={<Clock className="h-5 w-5" />}
          variant="warning"
        />
        <StatsCard
          label="Overdue Milestones"
          value={stats.overdueMillestones}
          icon={<AlertCircle className="h-5 w-5" />}
          variant={stats.overdueMillestones > 0 ? "danger" : "default"}
        />
      </div>

      {/* Projects by Category and Status */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Projects by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Projects by Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(stats.projectsByCategory).map(([category, count]) => {
              const max = Math.max(...Object.values(stats.projectsByCategory));
              const percentage = (count / max) * 100;
              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{category}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(stats.statusDistribution).map(([status, count]) => {
              const percentage = (count / maxStatusValue) * 100;
              const statusColorMap: Record<string, string> = {
                Draft: "bg-gray-500",
                Active: "bg-blue-500",
                Discovery: "bg-cyan-500",
                Design: "bg-purple-500",
                Development: "bg-green-500",
                Review: "bg-yellow-500",
                Hold: "bg-orange-500",
                Completed: "bg-emerald-500",
              };
              return (
                <div key={status} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{status}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${statusColorMap[status] || "bg-gray-500"}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* UEP and Toolkit Projects */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* UEP Projects */}
        <Card>
          <CardHeader>
            <CardTitle>UEP Projects ({stats.uepProjects.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.uepProjects.map((project) => (
              <div key={project.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate">{project.name}</p>
                  <span className="text-sm font-semibold whitespace-nowrap ml-2">{project.progress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Toolkit Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Toolkit Projects ({stats.toolkitProjects.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.toolkitProjects.map((project) => (
              <div key={project.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate">{project.name}</p>
                  <span className="text-sm font-semibold whitespace-nowrap ml-2">{project.progress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Milestones */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Milestones (Next 5)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {stats.upcomingMilestones.map((milestone) => (
            <div
              key={milestone.id}
              className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{milestone.projectName}</p>
                <p className="text-xs text-muted-foreground truncate">{milestone.milestoneName}</p>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <span className="text-sm font-semibold whitespace-nowrap text-green-600">
                  {formatINR(milestone.paymentAmount)}
                </span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{milestone.dueDate}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Projects at Risk */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Projects at Risk
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {stats.projectsAtRisk.length > 0 ? (
            stats.projectsAtRisk.map((project) => (
              <div key={project.id} className="border rounded-lg p-4 space-y-3 border-orange-200 bg-orange-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{project.projectName}</p>
                    <p className="text-xs text-muted-foreground">{project.clientName}</p>
                  </div>
                  <Badge variant="destructive" className="whitespace-nowrap ml-2">
                    {project.daysUntilDeadline}d left
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">Progress: {project.progress}%</span>
                  </div>
                  <div className="h-2 bg-white rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center py-4 text-muted-foreground text-sm">No projects at risk</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
