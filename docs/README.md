# SaaS Kit Documentation

Welcome to the comprehensive documentation for our Next.js 15 + Supabase SaaS Kit.

## 📚 Documentation Index

### Authentication System
- **[Authentication Overview](./authentication-overview.md)** - Quick reference guide to our auth implementation
- **[Complete Authentication Guide](./authentication.md)** - Comprehensive documentation of the entire auth system

### Payment & Subscription System
- **[Guest Checkout System](./guest-checkout-system.md)** - "Payment First, Account Later" implementation guide
- **[Subscription Management](./subscription.md)** - Complete subscription system documentation
- **[Stripe Setup Guide](./stripe-setup.md)** - Stripe integration and configuration
- **[NEW: Subscription Sync](./subscription.md#3-subscription-plan-updates-not-reflecting-in-database)** - Troubleshoot and fix Stripe subscription sync issues
- **[NEW: Subscription Go-Live Checklist](./subscription-go-live.md)** - Comprehensive guide for taking subscriptions to production
- **[NEW: Subscription Monitoring & Maintenance](./subscription-monitoring.md)** - Ensure long-term reliability of your subscription system

### Database & Schema
- **[Database Schema Overview](./database-schema.md)** - Overview of the database structure
- **[Database Tables Reference](./database-tables.md)** - Detailed reference for all database tables
- **[Race Condition Fixes](./RACE_CONDITION_FIXES.md)** - Solutions to database race conditions

## 🏗️ Architecture Overview

This SaaS Kit is built with:

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Supabase** - Backend-as-a-Service for database and authentication
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality UI components
- **Zustand** - Lightweight state management
- **React Hook Form + Zod** - Form handling and validation
- **Jest + Testing Library** - Comprehensive testing setup

## 🔐 Authentication Features

Our authentication system provides:

### ✅ Core Features
- Email/password authentication
- Email verification
- Password reset functionality
- Session management
- Route protection middleware
- Server-side authentication
- Client-side state management

### ✅ Advanced Features
- OAuth integration (Google, GitHub)
- Multiple Supabase client configurations
- Comprehensive error handling
- Form validation with Zod schemas
- Loading states and UX optimization
- Toast notifications
- Redirect handling

### ✅ Security Features
- Row Level Security (RLS) policies
- HTTPS enforcement
- Input validation on client and server
- Session token management
- CORS configuration
- Environment variable validation

## 📁 Project Structure

```
saaskit/
├── app/                    # Next.js App Router
│   ├── actions/           # Server actions
│   ├── auth/             # Auth-related routes
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   ├── profile/          # User profile
│   └── reset-password/   # Password reset
├── components/           # React components
│   ├── auth/            # Auth forms and UI
│   ├── providers/       # Context providers
│   └── ui/              # Reusable UI components
├── lib/                 # Utility libraries
│   ├── schemas/         # Zod validation schemas
│   ├── stores/          # Zustand stores
│   ├── auth-utils.ts    # Auth utilities
│   ├── auth-middleware.ts # Middleware helpers
│   ├── supabase.ts      # Supabase clients
│   └── env.ts           # Environment config
├── types/               # TypeScript type definitions
├── __tests__/          # Test files
├── docs/               # Documentation
└── middleware.ts       # Next.js middleware
```

## 🚀 Quick Start

1. **Clone and Install**:
   ```bash
   git clone <repository>
   cd saaskit
   npm install
   ```

2. **Environment Setup**:
   ```bash
   cp .env.example .env.local
   # Fill in your Supabase credentials
   ```

3. **Database Setup**:
   - Create Supabase project
   - Run migrations for profiles table
   - Set up Row Level Security policies

4. **Start Development**:
   ```bash
   npm run dev
   ```

5. **Run Tests**:
   ```bash
   npm test
   ```

## 🧪 Testing

Our test suite covers:

- **Unit Tests**: Individual functions and utilities
- **Integration Tests**: Component interactions
- **Auth Flow Tests**: Complete authentication workflows
- **Store Tests**: State management logic
- **Form Tests**: Validation and submission

### Test Structure
```
__tests__/
├── components/auth/     # Auth component tests
├── lib/                # Utility function tests
│   ├── stores/         # Store tests
│   ├── auth-utils.test.ts
│   └── supabase.test.ts
└── setup/              # Test configuration
```

### Running Tests
```bash
npm test                # Run all tests
npm test -- --watch    # Watch mode
npm test -- --coverage # Coverage report
```

## 🔧 Configuration

### Environment Variables

The application uses comprehensive environment validation with fallbacks for development:

- **Required**: Supabase credentials, app URL
- **Optional**: OAuth providers, email services, analytics
- **Development**: Sensible defaults for quick setup

See `lib/env.ts` for complete configuration schema.

### Feature Flags

Control features through environment variables:
- `NEXT_PUBLIC_ENABLE_SOCIAL_AUTH` - OAuth providers
- `NEXT_PUBLIC_ENABLE_SUBSCRIPTIONS` - Payment features
- `NEXT_PUBLIC_ENABLE_ANALYTICS` - Analytics tracking

## 📊 Database Schema

### Core Tables
- `auth.users` - Supabase built-in user table
- `public.profiles` - Extended user profile data
- `public.subscriptions` - Subscription management

### Key Features
- Automatic profile creation on signup
- Row Level Security policies
- TypeScript type generation
- Migration support

## 🔐 Security Best Practices

1. **Environment Security**:
   - Never expose service role keys
   - Use environment validation
   - Secure credential storage

2. **Database Security**:
   - Row Level Security enabled
   - Proper user policies
   - Input validation

3. **Application Security**:
   - HTTPS enforcement
   - CORS configuration
   - Session management
   - XSS protection

## 🤝 Contributing

When contributing to the authentication system:

1. **Follow TypeScript patterns** established in the codebase
2. **Add tests** for new functionality
3. **Update documentation** for changes
4. **Use consistent naming** conventions
5. **Follow security best practices**

## 📞 Support

For questions about the authentication implementation:

1. Check the [Authentication Overview](./authentication-overview.md) for quick answers
2. Refer to the [Complete Authentication Guide](./authentication.md) for detailed information
3. Review test files for usage examples
4. Check environment configuration in `lib/env.ts`

## 🔄 Updates

This documentation is maintained alongside the codebase. When making changes:

1. Update relevant documentation
2. Add examples for new features
3. Update type definitions
4. Add tests for new functionality

---

*Last updated: 2025-05-28*
*Documentation version: 1.2* 