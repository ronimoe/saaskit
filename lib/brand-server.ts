import { brandConfig, BrandConfig, generateMetadata } from '@/config/brand';

// Server-side brand configuration access
export function getBrandConfig(): BrandConfig {
  return brandConfig;
}

// Generate structured data for SEO
export function generateStructuredData(config: BrandConfig = brandConfig) {
  const { company, metadata } = config;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: company.name,
    description: company.description || metadata.description,
    url: company.website,
    email: company.email,
    logo: company.website && config.logos.primary.src 
      ? new URL(config.logos.primary.src, company.website).toString()
      : undefined,
    sameAs: Object.values(company.social || {}).filter(Boolean),
    address: company.address ? {
      '@type': 'PostalAddress',
      streetAddress: company.address.street,
      addressLocality: company.address.city,
      addressRegion: company.address.state,
      postalCode: company.address.zip,
      addressCountry: company.address.country,
    } : undefined,
  };
}

// Generate Next.js metadata for server components
export function getBrandMetadata(customTitle?: string, customDescription?: string) {
  const config = getBrandConfig();
  const baseMetadata = generateMetadata(config);
  
  if (customTitle || customDescription) {
    return {
      ...baseMetadata,
      title: customTitle || baseMetadata.title,
      description: customDescription || baseMetadata.description,
    };
  }
  
  return baseMetadata;
}

// Get brand colors for server-side CSS generation
export function getBrandColors() {
  return getBrandConfig().colors;
}

// Get logo props for server-side rendering
export function getServerLogoProps(type: 'primary' | 'secondary' | 'icon' = 'primary') {
  const config = getBrandConfig();
  const logo = config.logos[type];
  
  if (!logo) {
    const fallback = config.logos.primary;
    return {
      src: fallback.src,
      alt: fallback.alt,
      width: fallback.width,
      height: fallback.height,
    };
  }
  
  return {
    src: logo.src,
    alt: logo.alt,
    width: logo.width,
    height: logo.height,
  };
}

// Validate brand configuration at build time
export function validateBrandConfigAtBuildTime() {
  try {
    const config = getBrandConfig();
    
    // Check required logo files exist (this would need to be implemented based on your file system)
    const requiredAssets = [
      config.logos.primary.src,
      config.logos.secondary?.src,
      config.logos.icon?.src,
      config.favicon.ico,
      config.favicon.svg,
    ].filter(Boolean);
    
    console.log('Brand configuration loaded successfully');
    console.log('Required assets:', requiredAssets);
    
    return true;
  } catch (error) {
    console.error('Brand configuration validation failed:', error);
    return false;
  }
}

// Export for use in next.config.ts and other build-time scripts
export { brandConfig as serverBrandConfig }; 