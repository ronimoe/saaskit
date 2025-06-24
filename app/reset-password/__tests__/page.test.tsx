import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResetPasswordPage from '../page';

// Mock PasswordResetForm to avoid testing its internals here
jest.mock('@/components/auth/password-reset-form', () => ({
  PasswordResetForm: () => <div data-testid="password-reset-form" />,
}));

describe('ResetPasswordPage', () => {
  it('renders the page with title, description, form, and trust indicators', () => {
    render(<ResetPasswordPage />);

    // Title
    expect(
      screen.getByRole('heading', { name: /reset password/i })
    ).toBeInTheDocument();

    // Description
    expect(
      screen.getByText(/enter your email to receive reset instructions/i)
    ).toBeInTheDocument();

    // PasswordResetForm
    expect(screen.getByTestId('password-reset-form')).toBeInTheDocument();

    // Trust indicators
    expect(
      screen.getByText(/protected by enterprise-grade security/i)
    ).toBeInTheDocument();
    // Animated green dots (select by class)
    const greenDots = document.querySelectorAll('.bg-green-500.rounded-full');
    expect(greenDots.length).toBeGreaterThanOrEqual(3);
  });
}); 