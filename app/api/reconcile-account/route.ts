import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { reconcileGuestPayment, handleDuplicateEmailScenario } from '@/lib/account-reconciliation'
import { markSessionConsumed } from '@/lib/guest-session-manager'

interface ReconcileRequest {
  sessionId: string
  userEmail: string
  userId: string
  stripeCustomerId?: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { sessionId, userEmail, stripeCustomerId }: ReconcileRequest = await request.json()

    // Validate required fields
    if (!sessionId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId and userEmail' },
        { status: 400 }
      )
    }

    // Ensure email matches authenticated user
    if (user.email !== userEmail) {
      return NextResponse.json(
        { error: 'Email mismatch with authenticated user' },
        { status: 403 }
      )
    }

    console.log(`[RECONCILE API] Starting reconciliation for user: ${user.id}, session: ${sessionId}`)

    // Perform the reconciliation
    const result = await reconcileGuestPayment({
      sessionId,
      userEmail,
      userId: user.id,
      stripeCustomerId: stripeCustomerId || ''
    })

    if (!result.success) {
      // Handle specific error cases
      if (result.error?.includes('duplicate email') || result.error?.includes('Multiple accounts')) {
        // Try to handle duplicate email scenario
        const duplicateResult = await handleDuplicateEmailScenario(
          userEmail,
          user.id,
          sessionId
        )
        
        return NextResponse.json({
          success: false,
          message: duplicateResult.message,
          error: duplicateResult.error,
          requiresSupport: true
        }, { status: 409 })
      }

      return NextResponse.json({
        success: false,
        message: result.message || 'Failed to reconcile payment',
        error: result.error
      }, { status: 400 })
    }

    // Mark the guest session as consumed
    await markSessionConsumed(sessionId, user.id)
    
    console.log(`[RECONCILE API] Successfully reconciled payment for user: ${user.id}`)

    return NextResponse.json({
      success: true,
      message: result.message,
      profileId: result.profileId,
      subscriptionLinked: result.subscriptionLinked,
      operation: result.operation
    })

  } catch (error) {
    console.error('[RECONCILE API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error during reconciliation' },
      { status: 500 }
    )
  }
} 