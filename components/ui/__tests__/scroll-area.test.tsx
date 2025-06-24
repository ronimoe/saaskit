import { render } from '@testing-library/react';
import { ScrollArea } from '../scroll-area';

describe('ScrollArea', () => {
  it('renders the viewport and children', () => {
    render(
      <ScrollArea>
        <div data-testid="child">Content</div>
      </ScrollArea>
    );
    const viewport = document.querySelector('[data-slot="scroll-area-viewport"]');
    expect(viewport).toBeInTheDocument();
    expect(viewport?.querySelector('[data-testid="child"]')).toBeInTheDocument();
  });

  it('applies custom className to root', () => {
    render(
      <ScrollArea className="custom-scroll-area">
        <div>Content</div>
      </ScrollArea>
    );
    const root = document.querySelector('[data-slot="scroll-area"]');
    expect(root).toHaveClass('custom-scroll-area');
  });

  // Radix UI does not render scrollbars or thumbs in jsdom/Jest due to lack of layout/overflow calculation.
  // These should be tested in a real browser environment (e2e or visual regression tests).
}); 