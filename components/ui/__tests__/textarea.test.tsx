import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Textarea } from '../textarea';

describe('Textarea Component', () => {
  describe('Basic Rendering', () => {
    it('renders textarea with default data-slot', () => {
      render(<Textarea data-testid="textarea" />);
      
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveAttribute('data-slot', 'textarea');
    });

    it('renders as textarea element', () => {
      render(<Textarea />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
      expect(textarea.tagName).toBe('TEXTAREA');
    });

    it('applies default className styles', () => {
      render(<Textarea data-testid="textarea" />);
      
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveClass(
        'border-input',
        'placeholder:text-muted-foreground',
        'focus-visible:border-ring',
        'flex',
        'min-h-16',
        'w-full',
        'rounded-md',
        'border',
        'bg-transparent',
        'px-3',
        'py-2',
        'text-base'
      );
    });

    it('merges custom className with default', () => {
      render(<Textarea className="custom-class h-32" data-testid="textarea" />);
      
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveClass('custom-class', 'h-32', 'border-input', 'w-full');
    });

    it('handles className conflicts correctly', () => {
      render(<Textarea className="min-h-32 bg-red-500" data-testid="textarea" />);
      
      const textarea = screen.getByTestId('textarea');
      // Custom classes should override defaults with Tailwind merge
      expect(textarea).toHaveClass('min-h-32', 'bg-red-500');
    });
  });

  describe('Props and Attributes', () => {
    it('forwards all HTML textarea props', () => {
      render(
        <Textarea
          id="test-textarea"
          name="message"
          placeholder="Enter your message"
          rows={5}
          cols={50}
          maxLength={500}
          required
          data-testid="textarea"
        />
      );
      
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveAttribute('id', 'test-textarea');
      expect(textarea).toHaveAttribute('name', 'message');
      expect(textarea).toHaveAttribute('placeholder', 'Enter your message');
      expect(textarea).toHaveAttribute('rows', '5');
      expect(textarea).toHaveAttribute('cols', '50');
      expect(textarea).toHaveAttribute('maxlength', '500');
      expect(textarea).toHaveAttribute('required');
    });

    it('supports value prop for controlled mode', () => {
      render(<Textarea value="Test value" onChange={() => {}} data-testid="textarea" />);
      
      const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement;
      expect(textarea.value).toBe('Test value');
    });

    it('supports defaultValue prop for uncontrolled mode', () => {
      render(<Textarea defaultValue="Default content" data-testid="textarea" />);
      
      const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement;
      expect(textarea.value).toBe('Default content');
    });

    it('handles disabled state', () => {
      render(<Textarea disabled data-testid="textarea" />);
      
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toBeDisabled();
      expect(textarea).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
    });

    it('handles readOnly state', () => {
      render(<Textarea readOnly value="Read only content" data-testid="textarea" />);
      
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveAttribute('readonly');
    });

    it('supports autoFocus', () => {
      render(<Textarea autoFocus data-testid="textarea" />);
      
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveFocus();
    });

    it('supports resize CSS property', () => {
      render(<Textarea style={{ resize: 'none' }} data-testid="textarea" />);
      
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveStyle({ resize: 'none' });
    });
  });

  describe('User Interactions', () => {
    it('handles typing input', async () => {
      const user = userEvent.setup();
      
      render(<Textarea data-testid="textarea" />);
      
      const textarea = screen.getByTestId('textarea');
      await user.type(textarea, 'Hello, World!');
      
      expect(textarea).toHaveValue('Hello, World!');
    });

    it('handles multiline input', async () => {
      const user = userEvent.setup();
      
      render(<Textarea data-testid="textarea" />);
      
      const textarea = screen.getByTestId('textarea');
      await user.type(textarea, 'Line 1{enter}Line 2{enter}Line 3');
      
      expect(textarea).toHaveValue('Line 1\nLine 2\nLine 3');
    });

    it('handles onChange event', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<Textarea onChange={onChange} data-testid="textarea" />);
      
      const textarea = screen.getByTestId('textarea');
      await user.type(textarea, 'a');
      
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
        target: expect.objectContaining({ value: 'a' })
      }));
    });

    it('handles onFocus and onBlur events', async () => {
      const user = userEvent.setup();
      const onFocus = jest.fn();
      const onBlur = jest.fn();
      
      render(
        <div>
          <Textarea onFocus={onFocus} onBlur={onBlur} data-testid="textarea" />
          <button>Other element</button>
        </div>
      );
      
      const textarea = screen.getByTestId('textarea');
      const button = screen.getByRole('button');
      
      await user.click(textarea);
      expect(onFocus).toHaveBeenCalledTimes(1);
      
      await user.click(button);
      expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it('handles keyboard shortcuts and text selection', async () => {
      const user = userEvent.setup();
      
      render(<Textarea data-testid="textarea" />);
      
      const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement;
      await user.type(textarea, 'Hello World');
      
      // Test that we can clear and type new content
      await user.clear(textarea);
      await user.type(textarea, 'New content');
      
      expect(textarea).toHaveValue('New content');
      
      // Test that selection methods exist (component supports selection)
      expect(typeof textarea.setSelectionRange).toBe('function');
      expect(typeof textarea.select).toBe('function');
    });

    it('handles paste event', async () => {
      const user = userEvent.setup();
      
      render(<Textarea data-testid="textarea" />);
      
      const textarea = screen.getByTestId('textarea');
      await user.click(textarea);
      await user.paste('Pasted content');
      
      expect(textarea).toHaveValue('Pasted content');
    });

    it('does not accept input when disabled', async () => {
      const user = userEvent.setup();
      
      render(<Textarea disabled data-testid="textarea" />);
      
      const textarea = screen.getByTestId('textarea');
      await user.type(textarea, 'Should not work');
      
      expect(textarea).toHaveValue('');
    });
  });

  describe('Form Integration', () => {
    it('integrates with form submission', () => {
      const onSubmit = jest.fn();
      
      render(
        <form onSubmit={onSubmit}>
          <Textarea name="message" defaultValue="Form message" />
          <button type="submit">Submit</button>
        </form>
      );
      
      fireEvent.submit(screen.getByRole('button'));
      
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('supports form validation', () => {
      render(
        <form>
          <Textarea required name="message" data-testid="textarea" />
          <button type="submit">Submit</button>
        </form>
      );
      
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toBeRequired();
      expect(textarea).toBeInvalid(); // Required but empty
    });

    it('supports minLength and maxLength validation', async () => {
      const user = userEvent.setup();
      
      render(
        <form>
          <Textarea 
            minLength={5} 
            maxLength={10} 
            data-testid="textarea" 
          />
        </form>
      );
      
      const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement;
      
      // Test that minLength and maxLength attributes are set
      expect(textarea).toHaveAttribute('minlength', '5');
      expect(textarea).toHaveAttribute('maxlength', '10');
      
      // Test maxLength enforcement during typing
      await user.type(textarea, 'this text is longer than ten characters');
      expect(textarea.value.length).toBeLessThanOrEqual(10);
    });

    it('supports title attribute for additional info', async () => {
      const user = userEvent.setup();
      
      render(
        <Textarea 
          title="Enter your feedback here"
          data-testid="textarea" 
        />
      );
      
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveAttribute('title', 'Enter your feedback here');
    });
  });

  describe('Accessibility', () => {
    it('supports aria attributes', () => {
      render(
        <Textarea 
          aria-label="Message input"
          aria-describedby="message-help"
          aria-required="true"
          data-testid="textarea"
        />
      );
      
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveAttribute('aria-label', 'Message input');
      expect(textarea).toHaveAttribute('aria-describedby', 'message-help');
      expect(textarea).toHaveAttribute('aria-required', 'true');
    });

    it('can be found by accessible name', () => {
      render(
        <div>
          <label htmlFor="message-textarea">Your Message</label>
          <Textarea id="message-textarea" />
        </div>
      );
      
      const textarea = screen.getByLabelText('Your Message');
      expect(textarea).toBeInTheDocument();
    });

    it('supports placeholder text', () => {
      render(<Textarea placeholder="Type your message here..." />);
      
      const textarea = screen.getByPlaceholderText('Type your message here...');
      expect(textarea).toBeInTheDocument();
    });

    it('applies focus-visible styles for keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(<Textarea data-testid="textarea" />);
      
      const textarea = screen.getByTestId('textarea');
      
      // Focus via keyboard (Tab)
      await user.tab();
      expect(textarea).toHaveFocus();
      expect(textarea).toHaveClass('focus-visible:border-ring', 'focus-visible:ring-ring/50');
    });

    it('handles aria-invalid state', () => {
      render(
        <Textarea 
          aria-invalid="true" 
          data-testid="textarea" 
        />
      );
      
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
      expect(textarea).toHaveClass('aria-invalid:ring-destructive/20', 'aria-invalid:border-destructive');
    });
  });

  describe('Styling and Visual States', () => {
    it('applies responsive text sizing', () => {
      render(<Textarea data-testid="textarea" />);
      
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveClass('text-base', 'md:text-sm');
    });

    it('applies correct transition effects', () => {
      render(<Textarea data-testid="textarea" />);
      
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveClass('transition-[color,box-shadow]');
    });

    it('applies shadow and border styles', () => {
      render(<Textarea data-testid="textarea" />);
      
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveClass('shadow-xs', 'border', 'rounded-md');
    });

    it('supports field-sizing-content for modern browsers', () => {
      render(<Textarea data-testid="textarea" />);
      
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveClass('field-sizing-content');
    });

    it('applies dark mode styles', () => {
      render(<Textarea data-testid="textarea" />);
      
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveClass(
        'dark:bg-input/30',
        'dark:aria-invalid:ring-destructive/40'
      );
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles empty className prop', () => {
      render(<Textarea className="" data-testid="textarea" />);
      
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveClass('border-input'); // Default classes still applied
    });

    it('handles undefined props gracefully', () => {
      const props = {
        value: undefined,
        onChange: undefined,
        className: undefined,
      };
      
      render(<Textarea {...props} data-testid="textarea" />);
      
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toBeInTheDocument();
    });

    it('handles very long text content', async () => {
      const user = userEvent.setup();
      // Use a smaller but still significant text length
      const longText = 'a'.repeat(1000);
      
      render(<Textarea data-testid="textarea" />);
      
      const textarea = screen.getByTestId('textarea');
      
      // Use paste instead of type for performance
      await user.click(textarea);
      await user.paste(longText);
      
      expect(textarea).toHaveValue(longText);
    });

    it('maintains performance with rapid input', async () => {
      const onChange = jest.fn();
      
      render(<Textarea onChange={onChange} data-testid="textarea" />);
      
      const textarea = screen.getByTestId('textarea');
      
      // Test that component can handle onChange events efficiently
      fireEvent.change(textarea, { target: { value: 'rapid' } });
      
      expect(textarea).toHaveValue('rapid');
      expect(onChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('Use Cases', () => {
    it('works as a comment input field', async () => {
      const user = userEvent.setup();
      
      render(
        <div>
          <label htmlFor="comment">Leave a comment</label>
          <Textarea 
            id="comment"
            placeholder="Write your comment here..."
            rows={4}
            data-testid="textarea"
          />
        </div>
      );
      
      const textarea = screen.getByLabelText('Leave a comment');
      
      // Use paste for more reliable text input in tests
      await user.click(textarea);
      await user.paste('This is my comment about the article.');
      
      expect(textarea).toHaveValue('This is my comment about the article.');
    });

    it('works as a message compose field', async () => {
      const user = userEvent.setup();
      
      render(
        <div>
          <label htmlFor="message">Compose Message</label>
          <Textarea 
            id="message"
            placeholder="Type your message..."
            maxLength={280}
            data-testid="textarea"
          />
          <small>280 characters remaining</small>
        </div>
      );
      
      const textarea = screen.getByLabelText('Compose Message');
      
      // Use paste for more reliable text input in tests
      await user.click(textarea);
      await user.paste('Hello! This is a test message.');
      
      expect(textarea).toHaveValue('Hello! This is a test message.');
    });

    it('works as a description field in forms', () => {
      render(
        <form>
          <div>
            <label htmlFor="description">Product Description</label>
            <Textarea 
              id="description"
              name="description"
              required
              placeholder="Describe your product..."
              rows={6}
              data-testid="textarea"
            />
          </div>
          <button type="submit">Save Product</button>
        </form>
      );
      
      const textarea = screen.getByLabelText('Product Description');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toBeRequired();
      expect(textarea).toHaveAttribute('name', 'description');
    });
  });
}); 