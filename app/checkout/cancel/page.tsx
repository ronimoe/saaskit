import { Metadata } from 'next';
import Link from 'next/link';
import { XCircle, ArrowLeft, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Checkout Cancelled | SaaS Kit',
  description: 'Your checkout process was cancelled.',
};

export default function CheckoutCancelPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="text-center space-y-6">
        {/* Cancel Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
            <XCircle className="w-12 h-12 text-gray-500" />
          </div>
        </div>

        {/* Cancel Message */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Checkout Cancelled</h1>
          <p className="text-lg text-gray-600">
            No worries! Your subscription was not created and you were not charged.
          </p>
        </div>

        {/* Information Card */}
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              What happened?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-left">
            <p className="text-sm text-gray-600">
              You cancelled the checkout process before completing your payment. 
              This is completely normal and happens for various reasons:
            </p>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Wanted to review plan features again</li>
              <li>Needed to check with your team</li>
              <li>Had questions about billing</li>
              <li>Simply changed your mind</li>
            </ul>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-4">
          <p className="text-gray-600">
            Ready to try again? You can restart the checkout process anytime.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="flex items-center gap-2">
              <Link href="/pricing">
                <ArrowLeft className="w-4 h-4" />
                Back to Pricing
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">
                Go Home
              </Link>
            </Button>
          </div>
        </div>

        {/* Support Info */}
        <div className="text-sm text-gray-500 space-y-2 border-t pt-6">
          <p className="font-medium">Need help choosing the right plan?</p>
          <p>
            Contact our sales team for personalized recommendations or if you have 
            questions about our features and pricing.
          </p>
          <div className="flex justify-center gap-4 mt-3">
            <Button asChild variant="link" size="sm">
              <Link href="/contact">Contact Sales</Link>
            </Button>
            <Button asChild variant="link" size="sm">
              <Link href="/docs">View Documentation</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 