import { Suspense } from 'react'
import { createClient } from '@/utils/supabase/server'
import { UnifiedHeader } from '@/components/layout/unified-header'
import { BillingPortalButton } from '@/components/billing-portal-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  ArrowUpRight,
  Settings
} from 'lucide-react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Profile, Subscription } from '@/types/database'
import { 
  isActiveSubscription, 
  isCanceledButActive, 
  getDaysUntilExpiry,
  formatSubscriptionPrice 
} from '@/lib/database-utils'

async function getBillingData(userId: string) {
  const supabase = await createClient()
  
  // Get profile data
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (profileError) {
    console.error('Error fetching profile:', profileError)
    return { profile: null, subscription: null }
  }

  // Get active subscription
  const { data: subscriptions, error: subscriptionsError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (subscriptionsError) {
    console.error('Error fetching subscriptions:', subscriptionsError)
  }

  const activeSubscription = subscriptions?.find(isActiveSubscription) || null

  return {
    profile: profile as Profile,
    subscription: activeSubscription as Subscription | null
  }
}

function getSubscriptionStatusInfo(subscription: Subscription | null) {
  if (!subscription) {
    return {
      status: 'none',
      statusColor: 'bg-gray-100 text-gray-800',
      statusText: 'No Subscription',
      description: 'You don\'t have an active subscription'
    }
  }

  if (isCanceledButActive(subscription)) {
    const daysLeft = getDaysUntilExpiry(subscription)
    return {
      status: 'canceling',
      statusColor: 'bg-orange-100 text-orange-800',
      statusText: 'Ending Soon',
      description: `Subscription ends in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`
    }
  }

  switch (subscription.status) {
    case 'active':
      return {
        status: 'active',
        statusColor: 'bg-green-100 text-green-800',
        statusText: 'Active',
        description: 'Your subscription is active and up to date'
      }
    case 'trialing':
      const daysLeft = getDaysUntilExpiry(subscription)
      return {
        status: 'trial',
        statusColor: 'bg-blue-100 text-blue-800',
        statusText: 'Free Trial',
        description: `Trial ends in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`
      }
    case 'past_due':
      return {
        status: 'past_due',
        statusColor: 'bg-red-100 text-red-800',
        statusText: 'Payment Due',
        description: 'Please update your payment method'
      }
    case 'canceled':
      return {
        status: 'canceled',
        statusColor: 'bg-gray-100 text-gray-800',
        statusText: 'Canceled',
        description: 'Your subscription has been canceled'
      }
    default:
      return {
        status: 'unknown',
        statusColor: 'bg-gray-100 text-gray-800',
        statusText: subscription.status,
        description: 'Check your billing portal for details'
      }
  }
}

function BillingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <UnifiedHeader variant="app" />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Header Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>

          {/* Cards Skeleton */}
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </Card>
            ))}
          </div>

          {/* Billing Details Skeleton */}
          <Card className="p-6">
            <Skeleton className="h-6 w-48 mb-6" />
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

async function BillingContent() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { profile, subscription } = await getBillingData(user.id)

  if (!profile) {
    redirect('/auth/setup-profile')
  }

  const statusInfo = getSubscriptionStatusInfo(subscription)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
          <p className="text-muted-foreground">
            Manage your subscription, billing details, and payment methods.
          </p>
        </div>

        {/* Status Overview Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Subscription Status */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subscription Status</CardTitle>
              {statusInfo.status === 'active' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : statusInfo.status === 'trial' ? (
                <Clock className="h-4 w-4 text-blue-600" />
              ) : statusInfo.status === 'past_due' ? (
                <AlertCircle className="h-4 w-4 text-red-600" />
              ) : (
                <CreditCard className="h-4 w-4 text-gray-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge className={statusInfo.statusColor}>
                  {statusInfo.statusText}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {statusInfo.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Current Plan */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {subscription?.plan_name || 'Free Plan'}
                </div>
                <p className="text-sm text-muted-foreground">
                  {subscription ? formatSubscriptionPrice(
                    subscription.unit_amount,
                    subscription.currency as 'usd' | 'eur' | 'gbp' | 'cad',
                    subscription.interval as 'month' | 'year'
                  ) : 'No charge'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Next Billing */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Billing</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {subscription ? (
                    `${getDaysUntilExpiry(subscription)} days`
                  ) : (
                    'N/A'
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {subscription 
                    ? new Date(subscription.current_period_end).toLocaleDateString()
                    : 'No upcoming billing'
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {subscription ? (
                  <BillingPortalButton size="sm" className="w-full" />
                ) : (
                  <Button asChild size="sm" className="w-full">
                    <Link href="/pricing">
                      View Plans <ArrowUpRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Billing Information */}
        <Card>
          <CardHeader>
            <CardTitle>Billing Details</CardTitle>
            <CardDescription>
              Your current subscription and billing information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subscription ? (
              <div className="space-y-6">
                {/* Subscription Details */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Plan Details</h4>
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">Plan:</span> {subscription.plan_name}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Billing:</span> {subscription.interval}ly
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Price:</span> {formatSubscriptionPrice(
                          subscription.unit_amount,
                          subscription.currency as 'usd' | 'eur' | 'gbp' | 'cad',
                          subscription.interval as 'month' | 'year'
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Billing Period</h4>
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">Started:</span> {' '}
                        {new Date(subscription.current_period_start).toLocaleDateString()}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Ends:</span> {' '}
                        {new Date(subscription.current_period_end).toLocaleDateString()}
                      </p>
                      {subscription.cancel_at_period_end && (
                        <p className="text-sm text-orange-600">
                          <span className="font-medium">Note:</span> Subscription will end at period end
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Portal Access */}
                <div className="border-t pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-medium">Manage Subscription</h4>
                      <p className="text-sm text-muted-foreground">
                        Update payment methods, download invoices, or change your plan.
                      </p>
                    </div>
                    <BillingPortalButton />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Active Subscription</h3>
                <p className="text-muted-foreground mb-6">
                  You don't have an active subscription. Choose a plan to get started.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild>
                    <Link href="/pricing">
                      View Plans <ArrowUpRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/profile">Back to Profile</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <UnifiedHeader variant="app" />
      <Suspense fallback={<BillingSkeleton />}>
        <BillingContent />
      </Suspense>
    </div>
  )
} 