'use client'

import { useState, useEffect } from 'react'
import { Download, Calendar, DollarSign, CheckCircle, XCircle, Clock, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice } from '@/lib/stripe-plans'

interface PaymentHistoryItem {
  id: string
  amount: number
  currency: string
  status: 'succeeded' | 'pending' | 'failed'
  created: number
  invoice_id?: string
  invoice_url?: string
  description?: string
}

interface PaymentHistoryProps {
  userId: string
}

const statusConfig = {
  succeeded: {
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800',
    label: 'Paid'
  },
  pending: {
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-800',
    label: 'Pending'
  },
  failed: {
    icon: XCircle,
    color: 'bg-red-100 text-red-800',
    label: 'Failed'
  }
}

export function PaymentHistory({ userId }: PaymentHistoryProps) {
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(null)

  useEffect(() => {
    fetchPaymentHistory()
  }, [userId])

  const fetchPaymentHistory = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/stripe/payment-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch payment history')
      }

      const data = await response.json()
      
      if (data.success) {
        setPayments(data.payments || [])
      } else {
        throw new Error(data.error || 'Failed to fetch payment history')
      }
    } catch (error) {
      console.error('Error fetching payment history:', error)
      setError(error instanceof Error ? error.message : 'Failed to load payment history')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadInvoice = async (invoiceId: string, invoiceUrl?: string) => {
    if (!invoiceId) return

    setDownloadingInvoice(invoiceId)
    
    try {
      if (invoiceUrl) {
        // If we have a direct URL, open it in a new tab
        window.open(invoiceUrl, '_blank')
      } else {
        // Otherwise, fetch the invoice URL from our API
        const response = await fetch('/api/stripe/invoice', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ invoiceId }),
        })

        if (!response.ok) {
          throw new Error('Failed to get invoice URL')
        }

        const data = await response.json()
        
        if (data.success && data.invoiceUrl) {
          window.open(data.invoiceUrl, '_blank')
        } else {
          throw new Error(data.error || 'Failed to get invoice URL')
        }
      }
    } catch (error) {
      console.error('Error downloading invoice:', error)
      // You could add a toast notification here
    } finally {
      setDownloadingInvoice(null)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100)
  }

  if (isLoading) {
    return (
      <GlassCard variant="primary" size="lg" depth="medium" glow="medium">
        <div className="space-y-6">
          <div>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24 mt-2" />
                  </div>
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-16 mt-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    )
  }

  return (
    <GlassCard variant="primary" size="lg" depth="medium" glow="medium">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Payment History</h2>
          <p className="text-muted-foreground">
            View your past payments and download invoices.
          </p>
        </div>

        {error ? (
          <div className="text-center py-8">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Error Loading Payment History</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchPaymentHistory} variant="outline">
              Try Again
            </Button>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Payment History</h3>
            <p className="text-muted-foreground">
              You don't have any payments yet. Your payment history will appear here once you make your first payment.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => {
              const statusInfo = statusConfig[payment.status]
              const StatusIcon = statusInfo.icon
              const isDownloading = downloadingInvoice === payment.invoice_id

              return (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative p-2 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 shadow-lg">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {payment.description || 'Subscription Payment'}
                        </span>
                        <Badge className={statusInfo.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(payment.created)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatAmount(payment.amount, payment.currency)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {payment.currency.toUpperCase()}
                      </div>
                    </div>

                    {payment.invoice_id && payment.status === 'succeeded' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadInvoice(payment.invoice_id!, payment.invoice_url)}
                        disabled={isDownloading}
                      >
                        {isDownloading ? (
                          <Clock className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </GlassCard>
  )
} 