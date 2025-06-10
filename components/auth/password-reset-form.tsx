'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import { passwordResetSchema, type PasswordResetFormData } from '@/lib/schemas/auth';
import { requestPasswordResetAction } from '@/app/actions/auth';

interface PasswordResetFormProps {
  title?: string;
  description?: string;
  showBackLink?: boolean;
}

export function PasswordResetForm({ 
  title = 'Reset your password',
  description = 'Enter your email address and we&apos;ll send you a link to reset your password',
  showBackLink = true 
}: PasswordResetFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [emailSent, setEmailSent] = useState(false);

  // Initialize form with React Hook Form and Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
    getValues,
  } = useForm<PasswordResetFormData>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      email: '',
    },
    mode: 'onBlur',
  });

  const onSubmit = async (data: PasswordResetFormData) => {
    startTransition(async () => {
      try {
        const result = await requestPasswordResetAction(data);

        if (!result.success) {
          // Handle field-specific errors
          if (result.errors) {
            Object.entries(result.errors).forEach(([field, messages]) => {
              setError(field as keyof PasswordResetFormData, {
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
        setEmailSent(true);
        
      } catch (error) {
        console.error('Password reset form error:', error);
        toast.error('An unexpected error occurred. Please try again.');
      }
    });
  };

  const handleSendAnother = () => {
    setEmailSent(false);
    reset();
  };

  const isLoading = isPending || isSubmitting;

  // Success state - show confirmation message
  if (emailSent) {
    return (
      <Card className="w-full max-w-md mx-auto border-white/10 backdrop-blur-md bg-white/10 dark:bg-white/5 shadow-2xl">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl font-bold text-center">Check your email</CardTitle>
                      <CardDescription className="text-center">
              We&apos;ve sent a password reset link to <strong>{getValues('email')}</strong>
            </CardDescription>
        </CardHeader>

        <CardContent className="p-8 space-y-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              If this email address is associated with an account, you&apos;ll receive a password reset link within a few minutes.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Didn&apos;t receive the email? Check your spam folder or try again.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3 px-8 pb-8">
          <Button
            type="button"
            variant="outline"
            onClick={handleSendAnother}
            className="w-full"
          >
            Send another email
          </Button>
          {showBackLink && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push('/login')}
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to sign in
            </Button>
          )}
        </CardFooter>
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
          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                autoComplete="email"
                disabled={isLoading}
                {...register('email')}
                className={`pl-10 h-12 bg-white/50 dark:bg-white/5 border-white/20 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 ${
                  errors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending reset link...
              </>
            ) : (
              'Send reset link'
            )}
          </Button>
        </form>
      </CardContent>

      {showBackLink && (
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
      )}
    </Card>
  );
}

// Minimal version for embedded use
export function PasswordResetFormMinimal({ 
  onSuccess, 
  className 
}: { 
  onSuccess?: () => void;
  className?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    getValues,
  } = useForm<PasswordResetFormData>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      email: '',
    },
    mode: 'onBlur',
  });

  const onSubmit = async (data: PasswordResetFormData) => {
    startTransition(async () => {
      try {
        const result = await requestPasswordResetAction(data);

        if (!result.success) {
          if (result.errors) {
            Object.entries(result.errors).forEach(([field, messages]) => {
              setError(field as keyof PasswordResetFormData, {
                type: 'server',
                message: messages[0],
              });
            });
          } else {
            toast.error(result.message);
          }
          return;
        }

        toast.success(result.message);
        setEmailSent(true);
        onSuccess?.();
        
      } catch (error) {
        console.error('Password reset form error:', error);
        toast.error('An unexpected error occurred. Please try again.');
      }
    });
  };

  const isLoading = isPending || isSubmitting;

  if (emailSent) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-center space-y-2">
          <p className="text-sm font-medium">Check your email</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
                          We&apos;ve sent a reset link to {getValues('email')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <Input
          type="email"
          placeholder="Enter your email"
          disabled={isLoading}
          {...register('email')}
          className={errors.email ? 'border-red-400' : ''}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          'Send reset link'
        )}
      </Button>
    </form>
  );
} 