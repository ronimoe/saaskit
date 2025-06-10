'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, UserPlus, Mail, Lock, Check, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

import { signupSchema, type SignupFormData } from '@/lib/schemas/auth';
import { signUpAction } from '@/app/actions/auth';
import { useAuth } from '@/lib/stores/auth-store';

interface SignupFormProps {
  redirectTo?: string;
  title?: string;
  description?: string;
  showLoginLink?: boolean;
}

// Password strength calculation
function calculatePasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: '' };
  
  let score = 0;
  
  // Length check
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 10;
  
  // Character variety checks
  if (/[a-z]/.test(password)) score += 20;
  if (/[A-Z]/.test(password)) score += 20;
  if (/[0-9]/.test(password)) score += 20;
  if (/[^A-Za-z0-9]/.test(password)) score += 10;
  
  if (score < 40) return { score, label: 'Weak', color: 'bg-red-500' };
  if (score < 70) return { score, label: 'Fair', color: 'bg-yellow-500' };
  if (score < 90) return { score, label: 'Good', color: 'bg-blue-500' };
  return { score, label: 'Strong', color: 'bg-green-500' };
}

export function SignupForm({ 
  redirectTo = '/profile',
  title = 'Create Account',
  description = 'Get started with your free account today',
  showLoginLink = true 
}: SignupFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { user } = useAuth();

  // Initialize form with React Hook Form and Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
    mode: 'onBlur',
  });

  // Watch password for strength indicator
  const password = watch('password');
  const confirmPassword = watch('confirmPassword');
  const passwordStrength = calculatePasswordStrength(password);

  // Redirect if already authenticated (after hooks initialization)
  if (user) {
    router.push(redirectTo);
    return null;
  }

  const onSubmit = async (data: SignupFormData) => {
    startTransition(async () => {
      try {
        const result = await signUpAction(data);

        if (!result.success) {
          // Handle field-specific errors
          if (result.errors) {
            Object.entries(result.errors).forEach(([field, messages]) => {
              setError(field as keyof SignupFormData, {
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
        
        // Redirect to login page with success message
        router.push('/login?message=Please check your email to confirm your account');
        
      } catch (error) {
        console.error('Signup form error:', error);
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
                placeholder="Choose a strong password"
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
            
            {/* Password Strength Indicator */}
            {password && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Password strength:</span>
                  <span className={`text-xs font-medium ${
                    passwordStrength.score < 40 ? 'text-red-500' :
                    passwordStrength.score < 70 ? 'text-yellow-500' :
                    passwordStrength.score < 90 ? 'text-blue-500' : 'text-green-500'
                  }`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <Progress 
                  value={passwordStrength.score} 
                  className="h-2"
                />
              </div>
            )}
            
            {errors.password && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
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
              
              {/* Password match indicator */}
              {confirmPassword && password && (
                <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                  {password === confirmPassword ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                </div>
              )}
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Terms and Conditions */}
          <div className="space-y-2">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                disabled={isLoading}
                {...register('terms')}
                className="mt-1"
              />
              <label htmlFor="terms" className="text-sm text-gray-700 dark:text-gray-300 leading-5">
                I agree to the{' '}
                <a 
                  href="/terms" 
                  target="_blank"
                  className="text-blue-600 hover:text-blue-500 underline"
                >
                  Terms of Service
                </a>{' '}
                and{' '}
                <a 
                  href="/privacy" 
                  target="_blank"
                  className="text-blue-600 hover:text-blue-500 underline"
                >
                  Privacy Policy
                </a>
              </label>
            </div>
            {errors.terms && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                {errors.terms.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Create Account
              </>
            )}
          </Button>
        </form>
      </CardContent>

      {showLoginLink && (
        <CardFooter className="flex flex-col space-y-4 pt-0 pb-8">
          <Separator className="bg-white/20" />
          <div className="text-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">Already have an account? </span>
            <a 
              href="/login"
              className="text-blue-600 hover:text-blue-500 font-medium transition-colors"
            >
              Sign in
            </a>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

// Minimal signup form for embedded use
export function SignupFormMinimal({ 
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
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    startTransition(async () => {
      try {
        const result = await signUpAction(data);

        if (!result.success) {
          if (result.errors) {
            Object.entries(result.errors).forEach(([field, messages]) => {
              setError(field as keyof SignupFormData, {
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
        console.error('Signup error:', error);
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
          {...register('email')}
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
          {...register('password')}
          disabled={isLoading}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 transform -translate-y-1/2"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      <div>
        <Input
          type="password"
          placeholder="Confirm Password"
          {...register('confirmPassword')}
          disabled={isLoading}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="terms-minimal" {...register('terms')} disabled={isLoading} />
        <label htmlFor="terms-minimal" className="text-sm">
          I agree to the terms
        </label>
        {errors.terms && (
          <p className="text-sm text-red-500">{errors.terms.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating...
          </>
        ) : (
          'Create Account'
        )}
      </Button>
    </form>
  );
} 