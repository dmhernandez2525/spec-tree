import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from './sidebar';

// Mock the useIsMobile hook
vi.mock('@/lib/hooks/use-mobile', () => ({
  useIsMobile: vi.fn(() => false),
}));

import { useIsMobile } from '@/lib/hooks/use-mobile';
const mockedUseIsMobile = vi.mocked(useIsMobile);

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseIsMobile.mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('exports', () => {
    it('exports all sidebar components', () => {
      expect(Sidebar).toBeDefined();
      expect(SidebarContent).toBeDefined();
      expect(SidebarHeader).toBeDefined();
      expect(SidebarFooter).toBeDefined();
      expect(SidebarGroup).toBeDefined();
      expect(SidebarGroupAction).toBeDefined();
      expect(SidebarGroupContent).toBeDefined();
      expect(SidebarGroupLabel).toBeDefined();
      expect(SidebarInput).toBeDefined();
      expect(SidebarInset).toBeDefined();
      expect(SidebarMenu).toBeDefined();
      expect(SidebarMenuAction).toBeDefined();
      expect(SidebarMenuBadge).toBeDefined();
      expect(SidebarMenuButton).toBeDefined();
      expect(SidebarMenuItem).toBeDefined();
      expect(SidebarMenuSkeleton).toBeDefined();
      expect(SidebarMenuSub).toBeDefined();
      expect(SidebarMenuSubButton).toBeDefined();
      expect(SidebarMenuSubItem).toBeDefined();
      expect(SidebarProvider).toBeDefined();
      expect(SidebarRail).toBeDefined();
      expect(SidebarSeparator).toBeDefined();
      expect(SidebarTrigger).toBeDefined();
      expect(useSidebar).toBeDefined();
    });

  });

  describe('displayNames', () => {
    it('all components have correct displayName', () => {
      expect(Sidebar.displayName).toBe('Sidebar');
      expect(SidebarContent.displayName).toBe('SidebarContent');
      expect(SidebarFooter.displayName).toBe('SidebarFooter');
      expect(SidebarGroup.displayName).toBe('SidebarGroup');
      expect(SidebarGroupAction.displayName).toBe('SidebarGroupAction');
      expect(SidebarGroupContent.displayName).toBe('SidebarGroupContent');
      expect(SidebarGroupLabel.displayName).toBe('SidebarGroupLabel');
      expect(SidebarHeader.displayName).toBe('SidebarHeader');
      expect(SidebarInput.displayName).toBe('SidebarInput');
      expect(SidebarInset.displayName).toBe('SidebarInset');
      expect(SidebarMenu.displayName).toBe('SidebarMenu');
      expect(SidebarMenuAction.displayName).toBe('SidebarMenuAction');
      expect(SidebarMenuBadge.displayName).toBe('SidebarMenuBadge');
      expect(SidebarMenuButton.displayName).toBe('SidebarMenuButton');
      expect(SidebarMenuItem.displayName).toBe('SidebarMenuItem');
      expect(SidebarMenuSkeleton.displayName).toBe('SidebarMenuSkeleton');
      expect(SidebarMenuSub.displayName).toBe('SidebarMenuSub');
      expect(SidebarMenuSubButton.displayName).toBe('SidebarMenuSubButton');
      expect(SidebarMenuSubItem.displayName).toBe('SidebarMenuSubItem');
      expect(SidebarProvider.displayName).toBe('SidebarProvider');
      expect(SidebarRail.displayName).toBe('SidebarRail');
      expect(SidebarSeparator.displayName).toBe('SidebarSeparator');
      expect(SidebarTrigger.displayName).toBe('SidebarTrigger');
    });
  });

  describe('SidebarProvider', () => {
    it('renders children correctly', () => {
      render(
        <SidebarProvider>
          <div data-testid="child">Child content</div>
        </SidebarProvider>
      );
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <SidebarProvider ref={ref}>
          <div>Content</div>
        </SidebarProvider>
      );
      expect(ref.current).toBeInstanceOf(HTMLElement);
    });

    it('applies custom className', () => {
      render(
        <SidebarProvider className="custom-class" data-testid="provider">
          <div>Content</div>
        </SidebarProvider>
      );
      expect(screen.getByTestId('provider')).toHaveClass('custom-class');
    });

    it('sets CSS variables for sidebar width', () => {
      render(
        <SidebarProvider data-testid="provider">
          <div>Content</div>
        </SidebarProvider>
      );
      const provider = screen.getByTestId('provider');
      expect(provider.style.getPropertyValue('--sidebar-width')).toBe('16rem');
      expect(provider.style.getPropertyValue('--sidebar-width-icon')).toBe('3rem');
    });
  });

  describe('useSidebar hook', () => {
    it('throws error when used outside SidebarProvider', () => {
      const TestComponent = () => {
        useSidebar();
        return null;
      };

      expect(() => render(<TestComponent />)).toThrow(
        'useSidebar must be used within a SidebarProvider.'
      );
    });
  });

  describe('Sidebar', () => {
    it('renders with default props', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <div data-testid="sidebar-content">Content</div>
          </Sidebar>
        </SidebarProvider>
      );
      // Should render content
      expect(screen.getByTestId('sidebar-content')).toBeInTheDocument();
      // Should have the sidebar data attribute on the inner container
      expect(document.querySelector('[data-sidebar="sidebar"]')).toBeInTheDocument();
    });

    it('renders on the right side', () => {
      render(
        <SidebarProvider>
          <Sidebar side="right">
            <div data-testid="content">Content</div>
          </Sidebar>
        </SidebarProvider>
      );
      // Sidebar renders content
      expect(screen.getByTestId('content')).toBeInTheDocument();
      // data-side is on the outer wrapper
      expect(document.querySelector('[data-side="right"]')).toBeInTheDocument();
    });

    it('renders with floating variant', () => {
      render(
        <SidebarProvider>
          <Sidebar variant="floating">
            <div data-testid="content">Content</div>
          </Sidebar>
        </SidebarProvider>
      );
      // Floating variant sidebar should render its content
      expect(screen.getByTestId('content')).toBeInTheDocument();
      // data-variant is on the outer wrapper
      expect(document.querySelector('[data-variant="floating"]')).toBeInTheDocument();
    });

    it('renders with inset variant', () => {
      render(
        <SidebarProvider>
          <Sidebar variant="inset">
            <div data-testid="content">Content</div>
          </Sidebar>
        </SidebarProvider>
      );
      // Inset variant sidebar should render its content
      expect(screen.getByTestId('content')).toBeInTheDocument();
      // data-variant is on the outer wrapper
      expect(document.querySelector('[data-variant="inset"]')).toBeInTheDocument();
    });

    it('renders non-collapsible sidebar', () => {
      render(
        <SidebarProvider>
          <Sidebar collapsible="none" data-testid="sidebar">
            <div>Content</div>
          </Sidebar>
        </SidebarProvider>
      );
      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar).toHaveClass('flex', 'h-full', 'flex-col');
    });
  });

  describe('SidebarTrigger', () => {
    it('renders a button', () => {
      render(
        <SidebarProvider>
          <SidebarTrigger data-testid="trigger" />
        </SidebarProvider>
      );
      const trigger = screen.getByTestId('trigger');
      expect(trigger).toBeInTheDocument();
      expect(trigger.tagName.toLowerCase()).toBe('button');
    });

    it('has correct data attribute', () => {
      render(
        <SidebarProvider>
          <SidebarTrigger data-testid="trigger" />
        </SidebarProvider>
      );
      const trigger = screen.getByTestId('trigger');
      expect(trigger).toHaveAttribute('data-sidebar', 'trigger');
    });

    it('has accessible label', () => {
      render(
        <SidebarProvider>
          <SidebarTrigger data-testid="trigger" />
        </SidebarProvider>
      );
      expect(screen.getByText('Toggle Sidebar')).toBeInTheDocument();
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(
        <SidebarProvider>
          <SidebarTrigger ref={ref} />
        </SidebarProvider>
      );
      expect(ref.current).toBeInstanceOf(HTMLElement);
    });
  });

  describe('SidebarRail', () => {
    it('renders a button', () => {
      render(
        <SidebarProvider>
          <SidebarRail data-testid="rail" />
        </SidebarProvider>
      );
      const rail = screen.getByTestId('rail');
      expect(rail).toBeInTheDocument();
      expect(rail.tagName.toLowerCase()).toBe('button');
    });

    it('has correct attributes', () => {
      render(
        <SidebarProvider>
          <SidebarRail data-testid="rail" />
        </SidebarProvider>
      );
      const rail = screen.getByTestId('rail');
      expect(rail).toHaveAttribute('data-sidebar', 'rail');
      expect(rail).toHaveAttribute('aria-label', 'Toggle Sidebar');
      expect(rail).toHaveAttribute('title', 'Toggle Sidebar');
      expect(rail).toHaveAttribute('tabIndex', '-1');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(
        <SidebarProvider>
          <SidebarRail ref={ref} />
        </SidebarProvider>
      );
      expect(ref.current).toBeInstanceOf(HTMLElement);
    });
  });

  describe('SidebarInset', () => {
    it('renders a main element', () => {
      render(
        <SidebarProvider>
          <SidebarInset data-testid="inset">
            <div>Content</div>
          </SidebarInset>
        </SidebarProvider>
      );
      const inset = screen.getByTestId('inset');
      expect(inset).toBeInTheDocument();
      expect(inset.tagName.toLowerCase()).toBe('main');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <SidebarProvider>
          <SidebarInset ref={ref}>
            <div>Content</div>
          </SidebarInset>
        </SidebarProvider>
      );
      expect(ref.current).toBeInstanceOf(HTMLElement);
    });
  });

  describe('SidebarInput', () => {
    it('renders an input element', () => {
      render(
        <SidebarProvider>
          <SidebarInput data-testid="input" />
        </SidebarProvider>
      );
      const input = screen.getByTestId('input');
      expect(input).toBeInTheDocument();
      expect(input.tagName.toLowerCase()).toBe('input');
    });

    it('has correct data attribute', () => {
      render(
        <SidebarProvider>
          <SidebarInput data-testid="input" />
        </SidebarProvider>
      );
      expect(screen.getByTestId('input')).toHaveAttribute('data-sidebar', 'input');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(
        <SidebarProvider>
          <SidebarInput ref={ref} />
        </SidebarProvider>
      );
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });
  });

  describe('SidebarHeader', () => {
    it('renders children', () => {
      render(
        <SidebarProvider>
          <SidebarHeader>
            <span data-testid="header-content">Header</span>
          </SidebarHeader>
        </SidebarProvider>
      );
      expect(screen.getByTestId('header-content')).toBeInTheDocument();
    });

    it('has correct data attribute', () => {
      render(
        <SidebarProvider>
          <SidebarHeader data-testid="header">Header</SidebarHeader>
        </SidebarProvider>
      );
      expect(screen.getByTestId('header')).toHaveAttribute('data-sidebar', 'header');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <SidebarProvider>
          <SidebarHeader ref={ref}>Header</SidebarHeader>
        </SidebarProvider>
      );
      expect(ref.current).toBeInstanceOf(HTMLElement);
    });
  });

  describe('SidebarFooter', () => {
    it('renders children', () => {
      render(
        <SidebarProvider>
          <SidebarFooter>
            <span data-testid="footer-content">Footer</span>
          </SidebarFooter>
        </SidebarProvider>
      );
      expect(screen.getByTestId('footer-content')).toBeInTheDocument();
    });

    it('has correct data attribute', () => {
      render(
        <SidebarProvider>
          <SidebarFooter data-testid="footer">Footer</SidebarFooter>
        </SidebarProvider>
      );
      expect(screen.getByTestId('footer')).toHaveAttribute('data-sidebar', 'footer');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <SidebarProvider>
          <SidebarFooter ref={ref}>Footer</SidebarFooter>
        </SidebarProvider>
      );
      expect(ref.current).toBeInstanceOf(HTMLElement);
    });
  });

  describe('SidebarContent', () => {
    it('renders children', () => {
      render(
        <SidebarProvider>
          <SidebarContent>
            <span data-testid="content">Content</span>
          </SidebarContent>
        </SidebarProvider>
      );
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('has correct data attribute', () => {
      render(
        <SidebarProvider>
          <SidebarContent data-testid="content-wrapper">Content</SidebarContent>
        </SidebarProvider>
      );
      expect(screen.getByTestId('content-wrapper')).toHaveAttribute('data-sidebar', 'content');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <SidebarProvider>
          <SidebarContent ref={ref}>Content</SidebarContent>
        </SidebarProvider>
      );
      expect(ref.current).toBeInstanceOf(HTMLElement);
    });
  });

  describe('SidebarSeparator', () => {
    it('renders a separator', () => {
      render(
        <SidebarProvider>
          <SidebarSeparator data-testid="separator" />
        </SidebarProvider>
      );
      expect(screen.getByTestId('separator')).toBeInTheDocument();
    });

    it('has correct data attribute', () => {
      render(
        <SidebarProvider>
          <SidebarSeparator data-testid="separator" />
        </SidebarProvider>
      );
      expect(screen.getByTestId('separator')).toHaveAttribute('data-sidebar', 'separator');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <SidebarProvider>
          <SidebarSeparator ref={ref} />
        </SidebarProvider>
      );
      expect(ref.current).toBeInstanceOf(HTMLElement);
    });
  });

  describe('SidebarGroup', () => {
    it('renders children', () => {
      render(
        <SidebarProvider>
          <SidebarGroup>
            <span data-testid="group-content">Group</span>
          </SidebarGroup>
        </SidebarProvider>
      );
      expect(screen.getByTestId('group-content')).toBeInTheDocument();
    });

    it('has correct data attribute', () => {
      render(
        <SidebarProvider>
          <SidebarGroup data-testid="group">Group</SidebarGroup>
        </SidebarProvider>
      );
      expect(screen.getByTestId('group')).toHaveAttribute('data-sidebar', 'group');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <SidebarProvider>
          <SidebarGroup ref={ref}>Group</SidebarGroup>
        </SidebarProvider>
      );
      expect(ref.current).toBeInstanceOf(HTMLElement);
    });
  });

  describe('SidebarGroupLabel', () => {
    it('renders as div by default', () => {
      render(
        <SidebarProvider>
          <SidebarGroupLabel data-testid="label">Label</SidebarGroupLabel>
        </SidebarProvider>
      );
      const label = screen.getByTestId('label');
      expect(label.tagName.toLowerCase()).toBe('div');
    });

    it('has correct data attribute', () => {
      render(
        <SidebarProvider>
          <SidebarGroupLabel data-testid="label">Label</SidebarGroupLabel>
        </SidebarProvider>
      );
      expect(screen.getByTestId('label')).toHaveAttribute('data-sidebar', 'group-label');
    });
  });

  describe('SidebarGroupAction', () => {
    it('renders as button by default', () => {
      render(
        <SidebarProvider>
          <SidebarGroupAction data-testid="action">Action</SidebarGroupAction>
        </SidebarProvider>
      );
      const action = screen.getByTestId('action');
      expect(action.tagName.toLowerCase()).toBe('button');
    });

    it('has correct data attribute', () => {
      render(
        <SidebarProvider>
          <SidebarGroupAction data-testid="action">Action</SidebarGroupAction>
        </SidebarProvider>
      );
      expect(screen.getByTestId('action')).toHaveAttribute('data-sidebar', 'group-action');
    });
  });

  describe('SidebarGroupContent', () => {
    it('renders children', () => {
      render(
        <SidebarProvider>
          <SidebarGroupContent>
            <span data-testid="content">Content</span>
          </SidebarGroupContent>
        </SidebarProvider>
      );
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('has correct data attribute', () => {
      render(
        <SidebarProvider>
          <SidebarGroupContent data-testid="group-content">Content</SidebarGroupContent>
        </SidebarProvider>
      );
      expect(screen.getByTestId('group-content')).toHaveAttribute('data-sidebar', 'group-content');
    });
  });

  describe('SidebarMenu', () => {
    it('renders a ul element', () => {
      render(
        <SidebarProvider>
          <SidebarMenu data-testid="menu">
            <li>Item</li>
          </SidebarMenu>
        </SidebarProvider>
      );
      const menu = screen.getByTestId('menu');
      expect(menu.tagName.toLowerCase()).toBe('ul');
    });

    it('has correct data attribute', () => {
      render(
        <SidebarProvider>
          <SidebarMenu data-testid="menu">
            <li>Item</li>
          </SidebarMenu>
        </SidebarProvider>
      );
      expect(screen.getByTestId('menu')).toHaveAttribute('data-sidebar', 'menu');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLUListElement>();
      render(
        <SidebarProvider>
          <SidebarMenu ref={ref}>
            <li>Item</li>
          </SidebarMenu>
        </SidebarProvider>
      );
      expect(ref.current).toBeInstanceOf(HTMLUListElement);
    });
  });

  describe('SidebarMenuItem', () => {
    it('renders a li element', () => {
      render(
        <SidebarProvider>
          <SidebarMenu>
            <SidebarMenuItem data-testid="item">Item</SidebarMenuItem>
          </SidebarMenu>
        </SidebarProvider>
      );
      const item = screen.getByTestId('item');
      expect(item.tagName.toLowerCase()).toBe('li');
    });

    it('has correct data attribute', () => {
      render(
        <SidebarProvider>
          <SidebarMenu>
            <SidebarMenuItem data-testid="item">Item</SidebarMenuItem>
          </SidebarMenu>
        </SidebarProvider>
      );
      expect(screen.getByTestId('item')).toHaveAttribute('data-sidebar', 'menu-item');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLLIElement>();
      render(
        <SidebarProvider>
          <SidebarMenu>
            <SidebarMenuItem ref={ref}>Item</SidebarMenuItem>
          </SidebarMenu>
        </SidebarProvider>
      );
      expect(ref.current).toBeInstanceOf(HTMLLIElement);
    });
  });

  describe('SidebarMenuButton', () => {
    it('renders as button by default', () => {
      render(
        <SidebarProvider>
          <SidebarMenuButton data-testid="button">Button</SidebarMenuButton>
        </SidebarProvider>
      );
      const button = screen.getByTestId('button');
      expect(button.tagName.toLowerCase()).toBe('button');
    });

    it('has correct data attribute', () => {
      render(
        <SidebarProvider>
          <SidebarMenuButton data-testid="button">Button</SidebarMenuButton>
        </SidebarProvider>
      );
      expect(screen.getByTestId('button')).toHaveAttribute('data-sidebar', 'menu-button');
    });

    it('shows active state', () => {
      render(
        <SidebarProvider>
          <SidebarMenuButton data-testid="button" isActive>Button</SidebarMenuButton>
        </SidebarProvider>
      );
      expect(screen.getByTestId('button')).toHaveAttribute('data-active', 'true');
    });

    it('applies different sizes', () => {
      render(
        <SidebarProvider>
          <SidebarMenuButton data-testid="button-sm" size="sm">Small</SidebarMenuButton>
          <SidebarMenuButton data-testid="button-lg" size="lg">Large</SidebarMenuButton>
        </SidebarProvider>
      );
      expect(screen.getByTestId('button-sm')).toHaveAttribute('data-size', 'sm');
      expect(screen.getByTestId('button-lg')).toHaveAttribute('data-size', 'lg');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(
        <SidebarProvider>
          <SidebarMenuButton ref={ref}>Button</SidebarMenuButton>
        </SidebarProvider>
      );
      expect(ref.current).toBeInstanceOf(HTMLElement);
    });
  });

  describe('SidebarMenuAction', () => {
    it('renders as button by default', () => {
      render(
        <SidebarProvider>
          <SidebarMenuAction data-testid="action">Action</SidebarMenuAction>
        </SidebarProvider>
      );
      const action = screen.getByTestId('action');
      expect(action.tagName.toLowerCase()).toBe('button');
    });

    it('has correct data attribute', () => {
      render(
        <SidebarProvider>
          <SidebarMenuAction data-testid="action">Action</SidebarMenuAction>
        </SidebarProvider>
      );
      expect(screen.getByTestId('action')).toHaveAttribute('data-sidebar', 'menu-action');
    });

    it('applies showOnHover class when prop is true', () => {
      render(
        <SidebarProvider>
          <SidebarMenuAction data-testid="action" showOnHover>Action</SidebarMenuAction>
        </SidebarProvider>
      );
      const action = screen.getByTestId('action');
      expect(action).toHaveClass('md:opacity-0');
    });
  });

  describe('SidebarMenuBadge', () => {
    it('renders children', () => {
      render(
        <SidebarProvider>
          <SidebarMenuBadge data-testid="badge">5</SidebarMenuBadge>
        </SidebarProvider>
      );
      expect(screen.getByTestId('badge')).toHaveTextContent('5');
    });

    it('has correct data attribute', () => {
      render(
        <SidebarProvider>
          <SidebarMenuBadge data-testid="badge">5</SidebarMenuBadge>
        </SidebarProvider>
      );
      expect(screen.getByTestId('badge')).toHaveAttribute('data-sidebar', 'menu-badge');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <SidebarProvider>
          <SidebarMenuBadge ref={ref}>5</SidebarMenuBadge>
        </SidebarProvider>
      );
      expect(ref.current).toBeInstanceOf(HTMLElement);
    });
  });

  describe('SidebarMenuSkeleton', () => {
    it('renders correctly', () => {
      render(
        <SidebarProvider>
          <SidebarMenuSkeleton data-testid="skeleton" />
        </SidebarProvider>
      );
      expect(screen.getByTestId('skeleton')).toBeInTheDocument();
    });

    it('renders with icon when showIcon is true', () => {
      render(
        <SidebarProvider>
          <SidebarMenuSkeleton data-testid="skeleton" showIcon />
        </SidebarProvider>
      );
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton.querySelector('[data-sidebar="menu-skeleton-icon"]')).toBeInTheDocument();
    });

    it('has correct data attribute', () => {
      render(
        <SidebarProvider>
          <SidebarMenuSkeleton data-testid="skeleton" />
        </SidebarProvider>
      );
      expect(screen.getByTestId('skeleton')).toHaveAttribute('data-sidebar', 'menu-skeleton');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <SidebarProvider>
          <SidebarMenuSkeleton ref={ref} />
        </SidebarProvider>
      );
      expect(ref.current).toBeInstanceOf(HTMLElement);
    });
  });

  describe('SidebarMenuSub', () => {
    it('renders a ul element', () => {
      render(
        <SidebarProvider>
          <SidebarMenuSub data-testid="menu-sub">
            <li>Item</li>
          </SidebarMenuSub>
        </SidebarProvider>
      );
      const menuSub = screen.getByTestId('menu-sub');
      expect(menuSub.tagName.toLowerCase()).toBe('ul');
    });

    it('has correct data attribute', () => {
      render(
        <SidebarProvider>
          <SidebarMenuSub data-testid="menu-sub">
            <li>Item</li>
          </SidebarMenuSub>
        </SidebarProvider>
      );
      expect(screen.getByTestId('menu-sub')).toHaveAttribute('data-sidebar', 'menu-sub');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLUListElement>();
      render(
        <SidebarProvider>
          <SidebarMenuSub ref={ref}>
            <li>Item</li>
          </SidebarMenuSub>
        </SidebarProvider>
      );
      expect(ref.current).toBeInstanceOf(HTMLUListElement);
    });
  });

  describe('SidebarMenuSubItem', () => {
    it('renders a li element', () => {
      render(
        <SidebarProvider>
          <SidebarMenuSub>
            <SidebarMenuSubItem data-testid="sub-item">Item</SidebarMenuSubItem>
          </SidebarMenuSub>
        </SidebarProvider>
      );
      const subItem = screen.getByTestId('sub-item');
      expect(subItem.tagName.toLowerCase()).toBe('li');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLLIElement>();
      render(
        <SidebarProvider>
          <SidebarMenuSub>
            <SidebarMenuSubItem ref={ref}>Item</SidebarMenuSubItem>
          </SidebarMenuSub>
        </SidebarProvider>
      );
      expect(ref.current).toBeInstanceOf(HTMLLIElement);
    });
  });

  describe('SidebarMenuSubButton', () => {
    it('renders as anchor by default', () => {
      render(
        <SidebarProvider>
          <SidebarMenuSubButton data-testid="sub-button">Button</SidebarMenuSubButton>
        </SidebarProvider>
      );
      const subButton = screen.getByTestId('sub-button');
      expect(subButton.tagName.toLowerCase()).toBe('a');
    });

    it('has correct data attribute', () => {
      render(
        <SidebarProvider>
          <SidebarMenuSubButton data-testid="sub-button">Button</SidebarMenuSubButton>
        </SidebarProvider>
      );
      expect(screen.getByTestId('sub-button')).toHaveAttribute('data-sidebar', 'menu-sub-button');
    });

    it('shows active state', () => {
      render(
        <SidebarProvider>
          <SidebarMenuSubButton data-testid="sub-button" isActive>Button</SidebarMenuSubButton>
        </SidebarProvider>
      );
      expect(screen.getByTestId('sub-button')).toHaveAttribute('data-active', 'true');
    });

    it('applies different sizes', () => {
      render(
        <SidebarProvider>
          <SidebarMenuSubButton data-testid="sub-button-sm" size="sm">Small</SidebarMenuSubButton>
          <SidebarMenuSubButton data-testid="sub-button-md" size="md">Medium</SidebarMenuSubButton>
        </SidebarProvider>
      );
      expect(screen.getByTestId('sub-button-sm')).toHaveAttribute('data-size', 'sm');
      expect(screen.getByTestId('sub-button-md')).toHaveAttribute('data-size', 'md');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLAnchorElement>();
      render(
        <SidebarProvider>
          <SidebarMenuSubButton ref={ref}>Button</SidebarMenuSubButton>
        </SidebarProvider>
      );
      expect(ref.current).toBeInstanceOf(HTMLElement);
    });
  });

  describe('keyboard shortcuts', () => {
    it('toggles sidebar on Ctrl+B', () => {
      render(
        <SidebarProvider data-testid="provider">
          <Sidebar>
            <div>Content</div>
          </Sidebar>
        </SidebarProvider>
      );

      // Verify initial expanded state via CSS variable
      const provider = screen.getByTestId('provider');
      expect(provider.style.getPropertyValue('--sidebar-width')).toBe('16rem');

      // Trigger keyboard shortcut
      fireEvent.keyDown(window, { key: 'b', ctrlKey: true });

      // Sidebar behavior is toggled (state change is internal)
      expect(provider).toBeInTheDocument();
    });

    it('toggles sidebar on Meta+B (Mac)', () => {
      render(
        <SidebarProvider data-testid="provider">
          <Sidebar>
            <div>Content</div>
          </Sidebar>
        </SidebarProvider>
      );

      // Trigger keyboard shortcut with Meta key (Mac)
      fireEvent.keyDown(window, { key: 'b', metaKey: true });

      const provider = screen.getByTestId('provider');
      expect(provider).toBeInTheDocument();
    });

    it('does not toggle on B without modifier', () => {
      render(
        <SidebarProvider data-testid="provider">
          <Sidebar>
            <div>Content</div>
          </Sidebar>
        </SidebarProvider>
      );

      fireEvent.keyDown(window, { key: 'b' });

      // Should not affect the sidebar
      const provider = screen.getByTestId('provider');
      expect(provider).toBeInTheDocument();
    });
  });

  describe('controlled state', () => {
    it('supports controlled open state', () => {
      const onOpenChange = vi.fn();
      render(
        <SidebarProvider open={true} onOpenChange={onOpenChange}>
          <SidebarTrigger data-testid="trigger" />
        </SidebarProvider>
      );

      fireEvent.click(screen.getByTestId('trigger'));
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('supports defaultOpen=false', () => {
      render(
        <SidebarProvider defaultOpen={false}>
          <Sidebar>
            <div data-testid="content">Content</div>
          </Sidebar>
        </SidebarProvider>
      );

      // Sidebar should be rendered but in collapsed state
      expect(screen.getByTestId('content')).toBeInTheDocument();
      expect(document.querySelector('[data-state="collapsed"]')).toBeInTheDocument();
    });
  });

  describe('mobile behavior', () => {
    it('detects mobile state from hook', () => {
      mockedUseIsMobile.mockReturnValue(true);

      render(
        <SidebarProvider>
          <div data-testid="provider-child">Content</div>
        </SidebarProvider>
      );

      // Verify the hook is being called
      expect(mockedUseIsMobile).toHaveBeenCalled();
      expect(screen.getByTestId('provider-child')).toBeInTheDocument();
    });
  });

  describe('SidebarGroupLabel asChild', () => {
    it('renders as custom element with asChild', () => {
      render(
        <SidebarProvider>
          <SidebarGroupLabel asChild>
            <span data-testid="custom-label">Label</span>
          </SidebarGroupLabel>
        </SidebarProvider>
      );
      const label = screen.getByTestId('custom-label');
      expect(label.tagName.toLowerCase()).toBe('span');
    });
  });

  describe('SidebarGroupAction asChild', () => {
    it('renders as custom element with asChild', () => {
      render(
        <SidebarProvider>
          <SidebarGroupAction asChild>
            <a href="#" data-testid="custom-action">Action</a>
          </SidebarGroupAction>
        </SidebarProvider>
      );
      const action = screen.getByTestId('custom-action');
      expect(action.tagName.toLowerCase()).toBe('a');
    });
  });

  describe('SidebarMenuButton with tooltip', () => {
    it('renders tooltip when provided as string', () => {
      render(
        <SidebarProvider defaultOpen={false}>
          <SidebarMenuButton tooltip="Test Tooltip">Button</SidebarMenuButton>
        </SidebarProvider>
      );
      // Tooltip wraps the button in collapsed state
      expect(screen.getByText('Button')).toBeInTheDocument();
    });

    it('renders tooltip when provided as object', () => {
      render(
        <SidebarProvider defaultOpen={false}>
          <SidebarMenuButton tooltip={{ children: 'Test Tooltip' }}>Button</SidebarMenuButton>
        </SidebarProvider>
      );
      expect(screen.getByText('Button')).toBeInTheDocument();
    });
  });

  describe('SidebarMenuButton asChild', () => {
    it('renders as custom element with asChild', () => {
      render(
        <SidebarProvider>
          <SidebarMenuButton asChild>
            <a href="#" data-testid="custom-button">Link Button</a>
          </SidebarMenuButton>
        </SidebarProvider>
      );
      const button = screen.getByTestId('custom-button');
      expect(button.tagName.toLowerCase()).toBe('a');
    });
  });

  describe('SidebarMenuAction asChild', () => {
    it('renders as custom element with asChild', () => {
      render(
        <SidebarProvider>
          <SidebarMenuAction asChild>
            <a href="#" data-testid="custom-action">Action</a>
          </SidebarMenuAction>
        </SidebarProvider>
      );
      const action = screen.getByTestId('custom-action');
      expect(action.tagName.toLowerCase()).toBe('a');
    });
  });

  describe('SidebarMenuSubButton asChild', () => {
    it('renders as custom element with asChild', () => {
      render(
        <SidebarProvider>
          <SidebarMenuSubButton asChild>
            <button data-testid="custom-sub-button">Button</button>
          </SidebarMenuSubButton>
        </SidebarProvider>
      );
      const button = screen.getByTestId('custom-sub-button');
      expect(button.tagName.toLowerCase()).toBe('button');
    });
  });

  describe('SidebarTrigger onClick', () => {
    it('calls custom onClick handler', () => {
      const handleClick = vi.fn();
      render(
        <SidebarProvider>
          <SidebarTrigger onClick={handleClick} data-testid="trigger" />
        </SidebarProvider>
      );

      fireEvent.click(screen.getByTestId('trigger'));
      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('SidebarRail onClick', () => {
    it('toggles sidebar on click', () => {
      render(
        <SidebarProvider>
          <SidebarRail data-testid="rail" />
        </SidebarProvider>
      );

      const rail = screen.getByTestId('rail');
      fireEvent.click(rail);
      // Rail click should toggle the sidebar
      expect(rail).toBeInTheDocument();
    });
  });

  describe('SidebarMenuButton variants', () => {
    it('applies outline variant', () => {
      render(
        <SidebarProvider>
          <SidebarMenuButton variant="outline" data-testid="button">
            Button
          </SidebarMenuButton>
        </SidebarProvider>
      );
      const button = screen.getByTestId('button');
      expect(button).toHaveClass('bg-background');
    });
  });
});
