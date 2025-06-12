'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Link, AlertTriangle, CheckCircle, User } from 'lucide-react';

interface AccountLinkingFormProps {
  token: string;
  provider: string;
  email: string;
  userId: string;
  message?: string;
}

export function AccountLinkingForm({
  token,
  provider,
  email,
  userId,
  message
}: AccountLinkingFormProps) {
  const [isLinking, setIsLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleLinkAccounts = async () => {
    try {
      setIsLinking(true);
      setError(null);

      const response = await fetch('/api/auth/link-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'link',
          token,
          oauthUserId: userId,
          provider,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to link accounts');
      }

      setSuccess(true);
      
      // Redirect to profile after successful linking
      setTimeout(() => {
        router.push('/profile?message=Accounts linked successfully! You can now sign in using either method.');
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to link accounts');
    } finally {
      setIsLinking(false);
    }
  };

  const handleCancel = () => {
    router.push('/login?message=Account linking cancelled');
  };

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-green-700">
            Accounts Linked Successfully!
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            You can now sign in using either your email/password or {provider} account.
            Redirecting to your profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Account linking explanation */}
      <div className="space-y-4">
        <Alert>
          <Link className="h-4 w-4" />
          <AlertDescription>
            {message || `An account with ${email} already exists. Would you like to link your ${provider} account?`}
          </AlertDescription>
        </Alert>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Linking your accounts will allow you to sign in using either your email/password or your {provider} account.
            Your existing data and settings will be preserved.
          </AlertDescription>
        </Alert>
      </div>

      {/* Account details */}
      <div className="rounded-lg border p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <User className="h-4 w-4" />
          Account Details
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Email:</span>
            <span className="font-medium">{email}</span>
          </div>
          <div className="flex justify-between">
            <span>Provider:</span>
            <span className="font-medium capitalize">{provider}</span>
          </div>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Action buttons */}
      <div className="flex flex-col gap-3">
        <Button
          onClick={handleLinkAccounts}
          disabled={isLinking}
          className="w-full"
        >
          {isLinking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Linking Accounts...
            </>
          ) : (
            <>
              <Link className="mr-2 h-4 w-4" />
              Link Accounts
            </>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={isLinking}
          className="w-full"
        >
          Cancel
        </Button>
      </div>

      {/* Additional info */}
      <div className="text-xs text-muted-foreground text-center">
        <p>
          This action will merge your {provider} account with your existing account.
          You'll be able to use both sign-in methods in the future.
        </p>
      </div>
    </div>
  );
} 