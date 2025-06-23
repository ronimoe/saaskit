import {
  SPACING,
  TYPOGRAPHY,
  COLORS,
  RADIUS,
  SHADOWS,
  ANIMATIONS,
  BREAKPOINTS,
  Z_INDEX,
  GLASS_EFFECTS,
  MAGNETIC_EFFECTS,
  PARTICLE_EFFECTS,
  GRID,
  INTERACTIVE,
  DESIGN_TOKENS
} from '@/lib/design-system/design-tokens';

describe('Design Tokens', () => {
  it('SPACING tokens should match snapshot', () => {
    expect(SPACING).toMatchSnapshot();
  });

  it('TYPOGRAPHY tokens should match snapshot', () => {
    expect(TYPOGRAPHY).toMatchSnapshot();
  });

  it('COLORS tokens should match snapshot', () => {
    expect(COLORS).toMatchSnapshot();
  });

  it('RADIUS tokens should match snapshot', () => {
    expect(RADIUS).toMatchSnapshot();
  });

  it('SHADOWS tokens should match snapshot', () => {
    expect(SHADOWS).toMatchSnapshot();
  });

  it('ANIMATIONS tokens should match snapshot', () => {
    expect(ANIMATIONS).toMatchSnapshot();
  });

  it('BREAKPOINTS tokens should match snapshot', () => {
    expect(BREAKPOINTS).toMatchSnapshot();
  });

  it('Z_INDEX tokens should match snapshot', () => {
    expect(Z_INDEX).toMatchSnapshot();
  });

  it('GLASS_EFFECTS tokens should match snapshot', () => {
    expect(GLASS_EFFECTS).toMatchSnapshot();
  });

  it('MAGNETIC_EFFECTS tokens should match snapshot', () => {
    expect(MAGNETIC_EFFECTS).toMatchSnapshot();
  });

  it('PARTICLE_EFFECTS tokens should match snapshot', () => {
    expect(PARTICLE_EFFECTS).toMatchSnapshot();
  });

  it('GRID tokens should match snapshot', () => {
    expect(GRID).toMatchSnapshot();
  });

  it('INTERACTIVE tokens should match snapshot', () => {
    expect(INTERACTIVE).toMatchSnapshot();
  });

  it('DESIGN_TOKENS collection should match snapshot', () => {
    expect(DESIGN_TOKENS).toEqual({
      spacing: SPACING,
      typography: TYPOGRAPHY,
      colors: COLORS,
      radius: RADIUS,
      shadows: SHADOWS,
      animations: ANIMATIONS,
      breakpoints: BREAKPOINTS,
      zIndex: Z_INDEX,
      glassEffects: GLASS_EFFECTS,
      magneticEffects: MAGNETIC_EFFECTS,
      particleEffects: PARTICLE_EFFECTS,
      grid: GRID,
      interactive: INTERACTIVE,
    });
    expect(DESIGN_TOKENS).toMatchSnapshot();
  });
}); 