import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe-server'

export async function POST(request: NextRequest) {
  try {
    const { invoiceId } = await request.json()

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Missing required field: invoiceId' },
        { status: 400 }
      )
    }

    console.log(`[INVOICE] Fetching invoice: ${invoiceId}`)

    // Retrieve the invoice from Stripe
    const invoice = await stripe.invoices.retrieve(invoiceId)

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Get the hosted invoice URL (for viewing) or PDF URL (for download)
    const invoiceUrl = invoice.hosted_invoice_url || invoice.invoice_pdf

    if (!invoiceUrl) {
      return NextResponse.json(
        { error: 'Invoice URL not available' },
        { status: 404 }
      )
    }

    console.log(`[INVOICE] Retrieved invoice URL for: ${invoiceId}`)

    return NextResponse.json({
      success: true,
      invoiceUrl,
      invoiceId: invoice.id,
      status: invoice.status,
    })

  } catch (error) {
    console.error('[INVOICE] Error fetching invoice:', error)
    
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    )
  }
} 