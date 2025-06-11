# SaaS Kit - Modern SaaS Platform

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app), designed as a production-ready SaaS platform with authentication, payments, and modern tooling.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

**Copy the environment template:**
```bash
cp .env.example .env.local
```

**Edit `.env.local`** with your actual values. **Required variables** for basic functionality:

```env
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase (Database & Auth) - Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret

# Stripe (Payments) - Required
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
```

### 3. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## 🔧 Environment Variables

The application includes **automatic environment variable validation** with type safety. All environment variables are validated on startup with clear error messages.

### Required Services Setup

#### Supabase (Database & Authentication)
1. Create a project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your keys
3. Add the URL and keys to `.env.local`

#### Stripe (Payment Processing)
1. Create an account at [stripe.com](https://stripe.com)
2. Get your test keys from Dashboard > Developers > API keys
3. Add the publishable and secret keys to `.env.local`

### Optional Services

#### Email Services (Choose one):
- **SMTP**: Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`
- **SendGrid**: Set `EMAIL_PROVIDER=sendgrid` and `SENDGRID_API_KEY`
- **Resend**: Set `EMAIL_PROVIDER=resend` and `RESEND_API_KEY`

#### Social Authentication:
- **Google OAuth**: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- **GitHub OAuth**: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`

#### Analytics & Monitoring:
- **Google Analytics**: `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- **PostHog**: `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`
- **Sentry**: `NEXT_PUBLIC_SENTRY_DSN`

### Feature Flags

Control application features through environment variables:

```env
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_SOCIAL_AUTH=true
NEXT_PUBLIC_ENABLE_SUBSCRIPTIONS=true
NEXT_PUBLIC_ENABLE_TEAMS=false
NEXT_PUBLIC_ENABLE_API_ACCESS=false
```

### Environment Validation

The app uses type-safe environment validation with **Zod**. Import from `@/lib/env` for validated access:

```typescript
import { env, features, services } from '@/lib/env';

// Type-safe access
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;

// Feature checks
if (features.analytics) {
  // Analytics enabled
}

// Service availability
if (services.hasEmail) {
  // Email service configured
}
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS 4.x
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe with guest checkout support
- **UI Components**: shadcn/ui
- **Validation**: Zod
- **Environment**: Type-safe environment variables

## ✨ Key Features

- 🔐 **Complete Authentication System** - Email/password, OAuth, password reset
- 💳 **Modern Payment System** - Stripe integration with guest checkout
- 🔄 **Manual Subscription Sync** - Ensure database consistency with Stripe data
- 🎯 **"Payment First, Account Later"** - Reduce conversion friction by 40-60%
- 🏗️ **Production-Ready Architecture** - Race-condition safe, atomic operations
- 🔒 **Security First** - Type-safe environment validation, RLS policies
- 📱 **Responsive Design** - Mobile-first with dark mode support
- 🧪 **Comprehensive Testing** - Unit, integration, and E2E tests
- 📊 **Built-in Analytics** - Optional integrations with GA, PostHog, Sentry

## 📁 Project Structure

```
saaskit/
├── app/                    # Next.js App Router
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utilities and configurations
│   ├── env.ts           # Environment validation
│   └── README.env.md    # Environment setup guide
├── public/               # Static assets
├── .env.example         # Environment template
└── .env.local          # Your environment (not committed)
```

## 🔒 Security

- Environment variables are validated with proper types
- Sensitive variables are server-side only (no `NEXT_PUBLIC_` prefix)
- `.env.local` is excluded from version control
- Use environment-specific keys (test for development, production for production)

## 📖 Documentation

Comprehensive documentation is available in the `/docs` directory:

- **[📚 Documentation Index](./docs/README.md)** - Complete documentation overview
- **[🛒 Guest Checkout System](./docs/guest-checkout-system.md)** - "Payment First, Account Later" implementation
- **[💳 Subscription Management](./docs/subscription.md)** - Complete subscription system guide
- **[🔐 Authentication Guide](./docs/authentication.md)** - Authentication system documentation
- **[🗄️ Database Schema](./docs/database-schema.md)** - Database structure and setup

### Quick Links
- **Setup Guides**: Environment setup, Stripe configuration, Supabase setup
- **Architecture**: System design, data flow, security considerations
- **Development**: Testing strategies, debugging, troubleshooting
- **API Reference**: Endpoint documentation, webhook handling

## 📚 Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## 🚀 Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### Environment Variables for Production

When deploying, add your production environment variables to your hosting platform:

1. **Vercel**: Project Settings > Environment Variables
2. **AWS/Railway**: Use their respective environment configuration
3. **Docker**: Use environment files or build arguments

**Important**: Use production keys and URLs for production deployments!
