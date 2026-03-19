"use client";

import { useState, useEffect } from "react";
import { CreditCard, TrendingUp, AlertCircle, Percent, Calendar, DollarSign } from "lucide-react";
import { StatsCard } from "@/components/ui/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";

interface BillingStats {
  invoicesDue: number;
  overdueInvoices: number;
  totalPaidThisMonth: number;
  outstandingTotal: number;
  revenueThisQuarter: number;
  avgPaymentTime: number;
  revenueByMonth: Array<{
    month: string;
    amount: number;
  }>;
  revenueByCategory: Record<string, number>;
  recentPayments: Array<{
    id: string;
    date: string;
    clientName: string;
    invoiceNumber: string;
    amount: number;
    method: string;
  }>;
  overdueInvoicesList: Array<{
    id: string;
    invoiceNumber: string;
    clientName: string;
    amount: number;
    dueDate: string;
    daysOverdue: number;
  }>;
  collectionRate: number;
}

const formatINR = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const mockData: BillingStats = {
  invoicesDue: 8,
  overdueInvoices: 3,
  totalPaidThisMonth: 3150000,
  outstandingTotal: 1420000,
  revenueThisQuarter: 8475000,
  avgPaymentTime: 24,
  revenueByMonth: [
    { month: "September", amount: 2150000 },
    { month: "October", amount: 2850000 },
    { month: "November", amount: 2475000 },
    { month: "December", amount: 3100000 },
    { month: "January", amount: 2850000 },
    { month: "February", amount: 3150000 },
  ],
  revenueByCategory: {
    "Custom Software": 2850000,
    UEP: 1950000,
    "SaaS Toolkit": 1200000,
    "Mobile App": 950000,
    DevOps: 380000,
    Marketing: 95000,
    Infrastructure: 380000,
    Consulting: 700000,
  },
  recentPayments: [
    {
      id: "1",
      date: "2026-03-17",
      clientName: "RetailHub India",
      invoiceNumber: "INV-2026-045",
      amount: 425000,
      method: "Bank Transfer",
    },
    {
      id: "2",
      date: "2026-03-16",
      clientName: "FinServe Solutions",
      invoiceNumber: "INV-2026-044",
      amount: 850000,
      method: "Bank Transfer",
    },
    {
      id: "3",
      date: "2026-03-15",
      clientName: "DataInsights Co",
      invoiceNumber: "INV-2026-043",
      amount: 625000,
      method: "Cheque",
    },
    {
      id: "4",
      date: "2026-03-14",
      clientName: "TechCorp Industries",
      invoiceNumber: "INV-2026-042",
      amount: 550000,
      method: "Bank Transfer",
    },
    {
      id: "5",
      date: "2026-03-13",
      clientName: "SalesFirst Systems",
      invoiceNumber: "INV-2026-041",
      amount: 700000,
      method: "Bank Transfer",
    },
  ],
  overdueInvoicesList: [
    {
      id: "1",
      invoiceNumber: "INV-2026-035",
      clientName: "CloudNext Solutions",
      amount: 425000,
      dueDate: "2026-02-28",
      daysOverdue: 18,
    },
    {
      id: "2",
      invoiceNumber: "INV-2026-038",
      clientName: "GrowthPath Inc",
      amount: 550000,
      dueDate: "2026-03-07",
      daysOverdue: 11,
    },
    {
      id: "3",
      invoiceNumber: "INV-2026-040",
      clientName: "InnovateTech Ltd",
      amount: 445000,
      dueDate: "2026-03-10",
      daysOverdue: 8,
    },
  ],
  collectionRate: 87.5,
};

export default function BillingDashboard() {
  const [stats, setStats] = useState<BillingStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/dashboard?type=billing");
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
          <p className="text-destructive font-medium">Failed to load billing dashboard</p>
        </div>
      </div>
    );
  }

  const maxCategoryAmount = Math.max(...Object.values(stats.revenueByCategory));
  const maxMonthAmount = Math.max(...stats.revenueByMonth.map((m) => m.amount));

  return (
    <div className="space-y-6 p-6 md:p-8">
      <PageHeader
        title="Billing Dashboard"
        description="Revenue tracking, invoices, and payment collection metrics"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
        <StatsCard
          label="Invoices Due"
          value={stats.invoicesDue}
          icon={<Calendar className="h-5 w-5" />}
          variant="warning"
        />
        <StatsCard
          label="Overdue Invoices"
          value={stats.overdueInvoices}
          icon={<AlertCircle className="h-5 w-5" />}
          variant={stats.overdueInvoices > 0 ? "danger" : "default"}
        />
        <StatsCard
          label="Paid This Month"
          value={formatINR(stats.totalPaidThisMonth)}
          valueSize="sm"
          icon={<CreditCard className="h-5 w-5" />}
          variant="success"
        />
        <StatsCard
          label="Outstanding Total"
          value={formatINR(stats.outstandingTotal)}
          valueSize="sm"
          icon={<DollarSign className="h-5 w-5" />}
          variant="warning"
        />
        <StatsCard
          label="Revenue This Quarter"
          value={formatINR(stats.revenueThisQuarter)}
          valueSize="sm"
          icon={<TrendingUp className="h-5 w-5" />}
          variant="success"
        />
        <StatsCard
          label="Avg Payment Time"
          value={`${stats.avgPaymentTime}d`}
          icon={<Calendar className="h-5 w-5" />}
          variant="default"
        />
      </div>

      {/* Revenue Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue by Month */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Month (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.revenueByMonth.map((item) => {
              const percentage = (item.amount / maxMonthAmount) * 100;
              return (
                <div key={item.month} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.month}</span>
                    <span className="text-sm font-semibold">{formatINR(item.amount)}</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Revenue by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(stats.revenueByCategory).map(([category, amount]) => {
              const percentage = (amount / maxCategoryAmount) * 100;
              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{category}</span>
                    <span className="text-sm font-semibold">{formatINR(amount)}</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
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
      </div>

      {/* Recent Payments and Overdue Invoices */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.recentPayments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{payment.clientName}</p>
                  <p className="text-xs text-muted-foreground">
                    {payment.invoiceNumber} • {payment.method}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className="text-sm font-semibold whitespace-nowrap text-green-600">
                    {formatINR(payment.amount)}
                  </span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{payment.date}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Overdue Invoices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Overdue Invoices
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.overdueInvoicesList.length > 0 ? (
              stats.overdueInvoicesList.map((invoice) => (
                <div
                  key={invoice.id}
                  className="border rounded-lg p-3 space-y-2 border-destructive/20 bg-destructive/5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{invoice.clientName}</p>
                      <p className="text-xs text-muted-foreground">{invoice.invoiceNumber}</p>
                    </div>
                    <Badge variant="destructive" className="whitespace-nowrap ml-2">
                      {invoice.daysOverdue}d
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{formatINR(invoice.amount)}</span>
                    <span className="text-xs text-muted-foreground">{invoice.dueDate}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-4 text-muted-foreground text-sm">No overdue invoices</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Collection Rate */}
      <Card>
        <CardHeader>
          <CardTitle>Collection Rate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-semibold">{stats.collectionRate}%</span>
                <Badge variant="default">On Track</Badge>
              </div>
              <div className="h-4 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-600 rounded-full"
                  style={{ width: `${stats.collectionRate}%` }}
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{formatINR(stats.totalPaidThisMonth)}</p>
              <p className="text-xs text-muted-foreground">Collected</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{formatINR(stats.outstandingTotal)}</p>
              <p className="text-xs text-muted-foreground">Outstanding</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">
                {formatINR(stats.totalPaidThisMonth + stats.outstandingTotal)}
              </p>
              <p className="text-xs text-muted-foreground">Total Billed</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
