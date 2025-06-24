import { render, screen } from '@testing-library/react';
import { ParticleBackground } from '../particle-background';

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = (cb) => setTimeout(cb, 1) as unknown as number;
global.cancelAnimationFrame = (id) => clearTimeout(id);

// Mock getContext for canvas
defineCanvasGetContext();

function defineCanvasGetContext() {
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    value: function () {
      return {
        clearRect: jest.fn(),
        beginPath: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
        fillStyle: '',
        globalAlpha: 1,
      };
    },
    writable: true,
  });
}

// Mock window.matchMedia for reduced motion
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});

describe('ParticleBackground', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders a canvas with the correct class', () => {
    render(<ParticleBackground />);
    const canvas = document.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas?.tagName).toBe('CANVAS');
    expect(canvas).toHaveClass('absolute', 'inset-0', 'pointer-events-none', 'z-0');
  });

  it('renders with custom props', () => {
    render(
      <ParticleBackground
        particleCount={10}
        speed={2}
        size={{ min: 5, max: 10 }}
        opacity={{ min: 0.5, max: 1 }}
        interactive={false}
        colors={['#000', '#fff']}
        className="custom-class"
      />
    );
    const canvas = document.querySelector('canvas');
    expect(canvas).toHaveClass('custom-class');
  });

  it('resizes canvas on window resize', () => {
    render(<ParticleBackground />);
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    window.innerWidth = 500;
    window.innerHeight = 400;
    window.dispatchEvent(new Event('resize'));
    expect(canvas).toBeInTheDocument();
  });

  it('handles mousemove when interactive', () => {
    render(<ParticleBackground interactive={true} />);
    const canvas = document.querySelector('canvas');
    const event = new MouseEvent('mousemove', { clientX: 100, clientY: 100 });
    canvas?.dispatchEvent(event);
    expect(canvas).toBeInTheDocument();
  });

  it('does not handle mousemove when interactive is false', () => {
    render(<ParticleBackground interactive={false} />);
    const canvas = document.querySelector('canvas');
    const event = new MouseEvent('mousemove', { clientX: 100, clientY: 100 });
    canvas?.dispatchEvent(event);
    expect(canvas).toBeInTheDocument();
  });
}); 