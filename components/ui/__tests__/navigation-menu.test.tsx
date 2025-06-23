import { render, screen } from '@testing-library/react';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu';

// Mock the Radix UI Navigation Menu
jest.mock('@radix-ui/react-navigation-menu', () => {
    const original = jest.requireActual('@radix-ui/react-navigation-menu');
    return {
      ...original,
      Root: ({ children }: { children: React.ReactNode }) => <nav>{children}</nav>,
      List: ({ children }: { children: React.ReactNode }) => <ul>{children}</ul>,
      Item: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
      Trigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
      Content: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
      Link: ({ children, ...props }: { children: React.ReactNode, [key: string]: any }) => <a {...props}>{children}</a>,
      Viewport: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    };
  });

describe('NavigationMenu Components', () => {
  it('should render a complete navigation menu structure', () => {
    const { container } = render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Trigger</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="/">Link</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    );

    expect(screen.getByText('Trigger')).toBeInTheDocument();
    expect(screen.getByText('Link')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/');
    expect(container).toMatchSnapshot();
  });
}); 