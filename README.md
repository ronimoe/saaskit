# SaaS Kit Monorepo

A production-ready SaaS platform built with Next.js 15, Supabase, and TypeScript. This
monorepo architecture enables rapid development while maintaining the flexibility to scale into
multiple products and migrate to microservices as needed.

## 🚀 Features

- **Root-Level Next.js Application**: Production-ready SaaS app with optimized Vercel deployment
- **Production Supabase Integration**: Complete cloud database setup with real-time capabilities
- **Comprehensive Database Schema**: Users, Products, Subscriptions, and User-Product relationships
- **Advanced Row Level Security**: Production-ready RLS policies with performance optimization
- **Type-Safe Database Operations**: Generated TypeScript types and comprehensive CRUD operations
- **Database Status Monitoring**: Real-time database health dashboard with schema visualization
- **Modern UI Components**: Beautiful, accessible shadcn/ui components with dark mode support
- **Authentication Ready**: Supabase Auth integration with OAuth provider support
- **Storage Operations**: Complete file upload/download with signed URL generation
- **Real-time Subscriptions**: Live database change notifications with proper channel management
- **Modern Testing**: Comprehensive test coverage (86%+) with Vitest and Testing Library
- **Migration-Ready**: Service layer pattern designed for seamless backend extraction
- **Fast Development**: Turbo for build orchestration and hot reloading

## 🏗️ Architecture

```
saaskit/
├── app/                    # Next.js 15 App Router (root-level application)
│   ├── database-status/   # Database monitoring dashboard
│   ├── packages/          # Package showcase page
│   └── structure/         # Monorepo structure visualization
├── lib/                   # Application-specific utilities
│   └── supabase/         # Client-side Supabase helpers
├── packages/              # Shared packages
│   ├── supabase/         # ✅ Production-ready database client & operations
│   ├── auth/             # Authentication utilities (coming soon)
│   ├── billing/          # Stripe integration & payment logic (coming soon)
│   ├── ui/               # ✅ Beautiful shadcn/ui components with design system
│   ├── lib/              # Utility functions
│   └── types/            # TypeScript definitions
├── supabase/             # Database migrations & edge functions
├── tools/                # Shared tooling (ESLint, TypeScript configs)
└── tests/                # E2E tests with Playwright (coming soon)
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.3.3, React 19, TypeScript 5.8.3
- **Backend**: Supabase Cloud (PostgreSQL 17.4, Auth, Storage, Real-time)
- **Database**: Production-ready schema with Users, Products, Subscriptions, User-Products tables
- **Security**: Advanced Row Level Security (RLS) policies with performance optimization
- **Testing**: Vitest 3.2.2, Testing Library with 86%+ coverage
- **Build**: Turbo 2.5.4, pnpm workspace, Node.js 18+ LTS
- **Styling**: Tailwind CSS 4.1.8 with shadcn/ui components
- **UI Components**: Radix UI primitives, Lucide React icons, class-variance-authority
- **Payments**: Stripe 18.2.0 (integration ready)
- **Package Manager**: pnpm 10.11.1 with workspace support

## 📋 Prerequisites

- Node.js 18 LTS or higher
- pnpm 10.0+ (recommended package manager)
- Supabase account with active project
- Stripe account (for future billing features)

## ⚡ Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd saaskit
pnpm install
```

### 2. Environment Setup

Copy and configure your environment variables:

```bash
cp .env.example .env
```

Fill in your Supabase project details:

```env
# Supabase (Required - Get from https://supabase.com/dashboard/project/_/settings/api)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI Services (Optional - for Task Master AI)
ANTHROPIC_API_KEY=your_anthropic_key
PERPLEXITY_API_KEY=your_perplexity_key

# Future Features
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

The database schema is already set up in your Supabase project with:
- ✅ **Users table** with authentication integration
- ✅ **Products table** for SaaS features/plans
- ✅ **User-Products table** with role-based relationships
- ✅ **Subscriptions table** for billing management
- ✅ **Row Level Security policies** for data protection
- ✅ **Real-time capabilities** enabled

### 4. Development

```bash
# Start the development server
pnpm dev

# This starts the main application with database monitoring
```

Visit:

- **Main Application**: http://localhost:3000
- **Database Status**: http://localhost:3000/database-status
- **Package Overview**: http://localhost:3000/packages
- **Monorepo Structure**: http://localhost:3000/structure

## 📁 Project Structure

### Root Application

The main SaaS application is located at the root level for optimal Vercel deployment:

- **`app/`**: Next.js 15 App Router with production-ready pages
- **`lib/`**: Application-specific utilities and Supabase helpers
- **Configuration files**: All Next.js configs are at the root level

### Shared Packages

- **`@saas/supabase`**: ✅ Production-ready database client with comprehensive operations
  - Complete CRUD operations for all tables
  - Authentication utilities with OAuth support
  - File storage with upload/download/signed URLs
  - Real-time subscriptions with proper cleanup
  - 86%+ test coverage with robust error handling
- **`@saas/auth`**: Authentication hooks, utilities, and middleware (coming soon)
- **`@saas/billing`**: Stripe integration and payment processing (coming soon)
- **`@saas/ui`**: (Removed - UI components now live at app level for better maintainability)
- **`@saas/lib`**: Utility functions and helpers
- **`@saas/types`**: Shared TypeScript type definitions

### Key Files

- **`components.json`**: shadcn/ui configuration for beautiful UI components
- **`turbo.json`**: Build orchestration and caching configuration
- **`vitest.workspace.ts`**: Testing workspace configuration
- **`vercel.json`**: Optimized Vercel deployment configuration
- **`supabase/config.toml`**: Supabase project configuration

## 🧪 Testing

### Unit & Integration Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Test specific package
pnpm test --filter=@saas/supabase
```

### Current Test Coverage

- **`@saas/supabase`**: 86.17% coverage with 172 tests
  - ✅ Authentication helpers: 95.87% coverage
  - ✅ Storage operations: 100% coverage
  - ✅ Real-time subscriptions: 100% coverage
  - ✅ Database operations: 80.35% coverage
  - ✅ Client configuration: 76.92% coverage
- **App-level Components**: Component tests now at app level (UI package removed)

### End-to-End Tests

```bash
# Run E2E tests (coming soon)
pnpm test:e2e

# Run E2E tests in UI mode (coming soon)
pnpm test:e2e:ui
```

## 🏃‍♂️ Development Workflow

### Adding a New Feature

1. **Identify the right package** for your feature
2. **Write tests first** in the package's `__tests__/` folder
3. **Implement the feature** following existing patterns
4. **Update types** in `@saas/types` if needed
5. **Test across apps** to ensure compatibility

### Creating a New Package

```bash
# Create package structure
mkdir packages/new-feature
cd packages/new-feature

# Initialize package
npm init -y
touch vitest.config.ts
mkdir -p src/__tests__
```

### Migration Notes

✅ **Root-Level Migration Completed** (January 2025)

The monorepo has been successfully migrated from a multi-app structure (`apps/`) to a root-level Next.js application for:
- Optimal Vercel deployment with zero configuration
- Simplified development workflow
- Better alignment with Next.js best practices
- Maintained all existing functionality including database monitoring

Previous `apps/web`, `apps/main-app`, and `apps/marketing-site` directories have been consolidated into the root-level application.

## 📦 Package Scripts

### Root Scripts

```bash
pnpm dev                 # Start web app in development mode
pnpm build               # Build all apps and packages
pnpm test                # Run all tests with coverage
pnpm lint                # Lint all packages
pnpm typecheck           # Type check all packages
pnpm clean               # Clean all build artifacts
```

### Package-Specific Scripts

```bash
pnpm dev                            # Start root application
pnpm test --filter=@saas/supabase   # Test Supabase package only
pnpm build --filter=@saas/*         # Build all packages only
pnpm build:packages                 # Build packages only (via Turbo)
```

### Database Status Monitoring

Visit `http://localhost:3000/database-status` to see:
- ✅ Real-time Supabase connection health
- ✅ Complete database schema visualization
- ✅ Live table row counts and statistics
- ✅ Connection latency monitoring
- ✅ RLS policy status indicators
- ✅ Interactive CRUD operation demos

### UI Components & Design System

The application features a beautiful, modern design system built with shadcn/ui:

- **🎨 Modern Design**: Clean, professional interface with Tailwind CSS v4
- **🌙 Dark Mode**: Automatic theme switching with system preference detection
- **♿ Accessibility**: WCAG compliant components with proper ARIA labels
- **📱 Responsive**: Mobile-first design that works on all screen sizes
- **🎯 Component Library**: Modern UI components (to be implemented with shadcn/ui at app level):
  - Will include Button variants, Card system, Form components
  - Navigation, Loading states, and modern animations
  - Better maintainability and faster development

**Components will be available at:**
```typescript
// Coming soon - app-level components
import { Button, Card, Input, Label, Dialog } from './components/ui'
```

**Design Tokens:** CSS variables for consistent theming across light/dark modes

## 🗄️ Database Schema

### Production Database Tables

The Supabase database includes a complete multi-tenant SaaS schema:

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Products Table
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### User-Products Relationship
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

#### Subscriptions Table
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

### Security Features

- **Row Level Security (RLS)**: All tables have comprehensive RLS policies
- **Performance Optimized**: Using `(SELECT auth.uid())` for function caching
- **Multi-tenant Ready**: User-based data isolation
- **GDPR Compliant**: User deletion cascades properly

### Database Functions

- **`get_rls_status()`**: Returns RLS policy status for all tables
- **`get_table_schema()`**: Returns complete schema information

## 🚀 Deployment

### Vercel (Recommended)

The application is optimized for zero-configuration Vercel deployment:

```bash
# Deploy from root directory
vercel --prod

# Or link and deploy
vercel link
vercel --prod
```

The root-level Next.js application will be automatically detected and deployed by Vercel.

### Environment Variables

Set these in your deployment platform:

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_APP_URL=https://yourapp.com
```

## 🔐 Security

### Authentication

- JWT tokens with proper expiration
- OAuth 2.0 with Google, GitHub providers
- Row Level Security (RLS) enforced at database level
- Session management with automatic refresh

### Data Protection

- All sensitive data encrypted at rest
- HTTPS enforced in production
- Input validation and sanitization
- Rate limiting on API endpoints

## 🔄 Migration Path

This architecture is designed to evolve:

### Current: Next.js Full-Stack

- All apps use Next.js API routes
- Shared packages for business logic
- Single Supabase database

### Future: Microservices

- Extract API logic to Node.js backends
- Same shared packages work identically
- Independent scaling and deployment
- Gradual migration app by app

## 🤝 Contributing

### Code Style

- Use TypeScript for all new code
- Follow ESLint configuration
- Write tests for new features
- Update documentation

### Pull Request Process

1. Create feature branch from `main`
2. Make changes following existing patterns
3. Add/update tests
4. Ensure all tests pass
5. Update documentation if needed
6. Submit PR with clear description

### Commit Messages

Use conventional commits:

```
feat(auth): add OAuth provider support
fix(billing): handle failed payment webhooks
docs(readme): update installation instructions
test(ui): add Button component tests
```

## 🐛 Troubleshooting

### Common Issues

**Build Errors**:

```bash
# Clear cache and reinstall
npm run clean
rm -rf node_modules package-lock.json
npm install
```

**Database Connection**:

```bash
# Check Supabase status
npx supabase status

# Reset local database
npx supabase db reset
```

**Type Errors**:

```bash
# Regenerate Supabase types
npx supabase gen types typescript --local > packages/supabase/src/types/database.ts
```

### Getting Help

- Check the [troubleshooting guide](docs/troubleshooting.md)
- Review existing [GitHub issues](link-to-issues)
- Join our [Discord community](link-to-discord)

## 📚 Documentation

- [Architecture Guide](docs/architecture.md)
- [API Reference](docs/api.md)
- [Component Library](docs/components.md)
- [Deployment Guide](docs/deployment.md)
- [Migration Guide](docs/migration.md)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Supabase](https://supabase.com/) for the backend-as-a-service platform
- [Stripe](https://stripe.com/) for payment processing
- [Vercel](https://vercel.com/) for deployment and hosting
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling

---

**Built with ❤️ for modern SaaS development**
