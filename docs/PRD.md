# SaaS Platform Monorepo - Product Requirements Document

## Overview

This document outlines the development of a migration-ready SaaS platform using a monorepo architecture. The platform is designed to start as a simple, unified application while maintaining the flexibility to scale into multiple independent products and migrate to microservices architecture as needed.

**Problem**: Most SaaS applications start simple but face architectural challenges when scaling - either over-engineering from the start or painting themselves into a corner with tight coupling.

**Solution**: A monorepo architecture that uses shared packages for common functionality (auth, billing, database, UI) while keeping product-specific logic in separate applications. This allows rapid development initially with seamless scaling paths.

**Target Users**: 
- Solo developers and small teams building SaaS products
- Companies wanting to launch multiple related products
- Teams that need to iterate quickly but plan for scale

**Value Proposition**: Build fast, scale smart - get to market quickly with a simple architecture that naturally evolves into a sophisticated platform without rewrites.

## Core Features

### 1. Unified Authentication System
**What it does**: Single sign-on across all applications in the platform using Supabase Auth
**Why it's important**: Users can access multiple products with one account, reducing friction and improving retention
**How it works**: Shared authentication package that handles JWT tokens, OAuth providers, and session management across all apps

### 2. Shared Component Library
**What it does**: Reusable UI components and design system used across all applications
**Why it's important**: Consistent user experience and faster development of new products
**How it works**: Centralized UI package with TypeScript components, shared styles, and design tokens

### 3. Centralized Database Management
**What it does**: Single Supabase database with Row Level Security handling multi-tenant, multi-product data
**Why it's important**: Unified user data, cross-product analytics, and simplified data management
**How it works**: Shared database operations package with repository pattern and type-safe queries

### 4. Unified Billing System
**What it does**: Stripe integration handling subscriptions, payments, and billing across all products
**Why it's important**: Simplified pricing strategies, cross-product upselling, and unified customer management
**How it works**: Shared billing package that manages Stripe customers, subscriptions, and webhook processing

### 5. Multi-App Architecture
**What it does**: Independent Next.js applications that can be developed, deployed, and scaled separately
**Why it's important**: Product isolation, team autonomy, and independent scaling
**How it works**: Each app in `apps/` folder with shared packages imported as dependencies

### 6. Migration-Ready Structure
**What it does**: Architecture designed to seamlessly migrate from Next.js full-stack to separate frontend/backend
**Why it's important**: Allows growth from simple monolith to microservices without rewrites
**How it works**: Service layer pattern with business logic separated from HTTP handling

## User Experience

### User Personas

**Primary: Sarah - Solo SaaS Founder**
- Needs to build and launch quickly with limited resources
- Wants to focus on product features, not infrastructure
- Plans to scale and potentially hire team members
- Values code quality and maintainability

**Secondary: Mike - Development Team Lead**
- Managing 3-5 developers building multiple products
- Needs clear separation of concerns for team productivity
- Requires scalable architecture for growing user base
- Values consistent patterns and shared tooling

### Key User Flows

**Developer Onboarding**:
1. Clone monorepo → `npm install` → `npm run dev`
2. All apps running locally with shared authentication
3. Make changes to shared components, see updates across all apps
4. Deploy individual apps independently

**New Product Development**:
1. Create new app in `apps/` folder
2. Import shared packages (`@saas/auth`, `@saas/ui`, etc.)
3. Focus on product-specific features
4. Reuse authentication, billing, and UI components

**Scaling and Migration**:
1. Extract API logic from Next.js to Node.js backend
2. Shared packages work identically in new environment
3. Update API endpoints, business logic remains unchanged
4. Deploy separately while maintaining shared database

### UI/UX Considerations

- **Consistent Design Language**: Shared UI components ensure uniform experience
- **Cross-Product Navigation**: Product switcher allows seamless movement between apps
- **Progressive Enhancement**: Start with simple layouts, enhance as products mature
- **Mobile-First Responsive**: All shared components designed for mobile compatibility

## Technical Architecture

### System Components

**Monorepo Structure**:
```
saas-platform/
├── apps/
│   ├── main-app/                    # Primary SaaS application
│   │   ├── app/
│   │   │   ├── (auth)/             # Auth route group
│   │   │   │   ├── login/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── register/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── forgot-password/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── auth/
│   │   │   │       └── callback/
│   │   │   │           └── page.tsx
│   │   │   ├── (dashboard)/        # Protected dashboard group
│   │   │   │   ├── layout.tsx      # Dashboard layout with nav
│   │   │   │   ├── page.tsx        # Dashboard home
│   │   │   │   ├── projects/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── new/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── team/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── members/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── invites/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── settings/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── profile/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── billing/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── integrations/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── security/
│   │   │   │   │       └── page.tsx
│   │   │   │   └── analytics/
│   │   │   │       └── page.tsx
│   │   │   ├── api/                # API routes
│   │   │   │   ├── auth/
│   │   │   │   │   └── callback/route.ts
│   │   │   │   ├── billing/
│   │   │   │   │   ├── checkout/route.ts
│   │   │   │   │   ├── portal/route.ts
│   │   │   │   │   └── webhooks/route.ts
│   │   │   │   ├── team/
│   │   │   │   │   ├── invite/route.ts
│   │   │   │   │   └── members/route.ts
│   │   │   │   ├── projects/
│   │   │   │   │   └── route.ts
│   │   │   │   └── health/route.ts
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx          # Root layout
│   │   │   └── page.tsx            # Root redirect
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── AuthForm.tsx
│   │   │   │   ├── OAuthButtons.tsx
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── DashboardNav.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── UserMenu.tsx
│   │   │   │   └── TeamSwitcher.tsx
│   │   │   ├── ui/                 # Local UI components
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   └── DataTable.tsx
│   │   │   └── providers/
│   │   │       ├── AuthProvider.tsx
│   │   │       ├── ThemeProvider.tsx
│   │   │       └── ToastProvider.tsx
│   │   ├── lib/
│   │   │   ├── auth-helpers.ts
│   │   │   ├── utils.ts
│   │   │   └── constants.ts
│   │   ├── __tests__/              # App-specific tests
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   └── api/
│   │   ├── middleware.ts           # Route protection
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   ├── vitest.config.ts
│   │   └── package.json
│   └── marketing-site/             # Future: Marketing website
│       ├── app/
│       │   ├── page.tsx            # Homepage
│       │   ├── products/
│       │   ├── pricing/
│       │   ├── about/
│       │   ├── blog/
│       │   └── contact/
│       ├── components/
│       │   ├── marketing/
│       │   └── layout/
│       └── package.json
├── packages/
│   ├── supabase/                   # Database & Supabase utilities
│   │   ├── src/
│   │   │   ├── client.ts           # Supabase client setup
│   │   │   ├── auth/               # Auth utilities
│   │   │   │   ├── index.ts
│   │   │   │   ├── providers.ts
│   │   │   │   ├── hooks.ts
│   │   │   │   └── server.ts
│   │   │   ├── database/           # Database operations
│   │   │   │   ├── users.ts
│   │   │   │   ├── tenants.ts
│   │   │   │   ├── subscriptions.ts
│   │   │   │   └── index.ts
│   │   │   ├── storage/            # File storage operations
│   │   │   │   ├── avatars.ts
│   │   │   │   ├── documents.ts
│   │   │   │   └── index.ts
│   │   │   ├── realtime/           # Realtime subscriptions
│   │   │   │   ├── notifications.ts
│   │   │   │   └── collaboration.ts
│   │   │   └── types/              # Generated types
│   │   │       └── database.ts
│   │   ├── __tests__/
│   │   │   ├── auth/
│   │   │   ├── database/
│   │   │   └── storage/
│   │   ├── vitest.config.ts
│   │   └── package.json
│   ├── billing/                    # Payment & subscription logic
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── stripe.ts           # Stripe integration
│   │   │   ├── plans.ts            # Subscription plans
│   │   │   ├── webhooks.ts         # Webhook handlers
│   │   │   ├── usage.ts            # Usage tracking
│   │   │   └── types.ts            # Billing types
│   │   ├── __tests__/
│   │   │   ├── stripe.test.ts
│   │   │   ├── plans.test.ts
│   │   │   └── webhooks.test.ts
│   │   ├── vitest.config.ts
│   │   └── package.json
│   ├── auth/                       # Authentication utilities
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── jwt.ts              # JWT utilities
│   │   │   ├── password.ts         # Password hashing
│   │   │   ├── session.ts          # Session management
│   │   │   ├── providers/          # OAuth providers
│   │   │   │   ├── google.ts
│   │   │   │   └── github.ts
│   │   │   ├── middleware.ts       # Auth middleware
│   │   │   └── types.ts            # Auth types
│   │   ├── __tests__/
│   │   │   ├── jwt.test.ts
│   │   │   ├── password.test.ts
│   │   │   └── session.test.ts
│   │   ├── vitest.config.ts
│   │   └── package.json
│   ├── email/                      # Email utilities
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── templates/          # Email templates
│   │   │   │   ├── welcome.tsx
│   │   │   │   ├── reset-password.tsx
│   │   │   │   └── invoice.tsx
│   │   │   ├── providers/          # Email providers
│   │   │   │   ├── resend.ts
│   │   │   │   └── sendgrid.ts
│   │   │   └── types.ts
│   │   ├── __tests__/
│   │   ├── vitest.config.ts
│   │   └── package.json
│   ├── ui/                         # Shared UI components
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── forms/          # Form components
│   │   │   │   │   ├── Input.tsx
│   │   │   │   │   ├── Select.tsx
│   │   │   │   │   ├── Textarea.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── data/           # Data display
│   │   │   │   │   ├── Table.tsx
│   │   │   │   │   ├── Chart.tsx
│   │   │   │   │   ├── StatCard.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── navigation/     # Navigation components
│   │   │   │   │   ├── Sidebar.tsx
│   │   │   │   │   ├── Breadcrumb.tsx
│   │   │   │   │   ├── Pagination.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── feedback/       # User feedback
│   │   │   │   │   ├── Toast.tsx
│   │   │   │   │   ├── Modal.tsx
│   │   │   │   │   ├── Loading.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   ├── styles/
│   │   │   │   ├── globals.css
│   │   │   │   └── components.css
│   │   │   ├── hooks/              # Shared React hooks
│   │   │   │   ├── useLocalStorage.ts
│   │   │   │   ├── useDebounce.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── __tests__/
│   │   │   ├── components/
│   │   │   └── hooks/
│   │   ├── vitest.config.ts
│   │   └── package.json
│   ├── lib/                        # Shared utilities
│   │   ├── src/
│   │   │   ├── utils.ts            # General utilities
│   │   │   ├── validation.ts       # Input validation
│   │   │   ├── formatting.ts       # Data formatting
│   │   │   ├── constants.ts        # Shared constants
│   │   │   └── index.ts
│   │   ├── __tests__/
│   │   ├── vitest.config.ts
│   │   └── package.json
│   └── types/                      # Shared TypeScript definitions
│       ├── src/
│       │   ├── api.ts              # API request/response types
│       │   ├── auth.ts             # Authentication types
│       │   ├── billing.ts          # Billing types
│       │   ├── database.ts         # Database entity types
│       │   ├── ui.ts               # UI component types
│       │   └── index.ts
│       ├── __tests__/
│       ├── vitest.config.ts
│       └── package.json
├── supabase/                       # Supabase project files
│   ├── migrations/                 # Database migrations
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_add_billing.sql
│   │   └── 003_add_multi_tenant.sql
│   ├── functions/                  # Edge functions
│   │   ├── process-payment/
│   │   └── send-notifications/
│   ├── seed.sql                    # Sample data
│   └── config.toml                 # Supabase configuration
├── tools/                          # Shared tooling
│   ├── eslint-config/              # Shared ESLint rules
│   │   ├── index.js
│   │   └── package.json
│   └── tsconfig/                   # Shared TypeScript configs
│       ├── base.json
│       ├── nextjs.json
│       ├── react-library.json
│       └── package.json
├── tests/                          # E2E tests
│   ├── e2e/
│   │   ├── auth-flow.spec.ts
│   │   ├── billing-flow.spec.ts
│   │   ├── dashboard.spec.ts
│   │   └── multi-tenant.spec.ts
│   ├── fixtures/
│   │   ├── users.json
│   │   └── test-data.sql
│   └── playwright.config.ts
├── .github/
│   └── workflows/
│       ├── test.yml
│       ├── deploy.yml
│       └── typecheck.yml
├── package.json                    # Root workspace config
├── turbo.json                      # Build orchestration
├── vitest.workspace.ts             # Vitest workspace config
├── .gitignore
├── .env.example
└── README.md
```

**Frontend Applications** (Next.js 15):
- Individual Next.js apps using App Router
- TypeScript for type safety
- Tailwind CSS for styling
- React 18 with concurrent features

**Backend Services**:
- Supabase as primary backend (Database, Auth, Storage, Realtime)
- Next.js API routes for custom business logic
- Stripe for payment processing
- Optional Node.js backend for complex operations

**Shared Packages**:
- `@saas/supabase`: Database client and operations
- `@saas/auth`: Authentication utilities and hooks
- `@saas/billing`: Stripe integration and payment logic
- `@saas/ui`: React component library
- `@saas/types`: Shared TypeScript definitions
- `@saas/lib`: Utility functions and helpers

### Data Models

**Core Entities**:
```typescript
interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  stripe_customer_id?: string;
  current_tenant_id?: string;
  created_at: string;
  updated_at: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

interface UserProduct {
  id: string;
  user_id: string;
  product_id: string;
  role: 'owner' | 'admin' | 'user';
  created_at: string;
}

interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  status: string;
  plan_id: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}
```

### APIs and Integrations

**Supabase Integration**:
- Authentication API for login/logout/OAuth
- Database API with Row Level Security
- Storage API for file uploads
- Realtime API for live updates

**Stripe Integration**:
- Checkout Sessions for subscription creation
- Customer Portal for subscription management
- Webhooks for payment status updates
- Usage-based billing for product features

**Internal APIs**:
- RESTful endpoints for CRUD operations
- Type-safe API clients with shared TypeScript types
- Consistent error handling and response formats

### Infrastructure Requirements

**Development Environment**:
- Node.js 24.x LTS
- npm/yarn workspaces for monorepo management
- Turbo for build orchestration
- Local Supabase instance for development

**Production Environment**:
- Vercel for Next.js app hosting
- Supabase cloud for backend services
- Custom domains with subdomain routing
- CDN for static assets and shared components

**Technology Stack**:
- **Frontend**: Next.js 15, React 18, TypeScript 5.x, Tailwind CSS 3.x
- **Backend**: Supabase JS v2, Node.js 24.x LTS
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth with OAuth providers
- **Payments**: Stripe API 2025-05-28.basil
- **Build Tools**: Turbo 2.x, TypeScript 5.x
- **Deployment**: Vercel, Supabase Cloud


## Risks and Mitigations

### Technical Challenges

**Risk**: Monorepo complexity overwhelming small teams
**Mitigation**: Start with minimal workspace setup, add complexity gradually. Document setup process thoroughly.

**Risk**: Shared package versioning conflicts
**Mitigation**: Use exact versions, implement automated testing, establish clear breaking change policies.

**Risk**: Supabase vendor lock-in
**Mitigation**: Abstract database operations behind repository pattern, making migration to other databases possible.

**Risk**: Next.js API route limitations at scale
**Mitigation**: Design service layer pattern from start, making extraction to Node.js backend straightforward.

### MVP Definition and Scope

**Risk**: Over-engineering the initial version
**Mitigation**: Focus on single-app functionality first. Prove core value proposition before adding multi-app complexity.

**Risk**: Under-estimating authentication complexity
**Mitigation**: Use Supabase Auth to handle complexity. Implement OAuth early to validate integration patterns.

**Risk**: Billing integration blocking other development
**Mitigation**: Implement billing as separate phase. Use feature flags to enable/disable billing features.

### Resource Constraints

**Risk**: Documentation and testing falling behind
**Mitigation**: Include documentation and testing in each phase deliverables. Use automated tools where possible.

**Risk**: Deployment complexity increasing rapidly
**Mitigation**: Use platform-as-a-service solutions (Vercel, Supabase Cloud) to minimize DevOps overhead.

**Risk**: Team knowledge gaps in monorepo patterns
**Mitigation**: Invest in team education early. Create clear contribution guidelines and architectural decision records.

## Appendix

### Research Findings

**Monorepo Benefits Validation**:
- Reduced code duplication by 60-80% in similar projects
- Faster feature development across multiple products
- Improved code consistency and shared tooling adoption

**Technology Stack Validation**:
- Next.js 15 provides stable App Router with improved performance
- Supabase offers complete backend-as-a-service with strong TypeScript support
- Stripe's latest API version provides enhanced subscription management features

### Technical Specifications

**Package Dependencies**:
```json
{
  "next": "^15.3.2",
  "@supabase/supabase-js": "^2.49.8",
  "stripe": "^18.2.0",
  "typescript": "^5.8.3",
  "tailwindcss": "^4.1.8",
  "turbo": "^2.5.4",
  "vitest": "^2.1.8",
  "@testing-library/react": "^16.1.0",
  "@testing-library/jest-dom": "^6.6.3",
  "@testing-library/user-event": "^14.5.2",
  "playwright": "^1.49.1",
  "jsdom": "^25.0.1"
}
```

**Development Tools**:
- ESLint 9.x with shared configuration
- Prettier for consistent code formatting
- Vitest 2.x for unit and integration testing
- Testing Library for React component testing
- Playwright for end-to-end testing
- JSDOM for DOM simulation in tests
- GitHub Actions for CI/CD

**Browser Support**:
- Modern browsers with ES2024 support
- Mobile-first responsive design
- Progressive Web App capabilities

**Performance Targets**:
- Initial page load: < 2 seconds
- Time to Interactive: < 3 seconds
- Bundle size per app: < 500KB gzipped
- Database query response: < 100ms average

### Security Considerations

**Authentication Security**:
- JWT tokens with proper expiration
- OAuth 2.0 implementation following best practices
- Rate limiting on authentication endpoints
- Secure session management

**Data Protection**:
- Row Level Security enforced at database level
- Input validation and sanitization
- HTTPS enforced in production
- Sensitive data encryption at rest

**API Security**:
- CORS properly configured
- API rate limiting implemented
- Request validation middleware
- Audit logging for sensitive operations