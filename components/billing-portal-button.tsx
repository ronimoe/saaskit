'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { CreditCard, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface BillingPortalButtonProps {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
  showIcon?: boolean;
}

export function BillingPortalButton({
  variant = 'default',
  size = 'default',
  className,
  children,
  showIcon = true,
}: BillingPortalButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handlePortalAccess = async () => {
    try {
      setIsLoading(true);

      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        toast.error('Please sign in to manage your billing');
        router.push('/login');
        return;
      }

      console.log('[PORTAL BUTTON] Initiating portal session for user:', user.id);

      // Call the portal API
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to access billing portal');
      }

      if (!data.success || !data.url) {
        throw new Error('Invalid response from billing portal');
      }

      console.log('[PORTAL BUTTON] Redirecting to portal:', data.sessionId);

      // Redirect to Stripe Customer Portal
      window.location.href = data.url;

    } catch (error) {
      console.error('[PORTAL BUTTON] Error accessing portal:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to access billing portal';
      
      if (errorMessage.includes('No billing account found')) {
        toast.error('No billing account found. Please create a subscription first.');
        router.push('/pricing');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePortalAccess}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        showIcon && <CreditCard className="h-4 w-4" />
      )}
      <span className={showIcon ? 'ml-2' : ''}>
        {children || 'Manage Billing'}
      </span>
      {!isLoading && showIcon && <ExternalLink className="h-4 w-4 ml-2" />}
    </Button>
  );
} 