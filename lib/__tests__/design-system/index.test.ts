import * as DesignSystem from '@/lib/design-system/index';

describe('Design System Entry Point', () => {
  it('should export all key components and utilities', () => {
    // Components
    expect(DesignSystem.GlassCard).toBeDefined();
    expect(DesignSystem.UnfoldableFeatureCard).toBeDefined();

    // Hooks
    expect(DesignSystem.useMagneticEffect).toBeDefined();
    expect(DesignSystem.useThemeConfig).toBeDefined();

    // Utilities
    expect(DesignSystem.createBrandPalette).toBeDefined();
    expect(DesignSystem.calculateUserLevel).toBeDefined();
    
    // Tokens & Composition
    expect(DesignSystem.DESIGN_TOKENS).toBeDefined();
    expect(DesignSystem.composeComplete).toBeDefined();
  });

  it('DESIGN_SYSTEM_VERSION should match snapshot', () => {
    expect(DesignSystem.DESIGN_SYSTEM_VERSION).toMatchSnapshot();
  });

  it('FEATURES constant should match snapshot', () => {
    expect(DesignSystem.FEATURES).toMatchSnapshot();
  });

  it('BROWSER_SUPPORT constant should match snapshot', () => {
    expect(DesignSystem.BROWSER_SUPPORT).toMatchSnapshot();
  });

  it('ACCESSIBILITY_FEATURES constant should match snapshot', () => {
    expect(DesignSystem.ACCESSIBILITY_FEATURES).toMatchSnapshot();
  });
}); 