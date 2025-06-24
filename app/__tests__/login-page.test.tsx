const LoginPage = require('../login/page').default;
import { render, screen } from '@testing-library/react';

// Mock UnifiedHeader
jest.mock('@/components/layout/unified-header', () => ({
  UnifiedHeader: ({ variant }: { variant: string }) => (
    <header data-testid="unified-header" data-variant={variant}>Unified Header</header>
  ),
}));
// Mock LoginForm
jest.mock('@/components/auth/login-form', () => ({
  LoginForm: () => <form data-testid="login-form">Login Form</form>,
}));
// Mock Skeleton
jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) => <div data-testid="skeleton" className={className}>Skeleton</div>,
}));

describe('LoginPage', () => {
  it('renders the UnifiedHeader', () => {
    render(<LoginPage />);
    expect(screen.getByTestId('unified-header')).toBeInTheDocument();
    expect(screen.getByTestId('unified-header')).toHaveAttribute('data-variant', 'auth');
  });

  it('renders the login form', () => {
    render(<LoginPage />);
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });

  it('renders welcome heading and description', () => {
    render(<LoginPage />);
    expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign in to continue/i)).toBeInTheDocument();
  });

  it('renders trust indicators', () => {
    render(<LoginPage />);
    expect(screen.getByText(/enterprise-grade security/i)).toBeInTheDocument();
  });
}); 