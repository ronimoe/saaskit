'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  CreditCard, 
  Settings, 
  BarChart3, 
  PanelLeft,
  X
} from 'lucide-react';

interface NavigationItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  description?: string;
}

const navigationItems: NavigationItem[] = [
  {
    title: 'Profile',
    href: '/profile',
    icon: User,
    description: 'Manage your account and preferences'
  },
  {
    title: 'Billing',
    href: '/billing',
    icon: CreditCard,
    description: 'Subscription and payment details'
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    badge: 'Soon',
    description: 'Usage statistics and insights'
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    badge: 'Soon',
    description: 'Application settings and preferences'
  },
];

interface DashboardSidebarProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

/**
 * Dashboard Sidebar Navigation Component
 * 
 * Provides a sidebar navigation for dashboard pages with:
 * - Active link highlighting
 * - Navigation items with icons and descriptions
 * - Responsive behavior (collapsible on mobile)
 * - Badge support for coming soon features
 * - Scroll area for long navigation lists
 */
export function DashboardSidebar({ 
  className, 
  isOpen = true, 
  onClose 
}: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "bg-background border-r border-border w-64 flex-shrink-0 transition-all duration-300",
        !isOpen && "w-16",
        className
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            {isOpen && (
              <h2 className="text-lg font-semibold">Dashboard</h2>
            )}
            {onClose && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onClose}
                className="lg:hidden"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 p-4">
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
                      isActive && "bg-accent text-accent-foreground",
                      !isOpen && "justify-center px-2"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 flex-shrink-0")} />
                    {isOpen && (
                      <>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.title}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="text-xs">
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
      </div>
    </aside>
  );
}

/**
 * Dashboard Layout with Sidebar
 * 
 * Provides a complete dashboard layout with sidebar navigation
 */
interface DashboardLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  className?: string;
}

export function DashboardLayout({ 
  children, 
  showSidebar = true,
  className 
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={cn("flex h-screen", className)}>
      {showSidebar && (
        <>
          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <DashboardSidebar />
          </div>

          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <>
              <div 
                className="fixed inset-0 z-40 bg-black/50 lg:hidden" 
                onClick={() => setSidebarOpen(false)}
              />
              <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
                <DashboardSidebar 
                  onClose={() => setSidebarOpen(false)}
                />
              </div>
            </>
          )}

          {/* Mobile Sidebar Toggle */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="fixed top-20 left-4 z-30 bg-background border shadow-md"
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
} 