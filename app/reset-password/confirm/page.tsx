import { Metadata } from 'next';
import { Suspense } from 'react';
import { PasswordResetConfirmForm } from '@/components/auth/password-reset-confirm-form';

export const metadata: Metadata = {
  title: 'Set New Password',
  description: 'Set your new password to complete the reset process.',
};

export default function PasswordResetConfirmPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background with modern gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950 login-gradient-bg" />
      
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10 login-slide-in">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg login-icon-bounce login-pulse-glow">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-sm"></div>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
              Set New Password
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Choose a new password for your account
            </p>
          </div>
        </div>

        {/* Password Reset Confirm Form */}
        <Suspense fallback={<div className="animate-pulse bg-white/10 rounded-xl h-64" />}>
          <PasswordResetConfirmForm />
        </Suspense>

        {/* Trust indicators */}
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Protected by enterprise-grade security
          </p>
          <div className="flex justify-center space-x-4 mt-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-100"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-200"></div>
          </div>
        </div>
      </div>
    </div>
  );
} 