import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe-server'
import { getCustomerByUserId } from '@/lib/customer-service'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required field: userId' },
        { status: 400 }
      )
    }

    console.log(`[PAYMENT_HISTORY] Fetching payment history for user: ${userId}`)

    // Get user's Stripe customer ID
    const customerResult = await getCustomerByUserId(userId)
    
    if (!customerResult.success || !customerResult.stripeCustomerId) {
      console.log('[PAYMENT_HISTORY] No Stripe customer found for user:', userId)
      return NextResponse.json({
        success: true,
        payments: []
      })
    }

    const stripeCustomerId = customerResult.stripeCustomerId
    console.log(`[PAYMENT_HISTORY] Found customer: ${stripeCustomerId} for user: ${userId}`)

    // Fetch payment intents for this customer
    const paymentIntents = await stripe.paymentIntents.list({
      customer: stripeCustomerId,
      limit: 50, // Limit to last 50 payments
    })

    // Format payment data
    const payments = paymentIntents.data.map((payment) => ({
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      created: payment.created,
      invoice_id: payment.metadata?.invoice_id || null,
      description: payment.description,
    }))

    // If we have invoice IDs, fetch the invoice URLs
    const paymentsWithInvoices = await Promise.all(
      payments.map(async (payment) => {
        if (payment.invoice_id) {
          try {
            const invoice = await stripe.invoices.retrieve(payment.invoice_id as string)
            return {
              ...payment,
              invoice_url: invoice.hosted_invoice_url || invoice.invoice_pdf,
            }
          } catch (error) {
            console.error(`[PAYMENT_HISTORY] Error fetching invoice ${payment.invoice_id}:`, error)
            return payment
          }
        }
        return payment
      })
    )

    console.log(`[PAYMENT_HISTORY] Found ${paymentsWithInvoices.length} payments for customer: ${stripeCustomerId}`)

    return NextResponse.json({
      success: true,
      payments: paymentsWithInvoices,
    })

  } catch (error) {
    console.error('[PAYMENT_HISTORY] Error fetching payment history:', error)
    
    return NextResponse.json(
      { error: 'Failed to fetch payment history' },
      { status: 500 }
    )
  }
} 