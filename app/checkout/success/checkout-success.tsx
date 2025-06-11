'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SubscriptionData {
  planName: string;
  status: string;
  priceId: string;
  currentPeriodEnd: string;
}

export default function CheckoutSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyCheckout = async () => {
      if (!sessionId) {
        setError('No session ID provided');
        setIsLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push('/login');
          return;
        }

        // Call API to verify the checkout session
        const response = await fetch('/api/stripe/checkout/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId, userId: user.id }),
        });

        if (!response.ok) {
          throw new Error('Failed to verify checkout session');
        }

        const data = await response.json();
        setSubscription(data.subscription);
      } catch (err) {
        console.error('Error verifying checkout:', err);
        setError('Failed to verify your subscription. Please contact support if you were charged.');
      } finally {
        setIsLoading(false);
      }
    };

    verifyCheckout();
  }, [sessionId, router]);

  if (isLoading) {
    return (
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-600" />
        <h1 className="text-2xl font-bold mb-2">Processing your subscription...</h1>
        <p className="text-gray-600">Please wait while we confirm your subscription.</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Subscription Verification Failed</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              If you were charged, please contact our support team with your session ID: 
              <code className="bg-gray-100 px-2 py-1 rounded text-xs ml-1">{sessionId}</code>
            </p>
            <div className="flex gap-2">
              <Button onClick={() => router.push('/profile')} variant="outline">
                Go to Profile
              </Button>
              <Button onClick={() => router.push('/pricing')}>
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card className="border-yellow-200">
        <CardHeader>
          <CardTitle className="text-yellow-600">Subscription Not Found</CardTitle>
          <CardDescription>
            We couldn't find your subscription details. This might be a temporary issue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button onClick={() => window.location.reload()} variant="outline">
              Refresh Page
            </Button>
            <Button onClick={() => router.push('/profile')}>
              Go to Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="text-center space-y-6">
      {/* Success Icon */}
      <div className="flex justify-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
      </div>

      {/* Success Message */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Welcome to {subscription.planName}!</h1>
        <p className="text-lg text-gray-600">
          Your subscription has been successfully activated.
        </p>
      </div>

      {/* Subscription Details */}
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-lg">Subscription Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Plan:</span>
            <span className="font-medium">{subscription.planName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <span className="font-medium capitalize text-green-600">{subscription.status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Next billing:</span>
            <span className="font-medium">
              {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <div className="space-y-4">
        <p className="text-gray-600">
          You can now access all features included in your plan.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => router.push('/profile')} className="flex items-center gap-2">
            Go to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button onClick={() => router.push('/profile')} variant="outline">
            Manage Subscription
          </Button>
        </div>
      </div>

      {/* Additional Info */}
      <div className="text-sm text-gray-500 space-y-1">
        <p>You'll receive an email confirmation shortly.</p>
        <p>Questions? Contact our support team anytime.</p>
      </div>
    </div>
  );
} 