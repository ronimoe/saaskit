# Branding Configuration Quick Start

Get your brand identity configured in 15 minutes with this quick start guide.

## 🚀 1. Basic Brand Setup (5 minutes)

### Update Company Information

Edit `config/brand.ts` to customize your company details:

```typescript
// config/brand.ts - Update the loadBrandConfig function
export function loadBrandConfig(): BrandConfig {
  const customConfig: Partial<BrandConfig> = {
    company: {
      name: 'Your Company Name',              // ← Change this
      tagline: 'Your Compelling Tagline',     // ← Change this
      description: 'What your company does',  // ← Change this
      website: 'https://yourcompany.com',     // ← Change this
      email: 'hello@yourcompany.com'          // ← Change this
    }
  }
  
  return validateBrandConfig(mergeBrandConfig(customConfig))
}
```

### Add Your Logos

1. **Add logo files to `public/` directory:**
   ```
   public/
     logo.svg           ← Your primary logo
     logo-mark.svg      ← Your icon/mark (optional)
     icon.svg           ← Small icon variant (optional)
   ```

2. **Update logo configuration:**
   ```typescript
   const customConfig: Partial<BrandConfig> = {
     // ... company config above
     logos: {
       primary: {
         src: '/logo.svg',                    // ← Your logo file
         alt: 'Your Company Logo',           // ← Alt text
         width: 150,                         // ← Default width
         height: 50                          // ← Default height
       }
     }
   }
   ```

## 🎨 2. Brand Colors (5 minutes)

### Set Your Primary Colors

```typescript
const customConfig: Partial<BrandConfig> = {
  // ... previous config
  colors: {
    primary: '#3B82F6',      // ← Your primary brand color (hex)
    secondary: '#10B981',    // ← Secondary color
    accent: '#8B5CF6',       // ← Accent color
    // success, warning, error, info will use defaults
  }
}
```

### Alternative: Use OKLCH (Recommended)

```typescript
colors: {
  primary: 'oklch(0.6 0.2 240)',     // Blue
  secondary: 'oklch(0.65 0.15 145)', // Green  
  accent: 'oklch(0.55 0.25 300)'     // Purple
}
```

## 🖼️ 3. Add Favicons (3 minutes)

1. **Generate favicon files** using a tool like [favicon.io](https://favicon.io)

2. **Add files to `public/`:**
   ```
   public/
     favicon.ico
     favicon.svg
     apple-touch-icon.png
     android-chrome-192x192.png
     android-chrome-512x512.png
   ```

3. **Update favicon config:**
   ```typescript
   const customConfig: Partial<BrandConfig> = {
     // ... previous config
     favicon: {
       ico: '/favicon.ico',
       svg: '/favicon.svg',
       png: {
         '180x180': '/apple-touch-icon.png',
         '192x192': '/android-chrome-192x192.png',
         '512x512': '/android-chrome-512x512.png'
       }
     }
   }
   ```

## 🔍 4. SEO Metadata (2 minutes)

```typescript
const customConfig: Partial<BrandConfig> = {
  // ... previous config
  metadata: {
    title: 'Your Company - Tagline',
    description: 'Compelling description under 160 characters',
    keywords: ['your', 'main', 'keywords'],
    ogImage: '/og-image.png'  // 1200x630 image for social sharing
  }
}
```

## ✅ 5. Test Your Configuration

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Check these work:**
   - Logo appears in navigation
   - Page title shows in browser tab
   - Colors are applied throughout the app
   - Favicon shows in browser tab

3. **Run tests:**
   ```bash
   npm test -- --testPathPattern=brand.test.ts
   ```

## 🎯 Common Usage Patterns

### Navigation with Logo
```tsx
import { BrandLogo } from '@/components/ui/logo'

function Navigation() {
  return (
    <nav>
      <BrandLogo className="h-8" priority />
      {/* Other nav items */}
    </nav>
  )
}
```

### Footer with Company Info
```tsx
import { useBrandCompany } from '@/components/providers/brand-provider'

function Footer() {
  const company = useBrandCompany()
  
  return (
    <footer>
      <p>&copy; 2024 {company.name}</p>
      <p>{company.tagline}</p>
    </footer>
  )
}
```

### Branded Button
```tsx
import { useBrandColors } from '@/components/providers/brand-provider'

function BrandedButton() {
  const { colors } = useBrandColors()
  
  return (
    <button 
      style={{ backgroundColor: colors.primary }}
      className="text-white px-4 py-2 rounded"
    >
      Get Started
    </button>
  )
}
```

## 🔧 Advanced Customization

### Environment-Specific Configuration
```typescript
export function loadBrandConfig(): BrandConfig {
  const isDev = process.env.NODE_ENV === 'development'
  
  const customConfig: Partial<BrandConfig> = {
    company: {
      name: isDev ? 'Your Company (Dev)' : 'Your Company',
      // ... rest of config
    }
  }
  
  return validateBrandConfig(mergeBrandConfig(customConfig))
}
```

### Dynamic Color Updates
```tsx
import { useBrandColors } from '@/components/providers/brand-provider'

function ThemeCustomizer() {
  const { colors, updateColors } = useBrandColors()
  
  return (
    <input 
      type="color" 
      value={colors.primary}
      onChange={(e) => updateColors({ primary: e.target.value })}
    />
  )
}
```

## 🐛 Troubleshooting

**Logo not showing?**
- Check file exists in `public/` directory
- Ensure path starts with `/` (e.g., `/logo.svg`)

**Colors not applying?**
- Verify color format (hex: `#3B82F6`, OKLCH: `oklch(0.6 0.2 240)`)
- Check browser dev tools for CSS variables

**Build errors?**
- Run `npm test -- --testPathPattern=brand.test.ts` to check configuration
- Clear Next.js cache: `rm -rf .next && npm run build`

## 📚 Next Steps

- **[Full Documentation](./branding-configuration.md)** - Complete guide with all options
- **[Theme System](./theme-system.md)** - Advanced theming integration
- **[UI Components](./ui-system-overview.md)** - Using brand colors in components

---

**🎉 That's it!** Your brand is now configured and ready to use throughout your application. The system will automatically apply your brand colors, logos, and metadata across all pages. 