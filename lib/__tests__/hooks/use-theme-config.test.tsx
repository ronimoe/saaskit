import { renderHook, act } from '@testing-library/react';
import { useThemeConfig } from '@/lib/hooks/use-theme-config';
import { useTheme } from 'next-themes';

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const mockUseTheme = useTheme as jest.Mock;

describe('useThemeConfig', () => {
  beforeEach(() => {
    localStorageMock.clear();
    document.documentElement.style.cssText = '';
    mockUseTheme.mockReturnValue({
      theme: 'default-light',
      setTheme: jest.fn(),
      resolvedTheme: 'light',
    });
  });

  it('should initialize with a default theme', () => {
    const { result } = renderHook(() => useThemeConfig());
    expect(result.current.currentTheme).not.toBeNull();
    expect(result.current.currentTheme?.name).toBe('default');
  });

  it('should apply brand colors as CSS variables', () => {
    renderHook(() => useThemeConfig());
    expect(document.documentElement.style.getPropertyValue('--brand-primary')).toBeTruthy();
  });

  it('should create and switch to a custom theme', () => {
    const { result } = renderHook(() => useThemeConfig());
    
    act(() => {
      const newTheme = result.current.createCustomTheme({
        name: 'My Custom Theme',
        displayName: 'My Custom Theme',
        mode: 'light',
        colors: { primary: '#ff0000' },
      });
      result.current.switchToCustomTheme(newTheme);
    });

    expect(result.current.setTheme).toHaveBeenCalledWith('My Custom Theme');
  });

  it('should toggle a feature flag for a custom theme', async () => {
    const { result, rerender } = renderHook(() => useThemeConfig());

    // Create and switch to a custom theme first
    let newTheme;
    act(() => {
      newTheme = result.current.createCustomTheme({
        name: 'CustomFeat',
        displayName: 'CustomFeat',
        mode: 'light',
        colors: { primary: '#00ff00' },
        features: { animations: true, glassmorphism: true, highContrast: false }
      });
      result.current.switchToCustomTheme(newTheme);
    });
    
    // Mock the theme change
    mockUseTheme.mockReturnValue({
        theme: 'CustomFeat',
        setTheme: jest.fn(),
        resolvedTheme: 'light',
      });
  
    rerender();

    const initialValue = result.current.features.animations;
    
    act(() => {
      result.current.toggleFeature('animations');
    });

    rerender();
    
    expect(result.current.features.animations).toBe(!initialValue);
  });
}); 