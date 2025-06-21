import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { NotificationProvider } from '@/components/providers/notification-provider';

// Create a custom render function that includes the NotificationProvider
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <NotificationProvider>
      {children}
    </NotificationProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render }; 