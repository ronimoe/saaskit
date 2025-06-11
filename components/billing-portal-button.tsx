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
        if (data.type === 'configuration_error') {
          throw new Error(`${data.error}. ${data.details || ''}`);
        }
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
      } else if (errorMessage.includes('Stripe Customer Portal is not configured')) {
        // Handle configuration error specifically
        toast.error('Stripe Customer Portal is not configured. Redirecting to Stripe dashboard instead.');
        
        // Optionally, if you're in development mode, show more details
        if (process.env.NODE_ENV === 'development') {
          console.warn('Developer Note: Configure the Stripe Customer Portal at https://dashboard.stripe.com/test/settings/billing/portal');
        }
        
        // Get user again for the fallback
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) return;
        
        // Try to get the Stripe customer ID and redirect to Stripe dashboard as fallback
        try {
          const customerResponse = await fetch('/api/stripe/get-customer-id', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id }),
          });
          
          const customerData = await customerResponse.json();
          
          if (customerResponse.ok && customerData.stripeCustomerId) {
            // Redirect to Stripe dashboard for this customer
            window.open(`https://dashboard.stripe.com/test/customers/${customerData.stripeCustomerId}`, '_blank');
          } else {
            // If we can't get customer ID, just redirect to Stripe dashboard
            window.open('https://dashboard.stripe.com/test/customers', '_blank');
          }
        } catch (fallbackError) {
          console.error('Error with fallback redirect:', fallbackError);
          window.open('https://dashboard.stripe.com/test', '_blank');
        }
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