import { Suspense } from 'react'
import { createClient } from '@/utils/supabase/server'
import { UnifiedHeader } from '@/components/layout/unified-header'
import { DashboardLayout } from '@/components/layout'
import { BillingPortalButton } from '@/components/billing-portal-button'
import { SyncSubscriptionButton } from '@/components/sync-subscription-button'
import { PlanComparison, PaymentHistory, BillingAddressForm, SubscriptionManagement } from '@/components/billing'
import { GlassCard } from '@/components/ui/glass-card'
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
      description: 'You don&apos;t have an active subscription'
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
    <DashboardLayout>
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
              <GlassCard key={i} variant="secondary" size="md" depth="medium" glow="subtle">
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </GlassCard>
            ))}
          </div>

          {/* Billing Details Skeleton */}
          <GlassCard variant="primary" size="lg" depth="medium" glow="medium">
            <Skeleton className="h-6 w-48 mb-6" />
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
    </DashboardLayout>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <UnifiedHeader variant="app" />
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
          <GlassCard variant="secondary" size="md" depth="medium" glow="subtle" interactive="hover">
            <div className="flex flex-row items-center justify-between space-y-0 pb-3">
              <h3 className="text-sm font-medium">Subscription Status</h3>
              <div className={`relative p-3 rounded-xl ${
                statusInfo.status === 'active' ? 'bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg shadow-green-500/25' :
                statusInfo.status === 'trial' ? 'bg-gradient-to-br from-blue-400 to-cyan-600 shadow-lg shadow-blue-500/25' :
                statusInfo.status === 'past_due' ? 'bg-gradient-to-br from-red-400 to-rose-600 shadow-lg shadow-red-500/25' :
                'bg-gradient-to-br from-gray-400 to-slate-600 shadow-lg shadow-gray-500/25'
              }`}>
                {statusInfo.status === 'active' && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 animate-pulse opacity-75"></div>
                )}
                <div className="relative">
                  {statusInfo.status === 'active' ? (
                    <CheckCircle className="h-5 w-5 text-white drop-shadow-sm" />
                  ) : statusInfo.status === 'trial' ? (
                    <Clock className="h-5 w-5 text-white drop-shadow-sm" />
                  ) : statusInfo.status === 'past_due' ? (
                    <AlertCircle className="h-5 w-5 text-white drop-shadow-sm" />
                  ) : (
                    <CreditCard className="h-5 w-5 text-white drop-shadow-sm" />
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-3 pt-2">
              {statusInfo.status === 'active' ? (
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        Active
                      </div>
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-sm shadow-green-500/50"></div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Your subscription is active and up to date
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <Badge className={`${statusInfo.statusColor} text-sm px-3 py-1`}>
                    {statusInfo.statusText}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-2">
                    {statusInfo.description}
                  </p>
                </div>
              )}
            </div>
          </GlassCard>

                      {/* Current Plan */}
          <GlassCard variant="secondary" size="md" depth="medium" glow="subtle" interactive="hover">
            <div className="flex flex-row items-center justify-between space-y-0 pb-3">
              <h3 className="text-sm font-medium">Current Plan</h3>
              <div className="relative p-3 rounded-xl bg-gradient-to-br from-blue-400 to-purple-600 shadow-lg shadow-blue-500/25">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-400 to-purple-600 animate-pulse opacity-75"></div>
                <div className="relative">
                  <DollarSign className="h-5 w-5 text-white drop-shadow-sm" />
                </div>
              </div>
            </div>
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {subscription?.plan_name || 'Free Plan'}
                </div>
                {subscription && (
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-sm shadow-blue-500/50"></div>
                )}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {subscription ? formatSubscriptionPrice(
                  subscription.unit_amount,
                  subscription.currency as 'usd' | 'eur' | 'gbp' | 'cad',
                  subscription.interval as 'month' | 'year'
                ) : 'No charge'}
              </p>
            </div>
          </GlassCard>

                      {/* Next Billing */}
          <GlassCard variant="secondary" size="md" depth="medium" glow="subtle" interactive="hover">
            <div className="flex flex-row items-center justify-between space-y-0 pb-3">
              <h3 className="text-sm font-medium">Next Billing</h3>
              <div className="relative p-3 rounded-xl bg-gradient-to-br from-orange-400 to-pink-600 shadow-lg shadow-orange-500/25">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-orange-400 to-pink-600 animate-pulse opacity-75"></div>
                <div className="relative">
                  <Calendar className="h-5 w-5 text-white drop-shadow-sm" />
                </div>
              </div>
            </div>
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                  {subscription ? (
                    `${getDaysUntilExpiry(subscription)} days`
                  ) : (
                    'N/A'
                  )}
                </div>
                {subscription && (
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-sm shadow-orange-500/50"></div>
                )}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {subscription 
                  ? new Date(subscription.current_period_end).toLocaleDateString()
                  : 'No upcoming billing'
                }
              </p>
            </div>
          </GlassCard>

            {/* Quick Actions */}
            <GlassCard variant="secondary" size="md" depth="medium" glow="subtle" interactive="hover">
              <div className="flex flex-row items-center justify-between space-y-0 pb-3">
                <h3 className="text-sm font-medium">Quick Actions</h3>
                <div className="relative p-3 rounded-xl bg-gradient-to-br from-purple-400 to-indigo-600 shadow-lg shadow-purple-500/25">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-400 to-indigo-600 animate-pulse opacity-75"></div>
                  <div className="relative">
                    <Settings className="h-5 w-5 text-white drop-shadow-sm" />
                  </div>
                </div>
              </div>
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 mb-4">
                  <div className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    {subscription ? 'Manage' : 'Get Started'}
                  </div>
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shadow-sm shadow-purple-500/50"></div>
                </div>
                {subscription ? (
                  <BillingPortalButton size="sm" className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-lg shadow-purple-500/25" />
                ) : (
                  <Button asChild size="sm" className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-lg shadow-purple-500/25">
                    <Link href="/pricing">
                      View Plans <ArrowUpRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Detailed Billing Information */}
          <GlassCard variant="primary" size="lg" depth="medium" glow="medium">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Billing Details</h2>
                <p className="text-muted-foreground">
                  Your current subscription and billing information.
                </p>
              </div>
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
                      <div className="flex flex-row gap-2">
                        <SyncSubscriptionButton userId={user.id} />
                        <BillingPortalButton />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Active Subscription</h3>
                  <p className="text-muted-foreground mb-6">
                    You don&apos;t have an active subscription. Choose a plan to get started.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button asChild className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90">
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
            </div>
          </GlassCard>

          {/* Plan Comparison */}
          <PlanComparison currentSubscription={subscription} userId={user.id} />

          {/* Payment History */}
          <PaymentHistory userId={user.id} />

          {/* Billing Address Management */}
          <BillingAddressForm userId={user.id} />

          {/* Subscription Management */}
          <SubscriptionManagement subscription={subscription} userId={user.id} />
        </div>
      </div>
    </div>
  )
}

export default function BillingPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<BillingSkeleton />}>
        <BillingContent />
      </Suspense>
    </DashboardLayout>
  )
} 