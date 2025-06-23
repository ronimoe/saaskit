import { render, screen, fireEvent } from '@testing-library/react';
import { MagneticGlassCard } from '@/components/ui/magnetic-glass-card';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('MagneticGlassCard', () => {
  it('should render children correctly', () => {
    render(
      <MagneticGlassCard>
        <div>Hello</div>
      </MagneticGlassCard>
    );
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should apply transform style on mouse move', () => {
    render(<MagneticGlassCard>Card</MagneticGlassCard>);
    const card = screen.getByText('Card');
    
    fireEvent.mouseMove(card, { clientX: 10, clientY: 10 });
    expect(card.style.transform).not.toBe('translate(0px, 0px)');
  });

  it('should reset transform style on mouse leave', () => {
    render(<MagneticGlassCard>Card</MagneticGlassCard>);
    const card = screen.getByText('Card');
    
    fireEvent.mouseMove(card, { clientX: 10, clientY: 10 });
    fireEvent.mouseLeave(card);
    expect(card.style.transform).toBe('translate(0px, 0px)');
  });

  it('should not apply magnetic effect when disabled', () => {
    render(<MagneticGlassCard magnetic={false}>Card</MagneticGlassCard>);
    const card = screen.getByText('Card');
    
    fireEvent.mouseMove(card, { clientX: 10, clientY: 10 });
    expect(card.style.transform).toBe('');
  });

  it('should match snapshot', () => {
    const { container } = render(<MagneticGlassCard />);
    expect(container).toMatchSnapshot();
  });
}); 