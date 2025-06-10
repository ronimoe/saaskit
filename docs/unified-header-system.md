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
- Call-to-action buttons (Sign In, Sign Up)
- Mobile-responsive hamburger menu
- Theme toggle

**When shown:**
- User is not authenticated
- On public marketing pages

### 2. Authentication Header (`auth`)
**Used for:** Login, signup, password reset pages

**Features:**
- Logo only (maintains brand presence)
- Context-aware alternate action link
- Minimal, distraction-free design
- Theme toggle
- No navigation elements

**When shown:**
- On authentication pages (`/login`, `/signup`, `/reset-password`)
- Regardless of authentication status

### 3. Application Header (`app`)
**Used for:** Dashboard, profile, settings, and other authenticated pages

**Features:**
- Logo with app-focused navigation
- App navigation (Dashboard, Settings, Billing)
- Search functionality
- Notifications with badge indicator
- User avatar with dropdown menu
- Mobile-responsive slide-out menu
- Active page highlighting

**When shown:**
- User is authenticated
- On application pages

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
- `PreAuthHeader` - Landing/marketing header variant
- `AuthHeader` - Authentication pages header variant  
- `AppHeader` - Application/dashboard header variant

### Supporting Components

- `Logo` - Reusable logo component
- Navigation items configuration
- Mobile menu components

## Responsive Design

The header system is fully responsive with:

- **Desktop:** Full navigation and features visible
- **Tablet:** Condensed layout with essential elements
- **Mobile:** Hamburger menu with slide-out navigation

## Authentication Integration

The header integrates with the application's authentication system:

```tsx
// Uses the auth context to determine state
const { isAuthenticated, isLoading, isInitialized } = useAuthContext()
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

### Key Classes
- `sticky top-0 z-50` - Sticky positioning
- `bg-background/95 backdrop-blur` - Glassmorphism effect
- `border-b` - Bottom border
- Responsive breakpoints (`md:`, `lg:`)

## Benefits

### Brand Consistency
- Same logo and color scheme across all pages
- Consistent typography and spacing
- Unified user experience

### Better UX
- Context-appropriate navigation
- No distracting elements on auth pages
- Progressive enhancement based on auth state

### Developer Experience
- Single component for all headers
- Automatic context detection
- TypeScript type safety
- Easy to extend and customize

### Maintenance
- Centralized header logic
- Reduced code duplication
- Single source of truth for navigation

## Best Practices

1. **Use automatic detection** unless you have specific requirements
2. **Customize navigation items** to match your application structure
3. **Test all variants** in different screen sizes
4. **Maintain consistent branding** across all variants
5. **Keep auth headers minimal** to focus user attention

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

## Technical Details

### Dependencies
- React 18+
- Next.js 14+
- shadcn/ui components
- Tailwind CSS
- Lucide React icons
- next-themes

### File Structure
```
components/
  layout/
    unified-header.tsx    # Main header system
  ui/                     # shadcn/ui components
    button.tsx
    dropdown-menu.tsx
    sheet.tsx
    avatar.tsx
    badge.tsx
    separator.tsx
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
```

## Migration Guide

### From Separate Headers
1. Replace individual header components with `UnifiedHeader`
2. Remove duplicate navigation logic
3. Update navigation item configurations
4. Test all page variants

### From No Header System
1. Install dependencies (shadcn/ui components)
2. Add the unified header component
3. Configure navigation items
4. Integrate with authentication system
5. Add to layouts or individual pages

## Troubleshooting

### Common Issues

**Header not showing correct variant:**
- Check authentication context initialization
- Verify pathname detection logic
- Ensure auth state is properly updated

**Mobile menu not working:**
- Verify Sheet component is properly imported
- Check z-index conflicts
- Ensure click handlers are properly bound

**Styling issues:**
- Check Tailwind CSS configuration
- Verify CSS variable definitions
- Test in different screen sizes

### Debug Mode
Enable debug logging to see header state:

```tsx
<UnifiedHeader 
  {...props}
  // Add debug logging in development
  onVariantChange={(variant) => console.log('Header variant:', variant)}
/>
``` 