import { render, fireEvent } from '@testing-library/react';
import { Checkbox } from '../checkbox';

describe('Checkbox', () => {
  it('renders the root and indicator only when checked', () => {
    render(<Checkbox />);
    const root = document.querySelector('[data-slot="checkbox"]');
    expect(root).toBeInTheDocument();
    // Indicator should not be present when unchecked
    let indicator = document.querySelector('[data-slot="checkbox-indicator"]');
    expect(indicator).not.toBeInTheDocument();
    // Click to check
    fireEvent.click(root as HTMLElement);
    indicator = document.querySelector('[data-slot="checkbox-indicator"]');
    expect(indicator).toBeInTheDocument();
  });

  it('toggles checked state on click', () => {
    render(<Checkbox />);
    const root = document.querySelector('[data-slot="checkbox"]') as HTMLElement;
    expect(root).toHaveAttribute('data-state', 'unchecked');
    fireEvent.click(root);
    expect(root).toHaveAttribute('data-state', 'checked');
    fireEvent.click(root);
    expect(root).toHaveAttribute('data-state', 'unchecked');
  });

  it('applies custom className to root', () => {
    render(<Checkbox className="custom-checkbox" />);
    const root = document.querySelector('[data-slot="checkbox"]');
    expect(root).toHaveClass('custom-checkbox');
  });
}); 