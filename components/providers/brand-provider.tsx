'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { BrandConfig, brandConfig, generateBrandCSS, updateBrandColors } from '@/config/brand';

interface BrandContextType {
  config: BrandConfig;
  updateColors: (colors: Partial<BrandConfig['colors']>) => void;
  getLogoProps: (type?: 'primary' | 'secondary' | 'icon') => {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

interface BrandProviderProps {
  children: React.ReactNode;
  config?: BrandConfig;
}

export function BrandProvider({ children, config = brandConfig }: BrandProviderProps) {
  useEffect(() => {
    // Inject brand CSS into the document
    const styleId = 'brand-css-variables';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    
    styleElement.textContent = generateBrandCSS(config);
    
    // Apply theme feature toggles
    const { theme } = config;
    document.body.classList.toggle('theme-no-glassmorphism', !theme?.enableGlassmorphism);
    document.body.classList.toggle('theme-no-animations', !theme?.enableAnimations);
    document.body.classList.toggle('theme-high-contrast', theme?.enableHighContrast);
    
    // Clean up function
    return () => {
      const element = document.getElementById(styleId);
      if (element) {
        element.remove();
      }
    };
  }, [config]);

  const handleUpdateColors = (colors: Partial<BrandConfig['colors']>) => {
    updateBrandColors(colors);
  };

  const getLogoProps = (type: 'primary' | 'secondary' | 'icon' = 'primary') => {
    const logo = config.logos[type];
    
    if (!logo) {
      // Fallback to primary logo if requested type doesn't exist
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
  };

  const contextValue: BrandContextType = {
    config,
    updateColors: handleUpdateColors,
    getLogoProps,
  };

  return (
    <BrandContext.Provider value={contextValue}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const context = useContext(BrandContext);
  
  if (context === undefined) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  
  return context;
}

// Hook for accessing specific parts of the brand config
export function useBrandConfig() {
  const { config } = useBrand();
  return config;
}

export function useBrandColors() {
  const { config, updateColors } = useBrand();
  return {
    colors: config.colors,
    updateColors,
  };
}

export function useBrandLogos() {
  const { getLogoProps } = useBrand();
  return { getLogoProps };
}

export function useBrandCompany() {
  const { config } = useBrand();
  return config.company;
} 