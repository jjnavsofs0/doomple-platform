'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AlertCircle, DollarSign } from 'lucide-react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'draft';
  balance: number;
}

const formatINR = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-amber-100 text-amber-800';
    case 'overdue':
      return 'bg-red-100 text-red-800';
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await fetch('/api/portal/invoices');
        if (!response.ok) throw new Error('Failed to fetch invoices');
        const result = await response.json();
        setInvoices(result.invoices || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const getFilteredInvoices = () => {
    if (activeTab === 'all') return invoices;
    return invoices.filter((inv) => inv.status === activeTab);
  };

  const filteredInvoices = getFilteredInvoices();

  const stats = {
    total: invoices.reduce((sum, inv) => sum + inv.amount, 0),
    paid: invoices.filter((inv) => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0),
    pending: invoices.filter((inv) => inv.status === 'pending' || inv.status === 'overdue').reduce((sum, inv) => sum + inv.balance, 0),
    overdue: invoices.filter((inv) => inv.status === 'overdue').reduce((sum, inv) => sum + inv.balance, 0),
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="My Invoices"
        description="View and manage your invoices"
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {!loading && invoices.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 mb-1">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatINR(stats.total)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 mb-1">Amount Paid</p>
              <p className="text-2xl font-bold text-green-600">{formatINR(stats.paid)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 mb-1">Pending Payment</p>
              <p className="text-2xl font-bold text-amber-600">{formatINR(stats.pending)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 mb-1">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{formatINR(stats.overdue)}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {loading ? (
            <>
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </>
          ) : filteredInvoices.length > 0 ? (
            filteredInvoices.map((invoice) => (
              <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-center">
                    {/* Invoice Number */}
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Invoice</p>
                      <p className="text-lg font-bold text-gray-900">{invoice.invoiceNumber}</p>
                    </div>

                    {/* Dates */}
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Issue Date</p>
                      <p className="text-sm font-medium text-gray-900">{invoice.issueDate}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Due Date</p>
                      <p className="text-sm font-medium text-gray-900">{invoice.dueDate}</p>
                    </div>

                    {/* Amount */}
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Amount</p>
                      <p className="text-lg font-bold text-gray-900">{formatINR(invoice.amount)}</p>
                    </div>

                    {/* Status & Action */}
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </Badge>
                      <div className="flex gap-2 w-full">
                        <Link href={`/portal/invoices/${invoice.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            View
                          </Button>
                        </Link>
                        {invoice.status !== 'paid' && invoice.balance > 0 && (
                          <Link href={`/portal/invoices/${invoice.id}`} className="flex-1">
                            <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                              Pay
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <DollarSign className="text-gray-300 mb-3" size={48} />
              <p className="text-gray-500 text-lg">No {activeTab !== 'all' ? activeTab + ' ' : ''}invoices</p>
              <p className="text-gray-400 text-sm mt-1">
                {activeTab === 'all'
                  ? 'Your invoices will appear here'
                  : `You have no ${activeTab} invoices`}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
