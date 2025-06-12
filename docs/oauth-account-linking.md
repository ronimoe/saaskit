# OAuth Account Linking & Feature Flags System

## Overview

The OAuth Account Linking system provides a secure way to merge Google OAuth accounts with existing email/password accounts, while the Feature Flags system allows granular control over OAuth functionality. This system ensures users can maintain a single account while using multiple authentication methods.

## Table of Contents

1. [Account Linking System](#account-linking-system)
2. [Feature Flags System](#feature-flags-system)
3. [User Flow](#user-flow)
4. [API Reference](#api-reference)
5. [Security Features](#security-features)
6. [Testing](#testing)
7. [Configuration](#configuration)
8. [Troubleshooting](#troubleshooting)

## Account Linking System

### Core Concept

When a user attempts to sign up with Google OAuth using an email that already exists as an email/password account, the system detects this conflict and provides a secure linking flow to merge the accounts.

### Key Components

#### 1. Account Linking Utilities (`lib/account-linking.ts`)

```typescript
// Check if OAuth sign-in conflicts with existing accounts
const result = await checkAccountLinking('user@example.com', 'google');

// Securely link OAuth account to existing account
const linkResult = await linkOAuthToExistingAccount(
  'existing-user-id',
  'oauth-user-id',
  'google'
);

// Generate secure linking token
const token = generateLinkingToken('user@example.com', 'google');

// Verify linking token
const verified = verifyLinkingToken(token);
```

#### 2. Account Linking Form (`components/auth/account-linking-form.tsx`)

Interactive component that handles the user confirmation and linking process:

- Pre-populated account details
- Clear explanation of the linking process
- Loading states during linking
- Error handling and recovery
- Success confirmation

#### 3. Account Linking API (`app/api/auth/link-account/route.ts`)

Secure API endpoint that handles:
- Token verification
- User authentication validation
- Account merging operations
- Error handling and logging

### Account Linking Flow

```mermaid
graph TD
    A[User clicks "Sign in with Google"] --> B[OAuth Authentication]
    B --> C[Check for existing email account]
    C --> D{Email exists?}
    D -->|No| E[Create new account]
    D -->|Yes| F[Generate linking token]
    F --> G[Redirect to linking page]
    G --> H[User confirms linking]
    H --> I[Merge accounts securely]
    I --> J[Redirect to dashboard]
```

## Feature Flags System

### Core Concept

The feature flags system provides granular control over OAuth functionality using the existing `lib/env.ts` infrastructure, ensuring OAuth features can be enabled/disabled based on environment and configuration.

### Feature Flag Configuration

#### Environment Variables

```bash
# Enable/disable social authentication
NEXT_PUBLIC_ENABLE_SOCIAL_AUTH=true

# Google OAuth credentials
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Service role key for account linking
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### Feature Flag Usage

```typescript
import { features, services } from '@/lib/env';

// Check if social auth is enabled and configured
if (features.socialAuth && services.hasGoogleAuth) {
  // Show OAuth buttons
}

// Check if account linking is available
if (isAccountLinkingEnabled()) {
  // Enable account linking functionality
}
```

### Feature Flag Validation

The system validates both client and server-side:

1. **Client-side**: OAuth buttons only render when feature flags are enabled
2. **Server-side**: API routes validate feature availability before processing
3. **Configuration**: Ensures required environment variables are present

## User Flow

### New User with Google OAuth

1. User clicks "Continue with Google"
2. Google OAuth authentication
3. Account created automatically
4. Redirect to profile completion (if needed)
5. Access granted to application

### Existing User Account Linking

1. User with existing email/password account tries Google OAuth
2. System detects email conflict
3. User redirected to account linking confirmation
4. User reviews account details and confirms linking
5. Accounts merged securely
6. User can now sign in with either method

### Account Linking Confirmation Page

The linking page (`/auth/link-account`) provides:

- Clear explanation of what will happen
- Account details display (email, provider)
- Confirmation and cancel options
- Security information about the process

## API Reference

### Account Linking API Endpoints

#### POST `/api/auth/link-account`

**Check Account Linking**
```typescript
{
  "action": "check",
  "email": "user@example.com",
  "provider": "google"
}
```

**Link Accounts**
```typescript
{
  "action": "link",
  "token": "secure-linking-token",
  "oauthUserId": "oauth-user-id"
}
```

### Response Format

```typescript
interface LinkingResponse {
  success: boolean;
  error?: string;
  needsLinking?: boolean;
  message?: string;
}
```

## Security Features

### Token-Based Linking

- **Secure Tokens**: Base64-encoded with timestamp validation
- **Expiration**: 10-minute token lifetime
- **Single Use**: Tokens are invalidated after use

### Validation Layers

1. **Server-side Authentication**: User must be authenticated
2. **Token Verification**: Secure token validation with expiration
3. **Email Verification**: Ensures email matches between accounts
4. **Service Role Validation**: Requires proper Supabase permissions

### Data Protection

- **No Information Leakage**: Error messages don't reveal account existence
- **Audit Logging**: All linking attempts are logged
- **Secure Deletion**: OAuth user account properly cleaned up after linking

## Testing

### Test Coverage

The system includes comprehensive tests:

#### Account Linking Utilities Tests (`lib/__tests__/account-linking.test.ts`)
- Account conflict detection
- Token generation and verification
- Feature flag validation
- Error handling scenarios

#### Account Linking Form Tests (`components/auth/__tests__/account-linking-form.test.tsx`)
- Component rendering
- User interactions
- API integration
- Loading and error states
- Success flows

### Running Tests

```bash
# Run account linking tests
npm test -- --testPathPattern="account-linking"

# Run all OAuth-related tests
npm test -- --testPathPattern="oauth"
```

## Configuration

### Required Environment Variables

```bash
# OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Feature Flags
NEXT_PUBLIC_ENABLE_SOCIAL_AUTH=true

# Supabase Configuration
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_URL=your-supabase-url
```

### Google Cloud Console Setup

1. Create OAuth 2.0 credentials
2. Configure authorized redirect URIs:
   - `https://your-supabase-project.supabase.co/auth/v1/callback`
3. Set up OAuth consent screen
4. Add required scopes: `email`, `profile`, `openid`

### Supabase Configuration

1. Enable Google provider in Authentication settings
2. Add Google Client ID and Secret
3. Configure redirect URLs
4. Ensure service role key has admin permissions

## Troubleshooting

### Common Issues

#### OAuth Buttons Not Showing
- Check `NEXT_PUBLIC_ENABLE_SOCIAL_AUTH` environment variable
- Verify Google OAuth credentials are configured
- Ensure `features.socialAuth` and `services.hasGoogleAuth` return true

#### Account Linking Fails
- Verify `SUPABASE_SERVICE_ROLE_KEY` is configured
- Check token expiration (10-minute limit)
- Ensure user is authenticated before linking

#### Redirect Issues
- Verify Google Cloud Console redirect URIs match Supabase URLs
- Check for trailing slashes in URLs
- Ensure HTTPS in production

### Debug Information

Enable debug logging by checking:
- Browser console for client-side errors
- Server logs for API errors
- Supabase Auth logs for OAuth issues

### Error Messages

The system provides user-friendly error messages:
- "Account linking is temporarily unavailable"
- "The linking request has expired"
- "Unable to link accounts at this time"

## Best Practices

### Security
- Always validate tokens server-side
- Use HTTPS in production
- Implement proper CSRF protection
- Log security events for monitoring

### User Experience
- Provide clear explanations of the linking process
- Show loading states during operations
- Offer fallback authentication methods
- Handle errors gracefully with recovery options

### Development
- Test with multiple email providers
- Verify feature flags work across environments
- Test token expiration scenarios
- Validate error handling paths

## Integration with Existing Systems

### Authentication Flow
- Integrates with existing Supabase Auth
- Works with current customer/profile creation
- Maintains existing session management

### Database Schema
- No additional tables required
- Uses existing user metadata
- Leverages Supabase's built-in OAuth support

### UI Components
- Follows existing design system
- Uses established component patterns
- Maintains accessibility standards

This system provides a robust, secure, and user-friendly way to handle OAuth account linking while maintaining full control through feature flags. 