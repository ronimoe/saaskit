import * as React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Skeleton } from '../skeleton';

describe('Skeleton Component', () => {
  it('renders skeleton with default className', () => {
    render(<Skeleton data-testid="skeleton" />);
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('animate-pulse', 'rounded-md', 'bg-muted');
  });

  it('merges custom className with default', () => {
    render(<Skeleton className="h-4 w-[250px]" data-testid="skeleton" />);
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('animate-pulse', 'rounded-md', 'bg-muted', 'h-4', 'w-[250px]');
  });

  it('overrides default className when custom className conflicts', () => {
    render(<Skeleton className="bg-red-500 rounded-lg" data-testid="skeleton" />);
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('animate-pulse', 'bg-red-500', 'rounded-lg');
    // Should not have the original bg-muted and rounded-md due to conflicts
    expect(skeleton).not.toHaveClass('bg-muted', 'rounded-md');
  });

  it('forwards all HTML div props', () => {
    render(
      <Skeleton 
        data-testid="skeleton"
        id="custom-skeleton"
        role="presentation"
        aria-label="Loading content"
        onClick={() => {}}
      />
    );
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveAttribute('id', 'custom-skeleton');
    expect(skeleton).toHaveAttribute('role', 'presentation');
    expect(skeleton).toHaveAttribute('aria-label', 'Loading content');
  });

  it('supports custom dimensions via className', () => {
    render(<Skeleton className="h-6 w-full" data-testid="skeleton" />);
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('h-6', 'w-full');
  });

  it('supports inline styles', () => {
    render(
      <Skeleton 
        style={{ height: '20px', width: '100px' }} 
        data-testid="skeleton" 
      />
    );
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveStyle({
      height: '20px',
      width: '100px'
    });
  });

  it('can be used for text placeholder', () => {
    render(
      <div>
        <Skeleton className="h-4 w-[250px]" data-testid="text-skeleton" />
        <Skeleton className="h-4 w-[200px] mt-2" />
      </div>
    );
    
    const textSkeleton = screen.getByTestId('text-skeleton');
    expect(textSkeleton).toHaveClass('h-4', 'w-[250px]');
  });

  it('can be used for avatar placeholder', () => {
    render(<Skeleton className="h-12 w-12 rounded-full" data-testid="avatar-skeleton" />);
    
    const avatarSkeleton = screen.getByTestId('avatar-skeleton');
    expect(avatarSkeleton).toHaveClass('h-12', 'w-12', 'rounded-full');
  });

  it('can be used for card placeholder', () => {
    render(
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" data-testid="card-skeleton" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
    
    const cardSkeleton = screen.getByTestId('card-skeleton');
    expect(cardSkeleton).toHaveClass('h-4', 'w-[250px]');
  });

  it('renders as a div element by default', () => {
    render(<Skeleton data-testid="skeleton" />);
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton.tagName).toBe('DIV');
  });

  it('supports event handlers', () => {
    const handleClick = jest.fn();
    const handleMouseOver = jest.fn();
    
    render(
      <Skeleton 
        data-testid="skeleton"
        onClick={handleClick}
        onMouseOver={handleMouseOver}
      />
    );
    
    const skeleton = screen.getByTestId('skeleton');
    
    skeleton.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
    
    skeleton.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    expect(handleMouseOver).toHaveBeenCalledTimes(1);
  });

  it('supports data attributes', () => {
    render(
      <Skeleton 
        data-testid="skeleton"
        data-loading="true"
        data-type="text"
      />
    );
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveAttribute('data-loading', 'true');
    expect(skeleton).toHaveAttribute('data-type', 'text');
  });

  it('supports accessibility attributes', () => {
    render(
      <Skeleton 
        data-testid="skeleton"
        aria-busy="true"
        aria-live="polite"
        role="status"
      />
    );
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveAttribute('aria-busy', 'true');
    expect(skeleton).toHaveAttribute('aria-live', 'polite');
    expect(skeleton).toHaveAttribute('role', 'status');
  });

  it('can have children (though typically used without)', () => {
    render(
      <Skeleton data-testid="skeleton">
        <span>Hidden content</span>
      </Skeleton>
    );
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toContainHTML('<span>Hidden content</span>');
  });

  it('maintains consistent animation class', () => {
    const { rerender } = render(<Skeleton data-testid="skeleton" />);
    
    let skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('animate-pulse');
    
    // Re-render with different props
    rerender(<Skeleton className="custom-class" data-testid="skeleton" />);
    
    skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('animate-pulse', 'custom-class');
  });
}); 