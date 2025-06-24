import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PlanComparison } from '../plan-comparison';
import { SUBSCRIPTION_PLANS } from '@/lib/stripe-plans';
import type { Subscription } from '@/types/database';

// Mock the fetch function
global.fetch = jest.fn();

// Mock the lucide-react icons
jest.mock('lucide-react', () => ({
  Check: () => <span data-testid="check-icon">✓</span>,
  Star: () => <span data-testid="star-icon">★</span>,
  Zap: () => <span data-testid="zap-icon">⚡</span>,
  Building: () => <span data-testid="building-icon">🏢</span>,
  ArrowUpRight: () => <span data-testid="arrow-up-right-icon">↗️</span>,
  Loader2: () => <span data-testid="loader-icon">🔄</span>,
}));

// Mock the UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, className }: any) => (
    <button 
      onClick={onClick} 
      disabled={disabled}
      data-testid="button"
      data-class-name={className}
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/glass-card', () => ({
  GlassCard: ({ children, variant, interactive, className }: any) => (
    <div 
      data-testid="glass-card"
      data-variant={variant}
      data-interactive={interactive}
      data-class-name={className}
    >
      {children}
    </div>
  ),
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className }: any) => (
    <span 
      data-testid="badge"
      data-class-name={className}
    >
      {children}
    </span>
  ),
}));

// Mock the stripe-plans module
jest.mock('@/lib/stripe-plans', () => ({
  SUBSCRIPTION_PLANS: {
    STARTER: {
      name: 'Starter',
      description: 'For individuals',
      price: 9.99,
      features: ['Feature 1', 'Feature 2'],
    },
    PRO: {
      name: 'Pro',
      description: 'For professionals',
      price: 19.99,
      features: ['Feature 1', 'Feature 2', 'Feature 3'],
    },
    ENTERPRISE: {
      name: 'Enterprise',
      description: 'For large teams',
      price: 49.99,
      features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4'],
    },
  },
  formatPrice: (price: number) => `$${price}`,
}));

// Create a mock subscription that matches the Subscription type
const createMockSubscription = (overrides: Partial<Subscription> = {}): Subscription => ({
  id: '123',
  user_id: 'test-user-id',
  status: 'active',
  plan_name: 'Pro Plan',
  unit_amount: 1999, // $19.99
  currency: 'usd',
  interval: 'month',
  interval_count: 1,
  current_period_start: new Date().toISOString(),
  current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  cancel_at_period_end: false,
  cancel_at: null,
  canceled_at: null,
  created_at: new Date().toISOString(),
  updated_at: null,
  stripe_customer_id: 'cus_123',
  stripe_subscription_id: 'sub_123',
  stripe_price_id: 'price_123',
  profile_id: 'profile_123',
  plan_description: 'Professional plan',
  metadata: null,
  trial_start: null,
  trial_end: null,
  ...overrides,
});

describe('PlanComparison', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
  });

  it('renders all available plans', () => {
    render(<PlanComparison userId="test-user-id" />);
    
    // Check that all plans are rendered
    expect(screen.getByText('Starter')).toBeInTheDocument();
    expect(screen.getByText('Pro')).toBeInTheDocument();
    expect(screen.getByText('Enterprise')).toBeInTheDocument();
    
    // Check that plan descriptions are rendered
    expect(screen.getByText('For individuals')).toBeInTheDocument();
    expect(screen.getByText('For professionals')).toBeInTheDocument();
    expect(screen.getByText('For large teams')).toBeInTheDocument();
    
    // Check that plan prices are rendered
    expect(screen.getByText('$9.99')).toBeInTheDocument();
    expect(screen.getByText('$19.99')).toBeInTheDocument();
    expect(screen.getByText('$49.99')).toBeInTheDocument();
  });

  it('highlights the current plan when provided', () => {
    const currentSubscription = createMockSubscription({
      plan_name: 'Pro Plan',
      unit_amount: 1999, // $19.99
    });
    
    render(<PlanComparison userId="test-user-id" currentSubscription={currentSubscription} />);
    
    // Check that the "Current Plan" badge is displayed
    const currentPlanBadges = screen.getAllByText('Current Plan');
    expect(currentPlanBadges.length).toBe(2); // Badge and button
    
    // Check that the "Most Popular" badge is not displayed for the Pro plan
    // since it's the current plan
    const popularBadges = screen.queryAllByText('Most Popular');
    expect(popularBadges.length).toBe(0);
    
    // Check that the Pro plan button is disabled
    const buttons = screen.getAllByTestId('button');
    const currentPlanButton = buttons.find(button => 
      button.textContent === 'Current Plan'
    );
    expect(currentPlanButton).toBeInTheDocument();
    expect(currentPlanButton).toBeDisabled();
  });

  it('shows "Most Popular" badge for the Pro plan when it is not the current plan', () => {
    const currentSubscription = createMockSubscription({
      plan_name: 'Starter Plan',
      unit_amount: 999, // $9.99
    });
    
    render(<PlanComparison userId="test-user-id" currentSubscription={currentSubscription} />);
    
    // Check that the "Most Popular" badge is displayed for the Pro plan
    const popularBadges = screen.getAllByText('Most Popular');
    expect(popularBadges.length).toBe(1);
  });

  it('calls the Stripe portal API when changing plans', async () => {
    // Mock the fetch response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, url: 'https://stripe.com/portal' }),
    });
    
    // We can't easily mock window.location.href in JSDOM, so we'll just verify the API call
    render(<PlanComparison userId="test-user-id" />);
    
    // Find and click the "Upgrade" button for the Pro plan
    const buttons = screen.getAllByTestId('button');
    const upgradeButtons = buttons.filter(button => 
      button.textContent?.includes('Upgrade')
    );
    
    // Click the second button (Pro plan)
    if (upgradeButtons[1]) {
      fireEvent.click(upgradeButtons[1]);
    } else {
      throw new Error('Pro plan upgrade button not found');
    }
    
    // Check that fetch was called with the correct arguments
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: 'test-user-id' }),
      });
    });
  });

  it('handles API errors when changing plans', async () => {
    // Mock console.error to prevent error output in tests
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock the fetch response with an error
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ success: false, error: 'API error' }),
    });
    
    render(<PlanComparison userId="test-user-id" />);
    
    // Find and click the "Upgrade" button for the Pro plan
    const buttons = screen.getAllByTestId('button');
    const upgradeButtons = buttons.filter(button => 
      button.textContent?.includes('Upgrade')
    );
    
    // Click the second button (Pro plan)
    if (upgradeButtons[1]) {
      fireEvent.click(upgradeButtons[1]);
    } else {
      throw new Error('Pro plan upgrade button not found');
    }
    
    // Check that fetch was called
    expect(global.fetch).toHaveBeenCalled();
    
    // Check that console.error was called with the error
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error changing plan:',
        expect.any(Error)
      );
    });
    
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  it('shows loading state when changing plans', async () => {
    // Mock the fetch to delay the response
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ success: true, url: 'https://stripe.com/portal' }),
      }), 100))
    );
    
    render(<PlanComparison userId="test-user-id" />);
    
    // Find and click the "Upgrade" button for the Pro plan
    const buttons = screen.getAllByTestId('button');
    const upgradeButtons = buttons.filter(button => 
      button.textContent?.includes('Upgrade')
    );
    
    // Click the second button (Pro plan)
    if (upgradeButtons[1]) {
      fireEvent.click(upgradeButtons[1]);
    } else {
      throw new Error('Pro plan upgrade button not found');
    }
    
    // Check that the loading state is shown
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays features for each plan', () => {
    render(<PlanComparison userId="test-user-id" />);
    
    // Count the number of features for each plan
    const checkIcons = screen.getAllByTestId('check-icon');
    
    // STARTER: 2 features, PRO: 3 features, ENTERPRISE: 4 features
    expect(checkIcons.length).toBe(9); 
    
    // Check that all features are rendered
    expect(screen.getAllByText('Feature 1').length).toBe(3);
    expect(screen.getAllByText('Feature 2').length).toBe(3);
    expect(screen.getAllByText('Feature 3').length).toBe(2);
    expect(screen.getAllByText('Feature 4').length).toBe(1);
  });

  it('shows "Change Plan" button text when user has an existing subscription', () => {
    const currentSubscription = createMockSubscription({
      plan_name: 'Starter Plan',
      unit_amount: 999,
    });
    
    render(<PlanComparison userId="test-user-id" currentSubscription={currentSubscription} />);
    
    // Find the buttons for non-current plans
    const buttons = screen.getAllByTestId('button');
    const changePlanButtons = buttons.filter(button => 
      button.textContent?.includes('Change Plan')
    );
    
    // Should be two "Change Plan" buttons (for Pro and Enterprise)
    expect(changePlanButtons.length).toBe(2);
  });
}); 