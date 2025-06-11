'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { getStripe } from '@/lib/stripe-client';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface CheckoutButtonProps {
  priceId: string;
  planName: string;
  isPopular?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export default function CheckoutButton({ 
  priceId, 
  planName, 
  isPopular = false, 
  className = '',
  children 
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      // Redirect to login if not authenticated
      if (!user) {
        router.push('/login?redirect=/pricing');
        return;
      }

      // Prepare checkout data with user information
      const checkoutData = {
        priceId,
        userId: user.id,
        userEmail: user.email,
        fullName: user.user_metadata?.full_name || user.user_metadata?.name || undefined
      };

      console.log('[CHECKOUT BUTTON] Starting checkout with data:', {
        priceId,
        userId: user.id,
        hasEmail: !!user.email,
        hasFullName: !!checkoutData.fullName
      });

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
        customerId,
        hasUrl: !!url
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
    }
  };

  const defaultClassName = `w-full ${
    isPopular 
      ? 'bg-purple-600 hover:bg-purple-700' 
      : 'bg-gray-900 hover:bg-gray-800'
  } text-white`;

  return (
    <div className="space-y-2">
      <Button 
        onClick={handleCheckout}
        disabled={isLoading}
        className={className || defaultClassName}
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Starting checkout...
          </>
        ) : (
          children || `Subscribe to ${planName}`
        )}
      </Button>
      
      {error && (
        <p className="text-sm text-red-600 text-center">
          {error}
        </p>
      )}
    </div>
  );
} 