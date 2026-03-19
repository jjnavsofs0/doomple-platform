'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Script from 'next/script';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Payment {
  id: string;
  date: string;
  amount: number;
  method: string;
  transactionId: string;
  status: 'success' | 'pending' | 'failed';
}

interface InvoiceDetail {
  id: string;
  invoiceNumber: string;
  status: 'paid' | 'pending' | 'overdue' | 'draft';
  issueDate: string;
  dueDate: string;
  description?: string;
  lineItems: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  paid: number;
  balance: number;
  payments: Payment[];
  clientId: string;
  clientName: string;
  clientEmail: string;
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

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function InvoiceDetailPage() {
  const params = useParams();
  const invoiceId = params.id as string;
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const razorpayScriptLoaded = useRef(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await fetch(`/api/portal/invoices/${invoiceId}`);
        if (!response.ok) throw new Error('Failed to fetch invoice');
        const result = await response.json();
        setInvoice(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId]);

  const handlePayNow = async () => {
    if (!invoice || invoice.balance <= 0) return;

    setPaymentLoading(true);
    setPaymentError(null);
    setPaymentSuccess(null);

    try {
      // Create Razorpay order
      const orderResponse = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(invoice.balance * 100), // Convert to paise
          invoiceId: invoice.id,
          clientId: invoice.clientId,
          clientName: invoice.clientName,
          clientEmail: invoice.clientEmail,
          description: `Invoice #${invoice.invoiceNumber}`,
        }),
      });

      if (!orderResponse.ok) throw new Error('Failed to create payment order');

      const orderResult = await orderResponse.json();
      const orderData = orderResult.data;

      if (!orderData?.orderId) {
        throw new Error(orderResult.error || 'Failed to create payment order');
      }

      // Initialize Razorpay
      if (!window.Razorpay) {
        throw new Error('Razorpay SDK not loaded');
      }

      const options = {
        key: orderData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount || Math.round(invoice.balance * 100),
        currency: 'INR',
        name: 'Doomple',
        description: `Invoice #${invoice.invoiceNumber}`,
        order_id: orderData.orderId,
        customer_id: invoice.clientId,
        prefill: {
          name: invoice.clientName,
          email: invoice.clientEmail,
        },
        theme: {
          color: '#2563eb',
        },
        handler: async (response: any) => {
          try {
            // Verify and process payment
            const verifyResponse = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                invoiceId: invoice.id,
              }),
            });

            if (verifyResponse.ok) {
              setPaymentSuccess(
                `Payment of ${formatINR(invoice.balance)} received successfully!`
              );
              // Refresh invoice data
              setTimeout(() => {
                window.location.reload();
              }, 2000);
            } else {
              const verifyError = await verifyResponse.json();
              setPaymentError(verifyError.error || 'Payment verification failed');
            }
          } catch (err) {
            setPaymentError(
              err instanceof Error ? err.message : 'Payment verification failed'
            );
          } finally {
            setPaymentLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPaymentLoading(false);
            setPaymentError('Payment cancelled');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : 'Payment failed');
      setPaymentLoading(false);
    }
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
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
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onLoad={() => {
          razorpayScriptLoaded.current = true;
        }}
      />

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-96" />
            <Skeleton className="h-4 w-48" />
          </div>
        ) : invoice ? (
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Invoice #{invoice.invoiceNumber}
              </h1>
              <Badge className={getStatusColor(invoice.status)}>
                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
              </Badge>
            </div>
          </div>
        ) : null}

        {/* Status Messages */}
        {paymentSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="text-green-600 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-green-900">Payment Successful</h3>
              <p className="text-green-700 text-sm">{paymentSuccess}</p>
            </div>
          </div>
        )}

        {paymentError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="text-red-600 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-red-900">Payment Error</h3>
              <p className="text-red-700 text-sm">{paymentError}</p>
            </div>
          </div>
        )}

        {/* Invoice Details */}
        {loading ? (
          <Skeleton className="h-40" />
        ) : invoice ? (
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Issue Date</p>
                  <p className="font-medium text-gray-900">{invoice.issueDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Due Date</p>
                  <p className="font-medium text-gray-900">{invoice.dueDate}</p>
                </div>
                {invoice.description && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600 mb-1">Description</p>
                    <p className="text-gray-900">{invoice.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Line Items */}
        {loading ? (
          <Skeleton className="h-48" />
        ) : invoice?.lineItems.length ? (
          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Description</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900">Qty</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900">Unit Price</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.lineItems.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100">
                        <td className="py-3 px-4 text-gray-900">{item.description}</td>
                        <td className="text-right py-3 px-4 text-gray-700">{item.quantity}</td>
                        <td className="text-right py-3 px-4 text-gray-700">
                          {formatINR(item.unitPrice)}
                        </td>
                        <td className="text-right py-3 px-4 font-medium text-gray-900">
                          {formatINR(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Summary Section */}
        {loading ? (
          <Skeleton className="h-48" />
        ) : invoice ? (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">{formatINR(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium text-gray-900">{formatINR(invoice.tax)}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="font-semibold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {formatINR(invoice.total)}
                  </span>
                </div>

                {invoice.paid > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span>Amount Paid</span>
                    <span className="font-semibold">{formatINR(invoice.paid)}</span>
                  </div>
                )}

                {invoice.balance > 0 && (
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200 text-red-600">
                    <span className="font-semibold">Balance Due</span>
                    <span className="text-2xl font-bold">{formatINR(invoice.balance)}</span>
                  </div>
                )}
              </div>

              {invoice.balance > 0 && (
                <Button
                  onClick={handlePayNow}
                  disabled={paymentLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 py-3 text-lg"
                >
                  {paymentLoading ? (
                    <>
                      <Loader className="animate-spin mr-2" size={20} />
                      Processing...
                    </>
                  ) : (
                    `Pay ${formatINR(invoice.balance)} Now`
                  )}
                </Button>
              )}

              {invoice.balance === 0 && invoice.status === 'paid' && (
                <div className="w-full bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 justify-center">
                  <CheckCircle className="text-green-600" size={20} />
                  <span className="font-medium text-green-800">Invoice Paid</span>
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}

        {/* Payment History */}
        {loading ? (
          <Skeleton className="h-32" />
        ) : invoice?.payments && invoice.payments.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Method</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Transaction ID
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.payments.map((payment) => (
                      <tr key={payment.id} className="border-b border-gray-100">
                        <td className="py-3 px-4 text-gray-700">{payment.date}</td>
                        <td className="text-right py-3 px-4 font-medium text-green-600">
                          {formatINR(payment.amount)}
                        </td>
                        <td className="py-3 px-4 text-gray-700">{payment.method}</td>
                        <td className="py-3 px-4 text-gray-600 font-mono text-xs">
                          {payment.transactionId}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge
                            className={
                              payment.status === 'success'
                                ? 'bg-green-100 text-green-800'
                                : payment.status === 'pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-red-100 text-red-800'
                            }
                          >
                            {payment.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </>
  );
}
