import { Suspense } from 'react';
import { Metadata } from 'next';
import CheckoutSuccess from './checkout-success';

export const metadata: Metadata = {
  title: 'Checkout Success | SaaS Kit',
  description: 'Your subscription has been successfully created.',
};

export default function CheckoutSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <Suspense fallback={
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your subscription...</p>
        </div>
      }>
        <CheckoutSuccess />
      </Suspense>
    </div>
  );
} 