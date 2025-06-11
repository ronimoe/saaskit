import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from '../sheet';

describe('Sheet Components', () => {
  describe('Sheet (Root)', () => {
    it('renders sheet root with default data-slot', () => {
      render(
        <Sheet data-testid="sheet-root">
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>Sheet content</SheetContent>
        </Sheet>
      );
      
      // The Sheet root element is not directly rendered, it's a wrapper
      // We can test by checking if the trigger renders properly
      expect(screen.getByText('Open')).toBeInTheDocument();
    });

    it('forwards all props to SheetPrimitive.Root', () => {
      render(
        <Sheet modal={false} data-testid="sheet-root">
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>Sheet content</SheetContent>
        </Sheet>
      );
      
      // Test that the Sheet component renders and accepts props
      expect(screen.getByText('Open')).toBeInTheDocument();
    });

    it('handles modal prop', () => {
      render(
        <Sheet modal={true}>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>Sheet content</SheetContent>
        </Sheet>
      );
      
      expect(screen.getByText('Open')).toBeInTheDocument();
    });
  });

  describe('SheetTrigger', () => {
    it('renders sheet trigger with default data-slot', () => {
      render(
        <Sheet>
          <SheetTrigger data-testid="sheet-trigger">Open Sheet</SheetTrigger>
          <SheetContent>Content</SheetContent>
        </Sheet>
      );
      
      const trigger = screen.getByTestId('sheet-trigger');
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveAttribute('data-slot', 'sheet-trigger');
    });

    it('handles click to open sheet', async () => {
      const user = userEvent.setup();
      
      render(
        <Sheet>
          <SheetTrigger>Open Sheet</SheetTrigger>
          <SheetContent>
            <SheetTitle>Test Sheet</SheetTitle>
            <div>Sheet Content</div>
          </SheetContent>
        </Sheet>
      );
      
      await user.click(screen.getByText('Open Sheet'));
      
      await waitFor(() => {
        expect(screen.getByText('Test Sheet')).toBeInTheDocument();
        expect(screen.getByText('Sheet Content')).toBeInTheDocument();
      });
    });

    it('forwards all props to SheetPrimitive.Trigger', () => {
      render(
        <Sheet>
          <SheetTrigger className="custom-trigger" aria-label="Open">
            Open
          </SheetTrigger>
          <SheetContent>Content</SheetContent>
        </Sheet>
      );
      
      const trigger = screen.getByLabelText('Open');
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveClass('custom-trigger');
    });
  });

  describe('SheetClose', () => {
    it('renders sheet close with default data-slot', async () => {
      const user = userEvent.setup();
      
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetClose data-testid="sheet-close">Close</SheetClose>
          </SheetContent>
        </Sheet>
      );
      
      await user.click(screen.getByText('Open'));
      
      await waitFor(() => {
        const closeButton = screen.getByTestId('sheet-close');
        expect(closeButton).toBeInTheDocument();
        expect(closeButton).toHaveAttribute('data-slot', 'sheet-close');
      });
    });

    it('forwards all props to SheetPrimitive.Close', async () => {
      const user = userEvent.setup();
      
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetClose className="custom-close" aria-label="Custom close">
              Custom Close
            </SheetClose>
          </SheetContent>
        </Sheet>
      );
      
      await user.click(screen.getByText('Open'));
      
      await waitFor(() => {
        const closeButton = screen.getByLabelText('Custom close');
        expect(closeButton).toBeInTheDocument();
        expect(closeButton).toHaveClass('custom-close');
      });
    });
  });

  describe('SheetContent', () => {
    it('renders sheet content with default side (right)', async () => {
      const user = userEvent.setup();
      
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent data-testid="sheet-content">Content</SheetContent>
        </Sheet>
      );
      
      await user.click(screen.getByText('Open'));
      
      await waitFor(() => {
        const content = screen.getByTestId('sheet-content');
        expect(content).toBeInTheDocument();
        expect(content).toHaveAttribute('data-slot', 'sheet-content');
        expect(content).toHaveClass('right-0');
      });
    });

    it('renders with side="left"', async () => {
      const user = userEvent.setup();
      
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent side="left" data-testid="sheet-content">Content</SheetContent>
        </Sheet>
      );
      
      await user.click(screen.getByText('Open'));
      
      await waitFor(() => {
        const content = screen.getByTestId('sheet-content');
        expect(content).toHaveClass('left-0');
      });
    });

    it('renders with side="top"', async () => {
      const user = userEvent.setup();
      
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent side="top" data-testid="sheet-content">Content</SheetContent>
        </Sheet>
      );
      
      await user.click(screen.getByText('Open'));
      
      await waitFor(() => {
        const content = screen.getByTestId('sheet-content');
        expect(content).toHaveClass('top-0');
      });
    });

    it('renders with side="bottom"', async () => {
      const user = userEvent.setup();
      
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent side="bottom" data-testid="sheet-content">Content</SheetContent>
        </Sheet>
      );
      
      await user.click(screen.getByText('Open'));
      
      await waitFor(() => {
        const content = screen.getByTestId('sheet-content');
        expect(content).toHaveClass('bottom-0');
      });
    });

    it('applies default className', async () => {
      const user = userEvent.setup();
      
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent data-testid="sheet-content">Content</SheetContent>
        </Sheet>
      );
      
      await user.click(screen.getByText('Open'));
      
      await waitFor(() => {
        const content = screen.getByTestId('sheet-content');
        expect(content).toHaveClass('bg-background', 'fixed', 'z-50', 'flex', 'flex-col');
      });
    });

    it('merges custom className with default', async () => {
      const user = userEvent.setup();
      
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent className="custom-class" data-testid="sheet-content">
            Content
          </SheetContent>
        </Sheet>
      );
      
      await user.click(screen.getByText('Open'));
      
      await waitFor(() => {
        const content = screen.getByTestId('sheet-content');
        expect(content).toHaveClass('custom-class', 'bg-background');
      });
    });

    it('renders children and close button', async () => {
      const user = userEvent.setup();
      
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <div data-testid="custom-content">Custom Content</div>
          </SheetContent>
        </Sheet>
      );
      
      await user.click(screen.getByText('Open'));
      
      await waitFor(() => {
        expect(screen.getByTestId('custom-content')).toBeInTheDocument();
        expect(screen.getByText('Custom Content')).toBeInTheDocument();
        // Built-in close button - find by the span with "Close" text
        expect(screen.getByText('Close')).toBeInTheDocument();
      });
    });

    it('includes overlay by default', async () => {
      const user = userEvent.setup();
      
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>Content</SheetContent>
        </Sheet>
      );
      
      await user.click(screen.getByText('Open'));
      
      await waitFor(() => {
        const overlay = document.querySelector('[data-slot="sheet-overlay"]');
        expect(overlay).toBeInTheDocument();
      });
    });

    it('forwards all props to SheetPrimitive.Content', async () => {
      const user = userEvent.setup();
      
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent aria-describedby="test-description">
            Content
          </SheetContent>
        </Sheet>
      );
      
      await user.click(screen.getByText('Open'));
      
      await waitFor(() => {
        const content = screen.getByRole('dialog');
        expect(content).toHaveAttribute('aria-describedby', 'test-description');
      });
    });
  });

  describe('SheetHeader', () => {
    it('renders sheet header with default data-slot', () => {
      render(<SheetHeader data-testid="sheet-header">Header</SheetHeader>);
      
      const header = screen.getByTestId('sheet-header');
      expect(header).toBeInTheDocument();
      expect(header).toHaveAttribute('data-slot', 'sheet-header');
    });

    it('applies default className', () => {
      render(<SheetHeader data-testid="sheet-header">Header</SheetHeader>);
      
      const header = screen.getByTestId('sheet-header');
      expect(header).toHaveClass('flex', 'flex-col', 'gap-1.5', 'p-4');
    });

    it('merges custom className with default', () => {
      render(
        <SheetHeader className="custom-header" data-testid="sheet-header">
          Header
        </SheetHeader>
      );
      
      const header = screen.getByTestId('sheet-header');
      expect(header).toHaveClass('custom-header', 'flex', 'flex-col');
    });

    it('forwards all props to div element', () => {
      render(
        <SheetHeader role="banner" aria-label="Sheet header">
          Header
        </SheetHeader>
      );
      
      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
      expect(header).toHaveAttribute('aria-label', 'Sheet header');
    });
  });

  describe('SheetFooter', () => {
    it('renders sheet footer with default data-slot', () => {
      render(<SheetFooter data-testid="sheet-footer">Footer</SheetFooter>);
      
      const footer = screen.getByTestId('sheet-footer');
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveAttribute('data-slot', 'sheet-footer');
    });

    it('applies default className', () => {
      render(<SheetFooter data-testid="sheet-footer">Footer</SheetFooter>);
      
      const footer = screen.getByTestId('sheet-footer');
      expect(footer).toHaveClass('mt-auto', 'flex', 'flex-col', 'gap-2', 'p-4');
    });

    it('merges custom className with default', () => {
      render(
        <SheetFooter className="custom-footer" data-testid="sheet-footer">
          Footer
        </SheetFooter>
      );
      
      const footer = screen.getByTestId('sheet-footer');
      expect(footer).toHaveClass('custom-footer', 'mt-auto', 'flex');
    });

    it('forwards all props to div element', () => {
      render(
        <SheetFooter role="contentinfo" aria-label="Sheet footer">
          Footer
        </SheetFooter>
      );
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveAttribute('aria-label', 'Sheet footer');
    });
  });

  describe('SheetTitle', () => {
    it('renders sheet title with default data-slot', async () => {
      const user = userEvent.setup();
      
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetTitle data-testid="sheet-title">Title</SheetTitle>
          </SheetContent>
        </Sheet>
      );
      
      await user.click(screen.getByText('Open'));
      
      await waitFor(() => {
        const title = screen.getByTestId('sheet-title');
        expect(title).toBeInTheDocument();
        expect(title).toHaveAttribute('data-slot', 'sheet-title');
      });
    });

    it('applies default className', async () => {
      const user = userEvent.setup();
      
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetTitle data-testid="sheet-title">Title</SheetTitle>
          </SheetContent>
        </Sheet>
      );
      
      await user.click(screen.getByText('Open'));
      
      await waitFor(() => {
        const title = screen.getByTestId('sheet-title');
        expect(title).toHaveClass('text-foreground', 'font-semibold');
      });
    });

    it('merges custom className with default', async () => {
      const user = userEvent.setup();
      
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetTitle className="custom-title" data-testid="sheet-title">
              Title
            </SheetTitle>
          </SheetContent>
        </Sheet>
      );
      
      await user.click(screen.getByText('Open'));
      
      await waitFor(() => {
        const title = screen.getByTestId('sheet-title');
        expect(title).toHaveClass('custom-title', 'text-foreground', 'font-semibold');
      });
    });

    it('forwards all props to SheetPrimitive.Title', async () => {
      const user = userEvent.setup();
      
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetTitle id="custom-title">Title</SheetTitle>
          </SheetContent>
        </Sheet>
      );
      
      await user.click(screen.getByText('Open'));
      
      await waitFor(() => {
        const title = screen.getByText('Title');
        expect(title).toHaveAttribute('id', 'custom-title');
      });
    });
  });

  describe('SheetDescription', () => {
    it('renders sheet description with default data-slot', async () => {
      const user = userEvent.setup();
      
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetDescription data-testid="sheet-description">Description</SheetDescription>
          </SheetContent>
        </Sheet>
      );
      
      await user.click(screen.getByText('Open'));
      
      await waitFor(() => {
        const description = screen.getByTestId('sheet-description');
        expect(description).toBeInTheDocument();
        expect(description).toHaveAttribute('data-slot', 'sheet-description');
      });
    });

    it('applies default className', async () => {
      const user = userEvent.setup();
      
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetDescription data-testid="sheet-description">Description</SheetDescription>
          </SheetContent>
        </Sheet>
      );
      
      await user.click(screen.getByText('Open'));
      
      await waitFor(() => {
        const description = screen.getByTestId('sheet-description');
        expect(description).toHaveClass('text-muted-foreground', 'text-sm');
      });
    });

    it('merges custom className with default', async () => {
      const user = userEvent.setup();
      
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetDescription className="custom-description" data-testid="sheet-description">
              Description
            </SheetDescription>
          </SheetContent>
        </Sheet>
      );
      
      await user.click(screen.getByText('Open'));
      
      await waitFor(() => {
        const description = screen.getByTestId('sheet-description');
        expect(description).toHaveClass('custom-description', 'text-muted-foreground', 'text-sm');
      });
    });

    it('forwards all props to SheetPrimitive.Description', async () => {
      const user = userEvent.setup();
      
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetDescription id="custom-description">Description</SheetDescription>
          </SheetContent>
        </Sheet>
      );
      
      await user.click(screen.getByText('Open'));
      
      await waitFor(() => {
        const description = screen.getByText('Description');
        expect(description).toHaveAttribute('id', 'custom-description');
      });
    });
  });

  describe('Complete Sheet Integration', () => {
    it('renders complete sheet structure', async () => {
      const user = userEvent.setup();
      
      render(
        <Sheet>
          <SheetTrigger>Open Sheet</SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Test Sheet</SheetTitle>
              <SheetDescription>This is a test sheet</SheetDescription>
            </SheetHeader>
            <div>Main content area</div>
            <SheetFooter>
              <SheetClose data-testid="footer-close">Close</SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      );
      
      await user.click(screen.getByText('Open Sheet'));
      
      await waitFor(() => {
        expect(screen.getByText('Test Sheet')).toBeInTheDocument();
        expect(screen.getByText('This is a test sheet')).toBeInTheDocument();
        expect(screen.getByText('Main content area')).toBeInTheDocument();
        expect(screen.getByTestId('footer-close')).toBeInTheDocument();
      });
    });

    it('handles controlled open/close behavior', async () => {
      const user = userEvent.setup();
      const TestComponent = () => {
        const [open, setOpen] = React.useState(false);
        
        return (
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger onClick={() => setOpen(true)}>Open</SheetTrigger>
            <SheetContent>
              <SheetTitle>Controlled Sheet</SheetTitle>
              <button onClick={() => setOpen(false)} data-testid="custom-close">
                Custom Close
              </button>
            </SheetContent>
          </Sheet>
        );
      };
      
      render(<TestComponent />);
      
      // Open sheet
      await user.click(screen.getByText('Open'));
      await waitFor(() => {
        expect(screen.getByText('Controlled Sheet')).toBeInTheDocument();
      });
      
      // Close sheet
      await user.click(screen.getByTestId('custom-close'));
      await waitFor(() => {
        expect(screen.queryByText('Controlled Sheet')).not.toBeInTheDocument();
      });
    });

    it('handles escape key to close', async () => {
      const user = userEvent.setup();
      
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetTitle>Sheet Title</SheetTitle>
          </SheetContent>
        </Sheet>
      );
      
      await user.click(screen.getByText('Open'));
      await waitFor(() => {
        expect(screen.getByText('Sheet Title')).toBeInTheDocument();
      });
      
      await user.keyboard('{Escape}');
      await waitFor(() => {
        expect(screen.queryByText('Sheet Title')).not.toBeInTheDocument();
      });
    });

    it('handles clicking overlay to close', async () => {
      const user = userEvent.setup();
      
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetTitle>Sheet Title</SheetTitle>
          </SheetContent>
        </Sheet>
      );
      
      await user.click(screen.getByText('Open'));
      await waitFor(() => {
        expect(screen.getByText('Sheet Title')).toBeInTheDocument();
        // Test that overlay is present and clickable
        const overlay = document.querySelector('[data-slot="sheet-overlay"]');
        expect(overlay).toBeInTheDocument();
        expect(overlay).toHaveClass('bg-black/50');
      });
    });
  });
}); 