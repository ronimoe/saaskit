# SaaS Kit Troubleshooting Guide

Comprehensive troubleshooting guide for common issues encountered with the SaaS Kit.

## Table of Contents

- [Build and Deployment Issues](#build-and-deployment-issues)
- [Authentication Problems](#authentication-problems)
- [Payment and Stripe Issues](#payment-and-stripe-issues)
- [Database Connection Issues](#database-connection-issues)
- [Environment Configuration](#environment-configuration)
- [Performance Issues](#performance-issues)
- [Email Service Issues](#email-service-issues)
- [Development Environment Problems](#development-environment-problems)
- [Common Error Messages](#common-error-messages)
- [Debugging Tools and Techniques](#debugging-tools-and-techniques)

## Build and Deployment Issues

### Build Fails with TypeScript Errors

**Problem**: Build fails with TypeScript compilation errors.

**Common Causes**:
- Using `any` type (project configured to reject `any`)
- Missing type definitions
- Incorrect import paths

**Solutions**:

```bash
# Check TypeScript configuration
npx tsc --noEmit

# Fix any type usage
# Replace 'any' with 'unknown' or specific types
const data: unknown = await response.json()

# Update import paths
import { Button } from '@/components/ui/button'  # ✅ Correct
import { Button } from '../ui/button'            # ❌ Avoid relative paths
```

**Prevention**:
- Use `unknown` instead of `any`
- Enable strict TypeScript mode
- Use absolute imports with path mapping

### Build Fails with "Module not found" Errors

**Problem**: Build fails with module resolution errors.

**Solutions**:

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check path mapping in tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./app/*", "./components/*", "./lib/*"]
    }
  }
}

# Verify import statements
import { cn } from '@/lib/utils'  # ✅ Correct
import { cn } from 'lib/utils'    # ❌ Missing @/
```

### Vercel Deployment Fails

**Problem**: Deployment fails on Vercel with build errors.

**Common Issues**:

1. **Environment Variables Missing**:
   ```bash
   # Add all required environment variables in Vercel dashboard
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```

2. **Build Command Issues**:
   ```json
   // package.json
   {
     "scripts": {
       "build": "next build",
       "start": "next start"
     }
   }
   ```

3. **Function Timeout**:
   ```json
   // vercel.json
   {
     "functions": {
       "app/api/**/*.ts": {
         "maxDuration": 30
       }
     }
   }
   ```

### Netlify Deployment Issues

**Problem**: Netlify deployment fails or redirects don't work.

**Solutions**:

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# For Next.js App Router
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

## Authentication Problems

### Supabase Auth Not Working

**Problem**: Users cannot sign up or log in.

**Diagnostic Steps**:

```bash
# Check Supabase connection
curl -H "apikey: YOUR_ANON_KEY" \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     https://YOUR_PROJECT.supabase.co/rest/v1/

# Verify environment variables
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10) + '...')
```

**Common Solutions**:

1. **Incorrect Environment Variables**:
   ```env
   # Ensure correct format
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. **RLS Policies Not Configured**:
   ```sql
   -- Enable RLS on user tables
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   
   -- Create policies
   CREATE POLICY "Users can view own profile" ON profiles
     FOR SELECT USING (auth.uid() = user_id);
   ```

3. **Email Confirmation Issues**:
   - Check Supabase email templates
   - Verify SMTP configuration
   - Check spam folder

### OAuth Providers Not Working

**Problem**: Google/GitHub OAuth fails.

**Solutions**:

1. **Check OAuth Configuration**:
   ```bash
   # Verify redirect URLs in provider settings
   # Google: https://console.developers.google.com
   # GitHub: https://github.com/settings/applications
   
   # Correct redirect URL format:
   https://your-project.supabase.co/auth/v1/callback
   ```

2. **Environment Variables**:
   ```env
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

3. **Supabase Auth Settings**:
   - Enable provider in Supabase dashboard
   - Add client ID and secret
   - Configure redirect URLs

### Session Management Issues

**Problem**: Users get logged out unexpectedly.

**Solutions**:

```typescript
// Check session persistence
const { data: { session }, error } = await supabase.auth.getSession()

// Implement session refresh
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Session refreshed')
  }
})

// Set session timeout
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
  options: {
    shouldCreateUser: false
  }
})
```

## Payment and Stripe Issues

### Billing Dashboard Issues

**Problem**: Billing dashboard components not loading or showing errors.

**Solution**:

1. **Check Component Imports**:
```typescript
// Verify all billing components are properly imported
import { 
  PlanComparison, 
  PaymentHistory, 
  BillingAddressForm, 
  SubscriptionManagement 
} from '@/components/billing'
```

2. **Verify Client Components**:
```typescript
// Ensure all billing components have 'use client' directive
'use client'

import { useState } from 'react'
// ... rest of component
```

3. **Check API Endpoints**:
- Verify `/api/stripe/payment-history` returns valid data
- Ensure `/api/stripe/billing-address` endpoints work
- Test `/api/stripe/portal` for Customer Portal access

**Problem**: Payment history not loading.

**Solution**:

1. **Check Stripe Customer Association**:
```sql
-- Verify user has Stripe customer ID
SELECT stripe_customer_id FROM profiles WHERE user_id = 'user_id';
```

2. **Test API Endpoint**:
```bash
curl -X GET "http://localhost:3000/api/stripe/payment-history?userId=user_id"
```

3. **Check Stripe API Keys**:
```typescript
// Verify in .env.local
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Problem**: Billing address form not saving.

**Solution**:

1. **Verify Form Validation**:
```typescript
// Check required fields are filled
const requiredFields = ['name', 'line1', 'city', 'state', 'postal_code', 'country']
```

2. **Check API Response**:
```typescript
// Verify PUT request succeeds
const response = await fetch('/api/stripe/billing-address', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId, address })
})
```

**Problem**: Subscription management portal not opening.

**Solution**:

1. **Verify Customer Portal Configuration**:
- Check Stripe Dashboard > Customer Portal settings
- Ensure return URL is configured correctly
- Verify portal is activated

2. **Check Portal API**:
```typescript
// Test portal session creation
const response = await fetch('/api/stripe/portal', {
  method: 'POST',
  body: JSON.stringify({ userId })
})
```

For detailed billing dashboard documentation, see the [Billing Dashboard Guide](./billing-dashboard.md).

## Payment and Stripe Issues

### Stripe Checkout Not Working

**Problem**: Checkout session creation fails.

**Diagnostic Steps**:

```bash
# Test Stripe connection
curl https://api.stripe.com/v1/customers \
  -u sk_test_your_secret_key: \
  -d email=test@example.com

# Check webhook endpoints
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

**Common Solutions**:

1. **Environment Variables**:
   ```env
   # Use correct keys for environment
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # for test
   STRIPE_SECRET_KEY=sk_test_...                  # for test
   
   # Production
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...
   ```

2. **Webhook Configuration**:
   ```bash
   # Set webhook endpoint in Stripe dashboard
   https://your-domain.com/api/stripe/webhook
   
   # Select events:
   - customer.subscription.created
   - customer.subscription.updated
   - customer.subscription.deleted
   - invoice.payment_succeeded
   - invoice.payment_failed
   ```

3. **CORS Issues**:
   ```typescript
   // app/api/stripe/checkout/route.ts
   export async function POST(request: Request) {
     // Add CORS headers
     const headers = {
       'Access-Control-Allow-Origin': '*',
       'Access-Control-Allow-Methods': 'POST',
       'Access-Control-Allow-Headers': 'Content-Type',
     }
     
     // ... checkout logic
   }
   ```

### Webhook Signature Verification Fails

**Problem**: Stripe webhooks fail signature verification.

**Solutions**:

```typescript
// Ensure raw body is used for signature verification
import { headers } from 'next/headers'

export async function POST(request: Request) {
  const body = await request.text() // Use text(), not json()
  const signature = headers().get('stripe-signature')
  
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
    // Process event
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return new Response('Webhook signature verification failed', { status: 400 })
  }
}
```

### Payment Methods Not Appearing

**Problem**: Payment methods don't show in checkout.

**Solutions**:

1. **Check Payment Methods in Stripe**:
   - Enable cards in Stripe dashboard
   - Configure payment method types
   - Check country restrictions

2. **Checkout Session Configuration**:
   ```typescript
   const session = await stripe.checkout.sessions.create({
     payment_method_types: ['card'], // Specify allowed methods
     mode: 'subscription',
     // ... other options
   })
   ```

## Database Connection Issues

### Supabase Connection Timeouts

**Problem**: Database queries timeout or fail.

**Solutions**:

1. **Connection Pooling**:
   ```typescript
   // Use connection pooling for serverless
   const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.SUPABASE_SERVICE_ROLE_KEY!,
     {
       db: {
         schema: 'public',
       },
       auth: {
         autoRefreshToken: false,
         persistSession: false
       }
     }
   )
   ```

2. **Query Optimization**:
   ```sql
   -- Add indexes for frequently queried columns
   CREATE INDEX idx_profiles_user_id ON profiles(user_id);
   CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
   ```

3. **Connection Limits**:
   ```bash
   # Monitor connection usage in Supabase dashboard
   # Upgrade plan if hitting connection limits
   ```

### Row Level Security (RLS) Issues

**Problem**: Queries fail due to RLS policies.

**Solutions**:

```sql
-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'your_table';

-- Create proper policies
CREATE POLICY "Users can access own data" ON your_table
  FOR ALL USING (auth.uid() = user_id);

-- Test with service role
SET ROLE service_role;
SELECT * FROM your_table;
```

### Migration Failures

**Problem**: Database migrations fail to apply.

**Solutions**:

```bash
# Check migration status
SELECT * FROM supabase_migrations.schema_migrations;

# Rollback failed migration
-- Manually revert changes or restore from backup

# Apply migrations one by one
-- Run scripts individually to identify issues
```

## Environment Configuration

### Environment Variables Not Loading

**Problem**: Environment variables are undefined in the application.

**Solutions**:

1. **Check Variable Names**:
   ```env
   # Client-side variables must have NEXT_PUBLIC_ prefix
   NEXT_PUBLIC_APP_URL=https://yourapp.com  # ✅ Available in browser
   SECRET_KEY=your_secret                   # ✅ Server-side only
   ```

2. **Restart Development Server**:
   ```bash
   # Stop and restart after changing .env files
   npm run dev
   ```

3. **Verify Loading**:
   ```typescript
   // Check in component
   console.log('App URL:', process.env.NEXT_PUBLIC_APP_URL)
   
   // Check in API route
   console.log('Secret:', process.env.SECRET_KEY)
   ```

### Configuration Conflicts

**Problem**: Different configurations between environments.

**Solutions**:

```typescript
// lib/config.ts
const config = {
  development: {
    apiUrl: 'http://localhost:3000',
    debug: true,
  },
  production: {
    apiUrl: process.env.NEXT_PUBLIC_APP_URL,
    debug: false,
  },
}

export default config[process.env.NODE_ENV as keyof typeof config]
```

## Performance Issues

### Slow Page Load Times

**Problem**: Pages load slowly.

**Diagnostic Tools**:

```bash
# Run Lighthouse audit
npx lighthouse https://your-domain.com --view

# Check bundle size
npm run build
npm run analyze # if bundle analyzer is configured
```

**Solutions**:

1. **Image Optimization**:
   ```tsx
   import Image from 'next/image'
   
   // Use Next.js Image component
   <Image
     src="/hero.jpg"
     alt="Hero"
     width={800}
     height={600}
     priority // for above-the-fold images
   />
   ```

2. **Code Splitting**:
   ```tsx
   import dynamic from 'next/dynamic'
   
   // Lazy load heavy components
   const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
     loading: () => <p>Loading...</p>
   })
   ```

3. **Database Query Optimization**:
   ```typescript
   // Use select to limit returned data
   const { data } = await supabase
     .from('profiles')
     .select('id, name, email') // Only needed fields
     .eq('user_id', userId)
     .single()
   ```

### High Memory Usage

**Problem**: Application consumes too much memory.

**Solutions**:

```typescript
// Implement proper cleanup
useEffect(() => {
  const subscription = supabase
    .channel('changes')
    .on('*', (payload) => {
      // Handle changes
    })
    .subscribe()
  
  return () => {
    subscription.unsubscribe() // Clean up
  }
}, [])

// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  // Component logic
})
```

## Email Service Issues

### Emails Not Sending

**Problem**: Email notifications not being sent.

**Solutions**:

1. **Check Email Provider Configuration**:
   ```env
   # SendGrid
   EMAIL_PROVIDER=sendgrid
   SENDGRID_API_KEY=SG.your_api_key
   EMAIL_FROM=noreply@yourdomain.com
   
   # Resend
   EMAIL_PROVIDER=resend
   RESEND_API_KEY=re_your_api_key
   ```

2. **Test Email Sending**:
   ```typescript
   // Create test endpoint
   export async function POST() {
     try {
       await sendEmail({
         to: 'test@example.com',
         subject: 'Test Email',
         html: '<p>Test message</p>'
       })
       return Response.json({ success: true })
     } catch (error) {
       console.error('Email error:', error)
       return Response.json({ error: error.message }, { status: 500 })
     }
   }
   ```

3. **Check Spam Filters**:
   - Verify sender domain
   - Add SPF/DKIM records
   - Check email content for spam triggers

### Email Templates Not Working

**Problem**: Email templates not rendering correctly.

**Solutions**:

```typescript
// Use proper HTML email structure
const emailTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Title</title>
</head>
<body style="font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto;">
    ${content}
  </div>
</body>
</html>
`

// Test templates locally
// Create email preview endpoint for development
```

## Development Environment Problems

### Hot Reload Not Working

**Problem**: Changes don't trigger page refresh.

**Solutions**:

```bash
# Clear Next.js cache
rm -rf .next

# Check file watching limits (Linux/macOS)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Restart development server
npm run dev
```

### Port Already in Use

**Problem**: Development server can't start due to port conflict.

**Solutions**:

```bash
# Find process using port 3000
lsof -ti:3000

# Kill process
kill -9 $(lsof -ti:3000)

# Use different port
npm run dev -- -p 3001

# Or set in package.json
{
  "scripts": {
    "dev": "next dev -p 3001"
  }
}
```

### Module Resolution Issues

**Problem**: TypeScript can't resolve modules.

**Solutions**:

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/app/*": ["./app/*"]
    }
  }
}

// Restart TypeScript server in VS Code
// Cmd/Ctrl + Shift + P -> "TypeScript: Restart TS Server"
```

## Common Error Messages

### "Cannot read property 'map' of undefined"

**Problem**: Trying to map over undefined array.

**Solution**:

```typescript
// Add optional chaining and default values
const items = data?.items || []
return items.map(item => <div key={item.id}>{item.name}</div>)

// Or use conditional rendering
return data?.items ? (
  data.items.map(item => <div key={item.id}>{item.name}</div>)
) : (
  <div>Loading...</div>
)
```

### "Hydration failed because the initial UI does not match"

**Problem**: Server and client render different content.

**Solutions**:

```typescript
// Use useEffect for client-only code
const [mounted, setMounted] = useState(false)

useEffect(() => {
  setMounted(true)
}, [])

if (!mounted) return null

// Or use dynamic imports with ssr: false
const ClientOnlyComponent = dynamic(
  () => import('./ClientOnlyComponent'),
  { ssr: false }
)
```

### "CORS error when calling API"

**Problem**: Cross-origin request blocked.

**Solutions**:

```typescript
// Add CORS headers to API routes
export async function GET() {
  const response = NextResponse.json({ data: 'success' })
  
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  
  return response
}

// Handle preflight requests
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
```

## Debugging Tools and Techniques

### Browser Developer Tools

```bash
# Enable React Developer Tools
# Chrome: React Developer Tools extension
# Firefox: React Developer Tools extension

# Network tab for API debugging
# Console for error messages
# Application tab for localStorage/cookies
```

### Server-Side Debugging

```typescript
// Add comprehensive logging
console.log('API called:', { method: request.method, url: request.url })
console.log('Request body:', await request.json())
console.log('Environment:', process.env.NODE_ENV)

// Use debugging tools
import { inspect } from 'util'
console.log(inspect(complexObject, { depth: null, colors: true }))
```

### Database Debugging

```sql
-- Enable query logging in Supabase
-- Go to Supabase Dashboard → Settings → API → Logs

-- Test queries directly
SELECT * FROM profiles WHERE user_id = 'your-user-id';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

### Performance Debugging

```bash
# Bundle analysis
npm run build
npx @next/bundle-analyzer

# Performance profiling
# Use React DevTools Profiler
# Chrome DevTools Performance tab

# Lighthouse CI
npm install -g @lhci/cli
lhci autorun
```

### Error Monitoring

```typescript
// Set up error boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    // Send to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>
    }

    return this.props.children
  }
}
```

## Getting Help

If you're still experiencing issues:

1. **Check the logs** in your deployment platform
2. **Search existing issues** in the repository
3. **Create a detailed bug report** with:
   - Error messages
   - Steps to reproduce
   - Environment details
   - Relevant code snippets

4. **Contact support**:
   - 📖 [Documentation](../README.md)
   - 🐛 [GitHub Issues](https://github.com/your-repo/issues)
   - 💬 [Discussions](https://github.com/your-repo/discussions)
   - 📧 Email: support@yourapp.com

## Prevention Tips

- **Use TypeScript strictly** to catch errors early
- **Implement proper error handling** in all API routes
- **Set up monitoring and alerting** for production
- **Regular testing** of critical paths
- **Keep dependencies updated** regularly
- **Use environment-specific configurations**
- **Implement health checks** for external services
- **Document any custom configurations** or workarounds 