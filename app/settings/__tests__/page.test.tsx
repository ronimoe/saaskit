import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock server-only and async dependencies
jest.mock('@/utils/supabase/server', () => ({ createClient: jest.fn() }));
jest.mock('@/lib/brand-server', () => ({ getBrandConfig: jest.fn() }));
jest.mock('@/lib/user-preferences', () => ({ getUserPreferences: jest.fn() }));
jest.mock('next/navigation', () => ({ redirect: jest.fn() }));
jest.mock('@/components/layout/unified-header', () => ({ UnifiedHeader: () => <div data-testid="unified-header" /> }));
jest.mock('@/components/ui/skeleton', () => ({ Skeleton: (props: { className?: string }) => <div data-testid="skeleton" {...props} /> }));
jest.mock('next/cache', () => ({}));
jest.mock('@/app/actions/user-preferences', () => ({}));
jest.mock('@/components/interactive-user-preferences', () => ({ InteractiveUserPreferences: () => <div data-testid="interactive-user-preferences" /> }));

// Import after mocks
import SettingsPage from '../page';

describe('SettingsPage', () => {
  it('renders the Suspense fallback skeleton initially', () => {
    render(<SettingsPage />);
    // UnifiedHeader in skeleton
    expect(screen.getByTestId('unified-header')).toBeInTheDocument();
    // Skeletons for header and content
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons.length).toBeGreaterThanOrEqual(4); // At least header and content skeletons
    // Main container
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
}); 