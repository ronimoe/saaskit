'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Lock, CheckCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import { passwordResetConfirmSchema, type PasswordResetConfirmFormData } from '@/lib/schemas/auth';
import { confirmPasswordResetAction } from '@/app/actions/auth';
import { createClientComponentClient } from '@/lib/supabase';

interface PasswordResetConfirmFormProps {
  title?: string;
  description?: string;
}

export function PasswordResetConfirmForm({ 
  title = 'Set your new password',
  description = 'Choose a secure password for your account'
}: PasswordResetConfirmFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const [passwordUpdated, setPasswordUpdated] = useState(false);

  // Initialize form with React Hook Form and Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
    watch,
  } = useForm<PasswordResetConfirmFormData>({
    resolver: zodResolver(passwordResetConfirmSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  });

  const password = watch('password');

  // Check for valid session/token on component mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const supabase = createClientComponentClient();
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Session check error:', error);
          setIsValidSession(false);
          return;
        }

        // Check if this is a password recovery session
        if (!session) {
          setIsValidSession(false);
          return;
        }

        setIsValidSession(true);
      } catch (error) {
        console.error('Session validation error:', error);
        setIsValidSession(false);
      }
    };

    checkSession();

    // Handle URL parameters for errors
    const error = searchParams.get('error');
    if (error) {
      toast.error(error);
      // Clean up URL parameters
      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams]);

  const onSubmit = async (data: PasswordResetConfirmFormData) => {
    startTransition(async () => {
      try {
        const result = await confirmPasswordResetAction(data);

        if (!result.success) {
          // Handle field-specific errors
          if (result.errors) {
            Object.entries(result.errors).forEach(([field, messages]) => {
              setError(field as keyof PasswordResetConfirmFormData, {
                type: 'server',
                message: messages[0],
              });
            });
          } else {
            // Show general error message
            toast.error(result.message);
          }
          return;
        }

        // Success
        toast.success(result.message);
        setPasswordUpdated(true);
        reset();
        
        // Redirect to login after a brief delay
        setTimeout(() => {
          router.push('/login?message=' + encodeURIComponent('Password updated successfully! Please sign in with your new password.'));
        }, 2000);
        
      } catch (error) {
        console.error('Password reset confirm form error:', error);
        toast.error('An unexpected error occurred. Please try again.');
      }
    });
  };

  const isLoading = isPending || isSubmitting;

  // Loading state while checking session
  if (isValidSession === null) {
    return (
      <Card className="w-full max-w-md mx-auto border-white/10 backdrop-blur-md bg-white/10 dark:bg-white/5 shadow-2xl">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Validating reset link...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Invalid session/token
  if (!isValidSession) {
    return (
      <Card className="w-full max-w-md mx-auto border-white/10 backdrop-blur-md bg-white/10 dark:bg-white/5 shadow-2xl">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl font-bold text-center text-red-500">Invalid Reset Link</CardTitle>
          <CardDescription className="text-center">
            This password reset link is invalid or has expired
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 space-y-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Password reset links expire after a short time for security. Please request a new reset link.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3 px-8 pb-8">
          <Button
            type="button"
            onClick={() => router.push('/reset-password')}
            className="w-full"
          >
            Request New Reset Link
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push('/login')}
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to sign in
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Success state - password updated
  if (passwordUpdated) {
    return (
      <Card className="w-full max-w-md mx-auto border-white/10 backdrop-blur-md bg-white/10 dark:bg-white/5 shadow-2xl">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl font-bold text-center text-green-500">Password Updated!</CardTitle>
          <CardDescription className="text-center">
            Your password has been successfully updated
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 space-y-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You can now sign in with your new password. Redirecting you to the login page...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto border-white/10 backdrop-blur-md bg-white/10 dark:bg-white/5 shadow-2xl">
      {title && (
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl font-bold text-center">{title}</CardTitle>
          {description && (
            <CardDescription className="text-center">
              {description}
            </CardDescription>
          )}
        </CardHeader>
      )}

      <CardContent className="p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your new password"
                autoComplete="new-password"
                disabled={isLoading}
                {...register('password')}
                className={`pl-10 pr-12 h-12 bg-white/50 dark:bg-white/5 border-white/20 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 ${
                  errors.password ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''
                }`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10 w-10 hover:bg-white/10"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                {errors.password.message}
              </p>
            )}
            
            {/* Password strength indicator */}
            {password && (
              <div className="space-y-1">
                <div className="text-xs text-gray-600 dark:text-gray-400">Password strength:</div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                  <div 
                    className={`h-1 rounded-full transition-all duration-300 ${
                      password.length >= 12 && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)
                        ? 'bg-green-500 w-full'
                        : password.length >= 8 && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)
                        ? 'bg-yellow-500 w-3/4'
                        : password.length >= 6
                        ? 'bg-red-500 w-1/2'
                        : 'bg-red-500 w-1/4'
                    }`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your new password"
                autoComplete="new-password"
                disabled={isLoading}
                {...register('confirmPassword')}
                className={`pl-10 pr-12 h-12 bg-white/50 dark:bg-white/5 border-white/20 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 ${
                  errors.confirmPassword ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''
                }`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10 w-10 hover:bg-white/10"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating password...
              </>
            ) : (
              'Update password'
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="px-8 pb-8">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push('/login')}
          className="w-full"
          disabled={isLoading}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to sign in
        </Button>
      </CardFooter>
    </Card>
  );
} 