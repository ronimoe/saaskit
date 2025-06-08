# @saas/supabase

A comprehensive Supabase integration package for the SaaS Kit monorepo, providing type-safe database operations, authentication helpers, storage management, and real-time subscriptions.

## 🚀 Features

- **Type-Safe Database Operations** - Fully typed database schema with TypeScript
- **Row Level Security (RLS)** - Production-ready security policies for multi-tenant SaaS
- **Authentication Helpers** - Sign in/up, OAuth, password reset, and session management
- **File Storage Operations** - Upload, download, signed URLs, and bucket management
- **Real-time Subscriptions** - Live database change notifications
- **SSR Support** - Next.js server-side rendering with @supabase/ssr
- **Performance Optimized** - Cached auth functions and optimized RLS policies

## 📦 Installation

This package is part of the SaaS Kit monorepo and is automatically available to workspace packages:

```typescript
import { createClient, Database } from '@saas/supabase'
```

## 🏗️ Database Schema

The package includes a complete multi-tenant SaaS database schema with the following tables:

### Tables Overview

| Table | Description | RLS Enabled |
|-------|-------------|-------------|
| `users` | Core user profiles linked to Supabase auth | ✅ |
| `products` | SaaS products/features catalog | ✅ |
| `user_products` | User-product relationships with roles | ✅ |
| `subscriptions` | Billing and subscription management | ✅ |

### Schema Details

#### `users` Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `products` Table
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `user_products` Table
```sql
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'member', 'viewer');

CREATE TABLE user_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);
```

#### `subscriptions` Table
```sql
CREATE TYPE subscription_status AS ENUM (
  'active', 'canceled', 'incomplete', 'incomplete_expired', 
  'past_due', 'trialing', 'unpaid'
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  status subscription_status NOT NULL DEFAULT 'trialing',
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🔐 Row Level Security (RLS) Policies

All tables have comprehensive RLS policies implemented for secure multi-tenant access:

### Users Table Policies
- **SELECT**: Users can view their own profile only
- **INSERT**: Authenticated users can create their own profile
- **UPDATE**: Users can update their own profile only
- **DELETE**: Users can delete their own profile (GDPR compliance)

### Products Table Policies
- **SELECT**: Public read access (product catalog)
- **INSERT/UPDATE/DELETE**: Authenticated users only

### User_Products Table Policies
- **All Operations**: Users can only manage their own product relationships

### Subscriptions Table Policies
- **All Operations**: Users can only access their own subscriptions

### Performance Optimizations
- All policies use `(SELECT auth.uid())` for optimal performance
- Auth function results are cached per-statement via PostgreSQL initPlan
- Proper indexing on foreign keys and frequently queried columns

## 🔧 API Reference

### Client Configuration

```typescript
import { createClient } from '@saas/supabase'

// Browser client
const supabase = createClient()

// Server client (with service role)
const supabaseAdmin = createClient({ admin: true })
```

### Authentication

```typescript
import { signIn, signUp, signOut, resetPassword } from '@saas/supabase'

// Email/password sign in
const { data, error } = await signIn({
  email: 'user@example.com',
  password: 'password'
})

// OAuth sign in
const { data, error } = await signInWithOAuth('google')

// Sign up
const { data, error } = await signUp({
  email: 'user@example.com',
  password: 'password'
})

// Password reset
const { error } = await resetPassword('user@example.com')
```

### Database Operations

```typescript
import { createClient, Database } from '@saas/supabase'

const supabase = createClient()

// Type-safe queries
const { data: users, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)

// Insert with proper typing
const { data, error } = await supabase
  .from('user_products')
  .insert({
    user_id: userId,
    product_id: productId,
    role: 'member'
  })
```

### File Storage

```typescript
import { uploadFile, downloadFile, getSignedUrl } from '@saas/supabase'

// Upload file
const { data, error } = await uploadFile({
  bucket: 'avatars',
  path: 'user-123/avatar.jpg',
  file: fileObject
})

// Get signed URL
const { data: url } = await getSignedUrl({
  bucket: 'avatars',
  path: 'user-123/avatar.jpg',
  expiresIn: 3600 // 1 hour
})
```

### Real-time Subscriptions

```typescript
import { subscribeToTable, subscribeToUserChanges } from '@saas/supabase'

// Subscribe to table changes
const subscription = subscribeToTable('products', (payload) => {
  console.log('Product updated:', payload)
})

// Subscribe to user-specific changes
const userSub = subscribeToUserChanges(userId, 'user_products', (payload) => {
  console.log('User product relationship changed:', payload)
})

// Cleanup
subscription.unsubscribe()
```

## ⚙️ Environment Setup

Create a `.env.local` file in your app directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## 🧪 Testing

The package includes comprehensive test coverage:

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with UI
pnpm test:ui
```

Test coverage includes:
- RLS policy enforcement
- Authentication flows
- Database operations
- Storage operations
- Real-time subscriptions
- Error handling scenarios

## 📚 Type Definitions

The package exports a complete `Database` type that includes:

```typescript
export interface Database {
  public: {
    Tables: {
      users: { /* complete table definition */ }
      products: { /* complete table definition */ }
      user_products: { /* complete table definition */ }
      subscriptions: { /* complete table definition */ }
    }
    Enums: {
      user_role: 'owner' | 'admin' | 'member' | 'viewer'
      subscription_status: 'active' | 'canceled' | /* ... */
    }
  }
}
```

## 🔄 Development Workflow

1. **Database Changes**: Apply migrations using Supabase MCP tools
2. **Type Generation**: Types are automatically generated from the live database schema
3. **Testing**: Comprehensive test suite ensures RLS policies and operations work correctly
4. **Build**: Use `pnpm build` to compile the package

## 📁 Package Structure

```
packages/supabase/
├── src/
│   ├── index.ts          # Main exports
│   ├── client.ts         # Supabase client configuration
│   ├── types.ts          # TypeScript database types
│   ├── auth-helpers.ts   # Authentication utilities
│   ├── storage.ts        # File storage operations
│   └── realtime.ts       # Real-time subscriptions
├── dist/                 # Compiled output
├── package.json
└── README.md
```

## 🤝 Contributing

This package follows the SaaS Kit monorepo standards:
- TypeScript everywhere
- Comprehensive testing with Vitest
- ESLint and Prettier for code quality
- Proper error handling and type safety

## 📄 License

Part of the SaaS Kit monorepo - see root LICENSE file.

---

**Status**: ✅ Production Ready
- Database schema deployed
- RLS policies implemented and optimized  
- Comprehensive test coverage
- Type-safe API
- Performance optimized 