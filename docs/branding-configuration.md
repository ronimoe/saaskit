# Branding Configuration System

A comprehensive, type-safe branding configuration system for customizing your SaaS application's visual identity, logos, colors, and metadata.

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Configuration Structure](#configuration-structure)
- [Components & Hooks](#components--hooks)
- [Server-Side Integration](#server-side-integration)
- [Customization Guide](#customization-guide)
- [Testing](#testing)
- [Best Practices](#best-practices)
- [Migration Guide](#migration-guide)

## Overview

The branding configuration system provides:

- **Type-safe configuration** with Zod validation
- **Dynamic color systems** supporting OKLCH, HEX, and RGB formats
- **Logo management** with multiple variants (primary, secondary, icon)
- **Metadata generation** for SEO and social sharing
- **Server/client compatibility** for Next.js 15
- **Theme integration** with glassmorphism and animation controls
- **Runtime validation** with helpful error messages

## Quick Start

### 1. Basic Usage

The system is automatically configured and ready to use. Access brand configuration throughout your app:

```typescript
import { useBrand, BrandLogo, BrandIcon } from '@/components/ui/logo'
import { useBrandColors, useBrandCompany } from '@/components/providers/brand-provider'

function Header() {
  const { config } = useBrand()
  const { colors } = useBrandColors()
  const company = useBrandCompany()
  
  return (
    <header>
      <BrandLogo className="h-8" />
      <h1 style={{ color: colors.primary }}>{company.name}</h1>
    </header>
  )
}
```

### 2. Logo Components

Use specialized logo components for different contexts:

```typescript
// Primary brand logo
<BrandLogo className="h-8 w-auto" priority />

// Small icon variant
<BrandIcon className="h-6 w-6" />

// Secondary/mark logo
<BrandMark className="h-8 w-8" />

// Custom logo with full control
<Logo 
  type="primary" 
  width={200} 
  height={60} 
  className="custom-logo"
  priority={true}
/>
```

### 3. Server-Side Usage

Access brand configuration in server components and API routes:

```typescript
import { getBrandConfig, getBrandMetadata } from '@/lib/brand-server'

// Generate metadata for pages
export async function generateMetadata() {
  return getBrandMetadata(
    "Custom Page Title",
    "Custom page description"
  )
}

// Server component usage
export default function Page() {
  const config = getBrandConfig()
  
  return (
    <div>
      <h1>{config.company.name}</h1>
      <p>{config.company.tagline}</p>
    </div>
  )
}
```

## Configuration Structure

The brand configuration follows this comprehensive structure:

```typescript
interface BrandConfig {
  company: {
    name: string                    // Required: Company name
    tagline?: string               // Optional: Company tagline
    description?: string           // Optional: Company description
    website?: string               // Optional: Website URL
    email?: string                 // Optional: Contact email
    phone?: string                 // Optional: Phone number
    address?: {                    // Optional: Physical address
      street?: string
      city?: string
      state?: string
      zip?: string
      country?: string
    }
    social?: {                     // Optional: Social media links
      twitter?: string
      linkedin?: string
      github?: string
      facebook?: string
      instagram?: string
      youtube?: string
    }
  }
  
  colors: {
    primary: string                // OKLCH, HEX, or RGB format
    secondary: string
    accent: string
    success: string
    warning: string
    error: string
    info: string
  }
  
  logos: {
    primary: {                     // Required: Main brand logo
      src: string                  // File path or URL
      alt: string                  // Alt text
      width?: number               // Optional: Default width
      height?: number              // Optional: Default height
    }
    secondary?: {                  // Optional: Secondary/mark logo
      src: string
      alt: string
      width?: number
      height?: number
    }
    icon?: {                       // Optional: Icon variant
      src: string
      alt: string
      width?: number
      height?: number
    }
  }
  
  favicon: {
    ico?: string                   // /favicon.ico
    svg?: string                   // /favicon.svg
    png?: {                        // Various PNG sizes
      '16x16'?: string
      '32x32'?: string
      '180x180'?: string           // Apple touch icon
      '192x192'?: string           // Android chrome
      '512x512'?: string           // Android chrome
    }
    manifest?: string              // /site.webmanifest
  }
  
  typography: {
    fontFamily: {
      sans: string                 // Default: var(--font-geist-sans)
      mono?: string                // Default: var(--font-geist-mono)
      heading?: string             // Optional: Heading font
    }
    fontSizes?: {                  // Optional: Custom font sizes
      xs?: string
      sm?: string
      base?: string
      lg?: string
      xl?: string
      '2xl'?: string
      '3xl'?: string
      '4xl'?: string
      '5xl'?: string
    }
  }
  
  metadata: {
    title: string                  // Page title
    description: string            // Meta description
    keywords?: string[]            // SEO keywords
    author?: string                // Author name
    ogImage?: string               // Open Graph image
    twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player'
  }
  
  theme?: {                        // Optional: Theme controls
    enableGlassmorphism?: boolean  // Default: true
    enableAnimations?: boolean     // Default: true
    enableHighContrast?: boolean   // Default: false
    borderRadius?: number          // Default: 10 (px)
  }
  
  customCss?: string               // Optional: Additional CSS
}
```

## Components & Hooks

### BrandProvider

Wrap your app with the BrandProvider to enable brand configuration context:

```typescript
import { BrandProvider } from '@/components/providers/brand-provider'

function App({ children }: { children: React.ReactNode }) {
  return (
    <BrandProvider>
      {children}
    </BrandProvider>
  )
}

// Or with custom configuration
function App({ children }: { children: React.ReactNode }) {
  const customConfig = {
    company: { name: 'Custom Company' },
    colors: { primary: '#3B82F6' }
  }
  
  return (
    <BrandProvider config={customConfig}>
      {children}
    </BrandProvider>
  )
}
```

### React Hooks

#### useBrand()
Access the complete brand context:

```typescript
import { useBrand } from '@/components/providers/brand-provider'

function Component() {
  const { config, updateColors, getLogoProps } = useBrand()
  
  // Update colors dynamically
  const handleColorChange = () => {
    updateColors({ primary: '#10B981' })
  }
  
  // Get logo props
  const logoProps = getLogoProps('primary')
  
  return <div>...</div>
}
```

#### useBrandConfig()
Access the complete configuration:

```typescript
import { useBrandConfig } from '@/components/providers/brand-provider'

function Component() {
  const config = useBrandConfig()
  
  return (
    <div>
      <h1>{config.company.name}</h1>
      <p>{config.company.description}</p>
    </div>
  )
}
```

#### useBrandColors()
Access and update brand colors:

```typescript
import { useBrandColors } from '@/components/providers/brand-provider'

function ThemeCustomizer() {
  const { colors, updateColors } = useBrandColors()
  
  const handlePrimaryChange = (newColor: string) => {
    updateColors({ primary: newColor })
  }
  
  return (
    <div>
      <input 
        type="color" 
        value={colors.primary} 
        onChange={(e) => handlePrimaryChange(e.target.value)}
      />
    </div>
  )
}
```

#### useBrandLogos()
Access logo properties:

```typescript
import { useBrandLogos } from '@/components/providers/brand-provider'

function Component() {
  const { getLogoProps } = useBrandLogos()
  
  const primaryLogo = getLogoProps('primary')
  const iconLogo = getLogoProps('icon')
  
  return (
    <div>
      <img {...primaryLogo} />
      <img {...iconLogo} />
    </div>
  )
}
```

#### useBrandCompany()
Access company information:

```typescript
import { useBrandCompany } from '@/components/providers/brand-provider'

function Footer() {
  const company = useBrandCompany()
  
  return (
    <footer>
      <p>&copy; 2024 {company.name}</p>
      <p>{company.tagline}</p>
      <div>
        {company.social?.twitter && (
          <a href={company.social.twitter}>Twitter</a>
        )}
        {company.social?.linkedin && (
          <a href={company.social.linkedin}>LinkedIn</a>
        )}
      </div>
    </footer>
  )
}
```

### Logo Components

#### Logo (Base Component)
Flexible logo component with full control:

```typescript
import { Logo } from '@/components/ui/logo'

<Logo 
  type="primary"                  // 'primary' | 'secondary' | 'icon'
  width={200}                     // Override default width
  height={60}                     // Override default height
  className="custom-logo"         // Additional classes
  priority={true}                 // Next.js priority loading
  sizes="(max-width: 768px) 100vw, 200px"  // Responsive sizes
  onClick={() => router.push('/')} // Click handler
/>
```

#### BrandLogo (Primary Logo)
Specialized component for the main brand logo:

```typescript
import { BrandLogo } from '@/components/ui/logo'

// Default usage (h-8 w-auto)
<BrandLogo />

// Custom styling
<BrandLogo className="h-12 w-auto" priority />

// With click handler
<BrandLogo 
  className="cursor-pointer" 
  onClick={() => router.push('/')} 
/>
```

#### BrandIcon (Icon Logo)
Small icon variant for favicons, mobile headers, etc:

```typescript
import { BrandIcon } from '@/components/ui/logo'

// Default usage (h-6 w-6)
<BrandIcon />

// Custom size
<BrandIcon className="h-8 w-8" />

// In buttons
<button>
  <BrandIcon className="h-4 w-4 mr-2" />
  Brand Action
</button>
```

#### BrandMark (Secondary Logo)
Secondary logo or brand mark:

```typescript
import { BrandMark } from '@/components/ui/logo'

// Default usage (h-8 w-8)
<BrandMark />

// Custom styling
<BrandMark className="h-10 w-10 rounded-full bg-white p-2" />
```

## Server-Side Integration

### Metadata Generation

Generate SEO-optimized metadata for your pages:

```typescript
import { getBrandMetadata, generateStructuredData } from '@/lib/brand-server'

// Page metadata
export async function generateMetadata() {
  return getBrandMetadata()
}

// Custom page metadata
export async function generateMetadata() {
  return getBrandMetadata(
    "Custom Page - Brand Name",
    "Custom description for this specific page"
  )
}

// Add structured data for SEO
export default function Layout({ children }: { children: React.ReactNode }) {
  const structuredData = generateStructuredData()
  
  return (
    <html>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

### Server Components

Use brand configuration in server components:

```typescript
import { getBrandConfig, getServerLogoProps } from '@/lib/brand-server'

export default function ServerPage() {
  const config = getBrandConfig()
  const logoProps = getServerLogoProps('primary')
  
  return (
    <div>
      <img {...logoProps} />
      <h1>{config.company.name}</h1>
      <p>{config.company.description}</p>
    </div>
  )
}
```

### API Routes

Access brand configuration in API routes:

```typescript
import { getBrandConfig } from '@/lib/brand-server'
import { NextResponse } from 'next/server'

export async function GET() {
  const config = getBrandConfig()
  
  return NextResponse.json({
    company: config.company.name,
    colors: config.colors
  })
}
```

## Customization Guide

### 1. Basic Customization

Override default configuration by modifying the config loader:

```typescript
// config/brand.ts
export function loadBrandConfig(): BrandConfig {
  const customConfig: Partial<BrandConfig> = {
    company: {
      name: 'Your Company',
      tagline: 'Your Amazing Tagline',
      website: 'https://yourcompany.com',
      email: 'hello@yourcompany.com'
    },
    colors: {
      primary: 'oklch(0.5 0.2 240)',      // Blue
      secondary: 'oklch(0.7 0.1 180)',    // Cyan
      accent: 'oklch(0.6 0.25 300)',      // Purple
      success: 'oklch(0.65 0.15 145)',    // Green
      warning: 'oklch(0.75 0.15 70)',     // Yellow
      error: 'oklch(0.6 0.25 25)',        // Red
      info: 'oklch(0.65 0.15 240)',       // Blue
    },
    logos: {
      primary: {
        src: '/your-logo.svg',
        alt: 'Your Company Logo',
        width: 150,
        height: 50
      }
    }
  }
  
  return validateBrandConfig(mergeBrandConfig(customConfig))
}
```

### 2. Environment-Based Configuration

Load different configurations based on environment:

```typescript
// config/brand.ts
export function loadBrandConfig(): BrandConfig {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isStaging = process.env.NODE_ENV === 'staging'
  
  let customConfig: Partial<BrandConfig> = {
    // Base configuration
    company: {
      name: process.env.NEXT_PUBLIC_COMPANY_NAME || 'SaaS Kit',
      website: process.env.NEXT_PUBLIC_WEBSITE_URL
    }
  }
  
  if (isDevelopment) {
    customConfig = {
      ...customConfig,
      company: {
        ...customConfig.company,
        name: 'SaaS Kit (Dev)'
      }
    }
  } else if (isStaging) {
    customConfig = {
      ...customConfig,
      company: {
        ...customConfig.company,
        name: 'SaaS Kit (Staging)'
      }
    }
  }
  
  return validateBrandConfig(mergeBrandConfig(customConfig))
}
```

### 3. Database-Driven Configuration

Load configuration from external sources:

```typescript
// config/brand.ts
import { createClient } from '@/utils/supabase/server'

export async function loadBrandConfigFromDatabase(): Promise<BrandConfig> {
  const supabase = createClient()
  
  const { data: brandSettings } = await supabase
    .from('brand_settings')
    .select('*')
    .single()
  
  const customConfig: Partial<BrandConfig> = {
    company: {
      name: brandSettings?.company_name || defaultBrandConfig.company.name,
      tagline: brandSettings?.tagline || defaultBrandConfig.company.tagline
    },
    colors: {
      primary: brandSettings?.primary_color || defaultBrandConfig.colors.primary,
      // ... other colors
    }
  }
  
  return validateBrandConfig(mergeBrandConfig(customConfig))
}
```

### 4. Dynamic Color Updates

Update colors at runtime:

```typescript
import { updateBrandColors } from '@/config/brand'

function ThemeEditor() {
  const handleColorUpdate = (colorKey: string, value: string) => {
    updateBrandColors({ [colorKey]: value })
  }
  
  return (
    <div>
      <input 
        type="color"
        onChange={(e) => handleColorUpdate('primary', e.target.value)}
      />
    </div>
  )
}
```

### 5. Custom CSS Integration

Add custom CSS for advanced styling:

```typescript
const customConfig: Partial<BrandConfig> = {
  customCss: `
    .custom-brand-gradient {
      background: linear-gradient(
        135deg, 
        var(--brand-primary), 
        var(--brand-secondary)
      );
    }
    
    .brand-shadow {
      box-shadow: 0 4px 20px var(--brand-primary);
    }
  `,
  theme: {
    enableGlassmorphism: true,
    enableAnimations: true,
    borderRadius: 12
  }
}
```

## Color Format Guide

The system supports multiple color formats with automatic validation:

### OKLCH Format (Recommended)
```typescript
colors: {
  primary: 'oklch(0.65 0.15 240)',     // Lightness Chroma Hue
  secondary: 'oklch(0.8 0.1 180)',     // More perceptually uniform
  accent: 'oklch(0.5 0.25 300)'        // Better for gradients
}
```

### HEX Format
```typescript
colors: {
  primary: '#3B82F6',                  // Standard hex
  secondary: '#10B981',
  accent: '#8B5CF6'
}
```

### RGB Format
```typescript
colors: {
  primary: 'rgb(59, 130, 246)',       // RGB values
  secondary: 'rgb(16, 185, 129)',
  accent: 'rgb(139, 92, 246)'
}
```

## Testing

The system includes comprehensive tests covering all functionality:

### Running Tests

```bash
# Run brand configuration tests
npm test -- --testPathPattern=brand.test.ts

# Run with coverage
npm test -- --testPathPattern=brand.test.ts --coverage
```

### Test Coverage

- ✅ Configuration validation
- ✅ Color format validation
- ✅ Configuration merging
- ✅ CSS generation
- ✅ Metadata generation
- ✅ Logo props generation
- ✅ Error handling

### Example Test

```typescript
import { validateBrandConfig, mergeBrandConfig } from '@/config/brand'

test('should merge custom config with defaults', () => {
  const customConfig = {
    company: { name: 'Custom Company' },
    colors: { primary: '#3B82F6' }
  }

  const merged = mergeBrandConfig(customConfig)
  
  expect(merged.company.name).toBe('Custom Company')
  expect(merged.colors.primary).toBe('#3B82F6')
  expect(merged.colors.secondary).toBe(defaultBrandConfig.colors.secondary)
})
```

## Best Practices

### 1. Logo Asset Management

```typescript
// Recommended logo structure
public/
  logo.svg           # Primary logo (vector)
  logo-mark.svg      # Secondary/mark logo
  icon.svg           # Icon variant
  favicon.ico        # Browser favicon
  favicon.svg        # SVG favicon
  apple-touch-icon.png  # Apple devices
  android-chrome-192x192.png  # Android
  android-chrome-512x512.png  # Android
```

### 2. Color Accessibility

```typescript
// Ensure sufficient contrast ratios
colors: {
  primary: 'oklch(0.45 0.15 240)',    // ~4.5:1 on white
  secondary: 'oklch(0.35 0.1 180)',   // ~7:1 on white
  success: 'oklch(0.4 0.15 145)',     // ~4.5:1 on white
  error: 'oklch(0.5 0.2 25)'          // ~4.5:1 on white
}
```

### 3. Performance Optimization

```typescript
// Use priority loading for above-the-fold logos
<BrandLogo priority className="h-8" />

// Optimize logo sizes
logos: {
  primary: {
    src: '/logo.svg',     // Vector for scalability
    width: 120,           // Reasonable default
    height: 40            // Maintain aspect ratio
  }
}
```

### 4. SEO Optimization

```typescript
// Complete metadata configuration
metadata: {
  title: 'Your SaaS - Tagline',
  description: 'Clear, compelling description under 160 characters',
  keywords: ['saas', 'productivity', 'automation'],
  ogImage: '/og-image.png',           // 1200x630 recommended
  twitterCard: 'summary_large_image'
}
```

### 5. Type Safety

```typescript
// Use TypeScript interfaces
import type { BrandConfig, ColorConfig } from '@/config/brand'

function updateTheme(colors: Partial<ColorConfig>) {
  // TypeScript ensures valid color keys
  updateBrandColors(colors)
}
```

## Migration Guide

### From Manual Configuration

If you're migrating from manual brand configuration:

1. **Identify Current Configuration**
   ```typescript
   // Old way
   const BRAND_COLORS = {
     primary: '#3B82F6',
     secondary: '#10B981'
   }
   
   // New way
   import { useBrandColors } from '@/components/providers/brand-provider'
   const { colors } = useBrandColors()
   ```

2. **Update Components**
   ```typescript
   // Old way
   <img src="/logo.svg" alt="Brand" width={120} height={40} />
   
   // New way
   <BrandLogo />
   ```

3. **Migrate Metadata**
   ```typescript
   // Old way
   export const metadata = {
     title: 'My App',
     description: 'Description'
   }
   
   // New way
   export const metadata = getBrandMetadata()
   ```

### Configuration Migration

Create your brand configuration in steps:

1. **Basic Setup**
   ```typescript
   const basicConfig = {
     company: { name: 'Your Company' },
     colors: { primary: '#your-color' }
   }
   ```

2. **Add Logos**
   ```typescript
   const withLogos = {
     ...basicConfig,
     logos: {
       primary: { src: '/logo.svg', alt: 'Brand' }
     }
   }
   ```

3. **Complete Configuration**
   ```typescript
   const fullConfig = {
     ...withLogos,
     metadata: { /* SEO settings */ },
     favicon: { /* favicon config */ }
   }
   ```

## Integration with Theme System

The branding system integrates seamlessly with the existing theme system:

```typescript
// Theme controls from brand config
theme: {
  enableGlassmorphism: true,    // Controls .conditional-glassmorphism
  enableAnimations: true,       // Controls .conditional-animation
  enableHighContrast: false,    // Controls .theme-high-contrast
  borderRadius: 10              // Updates --radius CSS variable
}
```

### CSS Variables

The system automatically generates CSS variables:

```css
:root {
  /* Brand colors */
  --brand-primary: oklch(0.21 0.006 285.885);
  --brand-secondary: oklch(0.967 0.001 286.375);
  --brand-accent: oklch(0.967 0.001 286.375);
  
  /* Theme controls */
  --glassmorphism-enabled: 1;
  --animations-enabled: 1;
  --high-contrast-enabled: 0;
  --radius: 10px;
}
```

## Troubleshooting

### Common Issues

1. **Logo Not Loading**
   ```typescript
   // Check file exists in public/ directory
   // Verify src path starts with '/'
   logos: {
     primary: { src: '/logo.svg' }  // ✅ Correct
     // not: { src: 'logo.svg' }   // ❌ Missing leading slash
   }
   ```

2. **Invalid Color Format**
   ```typescript
   // Ensure colors match supported formats
   colors: {
     primary: 'oklch(0.5 0.2 240)'  // ✅ Valid OKLCH
     // not: 'blue'                 // ❌ Invalid format
   }
   ```

3. **TypeScript Errors**
   ```typescript
   // Import types correctly
   import type { BrandConfig } from '@/config/brand'
   
   // Use proper type assertions
   const config = brandConfig as BrandConfig
   ```

4. **Build Errors**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   npm run build
   ```

### Validation Errors

The system provides detailed validation errors:

```typescript
try {
  validateBrandConfig(config)
} catch (error) {
  console.error('Validation failed:', error.message)
  // Error includes specific field and reason
}
```

---

## Next Steps

- Review the [Theme System Documentation](./theme-system.md) for advanced theming
- Check out [UI Components Overview](./ui-system-overview.md) for component integration
- Explore [Design System Guide](./design-system-complete.md) for advanced styling

For questions or support, see the main [Documentation Index](./README.md). 