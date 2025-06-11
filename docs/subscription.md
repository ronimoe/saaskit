# SaaS Kit Subscription System Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [Customer Lifecycle](#customer-lifecycle)
5. [API Endpoints](#api-endpoints)
6. [Webhook Processing](#webhook-processing)
7. [Customer Service](#customer-service)
8. [Frontend Components](#frontend-components)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)
11. [Security Considerations](#security-considerations)
12. [Development Workflow](#development-workflow)

## Overview

The SaaS Kit subscription system provides a complete, production-ready implementation for handling user subscriptions with Stripe integration. The system is designed to be race-condition-safe, atomic, and reliable.

### Key Features
- ✅ **Race-condition safe** customer and subscription management
- ✅ **Atomic database operations** preventing data inconsistencies
- ✅ **Idempotent functions** safe for retries and concurrent access
- ✅ **Complete Stripe integration** with webhooks and checkout
- ✅ **Guest checkout system** - "Payment First, Account Later" workflow
- ✅ **Account reconciliation** - Secure payment-to-account linking
- ✅ **Comprehensive error handling** with fallback strategies
- ✅ **Type-safe** TypeScript implementation throughout
- ✅ **Extensive logging** for debugging and monitoring

### Technology Stack
- **Database**: Supabase (PostgreSQL)
- **Payment Processing**: Stripe
- **Frontend**: Next.js 14+ with TypeScript
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS

## Architecture

### System Components

The subscription system follows a layered architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer                           │
├─────────────────────────────────────────────────────────────┤
│  CheckoutButton → Pricing Pages → Success/Cancel Pages     │
└─────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                     API Layer                               │
├─────────────────────────────────────────────────────────────┤
│  /api/stripe/checkout → /api/auth/create-customer          │
│  /api/stripe/webhook → /api/stripe/checkout/verify         │
└─────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                 Business Logic Layer                        │
├─────────────────────────────────────────────────────────────┤
│  Customer Service → Stripe Sync → Auth Integration         │
└─────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                  Data Layer                                 │
├─────────────────────────────────────────────────────────────┤
│  Database Functions → Supabase → Stripe API                │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

**Traditional Authenticated Flow:**
1. **User Registration** → Profile creation with customer setup
2. **Checkout Initiation** → Customer verification/creation → Stripe session
3. **Payment Completion** → Webhook processing → Database sync
4. **Subscription Management** → Real-time status updates

**Guest Checkout Flow:**
1. **Guest Checkout** → Stripe session without authentication
2. **Payment Completion** → Guest session storage → Webhook processing
3. **Account Creation/Login** → Email-based account detection
4. **Payment Reconciliation** → Link guest customer to user account (simple metadata update)
5. **Subscription Management** → Full access to subscription features

> **Note:** For detailed information about the guest checkout system, see the [Guest Checkout System Guide](./guest-checkout-system.md).

## Database Schema

### Profiles Table

The profiles table is the central hub for user information and links users to their Stripe customers.

```sql
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    company_name TEXT,
    billing_address JSONB,
    stripe_customer_id TEXT UNIQUE, -- Links to Stripe customer
    email_notifications BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance and integrity indexes
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id);
CREATE UNIQUE INDEX idx_profiles_email ON public.profiles(email);
```

### Subscriptions Table

Stores detailed subscription information synchronized with Stripe.

```sql
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    stripe_customer_id TEXT NOT NULL,
    stripe_subscription_id TEXT UNIQUE NOT NULL,
    stripe_price_id TEXT NOT NULL,
    status TEXT NOT NULL, -- active, canceled, incomplete, etc.
    plan_name TEXT,
    currency TEXT DEFAULT 'usd',
    unit_amount INTEGER, -- in cents
    interval TEXT, -- month, year
    interval_count INTEGER DEFAULT 1,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMPTZ,
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
```

### Database Functions

#### create_customer_and_profile_atomic()

Atomically creates or updates a user profile with Stripe customer information.

```sql
CREATE OR REPLACE FUNCTION create_customer_and_profile_atomic(
    p_user_id UUID,
    p_email TEXT,
    p_stripe_customer_id TEXT,
    p_full_name TEXT DEFAULT NULL
) RETURNS JSONB
```

**Returns:**
```json
{
  "profile_id": "uuid",
  "created_customer": boolean,
  "created_profile": boolean
}
```

#### ensure_stripe_customer_atomic()

Safely checks for existing Stripe customer or prepares for creation.

```sql
CREATE OR REPLACE FUNCTION ensure_stripe_customer_atomic(
    p_user_id UUID,
    p_email TEXT
) RETURNS JSONB
```

**Returns:**
```json
{
  "stripe_customer_id": "cus_xxx" | null,
  "profile_id": "uuid",
  "was_created": boolean
}
```

## Customer Lifecycle

### 1. User Registration Flow

When a user signs up, the system automatically ensures they have a customer record:

```typescript
// app/auth/callback/route.ts
async function handleAuthCallback(user: User) {
  const result = await ensureCustomerExists(
    user.id, 
    user.email, 
    user.user_metadata?.full_name
  );
  
  if (result.success) {
    console.log('[AUTH CALLBACK] Customer ready:', result.stripeCustomerId);
  } else {
    console.error('[AUTH CALLBACK] Customer creation failed:', result.error);
  }
}
```

### 2. Checkout Flow

The checkout process handles both new and existing customers seamlessly:

```typescript
// Checkout process overview
async function initiateCheckout(priceId: string, user: User) {
  // 1. Check for existing customer
  const existingCustomer = await getCustomerByUserId(user.id);
  
  if (existingCustomer.success && existingCustomer.stripeCustomerId) {
    // Use existing customer
    customerId = existingCustomer.stripeCustomerId;
  } else {
    // Create new customer atomically
    const newCustomer = await ensureCustomerExists(user.id, user.email);
    customerId = newCustomer.stripeCustomerId;
  }
  
  // 2. Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    // ... other options
  });
  
  return { sessionId: session.id, url: session.url };
}
```

### 3. Subscription Activation

Handled automatically via Stripe webhooks when payment is successful.

### 4. Subscription Management

```typescript
// Get current subscription status
const subscription = await getCurrentSubscription(userId);

// Cancel subscription (at period end)
await stripe.subscriptions.update(subscriptionId, {
  cancel_at_period_end: true
});

// Immediate cancellation
await stripe.subscriptions.cancel(subscriptionId);
```

## API Endpoints

### POST /api/stripe/checkout

Creates a Stripe checkout session for subscription purchase.

**Request Body:**
```typescript
interface CheckoutRequest {
  priceId: string;        // Stripe price ID
  userId: string;         // User ID from auth
  userEmail?: string;     // Required for new customers
  fullName?: string;      // Optional, improves UX
}
```

**Response:**
```typescript
interface CheckoutResponse {
  sessionId: string;      // Stripe session ID
  url: string;           // Checkout URL
  customerId: string;    // Stripe customer ID
}
```

**Example Usage:**
```typescript
const response = await fetch('/api/stripe/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    priceId: 'price_1234567890',
    userId: 'user_abc123',
    userEmail: 'user@example.com',
    fullName: 'John Doe'
  })
});

const { url, sessionId } = await response.json();
window.location.href = url; // Redirect to Stripe checkout
```

### POST /api/stripe/checkout/verify

Verifies a completed checkout session and syncs subscription data.

**Request Body:**
```typescript
interface VerifyRequest {
  sessionId: string;      // Stripe session ID
  userId: string;         // User ID for verification
}
```

**Response:**
```typescript
interface VerifyResponse {
  sessionId: string;
  subscription: {
    planName: string;
    status: string;
    priceId: string;
    currentPeriodEnd: string;
    subscriptionId: string;
  };
  customer: {
    id: string;
  };
}
```

### POST /api/auth/create-customer

Creates a customer and profile (typically called from auth callback).

**Request Body:**
```typescript
interface CreateCustomerRequest {
  userId: string;         // User ID from auth
  email: string;          // User email
  fullName?: string;      // Optional full name
}
```

**Response:**
```typescript
interface CreateCustomerResponse {
  success: boolean;
  customerId?: string;
  profileId?: string;
  isNewCustomer?: boolean;
  error?: string;
}
```

### POST /api/stripe/webhook

Handles Stripe webhook events for subscription updates.

**Supported Events:**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

**Security:** Validates webhook signature using `STRIPE_WEBHOOK_SECRET`.

## Webhook Processing

### Event Flow

1. **Stripe sends webhook** → `/api/stripe/webhook`
2. **Signature verification** → Ensure request is from Stripe
3. **Event filtering** → Only process relevant subscription events
4. **Data synchronization** → Update local database with Stripe data

### Webhook Handler Implementation

```typescript
// app/api/stripe/webhook/route.ts
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');
  
  // Verify webhook signature
  const event = verifyWebhookSignature(body, signature, webhookSecret);
  
  // Process relevant events
  if (relevantEvents.has(event.type)) {
    const customerId = event.data.object.customer;
    await syncStripeCustomerData(customerId);
  }
  
  return NextResponse.json({ received: true });
}
```

### Subscription Data Sync

The `syncStripeCustomerData` function ensures local database stays in sync with Stripe:

```typescript
async function syncStripeCustomerData(customerId: string) {
  try {
    // Fetch latest subscription data from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 100
    });
    
    // Update local database for each subscription
    for (const subscription of subscriptions.data) {
      await updateDatabaseSubscription(customerId, {
        subscriptionId: subscription.id,
        status: subscription.status,
        priceId: subscription.items.data[0]?.price.id,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        // ... other fields
      });
    }
    
    console.log(`[STRIPE SYNC] Updated ${subscriptions.data.length} subscriptions for customer: ${customerId}`);
  } catch (error) {
    console.error('[STRIPE SYNC] Error syncing customer data:', error);
    throw error;
  }
}
```

## Customer Service

The customer service (`lib/customer-service.ts`) provides the core business logic for customer management.

### Core Functions

#### ensureCustomerExists()

The primary function for customer creation and management.

```typescript
async function ensureCustomerExists(
  userId: string,
  email: string,
  fullName?: string
): Promise<CustomerCreationResult>
```

**Flow:**
1. Check if customer already exists in database
2. If exists, return existing customer info
3. If not exists, create Stripe customer
4. Atomically create/update profile with customer ID
5. Return comprehensive result

**Usage:**
```typescript
const result = await ensureCustomerExists(
  'user_123',
  'user@example.com',
  'John Doe'
);

if (result.success) {
  console.log('Stripe Customer ID:', result.stripeCustomerId);
  console.log('Profile ID:', result.profile?.id);
  console.log('Is new customer:', result.isNewCustomer);
  console.log('Is new profile:', result.isNewProfile);
} else {
  console.error('Failed to ensure customer:', result.error);
}
```

#### getCustomerByUserId()

Retrieves existing customer information efficiently.

```typescript
async function getCustomerByUserId(
  userId: string
): Promise<CustomerRetrievalResult>
```

**Usage:**
```typescript
const result = await getCustomerByUserId('user_123');

if (result.success && result.stripeCustomerId) {
  // Customer exists, use existing data
  console.log('Found customer:', result.stripeCustomerId);
  console.log('Profile:', result.profile);
} else {
  // Customer needs to be created
  console.log('Customer not found, needs creation');
}
```

#### createCustomerAndProfile()

Lower-level function for atomic customer and profile creation.

```typescript
async function createCustomerAndProfile(
  userId: string,
  email: string,
  stripeCustomerId: string,
  fullName?: string
): Promise<CustomerCreationResult>
```

**When to use:** 
- When you already have a Stripe customer ID
- For batch operations
- For testing scenarios

### Error Handling Strategy

The customer service implements comprehensive error handling:

```typescript
try {
  const result = await ensureCustomerExists(userId, email, fullName);
  
  if (!result.success) {
    // Business logic error (e.g., invalid email, Stripe error)
    console.error('[CUSTOMER SERVICE] Operation failed:', result.error);
    return { error: 'Unable to process customer request' };
  }
  
  // Success - continue with business logic
  return { customerId: result.stripeCustomerId };
  
} catch (error) {
  // Unexpected system error (e.g., database down, network issue)
  console.error('[CUSTOMER SERVICE] Unexpected error:', error);
  return { error: 'Internal server error' };
}
```

## Frontend Components

### CheckoutButton Component

The main component for initiating subscription checkout.

**Location:** `components/checkout-button.tsx`

**Props:**
```typescript
interface CheckoutButtonProps {
  priceId: string;        // Stripe price ID
  planName: string;       // Display name for the plan
  isPopular?: boolean;    // Styling flag for popular plans
  className?: string;     // Custom CSS classes
  children?: ReactNode;   // Custom button content
}
```

**Implementation Highlights:**
```typescript
export default function CheckoutButton({ priceId, planName, isPopular, className, children }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get authenticated user
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login?redirect=/pricing');
        return;
      }

      // Prepare checkout data with user information
      const checkoutData = {
        priceId,
        userId: user.id,
        userEmail: user.email,
        fullName: user.user_metadata?.full_name || user.user_metadata?.name || undefined
      };

      // Create checkout session
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkoutData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url, sessionId } = await response.json();

      if (url) {
        // Direct redirect to Stripe
        window.location.href = url;
      } else if (sessionId) {
        // Fallback to Stripe.js
        const stripe = await getStripe();
        await stripe?.redirectToCheckout({ sessionId });
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start checkout');
    } finally {
      setIsLoading(false);
    }
  };

  // Render component with loading states and error handling
}
```

**Usage Examples:**
```typescript
// Basic usage
<CheckoutButton
  priceId="price_1234567890"
  planName="Pro Plan"
>
  Subscribe to Pro
</CheckoutButton>

// With styling for popular plan
<CheckoutButton
  priceId="price_1234567890"
  planName="Pro Plan"
  isPopular={true}
  className="bg-gradient-to-r from-purple-600 to-pink-600"
>
  Choose Pro Plan (Most Popular)
</CheckoutButton>
```

### Checkout Success Page

**Location:** `app/checkout/success/page.tsx`

Handles post-checkout verification and displays subscription confirmation.

**Key Features:**
- Verifies checkout session with backend
- Displays subscription details
- Handles verification errors gracefully
- Provides navigation to user dashboard

**Implementation:**
```typescript
export default function CheckoutSuccess() {
  const searchParams = useSearchParams();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyCheckout = async () => {
      if (!sessionId) {
        setError('No session ID provided');
        return;
      }

      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push('/login');
          return;
        }

        // Verify the checkout session
        const response = await fetch('/api/stripe/checkout/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, userId: user.id }),
        });

        if (!response.ok) {
          throw new Error('Failed to verify checkout session');
        }

        const data = await response.json();
        setSubscription(data.subscription);
      } catch (err) {
        setError('Failed to verify your subscription');
      } finally {
        setIsLoading(false);
      }
    };

    verifyCheckout();
  }, [sessionId]);

  // Render success UI or loading/error states
}
```

## Testing

### Unit Tests

#### Customer Service Tests

```typescript
// lib/__tests__/customer-service.test.ts
describe('CustomerService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ensureCustomerExists', () => {
    it('should create new customer when none exists', async () => {
      // Mock database functions
      mockSupabase.rpc.mockResolvedValueOnce({
        data: [{ stripe_customer_id: null, profile_id: 'profile_123', was_created: true }],
        error: null
      });

      // Mock Stripe customer creation
      mockStripe.customers.create.mockResolvedValueOnce({
        id: 'cus_new123',
        email: 'test@example.com'
      });

      // Mock profile creation
      mockSupabase.rpc.mockResolvedValueOnce({
        data: [{ profile_id: 'profile_123', created_customer: false, created_profile: true }],
        error: null
      });

      const result = await ensureCustomerExists('user_123', 'test@example.com', 'Test User');

      expect(result.success).toBe(true);
      expect(result.stripeCustomerId).toBe('cus_new123');
      expect(result.isNewCustomer).toBe(true);
    });

    it('should return existing customer when found', async () => {
      mockSupabase.rpc.mockResolvedValueOnce({
        data: [{ stripe_customer_id: 'cus_existing123', profile_id: 'profile_123', was_created: false }],
        error: null
      });

      const result = await ensureCustomerExists('user_123', 'test@example.com');

      expect(result.success).toBe(true);
      expect(result.stripeCustomerId).toBe('cus_existing123');
      expect(result.isNewCustomer).toBe(false);
      expect(mockStripe.customers.create).not.toHaveBeenCalled();
    });

    it('should handle Stripe API errors gracefully', async () => {
      mockSupabase.rpc.mockResolvedValueOnce({
        data: [{ stripe_customer_id: null, profile_id: 'profile_123', was_created: true }],
        error: null
      });

      mockStripe.customers.create.mockRejectedValueOnce(new Error('Stripe API error'));

      const result = await ensureCustomerExists('user_123', 'test@example.com');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Stripe API error');
    });
  });
});
```

#### API Route Tests

```typescript
// app/api/stripe/checkout/__tests__/route.test.ts
describe('Checkout API', () => {
  it('should create checkout session with existing customer', async () => {
    mockGetCustomerByUserId.mockResolvedValue({
      success: true,
      profile: mockProfile,
      stripeCustomerId: 'cus_existing123',
    });

    mockStripe.checkout.sessions.create.mockResolvedValue({
      id: 'cs_session123',
      url: 'https://checkout.stripe.com/pay/cs_session123',
    });

    const request = new NextRequest('http://localhost:3000/api/stripe/checkout', {
      method: 'POST',
      body: JSON.stringify({
        priceId: 'price_123',
        userId: 'user_123',
        userEmail: 'test@example.com',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.sessionId).toBe('cs_session123');
    expect(mockGetCustomerByUserId).toHaveBeenCalledWith('user_123');
    expect(mockEnsureCustomerExists).not.toHaveBeenCalled(); // Should use existing
  });

  it('should create new customer when needed', async () => {
    mockGetCustomerByUserId.mockResolvedValue({
      success: false,
      error: 'Profile not found',
    });

    mockEnsureCustomerExists.mockResolvedValue({
      success: true,
      profile: mockProfile,
      stripeCustomerId: 'cus_new123',
      isNewCustomer: true,
    });

    mockStripe.checkout.sessions.create.mockResolvedValue({
      id: 'cs_session123',
      url: 'https://checkout.stripe.com/pay/cs_session123',
    });

    const request = new NextRequest('http://localhost:3000/api/stripe/checkout', {
      method: 'POST',
      body: JSON.stringify({
        priceId: 'price_123',
        userId: 'user_123',
        userEmail: 'test@example.com',
        fullName: 'Test User',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockEnsureCustomerExists).toHaveBeenCalledWith('user_123', 'test@example.com', 'Test User');
  });
});
```

### Integration Tests

Test complete user flows:

```typescript
describe('Complete Subscription Flow', () => {
  it('should handle new user signup to subscription', async () => {
    // 1. User signs up
    const user = await createTestUser();
    
    // 2. Auth callback should create customer
    const authResult = await handleAuthCallback(user);
    expect(authResult.customerId).toBeDefined();
    
    // 3. User initiates checkout
    const checkoutResult = await initiateCheckout('price_123', user);
    expect(checkoutResult.sessionId).toBeDefined();
    
    // 4. Simulate successful payment webhook
    const webhookResult = await processWebhook({
      type: 'customer.subscription.created',
      data: { object: { customer: authResult.customerId } }
    });
    expect(webhookResult.success).toBe(true);
    
    // 5. Verify subscription in database
    const subscription = await getSubscriptionByUserId(user.id);
    expect(subscription.status).toBe('active');
  });
});
```

### Manual Testing Checklist

**New User Flow:**
- [ ] User signs up via email
- [ ] Email confirmation creates profile and customer
- [ ] User can immediately checkout
- [ ] No duplicate customers created
- [ ] Webhook processes successfully

**Existing User Flow:**
- [ ] User logs in
- [ ] Checkout uses existing customer
- [ ] Multiple checkouts don't create duplicates
- [ ] Subscription upgrades/downgrades work

**Error Scenarios:**
- [ ] Invalid price ID handled gracefully
- [ ] Stripe API errors don't break flow
- [ ] Network timeouts are handled
- [ ] Webhook signature failures are logged

## Troubleshooting

### Common Issues & Solutions

#### 1. Duplicate Customers

**Symptoms:** Multiple Stripe customers for the same user
**Root Cause:** Race conditions in customer creation (now fixed)
**Detection:**
```sql
-- Find users with multiple customer IDs
SELECT user_id, array_agg(stripe_customer_id) as customer_ids, COUNT(*)
FROM profiles 
WHERE stripe_customer_id IS NOT NULL
GROUP BY user_id 
HAVING COUNT(*) > 1;
```
**Solution:** Use the atomic customer service functions

#### 2. Missing Customer Records

**Symptoms:** 
- Webhook processing fails
- Subscription not found errors
- User can't access subscription features

**Root Cause:** Customer created in Stripe but not in local database
**Detection:**
```sql
-- Find subscriptions without local profiles
SELECT s.stripe_customer_id, s.status
FROM subscriptions s
LEFT JOIN profiles p ON s.stripe_customer_id = p.stripe_customer_id
WHERE p.stripe_customer_id IS NULL;
```
**Solution:**
```typescript
// Recreate missing customer record
const result = await ensureCustomerExists(userId, email, fullName);
```

#### 3. Checkout Session Creation Fails

**Symptoms:** Error during checkout initiation
**Common Causes & Solutions:**

```typescript
// Debug checkout failures
try {
  const result = await fetch('/api/stripe/checkout', {
    method: 'POST',
    body: JSON.stringify({ priceId, userId, userEmail })
  });
  
  if (!result.ok) {
    const error = await result.json();
    console.error('Checkout failed:', error);
    
    // Common issues:
    // 1. Invalid price ID - check Stripe dashboard
    // 2. Customer creation failure - check customer service logs
    // 3. Missing user email - ensure user data is complete
  }
} catch (error) {
  console.error('Network error during checkout:', error);
}
```

#### 4. Webhook Processing Issues

**Symptoms:** Subscription status not updating in database
**Debug Steps:**

1. **Check webhook endpoint configuration:**
```bash
# Verify webhook URL in Stripe dashboard
https://yourapp.com/api/stripe/webhook
```

2. **Verify webhook secret:**
```typescript
// Check environment variable
console.log('Webhook secret configured:', !!process.env.STRIPE_WEBHOOK_SECRET);
```

3. **Test webhook signature:**
```typescript
// In webhook handler
try {
  const event = verifyWebhookSignature(body, signature, webhookSecret);
  console.log('Webhook verified:', event.type);
} catch (error) {
  console.error('Webhook signature verification failed:', error);
}
```

### Debugging Tools

#### Enable Detailed Logging

```bash
# Set environment variable for verbose logging
DEBUG=stripe:*,customer:*,webhook:*,checkout:*
```

#### Database Diagnostic Queries

```sql
-- Overall system health check
SELECT 
  'Total Users' as metric,
  COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
  'Users with Profiles' as metric,
  COUNT(*) as count
FROM profiles
UNION ALL
SELECT 
  'Users with Stripe Customers' as metric,
  COUNT(*) as count
FROM profiles 
WHERE stripe_customer_id IS NOT NULL
UNION ALL
SELECT 
  'Active Subscriptions' as metric,
  COUNT(*) as count
FROM subscriptions 
WHERE status = 'active';

-- Check for data consistency issues
SELECT 
  'Profiles without users' as issue,
  COUNT(*) as count
FROM profiles p
LEFT JOIN auth.users u ON p.user_id = u.id
WHERE u.id IS NULL
UNION ALL
SELECT 
  'Subscriptions without profiles' as issue,
  COUNT(*) as count
FROM subscriptions s
LEFT JOIN profiles p ON s.profile_id = p.id
WHERE p.id IS NULL;

-- Subscription status distribution
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM subscriptions
GROUP BY status
ORDER BY count DESC;
```

#### Log Analysis

Monitor these log patterns:

```bash
# Successful customer creation
grep "\[CUSTOMER SERVICE\] Customer created successfully" logs.txt

# Checkout session creation
grep "\[CHECKOUT\] Creating checkout session" logs.txt

# Webhook processing
grep "\[STRIPE SYNC\] Updated.*subscriptions" logs.txt

# Error patterns
grep "ERROR\|FAIL\|Exception" logs.txt | grep -E "(customer|checkout|webhook)"
```

### Performance Monitoring

#### Key Metrics to Track

1. **Customer Creation Time**
```typescript
const startTime = Date.now();
const result = await ensureCustomerExists(userId, email, fullName);
const duration = Date.now() - startTime;
console.log(`[PERF] Customer creation took ${duration}ms`);
```

2. **Checkout Session Creation Time**
3. **Webhook Processing Time**
4. **Database Query Performance**

#### Optimization Tips

- Use database connection pooling
- Cache frequent customer lookups
- Batch webhook processing for high volume
- Monitor Stripe API rate limits

## Security Considerations

### 1. Webhook Security

**Critical Requirements:**
- ✅ Always verify webhook signatures
- ✅ Use HTTPS endpoints only
- ✅ Implement idempotent webhook processing
- ✅ Rate limit webhook endpoints

```typescript
// Secure webhook verification
export async function POST(request: NextRequest) {
  const body = await request.text(); // Raw body required for signature
  const signature = headers().get('stripe-signature');
  
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }
  
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    
    // Process event...
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
}
```

### 2. Customer Data Protection

**Best Practices:**
- ✅ Store minimal customer data locally
- ✅ Use Stripe customer IDs as primary references
- ✅ Encrypt sensitive data at rest
- ✅ Implement proper access controls

```typescript
// Good: Store only essential data
interface Profile {
  id: string;
  user_id: string;
  email: string;
  stripe_customer_id: string; // Reference to Stripe
  // Don't store: credit card info, full billing details
}

// Use Stripe for sensitive operations
const customer = await stripe.customers.retrieve(stripeCustomerId);
const paymentMethods = await stripe.paymentMethods.list({
  customer: stripeCustomerId,
  type: 'card'
});
```

### 3. API Security

**Implementation:**
- ✅ Validate all input parameters
- ✅ Implement rate limiting
- ✅ Use authenticated endpoints
- ✅ Sanitize error messages

```typescript
// Input validation example
function validateCheckoutRequest(data: unknown): CheckoutRequest {
  const schema = z.object({
    priceId: z.string().min(1),
    userId: z.string().uuid(),
    userEmail: z.string().email().optional(),
    fullName: z.string().max(255).optional()
  });
  
  return schema.parse(data);
}

// Rate limiting (using next-rate-limit or similar)
const rateLimit = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500 // Limit each IP to 500 requests per interval
});

export async function POST(request: NextRequest) {
  await rateLimit.check(request.ip);
  // Continue with request processing...
}
```

### 4. Environment Variables

**Required Configuration:**

```bash
# Stripe Configuration (Required)
STRIPE_SECRET_KEY=sk_live_... # or sk_test_... for development
STRIPE_PUBLISHABLE_KEY=pk_live_... # or pk_test_... for development
STRIPE_WEBHOOK_SECRET=whsec_... # From Stripe webhook configuration

# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Application Configuration (Required)
NEXT_PUBLIC_APP_URL=https://yourapp.com

# Optional: Enhanced Security
WEBHOOK_RATE_LIMIT=100 # Requests per minute
SESSION_SECRET=your-secret-key-here
```

**Security Checklist:**
- [ ] All secrets stored in environment variables
- [ ] Production uses live Stripe keys
- [ ] Webhook secrets rotated regularly
- [ ] Environment variables not committed to git
- [ ] Different secrets for different environments

## Development Workflow

### 1. Local Development Setup

```bash
# 1. Clone repository and install dependencies
git clone <your-repo>
cd saas-kit
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your keys

# 3. Set up Supabase
# - Create project at supabase.com
# - Run database migrations
# - Update environment variables

# 4. Set up Stripe
# - Create account at stripe.com
# - Get API keys (test mode for development)
# - Create products and prices
# - Set up webhook endpoint

# 5. Start development server
npm run dev

# 6. Start Stripe webhook forwarding (separate terminal)
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### 2. Database Setup

```sql
-- Apply migrations in order
\i scripts/01_add_race_condition_fixes.sql

-- Verify setup
SELECT * FROM profiles LIMIT 1;
SELECT * FROM subscriptions LIMIT 1;

-- Test database functions
SELECT create_customer_and_profile_atomic(
  'test-user-id'::uuid,
  'test@example.com',
  'cus_test123',
  'Test User'
);
```

### 3. Testing Payments

**Stripe Test Cards:**
```
4242424242424242 - Successful payment
4000000000000002 - Card declined
4000000000009995 - Insufficient funds
4000000000000341 - Charge succeeds but fails CVC check
4000000000000069 - Charge succeeds but fails zip code check
```

**Test Scenarios:**
1. **Successful subscription creation**
2. **Failed payment handling**
3. **Subscription cancellation**
4. **Plan upgrades/downgrades**
5. **Webhook event processing**

### 4. Deployment Process

**Pre-deployment Checklist:**
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Webhook endpoints updated in Stripe
- [ ] SSL certificates configured
- [ ] Error monitoring set up
- [ ] Performance monitoring enabled

**Deployment Steps:**
```bash
# 1. Build application
npm run build

# 2. Test production build locally
npm start

# 3. Deploy to hosting platform (Vercel/Netlify/etc.)
# 4. Update Stripe webhook URLs to production
# 5. Test critical flows in production
# 6. Monitor logs for errors
```

### 5. Monitoring & Maintenance

**Daily Checks:**
- [ ] Error logs review
- [ ] Webhook delivery status
- [ ] Failed payment notifications
- [ ] Database performance metrics

**Weekly Reviews:**
- [ ] Subscription conversion rates
- [ ] Customer churn analysis
- [ ] Performance bottlenecks
- [ ] Security audit logs

**Monthly Tasks:**
- [ ] Update dependencies
- [ ] Review and rotate secrets
- [ ] Analyze customer feedback
- [ ] Plan feature improvements

## Best Practices Summary

### 1. Always Use Customer Service

```typescript
// ✅ Good - Use centralized customer service
import { ensureCustomerExists } from '@/lib/customer-service';
const result = await ensureCustomerExists(userId, email, fullName);

// ❌ Bad - Direct database/Stripe operations
const customer = await stripe.customers.create({ email });
await supabase.from('profiles').update({ stripe_customer_id: customer.id });
```

### 2. Implement Comprehensive Error Handling

```typescript
// ✅ Good - Handle all error scenarios
try {
  const result = await ensureCustomerExists(userId, email, fullName);
  
  if (!result.success) {
    // Business logic error
    console.error('[CHECKOUT] Customer creation failed:', result.error);
    return NextResponse.json(
      { error: 'Unable to process request. Please try again.' },
      { status: 500 }
    );
  }
  
  // Continue with success flow
} catch (error) {
  // System error
  console.error('[CHECKOUT] Unexpected error:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

### 3. Use Structured Logging

```typescript
// ✅ Good - Structured, searchable logs
console.log(`[CHECKOUT] Starting checkout`, {
  userId,
  priceId,
  hasEmail: !!userEmail,
  timestamp: new Date().toISOString()
});

console.log(`[CHECKOUT] Customer result`, {
  customerId: result.stripeCustomerId,
  isNew: result.isNewCustomer,
  duration: Date.now() - startTime
});

// ❌ Bad - Unstructured logs
console.log('Starting checkout for user');
console.log('Customer created: ' + result.stripeCustomerId);
```

### 4. Maintain Type Safety

```typescript
// ✅ Good - Proper TypeScript usage
interface CheckoutRequest {
  priceId: string;
  userId: string;
  userEmail?: string;
  fullName?: string;
}

async function handleCheckout(data: CheckoutRequest): Promise<CheckoutResponse> {
  // Implementation with full type safety
}

// ❌ Bad - Using any types
async function handleCheckout(data: any): Promise<any> {
  // No type safety, prone to runtime errors
}
```

### 5. Implement Idempotent Operations

```typescript
// ✅ Good - Safe to retry
async function ensureCustomerExists(userId: string, email: string) {
  // Check existing first
  const existing = await getCustomerByUserId(userId);
  if (existing.success) {
    return existing; // Return existing, don't create duplicate
  }
  
  // Create new only if needed
  return await createNewCustomer(userId, email);
}

// ❌ Bad - Creates duplicates on retry
async function createCustomer(userId: string, email: string) {
  const customer = await stripe.customers.create({ email });
  await createProfile(userId, customer.id);
  return customer;
}
```

---

## Conclusion

This subscription system provides a robust, production-ready foundation for SaaS applications. The race-condition-safe design ensures reliable operation under high concurrency, while comprehensive error handling and logging make it easy to monitor and debug.

### Key Achievements

✅ **Eliminated Race Conditions** - Atomic database operations prevent timing issues  
✅ **Production Ready** - Comprehensive error handling and security measures  
✅ **Developer Friendly** - Clear APIs, extensive documentation, and good testing  
✅ **Scalable Architecture** - Designed to handle growth and high traffic  
✅ **Type Safe** - Full TypeScript implementation with proper type definitions  

### Next Steps

1. **Monitor Performance** - Track key metrics and optimize bottlenecks
2. **Enhance Features** - Add subscription management UI, billing portal integration
3. **Improve Analytics** - Implement detailed subscription and revenue tracking
4. **Scale Infrastructure** - Optimize for higher traffic and transaction volumes

For questions, issues, or contributions, refer to the troubleshooting section or check the application logs for detailed error information.

---

**Documentation Version:** 1.0.0  
**Last Updated:** 2025-01-21  
**Status:** Production Ready ✅  
**Maintainer:** SaaS Kit Team 