# Billing Dashboard System

## Overview

The SaaS Kit includes a comprehensive billing dashboard that provides users with complete control over their subscription management, payment history, billing information, and subscription preferences. The dashboard is built with modern UI components featuring glassmorphism effects and is fully integrated with Stripe for secure payment processing.

## Features

### 🎯 **Core Billing Features**
- **Subscription Status Display** - Real-time subscription status with visual indicators
- **Plan Comparison Interface** - Interactive plan comparison with upgrade/downgrade options
- **Payment History** - Complete payment history with invoice downloads
- **Billing Address Management** - Form for updating billing information
- **Subscription Management** - Cancellation flow and payment method management

### 🎨 **UI/UX Features**
- **Glassmorphism Design** - Modern glass card effects with depth
- **Responsive Layout** - Optimized for desktop, tablet, and mobile
- **Loading States** - Skeleton components and smooth transitions
- **Error Handling** - Graceful error states with user-friendly messages
- **Interactive Elements** - Hover effects and micro-interactions

## Page Structure

The billing dashboard is located at `/billing` and follows this structure:

```
/billing
├── Subscription Status Overview (4 cards)
├── Detailed Billing Information
├── Plan Comparison Interface
├── Payment History Table
├── Billing Address Form
└── Subscription Management Panel
```

## Components Overview

### 1. Subscription Status Cards

Four overview cards displaying key subscription information:

**Card Types:**
- **Subscription Status** - Active/Trial/Canceled with animated indicators
- **Current Plan** - Plan name and pricing with gradient styling
- **Next Billing** - Days until next billing with countdown
- **Quick Actions** - Manage subscription or view plans

**Features:**
- Gradient backgrounds with animated pulse effects
- Status-specific color coding (green for active, orange for ending, etc.)
- Real-time status updates
- Responsive grid layout

### 2. Plan Comparison Component

**Location:** `components/billing/plan-comparison.tsx`

Interactive component for comparing and switching subscription plans.

**Props:**
```typescript
interface PlanComparisonProps {
  currentSubscription: Subscription | null
  userId: string
}
```

**Features:**
- Displays all available subscription plans (Starter, Pro, Enterprise)
- Highlights user's current plan with special badge
- "Most Popular" badge for recommended plans
- Feature comparison with checkmarks
- Integrated with Stripe Customer Portal for plan changes
- Loading states during portal access
- Responsive card layout

**Usage:**
```tsx
<PlanComparison 
  currentSubscription={subscription} 
  userId={user.id} 
/>
```

### 3. Payment History Component

**Location:** `components/billing/payment-history.tsx`

Displays user's complete payment history with invoice download functionality.

**Props:**
```typescript
interface PaymentHistoryProps {
  userId: string
}
```

**Features:**
- Fetches payment data from Stripe API
- Displays payment date, amount, status, and description
- Status badges with color coding (Success, Failed, Pending)
- Download invoice functionality for each payment
- Loading skeletons during data fetch
- Empty state for users with no payment history
- Error handling with retry options

**API Integration:**
- `GET /api/stripe/payment-history` - Fetches payment data
- `GET /api/stripe/invoice` - Downloads specific invoices

### 4. Billing Address Form

**Location:** `components/billing/billing-address-form.tsx`

Form component for managing user's billing address information.

**Props:**
```typescript
interface BillingAddressFormProps {
  userId: string
}
```

**Features:**
- Pre-fills with existing billing address from Stripe
- Form validation with error messages
- Country selection dropdown
- Real-time form state management
- Success/error notifications
- Responsive form layout

**Form Fields:**
- Full Name
- Address Line 1
- Address Line 2 (optional)
- City
- State/Province
- Postal Code
- Country (dropdown)

**API Integration:**
- `GET /api/stripe/billing-address` - Fetches current address
- `PUT /api/stripe/billing-address` - Updates address

### 5. Subscription Management Component

**Location:** `components/billing/subscription-management.tsx`

Comprehensive subscription management with cancellation and payment method controls.

**Props:**
```typescript
interface SubscriptionManagementProps {
  subscription: Subscription | null
  userId: string
  onSubscriptionUpdate?: () => void
}
```

**Features:**
- **Subscription Cancellation**:
  - Cancellation button with confirmation dialog
  - Shows end date and access continuation
  - Redirects to Stripe Customer Portal for secure processing

- **Payment Method Management**:
  - Access to Stripe Customer Portal for payment methods
  - Add, update, or remove payment methods securely
  - PCI compliant through Stripe integration

- **Status Alerts**:
  - Visual alerts for different subscription states
  - Orange alert for ending subscriptions
  - Red alert for past due payments
  - Reactivation options for canceled subscriptions

- **Security Features**:
  - All sensitive operations through Stripe Customer Portal
  - Loading states during portal access
  - Security badges showing Stripe protection

## API Endpoints

### Payment History API

**Endpoint:** `/api/stripe/payment-history`

```typescript
// GET /api/stripe/payment-history?userId={userId}
interface PaymentHistoryResponse {
  success: boolean
  payments: Array<{
    id: string
    amount: number
    currency: string
    status: 'succeeded' | 'failed' | 'pending'
    created: number
    description: string
    invoice?: string
  }>
  error?: string
}
```

### Invoice Download API

**Endpoint:** `/api/stripe/invoice`

```typescript
// GET /api/stripe/invoice?invoiceId={invoiceId}
interface InvoiceResponse {
  success: boolean
  url?: string
  error?: string
}
```

### Billing Address API

**Endpoint:** `/api/stripe/billing-address`

```typescript
// GET /api/stripe/billing-address?userId={userId}
interface BillingAddressResponse {
  success: boolean
  address?: {
    name: string
    line1: string
    line2?: string
    city: string
    state: string
    postal_code: string
    country: string
  }
  error?: string
}

// PUT /api/stripe/billing-address
interface UpdateBillingAddressRequest {
  userId: string
  address: {
    name: string
    line1: string
    line2?: string
    city: string
    state: string
    postal_code: string
    country: string
  }
}
```

## Styling and Design

### Glass Card System

All billing components use the `GlassCard` component for consistent styling:

```tsx
<GlassCard variant="primary" size="lg" depth="medium" glow="medium">
  {/* Component content */}
</GlassCard>
```

**Variants:**
- `primary` - Main content cards with stronger glass effect
- `secondary` - Supporting cards with subtle glass effect

### Color System

**Status Colors:**
- **Green** - Active subscriptions, successful payments
- **Blue** - Trial periods, informational states
- **Orange** - Ending subscriptions, warnings
- **Red** - Past due payments, errors
- **Gray** - Canceled subscriptions, neutral states

### Responsive Design

**Breakpoints:**
- **Mobile** (`< 768px`) - Single column layout, stacked cards
- **Tablet** (`768px - 1024px`) - Two-column grid, condensed spacing
- **Desktop** (`> 1024px`) - Multi-column layout, full features

## Integration with Stripe

### Customer Portal Integration

The billing dashboard heavily relies on Stripe's Customer Portal for secure operations:

**Portal Access:**
```typescript
const handlePortalAccess = async () => {
  const response = await fetch('/api/stripe/portal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  })
  
  const data = await response.json()
  if (data.success && data.url) {
    window.location.href = data.url
  }
}
```

**Portal Features:**
- Update payment methods
- Change subscription plans
- Cancel subscriptions
- Download invoices
- Update billing information
- View payment history

### Security Considerations

- **PCI Compliance** - All payment data handled by Stripe
- **Secure Redirects** - Portal sessions with return URLs
- **Authentication** - User verification before portal access
- **Data Protection** - No sensitive payment data stored locally

## Error Handling

### Loading States

All components implement comprehensive loading states:

```tsx
{isLoading ? (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <Skeleton key={i} className="h-16 w-full" />
    ))}
  </div>
) : (
  // Component content
)}
```

### Error States

Graceful error handling with user-friendly messages:

```tsx
{error ? (
  <div className="text-center py-8">
    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
    <h3 className="text-lg font-medium mb-2">Something went wrong</h3>
    <p className="text-muted-foreground mb-4">{error}</p>
    <Button onClick={retry}>Try Again</Button>
  </div>
) : (
  // Component content
)}
```

## Usage Examples

### Basic Implementation

```tsx
// app/billing/page.tsx
import { 
  PlanComparison, 
  PaymentHistory, 
  BillingAddressForm, 
  SubscriptionManagement 
} from '@/components/billing'

export default function BillingPage() {
  const { user, subscription } = await getBillingData()

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Status overview cards */}
        <StatusOverviewCards subscription={subscription} />
        
        {/* Plan comparison */}
        <PlanComparison 
          currentSubscription={subscription} 
          userId={user.id} 
        />
        
        {/* Payment history */}
        <PaymentHistory userId={user.id} />
        
        {/* Billing address */}
        <BillingAddressForm userId={user.id} />
        
        {/* Subscription management */}
        <SubscriptionManagement 
          subscription={subscription} 
          userId={user.id} 
        />
      </div>
    </div>
  )
}
```

### Custom Styling

```tsx
<PlanComparison 
  currentSubscription={subscription} 
  userId={user.id}
  className="custom-plan-comparison"
/>
```

## Testing

### Component Testing

```typescript
// __tests__/billing/plan-comparison.test.ts
import { render, screen, fireEvent } from '@testing-library/react'
import { PlanComparison } from '@/components/billing'

describe('PlanComparison', () => {
  it('highlights current plan', () => {
    render(
      <PlanComparison 
        currentSubscription={mockSubscription} 
        userId="user_123" 
      />
    )
    
    expect(screen.getByText('Current Plan')).toBeInTheDocument()
  })
  
  it('handles portal access', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => ({ success: true, url: 'https://portal.stripe.com' })
    })
    global.fetch = mockFetch
    
    render(<PlanComparison currentSubscription={null} userId="user_123" />)
    
    fireEvent.click(screen.getByText('Upgrade to Pro'))
    
    expect(mockFetch).toHaveBeenCalledWith('/api/stripe/portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'user_123' })
    })
  })
})
```

### API Testing

```typescript
// __tests__/api/stripe/payment-history.test.ts
import { GET } from '@/app/api/stripe/payment-history/route'

describe('/api/stripe/payment-history', () => {
  it('returns payment history for authenticated user', async () => {
    const request = new Request('http://localhost/api/stripe/payment-history?userId=user_123')
    const response = await GET(request)
    const data = await response.json()
    
    expect(data.success).toBe(true)
    expect(Array.isArray(data.payments)).toBe(true)
  })
})
```

## Troubleshooting

### Common Issues

**1. Portal Access Fails**
- Verify Stripe Customer Portal is configured
- Check return URL settings in Stripe Dashboard
- Ensure user has valid Stripe customer ID

**2. Payment History Not Loading**
- Verify Stripe API keys are configured
- Check user has associated Stripe customer
- Ensure proper error handling in API route

**3. Billing Address Not Saving**
- Validate form data before submission
- Check Stripe customer exists
- Verify API endpoint permissions

### Debug Mode

Enable debug logging for billing components:

```typescript
// Set environment variable
DEBUG_BILLING=true

// In component
if (process.env.DEBUG_BILLING) {
  console.log('Billing data:', { subscription, user, payments })
}
```

## Best Practices

### Performance
- Use React.memo for expensive components
- Implement proper loading states
- Cache API responses where appropriate
- Optimize images and icons

### Security
- Never store sensitive payment data
- Always redirect to Stripe for payment operations
- Validate user authentication before API access
- Use HTTPS for all payment-related requests

### User Experience
- Provide clear loading indicators
- Show helpful error messages
- Implement retry mechanisms
- Use progressive enhancement

### Accessibility
- Include proper ARIA labels
- Ensure keyboard navigation works
- Provide screen reader friendly content
- Maintain proper color contrast

## Related Documentation

- [Subscription System](./subscription.md) - Complete subscription system documentation
- [Stripe Setup](./stripe-setup.md) - Stripe configuration and setup
- [Dashboard System](./dashboard-system.md) - Overall dashboard architecture
- [Glass Components](./glass-components.md) - UI component system
- [Authentication](./authentication.md) - User authentication system 