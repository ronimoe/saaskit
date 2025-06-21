'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface BreadcrumbProps {
  className?: string;
  separator?: React.ReactNode;
  showHome?: boolean;
  customItems?: BreadcrumbItem[];
}

/**
 * Breadcrumb Navigation Component
 * 
 * Provides contextual navigation showing the current page hierarchy.
 * Automatically generates breadcrumbs from the current route or accepts custom items.
 * 
 * Features:
 * - Automatic route-based breadcrumb generation
 * - Custom breadcrumb items support
 * - Accessible navigation with proper ARIA labels
 * - Responsive design with mobile-friendly layout
 * - Customizable separator and home icon
 */
export function Breadcrumb({ 
  className, 
  separator, 
  showHome = true, 
  customItems 
}: BreadcrumbProps) {
  const pathname = usePathname();
  
  // Generate breadcrumb items from pathname if custom items not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (customItems) return customItems;
    
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];
    
    // Add home/dashboard if showHome is true
    if (showHome) {
      breadcrumbs.push({
        label: 'Dashboard',
        href: '/dashboard',
        icon: Home
      });
    }
    
    // Generate breadcrumbs for each path segment
    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Skip if this is the dashboard segment and we already added it
      if (segment === 'dashboard' && showHome) return;
      
      // Convert segment to readable label
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      breadcrumbs.push({
        label,
        href: currentPath
      });
    });
    
    return breadcrumbs;
  };
  
  const breadcrumbs = generateBreadcrumbs();
  
  // Don't render if no breadcrumbs or only one item
  if (breadcrumbs.length <= 1) return null;
  
  const defaultSeparator = separator || <ChevronRight className="h-4 w-4 text-muted-foreground" />;
  
  return (
    <nav 
      aria-label="Breadcrumb navigation" 
      className={cn("flex items-center space-x-1 text-sm text-muted-foreground overflow-x-auto pb-2", className)}
    >
              <ol className="flex items-center space-x-1 whitespace-nowrap">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const Icon = item.icon;
          
          return (
            <li key={item.href} className="flex items-center space-x-1">
              {index > 0 && (
                <span className="flex items-center" aria-hidden="true">
                  {defaultSeparator}
                </span>
              )}
              
              {isLast ? (
                // Current page - not clickable
                <span 
                  className="flex items-center space-x-1 font-medium text-foreground"
                  aria-current="page"
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  <span>{item.label}</span>
                </span>
              ) : (
                // Clickable breadcrumb link
                <Link
                  href={item.href}
                  className="flex items-center space-x-1 hover:text-foreground transition-colors min-h-[44px] py-2 px-1 -mx-1 rounded-md hover:bg-accent/50"
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  <span>{item.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Breadcrumb Separator Component
 * 
 * Custom separator for breadcrumb navigation
 */
export function BreadcrumbSeparator({ 
  children, 
  className 
}: { 
  children?: React.ReactNode; 
  className?: string; 
}) {
  return (
    <span className={cn("text-muted-foreground", className)} aria-hidden="true">
      {children || <ChevronRight className="h-4 w-4" />}
    </span>
  );
}

/**
 * Breadcrumb Item Component
 * 
 * Individual breadcrumb item for custom breadcrumb compositions
 */
interface BreadcrumbItemComponentProps {
  href?: string;
  isActive?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function BreadcrumbItem({ 
  href, 
  isActive = false, 
  children, 
  className 
}: BreadcrumbItemComponentProps) {
  const baseClasses = "flex items-center space-x-1 transition-colors";
  
  if (isActive) {
    return (
      <span 
        className={cn(baseClasses, "font-medium text-foreground", className)}
        aria-current="page"
      >
        {children}
      </span>
    );
  }
  
  if (href) {
    return (
      <Link
        href={href}
        className={cn(baseClasses, "text-muted-foreground hover:text-foreground", className)}
      >
        {children}
      </Link>
    );
  }
  
  return (
    <span className={cn(baseClasses, "text-muted-foreground", className)}>
      {children}
    </span>
  );
} 