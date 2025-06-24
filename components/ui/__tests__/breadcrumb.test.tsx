import React from 'react';
import { render, screen } from '../../../__tests__/test-utils';
import { Breadcrumb, BreadcrumbSeparator, BreadcrumbItem } from '../breadcrumb';

// Mock next/navigation usePathname
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

const { usePathname } = jest.requireMock('next/navigation');

describe('Breadcrumb', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing if only one breadcrumb (root)', () => {
    usePathname.mockReturnValue('/dashboard');
    const { container } = render(<Breadcrumb />);
    expect(container.firstChild).toBeNull();
  });

  it('renders breadcrumbs for a nested route', () => {
    usePathname.mockReturnValue('/dashboard/settings/profile');
    render(<Breadcrumb />);
    // Should show Dashboard, Settings, Profile
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    // Dashboard should be a link, Profile should not
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/dashboard');
    expect(screen.getByText('Profile').closest('a')).toBeNull();
  });

  it('does not show home if showHome is false', () => {
    usePathname.mockReturnValue('/settings/profile');
    render(<Breadcrumb showHome={false} />);
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('renders customItems if provided', () => {
    usePathname.mockReturnValue('/any/path');
    const customItems = [
      { label: 'Home', href: '/' },
      { label: 'Custom', href: '/custom' },
    ];
    render(<Breadcrumb customItems={customItems} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Custom')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
  });

  it('renders with a custom separator', () => {
    usePathname.mockReturnValue('/dashboard/settings');
    render(<Breadcrumb separator={<span data-testid="custom-sep">/</span>} />);
    expect(screen.getAllByTestId('custom-sep').length).toBeGreaterThan(0);
  });

  it('applies className to nav', () => {
    usePathname.mockReturnValue('/dashboard/settings');
    const { container } = render(<Breadcrumb className="test-class" />);
    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('test-class');
  });
});

describe('BreadcrumbSeparator', () => {
  it('renders default separator', () => {
    render(<BreadcrumbSeparator />);
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });
  it('renders custom children', () => {
    render(<BreadcrumbSeparator>•</BreadcrumbSeparator>);
    expect(screen.getByText('•')).toBeInTheDocument();
  });
});

describe('BreadcrumbItem', () => {
  it('renders as a link when href is provided', () => {
    render(<BreadcrumbItem href="/test">Test</BreadcrumbItem>);
    const link = screen.getByRole('link', { name: 'Test' });
    expect(link).toHaveAttribute('href', '/test');
  });
  it('renders as active when isActive is true', () => {
    render(<BreadcrumbItem isActive>Active</BreadcrumbItem>);
    const span = screen.getByText('Active');
    expect(span).toHaveAttribute('aria-current', 'page');
    expect(span.closest('a')).toBeNull();
  });
  it('renders as span when no href and not active', () => {
    render(<BreadcrumbItem>Plain</BreadcrumbItem>);
    const span = screen.getByText('Plain');
    expect(span.tagName).toBe('SPAN');
    expect(span.closest('a')).toBeNull();
  });
}); 