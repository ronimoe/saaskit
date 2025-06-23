import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/components/theme-provider';

// Mock next-themes
jest.mock('next-themes', () => ({
  ThemeProvider: ({ children, ...props }: { children: React.ReactNode, [key: string]: any }) => (
    <div data-testid="next-themes-provider" {...props}>
      {children}
    </div>
  ),
}));

describe('ThemeProvider', () => {
  it('should render children correctly', () => {
    render(
      <ThemeProvider>
        <div>Child Component</div>
      </ThemeProvider>
    );
    expect(screen.getByText('Child Component')).toBeInTheDocument();
  });

  it('should pass props to NextThemesProvider', () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="dark">
        <div>Child</div>
      </ThemeProvider>
    );

    const provider = screen.getByTestId('next-themes-provider');
    expect(provider).toHaveAttribute('attribute', 'class');
    expect(provider).toHaveAttribute('defaultTheme', 'dark');
  });
}); 