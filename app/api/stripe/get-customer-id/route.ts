import { NextRequest, NextResponse } from 'next/server';
import { getCustomerByUserId } from '@/lib/customer-service';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required field: userId' },
        { status: 400 }
      );
    }

    // Get user's Stripe customer ID
    const customerResult = await getCustomerByUserId(userId);
    
    if (!customerResult.success || !customerResult.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No customer found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      stripeCustomerId: customerResult.stripeCustomerId,
    });

  } catch (error) {
    console.error('[GET CUSTOMER ID] Error getting customer ID:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve customer ID' },
      { status: 500 }
    );
  }
} 