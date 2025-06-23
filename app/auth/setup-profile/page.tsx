import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { ProfileCompletionForm } from '@/components/auth/profile-completion-form';
import { UnifiedHeader } from '@/components/layout/unified-header';
import { GlassCard } from '@/components/ui/glass-card';
import { Skeleton } from '@/components/ui/skeleton';

// Internal component for page content
async function ProfileSetupContent() {
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

  // If profile exists, redirect to dashboard
  if (existingProfile) {
    redirect('/dashboard');
  }

  // Extract available data from OAuth provider
  const oauthData = {
    email: user.email || '',
    full_name: user.user_metadata?.full_name || '',
    avatar_url: user.user_metadata?.avatar_url || '',
    provider: user.app_metadata?.provider || 'email',
  };

  return (
    <div className="container max-w-xl mx-auto px-4 py-8">
      <GlassCard className="p-8">
        <h1 className="text-2xl font-bold mb-6">Complete Your Profile</h1>
        <ProfileCompletionForm user={user} oauthData={oauthData} />
      </GlassCard>
    </div>
  );
}

export default async function ProfileSetupPage() {
  return (
    <>
      <UnifiedHeader variant="auth" />
      <Suspense fallback={<div className="container max-w-xl mx-auto px-4 py-8">
        <GlassCard className="p-8">
          <h1 className="text-2xl font-bold mb-6">Complete Your Profile</h1>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-2/3 mx-auto" />
          </div>
        </GlassCard>
      </div>}>
        <ProfileSetupContent />
      </Suspense>
    </>
  );
} 