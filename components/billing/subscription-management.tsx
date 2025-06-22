import { useState } from 'react'
import { AlertTriangle, CreditCard, Trash2, Settings, ExternalLink, Loader2, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import type { Subscription } from '@/types/database'

interface SubscriptionManagementProps {
  subscription: Subscription | null
  userId: string
  onSubscriptionUpdate?: () => void
}

export function SubscriptionManagement({ subscription, userId, onSubscriptionUpdate }: SubscriptionManagementProps) {
  const [isAccessingPortal, setIsAccessingPortal] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)

  const handlePortalAccess = async () => {
    setIsAccessingPortal(true)
    
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) {
        throw new Error('Failed to create portal session')
      }

      const data = await response.json()
      
      if (data.success && data.url) {
        // Redirect to Stripe Customer Portal
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed to create portal session')
      }
    } catch (error) {
      console.error('Error accessing portal:', error)
      // You could add a toast notification here
    } finally {
      setIsAccessingPortal(false)
    }
  }

  const handleCancellation = async () => {
    setIsCanceling(true)
    
    try {
      // For now, redirect to Stripe Customer Portal for cancellation
      // In a more advanced implementation, you could handle this with your own API
      await handlePortalAccess()
    } catch (error) {
      console.error('Error handling cancellation:', error)
    } finally {
      setIsCanceling(false)
    }
  }

  if (!subscription) {
    return (
      <GlassCard variant="primary" size="lg" depth="medium" glow="medium">
        <div className="text-center py-8">
          <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Active Subscription</h3>
          <p className="text-muted-foreground mb-6">
            You don't have an active subscription to manage.
          </p>
          <Button asChild className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90">
            <a href="/pricing">
              View Plans <ExternalLink className="h-4 w-4 ml-2" />
            </a>
          </Button>
        </div>
      </GlassCard>
    )
  }

  const isActive = subscription.status === 'active'
  const isCanceled = subscription.cancel_at_period_end
  const isPastDue = subscription.status === 'past_due'
  const isTrialing = subscription.status === 'trialing'

  return (
    <GlassCard variant="primary" size="lg" depth="medium" glow="medium">
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="relative p-3 rounded-xl bg-gradient-to-br from-purple-400 to-indigo-600 shadow-lg">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-400 to-indigo-600 animate-pulse opacity-75"></div>
            <div className="relative">
              <Settings className="h-5 w-5 text-white drop-shadow-sm" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Subscription Management</h2>
            <p className="text-muted-foreground">
              Manage your subscription, payment methods, and billing preferences.
            </p>
          </div>
        </div>

        {/* Subscription Status Alert */}
        {isCanceled && (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-orange-600 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-orange-800">Subscription Ending</h4>
                <p className="text-sm text-orange-700">
                  Your subscription will end on {new Date(subscription.current_period_end).toLocaleDateString()}.
                  You can reactivate it before this date.
                </p>
              </div>
            </div>
          </div>
        )}

        {isPastDue && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Payment Required</h4>
                <p className="text-sm text-red-700">
                  Your payment is past due. Please update your payment method to continue your subscription.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Management Options */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Payment Methods */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Payment Methods
              </h3>
              <p className="text-sm text-muted-foreground">
                Manage your payment methods and billing information.
              </p>
            </div>
            
            <Button
              onClick={handlePortalAccess}
              disabled={isAccessingPortal}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white shadow-lg"
            >
              {isAccessingPortal ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Manage Payment Methods
                </>
              )}
            </Button>

            <div className="text-xs text-muted-foreground flex items-center">
              <Shield className="h-3 w-3 mr-1" />
              Secured by Stripe
            </div>
          </div>

          {/* Subscription Actions */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Subscription Actions
              </h3>
              <p className="text-sm text-muted-foreground">
                Change your plan or cancel your subscription.
              </p>
            </div>

            <div className="space-y-2">
              <Button
                onClick={handlePortalAccess}
                disabled={isAccessingPortal}
                variant="outline"
                className="w-full"
              >
                {isAccessingPortal ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Billing Portal
                  </>
                )}
              </Button>

              {isActive && !isCanceled && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Cancel Subscription
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to cancel your subscription? You'll continue to have access until the end of your current billing period ({new Date(subscription.current_period_end).toLocaleDateString()}), but won't be charged again.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleCancellation}
                        disabled={isCanceling}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {isCanceling ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Canceling...
                          </>
                        ) : (
                          'Yes, Cancel Subscription'
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {isCanceled && (
                <Button
                  onClick={handlePortalAccess}
                  disabled={isAccessingPortal}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg"
                >
                  {isAccessingPortal ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Reactivate Subscription'
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="border-t pt-6">
          <h4 className="text-sm font-medium mb-3">What you can manage:</h4>
          <div className="grid gap-2 md:grid-cols-2 text-sm text-muted-foreground">
            <div className="flex items-center">
              <CreditCard className="h-4 w-4 mr-2 text-blue-500" />
              Add, remove, or update payment methods
            </div>
            <div className="flex items-center">
              <Settings className="h-4 w-4 mr-2 text-purple-500" />
              Change subscription plans
            </div>
            <div className="flex items-center">
              <ExternalLink className="h-4 w-4 mr-2 text-green-500" />
              Download invoices and receipts
            </div>
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-2 text-orange-500" />
              Update billing address and tax info
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Current Status:</span>
            <Badge className={
              isActive && !isCanceled ? 'bg-green-100 text-green-800' :
              isCanceled ? 'bg-orange-100 text-orange-800' :
              isPastDue ? 'bg-red-100 text-red-800' :
              isTrialing ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }>
              {isActive && !isCanceled ? 'Active' :
               isCanceled ? 'Ending Soon' :
               isPastDue ? 'Past Due' :
               isTrialing ? 'Trial' :
               subscription.status}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            All changes are processed securely through Stripe
          </div>
        </div>
      </div>
    </GlassCard>
  )
} 