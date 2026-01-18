import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SidebarNav } from './SidebarNav';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/user-dashboard'),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

// Mock the scroll-area component directly
vi.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div className={className} data-testid="scroll-area">
      {children}
    </div>
  ),
  ScrollBar: () => <div />,
}));

// Mock the Icons component
vi.mock('@/components/shared/icons', () => ({
  Icons: {
    brain: ({ className }: { className?: string }) => (
      <span data-testid="icon-brain" className={className}>
        Brain
      </span>
    ),
    barChart: ({ className }: { className?: string }) => (
      <span data-testid="icon-bar-chart" className={className}>
        BarChart
      </span>
    ),
    menu: ({ className }: { className?: string }) => (
      <span data-testid="icon-menu" className={className}>
        Menu
      </span>
    ),
    alert: ({ className }: { className?: string }) => (
      <span data-testid="icon-alert" className={className}>
        Alert
      </span>
    ),
    users: ({ className }: { className?: string }) => (
      <span data-testid="icon-users" className={className}>
        Users
      </span>
    ),
    chevronLeft: ({ className }: { className?: string }) => (
      <span data-testid="icon-chevron-left" className={className}>
        ChevronLeft
      </span>
    ),
  },
}));

describe('SidebarNav', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the sidebar', () => {
    render(<SidebarNav />);

    // Should have a scroll area
    expect(screen.getByTestId('scroll-area')).toBeInTheDocument();
  });

  it('renders all navigation links', () => {
    render(<SidebarNav />);

    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Builder')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Support')).toBeInTheDocument();
    expect(screen.getByText('Organization')).toBeInTheDocument();
  });

  it('renders navigation links with correct hrefs', () => {
    render(<SidebarNav />);

    expect(screen.getByText('Overview').closest('a')).toHaveAttribute(
      'href',
      '/user-dashboard'
    );
    expect(screen.getByText('Builder').closest('a')).toHaveAttribute(
      'href',
      '/user-dashboard/spec-tree'
    );
    expect(screen.getByText('Analytics').closest('a')).toHaveAttribute(
      'href',
      '/user-dashboard/analytics'
    );
    expect(screen.getByText('Settings').closest('a')).toHaveAttribute(
      'href',
      '/user-dashboard/settings'
    );
    expect(screen.getByText('Support').closest('a')).toHaveAttribute(
      'href',
      '/user-dashboard/support'
    );
    expect(screen.getByText('Organization').closest('a')).toHaveAttribute(
      'href',
      '/user-dashboard/organization'
    );
  });

  it('renders icons for each navigation item', () => {
    render(<SidebarNav />);

    // brain is used for Overview and Builder
    const brainIcons = screen.getAllByTestId('icon-brain');
    expect(brainIcons).toHaveLength(2);

    expect(screen.getByTestId('icon-bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('icon-menu')).toBeInTheDocument();
    expect(screen.getByTestId('icon-alert')).toBeInTheDocument();
    expect(screen.getByTestId('icon-users')).toBeInTheDocument();
  });

  it('renders collapse/expand toggle button', () => {
    render(<SidebarNav />);

    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toBeInTheDocument();
    expect(screen.getByTestId('icon-chevron-left')).toBeInTheDocument();
  });

  it('toggles collapsed state when button is clicked', async () => {
    const user = userEvent.setup();
    render(<SidebarNav data-testid="sidebar" />);

    // Find the container div
    const sidebar = screen.getByTestId('scroll-area').parentElement;

    // Initially should be expanded (w-[240px])
    expect(sidebar).toHaveClass('w-[240px]');

    // Click toggle button
    const toggleButton = screen.getByRole('button');
    await user.click(toggleButton);

    // Should now be collapsed (w-[52px])
    expect(sidebar).toHaveClass('w-[52px]');
  });

  it('hides link titles when collapsed', async () => {
    const user = userEvent.setup();
    render(<SidebarNav />);

    // Initially titles should be visible
    expect(screen.getByText('Overview')).toBeVisible();

    // Click toggle to collapse
    const toggleButton = screen.getByRole('button');
    await user.click(toggleButton);

    // After collapse, titles should not be rendered (they're conditionally rendered)
    expect(screen.queryByText('Overview')).not.toBeInTheDocument();
  });

  it('accepts custom className', () => {
    render(<SidebarNav className="custom-sidebar-class" />);

    const sidebar = screen.getByTestId('scroll-area').parentElement;
    expect(sidebar).toHaveClass('custom-sidebar-class');
  });

  it('applies border-r styling', () => {
    render(<SidebarNav />);

    const sidebar = screen.getByTestId('scroll-area').parentElement;
    expect(sidebar).toHaveClass('border-r');
  });

  it('applies white background', () => {
    render(<SidebarNav />);

    const sidebar = screen.getByTestId('scroll-area').parentElement;
    expect(sidebar).toHaveClass('bg-white');
  });

  it('renders toggle button with icon that rotates when collapsed', async () => {
    const user = userEvent.setup();
    render(<SidebarNav />);

    const chevron = screen.getByTestId('icon-chevron-left');

    // Initially not rotated
    expect(chevron).not.toHaveClass('rotate-180');

    // Click toggle to collapse
    const toggleButton = screen.getByRole('button');
    await user.click(toggleButton);

    // After collapse, chevron should be rotated
    expect(chevron).toHaveClass('rotate-180');
  });

  it('applies transition styles for smooth animation', () => {
    render(<SidebarNav />);

    const sidebar = screen.getByTestId('scroll-area').parentElement;
    expect(sidebar).toHaveClass('transition-all');
    expect(sidebar).toHaveClass('duration-300');
    expect(sidebar).toHaveClass('ease-in-out');
  });

  it('renders 6 navigation links', () => {
    render(<SidebarNav />);

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(6);
  });
});
