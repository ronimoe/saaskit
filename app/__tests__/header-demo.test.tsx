import { render, screen } from '@testing-library/react';
import HeaderDemoPage from '../header-demo/page';

// Mock unified-header subcomponents
jest.mock('@/components/layout/unified-header', () => ({
  PreAuthHeader: (props: { variant: string; showNavigation?: boolean }) => (
    <div data-testid="pre-auth-header" data-variant={props.variant} data-navigation={props.showNavigation ? 'true' : 'false'}>
      PreAuthHeader
    </div>
  ),
  AuthHeader: (props: { variant: string }) => (
    <div data-testid="auth-header" data-variant={props.variant}>
      AuthHeader
    </div>
  ),
  AppHeader: (props: { variant: string; showSearch?: boolean; showNotifications?: boolean }) => (
    <div
      data-testid="app-header"
      data-variant={props.variant}
      data-search={props.showSearch ? 'true' : 'false'}
      data-notifications={props.showNotifications ? 'true' : 'false'}
    >
      AppHeader
    </div>
  ),
}));

// Mock shadcn/ui components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => <div data-testid="card-title" className={className}>{children}</div>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <div data-testid="card-description">{children}</div>,
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => <div data-testid="card-content" className={className}>{children}</div>,
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => <span data-testid="badge">{children}</span>,
}));

jest.mock('@/components/ui/separator', () => ({
  Separator: () => <div data-testid="separator" />,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: { children: React.ReactNode }) => <button data-testid="button" {...props}>{children}</button>,
}));

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => (
    <a href={href} {...props} data-testid="link">
      {children}
    </a>
  );
});

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  ArrowLeft: () => <span data-testid="arrow-left-icon">←</span>,
}));

describe('HeaderDemoPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the back button with correct link and icon', () => {
    render(<HeaderDemoPage />);
    const backButton = screen.getByTestId('button');
    expect(backButton).toBeInTheDocument();
    expect(screen.getByTestId('link')).toHaveAttribute('href', '/');
    expect(screen.getByTestId('arrow-left-icon')).toBeInTheDocument();
    expect(screen.getByText('Back to Home')).toBeInTheDocument();
  });

  it('renders the main page header and badges', () => {
    render(<HeaderDemoPage />);
    expect(screen.getByText('Unified Header System')).toBeInTheDocument();
    expect(screen.getByText('Adaptive header variations based on authentication state and page context')).toBeInTheDocument();
    expect(screen.getAllByTestId('badge').map((el) => el.textContent)).toEqual([
      'Brand Consistency',
      'Adaptive Design',
      'User Experience',
      'shadcn/ui',
    ]);
  });

  it('renders all header variant cards and their features', () => {
    render(<HeaderDemoPage />);
    // Landing Header
    expect(screen.getByText('Landing/Marketing Header')).toBeInTheDocument();
    expect(screen.getByTestId('pre-auth-header')).toHaveAttribute('data-variant', 'landing');
    expect(screen.getByTestId('pre-auth-header')).toHaveAttribute('data-navigation', 'true');
    expect(screen.getByText(/Logo with brand name/)).toBeInTheDocument();
    // Auth Header
    expect(screen.getByText('Authentication Header')).toBeInTheDocument();
    expect(screen.getByTestId('auth-header')).toHaveAttribute('data-variant', 'auth');
    expect(screen.getByText(/Logo only/)).toBeInTheDocument();
    // App Header
    expect(screen.getByText('Application Header')).toBeInTheDocument();
    expect(screen.getByTestId('app-header')).toHaveAttribute('data-variant', 'app');
    expect(screen.getByTestId('app-header')).toHaveAttribute('data-search', 'true');
    expect(screen.getByTestId('app-header')).toHaveAttribute('data-notifications', 'true');
    expect(screen.getByText(/App navigation/)).toBeInTheDocument();
  });

  it('renders implementation benefits and technical features', () => {
    render(<HeaderDemoPage />);
    expect(screen.getByText('Implementation Benefits')).toBeInTheDocument();
    expect(screen.getByText('Why this unified approach improves your SaaS application')).toBeInTheDocument();
    expect(screen.getByText(/Consistent brand experience/)).toBeInTheDocument();
    expect(screen.getByText(/Automatic authentication detection/)).toBeInTheDocument();
    expect(screen.getByText('Usage Example')).toBeInTheDocument();
    expect(screen.getByText(/<UnifiedHeader variant="landing"/)).toBeInTheDocument();
  });
}); 