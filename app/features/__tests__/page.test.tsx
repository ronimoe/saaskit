import React from 'react';
import { render, screen } from '@testing-library/react';
import FeaturesPage from '../page';

// Mock heavy/animated child components to avoid animation/test flakiness
jest.mock('@/components/ui/animated-product-mockup', () => ({
  AnimatedProductMockup: (props: any) => <div data-testid="animated-product-mockup" {...props} />,
}));
jest.mock('@/components/ui/particle-background', () => ({
  ParticleBackground: (props: any) => <div data-testid="particle-background" {...props} />,
}));
jest.mock('@/components/ui/feature-connections', () => ({
  FeatureConnections: (props: any) => <div data-testid="feature-connections" {...props} />,
}));
jest.mock('@/components/ui/unfoldable-feature-card', () => ({
  UnfoldableFeatureCard: (props: any) => <div data-testid="unfoldable-feature-card" {...props}>{props.title || 'Feature Card'}</div>,
}));
jest.mock('@/components/ui/glass-card', () => ({
  GlassCard: (props: any) => <div data-testid="glass-card" {...props}>{props.children}</div>,
}));
jest.mock('@/components/layout/unified-header', () => ({
  UnifiedHeader: (props: any) => <header data-testid="unified-header" {...props} />,
}));

// Silence console.error for expected Next.js warnings in test output
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterAll(() => {
  (console.error as jest.Mock).mockRestore();
});

describe('FeaturesPage', () => {
  it('renders the main hero section with badge and headings', () => {
    render(<FeaturesPage />);
    expect(screen.getByTestId('unified-header')).toBeInTheDocument();
    expect(screen.getByTestId('particle-background')).toBeInTheDocument();
    expect(screen.getByText(/Interactive Feature Experience/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Everything You Need/i })).toBeInTheDocument();
    expect(screen.getByText(/And More/i)).toBeInTheDocument();
    expect(screen.getByTestId('animated-product-mockup')).toBeInTheDocument();
  });

  it('renders at least one feature card with its title', () => {
    render(<FeaturesPage />);
    // There should be at least one feature card rendered
    expect(screen.getAllByTestId('unfoldable-feature-card').length).toBeGreaterThan(0);
    // Check for a known feature title
    expect(screen.getByText(/Advanced Authentication/i)).toBeInTheDocument();
  });

  it('renders the stats section', () => {
    render(<FeaturesPage />);
    expect(screen.getByText(/Interactive Features/i)).toBeInTheDocument();
    expect(screen.getByText(/Uptime/i)).toBeInTheDocument();
    expect(screen.getByText(/Load Time/i)).toBeInTheDocument();
    expect(screen.getByText(/Support/i)).toBeInTheDocument();
  });

  it('renders the CTA section with correct buttons', () => {
    render(<FeaturesPage />);
    expect(screen.getByTestId('glass-card')).toBeInTheDocument();
    expect(screen.getByText(/Ready to Launch/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Start Building Your SaaS Today/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Get Started Free/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View Pricing/i })).toBeInTheDocument();
  });
}); 