# Authentication System Overview

A quick reference guide to our SaaS Kit authentication implementation.

## 🏗️ Architecture

Our auth system uses:
- **Supabase Auth** for user management
- **Zustand** for global state management
- **React Hook Form + Zod** for form validation
- **Next.js Server Actions** for server-side operations
- **Middleware** for route protection

## 📁 Key Files

### Core Configuration
- `lib/supabase.ts` - Multiple Supabase client configurations
- `lib/env.ts` - Environment variables and validation
- `middleware.ts` - Route protection middleware

### State Management
- `lib/stores/auth-store.ts` - Global auth state with Zustand
- `components/providers/auth-provider.tsx` - React context provider

### Forms & UI
- `components/auth/login-form.tsx` - Login form component
- `components/auth/signup-form.tsx` - Registration form component
- `components/auth/password-reset-form.tsx` - Password reset request
- `components/auth/password-reset-confirm-form.tsx` - Password reset confirmation

### Server Logic
- `app/actions/auth.ts` - Server actions for auth operations
- `app/auth/callback/route.ts` - OAuth and email confirmation handler
- `lib/auth-utils.ts` - Comprehensive auth utilities
- `lib/auth-middleware.ts` - Middleware helper functions

### Validation
- `lib/schemas/auth.ts` - Zod schemas for form validation

## 🔑 Supabase Clients

We provide 5 different client configurations:

```typescript
// 1. Client-side (browser)
const client = createClientComponentClient();

// 2. Server components (SSR/SSG)
const server = await createServerComponentClient();

// 3. Route handlers (API routes)
const api = createRouteHandlerClient(request);

// 4. Middleware (route protection)
const { supabase, response } = createMiddlewareClient(request);

// 5. Admin operations (server-only)
const admin = createAdminClient();
```

## 🎭 Authentication Store

Global state management with Zustand:

```typescript
const { 
  user,           // Current user object
  session,        // Current session
  isLoading,      // Loading state
  isInitialized,  // Initialization complete
  error,          // Auth errors
  signOut,        // Sign out function
  initialize      // Initialize auth
} = useAuth();
```

## 🛡️ Route Protection

### Middleware Configuration

Routes are automatically categorized:
- **Auth routes**: `/login`, `/signup`, `/reset-password` (redirect if authenticated)
- **Protected routes**: `/profile`, `/dashboard`, `/settings` (require authentication)
- **Dashboard integration**: Seamless navigation with breadcrumbs and responsive sidebar
- **Public routes**: Everything else (accessible to all)

### Manual Protection

```typescript
// Server Component
export default async function ProtectedPage() {
  const supabase = await createServerComponentClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  return <div>Protected content</div>;
}

// Client Component
export function Dashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!user) redirect('/login');

  return <div>Dashboard</div>;
}
```

## 📝 Form Validation

All forms use Zod schemas:

```typescript
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true),
}).refine(data => data.password === data.confirmPassword);
```

## 🔐 OAuth Integration

OAuth providers are configured based on environment variables:

```typescript
// Check available providers
const providers = oauthUtils.getAvailableProviders(); // ['google', 'github']

// Sign in with provider
const result = await oauthUtils.signInWithGoogle(supabase, {
  redirectTo: '/dashboard'
});
```

## 🗄️ Database Schema

User profiles extend Supabase's `auth.users`:

```sql
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  email text not null unique,
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
  updated_at timestamptz default now()
);
```

## ⚙️ Environment Variables

### Required
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Optional (OAuth)
```bash
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

## 🧪 Testing

Comprehensive test coverage includes:
- Auth store state management
- Supabase client operations
- Form validation and submission
- OAuth utilities
- Session management
- Error handling

Run tests with:
```bash
npm test
```

## 🚀 Quick Setup

1. **Configure Supabase**:
   - Create project and get credentials
   - Set up OAuth providers (optional)
   - Configure email templates

2. **Set Environment Variables**:
   - Copy `.env.example` to `.env.local`
   - Fill in Supabase credentials

3. **Initialize Database**:
   - Run profile table migration
   - Set up RLS policies
   - Create user signup trigger

4. **Start Development**:
   ```bash
   npm run dev
   ```

## 📚 Common Patterns

### Sign In
```typescript
const notifications = useNotifications();
const result = await signInAction({ email, password });
if (result.success) {
  notifications.authSuccess('Welcome back!');
  router.push('/dashboard');
} else {
  notifications.authError(result.message);
}
```

### Sign Up
```typescript
const result = await signUpAction({ 
  email, 
  password, 
  confirmPassword, 
  terms: true 
});
```

### Password Reset
```typescript
const result = await resetPasswordAction({ email });
```

### Sign Out
```typescript
const { signOut } = useAuth();
await signOut();
```

For detailed implementation details, see the [complete authentication guide](./authentication.md). 