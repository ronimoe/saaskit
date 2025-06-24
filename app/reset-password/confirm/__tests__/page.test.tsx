import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PasswordResetConfirmPage from '../page';

// Mock PasswordResetConfirmForm to avoid testing its internals here
jest.mock('@/components/auth/password-reset-confirm-form', () => ({
  PasswordResetConfirmForm: () => <div data-testid="password-reset-confirm-form" />,
}));

describe('PasswordResetConfirmPage', () => {
  it('renders the page with title, description, form, and trust indicators', () => {
    render(<PasswordResetConfirmPage />);

    // Title
    expect(
      screen.getByRole('heading', { name: /set new password/i })
    ).toBeInTheDocument();

    // Description
    expect(
      screen.getByText(/choose a new password for your account/i)
    ).toBeInTheDocument();

    // PasswordResetConfirmForm
    expect(screen.getByTestId('password-reset-confirm-form')).toBeInTheDocument();

    // Trust indicators
    expect(
      screen.getByText(/protected by enterprise-grade security/i)
    ).toBeInTheDocument();
    // Animated green dots (select by class)
    const greenDots = document.querySelectorAll('.bg-green-500.rounded-full');
    expect(greenDots.length).toBeGreaterThanOrEqual(3);
  });
}); 