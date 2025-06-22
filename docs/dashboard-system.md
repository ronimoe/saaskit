# Dashboard Layout and Navigation System

A comprehensive dashboard system built with Next.js 15 App Router that provides responsive navigation, breadcrumb functionality, theme-aware loading states, and mobile-optimized user experience.

## Overview

The Dashboard System consists of four main components that work together to create a modern, accessible, and responsive dashboard experience:

1. **Main Dashboard Layout** - Responsive sidebar navigation with authenticated header
2. **Breadcrumb Navigation** - Automatic route-based navigation with accessibility features
3. **Responsive Mobile Navigation** - Touch-optimized mobile experience with overlay sidebar
4. **Loading Skeleton System** - Theme-aware loading states for improved perceived performance

## Architecture

```
app/dashboard/
├── layout.tsx          # Main dashboard layout wrapper
├── page.tsx            # Dashboard home page
└── settings/
    └── page.tsx        # Example settings page

components/
├── ui/
│   ├── breadcrumb.tsx           # Breadcrumb navigation component
│   └── dashboard-skeleton.tsx   # Loading skeleton components
├── dashboard-content.tsx        # Client component with loading states
└── layout/
    ├── unified-header.tsx       # App header variant
    └── dashboard-sidebar.tsx    # Responsive sidebar navigation
```

## Components

### 1. Dashboard Layout (`app/dashboard/layout.tsx`)

The main layout wrapper that integrates the unified header and dashboard sidebar for all dashboard pages.

```tsx
import { UnifiedHeader } from '@/components/layout/unified-header'
import { DashboardLayout } from '@/components/layout/dashboard-sidebar'

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <UnifiedHeader variant="app" />
      <DashboardLayout>{children}</DashboardLayout>
    </>
  )
}
```

**Features:**
- Uses `UnifiedHeader` with `app` variant for authenticated experience
- Integrates `DashboardLayout` for responsive sidebar navigation
- Provides consistent layout for all dashboard pages
- Automatic authentication protection via middleware

### 2. Breadcrumb Navigation (`components/ui/breadcrumb.tsx`)

Automatic breadcrumb generation based on the current route with full accessibility support.

```tsx
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'

// Usage in dashboard layout
<Breadcrumb className="mb-4 md:mb-6">
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Settings</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

**Features:**
- **Automatic Route Generation**: Creates breadcrumbs from current pathname
- **Accessibility**: Full ARIA support with navigation landmarks
- **Mobile Responsive**: Horizontal scrolling with touch-friendly targets (44px minimum)
- **Customizable Separators**: Configurable separator icons and styling
- **Active Page Indication**: Current page shown as non-clickable text
- **SEO Friendly**: Semantic HTML structure with proper navigation hierarchy

**Key Properties:**
- `generateBreadcrumbs()` - Automatic breadcrumb generation from pathname
- `formatSegment()` - Converts URL segments to readable labels
- Mobile-optimized with `overflow-x-auto` and `whitespace-nowrap`
- Touch targets meet iOS minimum size requirements

### 3. Dashboard Skeleton System (`components/ui/dashboard-skeleton.tsx`)

Comprehensive loading skeleton components that match the exact layout of dashboard content.

```tsx
import { DashboardSkeleton, MetricsCardSkeleton, TableSkeleton } from '@/components/ui/dashboard-skeleton'

// Full dashboard loading state
<DashboardSkeleton />

// Individual components
<MetricsCardSkeleton />
<TableSkeleton rows={5} columns={4} />
```

**Available Skeleton Components:**

| Component | Description | Use Case |
|-----------|-------------|----------|
| `DashboardSkeleton` | Complete dashboard loading state | Main dashboard page |
| `MetricsCardSkeleton` | Metrics/stats card placeholder | KPI cards, analytics |
| `QuickActionCardSkeleton` | Action button card placeholder | Quick action buttons |
| `RecentActivitySkeleton` | Activity timeline placeholder | Activity feeds |
| `TableSkeleton` | Configurable table placeholder | Data tables |
| `FormSkeleton` | Form loading state | Settings forms |
| `ProfileSkeleton` | Profile page placeholder | User profile pages |
| `BillingSkeleton` | Billing page placeholder | Subscription pages |

**Billing Dashboard Components:**

The dashboard system includes specialized billing components for subscription management:

| Component | Description | Location |
|-----------|-------------|----------|
| `PlanComparison` | Interactive plan comparison with upgrade/downgrade | `components/billing/plan-comparison.tsx` |
| `PaymentHistory` | Payment history table with invoice downloads | `components/billing/payment-history.tsx` |
| `BillingAddressForm` | Billing address management form | `components/billing/billing-address-form.tsx` |
| `SubscriptionManagement` | Subscription cancellation and payment methods | `components/billing/subscription-management.tsx` |

For detailed billing dashboard documentation, see the [Billing Dashboard Guide](./billing-dashboard.md).

**Features:**
- **Theme Aware**: Inherits proper styling via `bg-muted` class
- **Responsive**: Matches exact dimensions of real content
- **Configurable**: Customizable rows, columns, and dimensions
- **Accessible**: Proper loading indicators for screen readers
- **Performance**: Lightweight CSS-based animations

### 4. Dashboard Content with Loading States (`components/dashboard-content.tsx`)

Client component that demonstrates proper loading state management with skeleton integration.

```tsx
'use client'

import { useState, useEffect } from 'react'
import { DashboardSkeleton } from '@/components/ui/dashboard-skeleton'

export default function DashboardContent() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      setIsLoading(false)
    }
    loadData()
  }, [])

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    // Dashboard content
  )
}
```

**Features:**
- **Client-Side Loading**: React hooks for loading state management
- **Smooth Transitions**: Seamless transition from skeleton to content
- **Simulated Delays**: Demonstrates skeleton functionality
- **Type Safety**: Full TypeScript interfaces for data structures

## Responsive Design

### Desktop Experience
- **Full Sidebar Navigation**: Always visible with hover states
- **Breadcrumb Navigation**: Full breadcrumb trail with separators
- **Optimal Spacing**: `p-6` padding for comfortable content spacing
- **Theme Toggle**: Accessible theme switching in header

### Tablet Experience
- **Collapsible Sidebar**: Responsive breakpoints for optimal space usage
- **Condensed Navigation**: Essential navigation elements prioritized
- **Touch Optimization**: Larger touch targets for tablet interaction

### Mobile Experience
- **Overlay Sidebar**: Slide-out navigation with backdrop
- **Hamburger Menu**: Toggle button positioned below header (`top-20`)
- **Horizontal Breadcrumbs**: Scrollable breadcrumb navigation
- **Compact Spacing**: `p-4` padding for mobile screens
- **Touch Targets**: 44px minimum size for iOS compliance

## Navigation Integration

### Sidebar Navigation
The dashboard uses the existing `DashboardSidebar` component with:

- **Responsive Behavior**: Auto-collapse on mobile devices
- **Active State**: Highlights current page in navigation
- **Icon Integration**: Lucide icons for visual navigation cues
- **Accessibility**: Proper ARIA labels and keyboard navigation

### Header Integration
Uses `UnifiedHeader` with `app` variant providing:

- **User Avatar Dropdown**: Profile, Settings, Billing, Sign Out
- **Search Functionality**: Global search with keyboard shortcuts
- **Notifications**: Badge indicators for user alerts
- **Theme Toggle**: Light/dark mode switching with persistence

## Loading States and Performance

### Skeleton Loading Strategy
1. **Immediate Display**: Skeletons show instantly on page load
2. **Exact Matching**: Skeleton dimensions match real content
3. **Smooth Transitions**: Fade-in effect when real content loads
4. **Progressive Enhancement**: Content loads in sections as data arrives

### Performance Optimizations
- **CSS-Based Animations**: Hardware-accelerated skeleton animations
- **Minimal JavaScript**: Client components only where necessary
- **Tree Shaking**: Import only required skeleton components
- **Memory Efficient**: Automatic cleanup of loading states

## Accessibility Features

### Navigation Accessibility
- **ARIA Landmarks**: Proper navigation, main, and complementary regions
- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Screen Reader Support**: Descriptive labels and live regions
- **Focus Management**: Logical tab order and visible focus indicators

### Breadcrumb Accessibility
- **Navigation Landmark**: `<nav aria-label="Breadcrumb">` wrapper
- **Ordered List**: Semantic HTML with `<ol>` structure
- **Current Page**: `aria-current="page"` for active breadcrumb
- **Descriptive Text**: Clear, readable breadcrumb labels

### Loading State Accessibility
- **Loading Indicators**: Proper ARIA live regions for screen readers
- **Skeleton Labels**: Descriptive text for loading content areas
- **Progressive Enhancement**: Graceful degradation without JavaScript

## Theme Integration

### Dark/Light Mode Support
- **Automatic Detection**: System preference detection on first load
- **Manual Toggle**: User preference override with persistence
- **Skeleton Theming**: Loading states adapt to current theme
- **Consistent Styling**: Theme variables used throughout components

### Brand Integration
- **Color System**: Integrates with brand configuration system
- **Logo Display**: Consistent brand presence in header
- **Custom Styling**: Extensible theme system for customization

## Usage Examples

### Basic Dashboard Page
```tsx
// app/dashboard/analytics/page.tsx
export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Analytics content */}
      </div>
    </div>
  )
}
```

### Page with Loading State
```tsx
// app/dashboard/reports/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { TableSkeleton } from '@/components/ui/dashboard-skeleton'

export default function ReportsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [reports, setReports] = useState([])

  useEffect(() => {
    loadReports().then(data => {
      setReports(data)
      setIsLoading(false)
    })
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Reports</h1>
      
      {isLoading ? (
        <TableSkeleton rows={8} columns={5} />
      ) : (
        <ReportsTable data={reports} />
      )}
    </div>
  )
}
```

### Custom Breadcrumb Implementation
```tsx
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'

export default function CustomBreadcrumb() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard/analytics">Analytics</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Revenue Report</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
```

## Implementation Checklist

### ✅ Completed Features
- [x] Main dashboard layout with responsive sidebar
- [x] Automatic breadcrumb navigation system
- [x] Mobile-responsive navigation with overlay
- [x] Comprehensive skeleton loading system
- [x] Theme-aware components and styling
- [x] Touch-optimized mobile experience
- [x] Accessibility compliance (WCAG guidelines)
- [x] TypeScript integration with proper types
- [x] Integration with existing auth and theme systems

### 🔄 Integration Points
- **Authentication**: Uses `useAuthContext()` for user state
- **Theme System**: Integrates with `ThemeProvider` and theme toggle
- **Navigation**: Connects with `UnifiedHeader` and `DashboardSidebar`
- **Loading States**: Coordinates with data fetching patterns

### 🎯 Best Practices
- **Client Components**: Use only when necessary for interactivity
- **Loading States**: Always provide skeleton loading for better UX
- **Responsive Design**: Mobile-first approach with proper breakpoints
- **Accessibility**: Include ARIA labels and semantic HTML
- **Performance**: Optimize animations and minimize JavaScript bundle

## Troubleshooting

### Common Issues

**Breadcrumbs not updating:**
- Ensure the component is marked with `'use client'` if using `usePathname()`
- Check that the pathname is being read correctly

**Sidebar overlay conflicts:**
- Verify mobile toggle button positioning (`top-20` to avoid header overlap)
- Ensure backdrop click handlers are properly implemented

**Skeleton dimensions mismatch:**
- Review skeleton component dimensions against real content
- Adjust skeleton classes to match actual component layout

**Mobile navigation issues:**
- Check touch target sizes (minimum 44px for iOS compliance)
- Verify horizontal scrolling works for breadcrumbs on small screens

### Performance Tips

1. **Lazy Load Content**: Use React.lazy() for heavy dashboard components
2. **Optimize Images**: Use Next.js Image component for avatars and graphics
3. **Minimize Rerenders**: Use React.memo() for static skeleton components
4. **Bundle Analysis**: Monitor skeleton component bundle size impact

## Related Documentation

- **[Unified Header System](./unified-header-system.md)** - Header integration and authentication
- **[UI System Overview](./ui-system-overview.md)** - Complete UI component system
- **[Theme System](./theme-system.md)** - Theme integration and customization
- **[Authentication Overview](./authentication-overview.md)** - Authentication integration
- **[Notification System](./notification-system.md)** - User feedback and notifications 