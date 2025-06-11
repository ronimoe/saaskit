import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Switch } from '../switch';

describe('Switch Component', () => {
  it('renders switch with default data-slot', () => {
    render(<Switch data-testid="switch" />);
    
    const switchElement = screen.getByTestId('switch');
    expect(switchElement).toBeInTheDocument();
    expect(switchElement).toHaveAttribute('data-slot', 'switch');
  });

  it('applies default className', () => {
    render(<Switch data-testid="switch" />);
    
    const switchElement = screen.getByTestId('switch');
    expect(switchElement).toHaveClass(
      'peer',
      'inline-flex',
      'h-[1.15rem]',
      'w-8',
      'shrink-0',
      'items-center',
      'rounded-full',
      'border',
      'border-transparent',
      'shadow-xs',
      'transition-all',
      'outline-none'
    );
  });

  it('merges custom className with default', () => {
    render(<Switch className="custom-switch-class" data-testid="switch" />);
    
    const switchElement = screen.getByTestId('switch');
    expect(switchElement).toHaveClass('peer', 'inline-flex', 'custom-switch-class');
  });

  it('renders thumb element with data-slot', () => {
    render(<Switch data-testid="switch" />);
    
    const thumb = document.querySelector('[data-slot="switch-thumb"]');
    expect(thumb).toBeInTheDocument();
    expect(thumb).toHaveClass(
      'pointer-events-none',
      'block',
      'size-4',
      'rounded-full',
      'ring-0',
      'transition-transform'
    );
  });

  it('forwards all props to SwitchPrimitive.Root', () => {
    render(
      <Switch 
        data-testid="switch"
        disabled
        defaultChecked={true}
      />
    );
    
    const switchElement = screen.getByTestId('switch');
    expect(switchElement).toBeDisabled();
    expect(switchElement).toHaveAttribute('data-state', 'checked');
  });

  it('handles click interaction', async () => {
    const user = userEvent.setup();
    const onCheckedChange = jest.fn();
    
    render(
      <Switch 
        data-testid="switch"
        onCheckedChange={onCheckedChange}
      />
    );
    
    const switchElement = screen.getByTestId('switch');
    await user.click(switchElement);
    
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('supports controlled mode', async () => {
    const user = userEvent.setup();
    const onCheckedChange = jest.fn();
    
    render(
      <Switch 
        data-testid="switch"
        checked={false}
        onCheckedChange={onCheckedChange}
      />
    );
    
    const switchElement = screen.getByTestId('switch');
    await user.click(switchElement);
    
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('supports uncontrolled mode with defaultChecked', () => {
    render(<Switch defaultChecked={true} data-testid="switch" />);
    
    const switchElement = screen.getByTestId('switch');
    expect(switchElement).toHaveAttribute('data-state', 'checked');
  });

  it('handles disabled state', async () => {
    const user = userEvent.setup();
    const onCheckedChange = jest.fn();
    
    render(
      <Switch 
        data-testid="switch"
        disabled
        onCheckedChange={onCheckedChange}
      />
    );
    
    const switchElement = screen.getByTestId('switch');
    expect(switchElement).toBeDisabled();
    
    await user.click(switchElement);
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it('handles keyboard interaction - Space key', async () => {
    const user = userEvent.setup();
    const onCheckedChange = jest.fn();
    
    render(
      <Switch 
        data-testid="switch"
        onCheckedChange={onCheckedChange}
      />
    );
    
    const switchElement = screen.getByTestId('switch');
    switchElement.focus();
    
    await user.keyboard(' ');
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('handles keyboard interaction - Enter key', async () => {
    const user = userEvent.setup();
    const onCheckedChange = jest.fn();
    
    render(
      <Switch 
        data-testid="switch"
        onCheckedChange={onCheckedChange}
      />
    );
    
    const switchElement = screen.getByTestId('switch');
    switchElement.focus();
    
    await user.keyboard('{Enter}');
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('supports focus management', () => {
    render(<Switch data-testid="switch" />);
    
    const switchElement = screen.getByTestId('switch');
    switchElement.focus();
    
    expect(switchElement).toHaveFocus();
  });

  it('applies focus-visible styles when focused via keyboard', async () => {
    const user = userEvent.setup();
    
    render(<Switch data-testid="switch" />);
    
    const switchElement = screen.getByTestId('switch');
    
    // Focus via keyboard
    await user.tab();
    
    expect(switchElement).toHaveFocus();
    expect(switchElement).toHaveClass('focus-visible:border-ring', 'focus-visible:ring-ring/50');
  });

  it('shows different states visually', () => {
    const { rerender } = render(<Switch checked={false} data-testid="switch" />);
    
    let switchElement = screen.getByTestId('switch');
    expect(switchElement).toHaveAttribute('data-state', 'unchecked');
    
    rerender(<Switch checked={true} data-testid="switch" />);
    switchElement = screen.getByTestId('switch');
    expect(switchElement).toHaveAttribute('data-state', 'checked');
  });

  it('supports form integration with defaultChecked', () => {
    render(
      <form data-testid="form">
        <Switch 
          defaultChecked={true}
          data-testid="switch"
        />
      </form>
    );
    
    const switchElement = screen.getByTestId('switch');
    expect(switchElement).toHaveAttribute('data-state', 'checked');
    expect(switchElement).toHaveAttribute('role', 'switch');
  });

  it('supports aria attributes for accessibility', () => {
    render(
      <Switch 
        data-testid="switch"
        aria-label="Enable notifications"
        aria-describedby="notification-help"
      />
    );
    
    const switchElement = screen.getByTestId('switch');
    expect(switchElement).toHaveAttribute('aria-label', 'Enable notifications');
    expect(switchElement).toHaveAttribute('aria-describedby', 'notification-help');
  });

  it('supports required attribute', () => {
    render(<Switch data-testid="switch" aria-required="true" />);
    
    const switchElement = screen.getByTestId('switch');
    // Radix UI switch uses aria-required instead of required attribute
    expect(switchElement).toHaveAttribute('aria-required', 'true');
  });

  it('supports data attributes', () => {
    render(
      <Switch 
        data-testid="switch"
        data-tracking="switch-toggle"
        data-feature="notifications"
      />
    );
    
    const switchElement = screen.getByTestId('switch');
    expect(switchElement).toHaveAttribute('data-tracking', 'switch-toggle');
    expect(switchElement).toHaveAttribute('data-feature', 'notifications');
  });

  it('handles rapid clicking', async () => {
    const user = userEvent.setup();
    const onCheckedChange = jest.fn();
    
    render(
      <Switch 
        data-testid="switch"
        onCheckedChange={onCheckedChange}
      />
    );
    
    const switchElement = screen.getByTestId('switch');
    
    // Click multiple times rapidly
    await user.click(switchElement);
    await user.click(switchElement);
    await user.click(switchElement);
    
    // Should be called for each click
    expect(onCheckedChange).toHaveBeenCalledTimes(3);
  });

  it('maintains thumb positioning based on checked state', () => {
    const { rerender } = render(<Switch checked={false} data-testid="switch" />);
    
    let thumb = document.querySelector('[data-slot="switch-thumb"]');
    expect(thumb).toHaveClass('data-[state=unchecked]:translate-x-0');
    
    rerender(<Switch checked={true} data-testid="switch" />);
    thumb = document.querySelector('[data-slot="switch-thumb"]');
    expect(thumb).toHaveClass('data-[state=checked]:translate-x-[calc(100%-2px)]');
  });

  it('supports custom ID for form association', () => {
    render(<Switch id="notification-switch" data-testid="switch" />);
    
    const switchElement = screen.getByTestId('switch');
    expect(switchElement).toHaveAttribute('id', 'notification-switch');
  });

  it('handles onCheckedChange with different values', async () => {
    const user = userEvent.setup();
    const onCheckedChange = jest.fn();
    
    const { rerender } = render(
      <Switch 
        checked={false}
        onCheckedChange={onCheckedChange} 
        data-testid="switch" 
      />
    );
    
    const switchElement = screen.getByTestId('switch');
    
    // First click - should call with true
    await user.click(switchElement);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    
    // Re-render with checked=true to simulate controlled behavior
    rerender(
      <Switch 
        checked={true}
        onCheckedChange={onCheckedChange} 
        data-testid="switch" 
      />
    );
    
    const switchElementUpdated = screen.getByTestId('switch');
    
    // Second click - should call with false
    await user.click(switchElementUpdated);
    expect(onCheckedChange).toHaveBeenCalledWith(false);
    
    expect(onCheckedChange).toHaveBeenCalledTimes(2);
  });
}); 