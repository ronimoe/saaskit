import { render, screen } from '@testing-library/react';
import { Logo, BrandLogo, BrandIcon, BrandMark } from '@/components/ui/logo';
import { useBrandLogos } from '@/components/providers/brand-provider';

// Mock the useBrandLogos hook
jest.mock('@/components/providers/brand-provider', () => ({
  useBrandLogos: jest.fn(),
}));

const mockUseBrandLogos = useBrandLogos as jest.Mock;

describe('Logo Components', () => {
  beforeEach(() => {
    mockUseBrandLogos.mockReturnValue({
      getLogoProps: (type: string) => {
        if (type === 'icon') return { src: '/icon.svg', alt: 'Icon Logo' };
        if (type === 'secondary') return { src: '/mark.svg', alt: 'Mark Logo' };
        return { src: '/logo.svg', alt: 'Primary Logo' };
      },
    });
  });

  it('should render the primary logo by default', () => {
    render(<Logo />);
    const img = screen.getByAltText('Primary Logo');
    expect(img).toHaveAttribute('src', '/logo.svg');
  });

  it('should render the icon logo', () => {
    render(<BrandIcon />);
    const img = screen.getByAltText('Icon Logo');
    expect(img).toHaveAttribute('src', '/icon.svg');
  });

  it('should render with server-side props', () => {
    render(
      <Logo
        serverLogoProps={{
          src: '/server-logo.png',
          alt: 'Server Logo',
        }}
      />
    );
    const img = screen.getByAltText('Server Logo');
    expect(img.getAttribute('src')).toMatch(/%2Fserver-logo\.png/);
  });

  it('BrandLogo should match snapshot', () => {
    const { container } = render(<BrandLogo />);
    expect(container).toMatchSnapshot();
  });

  it('BrandIcon should match snapshot', () => {
    const { container } = render(<BrandIcon />);
    expect(container).toMatchSnapshot();
  });

  it('BrandMark should match snapshot', () => {
    const { container } = render(<BrandMark />);
    expect(container).toMatchSnapshot();
  });
}); 