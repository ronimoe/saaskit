import { Suspense } from 'react'
import { createClient } from '@/utils/supabase/server'
import { ProfileForm } from '@/components/profile-form'
import { ProfileHeader } from '@/components/profile-header'
import { ProfileStats } from '@/components/profile-stats'
import { Card } from '@/components/ui/card'
import { GlassCard } from '@/components/ui/glass-card'
import { Skeleton } from '@/components/ui/skeleton'
import { UnifiedHeader } from '@/components/layout/unified-header'
import { DashboardLayout } from '@/components/layout'
import { redirect } from 'next/navigation'
import type { Profile, Subscription } from '@/types/database'

async function getProfileData(userId: string) {
  const supabase = await createClient()
  
  // Get profile data
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (profileError) {
    console.error('Error fetching profile:', profileError)
    return { profile: null, subscriptions: [] }
  }

  // Get subscriptions
  const { data: subscriptions, error: subscriptionsError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (subscriptionsError) {
    console.error('Error fetching subscriptions:', subscriptionsError)
  }

  return {
    profile: profile as Profile,
    subscriptions: (subscriptions as Subscription[]) || []
  }
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <UnifiedHeader variant="app" />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid gap-6">
          {/* Header Skeleton */}
          <GlassCard variant="primary" size="lg" depth="medium" glow="subtle">
            <div className="flex items-start space-x-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </GlassCard>

          {/* Stats Skeleton */}
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <GlassCard key={i} variant="secondary" size="sm" depth="low" glow="none">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </GlassCard>
            ))}
          </div>

          {/* Form Skeleton */}
          <GlassCard variant="primary" size="lg" depth="medium" glow="subtle">
            <Skeleton className="h-6 w-48 mb-6" />
            <div className="grid gap-4 md:grid-cols-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

async function ProfileContent() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { profile, subscriptions } = await getProfileData(user.id)

  if (!profile) {
    redirect('/auth/setup-profile')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <UnifiedHeader variant="app" />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid gap-6">
          {/* Profile Header */}
          <ProfileHeader profile={profile} />

          {/* Profile Stats */}
          <ProfileStats profile={profile} subscriptions={subscriptions} />

          {/* Profile Form */}
          <GlassCard variant="primary" size="xl" depth="medium" glow="medium">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Profile Settings</h2>
                <p className="text-muted-foreground">
                  Manage your account settings and preferences.
                </p>
              </div>
              <ProfileForm profile={profile} />
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileContent />
      </Suspense>
    </DashboardLayout>
  )
} 