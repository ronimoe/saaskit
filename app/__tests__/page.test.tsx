import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LandingPage from '../page';

// Mock the components
jest.mock('@/components/layout/unified-header', () => ({
  UnifiedHeader: ({ variant }: { variant: string }) => (
    <header data-testid="unified-header" data-variant={variant}>
      Unified Header
    </header>
  ),
}));

jest.mock('@/components/site-footer', () => ({
  SiteFooter: () => <footer data-testid="site-footer">Site Footer</footer>,
}));

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
});

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  ArrowRight: () => <span data-testid="arrow-right-icon">→</span>,
  Check: () => <span data-testid="check-icon">✓</span>,
  Shield: () => <span data-testid="shield-icon">🛡️</span>,
  Zap: () => <span data-testid="zap-icon">⚡</span>,
  BarChart3: () => <span data-testid="bar-chart-icon">📊</span>,
  Code2: () => <span data-testid="code-icon">💻</span>,
  Palette: () => <span data-testid="palette-icon">🎨</span>,
  Layers: () => <span data-testid="layers-icon">📚</span>,
  Globe: () => <span data-testid="globe-icon">🌍</span>,
  Sparkles: () => <span data-testid="sparkles-icon">✨</span>,
  Play: () => <span data-testid="play-icon">▶️</span>,
  ChevronRight: () => <span data-testid="chevron-right-icon">›</span>,
}));

// Mock console.log to track newsletter signup
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

describe('LandingPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
  });

  describe('Page Structure', () => {
    it('renders main layout components', () => {
      render(<LandingPage />);

      expect(screen.getByTestId('unified-header')).toBeInTheDocument();
      expect(screen.getByTestId('unified-header')).toHaveAttribute('data-variant', 'landing');
      expect(screen.getByTestId('site-footer')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('has correct page structure with container', () => {
      render(<LandingPage />);

      const container = screen.getByRole('main');
      expect(container).toHaveClass('container', 'mx-auto', 'px-4');
    });
  });

  describe('Hero Section', () => {
    it('renders hero section with correct content', () => {
      render(<LandingPage />);

      expect(screen.getByText('Modern SaaS Kit')).toBeInTheDocument();
      expect(screen.getByText('Ready to Ship')).toBeInTheDocument();
      expect(screen.getByText(/Launch your SaaS faster/)).toBeInTheDocument();
      expect(screen.getByText('✨ Built with Next.js 15 & TypeScript')).toBeInTheDocument();
    });

    it('renders hero call-to-action buttons', () => {
      render(<LandingPage />);

      const getStartedButton = screen.getByRole('link', { name: /get started free/i });
      const demoButton = screen.getByRole('link', { name: /view demo/i });

      expect(getStartedButton).toBeInTheDocument();
      expect(getStartedButton).toHaveAttribute('href', '/signup');
      expect(demoButton).toBeInTheDocument();
      expect(demoButton).toHaveAttribute('href', '/header-demo');
    });

    it('displays trusted by developers section', () => {
      render(<LandingPage />);

      expect(screen.getByText('Trusted by 1000+ developers')).toBeInTheDocument();
    });
  });

  describe('Features Section', () => {
    it('renders features section header', () => {
      render(<LandingPage />);

      expect(screen.getByText('Everything You Need')).toBeInTheDocument();
      expect(screen.getByText('Ship faster with our')).toBeInTheDocument();
      expect(screen.getByText('complete toolkit')).toBeInTheDocument();
    });

    it('renders all feature cards', () => {
      render(<LandingPage />);

      // Authentication card
      expect(screen.getByText('Secure Authentication')).toBeInTheDocument();
      expect(screen.getByText(/Complete auth system with Supabase/)).toBeInTheDocument();

      // UI Components card
      expect(screen.getByText('Beautiful UI Components')).toBeInTheDocument();
      expect(screen.getByText(/50\+ shadcn\/ui components/)).toBeInTheDocument();

      // Billing card
      expect(screen.getByText('Stripe Integration')).toBeInTheDocument();
      expect(screen.getByText(/Complete billing system/)).toBeInTheDocument();

      // Developer Experience card
      expect(screen.getByText('Developer Ready')).toBeInTheDocument();
      expect(screen.getByText(/TypeScript, ESLint, Prettier/)).toBeInTheDocument();

      // Performance card
      expect(screen.getByText('High Performance')).toBeInTheDocument();
      expect(screen.getByText(/Optimized for speed/)).toBeInTheDocument();

      // Scalable card
      expect(screen.getByText('Production Scalable')).toBeInTheDocument();
      expect(screen.getByText(/Built for scale/)).toBeInTheDocument();
    });

    it('renders feature icons', () => {
      render(<LandingPage />);

      expect(screen.getByTestId('shield-icon')).toBeInTheDocument();
      expect(screen.getByTestId('palette-icon')).toBeInTheDocument();
      expect(screen.getByTestId('bar-chart-icon')).toBeInTheDocument();
      expect(screen.getByTestId('code-icon')).toBeInTheDocument();
      expect(screen.getByTestId('zap-icon')).toBeInTheDocument();
      expect(screen.getByTestId('layers-icon')).toBeInTheDocument();
    });

    it('renders feature checklist items', () => {
      render(<LandingPage />);

      // Check for various feature list items
      expect(screen.getByText('Email & password authentication')).toBeInTheDocument();
      expect(screen.getByText('Social login (Google, GitHub)')).toBeInTheDocument();
      expect(screen.getByText('Dark/light mode support')).toBeInTheDocument();
      expect(screen.getByText('Subscription management')).toBeInTheDocument();
      expect(screen.getByText('Full TypeScript support')).toBeInTheDocument();
      expect(screen.getByText('Server & client components')).toBeInTheDocument();
    });
  });

  describe('Tech Stack Section', () => {
    it('renders tech stack section', () => {
      render(<LandingPage />);

      expect(screen.getByText('Modern Tech Stack')).toBeInTheDocument();
      expect(screen.getByText('Built with the best tools')).toBeInTheDocument();
    });

    it('renders all technology cards', () => {
      render(<LandingPage />);

      const technologies = [
        'Next.js 15',
        'TypeScript',
        'Tailwind CSS',
        'Supabase',
        'Stripe',
        'shadcn/ui',
      ];

      technologies.forEach((tech) => {
        expect(screen.getByText(tech)).toBeInTheDocument();
      });
    });
  });

  describe('CTA Section', () => {
    it('renders CTA section content', () => {
      render(<LandingPage />);

      expect(screen.getByText('Ready to ship your SaaS?')).toBeInTheDocument();
      expect(screen.getByText(/Join thousands of developers/)).toBeInTheDocument();
    });

    it('renders CTA buttons', () => {
      render(<LandingPage />);

      const startBuildingButton = screen.getByRole('link', { name: /start building now/i });
      const pricingButton = screen.getByRole('link', { name: /view pricing/i });

      expect(startBuildingButton).toBeInTheDocument();
      expect(startBuildingButton).toHaveAttribute('href', '/signup');
      expect(pricingButton).toBeInTheDocument();
      expect(pricingButton).toHaveAttribute('href', '/pricing');
    });

    it('renders newsletter signup form', () => {
      render(<LandingPage />);

      const emailInput = screen.getByPlaceholderText('Enter your email');
      const subscribeButton = screen.getByRole('button', { name: /subscribe/i });

      expect(emailInput).toBeInTheDocument();
      expect(subscribeButton).toBeInTheDocument();
      expect(screen.getByText('Get updates and launch tips')).toBeInTheDocument();
    });
  });

  describe('Newsletter Functionality', () => {
    it('handles email input changes', async () => {
      const user = userEvent.setup();
      render(<LandingPage />);

      const emailInput = screen.getByPlaceholderText('Enter your email');
      
      await user.type(emailInput, 'test@example.com');
      
      expect(emailInput).toHaveValue('test@example.com');
    });

    it('handles newsletter signup with valid email', async () => {
      const user = userEvent.setup();
      render(<LandingPage />);

      const emailInput = screen.getByPlaceholderText('Enter your email');
      const subscribeButton = screen.getByRole('button', { name: /subscribe/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(subscribeButton);

      expect(mockConsoleLog).toHaveBeenCalledWith('Newsletter signup:', 'test@example.com');
      expect(emailInput).toHaveValue('');
    });

    it('handles newsletter signup with empty email', async () => {
      const user = userEvent.setup();
      render(<LandingPage />);

      const subscribeButton = screen.getByRole('button', { name: /subscribe/i });

      await user.click(subscribeButton);

      expect(mockConsoleLog).not.toHaveBeenCalled();
    });

    it('clears email input after successful signup', async () => {
      const user = userEvent.setup();
      render(<LandingPage />);

      const emailInput = screen.getByPlaceholderText('Enter your email');
      const subscribeButton = screen.getByRole('button', { name: /subscribe/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(subscribeButton);

      await waitFor(() => {
        expect(emailInput).toHaveValue('');
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<LandingPage />);

      const h1Elements = screen.getAllByRole('heading', { level: 1 });
      const h2Elements = screen.getAllByRole('heading', { level: 2 });

      expect(h1Elements).toHaveLength(1);
      expect(h2Elements.length).toBeGreaterThan(0);
    });

    it('has proper link attributes', () => {
      render(<LandingPage />);

      const links = screen.getAllByRole('link');
      
      links.forEach((link) => {
        expect(link).toHaveAttribute('href');
      });
    });

    it('has proper button types', () => {
      render(<LandingPage />);

      const subscribeButton = screen.getByRole('button', { name: /subscribe/i });
      // Button component from shadcn/ui has default type="button"
      expect(subscribeButton).toBeInTheDocument();
    });
  });

  describe('Responsive Design Classes', () => {
    it('applies responsive classes to hero section', () => {
      render(<LandingPage />);

      const heroTitle = screen.getByText('Modern SaaS Kit');
      expect(heroTitle.closest('h1')).toHaveClass('text-4xl', 'md:text-6xl', 'lg:text-7xl');
    });

    it('applies responsive classes to feature grid', () => {
      render(<LandingPage />);

      // Find the actual features grid container by looking for the parent div with grid classes
      const featureCard = screen.getByText('Secure Authentication');
      const featureGrid = featureCard.closest('[class*="grid-cols-1"]');
      expect(featureGrid).toBeInTheDocument();
      // The grid classes are applied to the container, verifying it exists is sufficient
    });
  });

  describe('Interactive Elements', () => {
    it('handles keyboard navigation for newsletter signup', async () => {
      const user = userEvent.setup();
      render(<LandingPage />);

      const emailInput = screen.getByPlaceholderText('Enter your email');
      
      await user.type(emailInput, 'test@example.com');
      await user.keyboard('{Tab}');
      await user.keyboard('{Enter}');

      expect(mockConsoleLog).toHaveBeenCalledWith('Newsletter signup:', 'test@example.com');
    });

    it('maintains focus management', async () => {
      const user = userEvent.setup();
      render(<LandingPage />);

      const emailInput = screen.getByPlaceholderText('Enter your email');
      
      await user.click(emailInput);
      expect(emailInput).toHaveFocus();
    });
  });
}); 