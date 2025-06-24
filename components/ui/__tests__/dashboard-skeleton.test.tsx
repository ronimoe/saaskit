import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  MetricsCardSkeleton,
  QuickActionCardSkeleton,
  RecentActivitySkeleton,
  TableSkeleton,
  FormSkeleton,
  ProfileSkeleton,
  BillingSkeleton,
  DashboardSkeleton,
} from '../dashboard-skeleton';

describe('Dashboard Skeleton Components', () => {
  it('renders MetricsCardSkeleton', () => {
    render(<MetricsCardSkeleton />);
    expect(screen.getAllByRole('presentation').length).toBeGreaterThan(0);
  });

  it('renders QuickActionCardSkeleton', () => {
    render(<QuickActionCardSkeleton />);
    expect(screen.getAllByRole('presentation').length).toBeGreaterThan(0);
  });

  it('renders RecentActivitySkeleton', () => {
    render(<RecentActivitySkeleton />);
    expect(screen.getAllByRole('presentation').length).toBeGreaterThan(0);
  });

  it('renders TableSkeleton with default rows and columns', () => {
    render(<TableSkeleton />);
    // 5 rows + 1 header = 6
    expect(screen.getAllByRole('presentation').length).toBeGreaterThanOrEqual(6 * 4); // 4 columns
  });

  it('renders TableSkeleton with custom rows and columns', () => {
    render(<TableSkeleton rows={3} columns={2} />);
    // 3 rows + 1 header = 4
    expect(screen.getAllByRole('presentation').length).toBeGreaterThanOrEqual(4 * 2);
  });

  it('renders FormSkeleton', () => {
    render(<FormSkeleton />);
    expect(screen.getAllByRole('presentation').length).toBeGreaterThan(0);
  });

  it('renders ProfileSkeleton', () => {
    render(<ProfileSkeleton />);
    expect(screen.getAllByRole('presentation').length).toBeGreaterThan(0);
  });

  it('renders BillingSkeleton', () => {
    render(<BillingSkeleton />);
    expect(screen.getAllByRole('presentation').length).toBeGreaterThan(0);
  });

  it('renders DashboardSkeleton', () => {
    render(<DashboardSkeleton />);
    expect(screen.getAllByRole('presentation').length).toBeGreaterThan(0);
  });
});

// Helper: Add role="presentation" to Skeleton component for testability if not already present. 