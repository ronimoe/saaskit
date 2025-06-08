# SaaS Platform Monorepo - Folder Structure Guide

## Overview

This document provides clear guidance on where to place different types of files within the monorepo. It ensures consistency across the development team and makes the codebase easier to navigate and maintain.

**Quick Reference**: Each directory has a specific purpose. When in doubt, look at the examples below or check similar existing files in the same location.

## 📁 Root Level Structure

### Configuration Files
```
saaskit/
├── package.json                    # Root workspace configuration with scripts
├── pnpm-workspace.yaml            # pnpm workspace definition
├── turbo.json                      # Build orchestration and caching
├── tsconfig.json                   # Base TypeScript configuration
├── vitest.workspace.ts             # Vitest workspace test configuration  
├── .gitignore                      # Git ignore patterns for entire monorepo
├── .env.example                    # Environment variables template
├── pnpm-lock.yaml                  # Lock file - auto-generated, don't edit
└── README.md                       # Project overview and getting started
```

**When to add files here:**
- ✅ Configuration that affects the entire monorepo
- ✅ Scripts that coordinate multiple packages
- ❌ Package-specific configurations (put in package directories)

## 📁 Apps Directory (`apps/`)

Contains independent Next.js applications that can be deployed separately.

### Main Application (`apps/main-app/`)
```
apps/main-app/
├── app/                            # Next.js 15 App Router
│   ├── (auth)/                     # Route group for authentication pages
│   │   ├── login/
│   │   │   └── page.tsx            # Login page component
│   │   ├── register/
│   │   │   └── page.tsx            # Registration page
│   │   ├── forgot-password/
│   │   │   └── page.tsx            # Password reset page
│   │   └── auth/
│   │       └── callback/
│   │           └── page.tsx        # OAuth callback handler
│   ├── (dashboard)/                # Route group for protected pages
│   │   ├── layout.tsx              # Dashboard layout with navigation
│   │   ├── page.tsx                # Dashboard home/overview
│   │   ├── projects/               # Projects management
│   │   │   ├── page.tsx            # Projects list
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx        # Individual project page
│   │   │   └── new/
│   │   │       └── page.tsx        # Create new project
│   │   ├── team/                   # Team management
│   │   │   ├── page.tsx            # Team overview
│   │   │   ├── members/
│   │   │   │   └── page.tsx        # Team members management
│   │   │   └── invites/
│   │   │       └── page.tsx        # Invite management
│   │   ├── settings/               # User and account settings
│   │   │   ├── page.tsx            # Settings overview
│   │   │   ├── profile/
│   │   │   │   └── page.tsx        # Profile settings
│   │   │   ├── billing/
│   │   │   │   └── page.tsx        # Billing and subscription
│   │   │   ├── integrations/
│   │   │   │   └── page.tsx        # Third-party integrations
│   │   │   └── security/
│   │   │       └── page.tsx        # Security settings
│   │   └── analytics/
│   │       └── page.tsx            # Analytics dashboard
│   ├── api/                        # API routes for backend functionality
│   │   ├── auth/
│   │   │   └── callback/route.ts   # Authentication callback
│   │   ├── billing/
│   │   │   ├── checkout/route.ts   # Stripe checkout
│   │   │   ├── portal/route.ts     # Customer portal
│   │   │   └── webhooks/route.ts   # Payment webhooks
│   │   ├── team/
│   │   │   ├── invite/route.ts     # Team invitations
│   │   │   └── members/route.ts    # Team member operations
│   │   ├── projects/
│   │   │   └── route.ts            # Project CRUD operations
│   │   └── health/route.ts         # Health check endpoint
│   ├── globals.css                 # Global styles and Tailwind imports
│   ├── layout.tsx                  # Root layout component
│   └── page.tsx                    # Root page (usually redirects)
├── components/                     # App-specific React components
│   ├── auth/                       # Authentication-related components
│   │   ├── AuthForm.tsx            # Reusable auth form component
│   │   ├── OAuthButtons.tsx        # Social login buttons
│   │   └── ProtectedRoute.tsx      # Route protection wrapper
│   ├── dashboard/                  # Dashboard-specific components
│   │   ├── DashboardNav.tsx        # Dashboard navigation
│   │   ├── Sidebar.tsx             # Dashboard sidebar
│   │   ├── UserMenu.tsx            # User dropdown menu
│   │   └── TeamSwitcher.tsx        # Multi-tenant team switcher
│   ├── ui/                         # Local UI components (specific to this app)
│   │   ├── Button.tsx              # App-specific button variants
│   │   ├── Modal.tsx               # App-specific modal component
│   │   └── DataTable.tsx           # App-specific data table
│   └── providers/                  # React context providers
│       ├── AuthProvider.tsx        # Authentication state provider
│       ├── ThemeProvider.tsx       # Theme/dark mode provider
│       └── ToastProvider.tsx       # Toast notification provider
├── lib/                            # App-specific utilities
│   ├── auth-helpers.ts             # Authentication helper functions
│   ├── utils.ts                    # General utilities for this app
│   └── constants.ts                # App-specific constants
├── __tests__/                      # App-specific tests
│   ├── components/                 # Component tests
│   ├── pages/                      # Page tests
│   └── api/                        # API route tests
├── middleware.ts                   # Next.js middleware for route protection
├── next.config.js                  # Next.js configuration
├── tailwind.config.js              # Tailwind CSS configuration
├── vitest.config.ts                # Vitest configuration for this app
└── package.json                    # App dependencies and scripts
```

**When to add files in apps/main-app/:**
- ✅ Pages specific to the main application
- ✅ Components used only in this app
- ✅ App-specific utilities and helpers
- ✅ API routes for business logic
- ❌ Reusable components (put in packages/ui/)
- ❌ Shared utilities (put in packages/lib/)

### Marketing Site (`apps/marketing-site/`)
```
apps/marketing-site/
├── app/
│   ├── page.tsx                    # Homepage
│   ├── products/                   # Product showcases
│   ├── pricing/                    # Pricing information
│   ├── about/                      # About page
│   ├── blog/                       # Blog posts
│   └── contact/                    # Contact information
├── components/
│   ├── marketing/                  # Marketing-specific components
│   └── layout/                     # Layout components
└── package.json                    # Marketing site dependencies
```

## 📁 Packages Directory (`packages/`)

Contains shared code that can be used across multiple applications.

### Supabase Package (`packages/supabase/`)
```
packages/supabase/
├── src/
│   ├── client.ts                   # Supabase client configuration
│   ├── auth/                       # Authentication utilities
│   │   ├── index.ts                # Main auth exports
│   │   ├── providers.ts            # OAuth provider configurations
│   │   ├── hooks.ts                # React hooks for auth state
│   │   └── server.ts               # Server-side auth utilities
│   ├── database/                   # Database operations
│   │   ├── users.ts                # User-related database operations
│   │   ├── tenants.ts              # Multi-tenant operations
│   │   ├── subscriptions.ts        # Subscription data operations
│   │   └── index.ts                # Database exports
│   ├── storage/                    # File storage operations
│   │   ├── avatars.ts              # Avatar upload/management
│   │   ├── documents.ts            # Document storage
│   │   └── index.ts                # Storage exports
│   ├── realtime/                   # Real-time subscriptions
│   │   ├── notifications.ts        # Real-time notifications
│   │   └── collaboration.ts        # Real-time collaboration
│   └── types/                      # Generated TypeScript types
│       └── database.ts             # Database schema types
├── __tests__/                      # Package tests
│   ├── auth/                       # Auth functionality tests
│   ├── database/                   # Database operation tests
│   └── storage/                    # Storage operation tests
├── vitest.config.ts                # Vitest configuration
└── package.json                    # Package dependencies
```

### Authentication Package (`packages/auth/`)
```
packages/auth/
├── src/
│   ├── index.ts                    # Main exports
│   ├── jwt.ts                      # JWT token utilities
│   ├── password.ts                 # Password hashing and validation
│   ├── session.ts                  # Session management
│   ├── providers/                  # OAuth provider implementations
│   │   ├── google.ts               # Google OAuth setup
│   │   └── github.ts               # GitHub OAuth setup
│   ├── middleware.ts               # Authentication middleware
│   └── types.ts                    # Authentication type definitions
├── __tests__/                      # Authentication tests
├── vitest.config.ts                # Vitest configuration
└── package.json                    # Package dependencies
```

### Billing Package (`packages/billing/`)
```
packages/billing/
├── src/
│   ├── index.ts                    # Main exports
│   ├── stripe.ts                   # Stripe client configuration
│   ├── plans.ts                    # Subscription plan definitions
│   ├── webhooks.ts                 # Stripe webhook handlers
│   ├── usage.ts                    # Usage tracking utilities
│   └── types.ts                    # Billing type definitions
├── __tests__/                      # Billing tests
├── vitest.config.ts                # Vitest configuration
└── package.json                    # Package dependencies
```

### UI Components Package (`packages/ui/`)
```
packages/ui/
├── src/
│   ├── components/
│   │   ├── forms/                  # Form components
│   │   │   ├── Input.tsx           # Input field component
│   │   │   ├── Select.tsx          # Select dropdown component
│   │   │   ├── Textarea.tsx        # Textarea component
│   │   │   └── index.ts            # Form component exports
│   │   ├── data/                   # Data display components
│   │   │   ├── Table.tsx           # Data table component
│   │   │   ├── Chart.tsx           # Chart components
│   │   │   ├── StatCard.tsx        # Statistics card component
│   │   │   └── index.ts            # Data component exports
│   │   ├── navigation/             # Navigation components
│   │   │   ├── Sidebar.tsx         # Sidebar navigation
│   │   │   ├── Breadcrumb.tsx      # Breadcrumb navigation
│   │   │   ├── Pagination.tsx      # Pagination component
│   │   │   └── index.ts            # Navigation exports
│   │   ├── feedback/               # User feedback components
│   │   │   ├── Toast.tsx           # Toast notifications
│   │   │   ├── Modal.tsx           # Modal dialogs
│   │   │   ├── Loading.tsx         # Loading indicators
│   │   │   └── index.ts            # Feedback exports
│   │   └── index.ts                # All component exports
│   ├── styles/
│   │   ├── globals.css             # Global styles
│   │   └── components.css          # Component-specific styles
│   ├── hooks/                      # Shared React hooks
│   │   ├── useLocalStorage.ts      # Local storage hook
│   │   ├── useDebounce.ts          # Debounce hook
│   │   └── index.ts                # Hook exports
│   └── index.ts                    # Main package exports
├── __tests__/                      # UI component tests
├── vitest.config.ts                # Vitest configuration
└── package.json                    # Package dependencies
```

### Utilities Package (`packages/lib/`)
```
packages/lib/
├── src/
│   ├── utils.ts                    # General utility functions
│   ├── validation.ts               # Input validation helpers
│   ├── formatting.ts               # Data formatting functions
│   ├── constants.ts                # Shared constants
│   └── index.ts                    # Utility exports
├── __tests__/                      # Utility tests
├── vitest.config.ts                # Vitest configuration
└── package.json                    # Package dependencies
```

### Email Package (`packages/email/`)
```
packages/email/
├── src/
│   ├── index.ts                    # Main exports
│   ├── templates/                  # Email templates
│   │   ├── welcome.tsx             # Welcome email template
│   │   ├── reset-password.tsx      # Password reset template
│   │   └── invoice.tsx             # Invoice email template
│   ├── providers/                  # Email service providers
│   │   ├── resend.ts               # Resend integration
│   │   └── sendgrid.ts             # SendGrid integration
│   └── types.ts                    # Email type definitions
├── __tests__/                      # Email tests
├── vitest.config.ts                # Vitest configuration
└── package.json                    # Package dependencies
```

### Types Package (`packages/types/`)
```
packages/types/
├── src/
│   ├── api.ts                      # API request/response types
│   ├── auth.ts                     # Authentication types
│   ├── billing.ts                  # Billing and subscription types
│   ├── database.ts                 # Database entity types
│   ├── ui.ts                       # UI component prop types
│   └── index.ts                    # All type exports
├── __tests__/                      # Type validation tests
├── vitest.config.ts                # Vitest configuration
└── package.json                    # Package dependencies
```

**When to add files in packages/:**
- ✅ Code used by multiple apps
- ✅ Reusable React components
- ✅ Shared utilities and helpers
- ✅ Common TypeScript types
- ❌ App-specific logic (put in respective app directories)

## 📁 Tools Directory (`tools/`)

Contains shared development tooling and configurations.

```
tools/
├── eslint-config/                  # Shared ESLint configurations
│   ├── index.js                    # Base ESLint config
│   └── package.json                # ESLint config dependencies
├── tsconfig/                       # Shared TypeScript configurations
│   ├── base.json                   # Base TypeScript config
│   ├── nextjs.json                 # Next.js specific config
│   ├── react-library.json          # React library config
│   └── package.json                # TypeScript config dependencies
├── tsup-config/                    # Build configuration for packages
│   └── package.json                # Build tool dependencies
└── vitest-config/                  # Shared test configurations
    └── package.json                # Test tool dependencies
```

**When to add files in tools/:**
- ✅ Configurations used across multiple packages
- ✅ Shared development tools
- ✅ Build and test configurations
- ❌ Package-specific configurations (put in respective packages)

## 📁 Supabase Directory (`supabase/`)

Contains database migrations, functions, and Supabase-specific configurations.

```
supabase/
├── migrations/                     # Database schema migrations
│   ├── 001_initial_schema.sql      # Initial database schema
│   ├── 002_add_billing.sql         # Billing tables and relations
│   └── 003_add_multi_tenant.sql    # Multi-tenant support
├── functions/                      # Edge functions
│   ├── process-payment/            # Payment processing function
│   └── send-notifications/         # Notification sending function
├── seed.sql                        # Sample/test data
└── config.toml                     # Supabase project configuration
```

**When to add files in supabase/:**
- ✅ Database migrations (numbered sequentially)
- ✅ Edge functions for serverless operations
- ✅ Seed data for development/testing
- ❌ Application code (put in packages/supabase/)

## 📁 Tests Directory (`tests/`)

Contains end-to-end tests and test fixtures that span multiple packages.

```
tests/
├── e2e/                            # End-to-end tests
│   ├── auth-flow.spec.ts           # Authentication flow tests
│   ├── billing-flow.spec.ts        # Billing and payment tests
│   ├── dashboard.spec.ts           # Dashboard functionality tests
│   └── multi-tenant.spec.ts        # Multi-tenant scenario tests
├── fixtures/                       # Test data and utilities
│   ├── users.json                  # Test user data
│   └── test-data.sql               # Test database data
└── playwright.config.ts            # Playwright E2E test configuration
```

**When to add files in tests/:**
- ✅ Integration tests across multiple packages
- ✅ End-to-end user flow tests
- ✅ Shared test fixtures and utilities
- ❌ Unit tests (put in respective package __tests__ directories)

## 📁 Documentation Directory (`docs/`)

Contains project documentation and guides.

```
docs/
├── PRD.md                          # Product Requirements Document
├── FOLDER-STRUCTURE.md             # This file - folder structure guide
├── API.md                          # API documentation (future)
└── DEPLOYMENT.md                   # Deployment guide (future)
```

## 🔧 pnpm Workspace Management

### Adding Dependencies

**To the root workspace:**
```bash
# Add development dependencies to root
pnpm add -w -D typescript @types/node

# Add workspace dependencies
pnpm add -w turbo
```

**To a specific package:**
```bash
# Add to a specific app
pnpm add --filter main-app next react

# Add to a specific package
pnpm add --filter @saas/ui react lucide-react

# Add dev dependencies to a package
pnpm add --filter @saas/auth -D @types/jsonwebtoken
```

**To use workspace packages:**
```bash
# Add workspace package as dependency
pnpm add --filter main-app @saas/ui @saas/auth
```

### Common pnpm Commands

```bash
# Install all dependencies
pnpm install

# Run scripts across workspace
pnpm run build        # Runs build in all packages
pnpm run test         # Runs tests in all packages
pnpm run dev          # Runs dev servers

# Run script in specific package
pnpm --filter main-app dev
pnpm --filter @saas/ui build
pnpm --filter @saas/auth test

# Add workspace dependency
pnpm add --filter main-app @saas/ui

# Remove dependency
pnpm remove --filter main-app lodash
```

## 🧪 Vitest Workspace Configuration

### Running Tests

```bash
# Run all tests in workspace
pnpm test

# Run tests for specific package
pnpm --filter @saas/ui test
pnpm --filter main-app test

# Watch mode for development
pnpm test --watch

# Run tests with coverage
pnpm test --coverage
```

### Test File Placement

- **Unit tests**: Place in `__tests__/` directory within each package
- **Integration tests**: Place in `tests/` directory at root
- **Component tests**: Place alongside components or in `__tests__/components/`
- **API tests**: Place in `__tests__/api/` within respective apps

## 📝 Naming Conventions

### Files and Directories
- **React components**: PascalCase (`UserProfile.tsx`)
- **Utilities and functions**: camelCase (`formatCurrency.ts`)
- **Types and interfaces**: PascalCase (`UserProfile.ts`)
- **Constants**: SCREAMING_SNAKE_CASE (`API_ENDPOINTS.ts`)
- **Directories**: kebab-case (`user-settings/`)

### Package Names
- **Workspace packages**: `@saas/package-name`
- **App directories**: kebab-case (`main-app`, `marketing-site`)
- **Shared tools**: kebab-case (`eslint-config`, `tsconfig`)

## ❓ Common Scenarios

### "Where should I put...?"

**A new React component used in multiple apps?**
→ `packages/ui/src/components/` with appropriate category

**A utility function used across apps?**
→ `packages/lib/src/utils.ts` or create specific utility file

**A new API endpoint for the main app?**
→ `apps/main-app/app/api/` with appropriate route structure

**A database migration?**
→ `supabase/migrations/` with sequential numbering

**A new authentication method?**
→ `packages/auth/src/` or `packages/supabase/src/auth/`

**App-specific styles?**
→ `apps/[app-name]/app/globals.css` or component-specific CSS

**Shared TypeScript types?**
→ `packages/types/src/` with appropriate category file

**Test fixtures for E2E tests?**
→ `tests/fixtures/` for cross-app test data

### Creating a New Package

1. Create directory in `packages/[package-name]/`
2. Initialize with `package.json`:
   ```json
   {
     "name": "@saas/package-name",
     "version": "0.1.0",
     "main": "./src/index.ts",
     "exports": {
       ".": "./src/index.ts"
     }
   }
   ```
3. Create `src/index.ts` for exports
4. Add to workspace dependencies where needed
5. Configure Vitest if tests are needed

### Creating a New App

1. Create directory in `apps/[app-name]/`
2. Initialize Next.js project structure
3. Configure `package.json` with workspace dependencies
4. Add to root scripts if needed
5. Configure deployment if required

## 🔗 Related Documentation

- **[PRD.md](./PRD.md)**: Complete project requirements and architecture
- **[README.md](../README.md)**: Getting started and development setup
- **Root package.json**: Available scripts and workspace configuration
- **turbo.json**: Build pipeline and caching configuration

---

**Remember**: When in doubt, look at existing files in similar locations or ask the team. Consistency is key to maintainable code! 