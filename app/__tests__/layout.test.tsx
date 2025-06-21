import { render, screen } from '@testing-library/react';
import RootLayout, { metadata } from '../layout';
import { brandConfig } from '@/config/brand';

// Mock the providers and components
jest.mock('@/components/theme-provider', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme-provider">{children}</div>
  ),
}));

jest.mock('@/components/providers/auth-provider', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
}));

jest.mock('@/components/providers/brand-provider', () => ({
  BrandProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="brand-provider">{children}</div>
  ),
}));

jest.mock('@/components/providers/notification-provider', () => ({
  NotificationProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="notification-provider">{children}</div>
  ),
}));

jest.mock('@/components/ui/sonner', () => ({
  Toaster: () => <div data-testid="toaster" />,
}));

jest.mock('@/config/brand', () => ({
  brandConfig: {
    name: 'Test SaaS Kit',
    description: 'Test description',
    url: 'https://test.example.com',
  },
  generateMetadata: jest.fn(() => ({
    title: 'Test SaaS Kit',
    description: 'Test description',
    metadataBase: new URL('https://test.example.com'),
  })),
}));

// Mock Next.js fonts
jest.mock('next/font/google', () => ({
  Geist: () => ({
    variable: '--font-geist-sans',
  }),
  Geist_Mono: () => ({
    variable: '--font-geist-mono',
  }),
}));

describe('RootLayout', () => {
  const mockChildren = <div data-testid="test-children">Test Content</div>;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders with correct HTML structure', () => {
    render(<RootLayout>{mockChildren}</RootLayout>);

    // Check for html element with correct attributes
    const htmlElement = document.documentElement;
    expect(htmlElement).toHaveAttribute('lang', 'en');
    // suppressHydrationWarning is a React prop, not an HTML attribute
    // It's handled internally by React during hydration
  });

  it('applies correct font variables to body', () => {
    render(<RootLayout>{mockChildren}</RootLayout>);

    const bodyElement = document.body;
    expect(bodyElement).toHaveClass('--font-geist-sans');
    expect(bodyElement).toHaveClass('--font-geist-mono');
    expect(bodyElement).toHaveClass('antialiased');
  });

  it('renders all provider components in correct order', () => {
    render(<RootLayout>{mockChildren}</RootLayout>);

    // Check that all providers are rendered
    expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
    expect(screen.getByTestId('brand-provider')).toBeInTheDocument();
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
    expect(screen.getByTestId('notification-provider')).toBeInTheDocument();

    // Check provider nesting order (innermost to outermost)
    const themeProvider = screen.getByTestId('theme-provider');
    const brandProvider = screen.getByTestId('brand-provider');
    const authProvider = screen.getByTestId('auth-provider');
    const notificationProvider = screen.getByTestId('notification-provider');

    expect(themeProvider).toContainElement(brandProvider);
    expect(brandProvider).toContainElement(authProvider);
    expect(authProvider).toContainElement(notificationProvider);
  });

  it('renders children content', () => {
    render(<RootLayout>{mockChildren}</RootLayout>);

    expect(screen.getByTestId('test-children')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders Toaster component', () => {
    render(<RootLayout>{mockChildren}</RootLayout>);

    expect(screen.getByTestId('toaster')).toBeInTheDocument();
  });

  it('renders with multiple children', () => {
    const multipleChildren = (
      <>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </>
    );

    render(<RootLayout>{multipleChildren}</RootLayout>);

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
  });

  it('handles empty children', () => {
    render(<RootLayout>{null}</RootLayout>);

    // Should still render providers and toaster
    expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
    expect(screen.getByTestId('toaster')).toBeInTheDocument();
  });
});

describe('RootLayout metadata', () => {
  it('exports correct metadata', () => {
    expect(metadata).toBeDefined();
    expect(metadata).toEqual({
      title: 'Test SaaS Kit',
      description: 'Test description',
      metadataBase: new URL('https://test.example.com'),
    });
  });

  it('generates metadata from brand config', () => {
    // The metadata is generated at module level, not during test execution
    // We just verify that the metadata object is properly structured
    expect(metadata).toHaveProperty('title');
    expect(metadata).toHaveProperty('description');
    expect(metadata).toHaveProperty('metadataBase');
  });
}); 