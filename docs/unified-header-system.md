# Unified Header System

A comprehensive header solution that provides brand consistency across all pages while adapting to user authentication state and page context.

## Overview

The Unified Header System automatically detects the user's authentication status and current page context to display the most appropriate header variant. This ensures a consistent brand experience while providing context-sensitive navigation and functionality.

## Header Variants

### 1. Landing Header (`landing`)
**Used for:** Public pages like homepage, features, pricing, documentation

**Features:**
- Logo with brand name and tagline
- Main navigation (Home, Features, Pricing, Docs)
- **Authentication-aware buttons:**
  - **Not authenticated:** Sign In, Sign Up buttons
  - **Authenticated:** Dashboard link, Sign Out button
- Mobile-responsive hamburger menu with auth-specific options
- Theme toggle

**When shown:**
- On public marketing pages
- Authentication state determines button display

### 2. Authentication Header (`auth`)
**Used for:** Login, signup, password reset pages

**Features:**
- Logo only (maintains brand presence)
- **Authentication-aware actions:**
  - **Not authenticated:** Context-aware alternate action link (Sign In ↔ Sign Up)
  - **Authenticated:** "Already signed in" message with Dashboard and Sign Out buttons
- Minimal, distraction-free design
- Theme toggle
- No navigation elements

**When shown:**
- On authentication pages (`/login`, `/signup`, `/reset-password`)
- Adapts content based on authentication status

### 3. Application Header (`app`)
**Used for:** Dashboard, profile, settings, and other authenticated pages

**Features:**
- Logo with app-focused navigation
- App navigation (Dashboard, Settings, Billing)
- Search functionality
- Notifications with badge indicator
- User avatar with dropdown menu (includes Sign Out)
- Mobile-responsive slide-out menu
- Active page highlighting
- **Dashboard Integration**: Works seamlessly with dashboard layout and breadcrumb navigation

**When shown:**
- User is authenticated
- On application pages

**Dashboard Integration:**
The `app` variant is specifically designed to work with the dashboard layout system:
- Integrated with `DashboardLayout` component for responsive sidebar navigation
- Positioned above breadcrumb navigation for proper hierarchy
- Mobile hamburger menu positioned to avoid overlap with dashboard controls
- Theme toggle synchronized with dashboard skeleton loading states

## Authentication-Aware Behavior

The header system now provides consistent logout functionality across all variants:

### When User is Authenticated:
- **Landing Header:** Shows Dashboard button + Sign Out button instead of Sign In/Sign Up
- **Auth Header:** Shows "Already signed in" message with Dashboard and Sign Out options
- **App Header:** Full authenticated experience with user menu including Sign Out

### When User is Not Authenticated:
- **Landing Header:** Shows Sign In and Sign Up buttons
- **Auth Header:** Shows context-aware alternate action (Sign In ↔ Sign Up)
- **App Header:** Not shown (user redirected to auth pages)

## Usage

### Automatic Detection (Recommended)

The header automatically detects the appropriate variant based on authentication state and current path:

```tsx
import { UnifiedHeader } from '@/components/layout/unified-header'

export default function MyPage() {
  return (
    <div>
      <UnifiedHeader />
      {/* Your page content */}
    </div>
  )
}
```

### Manual Variant Specification

You can manually specify which variant to use:

```tsx
// Force landing header
<UnifiedHeader variant="landing" />

// Force auth header
<UnifiedHeader variant="auth" />

// Force app header
<UnifiedHeader variant="app" />
```

### Customization Options

#### Landing Header Options
```tsx
<UnifiedHeader 
  variant="landing"
  showNavigation={true}  // Show/hide navigation menu
  className="custom-class"
/>
```

#### Application Header Options
```tsx
<UnifiedHeader 
  variant="app"
  showSearch={true}        // Show/hide search button
  showNotifications={true} // Show/hide notifications
  className="custom-class"
/>
```

## Component Structure

### Main Components

- `UnifiedHeader` - Main component with automatic detection
- `PreAuthHeader` - Landing/marketing header variant (now auth-aware)
- `AuthHeader` - Authentication pages header variant (now auth-aware)
- `AppHeader` - Application/dashboard header variant

### Supporting Components

- `Logo` - Reusable logo component
- Navigation items configuration
- Mobile menu components
- Authentication state handlers

## Responsive Design

The header system is fully responsive with:

- **Desktop:** Full navigation and features visible
- **Tablet:** Condensed layout with essential elements
- **Mobile:** Hamburger menu with slide-out navigation
- **Authentication-aware mobile menus:** Different options for authenticated vs non-authenticated users

## Authentication Integration

The header integrates with the application's authentication system:

```tsx
// Uses the auth context to determine state and provide logout functionality
const { isAuthenticated, isLoading, isInitialized, signOut, user } = useAuthContext()

// Logout handler available in all variants
const handleSignOut = async () => {
  try {
    await signOut()
    router.push('/')
  } catch (error) {
    console.error('Sign out error:', error)
  }
}
```

During loading states, a skeleton header is shown to prevent layout shifts.

## Navigation Configuration

### Landing Navigation
```tsx
const landingNavItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/features', label: 'Features', icon: Zap },
  { href: '/pricing', label: 'Pricing', icon: CreditCard },
  { href: '/docs', label: 'Docs', icon: HelpCircle },
]
```

### App Navigation
```tsx
const appNavItems = [
  { href: '/profile', label: 'Dashboard', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/billing', label: 'Billing', icon: CreditCard },
]
```

## Styling and Theming

The header system uses:

- **shadcn/ui** components for consistency
- **Tailwind CSS** for styling
- **CSS variables** for theming
- **Dark mode** support via next-themes
- **Consistent logout button styling** with red accents across variants

### Key Classes
- `sticky top-0 z-50` - Sticky positioning
- `bg-background/95 backdrop-blur` - Glassmorphism effect
- `border-b` - Bottom border
- `text-red-600 dark:text-red-400` - Logout button styling
- Responsive breakpoints (`md:`, `lg:`)

## Benefits

### Brand Consistency
- Same logo and color scheme across all pages
- Consistent typography and spacing
- Unified user experience
- **Consistent logout experience** across all pages

### Better UX
- Context-appropriate navigation
- No distracting elements on auth pages
- Progressive enhancement based on auth state
- **Always accessible logout** when authenticated
- **Clear authentication status** on all pages

### Developer Experience
- Single component for all headers
- Automatic context detection
- TypeScript type safety
- Easy to extend and customize
- **Built-in authentication handling**

### Maintenance
- Centralized header logic
- Reduced code duplication
- Single source of truth for navigation
- **Centralized authentication state management**

## Best Practices

1. **Use automatic detection** unless you have specific requirements
2. **Customize navigation items** to match your application structure
3. **Test all variants** in different screen sizes and authentication states
4. **Maintain consistent branding** across all variants
5. **Keep auth headers minimal** to focus user attention
6. **Ensure logout is always accessible** for authenticated users
7. **Test authentication state changes** to verify header updates correctly

## Examples

### Basic Implementation
```tsx
// app/layout.tsx
import { UnifiedHeader } from '@/components/layout/unified-header'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <UnifiedHeader />
        <main>{children}</main>
      </body>
    </html>
  )
}
```

### Page-Specific Headers
```tsx
// app/special-page/page.tsx
import { PreAuthHeader } from '@/components/layout/unified-header'

export default function SpecialPage() {
  return (
    <div>
      <PreAuthHeader variant="landing" showNavigation={false} />
      {/* Special page content without navigation */}
    </div>
  )
}
```

### Authentication State Examples

**Landing page for authenticated user:**
```tsx
// Shows: Logo + Navigation + Dashboard button + Sign Out button
<UnifiedHeader variant="landing" />
```

**Login page for authenticated user:**
```tsx
// Shows: Logo + "Already signed in" + Dashboard button + Sign Out button
<UnifiedHeader variant="auth" />
```

## Technical Details

### Dependencies
- React 18+
- Next.js 14+
- shadcn/ui components
- Tailwind CSS
- Lucide React icons
- next-themes
- Authentication context provider

### File Structure
```
components/
  layout/
    unified-header.tsx    # Main header system with auth-aware variants
  ui/                     # shadcn/ui components
    button.tsx
    dropdown-menu.tsx
    sheet.tsx
    avatar.tsx
    badge.tsx
    separator.tsx
  providers/
    auth-provider.tsx     # Authentication context
```

### TypeScript Types
```tsx
export type HeaderVariant = 'landing' | 'auth' | 'app'

export interface HeaderConfig {
  variant: HeaderVariant
  showNavigation?: boolean
  showSearch?: boolean
  showNotifications?: boolean
  showUserMenu?: boolean
  className?: string
}

// Authentication context integration
interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  signOut: () => Promise<void>
  // ... other auth properties
}
```

## Migration Guide

### From Separate Headers
1. Replace individual header components with `UnifiedHeader`
2. Remove duplicate navigation logic
3. Remove separate logout implementations
4. Update navigation item configurations
5. Test all page variants with different authentication states

### From No Header System
1. Install dependencies (shadcn/ui components)
2. Set up authentication context provider
3. Add the unified header component
4. Configure navigation items
5. Integrate with authentication system
6. Add to layouts or individual pages
7. Test authentication state changes

## Troubleshooting

### Common Issues

**Header not showing correct variant:**
- Check authentication context initialization
- Verify pathname detection logic
- Ensure auth state is properly updated

**Logout not working:**
- Verify authentication context is properly provided
- Check signOut function implementation
- Ensure router navigation after logout

**Mobile menu not working:**
- Verify Sheet component is properly imported
- Check z-index conflicts
- Ensure click handlers are properly bound

**Authentication state not updating:**
- Check authentication provider setup
- Verify auth state change listeners
- Ensure proper React state updates

### Debug Mode
Enable debug logging to see header state:

```tsx
<UnifiedHeader 
  {...props}
  // Add debug logging in development
  onVariantChange={(variant) => console.log('Header variant:', variant)}
/>
```

### Authentication Testing
Test different authentication scenarios:

```tsx
// Test cases:
// 1. Not authenticated on landing page
// 2. Authenticated on landing page  
// 3. Not authenticated on auth page
// 4. Authenticated on auth page
// 5. Authenticated on app page
// 6. Logout from each variant
// 7. Mobile menu behavior in each state
```

## Dashboard System Integration

The Unified Header System is designed to work seamlessly with the dashboard layout system:

### Layout Structure
```tsx
// Dashboard pages use this structure
export default function DashboardLayout({ children }) {
  return (
    <>
      <UnifiedHeader variant="app" />
      <DashboardLayout>
        <Breadcrumb />
        {children}
      </DashboardLayout>
    </>
  )
}
```

### Mobile Positioning
- Header: `fixed top-0` with proper z-index
- Mobile toggle: `top-20` to avoid header overlap
- Breadcrumb: Below header in main content area
- Sidebar: Overlay with backdrop on mobile

### Theme Synchronization
- Header theme toggle affects dashboard skeleton states
- Loading states respect theme preferences
- Consistent brand colors throughout dashboard components

## Related Documentation

- **[Dashboard System](./dashboard-system.md)** - Complete dashboard layout and navigation system
- **[Authentication Overview](./authentication-overview.md)** - Authentication system integration
- **[Theme System](./theme-system.md)** - Theme integration and customization
- **[Branding Configuration](./branding-configuration.md)** - Brand configuration and logo system 