import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { ProfileCompletionForm } from '@/components/auth/profile-completion-form';
import { UnifiedHeader } from '@/components/layout/unified-header';
import { GlassCard } from '@/components/ui/glass-card';
import { Skeleton } from '@/components/ui/skeleton';

// Export the content component for testing
export async function ProfileSetupContent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Check if profile already exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  // If profile exists, redirect to main profile page
  if (existingProfile) {
    redirect('/profile');
  }

  // Extract available data from OAuth provider
  const oauthData = {
    email: user.email || '',
    full_name: user.user_metadata?.full_name || '',
    avatar_url: user.user_metadata?.avatar_url || '',
    provider: user.app_metadata?.provider || 'email',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <UnifiedHeader variant="auth" />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          {/* Welcome Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome to SaaS Kit! 🎉
            </h1>
            <p className="text-lg text-muted-foreground">
              Let&apos;s complete your profile to get you started
            </p>
            {oauthData.provider !== 'email' && (
              <p className="text-sm text-muted-foreground">
                We&apos;ve imported some information from {oauthData.provider === 'google' ? 'Google' : oauthData.provider}, 
                but you can customize it below.
              </p>
            )}
          </div>

          {/* Profile Completion Form */}
          <GlassCard variant="primary" size="xl" depth="medium" glow="medium">
            <ProfileCompletionForm 
              user={user}
              oauthData={oauthData}
            />
          </GlassCard>

          {/* Help Text */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t worry, you can always update this information later in your profile settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileSetupSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <UnifiedHeader variant="auth" />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="text-center space-y-4">
            <Skeleton className="h-9 w-64 mx-auto" />
            <Skeleton className="h-6 w-80 mx-auto" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>

          {/* Form Skeleton */}
          <GlassCard variant="primary" size="xl" depth="medium" glow="medium">
            <div className="space-y-6">
              <div className="space-y-4">
                <Skeleton className="h-6 w-48" />
                <div className="grid gap-4 md:grid-cols-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="space-y-3">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                      <Skeleton className="h-6 w-12" />
                    </div>
                  ))}
                </div>
              </div>
              
              <Skeleton className="h-12 w-full" />
            </div>
          </GlassCard>

          <div className="text-center">
            <Skeleton className="h-4 w-80 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfileSetupPage() {
  return (
    <Suspense fallback={<ProfileSetupSkeleton />}>
      <ProfileSetupContent />
    </Suspense>
  );
} 