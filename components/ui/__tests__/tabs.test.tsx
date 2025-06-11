import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../tabs';

describe('Tabs Components', () => {
  describe('Tabs (Root)', () => {
    it('renders tabs root with default data-slot', () => {
      render(
        <Tabs data-testid="tabs-root">
          <div>Tab content</div>
        </Tabs>
      );
      
      const tabsRoot = screen.getByTestId('tabs-root');
      expect(tabsRoot).toBeInTheDocument();
      expect(tabsRoot).toHaveAttribute('data-slot', 'tabs');
    });

    it('applies default className', () => {
      render(
        <Tabs data-testid="tabs-root">
          <div>Tab content</div>
        </Tabs>
      );
      
      const tabsRoot = screen.getByTestId('tabs-root');
      expect(tabsRoot).toHaveClass('flex', 'flex-col', 'gap-2');
    });

    it('merges custom className with default', () => {
      render(
        <Tabs className="custom-class" data-testid="tabs-root">
          <div>Tab content</div>
        </Tabs>
      );
      
      const tabsRoot = screen.getByTestId('tabs-root');
      expect(tabsRoot).toHaveClass('flex', 'flex-col', 'gap-2', 'custom-class');
    });

    it('forwards all props to TabsPrimitive.Root', () => {
      render(
        <Tabs defaultValue="tab1" orientation="vertical" data-testid="tabs-root">
          <div>Tab content</div>
        </Tabs>
      );
      
      const tabsRoot = screen.getByTestId('tabs-root');
      expect(tabsRoot).toHaveAttribute('data-orientation', 'vertical');
    });
  });

  describe('TabsList', () => {
    it('renders tabs list with default data-slot', () => {
      render(
        <Tabs>
          <TabsList data-testid="tabs-list">
            <div>List content</div>
          </TabsList>
        </Tabs>
      );
      
      const tabsList = screen.getByTestId('tabs-list');
      expect(tabsList).toBeInTheDocument();
      expect(tabsList).toHaveAttribute('data-slot', 'tabs-list');
    });

    it('applies default className', () => {
      render(
        <Tabs>
          <TabsList data-testid="tabs-list">
            <div>List content</div>
          </TabsList>
        </Tabs>
      );
      
      const tabsList = screen.getByTestId('tabs-list');
      expect(tabsList).toHaveClass(
        'bg-muted',
        'text-muted-foreground',
        'inline-flex',
        'h-9',
        'w-fit',
        'items-center',
        'justify-center',
        'rounded-lg',
        'p-[3px]'
      );
    });

    it('merges custom className with default', () => {
      render(
        <Tabs>
          <TabsList className="custom-list-class" data-testid="tabs-list">
            <div>List content</div>
          </TabsList>
        </Tabs>
      );
      
      const tabsList = screen.getByTestId('tabs-list');
      expect(tabsList).toHaveClass('bg-muted', 'custom-list-class');
    });

    it('forwards all props to TabsPrimitive.List', () => {
      render(
        <Tabs>
          <TabsList loop={false} data-testid="tabs-list">
            <div>List content</div>
          </TabsList>
        </Tabs>
      );
      
      const tabsList = screen.getByTestId('tabs-list');
      expect(tabsList).toBeInTheDocument();
    });
  });

  describe('TabsTrigger', () => {
    it('renders tabs trigger with default data-slot', () => {
      render(
        <Tabs>
          <TabsList>
            <TabsTrigger value="tab1" data-testid="tabs-trigger">
              Tab 1
            </TabsTrigger>
          </TabsList>
        </Tabs>
      );
      
      const tabsTrigger = screen.getByTestId('tabs-trigger');
      expect(tabsTrigger).toBeInTheDocument();
      expect(tabsTrigger).toHaveAttribute('data-slot', 'tabs-trigger');
    });

    it('applies default className with extensive styling', () => {
      render(
        <Tabs>
          <TabsList>
            <TabsTrigger value="tab1" data-testid="tabs-trigger">
              Tab 1
            </TabsTrigger>
          </TabsList>
        </Tabs>
      );
      
      const tabsTrigger = screen.getByTestId('tabs-trigger');
      expect(tabsTrigger).toHaveClass(
        'inline-flex',
        'items-center',
        'justify-center',
        'gap-1.5',
        'rounded-md',
        'border',
        'border-transparent',
        'px-2',
        'py-1',
        'text-sm',
        'font-medium',
        'whitespace-nowrap',
        'transition-[color,box-shadow]'
      );
    });

    it('merges custom className with default', () => {
      render(
        <Tabs>
          <TabsList>
            <TabsTrigger value="tab1" className="custom-trigger-class" data-testid="tabs-trigger">
              Tab 1
            </TabsTrigger>
          </TabsList>
        </Tabs>
      );
      
      const tabsTrigger = screen.getByTestId('tabs-trigger');
      expect(tabsTrigger).toHaveClass('inline-flex', 'custom-trigger-class');
    });

    it('handles click interaction', async () => {
      const user = userEvent.setup();
      
      render(
        <Tabs>
          <TabsList>
            <TabsTrigger value="tab1" data-testid="tabs-trigger">
              Tab 1
            </TabsTrigger>
          </TabsList>
        </Tabs>
      );
      
      const tabsTrigger = screen.getByTestId('tabs-trigger');
      await user.click(tabsTrigger);
      
      expect(tabsTrigger).toBeInTheDocument();
    });

    it('forwards all props to TabsPrimitive.Trigger', () => {
      render(
        <Tabs>
          <TabsList>
            <TabsTrigger value="tab1" disabled data-testid="tabs-trigger">
              Tab 1
            </TabsTrigger>
          </TabsList>
        </Tabs>
      );
      
      const tabsTrigger = screen.getByTestId('tabs-trigger');
      expect(tabsTrigger).toBeDisabled();
    });
  });

  describe('TabsContent', () => {
    it('renders tabs content with default data-slot', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsContent value="tab1" data-testid="tabs-content">
            Content for tab 1
          </TabsContent>
        </Tabs>
      );
      
      const tabsContent = screen.getByTestId('tabs-content');
      expect(tabsContent).toBeInTheDocument();
      expect(tabsContent).toHaveAttribute('data-slot', 'tabs-content');
    });

    it('applies default className', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsContent value="tab1" data-testid="tabs-content">
            Content for tab 1
          </TabsContent>
        </Tabs>
      );
      
      const tabsContent = screen.getByTestId('tabs-content');
      expect(tabsContent).toHaveClass('flex-1', 'outline-none');
    });

    it('merges custom className with default', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsContent value="tab1" className="custom-content-class" data-testid="tabs-content">
            Content for tab 1
          </TabsContent>
        </Tabs>
      );
      
      const tabsContent = screen.getByTestId('tabs-content');
      expect(tabsContent).toHaveClass('flex-1', 'outline-none', 'custom-content-class');
    });

    it('forwards all props to TabsPrimitive.Content', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsContent value="tab1" forceMount data-testid="tabs-content">
            Content for tab 1
          </TabsContent>
        </Tabs>
      );
      
      const tabsContent = screen.getByTestId('tabs-content');
      expect(tabsContent).toBeInTheDocument();
    });
  });

  describe('Complete Tabs Integration', () => {
    it('renders complete tabs structure and handles tab switching', async () => {
      const user = userEvent.setup();
      
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );
      
      // Check initial state
      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
      
      // Click second tab
      await user.click(screen.getByText('Tab 2'));
      
      // Check state after click
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('handles keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
          <TabsContent value="tab3">Content 3</TabsContent>
        </Tabs>
      );
      
      // Focus first tab
      screen.getByText('Tab 1').focus();
      
      // Navigate with arrow keys
      await user.keyboard('{ArrowRight}');
      expect(screen.getByText('Tab 2')).toHaveFocus();
      
      await user.keyboard('{ArrowRight}');
      expect(screen.getByText('Tab 3')).toHaveFocus();
      
      await user.keyboard('{ArrowLeft}');
      expect(screen.getByText('Tab 2')).toHaveFocus();
    });

    it('supports controlled mode', async () => {
      const user = userEvent.setup();
      const onValueChange = jest.fn();
      
      render(
        <Tabs value="tab2" onValueChange={onValueChange}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );
      
      // Should show tab2 content initially
      expect(screen.getByText('Content 2')).toBeInTheDocument();
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
      
      // Click tab1
      await user.click(screen.getByText('Tab 1'));
      
      // Should call onValueChange
      expect(onValueChange).toHaveBeenCalledWith('tab1');
    });
  });
}); 