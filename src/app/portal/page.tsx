'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, AlertCircle, CheckCircle, DollarSign } from 'lucide-react';

interface DashboardData {
  welcomeMessage: string;
  clientName: string;
  stats: {
    activeProjects: number;
    pendingInvoices: number;
    totalPaid: number;
    outstandingAmount: number;
  };
  recentProjects: Array<{
    id: string;
    name: string;
    status: 'active' | 'completed' | 'on-hold';
    progress: number;
  }>;
  pendingInvoices: Array<{
    id: string;
    invoiceNumber: string;
    amount: number;
    dueDate: string;
    daysOverdue: number;
  }>;
}

const formatINR = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'on-hold':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch('/api/portal/dashboard');
        if (!response.ok) throw new Error('Failed to fetch dashboard');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {loading ? <Skeleton className="w-32 h-8 inline-block" /> : data?.clientName}!
        </h1>
        <p className="text-gray-600">
          {loading ? <Skeleton className="w-64 h-4" /> : data?.welcomeMessage}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Projects */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="w-full h-8" />
            ) : (
              <>
                <div className="text-3xl font-bold text-gray-900">{data?.stats.activeProjects}</div>
                <p className="text-xs text-gray-500 mt-1">Ongoing projects</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Pending Invoices */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="w-full h-8" />
            ) : (
              <>
                <div className="text-3xl font-bold text-amber-600">{data?.stats.pendingInvoices}</div>
                <p className="text-xs text-gray-500 mt-1">Awaiting payment</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Total Paid */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="w-full h-8" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">{formatINR(data?.stats.totalPaid || 0)}</div>
                <p className="text-xs text-gray-500 mt-1">Lifetime payments</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Outstanding Amount */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="w-full h-8" />
            ) : (
              <>
                <div className="text-2xl font-bold text-red-600">{formatINR(data?.stats.outstandingAmount || 0)}</div>
                <p className="text-xs text-gray-500 mt-1">Balance due</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects & Pending Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp size={20} />
                Recent Projects
              </CardTitle>
              <Link href="/portal/projects">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                  View All →
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <>
                <Skeleton className="w-full h-20" />
                <Skeleton className="w-full h-20" />
                <Skeleton className="w-full h-20" />
              </>
            ) : data?.recentProjects.length ? (
              data.recentProjects.map((project) => (
                <div key={project.id} className="pb-4 border-b last:border-b-0 last:pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{project.name}</h4>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status.replace('-', ' ')}
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{project.progress}% Complete</span>
                    <Link href={`/portal/projects/${project.id}`}>
                      <span className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer">Details →</span>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No active projects</p>
            )}
          </CardContent>
        </Card>

        {/* Pending Invoices */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <DollarSign size={20} />
                Pending Invoices
              </CardTitle>
              <Link href="/portal/invoices">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                  View All →
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <>
                <Skeleton className="w-full h-20" />
                <Skeleton className="w-full h-20" />
                <Skeleton className="w-full h-20" />
              </>
            ) : data?.pendingInvoices.length ? (
              data.pendingInvoices.map((invoice) => (
                <div key={invoice.id} className="pb-4 border-b last:border-b-0 last:pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">#{invoice.invoiceNumber}</h4>
                    {invoice.daysOverdue > 0 && (
                      <Badge className="bg-red-100 text-red-800">
                        {invoice.daysOverdue} days overdue
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-gray-900">{formatINR(invoice.amount)}</span>
                    <span className="text-sm text-gray-600">Due: {invoice.dueDate}</span>
                  </div>
                  <Link href={`/portal/invoices/${invoice.id}`}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">Pay Now</Button>
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No pending invoices</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
