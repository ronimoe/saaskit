import React from 'react';
import { render, screen } from '@testing-library/react';
import DashboardSettingsPage from '../page';

describe('DashboardSettingsPage', () => {
  it('should render the settings page with all categories', () => {
    render(<DashboardSettingsPage />);

    // Check for the main heading
    expect(
      screen.getByRole('heading', { name: /settings/i, level: 1 })
    ).toBeInTheDocument();

    // Check for each settings category card by its title text
    expect(screen.getByText(/account settings/i, { selector: '[data-slot="card-title"]' })).toBeInTheDocument();
    expect(screen.getByText(/notifications/i, { selector: '[data-slot="card-title"]' })).toBeInTheDocument();
    expect(screen.getByText(/privacy & security/i, { selector: '[data-slot="card-title"]' })).toBeInTheDocument();
    expect(screen.getByText(/appearance/i, { selector: '[data-slot="card-title"]' })).toBeInTheDocument();

    // Check for the Quick Actions card by its title text
    expect(screen.getByText(/quick actions/i, { selector: '[data-slot="card-title"]' })).toBeInTheDocument();
  });
}); 