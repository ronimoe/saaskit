import { useState } from 'react'
import { Check, Star, Zap, Building, ArrowUpRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { Badge } from '@/components/ui/badge'
import { SUBSCRIPTION_PLANS, formatPrice } from '@/lib/stripe-plans'
import type { Subscription } from '@/types/database'

interface PlanComparisonProps {
  currentSubscription?: Subscription | null
  userId: string
  onPlanChange?: () => void
}

const planIcons = {
  STARTER: Star,
  PRO: Zap,
  ENTERPRISE: Building,
}

const planColors = {
  STARTER: 'from-blue-400 to-cyan-600',
  PRO: 'from-purple-400 to-indigo-600', 
  ENTERPRISE: 'from-orange-400 to-pink-600',
}

export function PlanComparison({ currentSubscription, userId, onPlanChange }: PlanComparisonProps) {
  const [isChangingPlan, setIsChangingPlan] = useState<string | null>(null)

  const getCurrentPlanKey = () => {
    if (!currentSubscription) return null
    
    // Match current subscription to plan by price or plan name
    for (const [planKey, plan] of Object.entries(SUBSCRIPTION_PLANS)) {
      if (currentSubscription.plan_name?.toLowerCase().includes(plan.name.toLowerCase()) ||
          Math.abs((currentSubscription.unit_amount / 100) - plan.price) < 0.01) {
        return planKey as keyof typeof SUBSCRIPTION_PLANS
      }
    }
    return null
  }

  const currentPlanKey = getCurrentPlanKey()

  const handlePlanChange = async (planKey: string) => {
    setIsChangingPlan(planKey)
    
    try {
      // Redirect to Stripe Customer Portal for plan changes
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
      console.error('Error changing plan:', error)
      // You could add a toast notification here
    } finally {
      setIsChangingPlan(null)
    }
  }

  return (
    <GlassCard variant="primary" size="lg" depth="medium" glow="medium">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Available Plans</h2>
          <p className="text-muted-foreground">
            Compare plans and upgrade or downgrade your subscription.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {Object.entries(SUBSCRIPTION_PLANS).map(([planKey, plan]) => {
            const IconComponent = planIcons[planKey as keyof typeof planIcons]
            const isCurrentPlan = currentPlanKey === planKey
            const isPopular = planKey === 'PRO'
            const isChanging = isChangingPlan === planKey

            return (
              <GlassCard 
                key={planKey}
                variant={isCurrentPlan ? "primary" : "secondary"}
                size="md"
                depth="medium"
                glow={isCurrentPlan ? "medium" : "subtle"}
                interactive="hover"
                className={`relative ${isCurrentPlan ? 'ring-2 ring-brand-primary' : ''}`}
              >
                {isPopular && !isCurrentPlan && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg">
                    Most Popular
                  </Badge>
                )}
                
                {isCurrentPlan && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg">
                    Current Plan
                  </Badge>
                )}

                <div className="space-y-4">
                  {/* Plan Header */}
                  <div className="text-center">
                    <div className="flex justify-center mb-3">
                      <div className={`relative p-3 rounded-xl bg-gradient-to-br ${planColors[planKey as keyof typeof planColors]} shadow-lg`}>
                        <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${planColors[planKey as keyof typeof planColors]} animate-pulse opacity-75`}></div>
                        <div className="relative">
                          <IconComponent className="h-5 w-5 text-white drop-shadow-sm" />
                        </div>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                    <div className="mt-2">
                      <span className="text-2xl font-bold">{formatPrice(plan.price)}</span>
                      <span className="text-muted-foreground text-sm">/month</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <div className="pt-2">
                    {isCurrentPlan ? (
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        disabled
                      >
                        Current Plan
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handlePlanChange(planKey)}
                        disabled={isChanging || !userId}
                        className={`w-full bg-gradient-to-r ${planColors[planKey as keyof typeof planColors]} hover:opacity-90 text-white shadow-lg`}
                      >
                        {isChanging ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            {currentSubscription ? 'Change Plan' : 'Upgrade'}
                            <ArrowUpRight className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </GlassCard>
            )
          })}
        </div>

        {/* Additional Info */}
        <div className="border-t pt-4">
          <p className="text-sm text-muted-foreground text-center">
            Plan changes take effect immediately. You'll be redirected to our secure billing portal to complete the change.
          </p>
        </div>
      </div>
    </GlassCard>
  )
} 