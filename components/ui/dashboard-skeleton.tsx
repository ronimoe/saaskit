import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Dashboard Skeleton Components
 * 
 * Provides loading skeleton states for various dashboard content areas
 * to improve perceived performance during data fetches.
 */

export function MetricsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton role="presentation" className="h-4 w-20" />
        <Skeleton role="presentation" className="h-4 w-4 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton role="presentation" className="h-8 w-16 mb-2" />
        <div className="flex items-center space-x-2">
          <Skeleton role="presentation" className="h-5 w-10 rounded-full" />
          <Skeleton role="presentation" className="h-3 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}

export function QuickActionCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Skeleton role="presentation" className="h-5 w-5 rounded-full" />
          <Skeleton role="presentation" className="h-5 w-24" />
        </div>
        <Skeleton role="presentation" className="h-4 w-48 mt-2" />
      </CardHeader>
      <CardContent>
        <Skeleton role="presentation" className="h-10 w-full rounded-md" />
      </CardContent>
    </Card>
  );
}

export function RecentActivitySkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton role="presentation" className="h-6 w-32 mb-2" />
        <Skeleton role="presentation" className="h-4 w-56" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton role="presentation" className="w-2 h-2 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton role="presentation" className="h-4 w-48" />
                <Skeleton role="presentation" className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton role="presentation" className="h-6 w-32 mb-2" />
        <Skeleton role="presentation" className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Table Header */}
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {[...Array(columns)].map((_, i) => (
              <Skeleton role="presentation" key={i} className="h-4 w-20" />
            ))}
          </div>
          {/* Table Rows */}
          {[...Array(rows)].map((_, rowIndex) => (
            <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {[...Array(columns)].map((_, colIndex) => (
                <Skeleton role="presentation" key={colIndex} className="h-4 w-full" />
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function FormSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton role="presentation" className="h-6 w-40 mb-2" />
        <Skeleton role="presentation" className="h-4 w-72" />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Form Fields */}
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton role="presentation" className="h-4 w-24" />
            <Skeleton role="presentation" className="h-10 w-full rounded-md" />
          </div>
        ))}
        {/* Submit Button */}
        <div className="flex justify-end space-x-2">
          <Skeleton role="presentation" className="h-10 w-20 rounded-md" />
          <Skeleton role="presentation" className="h-10 w-24 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <Skeleton role="presentation" className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton role="presentation" className="h-6 w-32" />
              <Skeleton role="presentation" className="h-4 w-48" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Profile Form */}
      <FormSkeleton />
    </div>
  );
}

export function BillingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <Skeleton role="presentation" className="h-6 w-32 mb-2" />
          <Skeleton role="presentation" className="h-4 w-56" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton role="presentation" className="h-5 w-24" />
              <Skeleton role="presentation" className="h-4 w-32" />
            </div>
            <Skeleton role="presentation" className="h-10 w-28 rounded-md" />
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <TableSkeleton rows={6} columns={5} />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Welcome Section Skeleton */}
      <div className="space-y-2">
        <Skeleton role="presentation" className="h-9 w-80" />
        <Skeleton role="presentation" className="h-5 w-96" />
      </div>

      {/* Metrics Grid Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <MetricsCardSkeleton key={i} />
        ))}
      </div>

      {/* Quick Actions Skeleton */}
      <div className="space-y-4">
        <Skeleton role="presentation" className="h-7 w-32" />
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <QuickActionCardSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Recent Activity Skeleton */}
      <RecentActivitySkeleton />
    </div>
  );
} 