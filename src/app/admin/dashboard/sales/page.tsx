"use client";

import { useState, useEffect } from "react";
import { Users, TrendingUp, Zap, Target, Award, Clock } from "lucide-react";
import { StatsCard } from "@/components/ui/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";

interface SalesStats {
  totalLeads: number;
  newThisMonth: number;
  qualified: number;
  pipelineValue: number;
  wonLostRatio: string;
  avgConversionTime: number;
  leadsBySource: Record<string, number>;
  leadsByCategory: Record<string, number>;
  pipelineFunnel: Record<string, number>;
  followUpsDue: Array<{
    id: string;
    leadName: string;
    followUpDate: string;
    priority: string;
    assignedTo: string;
  }>;
  wonVsLost: {
    won: number;
    lost: number;
  };
  uepLeads: number;
  toolkitLeads: number;
}

const formatINR = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const mockData: SalesStats = {
  totalLeads: 48,
  newThisMonth: 12,
  qualified: 14,
  pipelineValue: 4850000,
  wonLostRatio: "3.5:1",
  avgConversionTime: 28,
  leadsBySource: {
    "Direct Contact": 16,
    Referral: 14,
    Website: 10,
    "Social Media": 8,
  },
  leadsByCategory: {
    "Service Inquiry": 12,
    "Solution Inquiry": 10,
    "UEP Inquiry": 8,
    "SaaS Toolkit": 10,
    "Workforce/Productivity": 5,
    Partnership: 3,
  },
  pipelineFunnel: {
    New: 12,
    Contacted: 15,
    Qualified: 14,
    Discovery: 4,
    Proposal: 2,
    Negotiation: 1,
  },
  followUpsDue: [
    {
      id: "1",
      leadName: "Rajesh Kumar (TechVenture)",
      followUpDate: "2026-03-20",
      priority: "high",
      assignedTo: "Amit Singh",
    },
    {
      id: "2",
      leadName: "Priya Sharma (Digital Innovations)",
      followUpDate: "2026-03-21",
      priority: "medium",
      assignedTo: "Neha Patel",
    },
    {
      id: "3",
      leadName: "Vikram Singh (Enterprise Solutions)",
      followUpDate: "2026-03-22",
      priority: "high",
      assignedTo: "Amit Singh",
    },
    {
      id: "4",
      leadName: "Sneha Gupta (CloudFirst Systems)",
      followUpDate: "2026-03-24",
      priority: "low",
      assignedTo: "Rohit Kumar",
    },
    {
      id: "5",
      leadName: "Arjun Mishra (StartupHub)",
      followUpDate: "2026-03-25",
      priority: "medium",
      assignedTo: "Neha Patel",
    },
  ],
  wonVsLost: {
    won: 14,
    lost: 4,
  },
  uepLeads: 18,
  toolkitLeads: 12,
};

export default function SalesDashboard() {
  const [stats, setStats] = useState<SalesStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/dashboard?type=sales");
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
          <p className="text-destructive font-medium">Failed to load sales dashboard</p>
        </div>
      </div>
    );
  }

  const maxFunnelValue = Math.max(...Object.values(stats.pipelineFunnel));

  return (
    <div className="space-y-6 p-6 md:p-8">
      <PageHeader
        title="Sales Dashboard"
        description="Lead pipeline and sales performance metrics"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
        <StatsCard
          label="Total Leads"
          value={stats.totalLeads}
          icon={<Users className="h-5 w-5" />}
          variant="default"
        />
        <StatsCard
          label="New This Month"
          value={stats.newThisMonth}
          icon={<TrendingUp className="h-5 w-5" />}
          variant="success"
        />
        <StatsCard
          label="Qualified"
          value={stats.qualified}
          icon={<Target className="h-5 w-5" />}
          variant="default"
        />
        <StatsCard
          label="Pipeline Value"
          value={formatINR(stats.pipelineValue)}
          valueSize="sm"
          icon={<TrendingUp className="h-5 w-5" />}
          variant="success"
        />
        <StatsCard
          label="Won/Lost Ratio"
          value={stats.wonLostRatio}
          icon={<Award className="h-5 w-5" />}
          variant="default"
        />
        <StatsCard
          label="Avg Conversion Time"
          value={`${stats.avgConversionTime}d`}
          icon={<Clock className="h-5 w-5" />}
          variant="default"
        />
      </div>

      {/* Leads by Source and Category */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Leads by Source */}
        <Card>
          <CardHeader>
            <CardTitle>Leads by Source</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(stats.leadsBySource).map(([source, count]) => {
              const max = Math.max(...Object.values(stats.leadsBySource));
              const percentage = (count / max) * 100;
              return (
                <div key={source} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{source}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Leads by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Leads by Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(stats.leadsByCategory).map(([category, count]) => {
              const max = Math.max(...Object.values(stats.leadsByCategory));
              const percentage = (count / max) * 100;
              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{category}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Pipeline Funnel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {Object.entries(stats.pipelineFunnel).map(([stage, count], index) => {
              const width = (count / maxFunnelValue) * 100;
              const colors = [
                "bg-blue-500",
                "bg-cyan-500",
                "bg-green-500",
                "bg-lime-500",
                "bg-yellow-500",
                "bg-orange-500",
              ];
              return (
                <div key={stage} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{stage}</span>
                    <span className="text-sm font-semibold">{count}</span>
                  </div>
                  <div className="h-8 bg-muted rounded-lg overflow-hidden">
                    <div
                      className={`h-full ${colors[index % colors.length]} rounded-lg flex items-center justify-end pr-3 transition-all`}
                      style={{ width: `${width}%` }}
                    >
                      {width > 15 && (
                        <span className="text-xs font-bold text-white">{Math.round(width)}%</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Follow-ups Due and Comparison */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Follow-ups Due */}
        <Card>
          <CardHeader>
            <CardTitle>Follow-ups Due</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.followUpsDue.map((followUp) => (
              <div
                key={followUp.id}
                className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{followUp.leadName}</p>
                  <p className="text-xs text-muted-foreground">{followUp.assignedTo}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      followUp.priority === "high"
                        ? "destructive"
                        : followUp.priority === "medium"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {followUp.priority}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Won vs Lost and Specialized Leads */}
        <div className="space-y-6">
          {/* Won vs Lost */}
          <Card>
            <CardHeader>
              <CardTitle>Won vs Lost (This Month)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Won</span>
                  <span className="text-xl font-bold text-green-600">{stats.wonVsLost.won}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{
                      width: `${(stats.wonVsLost.won / (stats.wonVsLost.won + stats.wonVsLost.lost)) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Lost</span>
                  <span className="text-xl font-bold text-red-600">{stats.wonVsLost.lost}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{
                      width: `${(stats.wonVsLost.lost / (stats.wonVsLost.won + stats.wonVsLost.lost)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Specialized Leads */}
          <Card>
            <CardHeader>
              <CardTitle>Specialized Leads</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">UEP Inquiries</span>
                  <Badge variant="default">{stats.uepLeads}</Badge>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${(stats.uepLeads / stats.totalLeads) * 100}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Toolkit Inquiries</span>
                  <Badge variant="secondary">{stats.toolkitLeads}</Badge>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(stats.toolkitLeads / stats.totalLeads) * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
