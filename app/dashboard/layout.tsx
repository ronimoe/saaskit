import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-sidebar';
import { UnifiedHeader } from '@/components/layout/unified-header';
import { Breadcrumb } from '@/components/ui/breadcrumb';

interface DashboardLayoutWrapperProps {
  children: React.ReactNode;
}

/**
 * Dashboard Layout Wrapper
 * 
 * Provides the main layout structure for all dashboard pages including:
 * - App variant unified header with user menu and navigation
 * - Responsive sidebar navigation with mobile support
 * - Proper authentication context integration
 * - Consistent spacing and responsive behavior
 */
export default function DashboardLayoutWrapper({
  children,
}: DashboardLayoutWrapperProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* App Header with user menu and navigation */}
      <UnifiedHeader 
        variant="app" 
        showSearch={true}
        showNotifications={true}
        showUserMenu={true}
      />
      
      {/* Main Dashboard Layout with Sidebar */}
      <DashboardLayout showSidebar={true}>
        <main className="flex-1 p-6">
          {/* Breadcrumb Navigation */}
          <div className="mb-6">
            <Breadcrumb />
          </div>
          
          {children}
        </main>
      </DashboardLayout>
    </div>
  );
} 