import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@/lib/supabase';
import { verifyLinkingToken } from '@/lib/account-linking';
import { AccountLinkingForm } from '@/components/auth/account-linking-form';
import { GlassCard } from '@/components/ui/glass-card';

interface PageProps {
  searchParams: Promise<{
    token?: string;
    provider?: string;
    email?: string;
    message?: string;
  }>;
}

async function AccountLinkingContent({ searchParams }: PageProps) {
  const params = await searchParams;
  const { token, provider, email, message } = params;

  // Validate required parameters
  if (!token || !provider || !email) {
    redirect('/login?error=Invalid account linking request');
  }

  // Verify the linking token
  const tokenData = verifyLinkingToken(token);
  if (!tokenData) {
    redirect('/login?error=Invalid or expired linking token');
  }

  // Verify token data matches URL parameters
  if (tokenData.email !== email || tokenData.provider !== provider) {
    redirect('/login?error=Token data mismatch');
  }

  // Check if user is authenticated
  const supabase = await createServerComponentClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login?error=Authentication required for account linking');
  }

  // Verify the user's email matches the linking request
  if (user.email !== email) {
    redirect('/login?error=Email mismatch in linking request');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Link Your Accounts
          </h1>
          <p className="text-muted-foreground">
            Connect your {provider} account with your existing account
          </p>
        </div>

        <GlassCard className="p-6">
          <AccountLinkingForm
            token={token}
            provider={provider}
            email={email}
            userId={user.id}
            message={message}
          />
        </GlassCard>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            By linking your accounts, you&apos;ll be able to sign in using either method.
            Your existing data and settings will be preserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AccountLinkingPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <AccountLinkingContent searchParams={searchParams} />
    </Suspense>
  );
} 