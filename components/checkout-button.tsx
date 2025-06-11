'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { getStripe } from '@/lib/stripe-client';
import { Button } from '@/components/ui/button';
import { Loader2, UserPlus } from 'lucide-react';

interface CheckoutButtonProps {
  priceId: string;
  planName: string;
  isPopular?: boolean;
  className?: string;
  children?: React.ReactNode;
  enableGuestCheckout?: boolean;
}

export default function CheckoutButton({ 
  priceId, 
  planName, 
  isPopular = false, 
  className = '',
  children,
  enableGuestCheckout = true
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setCheckingAuth(true);

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      setCheckingAuth(false);

      let checkoutData;

      if (user) {
        // Authenticated user checkout
        checkoutData = {
          priceId,
          userId: user.id,
          userEmail: user.email,
          fullName: user.user_metadata?.full_name || user.user_metadata?.name || undefined,
          isGuest: false
        };

        console.log('[CHECKOUT BUTTON] Starting authenticated checkout:', {
          priceId,
          userId: user.id,
          hasEmail: !!user.email,
          hasFullName: !!checkoutData.fullName
        });
      } else {
        // Guest checkout (no authentication required)
        if (!enableGuestCheckout) {
          router.push('/login?redirect=/pricing');
          return;
        }

        checkoutData = {
          priceId,
          isGuest: true,
          planName
        };

        console.log('[CHECKOUT BUTTON] Starting guest checkout:', {
          priceId,
          planName,
          isGuest: true
        });
      }

      // Create checkout session
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { sessionId, url, customerId } = await response.json();

      console.log('[CHECKOUT BUTTON] Checkout session created:', {
        sessionId,
        customerId: customerId || 'guest',
        hasUrl: !!url,
        isGuest: !user
      });

      if (url) {
        // Redirect directly to Stripe Checkout
        window.location.href = url;
      } else if (sessionId) {
        // Fallback: use Stripe.js to redirect
        const stripe = await getStripe();
        if (!stripe) {
          throw new Error('Failed to load Stripe');
        }

        const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });
        
        if (stripeError) {
          throw new Error(stripeError.message);
        }
      } else {
        throw new Error('No checkout URL or session ID received');
      }

    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start checkout');
    } finally {
      setIsLoading(false);
      setCheckingAuth(false);
    }
  };

  const defaultClassName = `w-full ${
    isPopular 
      ? 'bg-purple-600 hover:bg-purple-700' 
      : 'bg-gray-900 hover:bg-gray-800'
  } text-white`;

  // Show different text and icons based on loading state
  const getButtonContent = () => {
    if (isLoading) {
      if (checkingAuth) {
        return (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Checking account...
          </>
        );
      }
      return (
        <>
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Starting checkout...
        </>
      );
    }

    if (children) {
      return children;
    }

    // Default button content with guest checkout indication
    if (enableGuestCheckout) {
      return (
        <div className="flex items-center justify-center">
          <UserPlus className="w-4 h-4 mr-2" />
          Start Free Trial
        </div>
      );
    }

    return `Subscribe to ${planName}`;
  };

  return (
    <div className="space-y-2">
      <Button 
        onClick={handleCheckout}
        disabled={isLoading}
        className={className || defaultClassName}
        size="lg"
      >
        {getButtonContent()}
      </Button>
      
      {enableGuestCheckout && !isLoading && (
        <p className="text-xs text-gray-500 text-center">
          No account required • Create account after payment
        </p>
      )}
      
      {error && (
        <p className="text-sm text-red-600 text-center">
          {error}
        </p>
      )}
    </div>
  );
} 