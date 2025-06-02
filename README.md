# SaaS Platform Monorepo

A modern, migration-ready SaaS platform built with Next.js 15, Supabase, and TypeScript. This monorepo architecture enables rapid development while maintaining the flexibility to scale into multiple products and migrate to microservices as needed.

## 🚀 Features

- **Multi-App Architecture**: Independent Next.js applications sharing common packages
- **Unified Authentication**: Supabase Auth with JWT tokens, OAuth providers, and session management
- **Shared Component Library**: Consistent UI components and design system across all apps
- **Centralized Billing**: Stripe integration for subscriptions and payments
- **Type-Safe Database**: Supabase with generated TypeScript types and Row Level Security
- **Migration-Ready**: Service layer pattern designed for seamless backend extraction
- **Modern Testing**: Vitest for unit/integration tests, Playwright for E2E testing
- **Fast Development**: Turbo for build orchestration and hot reloading

## 🏗️ Architecture

```
saas-platform/
├── apps/                    # Independent Next.js applications
│   ├── main-app/           # Primary SaaS application
│   └── marketing-site/     # Marketing website (future)
├── packages/               # Shared packages
│   ├── supabase/          # Database operations & Supabase client
│   ├── auth/              # Authentication utilities
│   ├── billing/           # Stripe integration & payment logic
│   ├── ui/                # Shared React components
│   ├── lib/               # Utility functions
│   └── types/             # TypeScript definitions
├── supabase/              # Database migrations & edge functions
├── tools/                 # Shared tooling (ESLint, TypeScript configs)
└── tests/                 # E2E tests with Playwright
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.3.2, React 18, TypeScript 5.8.3
- **Backend**: Supabase (Database, Auth, Storage, Realtime)
- **Styling**: Tailwind CSS 4.1.8
- **Payments**: Stripe 18.2.0
- **Testing**: Vitest 2.1.8, Testing Library, Playwright 1.49.1
- **Build**: Turbo 2.5.4, Node.js 24 LTS
- **Database**: PostgreSQL (via Supabase)

## 📋 Prerequisites

- Node.js 24 LTS or higher
- npm or yarn
- Supabase account
- Stripe account (for billing features)

## ⚡ Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd saas-platform
npm install
```

### 2. Environment Setup

Copy the environment template:

```bash
cp .env.example .env.local
```

Fill in your environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

```bash
# Start Supabase locally (optional for development)
npx supabase start

# Or use your cloud Supabase project
# Run migrations
npx supabase db push
```

### 4. Development

```bash
# Start all apps in development mode
npm run dev

# Or start specific apps
npm run dev:main        # Main SaaS app
npm run dev:marketing   # Marketing site
```

Visit:
- Main App: http://localhost:3000
- Marketing Site: http://localhost:3001

## 📁 Project Structure

### Apps

- **`apps/main-app/`**: Primary SaaS application with dashboard and core features
- **`apps/marketing-site/`**: Marketing website with landing pages (future)

### Shared Packages

- **`@saas/supabase`**: Database client, operations, and Supabase utilities
- **`@saas/auth`**: Authentication hooks, utilities, and middleware  
- **`@saas/billing`**: Stripe integration and payment processing
- **`@saas/ui`**: Shared React components and design system
- **`@saas/lib`**: Utility functions and helpers
- **`@saas/types`**: Shared TypeScript type definitions

### Key Files

- **`turbo.json`**: Build orchestration and caching configuration
- **`vitest.workspace.ts`**: Testing workspace configuration
- **`supabase/config.toml`**: Supabase project configuration

## 🧪 Testing

### Unit & Integration Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Test specific package
npm run test --filter=@saas/auth
```

### End-to-End Tests

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui
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

### Adding a New App

```bash
# Create new Next.js app
npx create-next-app@latest apps/new-app --typescript --tailwind --eslint --app --no-src-dir

# Install shared packages
cd apps/new-app
npm install @saas/ui @saas/auth @saas/supabase @saas/billing @saas/types @saas/lib
```

## 📦 Package Scripts

### Root Scripts

```bash
npm run dev              # Start all apps in development
npm run build            # Build all apps and packages
npm run test             # Run all tests
npm run lint             # Lint all packages
npm run typecheck        # Type check all packages
npm run clean            # Clean all build artifacts
```

### Package-Specific Scripts

```bash
npm run dev:main         # Start main app only
npm run build:apps       # Build only apps
npm run test:packages    # Test only packages
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Deploy main app
vercel --prod apps/main-app

# Deploy marketing site  
vercel --prod apps/marketing-site
```

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