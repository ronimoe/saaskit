import React from 'react';
import { render, screen } from '@testing-library/react';
import DashboardLayoutWrapper from '../layout';

jest.mock('@/components/layout/unified-header', () => ({
  UnifiedHeader: (props: any) => (
    <div data-testid="unified-header">
      Mocked UnifiedHeader variant={props.variant}
    </div>
  ),
}));

jest.mock('@/components/layout/dashboard-sidebar', () => ({
  DashboardLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dashboard-layout">{children}</div>
  ),
}));

jest.mock('@/components/ui/breadcrumb', () => ({
  Breadcrumb: () => <div data-testid="breadcrumb" />,
}));

describe('DashboardLayoutWrapper', () => {
  it('should render the header, sidebar, breadcrumb and children', () => {
    render(
      <DashboardLayoutWrapper>
        <div>Test Child</div>
      </DashboardLayoutWrapper>
    );

    expect(screen.getByTestId('unified-header')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
    expect(screen.getByTestId('breadcrumb')).toBeInTheDocument();
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });
}); 