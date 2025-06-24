import { render } from '@testing-library/react';
import { Progress } from '../progress';

// Mock Radix Progress to avoid context issues in jsdom
describe('Progress', () => {
  it('renders the progress indicator with correct value', () => {
    render(<Progress value={50} />);
    const indicator = document.querySelector('[data-slot="progress-indicator"]');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveStyle('transform: translateX(-50%)');
  });

  it('applies custom className to root', () => {
    render(<Progress value={30} className="custom-progress" />);
    const root = document.querySelector('[data-slot="progress"]');
    expect(root).toHaveClass('custom-progress');
  });

  it('renders with value=0 (empty)', () => {
    render(<Progress value={0} />);
    const indicator = document.querySelector('[data-slot="progress-indicator"]');
    expect(indicator).toHaveStyle('transform: translateX(-100%)');
  });

  it('renders with value=100 (full)', () => {
    render(<Progress value={100} />);
    const indicator = document.querySelector('[data-slot="progress-indicator"]');
    expect(indicator).toHaveStyle('transform: translateX(-0%)');
  });

  it('renders with no value (defaults to 0)', () => {
    render(<Progress />);
    const indicator = document.querySelector('[data-slot="progress-indicator"]');
    expect(indicator).toHaveStyle('transform: translateX(-100%)');
  });
}); 