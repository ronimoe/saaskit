import { z } from 'zod';

// Zod schemas for runtime validation
const ColorConfigSchema = z.object({
  primary: z.string().regex(/^oklch\([^)]+\)$|^#[0-9a-fA-F]{6}$|^rgb\([^)]+\)$/, 'Invalid color format'),
  secondary: z.string().regex(/^oklch\([^)]+\)$|^#[0-9a-fA-F]{6}$|^rgb\([^)]+\)$/, 'Invalid color format'),
  accent: z.string().regex(/^oklch\([^)]+\)$|^#[0-9a-fA-F]{6}$|^rgb\([^)]+\)$/, 'Invalid color format'),
  success: z.string().regex(/^oklch\([^)]+\)$|^#[0-9a-fA-F]{6}$|^rgb\([^)]+\)$/, 'Invalid color format'),
  warning: z.string().regex(/^oklch\([^)]+\)$|^#[0-9a-fA-F]{6}$|^rgb\([^)]+\)$/, 'Invalid color format'),
  error: z.string().regex(/^oklch\([^)]+\)$|^#[0-9a-fA-F]{6}$|^rgb\([^)]+\)$/, 'Invalid color format'),
  info: z.string().regex(/^oklch\([^)]+\)$|^#[0-9a-fA-F]{6}$|^rgb\([^)]+\)$/, 'Invalid color format'),
});

const LogoConfigSchema = z.object({
  primary: z.object({
    src: z.string().url().or(z.string().startsWith('/')),
    alt: z.string().min(1),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
  }),
  secondary: z.object({
    src: z.string().url().or(z.string().startsWith('/')),
    alt: z.string().min(1),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
  }).optional(),
  icon: z.object({
    src: z.string().url().or(z.string().startsWith('/')),
    alt: z.string().min(1),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
  }).optional(),
});

const FaviconConfigSchema = z.object({
  ico: z.string().startsWith('/').optional(),
  svg: z.string().startsWith('/').optional(),
  png: z.object({
    '16x16': z.string().startsWith('/').optional(),
    '32x32': z.string().startsWith('/').optional(),
    '180x180': z.string().startsWith('/').optional(), // Apple touch icon
    '192x192': z.string().startsWith('/').optional(), // Android chrome
    '512x512': z.string().startsWith('/').optional(), // Android chrome
  }).optional(),
  manifest: z.string().startsWith('/').optional(),
});

const TypographyConfigSchema = z.object({
  fontFamily: z.object({
    sans: z.string(),
    mono: z.string().optional(),
    heading: z.string().optional(),
  }),
  fontSizes: z.object({
    xs: z.string().optional(),
    sm: z.string().optional(),
    base: z.string().optional(),
    lg: z.string().optional(),
    xl: z.string().optional(),
    '2xl': z.string().optional(),
    '3xl': z.string().optional(),
    '4xl': z.string().optional(),
    '5xl': z.string().optional(),
  }).optional(),
});

const CompanyConfigSchema = z.object({
  name: z.string().min(1),
  tagline: z.string().optional(),
  description: z.string().optional(),
  website: z.string().url().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  social: z.object({
    twitter: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    youtube: z.string().optional(),
  }).optional(),
});

const MetadataConfigSchema = z.object({
  title: z.string(),
  description: z.string(),
  keywords: z.array(z.string()).optional(),
  author: z.string().optional(),
  ogImage: z.string().url().or(z.string().startsWith('/')).optional(),
  twitterCard: z.enum(['summary', 'summary_large_image', 'app', 'player']).optional(),
});

const BrandConfigSchema = z.object({
  company: CompanyConfigSchema,
  colors: ColorConfigSchema,
  logos: LogoConfigSchema,
  favicon: FaviconConfigSchema,
  typography: TypographyConfigSchema,
  metadata: MetadataConfigSchema,
  customCss: z.string().optional(),
  theme: z.object({
    enableGlassmorphism: z.boolean().default(true),
    enableAnimations: z.boolean().default(true),
    enableHighContrast: z.boolean().default(false),
    borderRadius: z.number().min(0).max(20).default(10), // px
  }).optional(),
});

// TypeScript types derived from schemas
export type ColorConfig = z.infer<typeof ColorConfigSchema>;
export type LogoConfig = z.infer<typeof LogoConfigSchema>;
export type FaviconConfig = z.infer<typeof FaviconConfigSchema>;
export type TypographyConfig = z.infer<typeof TypographyConfigSchema>;
export type CompanyConfig = z.infer<typeof CompanyConfigSchema>;
export type MetadataConfig = z.infer<typeof MetadataConfigSchema>;
export type BrandConfig = z.infer<typeof BrandConfigSchema>;

// Default branding configuration
export const defaultBrandConfig: BrandConfig = {
  company: {
    name: 'SaaS Kit',
    tagline: 'Modern SaaS Platform',
    description: 'A modern SaaS platform built with Next.js, shadcn/ui, and Tailwind CSS. Build your next project with beautiful, accessible components.',
    website: 'https://saaskit.dev',
    email: 'hello@saaskit.dev',
    social: {
      twitter: 'https://twitter.com/saaskit',
      github: 'https://github.com/saaskit',
      linkedin: 'https://linkedin.com/company/saaskit',
    },
  },
  colors: {
    primary: 'oklch(0.21 0.006 285.885)',
    secondary: 'oklch(0.967 0.001 286.375)',
    accent: 'oklch(0.967 0.001 286.375)',
    success: 'oklch(0.65 0.15 145)',
    warning: 'oklch(0.75 0.15 70)',
    error: 'oklch(0.577 0.245 27.325)',
    info: 'oklch(0.65 0.15 240)',
  },
  logos: {
    primary: {
      src: '/logo.svg',
      alt: 'SaaS Kit Logo',
      width: 120,
      height: 40,
    },
    secondary: {
      src: '/logo-mark.svg',
      alt: 'SaaS Kit Mark',
      width: 40,
      height: 40,
    },
    icon: {
      src: '/icon.svg',
      alt: 'SaaS Kit Icon',
      width: 32,
      height: 32,
    },
  },
  favicon: {
    ico: '/favicon.ico',
    svg: '/favicon.svg',
    png: {
      '16x16': '/favicon-16x16.png',
      '32x32': '/favicon-32x32.png',
      '180x180': '/apple-touch-icon.png',
      '192x192': '/android-chrome-192x192.png',
      '512x512': '/android-chrome-512x512.png',
    },
    manifest: '/site.webmanifest',
  },
  typography: {
    fontFamily: {
      sans: 'var(--font-geist-sans)',
      mono: 'var(--font-geist-mono)',
      heading: 'var(--font-geist-sans)',
    },
    fontSizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
  },
  metadata: {
    title: 'SaaS Kit - Modern SaaS Platform',
    description: 'A modern SaaS platform built with Next.js, shadcn/ui, and Tailwind CSS. Build your next project with beautiful, accessible components.',
    keywords: ['saas', 'nextjs', 'typescript', 'tailwindcss', 'shadcn', 'supabase'],
    author: 'SaaS Kit Team',
    ogImage: '/og-image.png',
    twitterCard: 'summary_large_image',
  },
  theme: {
    enableGlassmorphism: true,
    enableAnimations: true,
    enableHighContrast: false,
    borderRadius: 10,
  },
};

// Configuration validation function
export function validateBrandConfig(config: unknown): BrandConfig {
  const result = BrandConfigSchema.safeParse(config);
  
  if (!result.success) {
    console.error('Brand configuration validation failed:', result.error);
    throw new Error(`Invalid brand configuration: ${result.error.message}`);
  }
  
  return result.data;
}

// Merge configurations with defaults
export function mergeBrandConfig(customConfig: Partial<BrandConfig>): BrandConfig {
  return {
    company: { ...defaultBrandConfig.company, ...customConfig.company },
    colors: { ...defaultBrandConfig.colors, ...customConfig.colors },
    logos: {
      primary: { ...defaultBrandConfig.logos.primary, ...customConfig.logos?.primary },
      secondary: customConfig.logos?.secondary 
        ? { ...defaultBrandConfig.logos.secondary, ...customConfig.logos.secondary }
        : defaultBrandConfig.logos.secondary,
      icon: customConfig.logos?.icon 
        ? { ...defaultBrandConfig.logos.icon, ...customConfig.logos.icon }
        : defaultBrandConfig.logos.icon,
    },
    favicon: { ...defaultBrandConfig.favicon, ...customConfig.favicon },
    typography: {
      fontFamily: { ...defaultBrandConfig.typography.fontFamily, ...customConfig.typography?.fontFamily },
      fontSizes: { ...defaultBrandConfig.typography.fontSizes, ...customConfig.typography?.fontSizes },
    },
    metadata: { ...defaultBrandConfig.metadata, ...customConfig.metadata },
    customCss: customConfig.customCss || defaultBrandConfig.customCss,
    theme: {
      enableGlassmorphism: customConfig.theme?.enableGlassmorphism ?? defaultBrandConfig.theme?.enableGlassmorphism ?? true,
      enableAnimations: customConfig.theme?.enableAnimations ?? defaultBrandConfig.theme?.enableAnimations ?? true,
      enableHighContrast: customConfig.theme?.enableHighContrast ?? defaultBrandConfig.theme?.enableHighContrast ?? false,
      borderRadius: customConfig.theme?.borderRadius ?? defaultBrandConfig.theme?.borderRadius ?? 10,
    },
  };
}

// CSS generation utilities
export function generateBrandCSS(config: BrandConfig): string {
  const { colors, theme } = config;
  
  return `
    :root {
      /* Brand colors */
      --brand-primary: ${colors.primary};
      --brand-secondary: ${colors.secondary};
      --brand-accent: ${colors.accent};
      --brand-success: ${colors.success};
      --brand-warning: ${colors.warning};
      --brand-error: ${colors.error};
      --brand-info: ${colors.info};
      
      /* Theme settings */
      --glassmorphism-enabled: ${theme?.enableGlassmorphism ? '1' : '0'};
      --animations-enabled: ${theme?.enableAnimations ? '1' : '0'};
      --high-contrast-enabled: ${theme?.enableHighContrast ? '1' : '0'};
      --radius: ${theme?.borderRadius || 10}px;
    }
    
    ${config.customCss || ''}
  `;
}

// Logo component props generator
export function getLogoProps(config: BrandConfig, type: 'primary' | 'secondary' | 'icon' = 'primary') {
  const logo = config.logos[type];
  
  if (!logo) {
    throw new Error(`Logo type "${type}" not configured`);
  }
  
  return {
    src: logo.src,
    alt: logo.alt,
    width: logo.width,
    height: logo.height,
  };
}

// Metadata generator for Next.js
export function generateMetadata(config: BrandConfig): Record<string, unknown> {
  const { metadata, company, favicon } = config;
  
  return {
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords?.join(', '),
    author: metadata.author,
    metadataBase: company.website ? new URL(company.website) : undefined,
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      url: company.website,
      siteName: company.name,
      images: metadata.ogImage ? [{ url: metadata.ogImage }] : [],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: metadata.twitterCard || 'summary_large_image',
      title: metadata.title,
      description: metadata.description,
      images: metadata.ogImage ? [metadata.ogImage] : [],
      creator: company.social?.twitter,
    },
    icons: {
      icon: [
        favicon.ico ? { url: favicon.ico } : null,
        favicon.svg ? { url: favicon.svg, type: 'image/svg+xml' } : null,
        favicon.png?.['16x16'] ? { url: favicon.png['16x16'], sizes: '16x16', type: 'image/png' } : null,
        favicon.png?.['32x32'] ? { url: favicon.png['32x32'], sizes: '32x32', type: 'image/png' } : null,
      ].filter(Boolean),
      apple: favicon.png?.['180x180'] ? [{ url: favicon.png['180x180'], sizes: '180x180', type: 'image/png' }] : [],
    },
    manifest: favicon.manifest,
  };
}

// Environment-based configuration loader
export function loadBrandConfig(): BrandConfig {
  // In a real application, this could load from:
  // - Environment variables
  // - External API
  // - Database
  // - Configuration files
  
  const customConfig: Partial<BrandConfig> = {
    // Override defaults here or load from external source
  };
  
  return validateBrandConfig(mergeBrandConfig(customConfig));
}

// Export the active configuration
export const brandConfig = loadBrandConfig();

// Utility function to update CSS variables dynamically
export function updateBrandColors(colors: Partial<ColorConfig>) {
  if (typeof window !== 'undefined') {
    const root = document.documentElement;
    
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--brand-${key}`, value);
    });
  }
}

// Export schemas for external validation
export {
  BrandConfigSchema,
  ColorConfigSchema,
  LogoConfigSchema,
  FaviconConfigSchema,
  TypographyConfigSchema,
  CompanyConfigSchema,
  MetadataConfigSchema,
}; 