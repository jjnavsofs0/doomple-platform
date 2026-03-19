'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  DollarSign,
  FolderKanban,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

interface DashboardData {
  welcomeMessage: string;
  clientName: string;
  companyName: string;
  stats: {
    activeProjects: number;
    pendingInvoices: number;
    totalPaid: number;
    outstandingAmount: number;
  };
  recentProjects: Array<{
    id: string;
    name: string;
    status: 'active' | 'completed' | 'on-hold' | 'planning';
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

const formatINR = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);

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
      <div className="mx-auto max-w-7xl">
        <div className="flex items-start gap-4 rounded-3xl border border-red-200 bg-[linear-gradient(180deg,#FFF6F6_0%,#FFF1F1_100%)] p-6 shadow-sm">
          <AlertCircle className="mt-0.5 text-red-600" size={20} />
          <div>
            <h3 className="font-semibold text-red-900">Unable to load your workspace</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
            <p className="mt-2 text-sm text-red-600/80">
              Please refresh the page or try again in a moment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="overflow-hidden rounded-[32px] border border-[#D9E8F6] bg-[linear-gradient(135deg,#06284A_0%,#0B3763_52%,#115A84_100%)] p-8 text-white shadow-[0_24px_80px_rgba(4,32,66,0.18)]">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-sm text-[#7CE6DA]">
              <Sparkles className="h-4 w-4" />
              Client workspace snapshot
            </div>
            <h1 className="mt-5 text-4xl font-bold tracking-tight">
              Welcome back{loading ? '' : `, ${data?.clientName}`}.
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-white/70">
              {loading ? 'Loading your current project and billing view...' : data?.welcomeMessage}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/portal/projects">
                <Button className="rounded-2xl bg-[#1ABFAD] px-5 text-white hover:bg-[#15a89a]">
                  View Projects
                </Button>
              </Link>
              <Link href="/portal/invoices">
                <Button
                  variant="outline"
                  className="rounded-2xl border-white/20 bg-transparent px-5 text-white hover:bg-white/10 hover:text-white"
                >
                  Billing Overview
                </Button>
              </Link>
            </div>

            {!loading && data?.companyName && (
              <div className="mt-8 rounded-3xl border border-white/10 bg-white/10 p-4 text-sm text-white/70">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7CE6DA]">
                  Account
                </p>
                <p className="mt-2 text-lg font-semibold text-white">{data.companyName}</p>
                <p className="mt-1">
                  Keep projects, invoices, and documents moving from one client workspace.
                </p>
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                label: 'Active Projects',
                value: loading ? '...' : String(data?.stats.activeProjects || 0),
                note: 'Currently moving',
                icon: FolderKanban,
              },
              {
                label: 'Pending Invoices',
                value: loading ? '...' : String(data?.stats.pendingInvoices || 0),
                note: 'Require attention',
                icon: DollarSign,
              },
              {
                label: 'Total Paid',
                value: loading ? '...' : formatINR(data?.stats.totalPaid || 0),
                note: 'Successful payments',
                icon: CheckCircle,
              },
              {
                label: 'Outstanding',
                value: loading ? '...' : formatINR(data?.stats.outstandingAmount || 0),
                note: 'Open balance',
                icon: TrendingUp,
              },
            ].map((item) => (
              <div key={item.label} className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <item.icon className="h-5 w-5 text-[#7CE6DA]" />
                <p className="mt-4 text-sm text-white/65">{item.label}</p>
                <p className="mt-1 text-2xl font-bold">{item.value}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.24em] text-white/40">{item.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: 'Active Projects',
            value: loading ? null : data?.stats.activeProjects,
            note: 'Ongoing delivery',
            valueClass: 'text-gray-900',
          },
          {
            title: 'Pending Invoices',
            value: loading ? null : data?.stats.pendingInvoices,
            note: 'Awaiting action',
            valueClass: 'text-amber-600',
          },
          {
            title: 'Total Paid',
            value: loading ? null : formatINR(data?.stats.totalPaid || 0),
            note: 'Lifetime successful payments',
            valueClass: 'text-green-600',
          },
          {
            title: 'Outstanding',
            value: loading ? null : formatINR(data?.stats.outstandingAmount || 0),
            note: 'Open balance due',
            valueClass: 'text-red-600',
          },
        ].map((item) => (
          <Card key={item.title} className="rounded-3xl border-[#DDE8F2] bg-white/90 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-full" />
              ) : (
                <>
                  <div className={`text-2xl font-bold ${item.valueClass}`}>{item.value}</div>
                  <p className="mt-1 text-xs text-gray-500">{item.note}</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="rounded-3xl border-[#DDE8F2] bg-white/90 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp size={20} />
                Recent Projects
              </CardTitle>
              <Link href="/portal/projects">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </>
            ) : data?.recentProjects.length ? (
              data.recentProjects.map((project) => (
                <div key={project.id} className="rounded-2xl border border-[#E7EEF6] p-4">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <h4 className="font-semibold text-gray-900">{project.name}</h4>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status.replace('-', ' ')}
                    </Badge>
                  </div>
                  <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#1ABFAD,#3BB2F6)]"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{project.progress}% complete</span>
                    <Link href={`/portal/projects/${project.id}`}>
                      <span className="inline-flex cursor-pointer items-center gap-1 font-medium text-blue-600 hover:text-blue-700">
                        Details
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-[#CFE0F3] bg-[#F8FBFF] px-6 py-12 text-center">
                <FolderKanban className="mx-auto mb-3 h-10 w-10 text-[#9BB6D4]" />
                <p className="text-lg font-semibold text-[#042042]">No active projects yet</p>
                <p className="mt-2 text-sm text-gray-500">
                  Active work will appear here once a project is underway.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-[#DDE8F2] bg-white/90 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <DollarSign size={20} />
                Pending Invoices
              </CardTitle>
              <Link href="/portal/invoices">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </>
            ) : data?.pendingInvoices.length ? (
              data.pendingInvoices.map((invoice) => (
                <div key={invoice.id} className="rounded-2xl border border-[#E7EEF6] p-4">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <h4 className="font-semibold text-gray-900">#{invoice.invoiceNumber}</h4>
                    {invoice.daysOverdue > 0 ? (
                      <Badge className="bg-red-100 text-red-800">
                        {invoice.daysOverdue} days overdue
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-800">Pending</Badge>
                    )}
                  </div>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">{formatINR(invoice.amount)}</span>
                    <span className="text-sm text-gray-500">Due {invoice.dueDate}</span>
                  </div>
                  <Link href={`/portal/invoices/${invoice.id}`}>
                    <span className="inline-flex cursor-pointer items-center gap-1 font-medium text-blue-600 hover:text-blue-700">
                      Review invoice
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-[#CFE0F3] bg-[#F8FBFF] px-6 py-12 text-center">
                <CheckCircle className="mx-auto mb-3 h-10 w-10 text-[#1ABFAD]" />
                <p className="text-lg font-semibold text-[#042042]">No pending invoices</p>
                <p className="mt-2 text-sm text-gray-500">
                  You are all caught up on open invoice actions right now.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
