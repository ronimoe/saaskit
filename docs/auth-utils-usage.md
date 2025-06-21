# Authentication Utilities Usage Guide

This document provides comprehensive examples of how to use the new authentication utilities in the SaaS Kit project.

## Overview

The auth utilities (`lib/auth-utils.ts`) provide a centralized, type-safe interface for all authentication operations including:

- OAuth provider authentication (Google, GitHub)
- Session management and refresh
- Admin user management operations
- Profile management utilities
- Enhanced authentication status checks

## Basic Usage

### Import the utilities

```typescript
import authUtils, { 
  oauthUtils, 
  sessionUtils, 
  adminUtils, 
  profileUtils, 
  authStatusUtils 
} from '@/lib/auth-utils';

// Or import the unified export
import authUtils from '@/lib/auth-utils';
```

## OAuth Provider Authentication

### Check Available Providers

```typescript
'use client';

import { oauthUtils } from '@/lib/auth-utils';

function SocialLoginButtons() {
  const availableProviders = oauthUtils.getAvailableProviders();
  
  return (
    <div className="space-y-2">
      {availableProviders.includes('google') && (
        <GoogleLoginButton />
      )}
      {availableProviders.includes('github') && (
        <GitHubLoginButton />
      )}
    </div>
  );
}
```

### OAuth Sign In

```typescript
'use client';

import { createClientComponentClient } from '@/lib/supabase';
import { oauthUtils } from '@/lib/auth-utils';

function GoogleLoginButton() {
  const handleGoogleLogin = async () => {
    const supabase = createClientComponentClient();
    
    const result = await oauthUtils.signInWithGoogle(supabase, {
      redirectTo: 'https://yourapp.com/dashboard',
      scopes: 'openid email profile',
    });
    
    if (result.success && result.data?.url) {
      // Redirect to OAuth provider
      window.location.href = result.data.url;
    } else {
      console.error('OAuth sign in failed:', result.error);
    }
  };

  return (
    <button onClick={handleGoogleLogin}>
      Sign in with Google
    </button>
  );
}
```

### Generic OAuth Provider

```typescript
import { oauthUtils } from '@/lib/auth-utils';

async function signInWithProvider(provider: 'google' | 'github') {
  const supabase = createClientComponentClient();
  
  if (!oauthUtils.isProviderAvailable(provider)) {
    throw new Error(`${provider} OAuth is not configured`);
  }
  
  const result = await oauthUtils.signInWithProvider(supabase, provider);
  
  if (result.success) {
    window.location.href = result.data!.url;
  }
  
  return result;
}
```

## Session Management

### Manual Session Refresh

```typescript
import { createClientComponentClient } from '@/lib/supabase';
import { sessionUtils } from '@/lib/auth-utils';

async function refreshUserSession() {
  const supabase = createClientComponentClient();
  
  const result = await sessionUtils.refreshSession(supabase);
  
  if (result.success) {
    console.log('Session refreshed:', result.data);
  } else {
    console.error('Failed to refresh session:', result.error);
  }
}
```

### Check Session Status

```typescript
import { sessionUtils } from '@/lib/auth-utils';

function SessionStatus({ session }: { session: Session | null }) {
  const sessionInfo = sessionUtils.getSessionInfo(session);
  const isExpiringSoon = sessionUtils.isSessionExpired(session, 10); // 10 min buffer
  
  if (!sessionInfo.isValid) {
    return <div>Session expired</div>;
  }
  
  if (isExpiringSoon) {
    return (
      <div className="warning">
        Session expires in {Math.round(sessionInfo.timeUntilExpiry! / 60000)} minutes
      </div>
    );
  }
  
  return <div>Session valid</div>;
}
```

### Auto-refresh Session

```typescript
import { sessionUtils } from '@/lib/auth-utils';

async function ensureValidSession() {
  const supabase = createClientComponentClient();
  
  const result = await sessionUtils.ensureValidSession(supabase, 5);
  
  if (result.success) {
    // Session is valid or was successfully refreshed
    return result.data;
  } else {
    // Need to re-authenticate
    window.location.href = '/login';
  }
}
```

## Profile Management

### Update User Profile

```typescript
'use client';

import { createClientComponentClient } from '@/lib/supabase';
import { profileUtils } from '@/lib/auth-utils';

async function updateUserProfile(formData: {
  email?: string;
  name?: string;
  avatar_url?: string;
}) {
  const supabase = createClientComponentClient();
  
  const result = await profileUtils.updateProfile(supabase, {
    email: formData.email,
    userData: {
      name: formData.name,
      avatar_url: formData.avatar_url,
    },
  });
  
  if (result.success) {
    console.log('Profile updated:', result.data);
  } else {
    console.error('Profile update failed:', result.error);
  }
  
  return result;
}
```

### Get Current Profile

```typescript
import { profileUtils } from '@/lib/auth-utils';

async function getCurrentProfile() {
  const supabase = createClientComponentClient();
  
  const result = await profileUtils.getCurrentProfile(supabase);
  
  if (result.success) {
    return result.data; // User object
  } else {
    console.error('Failed to get profile:', result.error);
    return null;
  }
}
```

### Update Avatar

```typescript
async function updateUserAvatar(avatarUrl: string) {
  const supabase = createClientComponentClient();
  
  const result = await profileUtils.updateAvatar(supabase, avatarUrl);
  
  return result;
}
```

### Avatar Upload Component

For a complete avatar upload solution with file selection, validation, and progress tracking, use the `AvatarUpload` component:

```typescript
import { AvatarUpload } from '@/components/avatar-upload';

function ProfilePage({ profile }: { profile: Profile }) {
  const handleAvatarUpdate = (newAvatarUrl: string) => {
    // Handle avatar update (e.g., update local state)
    console.log('Avatar updated:', newAvatarUrl);
  };

  return (
    <div>
      <AvatarUpload
        currentAvatarUrl={profile.avatar_url}
        userDisplayName={profile.full_name || 'User'}
        userId={profile.user_id}
        onAvatarUpdate={handleAvatarUpdate}
      />
    </div>
  );
}
```

**Features:**
- File validation (JPEG, PNG, WebP, max 5MB)
- Real-time image preview
- Upload progress tracking
- Comprehensive error handling
- Immediate UI updates

## Admin User Management (Server-side only)

### Create User

```typescript
import { adminUtils } from '@/lib/auth-utils';

// In a server action or API route
async function createUser(userData: {
  email: string;
  password: string;
  name: string;
  role: string;
}) {
  const result = await adminUtils.createUser({
    email: userData.email,
    password: userData.password,
    userData: { name: userData.name },
    role: userData.role,
    emailConfirm: true, // Skip email confirmation
  });
  
  if (result.success) {
    console.log('User created:', result.data);
  } else {
    console.error('Failed to create user:', result.error);
  }
  
  return result;
}
```

### List Users with Pagination

```typescript
async function getUsers(page: number = 1, perPage: number = 50) {
  const result = await adminUtils.listUsers(page, perPage);
  
  if (result.success) {
    const { users, total, page: currentPage, perPage: pageSize } = result.data!;
    
    return {
      users,
      pagination: {
        total,
        currentPage,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }
  
  throw new Error(result.error || 'Failed to fetch users');
}
```

### Update User Role

```typescript
async function promoteUserToAdmin(userId: string) {
  const result = await adminUtils.updateUserRole(userId, 'admin');
  
  if (result.success) {
    console.log('User promoted to admin:', result.data);
  } else {
    console.error('Failed to promote user:', result.error);
  }
  
  return result;
}
```

### Delete User

```typescript
async function deleteUser(userId: string) {
  const result = await adminUtils.deleteUser(userId);
  
  if (result.success) {
    console.log('User deleted successfully');
  } else {
    console.error('Failed to delete user:', result.error);
  }
  
  return result;
}
```

## Authentication Status & Role Checking

### Comprehensive Auth Status

```typescript
import { authStatusUtils } from '@/lib/auth-utils';

async function getAuthStatus() {
  const supabase = createClientComponentClient();
  
  const status = await authStatusUtils.getAuthStatus(supabase);
  
  return {
    isAuthenticated: status.isAuthenticated,
    user: status.user,
    sessionExpiry: status.sessionInfo.expiresAt,
    timeUntilExpiry: status.sessionInfo.timeUntilExpiry,
    error: status.error,
  };
}
```

### Role-based Access Control

```typescript
import { authStatusUtils } from '@/lib/auth-utils';

function AdminPanel({ user }: { user: User | null }) {
  const isAdmin = authStatusUtils.hasRole(user, 'admin');
  
  if (!isAdmin) {
    return <div>Access denied</div>;
  }
  
  return (
    <div>
      <h1>Admin Panel</h1>
      {/* Admin content */}
    </div>
  );
}
```

### Resource Access Control

```typescript
function DocumentActions({ user, documentId }: { user: User | null; documentId: string }) {
  const canRead = authStatusUtils.canAccessResource(user, documentId, 'read');
  const canWrite = authStatusUtils.canAccessResource(user, documentId, 'write');
  const canDelete = authStatusUtils.canAccessResource(user, documentId, 'delete');
  
  return (
    <div>
      {canRead && <button>View</button>}
      {canWrite && <button>Edit</button>}
      {canDelete && <button>Delete</button>}
    </div>
  );
}
```

## Using the Unified Export

```typescript
import authUtils from '@/lib/auth-utils';

// Access all utilities through the unified export
async function comprehensiveAuthExample() {
  const supabase = authUtils.createClientForComponent();
  
  // OAuth
  const providers = authUtils.oauth.getAvailableProviders();
  
  // Session management
  const sessionResult = await authUtils.session.refreshSession(supabase);
  
  // Profile management
  const profileResult = await authUtils.profile.getCurrentProfile(supabase);
  
  // Auth status
  const status = await authUtils.status.getAuthStatus(supabase);
  
  // Original helpers are also available
  const user = await authUtils.getCurrentUser(supabase);
  
  return {
    providers,
    session: sessionResult.data,
    profile: profileResult.data,
    status,
    user,
  };
}
```

## Error Handling

All auth utility functions return a consistent `AuthResult<T>` type:

```typescript
interface AuthResult<T = any> {
  data: T | null;
  error: string | null;
  success: boolean;
}
```

### Example Error Handling

```typescript
async function handleAuthOperation() {
  const result = await authUtils.oauth.signInWithGoogle(supabase);
  
  if (result.success) {
    // Operation succeeded
    console.log('Success:', result.data);
  } else {
    // Operation failed
    console.error('Error:', result.error);
    
    // Handle specific error cases
    if (result.error?.includes('OAuth')) {
      // Handle OAuth-specific errors
    }
  }
}
```

## Integration with Existing Auth System

The new utilities are designed to work seamlessly with the existing authentication system:

```typescript
// Use with existing auth store
import { useAuthStore } from '@/lib/stores/auth-store';
import authUtils from '@/lib/auth-utils';

function useEnhancedAuth() {
  const { user, session } = useAuthStore();
  
  const refreshSession = async () => {
    const supabase = authUtils.createClientForComponent();
    return authUtils.session.refreshSession(supabase);
  };
  
  const updateProfile = async (updates: ProfileUpdateData) => {
    const supabase = authUtils.createClientForComponent();
    return authUtils.profile.updateProfile(supabase, updates);
  };
  
  return {
    user,
    session,
    refreshSession,
    updateProfile,
    hasRole: (role: string) => authUtils.status.hasRole(user, role),
  };
}
```

## Best Practices

1. **Error Handling**: Always check the `success` property of results
2. **Type Safety**: Use TypeScript interfaces for better type safety
3. **Server vs Client**: Use admin utilities only on the server side
4. **Session Management**: Monitor session expiry and refresh proactively
5. **Role Checking**: Use the built-in role utilities for consistent access control
6. **OAuth Configuration**: Ensure environment variables are properly set for OAuth providers

## Environment Configuration

Ensure these environment variables are set for OAuth support:

```env
# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# GitHub OAuth (optional)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Enable social auth
NEXT_PUBLIC_ENABLE_SOCIAL_AUTH=true
``` 