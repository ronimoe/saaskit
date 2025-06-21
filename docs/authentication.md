# Authentication Implementation Guide

This guide documents the complete authentication system implementation in our SaaS Kit, built with Next.js 15, Supabase Auth, and TypeScript.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Components](#core-components)
3. [Client Configuration](#client-configuration)
4. [Authentication Store](#authentication-store)
5. [Forms & UI Components](#forms--ui-components)
6. [Server Actions](#server-actions)
7. [Middleware & Route Protection](#middleware--route-protection)
8. [Validation & Schemas](#validation--schemas)
9. [Error Handling](#error-handling)
10. [Testing](#testing)
11. [Environment Configuration](#environment-configuration)
12. [Database Schema](#database-schema)
13. [OAuth Integration](#oauth-integration)
14. [OAuth Account Linking & Feature Flags](./oauth-account-linking.md)
15. [Best Practices](#best-practices)

## Architecture Overview

Our authentication system follows a layered architecture:

```
┌─────────────────────────────────────────────────────────┐
│                    UI Components                        │
│  LoginForm | SignupForm | PasswordResetForm             │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────┐
│                 State Management                        │
│              Auth Store (Zustand)                       │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────┐
│                 Server Actions                          │
│     signInAction | signUpAction | resetPasswordAction   │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────┐
│                Auth Utilities                           │
│        Auth Helpers | OAuth Utils | Session Utils       │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────┐
│                Supabase Clients                         │
│   Client | Server | Route Handler | Middleware | Admin  │
└─────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Supabase Client Configuration

**File**: `lib/supabase.ts`

We provide multiple Supabase client configurations for different contexts:

```typescript
// Client-side operations (browser)
export const createClientComponentClient = (): SupabaseClient<Database> => {
  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }
  );
};

// Server-side operations (SSR/SSG)
export const createServerComponentClient = async (): Promise<SupabaseClient<Database>> => {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
};

// Route handlers
export const createRouteHandlerClient = (
  request: NextRequest
): SupabaseClient<Database> => {
  const cookies = new Map(request.cookies.getAll().map(({ name, value }) => [name, value]));
  
  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return Array.from(cookies.entries()).map(([name, value]) => ({ name, value }));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            cookies.set(name, value);
          });
        },
      },
    }
  );
};

// Middleware (for route protection)
export const createMiddlewareClient = (
  request: NextRequest
): { supabase: SupabaseClient<Database>; response: NextResponse } => {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  return { supabase, response };
};

// Admin operations (server-side only)
export const createAdminClient = (): SupabaseClient<Database> => {
  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};
```

### 2. Authentication Helpers

**File**: `lib/supabase.ts`

Reusable authentication operations:

```typescript
export const authHelpers = {
  signInWithPassword: async (
    supabase: SupabaseClient<Database>,
    email: string,
    password: string
  ) => {
    const response = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (response.error) {
      return {
        data: null,
        error: response.error.message || 'Sign in failed',
      };
    }

    return {
      data: response.data,
      error: null,
    };
  },

  signUpWithPassword: async (
    supabase: SupabaseClient<Database>,
    email: string,
    password: string,
    options?: {
      emailRedirectTo?: string;
      data?: Record<string, unknown>;
    }
  ) => {
    const response = await supabase.auth.signUp({
      email,
      password,
      options,
    });
    
    if (response.error) {
      return {
        data: null,
        error: response.error.message || 'Sign up failed',
      };
    }

    return {
      data: response.data,
      error: null,
    };
  },

  signOut: async (supabase: SupabaseClient<Database>) => {
    const { error } = await supabase.auth.signOut();
    return { error: error?.message || null };
  },

  resetPassword: async (
    supabase: SupabaseClient<Database>,
    email: string,
    redirectTo?: string
  ) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    return { error: error?.message || null };
  },

  updatePassword: async (
    supabase: SupabaseClient<Database>,
    newPassword: string
  ) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error: error?.message || null };
  },
};
```

## Authentication Store

**File**: `lib/stores/auth-store.ts`

Global state management using Zustand:

```typescript
interface AuthState {
  // State
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setInitialized: (initialized: boolean) => void;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      // Initial state
      user: null,
      session: null,
      isLoading: true,
      isInitialized: false,
      error: null,

      // Actions
      setUser: (user) => set({ user }, false, 'auth/setUser'),
      setSession: (session) => set({ session }, false, 'auth/setSession'),
      setLoading: (isLoading) => set({ isLoading }, false, 'auth/setLoading'),
      setError: (error) => set({ error }, false, 'auth/setError'),
      setInitialized: (isInitialized) => set({ isInitialized }, false, 'auth/setInitialized'),
      
      initialize: async () => {
        try {
          set({ isLoading: true, error: null }, false, 'auth/initialize/start');
          
          const supabase = createClientComponentClient();
          
          // Get initial session
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            throw sessionError;
          }

          set(
            {
              session,
              user: session?.user ?? null,
              isLoading: false,
              isInitialized: true,
              error: null
            },
            false,
            'auth/initialize/success'
          );

          // Set up auth state listener
          supabase.auth.onAuthStateChange(
            async (event, session) => {
              console.log('Auth state changed:', event, session?.user?.email);
              
              set(
                {
                  session,
                  user: session?.user ?? null,
                  isLoading: false,
                  error: null
                },
                false,
                `auth/stateChange/${event}`
              );
            }
          );
          
        } catch (error) {
          console.error('Auth initialization error:', error);
          set(
            {
              error: error instanceof Error ? error.message : 'Failed to initialize auth',
              isLoading: false,
              isInitialized: true
            },
            false,
            'auth/initialize/error'
          );
        }
      },

      signOut: async () => {
        try {
          const supabase = createClientComponentClient();
          await supabase.auth.signOut();
          
          set(
            {
              user: null,
              session: null,
              error: null
            },
            false,
            'auth/signOut'
          );
        } catch (error) {
          console.error('Sign out error:', error);
          set(
            {
              error: error instanceof Error ? error.message : 'Failed to sign out'
            },
            false,
            'auth/signOut/error'
          );
        }
      },

      clearAuth: () => {
        set(
          {
            user: null,
            session: null,
            error: null,
            isLoading: false
          },
          false,
          'auth/clear'
        );
      },
    }),
    { name: 'auth-store' }
  )
);

// Convenience hooks
export const useAuth = () => useAuthStore();
export const useAuthUser = () => useAuthStore((state) => state.user);
export const useAuthSession = () => useAuthStore((state) => state.session);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);
export const useAuthInitialized = () => useAuthStore((state) => state.isInitialized);
export const useIsAuthenticated = () => useAuthStore((state) => !!state.user && !!state.session);
```

## Forms & UI Components

### Login Form

**File**: `components/auth/login-form.tsx`

Key features:
- React Hook Form with Zod validation
- Loading states and error handling
- Password visibility toggle
- URL parameter handling for messages/errors
- Automatic redirect after successful login

```typescript
export function LoginForm({ 
  redirectTo = '/profile',
  title = 'Welcome back',
  description = 'Sign in to your account to continue',
  showSignupLink = true 
}: LoginFormProps) {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur',
  });

  const onSubmit = async (data: LoginFormData) => {
    startTransition(async () => {
      try {
        const result = await signInAction(data);

        if (!result.success) {
          if (result.errors) {
            Object.entries(result.errors).forEach(([field, messages]) => {
              setError(field as keyof LoginFormData, {
                type: 'server',
                message: messages[0],
              });
            });
          } else {
            toast.error(result.message);
          }
          return;
        }

        toast.success(result.message);
        reset();
        router.push(redirectTo);
        
      } catch (error) {
        console.error('Login form error:', error);
        toast.error('An unexpected error occurred. Please try again.');
      }
    });
  };

  // Form JSX with styled inputs, validation errors, etc.
}
```

### Signup Form

**File**: `components/auth/signup-form.tsx`

Features:
- Email/password with confirmation
- Terms acceptance checkbox
- Email verification flow
- Strong password validation

### Password Reset Forms

**Files**: 
- `components/auth/password-reset-form.tsx` - Request reset
- `components/auth/password-reset-confirm-form.tsx` - Confirm new password

## Server Actions

**File**: `app/actions/auth.ts`

Server-side authentication actions:

```typescript
export async function signInAction(formData: LoginFormData): Promise<ActionResponse> {
  try {
    const validatedData = loginSchema.parse(formData);
    const supabase = await createServerComponentClient();
    
    const result = await authHelpers.signInWithPassword(
      supabase,
      validatedData.email,
      validatedData.password
    );
    
    if (result.error) {
      if (result.error.includes('Invalid login credentials')) {
        return {
          success: false,
          message: authMessages.invalidCredentials,
        };
      }
      
      if (result.error.includes('Email not confirmed')) {
        return {
          success: false,
          message: 'Please check your email and click the confirmation link before signing in.',
        };
      }
      
      return {
        success: false,
        message: result.error,
      };
    }
    
    return {
      success: true,
      message: authMessages.loginSuccess,
    };
    
  } catch (error) {
    console.error('Sign in error:', error);
    
    if (error && typeof error === 'object' && 'issues' in error) {
      return handleValidationError(error);
    }
    
    return {
      success: false,
      message: authMessages.unexpectedError,
    };
  }
}

export async function signUpAction(formData: SignupFormData): Promise<ActionResponse> {
  try {
    const validatedData = signupSchema.parse(formData);
    const supabase = await createServerComponentClient();
    
    const result = await authHelpers.signUpWithPassword(
      supabase,
      validatedData.email,
      validatedData.password,
      {
        emailRedirectTo: `${env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/profile`,
        data: {
          email: validatedData.email,
        },
      }
    );
    
    if (result.error) {
      if (result.error.includes('already registered')) {
        return {
          success: false,
          message: authMessages.emailAlreadyExists,
        };
      }
      
      return {
        success: false,
        message: result.error,
      };
    }
    
    return {
      success: true,
      message: authMessages.signupSuccess,
    };
    
  } catch (error) {
    console.error('Sign up error:', error);
    
    if (error && typeof error === 'object' && 'issues' in error) {
      return handleValidationError(error);
    }
    
    return {
      success: false,
      message: authMessages.unexpectedError,
    };
  }
}
```

## Middleware & Route Protection

**File**: `middleware.ts`

Protects routes based on authentication status:

```typescript
export async function middleware(request: NextRequest) {
  try {
    const { response } = createMiddlewareClient(request);
    const { pathname } = request.nextUrl;
    
    const authResult = await getAuthStatus(request);
    const routeType = getRouteType(pathname);

    // Handle protected routes
    if (routeType === 'protected') {
      if (!authResult.isAuthenticated) {
        const loginUrl = createLoginUrl(request.url, pathname);
        return Response.redirect(loginUrl);
      }
      return response;
    }

    // Handle auth routes (redirect if already authenticated)
    if (routeType === 'auth') {
      if (authResult.isAuthenticated) {
        const returnTo = request.nextUrl.searchParams.get('returnTo');
        const redirectUrl = createPostAuthRedirectUrl(request.url, returnTo || undefined);
        return Response.redirect(redirectUrl);
      }
      return response;
    }

    return response;

  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}
```

**File**: `lib/auth-middleware.ts`

Helper functions for middleware:

```typescript
export async function getAuthStatus(request: NextRequest): Promise<AuthMiddlewareResult> {
  try {
    const { supabase } = createMiddlewareClient(request);
    
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      return {
        isAuthenticated: false,
        user: null,
        session: null,
        error: sessionError.message,
      };
    }

    return {
      isAuthenticated: !!session?.user,
      user: session?.user || null,
      session,
      error: null,
    };
  } catch (error) {
    return {
      isAuthenticated: false,
      user: null,
      session: null,
      error: error instanceof Error ? error.message : 'Unknown authentication error',
    };
  }
}

export function getRouteType(pathname: string): 'public' | 'auth' | 'protected' {
  const authRoutes = ['/login', '/signup', '/reset-password'];
  const protectedRoutes = ['/profile', '/dashboard', '/settings'];
  
  if (authRoutes.some(route => pathname.startsWith(route))) {
    return 'auth';
  }
  
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    return 'protected';
  }
  
  return 'public';
}
```

## Validation & Schemas

**File**: `lib/schemas/auth.ts`

Zod schemas for form validation:

```typescript
// Strong password validation
const strongPasswordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(8, 'Password must be at least 8 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  );

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signupSchema = z
  .object({
    email: emailSchema,
    password: strongPasswordSchema,
    confirmPassword: strongPasswordSchema,
    terms: z.boolean().refine(val => val === true, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const passwordResetSchema = z.object({
  email: emailSchema,
});

export const passwordResetConfirmSchema = z
  .object({
    password: strongPasswordSchema,
    confirmPassword: strongPasswordSchema,
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
```

## OAuth Integration

**File**: `lib/auth-utils.ts`

OAuth provider utilities:

```typescript
export const oauthUtils = {
  getAvailableProviders(): Provider[] {
    const providers: Provider[] = [];
    
    if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
      providers.push('google');
    }
    
    if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
      providers.push('github');
    }
    
    return providers;
  },

  signInWithProvider: async (
    supabase: SupabaseClient<Database>,
    provider: Provider,
    options: OAuthOptions = {}
  ): Promise<AuthResult<{ url: string }>> => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: options.redirectTo || `${env.NEXT_PUBLIC_APP_URL}/auth/callback`,
          scopes: options.scopes,
          queryParams: options.queryParams,
        },
      });

      if (error) {
        return {
          data: null,
          error: error.message || `Failed to authenticate with ${provider}`,
          success: false,
        };
      }

      return {
        data: { url: data.url },
        error: null,
        success: true,
      };
    } catch (error) {
      console.error(`OAuth ${provider} error:`, error);
      return {
        data: null,
        error: error instanceof Error ? error.message : `Unexpected ${provider} authentication error`,
        success: false,
      };
    }
  },

  signInWithGoogle: async (supabase: SupabaseClient<Database>, options: OAuthOptions = {}) => {
    return oauthUtils.signInWithProvider(supabase, 'google', options);
  },

  signInWithGitHub: async (supabase: SupabaseClient<Database>, options: OAuthOptions = {}) => {
    return oauthUtils.signInWithProvider(supabase, 'github', options);
  },
};
```

## Auth Callback Handler

**File**: `app/auth/callback/route.ts`

Handles OAuth callbacks and email confirmations:

```typescript
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/profile';
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // Handle auth errors
  if (error) {
    console.error('Auth callback error:', error, errorDescription);
    const loginUrl = new URL('/login', requestUrl.origin);
    loginUrl.searchParams.set('error', errorDescription || error);
    return NextResponse.redirect(loginUrl);
  }

  // Handle successful auth callback with code
  if (code) {
    try {
      const supabase = await createServerComponentClient();
      
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        console.error('Code exchange error:', exchangeError);
        const loginUrl = new URL('/login', requestUrl.origin);
        loginUrl.searchParams.set('error', 'Authentication failed. Please try again.');
        return NextResponse.redirect(loginUrl);
      }

      // Handle password reset flow
      if (requestUrl.searchParams.get('type') === 'recovery') {
        const resetConfirmUrl = new URL('/reset-password/confirm', requestUrl.origin);
        return NextResponse.redirect(resetConfirmUrl);
      }
      
      const redirectUrl = new URL(next, requestUrl.origin);
      
      if (requestUrl.searchParams.get('type') === 'signup') {
        redirectUrl.searchParams.set('message', 'Email confirmed successfully! Welcome to your account.');
      }
      
      return NextResponse.redirect(redirectUrl);
      
    } catch (error) {
      console.error('Auth callback processing error:', error);
      const loginUrl = new URL('/login', requestUrl.origin);
      loginUrl.searchParams.set('error', 'An unexpected error occurred during authentication.');
      return NextResponse.redirect(loginUrl);
    }
  }

  // Invalid callback request
  const loginUrl = new URL('/login', requestUrl.origin);
  loginUrl.searchParams.set('error', 'Invalid authentication request.');
  return NextResponse.redirect(loginUrl);
}
```

## Database Schema

Our auth system integrates with a profiles table for user data:

```sql
-- profiles table (extends Supabase auth.users)
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  email text not null,
  full_name text,
  avatar_url text,
  phone text,
  company_name text,
  website_url text,
  timezone text,
  email_notifications boolean default true,
  marketing_emails boolean default false,
  billing_address jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  constraint profiles_email_key unique (email)
);

-- RLS policies for profiles
alter table public.profiles enable row level security;

-- Users can only see and edit their own profile
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = user_id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = user_id);

-- Function to handle user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## Environment Configuration

**File**: `lib/env.ts`

Required environment variables:

```bash
# Core Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="SaaS Kit"

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Feature Flags
NEXT_PUBLIC_ENABLE_SOCIAL_AUTH=true
```

## Error Handling

### Consistent Error Messages

**File**: `lib/schemas/auth.ts`

```typescript
export const authMessages = {
  invalidCredentials: 'Invalid email or password',
  emailNotFound: 'No account found with this email address',
  emailAlreadyExists: 'An account with this email already exists',
  passwordTooWeak: 'Password is too weak. Please choose a stronger password.',
  loginSuccess: 'Welcome back!',
  signupSuccess: 'Account created successfully! Please check your email for verification.',
  passwordResetSent: 'Password reset link sent to your email',
  passwordResetSuccess: 'Password updated successfully',
  networkError: 'Network error. Please check your connection and try again.',
  unexpectedError: 'An unexpected error occurred. Please try again.',
} as const;
```

### Error Types

```typescript
export interface AuthResult<T = any> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface ActionResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}
```

## Testing

Comprehensive test coverage for auth components:

### Auth Store Tests

**File**: `lib/stores/__tests__/auth-store.test.ts`

Tests for:
- Store initialization
- State management
- Auth state changes
- Error handling
- Selector hooks

### Supabase Client Tests

**File**: `lib/__tests__/supabase.test.ts`

Tests for:
- Client creation in different contexts
- Auth helper functions
- Error handling
- Session management

### Auth Utils Tests

**File**: `lib/__tests__/auth-utils.test.ts`

Tests for:
- OAuth utilities
- Session utilities
- Admin utilities
- Profile management

### Component Tests

Tests for all auth forms covering:
- Form validation
- Error handling
- Loading states
- Successful submissions

## Best Practices

### 1. Security

- **Never expose service role key** on the client side
- Use **Row Level Security (RLS)** for database access
- Implement **proper CORS** configuration
- Use **HTTPS** in production
- Validate all inputs on both client and server

### 2. User Experience

- **Clear error messages** for all error states
- **Loading indicators** during async operations
- **Proper form validation** with real-time feedback
- **Redirect handling** with return URLs
- **Integrated notification system** with context-aware messaging for authentication events

### 3. Performance

- **Lazy load** auth-related components
- **Debounce** validation checks
- **Cache** user sessions appropriately
- **Minimize** re-renders with proper state management

### 4. Maintenance

- **Type everything** with TypeScript
- **Test all auth flows** thoroughly
- **Document environment variables**
- **Use consistent naming** conventions
- **Keep auth logic centralized**

### 5. Error Recovery

- **Graceful degradation** when services are unavailable
- **Retry mechanisms** for transient failures
- **Clear error boundaries** in React components
- **Logging** for debugging production issues

## Integration Examples

### Using Auth in Components

```typescript
'use client';

import { useAuth } from '@/lib/stores/auth-store';

export function Dashboard() {
  const { user, isLoading, signOut } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    redirect('/login');
  }

  return (
    <div>
      <h1>Welcome, {user.email}!</h1>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### Server-side Auth Check

```typescript
import { createServerComponentClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const supabase = await createServerComponentClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div>
      <h1>Protected Content</h1>
      <p>User: {session.user.email}</p>
    </div>
  );
}
```

### Route Handler Auth

```typescript
import { createRouteHandlerClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient(request);
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Handle authenticated request
  return NextResponse.json({ data: 'Protected data' });
}
```

This comprehensive authentication system provides a secure, scalable, and maintainable foundation for any SaaS application built with Next.js and Supabase. 