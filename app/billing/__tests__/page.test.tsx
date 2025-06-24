import React from 'react';
import { render, screen } from '@testing-library/react';
import BillingPage from '../page';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));
const mockRedirect = jest.mocked(jest.requireMock('next/navigation').redirect);

// Mock UI components as before (keep your previous mocks for layout, skeleton, etc.)
jest.mock('@/components/layout/unified-header', () => ({
  UnifiedHeader: ({ variant }: { variant: string }) => (
    <header data-testid="unified-header" data-variant={variant}>
      Unified Header
    </header>
  ),
}));
jest.mock('@/components/layout', () => ({
  DashboardLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dashboard-layout">{children}</div>
  ),
}));
jest.mock('@/components/ui/glass-card', () => ({
  GlassCard: ({ children }: any) => (
    <div data-testid="glass-card">{children}</div>
  ),
}));
jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: () => <div data-testid="skeleton"></div>,
}));

describe('BillingPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRedirect.mockImplementation((url: string) => {
      throw new Error(`NEXT_REDIRECT: ${url}`);
    });
  });

  it('renders the billing page with skeleton while loading', () => {
    render(<BillingPage />);
    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);
  });
}); 