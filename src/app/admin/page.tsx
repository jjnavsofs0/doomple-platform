"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Users, Briefcase, FileText, TrendingUp, AlertCircle, ArrowUp } from "lucide-react";
import { StatsCard } from "@/components/ui/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface DashboardStats {
  activeLeads: number;
  activeProjects: number;
  openInvoices: number;
  revenueThisMonth: number;
  outstandingAmount: number;
  conversionRate: number;
  recentLeads: Array<{
    id: string;
    fullName: string;
    companyName: string | null;
    email: string;
    status: string;
    createdAt: string;
  }>;
  recentProjects: Array<{
    id: string;
    projectName: string;
    clientName: string;
    status: string;
    progress: number;
  }>;
  pipelineSummary: Record<string, number>;
  revenueByCategory: Record<string, number>;
}

const formatINR = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/dashboard");
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

  const mockData: DashboardStats = {
    activeLeads: 48,
    activeProjects: 12,
    openInvoices: 8,
    revenueThisMonth: 2850000,
    outstandingAmount: 1250000,
    conversionRate: 22.5,
    recentLeads: [
      {
        id: "1",
        fullName: "Rajesh Kumar",
        companyName: "TechVenture Solutions",
        email: "rajesh@techventure.com",
        status: "qualified",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "2",
        fullName: "Priya Sharma",
        companyName: "Digital Innovations Ltd",
        email: "priya@digitalinnovations.com",
        status: "contacted",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "3",
        fullName: "Arun Mehta",
        companyName: "StartupHub India",
        email: "arun@startuphub.in",
        status: "new",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "4",
        fullName: "Neha Verma",
        companyName: "CloudFirst Systems",
        email: "neha@cloudfirst.io",
        status: "qualified",
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "5",
        fullName: "Vikram Singh",
        companyName: "Enterprise Solutions Corp",
        email: "vikram@esolutions.com",
        status: "proposal",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    recentProjects: [
      {
        id: "1",
        projectName: "E-commerce Platform Redesign",
        clientName: "RetailHub India",
        status: "active",
        progress: 65,
      },
      {
        id: "2",
        projectName: "Mobile Banking App",
        clientName: "FinServe Solutions",
        status: "design",
        progress: 45,
      },
      {
        id: "3",
        projectName: "AI-Powered Analytics Dashboard",
        clientName: "DataInsights Co",
        status: "active",
        progress: 80,
      },
      {
        id: "4",
        projectName: "Cloud Migration Services",
        clientName: "TechCorp Industries",
        status: "active",
        progress: 55,
      },
      {
        id: "5",
        projectName: "Custom CRM Development",
        clientName: "SalesFirst Systems",
        status: "discovery",
        progress: 20,
      },
    ],
    pipelineSummary: {
      New: 12,
      Contacted: 15,
      Qualified: 14,
      Discovery: 4,
      Proposal: 2,
      Negotiation: 1,
    },
    revenueByCategory: {
      "Custom Software": 1200000,
      UEP: 850000,
      "SaaS Toolkit": 450000,
      "Mobile App": 220000,
      DevOps: 80000,
      Other: 50000,
    },
  };

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

  if (error || !stats) {
    return (
      <div className="p-6 md:p-8">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <p className="text-destructive font-medium">{error || "Failed to load dashboard"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      <PageHeader
        title="Dashboard"
        description="Overview of business operations"
      />

      {/* Top Row - Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
        <StatsCard
          label="Active Leads"
          value={stats.activeLeads}
          icon={<Users className="h-5 w-5" />}
          variant="default"
        />
        <StatsCard
          label="Active Projects"
          value={stats.activeProjects}
          icon={<Briefcase className="h-5 w-5" />}
          variant="success"
        />
        <StatsCard
          label="Open Invoices"
          value={stats.openInvoices}
          icon={<FileText className="h-5 w-5" />}
          variant="warning"
        />
        <StatsCard
          label="Revenue This Month"
          value={formatINR(stats.revenueThisMonth)}
          valueSize="sm"
          icon={<TrendingUp className="h-5 w-5" />}
          variant="success"
        />
        <StatsCard
          label="Outstanding Amount"
          value={formatINR(stats.outstandingAmount)}
          valueSize="sm"
          icon={<AlertCircle className="h-5 w-5" />}
          variant="warning"
        />
        <StatsCard
          label="Conversion Rate"
          value={`${stats.conversionRate}%`}
          icon={<ArrowUp className="h-5 w-5" />}
          variant="default"
        />
      </div>

      {/* Middle Row - Leads and Projects */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Leads */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle>Recent Leads</CardTitle>
            <Link href="/admin/leads">
              <span className="text-xs font-medium hover:underline" style={{ color: "#1ABFAD" }}>
                View All →
              </span>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.recentLeads.map((lead) => (
              <div
                key={lead.id}
                className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{lead.fullName}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {lead.companyName || "No company"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={lead.status} />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(lead.createdAt), "MMM d")}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle>Recent Projects</CardTitle>
            <Link href="/admin/projects">
              <span className="text-xs font-medium hover:underline" style={{ color: "#1ABFAD" }}>
                View All →
              </span>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.recentProjects.map((project) => (
              <div key={project.id} className="space-y-2 border-b pb-3 last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{project.projectName}</p>
                  <StatusBadge status={project.status} />
                </div>
                <p className="text-xs text-muted-foreground">{project.clientName}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ backgroundColor: "#1ABFAD" }}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium">{project.progress}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row - Pipeline and Revenue */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Pipeline Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Pipeline Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(stats.pipelineSummary).map(([stage, count]) => (
              <div key={stage} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{stage}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ backgroundColor: "#1ABFAD" }}
                    style={{ width: `${Math.min((count / 15) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Revenue by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(stats.revenueByCategory).map(([category, amount]) => {
              const total = Object.values(stats.revenueByCategory).reduce((a, b) => a + b, 0);
              const percentage = (amount / total) * 100;
              return (
                <div key={category} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{category}</span>
                    <span className="text-sm text-muted-foreground">{percentage.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ backgroundColor: "#3BB2F6" }}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { href: "/admin/leads/new",   label: "New Lead" },
              { href: "/admin/clients/new", label: "New Client" },
              { href: "/admin/projects/new",label: "New Project" },
              { href: "/admin/invoices/new",label: "New Invoice" },
            ].map(({ href, label }) => (
              <Link key={href} href={href} className="block">
                <button
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 border hover:shadow-sm"
                  style={{
                    border: "1px solid #E5E7EB",
                    color: "#042042",
                    backgroundColor: "#FFFFFF",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "#1ABFAD";
                    (e.currentTarget as HTMLButtonElement).style.color = "#1ABFAD";
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(26,191,173,0.04)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "#E5E7EB";
                    (e.currentTarget as HTMLButtonElement).style.color = "#042042";
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#FFFFFF";
                  }}
                >
                  <Plus className="h-4 w-4 flex-shrink-0" />
                  {label}
                </button>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
