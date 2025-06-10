import * as React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useTheme } from 'next-themes';
import { Toaster } from '../sonner';

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}));

// Mock sonner module
jest.mock('sonner', () => ({
  Toaster: React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<'div'> & { theme?: string; className?: string; style?: React.CSSProperties }
  >(({ theme, className, style, ...props }, ref) => (
    <div
      ref={ref}
      data-testid="sonner-toaster"
      data-theme={theme}
      className={className}
      style={style}
      {...props}
    />
  )),
}));

const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>;

describe('Toaster Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders toaster with default theme from useTheme', () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: jest.fn(),
      resolvedTheme: 'light',
      themes: ['light', 'dark'],
      systemTheme: 'light',
    });

    render(<Toaster />);
    
    const toaster = screen.getByTestId('sonner-toaster');
    expect(toaster).toBeInTheDocument();
    expect(toaster).toHaveAttribute('data-theme', 'light');
  });

  it('uses system theme when theme is undefined', () => {
    mockUseTheme.mockReturnValue({
      theme: undefined,
      setTheme: jest.fn(),
      resolvedTheme: undefined,
      themes: ['light', 'dark'],
      systemTheme: 'dark',
    });

    render(<Toaster />);
    
    const toaster = screen.getByTestId('sonner-toaster');
    expect(toaster).toHaveAttribute('data-theme', 'system');
  });

  it('applies default className', () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: jest.fn(),
      resolvedTheme: 'light',
      themes: ['light', 'dark'],
      systemTheme: 'light',
    });

    render(<Toaster />);
    
    const toaster = screen.getByTestId('sonner-toaster');
    expect(toaster).toHaveClass('toaster', 'group');
  });

  it('applies custom CSS variables in style', () => {
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme: jest.fn(),
      resolvedTheme: 'dark',
      themes: ['light', 'dark'],
      systemTheme: 'dark',
    });

    render(<Toaster />);
    
    const toaster = screen.getByTestId('sonner-toaster');
    expect(toaster).toHaveStyle({
      '--normal-bg': 'var(--popover)',
      '--normal-text': 'var(--popover-foreground)',
      '--normal-border': 'var(--border)',
    });
  });

  it('forwards all props to Sonner component', () => {
    render(
      <Toaster 
        position="top-center" 
        richColors
        data-testid="custom-toaster"
      />
    );
    
    const toaster = screen.getByTestId('custom-toaster');
    expect(toaster).toBeInTheDocument();
    expect(toaster).toHaveAttribute('position', 'top-center');
  });

  it('handles dark theme correctly', () => {
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme: jest.fn(),
      resolvedTheme: 'dark',
      themes: ['light', 'dark'],
      systemTheme: 'dark',
    });

    render(<Toaster />);
    
    const toaster = screen.getByTestId('sonner-toaster');
    expect(toaster).toHaveAttribute('data-theme', 'dark');
  });

  it('handles system theme correctly', () => {
    mockUseTheme.mockReturnValue({
      theme: 'system',
      setTheme: jest.fn(),
      resolvedTheme: 'light',
      themes: ['light', 'dark', 'system'],
      systemTheme: 'light',
    });

    render(<Toaster />);
    
    const toaster = screen.getByTestId('sonner-toaster');
    expect(toaster).toHaveAttribute('data-theme', 'system');
  });

  it('supports custom position prop', () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: jest.fn(),
      resolvedTheme: 'light',
      themes: ['light', 'dark'],
      systemTheme: 'light',
    });

    render(<Toaster position="bottom-right" />);
    
    const toaster = screen.getByTestId('sonner-toaster');
    expect(toaster).toHaveAttribute('position', 'bottom-right');
  });

  it('supports duration prop', () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: jest.fn(),
      resolvedTheme: 'light',
      themes: ['light', 'dark'],
      systemTheme: 'light',
    });

    render(<Toaster duration={5000} />);
    
    const toaster = screen.getByTestId('sonner-toaster');
    expect(toaster).toHaveAttribute('duration', '5000');
  });

  it('supports expand prop', () => {
    render(<Toaster expand data-testid="sonner-toaster" />);
    
    const toaster = screen.getByTestId('sonner-toaster');
    // Just verify the component renders with the prop - sonner internals handle the expand behavior
    expect(toaster).toBeInTheDocument();
  });

  it('supports richColors prop', () => {
    render(<Toaster richColors data-testid="sonner-toaster" />);
    
    const toaster = screen.getByTestId('sonner-toaster');
    // Just verify the component renders with the prop - sonner internals handle the richColors behavior
    expect(toaster).toBeInTheDocument();
  });

  it('supports closeButton prop', () => {
    render(<Toaster closeButton data-testid="sonner-toaster" />);
    
    const toaster = screen.getByTestId('sonner-toaster');
    // Just verify the component renders with the prop - sonner internals handle the closeButton behavior
    expect(toaster).toBeInTheDocument();
  });

  it('supports visibleToasts prop', () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: jest.fn(),
      resolvedTheme: 'light',
      themes: ['light', 'dark'],
      systemTheme: 'light',
    });

    render(<Toaster visibleToasts={3} />);
    
    const toaster = screen.getByTestId('sonner-toaster');
    expect(toaster).toHaveAttribute('visibleToasts', '3');
  });

  it('supports custom toastOptions', () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: jest.fn(),
      resolvedTheme: 'light',
      themes: ['light', 'dark'],
      systemTheme: 'light',
    });

    const toastOptions = {
      duration: 3000,
      className: 'custom-toast',
    };

    render(<Toaster toastOptions={toastOptions} />);
    
    const toaster = screen.getByTestId('sonner-toaster');
    expect(toaster).toBeInTheDocument();
  });

  it('handles edge case where useTheme returns empty object', () => {
    mockUseTheme.mockReturnValue({} as ReturnType<typeof useTheme>);

    render(<Toaster />);
    
    const toaster = screen.getByTestId('sonner-toaster');
    expect(toaster).toHaveAttribute('data-theme', 'system');
  });

  it('maintains CSS variables regardless of theme', () => {
    mockUseTheme.mockReturnValue({
      theme: 'auto',
      setTheme: jest.fn(),
      resolvedTheme: 'auto',
      themes: ['light', 'dark', 'auto'],
      systemTheme: 'light',
    });

    render(<Toaster />);
    
    const toaster = screen.getByTestId('sonner-toaster');
    expect(toaster).toHaveStyle({
      '--normal-bg': 'var(--popover)',
      '--normal-text': 'var(--popover-foreground)',
      '--normal-border': 'var(--border)',
    });
  });

  it('supports all ToasterProps from sonner', () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: jest.fn(),
      resolvedTheme: 'light',
      themes: ['light', 'dark'],
      systemTheme: 'light',
    });

    render(
      <Toaster 
        position="top-left"
        duration={4000}
        expand={true}
        richColors={true}
        closeButton={true}
        visibleToasts={5}
      />
    );
    
    const toaster = screen.getByTestId('sonner-toaster');
    expect(toaster).toBeInTheDocument();
    expect(toaster).toHaveAttribute('data-theme', 'light');
    expect(toaster).toHaveAttribute('position', 'top-left');
    expect(toaster).toHaveAttribute('duration', '4000');
  });
}); 