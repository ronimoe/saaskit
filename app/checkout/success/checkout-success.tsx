'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { CheckCircle, ArrowRight, Loader2, UserPlus, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface SubscriptionData {
  planName: string;
  status: string;
  priceId: string;
  currentPeriodEnd: string;
}

interface AccountStatus {
  hasExistingAccount: boolean;
  email: string;
  userId: string | null;
}

interface VerificationData {
  subscription: SubscriptionData;
  customer: {
    id: string;
    email?: string;
  };
  isGuest: boolean;
  accountStatus?: AccountStatus;
}

export default function CheckoutSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const sessionId = searchParams.get('session_id');
  const isGuest = searchParams.get('guest') === 'true';

  useEffect(() => {
    const verifyCheckout = async () => {
      if (!sessionId) {
        setError('No session ID provided');
        setIsLoading(false);
        return;
      }

      try {
        if (isGuest) {
          // Handle guest checkout verification
          const response = await fetch('/api/stripe/checkout/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              sessionId, 
              isGuest: true 
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to verify guest checkout session');
          }

          const data = await response.json();
          setVerificationData(data);
        } else {
          // Handle authenticated user checkout verification
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();

          if (!user) {
            router.push('/login');
            return;
          }

          const response = await fetch('/api/stripe/checkout/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              sessionId, 
              userId: user.id,
              isGuest: false 
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to verify checkout session');
          }

          const data = await response.json();
          setVerificationData(data);
        }
      } catch (err) {
        console.error('Error verifying checkout:', err);
        setError('Failed to verify your subscription. Please contact support if you were charged.');
      } finally {
        setIsLoading(false);
      }
    };

    verifyCheckout();
  }, [sessionId, isGuest, router]);

  const reconcilePayment = async () => {
    if (!sessionId || !verificationData?.customer.email) return;

    try {
      const response = await fetch('/api/reconcile-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          userEmail: verificationData.customer.email,
          stripeCustomerId: verificationData.customer.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Reconciliation failed:', errorData);
        // Don't fail the whole flow if reconciliation fails
        // The user can still access their account, and we can handle reconciliation later
      } else {
        const result = await response.json();
        console.log('Reconciliation successful:', result);
      }
    } catch (error) {
      console.error('Error during reconciliation:', error);
      // Don't fail the whole flow if reconciliation fails
    }
  };

  const handleCreateAccount = async () => {
    if (!verificationData?.customer.email || !password) return;
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsCreatingAccount(true);
    setError(null);

    try {
      const supabase = createClient();
      
      // Create new account
      const { data, error } = await supabase.auth.signUp({
        email: verificationData.customer.email,
        password: password,
      });

      if (error) throw error;

      if (data.user) {
        // Account created successfully, now reconcile the payment
        await reconcilePayment();
        router.push('/profile?welcome=true');
      }
    } catch (err) {
      console.error('Error creating account:', err);
      setError('Failed to create account. Please try again.');
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const handleSignIn = async () => {
    if (!verificationData?.customer.email || !password) return;

    setIsSigningIn(true);
    setError(null);

    try {
      const supabase = createClient();
      
      const { error } = await supabase.auth.signInWithPassword({
        email: verificationData.customer.email,
        password: password,
      });

      if (error) throw error;

      // Signed in successfully, now reconcile the payment
      await reconcilePayment();
      router.push('/profile');
    } catch (err) {
      console.error('Error signing in:', err);
      setError('Failed to sign in. Please check your password.');
    } finally {
      setIsSigningIn(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-600" data-testid="loading-spinner" />
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

  if (!verificationData || !verificationData.subscription) {
    return (
        <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Subscription Verification Failed</CardTitle>
          <CardDescription>Failed to verify your subscription. Please contact support if you were charged.</CardDescription>
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

  const { subscription, accountStatus } = verificationData;

  // Render different UI based on guest status and account detection
  if (verificationData.isGuest && accountStatus) {
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
          <h1 className="text-3xl font-bold text-gray-900">Payment Successful!</h1>
          <p className="text-lg text-gray-600">
            Your {subscription.planName} subscription has been activated.
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
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{accountStatus.email}</span>
            </div>
          </CardContent>
        </Card>

        {/* Account Status Based Actions */}
        {accountStatus.hasExistingAccount ? (
          // Existing User Flow
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <div className="flex items-center gap-2">
                <LogIn className="w-5 h-5 text-blue-600" />
                <CardTitle className="text-lg">Welcome Back!</CardTitle>
              </div>
              <CardDescription>
                We found an existing account with this email. Sign in to access your subscription.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showPasswordForm ? (
                <Button 
                  onClick={() => setShowPasswordForm(true)} 
                  className="w-full"
                >
                  Sign In to Your Account
                </Button>
              ) : (
                <div className="space-y-4">
                                     <div className="space-y-2">
                     <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Enter your password</label>
                     <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      disabled={isSigningIn}
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-red-600">{error}</p>
                  )}
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSignIn} 
                      disabled={isSigningIn || !password}
                      className="flex-1"
                    >
                      {isSigningIn ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <LogIn className="w-4 h-4 mr-2" />
                      )}
                      Sign In
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPassword('');
                        setError(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          // New User Flow
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-green-600" />
                <CardTitle className="text-lg">Complete Your Account</CardTitle>
              </div>
              <CardDescription>
                Create a password to secure your account and access your subscription.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showPasswordForm ? (
                <Button 
                  onClick={() => setShowPasswordForm(true)} 
                  className="w-full"
                >
                  Create Account
                </Button>
              ) : (
                <div className="space-y-4">
                                     <div className="space-y-2">
                     <label htmlFor="new-password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Create password</label>
                     <Input
                      id="new-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter a password (min 6 characters)"
                      disabled={isCreatingAccount}
                    />
                  </div>
                                     <div className="space-y-2">
                     <label htmlFor="confirm-password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Confirm password</label>
                     <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      disabled={isCreatingAccount}
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-red-600">{error}</p>
                  )}
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleCreateAccount} 
                      disabled={isCreatingAccount || !password || !confirmPassword}
                      className="flex-1"
                    >
                      {isCreatingAccount ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <UserPlus className="w-4 h-4 mr-2" />
                      )}
                      Create Account
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPassword('');
                        setConfirmPassword('');
                        setError(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Additional Info */}
        <div className="text-sm text-gray-500 space-y-1">
          <p>You&apos;ll receive an email confirmation shortly.</p>
          <p>Questions? Contact our support team anytime.</p>
        </div>
      </div>
    );
  }

  // Authenticated user success (existing flow)
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
        <p>You&apos;ll receive an email confirmation shortly.</p>
        <p>Questions? Contact our support team anytime.</p>
      </div>
    </div>
  );
} 