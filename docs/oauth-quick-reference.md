# OAuth Account Linking & Feature Flags - Quick Reference

## Quick Setup Checklist

### Environment Variables
```bash
# Required for OAuth functionality
NEXT_PUBLIC_ENABLE_SOCIAL_AUTH=true
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Feature Flag Check
```typescript
import { features, services } from '@/lib/env';

// Check if OAuth is available
const isOAuthEnabled = features.socialAuth && services.hasGoogleAuth;
```

## Common Code Patterns

### Adding OAuth Buttons to Forms
```typescript
import { OAuthButtons } from '@/components/auth/oauth-buttons';

export function LoginForm() {
  return (
    <div>
      <OAuthButtons />
      <OAuthDivider />
      {/* Your email/password form */}
    </div>
  );
}
```

### Checking Account Linking Status
```typescript
import { checkAccountLinking } from '@/lib/account-linking';

const result = await checkAccountLinking('user@example.com', 'google');
if (result.needsLinking) {
  // Redirect to linking page
  redirect(`/auth/link-account?token=${result.token}&...`);
}
```

### API Route with Feature Flag Validation
```typescript
import { isAccountLinkingEnabled } from '@/lib/account-linking';

export async function POST(request: NextRequest) {
  if (!isAccountLinkingEnabled()) {
    return NextResponse.json(
      { error: 'Account linking not available' },
      { status: 503 }
    );
  }
  // ... rest of handler
}
```

## User Flow Summary

### New OAuth User
1. Click "Continue with Google" → 2. OAuth auth → 3. Account created → 4. Profile setup → 5. Dashboard

### Account Linking
1. OAuth with existing email → 2. Conflict detected → 3. Linking page → 4. User confirms → 5. Accounts merged → 6. Dashboard

## Testing Commands

```bash
# Run OAuth-related tests
npm test -- --testPathPattern="oauth"

# Run account linking tests specifically
npm test -- --testPathPattern="account-linking"

# Run all auth tests
npm test -- --testPathPattern="auth"
```

## Troubleshooting Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| OAuth buttons not showing | Check `NEXT_PUBLIC_ENABLE_SOCIAL_AUTH=true` |
| Account linking fails | Verify `SUPABASE_SERVICE_ROLE_KEY` is set |
| Redirect errors | Check Google Cloud Console redirect URIs |
| Token expired | Tokens expire in 10 minutes - regenerate |

## Key Files Reference

| File | Purpose |
|------|---------|
| `lib/account-linking.ts` | Core linking utilities |
| `components/auth/oauth-buttons.tsx` | OAuth UI component |
| `components/auth/account-linking-form.tsx` | Linking confirmation UI |
| `app/api/auth/link-account/route.ts` | Linking API endpoint |
| `app/auth/link-account/page.tsx` | Linking confirmation page |
| `app/auth/callback/route.ts` | OAuth callback handler |

## Security Checklist

- ✅ Tokens expire in 10 minutes
- ✅ Server-side validation on all operations
- ✅ No information leakage in error messages
- ✅ Proper authentication checks
- ✅ Secure account merging process
- ✅ Audit logging for all operations

For detailed documentation, see [OAuth Account Linking & Feature Flags](./oauth-account-linking.md). 