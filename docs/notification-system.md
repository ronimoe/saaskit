# Notification System Documentation

A comprehensive, type-safe notification system built on Sonner with specialized methods for authentication, billing, forms, and general user feedback.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Core Features](#core-features)
4. [API Reference](#api-reference)
5. [Integration Examples](#integration-examples)
6. [Best Practices](#best-practices)
7. [Testing](#testing)
8. [Migration Guide](#migration-guide)

## Overview

The notification system provides a centralized, consistent way to display user feedback across the application. Built on top of [Sonner](https://sonner.emilkowal.ski/), it offers specialized notification types for different contexts while maintaining accessibility and user experience standards.

### Key Benefits

- **Centralized Management**: Single source of truth for all notifications
- **Type Safety**: Full TypeScript support with proper typing
- **Context-Aware**: Specialized methods for auth, billing, forms, and general feedback
- **Consistent UX**: Standardized duration, styling, and behavior
- **Promise Integration**: Built-in support for async operations with loading states
- **Accessibility**: Screen reader compatible with proper ARIA attributes

### Architecture

```
lib/notifications.ts           # Core NotificationService class
components/providers/
  notification-provider.tsx    # React context provider
components/ui/sonner.tsx      # Sonner component configuration
```

## Quick Start

### 1. Provider Setup

The notification provider is already configured in your app layout:

```typescript
// app/layout.tsx
import { NotificationProvider } from '@/components/providers/notification-provider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </body>
    </html>
  )
}
```

### 2. Basic Usage

```typescript
import { useNotifications } from '@/components/providers/notification-provider'

function MyComponent() {
  const notifications = useNotifications()

  const handleSuccess = () => {
    notifications.success('Operation completed successfully!')
  }

  const handleError = () => {
    notifications.error('Something went wrong')
  }

  return (
    <div>
      <button onClick={handleSuccess}>Success</button>
      <button onClick={handleError}>Error</button>
    </div>
  )
}
```

### 3. Authentication Integration

```typescript
import { useNotifications } from '@/components/providers/notification-provider'

function LoginForm() {
  const notifications = useNotifications()

  const handleLogin = async (email: string, password: string) => {
    try {
      const result = await signIn(email, password)
      if (result.error) {
        notifications.authError(result.error.message)
      } else {
        notifications.authSuccess('Welcome back!')
      }
    } catch (error) {
      notifications.authError('Login failed')
    }
  }
}
```

## Core Features

### Notification Types

| Type | Method | Use Case | Duration | Icon |
|------|--------|----------|----------|------|
| Success | `success()` | Successful operations | 4s | ✅ |
| Error | `error()` | General errors | 6s | ❌ |
| Warning | `warning()` | Warnings and alerts | 5s | ⚠️ |
| Info | `info()` | Informational messages | 4s | ℹ️ |
| Auth Success | `authSuccess()` | Successful authentication | 4s | ✅ |
| Auth Error | `authError()` | Authentication failures | 6s | 🔒 |
| Form Success | `formSuccess()` | Form submissions | 4s | ✅ |
| Form Error | `formError()` | Form validation errors | 6s | 📝 |
| Payment Success | `paymentSuccess()` | Payment completions | 5s | 💳 |
| Payment Error | `paymentError()` | Payment failures | 7s | 💳 |

### Advanced Features

- **Promise Notifications**: Show loading states with automatic success/error handling
- **Custom Notifications**: Full customization with actions, descriptions, and styling
- **Batch Operations**: Queue multiple notifications with intelligent deduplication
- **Persistence**: Important notifications persist across page reloads
- **Accessibility**: Screen reader support and keyboard navigation

## API Reference

### Core Methods

#### `success(message: string, options?: NotificationOptions)`

Display a success notification.

```typescript
notifications.success('Profile updated successfully!')

// With description
notifications.success('Profile updated', {
  description: 'Your changes have been saved',
  duration: 3000
})
```

#### `error(message: string, options?: NotificationOptions)`

Display an error notification.

```typescript
notifications.error('Failed to save changes')

// With action
notifications.error('Network error', {
  action: {
    label: 'Retry',
    onClick: () => retryOperation()
  }
})
```

#### `warning(message: string, options?: NotificationOptions)`

Display a warning notification.

```typescript
notifications.warning('Your session will expire soon', {
  duration: 8000,
  action: {
    label: 'Extend',
    onClick: () => extendSession()
  }
})
```

#### `info(message: string, options?: NotificationOptions)`

Display an informational notification.

```typescript
notifications.info('New features available!', {
  description: 'Check out the latest updates in your dashboard'
})
```

### Authentication Methods

#### `authSuccess(message?: string, options?: NotificationOptions)`

Specialized success notification for authentication events.

```typescript
// Default message
notifications.authSuccess()
// → "Welcome back!" with "Welcome back to your dashboard" description

// Custom message
notifications.authSuccess('Account created successfully!', {
  description: 'Please check your email to verify your account'
})
```

#### `authError(message: string, options?: NotificationOptions)`

Specialized error notification for authentication failures.

```typescript
notifications.authError('Invalid credentials', {
  description: 'Please check your email and password'
})
```

### Form Methods

#### `formSuccess(message: string, options?: NotificationOptions)`

Success notification for form submissions.

```typescript
notifications.formSuccess('Profile updated successfully!')
```

#### `formError(message: string, options?: NotificationOptions)`

Error notification for form validation or submission failures.

```typescript
notifications.formError('Please fix the following errors:\n- Email is required\n- Password too short')
```

### Payment Methods

#### `paymentSuccess(message: string, options?: NotificationOptions)`

Success notification for payment operations.

```typescript
notifications.paymentSuccess('Payment completed successfully!', {
  description: 'Your subscription has been activated'
})
```

#### `paymentError(message: string, options?: NotificationOptions)`

Error notification for payment failures.

```typescript
notifications.paymentError('Payment failed', {
  description: 'Please check your payment method and try again',
  action: {
    label: 'Update Payment',
    onClick: () => openPaymentSettings()
  }
})
```

### Promise Integration

#### `promise<T>(promise: Promise<T>, options: PromiseNotificationOptions)`

Handle async operations with loading, success, and error states.

```typescript
const saveProfile = async () => {
  await notifications.promise(
    updateUserProfile(profileData),
    {
      loading: 'Saving profile...',
      success: 'Profile updated successfully!',
      error: 'Failed to update profile'
    }
  )
}
```

#### Advanced Promise Example

```typescript
const processPayment = async () => {
  try {
    const result = await notifications.promise(
      createPaymentIntent(amount),
      {
        loading: 'Processing payment...',
        success: (result) => `Payment of $${result.amount} completed!`,
        error: (error) => `Payment failed: ${error.message}`
      }
    )
    
    // Handle successful result
    router.push('/success')
  } catch (error) {
    // Error already handled by notification system
    console.error('Payment failed:', error)
  }
}
```

### Custom Notifications

#### `custom(message: string, options: CustomNotificationOptions)`

Create fully customized notifications.

```typescript
notifications.custom('System maintenance scheduled', {
  duration: Infinity, // Persistent until dismissed
  icon: '🔧',
  description: 'Maintenance will begin at 2 AM EST',
  action: {
    label: 'Learn More',
    onClick: () => window.open('/maintenance-info')
  },
  cancel: {
    label: 'Dismiss',
    onClick: () => {} // Auto-handled
  },
  style: {
    background: 'var(--warning-bg)',
    color: 'var(--warning-text)'
  }
})
```

## Integration Examples

### Authentication Flow

```typescript
// components/auth/login-form.tsx
import { useNotifications } from '@/components/providers/notification-provider'

export function LoginForm() {
  const notifications = useNotifications()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    
    try {
      const result = await notifications.promise(
        signInWithPassword(data.email, data.password),
        {
          loading: 'Signing you in...',
          success: 'Welcome back!',
          error: 'Invalid email or password'
        }
      )
      
      // Redirect on success
      router.push('/dashboard')
    } catch (error) {
      // Error already handled by notification
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Signing In...' : 'Sign In'}
      </button>
    </form>
  )
}
```

### Billing Integration

```typescript
// components/checkout-button.tsx
import { useNotifications } from '@/components/providers/notification-provider'

export function CheckoutButton({ priceId }: { priceId: string }) {
  const notifications = useNotifications()

  const handleCheckout = async () => {
    try {
      const session = await notifications.promise(
        createCheckoutSession({ priceId }),
        {
          loading: 'Creating checkout session...',
          success: 'Redirecting to checkout...',
          error: 'Failed to create checkout session'
        }
      )

      // Redirect to Stripe Checkout
      await stripe.redirectToCheckout({ sessionId: session.id })
    } catch (error) {
      notifications.paymentError('Checkout failed', {
        description: 'Please try again or contact support',
        action: {
          label: 'Contact Support',
          onClick: () => openSupportChat()
        }
      })
    }
  }

  return (
    <button onClick={handleCheckout}>
      Subscribe Now
    </button>
  )
}
```

### Form Validation

```typescript
// components/profile-form.tsx
import { useNotifications } from '@/components/providers/notification-provider'

export function ProfileForm() {
  const notifications = useNotifications()
  const form = useForm<ProfileFormData>()

  const onSubmit = async (data: ProfileFormData) => {
    // Validate form data
    const validation = validateProfileData(data)
    if (!validation.isValid) {
      notifications.formError(`Please fix the following errors:\n${validation.errors.join('\n')}`)
      return
    }

    try {
      await notifications.promise(
        updateProfile(data),
        {
          loading: 'Updating profile...',
          success: 'Profile updated successfully!',
          error: 'Failed to update profile'
        }
      )

      // Additional success actions
      form.reset()
    } catch (error) {
      console.error('Profile update failed:', error)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  )
}
```

## Best Practices

### 1. Use Appropriate Notification Types

```typescript
// ✅ Good: Use specific methods for context
notifications.authError('Invalid credentials')
notifications.paymentSuccess('Payment completed')
notifications.formError('Validation failed')

// ❌ Avoid: Generic methods for specific contexts
notifications.error('Invalid credentials') // Less clear context
```

### 2. Provide Helpful Descriptions

```typescript
// ✅ Good: Informative descriptions
notifications.error('Failed to save changes', {
  description: 'Please check your internet connection and try again'
})

// ❌ Avoid: Vague messages
notifications.error('Error occurred')
```

### 3. Use Promise Notifications for Async Operations

```typescript
// ✅ Good: Built-in loading states
await notifications.promise(
  saveData(),
  {
    loading: 'Saving...',
    success: 'Saved successfully!',
    error: 'Failed to save'
  }
)

// ❌ Avoid: Manual loading state management
setLoading(true)
try {
  await saveData()
  notifications.success('Saved!')
} catch {
  notifications.error('Failed')
} finally {
  setLoading(false)
}
```

### 4. Provide Recovery Actions

```typescript
// ✅ Good: Actionable notifications
notifications.error('Network error', {
  action: {
    label: 'Retry',
    onClick: () => retryOperation()
  }
})

// ✅ Good: Alternative actions
notifications.paymentError('Card declined', {
  action: {
    label: 'Update Payment Method',
    onClick: () => openPaymentSettings()
  }
})
```

## Testing

### Testing Components with Notifications

```typescript
// __tests__/test-utils.tsx
import { render, RenderOptions } from '@testing-library/react'
import { NotificationProvider } from '@/components/providers/notification-provider'

const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <NotificationProvider>
      {children}
    </NotificationProvider>
  )
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }
```

### Mocking Notifications in Tests

```typescript
// Mock the notification service
const mockNotifications = {
  success: jest.fn(),
  error: jest.fn(),
  authSuccess: jest.fn(),
  paymentError: jest.fn(),
  promise: jest.fn().mockImplementation((promise, options) => {
    return promise.catch(() => {})
  })
}

jest.mock('@/components/providers/notification-provider', () => ({
  useNotifications: () => mockNotifications,
  NotificationProvider: ({ children }: { children: React.ReactNode }) => children
}))
```

## Migration Guide

### From Direct Toast Usage

#### Before (Direct Toast)

```typescript
import { toast } from 'sonner'

function MyComponent() {
  const handleLogin = async () => {
    try {
      await signIn()
      toast.success('Welcome back!')
    } catch (error) {
      toast.error('Login failed')
    }
  }
}
```

#### After (Notification Service)

```typescript
import { useNotifications } from '@/components/providers/notification-provider'

function MyComponent() {
  const notifications = useNotifications()

  const handleLogin = async () => {
    try {
      await signIn()
      notifications.authSuccess('Welcome back!')
    } catch (error) {
      notifications.authError('Login failed')
    }
  }
}
```

### Migration Steps

1. Remove direct toast imports
2. Add notification provider import
3. Add hook in component
4. Replace toast calls with context-specific methods
5. Leverage promise notifications for async operations

---

## System Integration

The notification system is integrated throughout the application:

### Authentication Integration
- **Login/Signup Forms**: Use `authSuccess()` and `authError()` for authentication feedback
- **Password Reset**: Specialized messaging for password reset flows
- **OAuth Flows**: Integrated with Google and GitHub authentication

### Billing Integration
- **Checkout Process**: `paymentSuccess()` and `paymentError()` for payment operations
- **Subscription Management**: Billing portal and subscription updates
- **Customer Portal**: Enhanced error handling with actionable notifications

### Form Integration
- **Profile Updates**: `formSuccess()` and `formError()` for form submissions
- **Validation Feedback**: Real-time validation error display
- **Data Persistence**: Promise notifications for async form operations

### Component Integration
All major components now use the notification system:
- `components/auth/*` - Authentication forms
- `components/checkout-button.tsx` - Payment processing
- `components/billing-portal-button.tsx` - Billing management
- `components/profile-form.tsx` - Profile updates

## Related Documentation

- [UI System Overview](./ui-system-overview.md) - Complete UI component system
- [Authentication System](./authentication.md) - Authentication implementation details
- [Subscription System](./subscription.md) - Payment and billing integration

---

*Last Updated: December 2024*
*Version: 1.0.0* 