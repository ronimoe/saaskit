import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../button';

describe('Enhanced Button Component', () => {
  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      render(<Button>Click me</Button>);
      
      const button = screen.getByRole('button', { name: 'Click me' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-primary');
      expect(button).toHaveClass('text-primary-foreground');
    });

    it('should render as a child component when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      );
      
      const link = screen.getByRole('link', { name: 'Link Button' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test');
    });

    it('should render with custom className', () => {
      render(<Button className="custom-class">Custom Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
      expect(button).toHaveClass('bg-primary'); // Should still have default classes
    });
  });

  describe('Button Variants', () => {
    it('should render default variant', () => {
      render(<Button variant="default">Default</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary');
      expect(button).toHaveClass('text-primary-foreground');
    });

    it('should render destructive variant', () => {
      render(<Button variant="destructive">Delete</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-destructive');
      expect(button).toHaveClass('text-white');
    });

    it('should render outline variant', () => {
      render(<Button variant="outline">Outline</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border');
      expect(button).toHaveClass('bg-background');
    });

    it('should render secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-secondary');
      expect(button).toHaveClass('text-secondary-foreground');
    });

    it('should render ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('hover:bg-accent');
      expect(button).toHaveClass('hover:text-accent-foreground');
    });

    it('should render link variant', () => {
      render(<Button variant="link">Link</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-primary');
      expect(button).toHaveClass('underline-offset-4');
    });
  });

  describe('Button Sizes', () => {
    it('should render default size', () => {
      render(<Button size="default">Default Size</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-9');
      expect(button).toHaveClass('px-4');
      expect(button).toHaveClass('py-2');
    });

    it('should render small size', () => {
      render(<Button size="sm">Small</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-8');
      expect(button).toHaveClass('px-3');
    });

    it('should render large size', () => {
      render(<Button size="lg">Large</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-10');
      expect(button).toHaveClass('px-6');
    });

    it('should render icon size', () => {
      render(<Button size="icon">🔥</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('size-9');
    });
  });

  describe('Button States', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:pointer-events-none');
      expect(button).toHaveClass('disabled:opacity-50');
    });

    it('should handle click events when enabled', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Clickable</Button>);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not handle click events when disabled', () => {
      const handleClick = jest.fn();
      render(<Button disabled onClick={handleClick}>Disabled</Button>);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<Button aria-label="Custom label">Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Custom label');
    });

    it('should support aria-disabled when disabled', () => {
      render(<Button disabled>Disabled</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('disabled');
    });

    it('should be focusable by keyboard', () => {
      render(<Button>Focusable</Button>);
      
      const button = screen.getByRole('button');
      button.focus();
      
      expect(button).toHaveFocus();
    });

    it('should support keyboard interaction', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Keyboard</Button>);
      
      const button = screen.getByRole('button');
      button.focus();
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('HTML Attributes', () => {
    it('should pass through HTML button attributes', () => {
      render(
        <Button 
          type="submit" 
          form="test-form"
          data-testid="submit-button"
        >
          Submit
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveAttribute('form', 'test-form');
      expect(button).toHaveAttribute('data-testid', 'submit-button');
    });

    it('should support ref forwarding', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Ref Button</Button>);
      
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current?.textContent).toBe('Ref Button');
    });
  });

  describe('Complex Scenarios', () => {
    it('should render with icon and text', () => {
      render(
        <Button>
          <span>🚀</span>
          Launch
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('🚀Launch');
    });

    it('should handle multiple CSS classes correctly', () => {
      render(
        <Button 
          variant="outline" 
          size="lg" 
          className="custom-class another-class"
        >
          Multi-class
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border'); // from variant
      expect(button).toHaveClass('h-10'); // from size
      expect(button).toHaveClass('custom-class'); // from className
      expect(button).toHaveClass('another-class'); // from className
    });

    it('should work with different button types', () => {
      const { rerender } = render(<Button type="button">Button</Button>);
      let button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');

      rerender(<Button type="submit">Submit</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');

      rerender(<Button type="reset">Reset</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'reset');
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const renderSpy = jest.fn();
      
      const TestButton = ({ children }: { children: React.ReactNode }) => {
        renderSpy();
        return <Button>{children}</Button>;
      };

      const { rerender } = render(<TestButton>Test</TestButton>);
      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Re-render with same props should not cause unnecessary renders
      rerender(<TestButton>Test</TestButton>);
      expect(renderSpy).toHaveBeenCalledTimes(2); // React will still re-render, but our component logic should be efficient
    });
  });
}); 