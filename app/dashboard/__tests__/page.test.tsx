import React from 'react';
import { render, screen, act } from '@testing-library/react';
import DashboardPage from '../page';

jest.mock('@/components/ui/dashboard-skeleton', () => ({
  DashboardSkeleton: () => <div data-testid="dashboard-skeleton" />,
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  it('should render the dashboard content after loading', async () => {
    render(<DashboardPage />);

    // Initially, the skeleton should be visible
    expect(screen.getByTestId('dashboard-skeleton')).toBeInTheDocument();

    // Fast-forward timers
    await act(async () => {
      jest.runAllTimers();
    });

    // After loading, the main content should be visible
    expect(
      screen.getByRole('heading', { name: /welcome to your dashboard/i })
    ).toBeInTheDocument();

    // The skeleton should be gone
    expect(screen.queryByTestId('dashboard-skeleton')).not.toBeInTheDocument();
  });
}); 