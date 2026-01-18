import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MainNav } from './MainNav';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/'),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  })),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    className,
    legacyBehavior,
    _passHref,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
    legacyBehavior?: boolean;
    _passHref?: boolean;
  }) => {
    if (legacyBehavior) {
      return <>{children}</>;
    }
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  },
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    _height,
    _width,
    className,
  }: {
    src: any;
    alt: string;
    _height?: number;
    _width?: number;
    className?: string;
  }) => <img src={typeof src === 'string' ? src : 'mocked-image'} alt={alt} className={className} />,
}));

// Mock Redux hooks
vi.mock('@/lib/hooks/use-store', () => ({
  useAppSelector: vi.fn(() => null),
}));

// Mock Redux
vi.mock('react-redux', () => ({
  useDispatch: vi.fn(() => vi.fn()),
}));

// Mock icons
vi.mock('@/components/shared/icons', () => ({
  Icons: {
    menu: ({ className }: { className?: string }) => (
      <span data-testid="icon-menu" className={className}>
        Menu
      </span>
    ),
    chevronDown: ({ className }: { className?: string }) => (
      <span data-testid="icon-chevron-down" className={className}>
        ChevronDown
      </span>
    ),
  },
}));

// Mock Section component
vi.mock('@/components/layout/Section', () => ({
  default: ({
    children,
    className,
    containerClassName,
  }: {
    children: React.ReactNode;
    className?: string;
    containerClassName?: string;
  }) => (
    <div className={`${className} ${containerClassName}`} data-testid="section">
      {children}
    </div>
  ),
}));

// Mock navigation routes
vi.mock('./navigationRoutes', () => ({
  routes: [
    {
      title: 'About',
      href: '/about',
      children: [
        {
          title: 'About Us',
          href: '/about',
          description: 'Learn more about our company',
        },
      ],
    },
    {
      title: 'Pricing',
      href: '/pricing',
    },
    {
      title: 'Contact',
      href: '/contact',
    },
  ],
}));

// Mock UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    _variant,
    _size,
    asChild,
    className,
    onClick,
  }: {
    children: React.ReactNode;
    _variant?: string;
    _size?: string;
    asChild?: boolean;
    className?: string;
    onClick?: () => void;
  }) => {
    if (asChild) {
      return <>{children}</>;
    }
    return (
      <button className={className} onClick={onClick}>
        {children}
      </button>
    );
  },
}));

vi.mock('@/components/ui/navigation-menu', () => ({
  NavigationMenu: ({ children }: { children: React.ReactNode }) => <nav>{children}</nav>,
  NavigationMenuList: ({ children }: { children: React.ReactNode }) => <ul>{children}</ul>,
  NavigationMenuItem: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
  NavigationMenuTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  NavigationMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  NavigationMenuLink: ({
    children,
    className,
    asChild,
  }: {
    children: React.ReactNode;
    className?: string;
    asChild?: boolean;
  }) => {
    if (asChild) {
      return <>{children}</>;
    }
    return <span className={className}>{children}</span>;
  },
}));

vi.mock('@/components/ui/sheet', () => ({
  Sheet: ({ children, open }: { children: React.ReactNode; open?: boolean }) => (
    <div data-testid="sheet">{open ? children : null}</div>
  ),
  SheetTrigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => {
    if (asChild) {
      return <>{children}</>;
    }
    return <div>{children}</div>;
  },
  SheetContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => {
    if (asChild) {
      return <>{children}</>;
    }
    return <div>{children}</div>;
  },
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({
    children,
    asChild,
    onClick,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
    onClick?: () => void;
  }) => {
    if (asChild) {
      return <>{children}</>;
    }
    return <div onClick={onClick}>{children}</div>;
  },
  DropdownMenuSeparator: () => <hr />,
}));

// Import the mocked module - vi.mock is hoisted so this gets the mock
import { useAppSelector } from '@/lib/hooks/use-store';

// Cast to mock for type safety
const mockUseAppSelector = useAppSelector as ReturnType<typeof vi.fn>;

describe('MainNav', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAppSelector.mockReturnValue(null);
  });

  it('renders header element', () => {
    render(<MainNav />);

    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
    expect(header.tagName.toLowerCase()).toBe('header');
  });

  it('applies fixed positioning classes', () => {
    render(<MainNav />);

    const header = screen.getByRole('banner');
    expect(header).toHaveClass('fixed');
    expect(header).toHaveClass('top-0');
    expect(header).toHaveClass('z-50');
    expect(header).toHaveClass('w-full');
  });

  it('applies border and background classes', () => {
    render(<MainNav />);

    const header = screen.getByRole('banner');
    expect(header).toHaveClass('border-b');
    expect(header).toHaveClass('bg-background/95');
    expect(header).toHaveClass('backdrop-blur');
  });

  it('renders logo image', () => {
    render(<MainNav />);

    const logo = screen.getByAltText('Spec Tree Logo');
    expect(logo).toBeInTheDocument();
  });

  it('renders logo text', () => {
    render(<MainNav />);

    expect(screen.getByText('Spec Tree')).toBeInTheDocument();
  });

  it('renders logo link to home', () => {
    render(<MainNav />);

    const logoLink = screen.getByText('Spec Tree').closest('a');
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('renders navigation menu for desktop', () => {
    render(<MainNav />);

    const navs = screen.getAllByRole('navigation');
    expect(navs.length).toBeGreaterThan(0);
  });

  it('renders Sign In button when not authenticated', () => {
    mockUseAppSelector.mockReturnValue(null);

    render(<MainNav />);

    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('renders Get Started button when not authenticated', () => {
    mockUseAppSelector.mockReturnValue(null);

    render(<MainNav />);

    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });

  it('renders user menu when authenticated', () => {
    mockUseAppSelector.mockReturnValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    });

    render(<MainNav />);

    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('displays user initials from firstName', () => {
    mockUseAppSelector.mockReturnValue({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
    });

    render(<MainNav />);

    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('displays email initial when firstName is missing', () => {
    mockUseAppSelector.mockReturnValue({
      email: 'test@example.com',
    });

    render(<MainNav />);

    expect(screen.getByText('t')).toBeInTheDocument();
  });

  it('renders user name in dropdown', () => {
    mockUseAppSelector.mockReturnValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    });

    render(<MainNav />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders user email in dropdown', () => {
    mockUseAppSelector.mockReturnValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    });

    render(<MainNav />);

    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('renders Dashboard link in user dropdown', () => {
    mockUseAppSelector.mockReturnValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    });

    render(<MainNav />);

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveAttribute('href', '/user-dashboard');
  });

  it('renders Profile link in user dropdown', () => {
    mockUseAppSelector.mockReturnValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    });

    render(<MainNav />);

    const profileLink = screen.getByText('Profile').closest('a');
    expect(profileLink).toHaveAttribute('href', '/user-dashboard/profile');
  });

  it('renders Settings link in user dropdown', () => {
    mockUseAppSelector.mockReturnValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    });

    render(<MainNav />);

    const settingsLink = screen.getByText('Settings').closest('a');
    expect(settingsLink).toHaveAttribute('href', '/user-dashboard/settings');
  });

  it('renders Sign out button in user dropdown', () => {
    mockUseAppSelector.mockReturnValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    });

    render(<MainNav />);

    expect(screen.getByText('Sign out')).toBeInTheDocument();
  });

  it('renders Sign out as clickable element', () => {
    mockUseAppSelector.mockReturnValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    });

    render(<MainNav />);

    const signOutButton = screen.getByText('Sign out');
    expect(signOutButton).toBeInTheDocument();
  });

  it('renders mobile menu trigger button', () => {
    render(<MainNav />);

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('renders navigation routes', () => {
    render(<MainNav />);

    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Pricing')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('renders sheet component for mobile menu', () => {
    render(<MainNav />);

    const sheet = screen.getByTestId('sheet');
    expect(sheet).toBeInTheDocument();
  });

  it('applies shadow to header', () => {
    render(<MainNav />);

    const header = screen.getByRole('banner');
    expect(header).toHaveClass('shadow-sm');
  });
});
