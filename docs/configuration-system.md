# Configuration System Documentation

The SaaS Kit includes a comprehensive configuration system that provides type-safe, environment-aware configuration management across branding, feature flags, theme settings, and environment-specific configurations.

## Table of Contents

- [Overview](#overview)
- [Branding Configuration](#branding-configuration)
- [Feature Flags System](#feature-flags-system)
- [Theme Configuration](#theme-configuration)
- [Environment-Specific Configurations](#environment-specific-configurations)
- [Integration Guide](#integration-guide)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

The configuration system consists of four main components:

1. **Branding Configuration** - Centralized brand assets, colors, and company information
2. **Feature Flags System** - Runtime feature toggling with percentage rollouts and targeting
3. **Theme Configuration** - Tailwind CSS customization and design token management
4. **Environment-Specific Configurations** - Environment-aware validation and configuration loading

All components are built with TypeScript-first design, Zod validation, and Next.js 15 compatibility.

## Branding Configuration

### Overview

The branding system provides centralized management of brand assets, colors, and company information with type-safe configuration and React integration.

### Configuration Structure

```typescript
// config/brand.ts
import { z } from 'zod';

const brandConfigSchema = z.object({
  colors: z.object({
    primary: z.string(),     // OKLCH format: "oklch(65% 0.2 250)"
    secondary: z.string(),
    accent: z.string(),
    // ... more colors
  }),
  logos: z.object({
    primary: z.string(),     // Path to primary logo
    secondary: z.string().optional(),
    icon: z.string(),        // Path to icon/favicon
    favicon: z.string(),
  }),
  company: z.object({
    name: z.string(),
    tagline: z.string().optional(),
    description: z.string(),
    website: z.string().url(),
  }),
  theme: z.object({
    enableGlassmorphism: z.boolean(),
    enableAnimations: z.boolean(),
    enableHighContrast: z.boolean(),
  }),
});
```

### React Integration

#### Using the Brand Provider

```tsx
// app/layout.tsx
import { BrandProvider } from '@/components/providers/brand-provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <BrandProvider>
          {children}
        </BrandProvider>
      </body>
    </html>
  );
}
```

#### Brand Hooks

```tsx
import { 
  useBrand, 
  useBrandColors, 
  useBrandLogos, 
  useBrandCompany 
} from '@/components/providers/brand-provider';

function MyComponent() {
  const brand = useBrand();
  const colors = useBrandColors();
  const logos = useBrandLogos();
  const company = useBrandCompany();

  return (
    <div style={{ color: colors.primary }}>
      <img src={logos.primary} alt={`${company.name} logo`} />
      <h1>{company.name}</h1>
    </div>
  );
}
```

#### Logo Components

```tsx
import { Logo, BrandLogo, BrandIcon } from '@/components/ui/logo';

// Generic logo component
<Logo 
  type="primary" 
  size="lg" 
  className="custom-class" 
/>

// Specific logo components
<BrandLogo size="md" />
<BrandIcon size="sm" />
```

### Server-Side Usage

```typescript
// lib/brand-server.ts
import { getBrandConfig, generateBrandMetadata } from '@/lib/brand-server';

// In app/layout.tsx or page.tsx
export async function generateMetadata() {
  return generateBrandMetadata();
}

// In server components
const brandConfig = getBrandConfig();
```

### Customization

#### Environment-Based Configuration

```typescript
// config/brand.ts
export function loadBrandConfig(): BrandConfig {
  const env = process.env.NODE_ENV;
  
  if (env === 'development') {
    return {
      ...defaultBrandConfig,
      company: {
        ...defaultBrandConfig.company,
        name: 'SaaS Kit (Dev)',
      },
    };
  }
  
  return defaultBrandConfig;
}
```

#### Dynamic Configuration

```typescript
// For database-driven branding
export async function loadBrandConfigFromDB(): Promise<BrandConfig> {
  const dbConfig = await fetchBrandConfigFromDB();
  return brandConfigSchema.parse({
    ...defaultBrandConfig,
    ...dbConfig,
  });
}
```

## Feature Flags System

### Overview

The feature flags system provides runtime feature toggling with support for percentage rollouts, role-based access, user targeting, and environment-specific overrides.

### Configuration Structure

```typescript
// config/features.ts
export const featureFlags: FeatureFlagsConfig = {
  // UI/UX Features
  glassmorphism: {
    id: 'glassmorphism',
    name: 'Glassmorphism Effects',
    description: 'Enable glassmorphism UI effects',
    enabled: true,
    tags: ['ui', 'design'],
    rules: [
      {
        type: 'percentage',
        percentage: 80,
        description: 'Gradual rollout to 80% of users'
      }
    ]
  },

  // Functional Features
  advancedAnalytics: {
    id: 'advancedAnalytics',
    name: 'Advanced Analytics',
    description: 'Enhanced analytics dashboard with AI insights',
    enabled: false,
    tags: ['analytics', 'ai'],
    rules: [
      {
        type: 'role',
        roles: ['admin', 'analyst'],
        description: 'Available to admin and analyst roles'
      }
    ]
  },

  // Experimental Features
  aiAssistant: {
    id: 'aiAssistant',
    name: 'AI Assistant',
    description: 'AI-powered assistant for user guidance',
    enabled: false,
    tags: ['experimental', 'ai'],
    rules: [
      {
        type: 'percentage',
        percentage: 10,
        description: 'Limited beta testing'
      },
      {
        type: 'role',
        roles: ['beta_tester'],
        description: 'Beta testers only'
      }
    ]
  }
};
```

### React Integration

#### Using the Feature Flag Provider

```tsx
// app/layout.tsx
import { FeatureFlagProvider } from '@/components/providers/feature-flag-provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <FeatureFlagProvider>
      {children}
    </FeatureFlagProvider>
  );
}
```

#### Feature Flag Hooks

```tsx
import { 
  useFeatureFlag, 
  useFeatureEnabled, 
  useFeatureFlags,
  useUIFeatures 
} from '@/hooks/useFeatureFlag';

function MyComponent() {
  // Check if feature is enabled
  const isAnalyticsEnabled = useFeatureEnabled('advancedAnalytics');
  
  // Get feature flag details
  const glassmorphismFlag = useFeatureFlag('glassmorphism');
  
  // Get multiple flags
  const uiFeatures = useUIFeatures();
  
  // Get flags by tag
  const experimentalFlags = useFeatureFlags(['experimental']);

  return (
    <div>
      {isAnalyticsEnabled && <AdvancedAnalytics />}
      
      {uiFeatures.glassmorphism && (
        <div className="glass-effect">Glassmorphism UI</div>
      )}
    </div>
  );
}
```

#### Declarative Components

```tsx
import { FeatureToggle } from '@/components/providers/feature-flag-provider';

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      <FeatureToggle feature="advancedAnalytics">
        <AdvancedAnalyticsPanel />
      </FeatureToggle>
      
      <FeatureToggle 
        feature="aiAssistant" 
        fallback={<BasicHelpButton />}
      >
        <AIAssistantButton />
      </FeatureToggle>
    </div>
  );
}
```

### Server-Side Usage

```typescript
// In API routes or server components
import { evaluateFeatureFlag, createServerContext } from '@/lib/feature-flags';

export async function GET(request: Request) {
  const context = await createServerContext(request);
  const isEnabled = evaluateFeatureFlag('advancedAnalytics', context);
  
  if (isEnabled) {
    // Return enhanced data
  } else {
    // Return basic data
  }
}
```

### Rule Types

#### Percentage Rollout

```typescript
{
  type: 'percentage',
  percentage: 50,
  description: 'Rollout to 50% of users'
}
```

#### Role-Based Access

```typescript
{
  type: 'role',
  roles: ['admin', 'premium'],
  description: 'Available to admin and premium users'
}
```

#### User Targeting

```typescript
{
  type: 'user',
  userIds: ['user123', 'user456'],
  description: 'Specific user testing'
}
```

#### Environment-Specific

```typescript
{
  type: 'environment',
  environments: ['development', 'staging'],
  description: 'Development and staging only'
}
```

#### Date-Based

```typescript
{
  type: 'date',
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  description: 'Active during 2024'
}
```

### Environment Overrides

```typescript
// config/features.ts
export const environmentOverrides: EnvironmentOverrides = {
  development: {
    // Override flags for development
    aiAssistant: { enabled: true },
    advancedAnalytics: { enabled: true },
  },
  staging: {
    // Override flags for staging
    glassmorphism: { enabled: true },
  },
  production: {
    // Production overrides (usually none)
  },
};
```

## Theme Configuration

### Overview

The theme configuration system extends Tailwind CSS with custom design tokens, brand colors, and SaaS-specific utilities.

### Tailwind Configuration

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';
import { defaultBrandConfig } from './config/brand';
import { SPACING, TYPOGRAPHY, COLORS } from './lib/design-system/design-tokens';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand colors from brand configuration
        brand: {
          primary: 'oklch(var(--brand-primary))',
          secondary: 'oklch(var(--brand-secondary))',
          accent: 'oklch(var(--brand-accent))',
        },
        
        // Semantic colors
        success: 'oklch(var(--color-success))',
        warning: 'oklch(var(--color-warning))',
        error: 'oklch(var(--color-error))',
        
        // Glass effects
        glass: {
          subtle: 'rgba(255, 255, 255, 0.05)',
          light: 'rgba(255, 255, 255, 0.1)',
          medium: 'rgba(255, 255, 255, 0.2)',
          strong: 'rgba(255, 255, 255, 0.3)',
        },
      },
      
      spacing: SPACING,
      typography: TYPOGRAPHY,
      
      // Custom utilities
      backdropBlur: {
        'glass-sm': '4px',
        'glass-md': '8px',
        'glass-lg': '16px',
      },
    },
  },
  plugins: [
    // Custom plugins for SaaS-specific utilities
  ],
};
```

### Custom Utilities

#### Glassmorphism

```css
/* Generated by Tailwind plugin */
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.glass-light {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px);
}
```

#### SaaS Layout

```css
.sidebar-layout {
  display: grid;
  grid-template-columns: var(--sidebar-width) 1fr;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-content);
}
```

### CSS Variable Integration

```css
/* app/globals.css */
:root {
  /* Brand colors from configuration */
  --brand-primary: 65% 0.2 250;
  --brand-secondary: 45% 0.15 280;
  
  /* Spacing from design tokens */
  --spacing-content: 1.5rem;
  --spacing-sidebar: 16rem;
  
  /* Theme features */
  --glassmorphism-enabled: 1;
  --animations-enabled: 1;
}
```

### Dynamic Theming

```typescript
// lib/theme-utils.ts
export function applyBrandTheme(brandConfig: BrandConfig) {
  const root = document.documentElement;
  
  // Apply brand colors
  root.style.setProperty('--brand-primary', brandConfig.colors.primary);
  root.style.setProperty('--brand-secondary', brandConfig.colors.secondary);
  
  // Apply theme features
  root.style.setProperty(
    '--glassmorphism-enabled', 
    brandConfig.theme.enableGlassmorphism ? '1' : '0'
  );
}
```

## Environment-Specific Configurations

### Overview

The environment configuration system provides environment-aware validation, service health monitoring, and configuration management across development, staging, and production environments.

### Configuration Structure

```typescript
// config/environments/index.ts
export type Environment = 'development' | 'staging' | 'production';

export interface EnvironmentConfig {
  displayName: string;
  features: {
    debugMode: boolean;
    hotReload: boolean;
    strictValidation: boolean;
  };
  services: {
    email: {
      provider: 'smtp' | 'sendgrid' | 'resend';
      required: boolean;
    };
    storage: {
      provider: 's3' | 'cloudinary';
      required: boolean;
    };
  };
  validation: {
    requireAllServices: boolean;
    allowMissingSecrets: boolean;
  };
}
```

### Environment-Specific Configurations

#### Development Environment

```typescript
// config/environments/development.ts
export const developmentConfig: DevelopmentConfig = {
  displayName: 'Development',
  features: {
    debugMode: true,
    hotReload: true,
    strictValidation: false,
  },
  services: {
    email: {
      provider: 'smtp',
      required: false, // Optional in development
    },
    storage: {
      provider: 's3',
      required: false,
    },
  },
  validation: {
    requireAllServices: false,
    allowMissingSecrets: true,
  },
};
```

#### Production Environment

```typescript
// config/environments/production.ts
export const productionConfig: ProductionConfig = {
  displayName: 'Production',
  features: {
    debugMode: false,
    hotReload: false,
    strictValidation: true,
  },
  services: {
    email: {
      provider: 'sendgrid',
      required: true, // Required in production
    },
    storage: {
      provider: 's3',
      required: true,
    },
  },
  validation: {
    requireAllServices: true,
    allowMissingSecrets: false,
  },
};
```

### Enhanced Environment System

```typescript
// lib/env-enhanced.ts
import { getCurrentEnvironment, getEnvironmentConfig } from '@/config/environments';

// Enhanced environment with metadata
export interface EnhancedServerEnv extends ServerEnv {
  _environment: Environment;
  _config: EnvironmentConfig;
  _validated: boolean;
  _health: {
    overall: 'healthy' | 'warning' | 'error';
    services: Array<{
      name: string;
      status: 'available' | 'missing' | 'misconfigured';
      message?: string;
    }>;
  };
}

// Get environment-specific configuration
export function getEnhancedServerEnv(): EnhancedServerEnv {
  const environment = getCurrentEnvironment();
  const config = getEnvironmentConfig(environment);
  const validation = validateEnvironment(process.env, environment);
  const health = checkEnvironmentHealth(environment);
  
  return {
    ...serverEnv,
    _environment: environment,
    _config: config,
    _validated: validation.isValid,
    _health: health,
  };
}
```

### Environment Validation

#### Zod Schema Overrides

```typescript
// Different validation rules per environment
const developmentOverrides = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string()
    .refine(url => url.includes('supabase.co') || url.includes('localhost'), {
      message: 'Development: Allow localhost or Supabase'
    }),
});

const productionOverrides = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string()
    .url()
    .refine(url => url.includes('supabase.co') && !url.includes('localhost'), {
      message: 'Production: Must use Supabase hosted instance'
    }),
  NEXTAUTH_SECRET: z.string()
    .min(32, 'Production requires 32+ character secret'),
});
```

#### Service Health Monitoring

```typescript
export function checkEnvironmentHealth(environment?: Environment) {
  const currentEnv = environment || getCurrentEnvironment();
  const config = getEnvironmentConfig(currentEnv);
  
  const services = [
    {
      name: 'Database (Supabase)',
      status: process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY 
        ? 'available' 
        : 'missing',
    },
    {
      name: 'Email Service',
      status: (() => {
        if (config.services.email.provider === 'smtp' && process.env.SMTP_HOST) return 'available';
        if (config.services.email.provider === 'sendgrid' && process.env.SENDGRID_API_KEY) return 'available';
        return 'missing';
      })(),
    },
    // ... more services
  ];
  
  return {
    environment: currentEnv,
    services,
    overall: determineOverallHealth(services, config),
  };
}
```

### Environment Template Files

#### Development Template (.env.development.example)

```bash
# Development Environment Configuration
NODE_ENV=development

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="SaaS Kit (Dev)"

# Supabase (Development Project)
NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_dev_service_role_key

# Email (Local SMTP for testing)
EMAIL_PROVIDER=smtp
SMTP_HOST=localhost
SMTP_PORT=1025

# Development Features
DEBUG=true
NEXT_PUBLIC_ENABLE_DEV_TOOLS=true
```

#### Production Template (.env.production.example)

```bash
# Production Environment Configuration
NODE_ENV=production

# App Configuration (REQUIRED)
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_APP_NAME="Your SaaS Platform"

# Supabase (Production Project - REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-production-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key

# Email (Production Service - REQUIRED)
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.your_production_api_key

# Security (REQUIRED)
NEXTAUTH_SECRET=your_64_character_minimum_production_secret
CORS_ALLOWED_ORIGINS=https://yourdomain.com

# Production Features
DEBUG=false
NEXT_PUBLIC_ENABLE_DEV_TOOLS=false
```

### Development Utilities

```typescript
// Development-only utilities
export const devUtils = {
  reloadEnvironment(): void {
    if (getCurrentEnvironment() !== 'development') {
      console.warn('Environment reload is only available in development');
      return;
    }
    validationCache.clear();
    console.log('🔄 Environment configuration reloaded');
  },

  getEnvironmentStatus(): object {
    const clientEnv = getEnhancedClientEnv();
    const serverEnv = getEnhancedServerEnv();
    
    return {
      environment: clientEnv._environment,
      client: { validated: clientEnv._validated },
      server: { 
        validated: serverEnv._validated,
        health: serverEnv._health 
      },
    };
  },

  generateEnvTemplate(environment: Environment): string {
    return environmentUtils.generateEnvironmentTemplate(environment);
  },
};
```

## Integration Guide

### Full Integration Example

```tsx
// app/layout.tsx
import { BrandProvider } from '@/components/providers/brand-provider';
import { FeatureFlagProvider } from '@/components/providers/feature-flag-provider';
import { generateBrandMetadata } from '@/lib/brand-server';

export async function generateMetadata() {
  return generateBrandMetadata();
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <BrandProvider>
          <FeatureFlagProvider>
            {children}
          </FeatureFlagProvider>
        </BrandProvider>
      </body>
    </html>
  );
}
```

```tsx
// components/dashboard.tsx
import { useBrand, useBrandColors } from '@/components/providers/brand-provider';
import { useFeatureEnabled } from '@/hooks/useFeatureFlag';
import { FeatureToggle } from '@/components/providers/feature-flag-provider';

export function Dashboard() {
  const colors = useBrandColors();
  const hasAdvancedAnalytics = useFeatureEnabled('advancedAnalytics');
  const hasGlassmorphism = useFeatureEnabled('glassmorphism');

  return (
    <div 
      className={`
        dashboard-grid 
        ${hasGlassmorphism ? 'glass' : 'bg-background'}
      `}
      style={{ borderColor: colors.primary }}
    >
      <FeatureToggle feature="advancedAnalytics">
        <AdvancedAnalyticsPanel />
      </FeatureToggle>
      
      <FeatureToggle feature="aiAssistant" fallback={<BasicHelp />}>
        <AIAssistant />
      </FeatureToggle>
    </div>
  );
}
```

### API Route Integration

```typescript
// app/api/analytics/route.ts
import { withEnvironmentValidation } from '@/lib/env-enhanced';
import { evaluateFeatureFlag, createServerContext } from '@/lib/feature-flags';

export async function GET(request: Request) {
  return withEnvironmentValidation(async (env) => {
    const context = await createServerContext(request);
    const hasAdvancedAnalytics = evaluateFeatureFlag('advancedAnalytics', context);
    
    if (!hasAdvancedAnalytics) {
      return Response.json({ error: 'Feature not available' }, { status: 403 });
    }
    
    // Return analytics data
    return Response.json({ data: 'analytics' });
  });
}
```

## Best Practices

### Configuration Management

1. **Use Type-Safe Configuration**
   ```typescript
   // Good: Type-safe with validation
   const config = brandConfigSchema.parse(rawConfig);
   
   // Bad: No validation
   const config = rawConfig as BrandConfig;
   ```

2. **Environment-Specific Defaults**
   ```typescript
   // Good: Environment-aware defaults
   const emailRequired = env._environment === 'production';
   
   // Bad: Hard-coded values
   const emailRequired = true;
   ```

3. **Feature Flag Naming**
   ```typescript
   // Good: Descriptive and categorized
   'advancedAnalytics', 'ui.glassmorphism', 'experimental.aiAssistant'
   
   // Bad: Generic names
   'feature1', 'newThing', 'test'
   ```

### Performance Optimization

1. **Use Caching**
   ```typescript
   // Configuration caching is built-in
   const config = getEnhancedServerEnv(); // Cached for 30s
   ```

2. **Batch Feature Flag Checks**
   ```typescript
   // Good: Batch evaluation
   const flags = useFeatureFlags(['analytics', 'ai', 'glassmorphism']);
   
   // Bad: Individual checks
   const analytics = useFeatureFlag('analytics');
   const ai = useFeatureFlag('ai');
   ```

3. **Environment-Specific Builds**
   ```typescript
   // Use environment overrides for build optimization
   if (process.env.NODE_ENV === 'production') {
     // Disable debug features at build time
   }
   ```

### Security Considerations

1. **Production Validation**
   ```typescript
   // Strict validation in production
   if (env._environment === 'production' && !env._validated) {
     throw new Error('Critical environment validation failed');
   }
   ```

2. **Secret Management**
   ```typescript
   // Use environment-specific secret validation
   NEXTAUTH_SECRET: env === 'production' 
     ? z.string().min(64) 
     : z.string().min(32)
   ```

3. **Feature Flag Security**
   ```typescript
   // Role-based feature access
   {
     type: 'role',
     roles: ['admin'],
     description: 'Admin-only feature'
   }
   ```

## Troubleshooting

### Common Issues

#### Brand Configuration Not Loading

```typescript
// Check brand provider setup
console.log('Brand config:', useBrand()); // Should not be null

// Verify brand validation
try {
  const config = brandConfigSchema.parse(rawConfig);
} catch (error) {
  console.error('Brand validation failed:', error);
}
```

#### Feature Flags Not Working

```typescript
// Check feature flag provider
const flags = useFeatureFlags();
console.log('Available flags:', Object.keys(flags));

// Verify context creation
const context = createServerContext(request);
console.log('Feature flag context:', context);
```

#### Environment Validation Errors

```typescript
// Check environment health
const health = checkEnvironmentHealth();
console.log('Environment health:', health);

// Validate specific environment
const validation = validateEnvironment(process.env, 'production');
console.log('Validation result:', validation);
```

#### Tailwind Integration Issues

```bash
# Rebuild Tailwind CSS
npm run build:css

# Check Tailwind config
npx tailwindcss --init --check
```

### Debug Utilities

```typescript
// Development debugging
if (process.env.NODE_ENV === 'development') {
  // Brand debugging
  console.log('Brand config:', getBrandConfig());
  
  // Feature flag debugging
  console.log('Feature flags:', featureFlags);
  
  // Environment debugging
  console.log('Environment status:', devUtils.getEnvironmentStatus());
}
```

### Migration Guide

#### From Manual Configuration

```typescript
// Before: Manual configuration
const primaryColor = '#3b82f6';
const companyName = 'My Company';

// After: Brand configuration
const { colors, company } = useBrandColors();
const primaryColor = colors.primary;
const companyName = company.name;
```

#### From Environment Variables

```typescript
// Before: Direct environment access
const isFeatureEnabled = process.env.NEXT_PUBLIC_FEATURE_ENABLED === 'true';

// After: Feature flags
const isFeatureEnabled = useFeatureEnabled('myFeature');
```

#### From Hard-coded Themes

```typescript
// Before: Hard-coded classes
<div className="bg-blue-500 backdrop-blur-lg">

// After: Theme configuration
<div className="bg-brand-primary glass">
```

This configuration system provides a robust foundation for managing all aspects of your SaaS application's configuration with type safety, environment awareness, and runtime flexibility. 