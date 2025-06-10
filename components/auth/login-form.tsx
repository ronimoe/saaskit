'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, LogIn, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { loginSchema, type LoginFormData } from '@/lib/schemas/auth';
import { signInAction } from '@/app/actions/auth';
import { useAuth } from '@/lib/stores/auth-store';

interface LoginFormProps {
  redirectTo?: string;
  title?: string;
  description?: string;
  showSignupLink?: boolean;
}

export function LoginForm({ 
  redirectTo = '/profile',
  title = 'Welcome back',
  description = 'Sign in to your account to continue',
  showSignupLink = true 
}: LoginFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const { user } = useAuth();

  // Initialize form with React Hook Form and Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur',
  });

  // Redirect if already authenticated (after hooks initialization)
  if (user) {
    router.push(redirectTo);
    return null;
  }

  const onSubmit = async (data: LoginFormData) => {
    startTransition(async () => {
      try {
        const result = await signInAction(data);

        if (!result.success) {
          // Handle field-specific errors
          if (result.errors) {
            Object.entries(result.errors).forEach(([field, messages]) => {
              setError(field as keyof LoginFormData, {
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
        reset();
        
        // Redirect after successful login
        router.push(redirectTo);
        
      } catch (error) {
        console.error('Login form error:', error);
        toast.error('An unexpected error occurred. Please try again.');
      }
    });
  };

  const isLoading = isPending || isSubmitting;

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
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
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

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                autoComplete="current-password"
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
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Sign in
              </>
            )}
          </Button>
        </form>
      </CardContent>

      {showSignupLink && (
        <CardFooter className="flex flex-col space-y-4 pt-0 pb-8">
          <Separator className="bg-white/20" />
          <div className="flex flex-col space-y-3 text-center text-sm">
            <p className="text-gray-600 dark:text-gray-400">
              Don&apos;t have an account?{' '}
              <Button
                variant="link"
                className="p-0 h-auto font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                onClick={() => router.push('/signup')}
              >
                Sign up
              </Button>
            </p>
            <Button
              variant="link"
              className="p-0 h-auto text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
              onClick={() => router.push('/reset-password')}
            >
              Forgot your password?
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

/**
 * Minimal login form for embedding in other components
 */
export function LoginFormMinimal({ 
  onSuccess, 
  className 
}: { 
  onSuccess?: () => void;
  className?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    startTransition(async () => {
      try {
        const result = await signInAction(data);

        if (!result.success) {
          if (result.errors) {
            Object.entries(result.errors).forEach(([field, messages]) => {
              setError(field as keyof LoginFormData, {
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
        reset();
        onSuccess?.();
        
      } catch (error) {
        console.error('Login form error:', error);
        toast.error('An unexpected error occurred. Please try again.');
      }
    });
  };

  const isLoading = isPending || isSubmitting;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <Input
          type="email"
          placeholder="Email"
          autoComplete="email"
          disabled={isLoading}
          {...register('email')}
          className={errors.email ? 'border-destructive' : ''}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            autoComplete="current-password"
            disabled={isLoading}
            {...register('password')}
            className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign in'
        )}
      </Button>
    </form>
  );
} 