import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { 
  checkAccountLinking, 
  linkOAuthToExistingAccount, 
  verifyLinkingToken,
  isAccountLinkingEnabled 
} from '@/lib/account-linking';

export async function POST(request: NextRequest) {
  try {
    // Check if account linking is enabled
    if (!isAccountLinkingEnabled()) {
      return NextResponse.json(
        { error: 'Account linking is not available' },
        { status: 503 }
      );
    }

    const { action, ...data } = await request.json();

    switch (action) {
      case 'check':
        return handleCheckLinking(data);
      case 'link':
        return handleLinkAccounts(data);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Account linking API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleCheckLinking(data: {
  email: string;
  provider: string;
  userId?: string;
}) {
  const { email, provider, userId } = data;

  if (!email || !provider) {
    return NextResponse.json(
      { error: 'Email and provider are required' },
      { status: 400 }
    );
  }

  const result = await checkAccountLinking(email, provider, userId);
  
  return NextResponse.json({ result });
}

async function handleLinkAccounts(data: {
  token: string;
  oauthUserId: string;
  provider: string;
}) {
  const { token, oauthUserId, provider } = data;

  if (!token || !oauthUserId || !provider) {
    return NextResponse.json(
      { error: 'Token, OAuth user ID, and provider are required' },
      { status: 400 }
    );
  }

  // Verify the linking token
  const tokenData = verifyLinkingToken(token);
  if (!tokenData) {
    return NextResponse.json(
      { error: 'Invalid or expired linking token' },
      { status: 400 }
    );
  }

  // Get the current user session
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  // Verify the OAuth user ID matches the current session
  if (user.id !== oauthUserId) {
    return NextResponse.json(
      { error: 'User ID mismatch' },
      { status: 403 }
    );
  }

  // Check account linking again to get the existing user ID
  const linkingCheck = await checkAccountLinking(tokenData.email, tokenData.provider);
  
  if (!linkingCheck.needsLinking || !linkingCheck.existingUserId) {
    return NextResponse.json(
      { error: 'Account linking not required or existing user not found' },
      { status: 400 }
    );
  }

  // Perform the account linking
  const linkResult = await linkOAuthToExistingAccount(
    linkingCheck.existingUserId,
    user,
    provider
  );

  if (!linkResult.success) {
    return NextResponse.json(
      { error: linkResult.error || 'Failed to link accounts' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    linkedUserId: linkResult.linkedUserId,
    message: 'Accounts linked successfully'
  });
} 