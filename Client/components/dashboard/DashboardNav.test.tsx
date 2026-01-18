import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardNav } from './DashboardNav';

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

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  User: ({ className }: { className?: string }) => (
    <span data-testid="icon-user" className={className}>
      User Icon
    </span>
  ),
  Settings: ({ className }: { className?: string }) => (
    <span data-testid="icon-settings" className={className}>
      Settings Icon
    </span>
  ),
  Bell: ({ className }: { className?: string }) => (
    <span data-testid="icon-bell" className={className}>
      Bell Icon
    </span>
  ),
  Home: ({ className }: { className?: string }) => (
    <span data-testid="icon-home" className={className}>
      Home Icon
    </span>
  ),
}));

describe('DashboardNav', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders navigation element', () => {
    render(<DashboardNav data-testid="dashboard-nav" />);

    const nav = screen.getByTestId('dashboard-nav');
    expect(nav).toBeInTheDocument();
    expect(nav.tagName.toLowerCase()).toBe('nav');
  });

  it('renders default navigation items', () => {
    render(<DashboardNav />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders navigation links with correct hrefs', () => {
    render(<DashboardNav />);

    expect(screen.getByText('Home').closest('a')).toHaveAttribute(
      'href',
      '/user-dashboard'
    );
    expect(screen.getByText('Profile').closest('a')).toHaveAttribute(
      'href',
      '/user-dashboard/profile'
    );
    expect(screen.getByText('Notifications').closest('a')).toHaveAttribute(
      'href',
      '/user-dashboard/notifications'
    );
    expect(screen.getByText('Settings').closest('a')).toHaveAttribute(
      'href',
      '/user-dashboard/settings'
    );
  });

  it('renders icons for navigation items', () => {
    render(<DashboardNav />);

    expect(screen.getByTestId('icon-home')).toBeInTheDocument();
    expect(screen.getByTestId('icon-user')).toBeInTheDocument();
    expect(screen.getByTestId('icon-bell')).toBeInTheDocument();
    expect(screen.getByTestId('icon-settings')).toBeInTheDocument();
  });

  it('accepts custom className', () => {
    render(<DashboardNav className="custom-nav-class" data-testid="nav" />);

    const nav = screen.getByTestId('nav');
    expect(nav).toHaveClass('custom-nav-class');
  });

  it('applies default flex styles', () => {
    render(<DashboardNav data-testid="nav" />);

    const nav = screen.getByTestId('nav');
    expect(nav).toHaveClass('flex');
    expect(nav).toHaveClass('space-x-2');
  });

  it('renders custom items when provided', () => {
    const customItems = [
      { href: '/custom-link', title: 'Custom Link' },
      { href: '/another-link', title: 'Another Link' },
    ];

    render(<DashboardNav items={customItems} />);

    expect(screen.getByText('Custom Link')).toBeInTheDocument();
    expect(screen.getByText('Another Link')).toBeInTheDocument();
    expect(screen.queryByText('Home')).not.toBeInTheDocument();
  });

  it('renders items without icons', () => {
    const itemsWithoutIcons = [{ href: '/no-icon', title: 'No Icon Item' }];

    render(<DashboardNav items={itemsWithoutIcons} />);

    expect(screen.getByText('No Icon Item')).toBeInTheDocument();
  });

  it('renders the correct number of navigation items', () => {
    render(<DashboardNav />);

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(4); // Default items: Home, Profile, Notifications, Settings
  });

  it('passes through additional HTML attributes', () => {
    render(<DashboardNav data-testid="nav" aria-label="Dashboard navigation" />);

    const nav = screen.getByTestId('nav');
    expect(nav).toHaveAttribute('aria-label', 'Dashboard navigation');
  });
});
