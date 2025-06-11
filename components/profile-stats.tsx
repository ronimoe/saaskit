"use client"


import { GlassCard } from '@/components/ui/glass-card'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Calendar, TrendingUp, Activity } from 'lucide-react'
import { isActiveSubscription, formatSubscriptionPrice, getDaysUntilExpiry } from '@/lib/database-utils'
import type { Profile, Subscription } from '@/types/database'

interface ProfileStatsProps {
  profile: Profile
  subscriptions: Subscription[]
}

function formatTimeSince(dateString: string | null): string {
  if (!dateString) return 'Never'
  
  const date = new Date(dateString)
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 30) return `${diffInDays} days ago`
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
  return `${Math.floor(diffInDays / 365)} years ago`
}

export function ProfileStats({ profile, subscriptions }: ProfileStatsProps) {
  const activeSubscriptions = subscriptions.filter(isActiveSubscription)
  const currentSubscription = activeSubscriptions[0] // Most recent active subscription
  
  const accountAge = profile.created_at 
    ? Math.floor((new Date().getTime() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  const lastActivity = profile.updated_at || profile.created_at

  const stats = [
    {
      title: 'Account Status',
      value: currentSubscription ? 'Premium' : 'Free',
      subtitle: currentSubscription 
        ? `${currentSubscription.plan_name} Plan`
        : 'No active subscription',
      icon: CreditCard,
      color: currentSubscription ? 'text-green-600' : 'text-slate-500',
      bgColor: currentSubscription ? 'bg-green-50' : 'bg-slate-50',
      badge: currentSubscription ? (
        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          {currentSubscription.status === 'trialing' ? 'Trial' : 'Active'}
        </Badge>
      ) : (
        <Badge variant="outline">Free</Badge>
      )
    },
    {
      title: 'Member Since',
      value: `${accountAge} days`,
      subtitle: formatTimeSince(profile.created_at),
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      badge: accountAge > 365 ? (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          Veteran
        </Badge>
      ) : accountAge > 30 ? (
        <Badge variant="outline">Regular</Badge>
      ) : (
        <Badge variant="outline">New</Badge>
      )
    },
    {
      title: 'Last Activity',
      value: formatTimeSince(lastActivity),
      subtitle: lastActivity ? new Date(lastActivity).toLocaleDateString() : 'No activity',
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      badge: (() => {
        if (!lastActivity) return <Badge variant="outline">Inactive</Badge>
        const daysSince = Math.floor((new Date().getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24))
        if (daysSince <= 1) return (
          <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
            Active
          </Badge>
        )
        if (daysSince <= 7) return <Badge variant="outline">Recent</Badge>
        return <Badge variant="outline">Inactive</Badge>
      })()
    }
  ]

  // If there's an active subscription, show billing info instead of last activity
  if (currentSubscription) {
    const daysUntilExpiry = getDaysUntilExpiry(currentSubscription)
    const price = formatSubscriptionPrice(
      currentSubscription.unit_amount, 
      currentSubscription.currency as 'usd' | 'eur' | 'gbp' | 'cad', 
      currentSubscription.interval as 'month' | 'year'
    )

    stats[2] = {
      title: 'Next Billing',
      value: daysUntilExpiry > 0 ? `${daysUntilExpiry} days` : 'Expired',
      subtitle: price,
      icon: TrendingUp,
      color: daysUntilExpiry > 7 ? 'text-green-600' : daysUntilExpiry > 0 ? 'text-orange-600' : 'text-red-600',
      bgColor: daysUntilExpiry > 7 ? 'bg-green-50' : daysUntilExpiry > 0 ? 'bg-orange-50' : 'bg-red-50',
      badge: daysUntilExpiry > 7 ? (
        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          Current
        </Badge>
      ) : daysUntilExpiry > 0 ? (
        <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
          Due Soon
        </Badge>
      ) : (
        <Badge variant="destructive">Expired</Badge>
      )
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <GlassCard key={index} variant="secondary" size="sm" depth="low" glow="subtle" interactive="hover">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-lg ${stat.bgColor} dark:bg-slate-800`}>
                    <Icon className={`h-4 w-4 ${stat.color} dark:text-slate-400`} />
                  </div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {stat.title}
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {stat.value}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">
                    {stat.subtitle}
                  </p>
                </div>
              </div>
              <div>
                {stat.badge}
              </div>
            </div>
          </GlassCard>
        )
      })}
    </div>
  )
} 