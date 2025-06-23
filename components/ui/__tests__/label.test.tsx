import { render, screen } from '@testing-library/react';
import { Label } from '@/components/ui/label';

describe('Label', () => {
  it('should render children correctly', () => {
    render(<Label>Email</Label>);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('should apply default and custom class names', () => {
    render(<Label className="my-custom-class">Password</Label>);
    const label = screen.getByText('Password');
    expect(label).toHaveClass('flex');
    expect(label).toHaveClass('my-custom-class');
  });

  it('should match snapshot', () => {
    const { container } = render(<Label>Confirm Password</Label>);
    expect(container).toMatchSnapshot();
  });
}); 