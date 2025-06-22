import { render, screen } from '@testing-library/react';
import CheckoutSuccessPage from '../page';

// Mock the CheckoutSuccess component
jest.mock('../checkout-success', () => {
  return function MockCheckoutSuccess() {
    return <div data-testid="checkout-success">Checkout Success Component</div>;
  };
});

// Mock React Suspense fallback
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  Suspense: ({ children, fallback }: any) => {
    // For testing, we'll render the fallback to test it, then the children
    return (
      <div>
        <div data-testid="suspense-fallback">{fallback}</div>
        {children}
      </div>
    );
  },
}));

describe('CheckoutSuccessPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Page Structure and Layout', () => {
    it('renders the main container with correct styling', () => {
      render(<CheckoutSuccessPage />);

      // The container classes are on the parent wrapper, not the mocked component
      const container = screen.getByTestId('checkout-success').closest('.container');
      expect(container).toHaveClass('container', 'mx-auto', 'px-4', 'py-16', 'max-w-2xl');
    });

    it('wraps content in Suspense with proper fallback', () => {
      render(<CheckoutSuccessPage />);

      expect(screen.getByTestId('suspense-fallback')).toBeInTheDocument();
      expect(screen.getByTestId('checkout-success')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('renders loading spinner and message in fallback', () => {
      render(<CheckoutSuccessPage />);

      const fallback = screen.getByTestId('suspense-fallback');
      expect(fallback).toBeInTheDocument();
      
      // Check for loading elements within fallback
      const textCenter = fallback.querySelector('.text-center');
      expect(textCenter).toBeInTheDocument();
      
      const spinner = fallback.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('rounded-full', 'h-12', 'w-12', 'border-b-2', 'border-purple-600', 'mx-auto', 'mb-4');
      
      expect(screen.getByText('Processing your subscription...')).toBeInTheDocument();
    });

    it('applies correct styling to loading message', () => {
      render(<CheckoutSuccessPage />);

      const loadingMessage = screen.getByText('Processing your subscription...');
      expect(loadingMessage).toHaveClass('text-gray-600');
    });
  });

  describe('Content Rendering', () => {
    it('renders the CheckoutSuccess component', () => {
      render(<CheckoutSuccessPage />);

      expect(screen.getByTestId('checkout-success')).toBeInTheDocument();
      expect(screen.getByText('Checkout Success Component')).toBeInTheDocument();
    });
  });

  describe('Metadata and SEO', () => {
    it('exports proper metadata', () => {
      // Test metadata export (this would be used by Next.js)
      const CheckoutSuccessPageModule = require('../page');
      
      expect(CheckoutSuccessPageModule.metadata).toBeDefined();
      expect(CheckoutSuccessPageModule.metadata.title).toBe('Checkout Success | SaaS Kit');
      expect(CheckoutSuccessPageModule.metadata.description).toBe('Your subscription has been successfully created.');
    });
  });

  describe('Accessibility', () => {
    it('has meaningful loading text for screen readers', () => {
      render(<CheckoutSuccessPage />);

      expect(screen.getByText('Processing your subscription...')).toBeInTheDocument();
    });

    it('uses proper semantic structure', () => {
      render(<CheckoutSuccessPage />);

      // Container should be properly structured
      const container = screen.getByTestId('checkout-success').closest('.container');
      expect(container).toHaveClass('container');
    });
  });

  describe('Visual Design', () => {
    it('applies correct container spacing and sizing', () => {
      render(<CheckoutSuccessPage />);

      const container = screen.getByTestId('checkout-success').closest('.container');
      expect(container).toHaveClass('container', 'mx-auto', 'px-4', 'py-16', 'max-w-2xl');
    });

    it('centers the loading content', () => {
      render(<CheckoutSuccessPage />);

      const fallback = screen.getByTestId('suspense-fallback');
      const textCenter = fallback.querySelector('.text-center');
      expect(textCenter).toBeInTheDocument();
    });

    it('uses brand colors for loading spinner', () => {
      render(<CheckoutSuccessPage />);

      const fallback = screen.getByTestId('suspense-fallback');
      const spinner = fallback.querySelector('.border-purple-600');
      expect(spinner).toBeInTheDocument();
    });
  });
}); 