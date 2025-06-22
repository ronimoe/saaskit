import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe-server'
import { getCustomerByUserId } from '@/lib/customer-service'

// GET billing address
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required field: userId' },
        { status: 400 }
      )
    }

    console.log(`[BILLING_ADDRESS] Fetching billing address for user: ${userId}`)

    // Get user's Stripe customer ID
    const customerResult = await getCustomerByUserId(userId)
    
    if (!customerResult.success || !customerResult.stripeCustomerId) {
      console.log('[BILLING_ADDRESS] No Stripe customer found for user:', userId)
      return NextResponse.json({
        success: true,
        address: null
      })
    }

    const stripeCustomerId = customerResult.stripeCustomerId
    console.log(`[BILLING_ADDRESS] Found customer: ${stripeCustomerId} for user: ${userId}`)

    // Retrieve customer from Stripe
    const customer = await stripe.customers.retrieve(stripeCustomerId)

    if (customer.deleted) {
      return NextResponse.json({
        success: true,
        address: null
      })
    }

    const address = customer.address

    console.log(`[BILLING_ADDRESS] Retrieved address for customer: ${stripeCustomerId}`)

    return NextResponse.json({
      success: true,
      address: address ? {
        line1: address.line1 || '',
        line2: address.line2 || '',
        city: address.city || '',
        state: address.state || '',
        postal_code: address.postal_code || '',
        country: address.country || 'US',
      } : null,
    })

  } catch (error) {
    console.error('[BILLING_ADDRESS] Error fetching billing address:', error)
    
    return NextResponse.json(
      { error: 'Failed to fetch billing address' },
      { status: 500 }
    )
  }
}

// UPDATE billing address
export async function PUT(request: NextRequest) {
  try {
    const { userId, address } = await request.json()

    if (!userId || !address) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, address' },
        { status: 400 }
      )
    }

    // Validate required address fields
    if (!address.line1 || !address.city || !address.state || !address.postal_code || !address.country) {
      return NextResponse.json(
        { error: 'Missing required address fields: line1, city, state, postal_code, country' },
        { status: 400 }
      )
    }

    console.log(`[BILLING_ADDRESS] Updating billing address for user: ${userId}`)

    // Get user's Stripe customer ID
    const customerResult = await getCustomerByUserId(userId)
    
    if (!customerResult.success || !customerResult.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No billing account found. Please create a subscription first.' },
        { status: 404 }
      )
    }

    const stripeCustomerId = customerResult.stripeCustomerId
    console.log(`[BILLING_ADDRESS] Found customer: ${stripeCustomerId} for user: ${userId}`)

    // Update customer address in Stripe
    const updatedCustomer = await stripe.customers.update(stripeCustomerId, {
      address: {
        line1: address.line1,
        line2: address.line2 || null,
        city: address.city,
        state: address.state,
        postal_code: address.postal_code,
        country: address.country,
      },
    })

    console.log(`[BILLING_ADDRESS] Updated address for customer: ${stripeCustomerId}`)

    return NextResponse.json({
      success: true,
      address: updatedCustomer.address,
    })

  } catch (error) {
    console.error('[BILLING_ADDRESS] Error updating billing address:', error)
    
    return NextResponse.json(
      { error: 'Failed to update billing address' },
      { status: 500 }
    )
  }
} 