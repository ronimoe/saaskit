import React from 'react';
import { UnifiedHeader } from './unified-header';
import { cn } from '@/lib/utils';

interface DashboardShellProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'app' | 'auth';
  title?: string;
  description?: string;
  showHeader?: boolean;
}

/**
 * Dashboard Shell Layout Component
 * 
 * Provides a consistent layout structure for dashboard pages with:
 * - Unified header with navigation
 * - Responsive container with consistent spacing
 * - Optional page title and description
 * - Gradient background for visual appeal
 * - Mobile-first responsive design
 */
export function DashboardShell({
  children,
  className,
  variant = 'app',
  title,
  description,
  showHeader = true,
  ...props
}: DashboardShellProps) {
  return (
    <div 
      className={cn(
        "min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900",
        className
      )}
      {...props}
    >
      {showHeader && <UnifiedHeader variant={variant} />}
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {(title || description) && (
          <div className="space-y-2 mb-8">
            {title && (
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            )}
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}

/**
 * Dashboard Content Area
 * 
 * Provides a consistent content wrapper with grid layout and spacing
 */
interface DashboardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardContent({ 
  children, 
  className 
}: DashboardContentProps) {
  return (
    <div className={cn("grid gap-6", className)}>
      {children}
    </div>
  );
}

/**
 * Dashboard Section
 * 
 * Provides a consistent section wrapper for dashboard content blocks
 */
interface DashboardSectionProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

export function DashboardSection({ 
  children, 
  className,
  title,
  description
}: DashboardSectionProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {(title || description) && (
        <div className="space-y-2">
          {title && (
            <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          )}
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
} 