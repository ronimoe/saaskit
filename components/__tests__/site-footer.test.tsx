import { render } from '@testing-library/react';
import { SiteFooter } from '@/components/site-footer';

describe('SiteFooter', () => {
  it('should match snapshot', () => {
    const { container } = render(<SiteFooter />);
    expect(container).toMatchSnapshot();
  });
}); 