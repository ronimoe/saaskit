'use client';

import React from 'react';
import Image from 'next/image';
import { useBrandLogos } from '@/components/providers/brand-provider';
import { cn } from '@/lib/utils';

interface LogoProps {
  type?: 'primary' | 'secondary' | 'icon';
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  // Server-side props for when client hook isn't available
  serverLogoProps?: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
}

export function Logo({
  type = 'primary',
  className,
  width,
  height,
  priority = false,
  sizes,
  style,
  onClick,
  serverLogoProps,
}: LogoProps) {
  // Always call the hook (React rule)
  const { getLogoProps } = useBrandLogos();
  
  // Use server props if provided, otherwise use client hook result
  const logoProps = serverLogoProps || getLogoProps(type);

  return (
    <Image
      src={logoProps.src}
      alt={logoProps.alt}
      width={width ?? logoProps.width ?? 120}
      height={height ?? logoProps.height ?? 40}
      priority={priority}
      sizes={sizes}
      className={cn('object-contain', className)}
      style={style}
      onClick={onClick}
    />
  );
}

// Specialized logo components for common use cases
export function BrandLogo({ className, ...props }: Omit<LogoProps, 'type'>) {
  return <Logo type="primary" className={cn('h-8 w-auto', className)} {...props} />;
}

export function BrandIcon({ className, ...props }: Omit<LogoProps, 'type'>) {
  return <Logo type="icon" className={cn('h-6 w-6', className)} {...props} />;
}

export function BrandMark({ className, ...props }: Omit<LogoProps, 'type'>) {
  return <Logo type="secondary" className={cn('h-8 w-8', className)} {...props} />;
} 