# SaaS Kit - Modern Next.js SaaS Platform

<div align="center">

![SaaS Kit](https://img.shields.io/badge/SaaS%20Kit-v0.1.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-Latest-green)
![Stripe](https://img.shields.io/badge/Stripe-Latest-purple)

A production-ready SaaS platform built with Next.js 15, TypeScript, Supabase, and Stripe. Features modern authentication, payments, and comprehensive development tools.

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [CLI Tool](#-cli-tool) • [Deploy](#-deployment)

</div>

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

Run our interactive setup script to configure your project:

```bash
# Clone or download the repository
git clone <your-repo-url>
cd saaskit

# Run the automated setup
npm run setup
```

The setup script will:
- ✅ Check system requirements
- ✅ Configure project settings interactively
- ✅ Generate environment files
- ✅ Set up package.json with your project details
- ✅ Initialize Git repository (optional)
- ✅ Guide you through service configuration

### Option 2: Manual Setup

If you prefer manual setup:

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual values
   ```

3. **Start Development**
   ```bash
   npm run dev
   ```

## 🛠️ CLI Tool

SaaS Kit includes a powerful CLI tool for development workflow:

```bash
# Generate components
npm run generate component Button
npm run generate page dashboard
npm run generate api users
npm run generate hook useAuth

# Or use the CLI directly
npm run cli template list
npm run cli config show
npm run cli deploy vercel
```

### Available Commands

| Command | Description | Example |
|---------|-------------|---------|
| `init` | Initialize new project | `saas-cli init my-app` |
| `generate` | Generate components/pages | `saas-cli generate component Button` |
| `template` | Manage templates | `saas-cli template list` |
| `config` | Project configuration | `saas-cli config show` |
| `deploy` | Deploy to platforms | `saas-cli deploy vercel` |

### Template Types

- **component** - React component with TypeScript, tests, and exports
- **page** - Next.js page with metadata and TypeScript
- **api** - Next.js API route with error handling
- **hook** - Custom React hook with TypeScript interfaces

## ✨ Features

### 🔐 Authentication & Security
- Complete authentication system with Supabase Auth
- Email/password, OAuth (Google, GitHub), password reset
- Type-safe environment validation with Zod
- Row Level Security (RLS) policies
- Session management and middleware protection

### 💳 Payment System
- Stripe integration with guest checkout support
- "Payment First, Account Later" flow (reduces friction by 40-60%)
- Manual subscription sync for data consistency
- Race-condition safe payment processing
- Support for multiple subscription plans

### 🎨 Modern UI/UX
- Built with shadcn/ui and Radix UI primitives
- Tailwind CSS 4.x for styling
- Dark mode support with next-themes
- Responsive design (mobile-first)
- Accessible components out of the box

### 🧪 Development Experience
- TypeScript with strict mode
- Comprehensive testing setup (Jest, Testing Library)
- ESLint and Prettier configuration
- Hot reload and fast refresh
- Built-in CLI tool for code generation

### 📊 Analytics & Monitoring
- Optional integrations with Google Analytics, PostHog, Sentry
- Feature flags for controlled rollouts
- Environment-specific configurations
- Performance monitoring and error tracking

## 🏗️ Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| **Framework** | Next.js | 15.3.3 |
| **Language** | TypeScript | 5.0+ |
| **Styling** | Tailwind CSS | 4.x |
| **Database** | Supabase (PostgreSQL) | Latest |
| **Authentication** | Supabase Auth | Latest |
| **Payments** | Stripe | 18.2.1 |
| **UI Components** | shadcn/ui + Radix UI | Latest |
| **Validation** | Zod | 3.25+ |
| **State Management** | Zustand | 5.0+ |
| **Testing** | Jest + Testing Library | Latest |

## 📁 Project Structure

```
saaskit/
├── app/                    # Next.js 15 App Router
│   ├── (auth)/            # Authentication pages
│   ├── api/               # API routes
│   ├── billing/           # Billing and subscription pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── auth/             # Authentication components
│   └── layout/           # Layout components
├── lib/                  # Utilities and configurations
│   ├── auth-utils.ts     # Authentication utilities
│   ├── database-utils.ts # Database helpers
│   ├── env.ts           # Environment validation
│   └── supabase.ts      # Supabase client
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
├── scripts/              # Development scripts
│   ├── setup-project.js  # Automated setup script
│   └── saas-cli.js       # CLI tool
├── docs/                 # Documentation
└── .env.example         # Environment template
```

## 🔧 Environment Configuration

### Required Variables

```env
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Your SaaS App"

# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe (Required for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret
```

### Optional Services

<details>
<summary>Click to expand optional configuration</summary>

```env
# Email Services (Choose one)
EMAIL_PROVIDER=smtp|sendgrid|resend
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Social Authentication
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Analytics & Monitoring
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_POSTHOG_KEY=phc_your_posthog_key
NEXT_PUBLIC_SENTRY_DSN=https://your_sentry_dsn

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_SOCIAL_AUTH=true
NEXT_PUBLIC_ENABLE_SUBSCRIPTIONS=true
NEXT_PUBLIC_ENABLE_TEAMS=false
```

</details>

### Environment Validation

The app uses type-safe environment validation:

```typescript
import { env, features, services } from '@/lib/env';

// Type-safe access
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;

// Feature checks
if (features.analytics) {
  // Analytics enabled
}
```

## 🧪 Development

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Run ESLint |
| `npm run setup` | Run project setup script |
| `npm run cli` | Access CLI tool |
| `npm run generate` | Generate components |

### Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test Button.test.tsx
```

### Code Generation

Generate new components, pages, and API routes:

```bash
# Generate a new component
npm run generate component UserProfile

# Generate a new page
npm run generate page dashboard

# Generate an API route
npm run generate api users

# Generate a custom hook
npm run generate hook useLocalStorage
```

## 📖 Documentation

Comprehensive documentation is available in the `/docs` directory:

### Setup Guides
- **[Environment Setup](./docs/README.md)** - Complete environment configuration
- **[Stripe Setup](./docs/stripe-setup.md)** - Payment system configuration
- **[Supabase Setup](./docs/database-schema.md)** - Database and authentication setup

### System Guides
- **[Authentication](./docs/authentication.md)** - Complete auth system guide
- **[Guest Checkout](./docs/guest-checkout-system.md)** - "Payment First" implementation
- **[Subscription Management](./docs/subscription.md)** - Billing and subscriptions
- **[Database Schema](./docs/database-schema.md)** - Database structure

### Development
- **[Testing Guide](./docs/README.md)** - Testing strategies and examples
- **[API Reference](./docs/README.md)** - Endpoint documentation
- **[Troubleshooting](./docs/README.md)** - Common issues and solutions

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel --prod
   ```

2. **Environment Variables**
   - Go to Vercel Dashboard > Project Settings > Environment Variables
   - Add all required environment variables
   - Use production values for production deployment

### Other Platforms

<details>
<summary>Netlify, Railway, AWS</summary>

**Netlify:**
```bash
npm i -g netlify-cli
netlify deploy --prod
```

**Railway:**
1. Connect GitHub repository
2. Set environment variables in dashboard
3. Deploy automatically on push

**AWS/Google Cloud:**
- Use Docker deployment
- Configure environment variables in your platform
- Set up CI/CD pipeline

</details>

### Environment Variables for Production

When deploying, ensure you have production values for:

- `NEXT_PUBLIC_APP_URL` (your domain)
- `NEXT_PUBLIC_SUPABASE_URL` (production Supabase project)
- `SUPABASE_SERVICE_ROLE_KEY` (production service role key)
- `STRIPE_SECRET_KEY` (production Stripe key)
- `STRIPE_WEBHOOK_SECRET` (production webhook secret)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Use TypeScript for all new code
- Follow the existing code style and patterns
- Add tests for new features
- Update documentation as needed
- Use the CLI tool for generating new components

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for production
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [Stripe](https://stripe.com/) - Payment processing platform
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

## 📞 Support

- 📖 [Documentation](./docs/)
- 🐛 [Issues](https://github.com/your-repo/issues)
- 💬 [Discussions](https://github.com/your-repo/discussions)
- 📧 Email: support@yourapp.com

---

<div align="center">

**Built with ❤️ using SaaS Kit**

[⭐ Star this repo](https://github.com/your-repo) • [🐛 Report Bug](https://github.com/your-repo/issues) • [💡 Request Feature](https://github.com/your-repo/issues)

</div>
