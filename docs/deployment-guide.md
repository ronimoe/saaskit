# SaaS Kit Deployment Guide

Complete deployment guide for the SaaS Kit across multiple platforms and environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Platform-Specific Deployment](#platform-specific-deployment)
  - [Vercel (Recommended)](#vercel-recommended)
  - [Netlify](#netlify)
  - [Railway](#railway)
  - [AWS](#aws)
  - [Google Cloud Platform](#google-cloud-platform)
  - [DigitalOcean](#digitalocean)
- [Database Setup](#database-setup)
- [External Services Configuration](#external-services-configuration)
- [Post-Deployment Checklist](#post-deployment-checklist)
- [Monitoring and Maintenance](#monitoring-and-maintenance)

## Prerequisites

Before deploying, ensure you have:

- ✅ **Node.js 18+** installed locally
- ✅ **Git** repository set up
- ✅ **Supabase** project created
- ✅ **Stripe** account configured
- ✅ **Domain name** (for production)
- ✅ **SSL certificate** (handled by most platforms)

## Environment Configuration

### Required Environment Variables

Create these environment variables in your deployment platform:

```env
# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME="Your SaaS App"
NEXT_PUBLIC_COMPANY_NAME="Your Company"

# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe (Required for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
STRIPE_SECRET_KEY=sk_live_your_stripe_secret
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_SOCIAL_AUTH=true
NEXT_PUBLIC_ENABLE_SUBSCRIPTIONS=true
```

### Optional Environment Variables

```env
# Social Authentication
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Email Services (Choose one)
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your_sendgrid_key
# OR
EMAIL_PROVIDER=resend
RESEND_API_KEY=your_resend_key

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_POSTHOG_KEY=phc_your_posthog_key

# Error Monitoring
NEXT_PUBLIC_SENTRY_DSN=https://your_sentry_dsn
```

## Platform-Specific Deployment

### Vercel (Recommended)

Vercel provides the best experience for Next.js applications.

#### 1. Deploy via Git Integration

```bash
# Install Vercel CLI
npm i -g vercel

# Connect your repository
vercel --prod

# Or deploy directly
vercel deploy --prod
```

#### 2. Configure Environment Variables

1. Go to **Vercel Dashboard** → **Project Settings** → **Environment Variables**
2. Add all required environment variables
3. Set environment to **Production**
4. Save changes

#### 3. Custom Domain Setup

1. Go to **Project Settings** → **Domains**
2. Add your custom domain
3. Configure DNS records as instructed
4. Wait for SSL certificate provisioning

#### 4. Vercel-Specific Configuration

Create `vercel.json` for advanced configuration:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm ci",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

### Netlify

Deploy to Netlify with automatic builds and deployments.

#### 1. Build Configuration

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[context.production.environment]
  NODE_ENV = "production"
```

#### 2. Deploy Steps

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod --dir=.next
```

#### 3. Environment Variables

1. Go to **Site Settings** → **Environment Variables**
2. Add all required variables
3. Redeploy the site

### Railway

Railway provides simple deployment with automatic scaling.

#### 1. Deploy via CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway deploy
```

#### 2. Environment Variables

```bash
# Set variables via CLI
railway variables set NEXT_PUBLIC_APP_URL=https://your-app.railway.app
railway variables set NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# ... add all other variables
```

#### 3. Custom Domain

1. Go to **Railway Dashboard** → **Settings** → **Domains**
2. Add custom domain
3. Configure DNS records

### AWS

Deploy to AWS using various services.

#### Option 1: AWS Amplify

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
```

#### Option 2: AWS App Runner

1. Create `apprunner.yaml`:

```yaml
version: 1.0
runtime: nodejs18
build:
  commands:
    build:
      - npm ci
      - npm run build
run:
  runtime-version: 18
  command: npm start
  network:
    port: 3000
    env: PORT
  env:
    - name: NODE_ENV
      value: production
```

2. Deploy via AWS Console or CLI

#### Option 3: ECS with Fargate

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### Google Cloud Platform

Deploy using Cloud Run for serverless deployment.

#### 1. Create Dockerfile

Use the same Dockerfile as AWS ECS above.

#### 2. Deploy to Cloud Run

```bash
# Build and deploy
gcloud run deploy saas-kit \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### 3. Environment Variables

```bash
# Set environment variables
gcloud run services update saas-kit \
  --set-env-vars="NEXT_PUBLIC_APP_URL=https://your-app.run.app,NEXT_PUBLIC_SUPABASE_URL=your_url"
```

### DigitalOcean

Deploy using App Platform.

#### 1. App Spec Configuration

Create `.do/app.yaml`:

```yaml
name: saas-kit
services:
- name: web
  source_dir: /
  github:
    repo: your-username/your-repo
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: NEXT_PUBLIC_APP_URL
    value: ${APP_URL}
```

#### 2. Deploy

```bash
# Install doctl
# Deploy via DigitalOcean Console or CLI
doctl apps create --spec .do/app.yaml
```

## Database Setup

### Supabase Configuration

1. **Create Production Project**
   ```bash
   # Create new Supabase project for production
   # Copy database URL and keys
   ```

2. **Run Migrations**
   ```sql
   -- Apply all migration scripts from /scripts/
   -- Ensure RLS policies are enabled
   ```

3. **Configure Authentication**
   - Set up OAuth providers
   - Configure email templates
   - Set up custom domains

### Database Backup Strategy

```bash
# Set up automated backups
# Configure point-in-time recovery
# Test backup restoration
```

## External Services Configuration

### Stripe Setup

1. **Switch to Live Mode**
   ```bash
   # Update environment variables with live keys
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...
   ```

2. **Configure Webhooks**
   ```bash
   # Set webhook endpoint to: https://your-domain.com/api/stripe/webhook
   # Select events: customer.subscription.created, customer.subscription.updated, etc.
   ```

3. **Test Payments**
   ```bash
   # Test with real payment methods
   # Verify webhook delivery
   ```

### Email Service Setup

Choose and configure an email provider:

#### SendGrid
```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.your_api_key
EMAIL_FROM=noreply@yourdomain.com
```

#### Resend
```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_your_api_key
EMAIL_FROM=noreply@yourdomain.com
```

### Analytics Setup

#### Google Analytics
```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

#### PostHog
```env
NEXT_PUBLIC_POSTHOG_KEY=phc_your_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

## Post-Deployment Checklist

### Functional Testing

- [ ] **Authentication Flow**
  - [ ] Email/password signup and login
  - [ ] OAuth providers (Google, GitHub)
  - [ ] Password reset functionality
  - [ ] Email verification

- [ ] **Payment System**
  - [ ] Subscription creation
  - [ ] Payment processing
  - [ ] Webhook handling
  - [ ] Billing portal access

- [ ] **Core Features**
  - [ ] User profile management
  - [ ] Dashboard functionality
  - [ ] API endpoints
  - [ ] Error handling

### Performance Testing

- [ ] **Page Load Speed**
  ```bash
  # Test with Lighthouse
  npx lighthouse https://your-domain.com --view
  ```

- [ ] **API Response Times**
  ```bash
  # Test API endpoints
  curl -w "@curl-format.txt" -o /dev/null -s https://your-domain.com/api/health
  ```

### Security Testing

- [ ] **SSL Certificate**
  ```bash
  # Verify SSL
  openssl s_client -connect your-domain.com:443
  ```

- [ ] **Security Headers**
  ```bash
  # Check security headers
  curl -I https://your-domain.com
  ```

- [ ] **Environment Variables**
  - [ ] No secrets in client-side code
  - [ ] Production keys configured
  - [ ] Debug mode disabled

### SEO and Accessibility

- [ ] **Meta Tags**
  - [ ] Title and description
  - [ ] Open Graph tags
  - [ ] Favicon

- [ ] **Accessibility**
  ```bash
  # Test with axe-core
  npx @axe-core/cli https://your-domain.com
  ```

## Monitoring and Maintenance

### Application Monitoring

#### Error Tracking with Sentry

```bash
# Configure Sentry
NEXT_PUBLIC_SENTRY_DSN=https://your_sentry_dsn
```

#### Performance Monitoring

```bash
# Set up monitoring dashboards
# Configure alerts for downtime
# Monitor API response times
```

### Database Monitoring

```bash
# Monitor Supabase metrics
# Set up connection pooling
# Configure query performance alerts
```

### Backup Strategy

```bash
# Automated database backups
# File storage backups
# Environment configuration backups
```

### Update Strategy

```bash
# Staged deployments
# Blue-green deployment
# Rollback procedures
```

### Health Checks

Create health check endpoints:

```typescript
// app/api/health/route.ts
export async function GET() {
  // Check database connection
  // Check external services
  // Return status
}
```

### Scaling Considerations

- **Database Scaling**: Monitor connection usage
- **CDN Setup**: Configure for static assets
- **Load Balancing**: Set up for high traffic
- **Caching Strategy**: Implement Redis/Memcached

## Troubleshooting

See [Troubleshooting Guide](./troubleshooting-guide.md) for common deployment issues and solutions.

## Support

- 📖 [Documentation](../README.md)
- 🐛 [Issues](https://github.com/your-repo/issues)
- 💬 [Discussions](https://github.com/your-repo/discussions)
- 📧 Email: support@yourapp.com 