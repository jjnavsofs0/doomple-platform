'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import { AlertCircle, TrendingUp } from 'lucide-react';
import { useUserLiveRefetch } from '@/hooks/use-live-refetch';

interface Payment {
  id: string;
  date: string;
  invoiceNumber: string;
  amount: number;
  method: string;
  transactionId: string;
  status: 'success' | 'pending' | 'failed';
}

const formatINR = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'success':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-amber-100 text-amber-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    try {
      const response = await fetch('/api/portal/payments', { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to fetch payments');
      const result = await response.json();
      setPayments(result.payments || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  useUserLiveRefetch(["payments", "invoices", "dashboard"], fetchPayments);

  const successfulPayments = payments.filter((p) => p.status === 'success');
  const totalPaid = successfulPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Payment History"
        description="View all your payments and transactions"
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

      {/* Summary Card */}
      {!loading && successfulPayments.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Paid</p>
                <p className="text-3xl font-bold text-gray-900">{formatINR(totalPaid)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {successfulPayments.length} successful payments
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          ) : payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Date</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Invoice</th>
                    <th className="text-right py-4 px-4 font-semibold text-gray-900">Amount</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Method</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Transaction ID</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 text-gray-900">{payment.date}</td>
                      <td className="py-4 px-4 font-medium text-blue-600">
                        #{payment.invoiceNumber}
                      </td>
                      <td className="text-right py-4 px-4 font-semibold text-gray-900">
                        {formatINR(payment.amount)}
                      </td>
                      <td className="py-4 px-4 text-gray-700">
                        {payment.method === 'razorpay'
                          ? 'Razorpay'
                          : payment.method === 'bank_transfer'
                            ? 'Bank Transfer'
                            : payment.method === 'cheque'
                              ? 'Cheque'
                              : 'Other'}
                      </td>
                      <td className="py-4 px-4 font-mono text-xs text-gray-600">
                        <code className="bg-gray-100 px-2 py-1 rounded">{payment.transactionId}</code>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <TrendingUp className="text-gray-300 mb-3" size={48} />
              <p className="text-gray-500 text-lg">No payments yet</p>
              <p className="text-gray-400 text-sm mt-1">Your payment history will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
