import { render, screen, fireEvent, act } from '@testing-library/react';
import { useMagneticEffect, useMagneticGlow, useTiltEffect } from '@/lib/hooks/use-magnetic-effect';
import type { RefObject } from 'react';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false, // Default to not matching reduced motion
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

const MagneticEffectComponent = (props: Parameters<typeof useMagneticEffect>[0]) => {
  const ref = useMagneticEffect(props);
  return <div data-testid="magnetic" ref={ref as RefObject<HTMLDivElement>} style={{ width: '100px', height: '100px' }} />;
};

const MagneticGlowComponent = (props: Parameters<typeof useMagneticGlow>[0]) => {
  const ref = useMagneticGlow(props);
  return <div data-testid="glow" ref={ref as RefObject<HTMLDivElement>} style={{ width: '100px', height: '100px' }} />;
};

const TiltComponent = (props: Parameters<typeof useTiltEffect>[0]) => {
  const ref = useTiltEffect(props);
  return <div data-testid="tilt" ref={ref as RefObject<HTMLDivElement>} style={{ width: '100px', height: '100px' }} />;
};


describe('Animation Hooks', () => {

  beforeEach(() => {
    jest.useFakeTimers();
    // Mock getBoundingClientRect for all tests
    jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      top: 0,
      left: 0,
      width: 100,
      height: 100,
      right: 100,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => {},
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  // --- useMagneticEffect ---
  describe('useMagneticEffect', () => {
    it('should set CSS variables on mouse move with default strength', () => {
      render(<MagneticEffectComponent />);
      const element = screen.getByTestId('magnetic');

      act(() => {
        fireEvent.mouseMove(element, { clientX: 75, clientY: 25 });
        jest.runOnlyPendingTimers();
      });

      expect(element.style.getPropertyValue('--mouse-x')).toBe('65%');
      expect(element.style.getPropertyValue('--mouse-y')).toBe('35%');
      expect(element.style.getPropertyValue('--magnetic-strength')).toBe('0.3');
    });

    it('should reset CSS variables on mouse leave', () => {
      render(<MagneticEffectComponent />);
      const element = screen.getByTestId('magnetic');

      act(() => {
        fireEvent.mouseMove(element, { clientX: 75, clientY: 25 });
        jest.runOnlyPendingTimers();
      });
      
      act(() => {
        fireEvent.mouseLeave(element);
        jest.runOnlyPendingTimers();
      });

      expect(element.style.getPropertyValue('--mouse-x')).toBe('50%');
      expect(element.style.getPropertyValue('--mouse-y')).toBe('50%');
    });

    it('should not update when disabled', () => {
      render(<MagneticEffectComponent disabled={true} />);
      const element = screen.getByTestId('magnetic');

      act(() => {
        fireEvent.mouseMove(element, { clientX: 75, clientY: 75 });
        jest.runOnlyPendingTimers();
      });

      expect(element.style.getPropertyValue('--mouse-x')).toBe('');
    });

    it('should respect reduced motion', () => {
      (window.matchMedia as jest.Mock).mockImplementationOnce(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));
      
      render(<MagneticEffectComponent respectReducedMotion={true} />);
      const element = screen.getByTestId('magnetic');

      act(() => {
        fireEvent.mouseMove(element, { clientX: 75, clientY: 75 });
        jest.runOnlyPendingTimers();
      });

      expect(element.style.getPropertyValue('--mouse-x')).toBe('');
    });
  });

  // --- useMagneticGlow ---
  describe('useMagneticGlow', () => {
    it('should set glow properties on mouse move', () => {
      render(<MagneticGlowComponent />);
      const element = screen.getByTestId('glow');
      
      act(() => {
        fireEvent.mouseMove(element, { clientX: 75, clientY: 75 });
        jest.runOnlyPendingTimers();
      });
      
      const distance = Math.sqrt(Math.pow(25, 2) + Math.pow(25, 2));
      const maxDistance = Math.sqrt(Math.pow(100, 2) + Math.pow(100, 2)) / 2;
      const proximity = Math.max(0, 1 - distance / maxDistance);

      const expectedGlowSize = 300 * proximity;
      const expectedGlowIntensity = 0.1 * proximity;

      expect(element.style.getPropertyValue('--glow-size')).toBe(`${expectedGlowSize}px`);
      expect(element.style.getPropertyValue('--glow-intensity')).toBe(expectedGlowIntensity.toString());
    });

    it('should reset glow properties on mouse leave', () => {
      render(<MagneticGlowComponent />);
      const element = screen.getByTestId('glow');

      act(() => {
        fireEvent.mouseMove(element, { clientX: 75, clientY: 75 });
        jest.runOnlyPendingTimers();
      });
      
      act(() => {
        fireEvent.mouseLeave(element);
        jest.runOnlyPendingTimers();
      });
      
      expect(element.style.getPropertyValue('--glow-size')).toBe('0px');
      expect(element.style.getPropertyValue('--glow-intensity')).toBe('0');
    });
  });

  // --- useTiltEffect ---
  describe('useTiltEffect', () => {
    it('should set tilt properties on mouse move', () => {
      render(<TiltComponent strength={10} />);
      const element = screen.getByTestId('tilt');
  
      act(() => {
        fireEvent.mouseMove(element, { clientX: 75, clientY: 25 });
        jest.runOnlyPendingTimers();
      });

      expect(element.style.getPropertyValue('--tilt-x')).toBe('5deg');
      expect(element.style.getPropertyValue('--tilt-y')).toBe('5deg');
      expect(element.style.getPropertyValue('--perspective')).toBe('1000px');
    });

    it('should reset tilt properties on mouse leave', () => {
      render(<TiltComponent />);
      const element = screen.getByTestId('tilt');

      act(() => {
        fireEvent.mouseMove(element, { clientX: 75, clientY: 25 });
        jest.runOnlyPendingTimers();
      });
      
      act(() => {
        fireEvent.mouseLeave(element);
        jest.runOnlyPendingTimers();
      });
      
      expect(element.style.getPropertyValue('--tilt-x')).toBe('0deg');
      expect(element.style.getPropertyValue('--tilt-y')).toBe('0deg');
    });
  });
}); 