import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResourcesBreadcrumb } from './ResourcesBreadcrumb';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, className, ...props }: { children: React.ReactNode; href: string; className?: string }) => (
    <a href={href} className={className} {...props}>{children}</a>
  ),
}));

describe('ResourcesBreadcrumb', () => {
  const mockItems = [
    { title: 'Resources', href: '/resources' },
    { title: 'Documentation', href: '/resources/documentation' },
  ];

  it('renders the home link', () => {
    render(<ResourcesBreadcrumb items={mockItems} />);

    const homeLink = screen.getByRole('link', { name: '' });
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('renders home icon', () => {
    const { container } = render(<ResourcesBreadcrumb items={mockItems} />);

    // Home icon should be an SVG
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });

  it('renders all breadcrumb items', () => {
    render(<ResourcesBreadcrumb items={mockItems} />);

    expect(screen.getByText('Resources')).toBeInTheDocument();
    expect(screen.getByText('Documentation')).toBeInTheDocument();
  });

  it('renders items as links with correct hrefs', () => {
    render(<ResourcesBreadcrumb items={mockItems} />);

    const resourcesLink = screen.getByRole('link', { name: 'Resources' });
    const documentationLink = screen.getByRole('link', { name: 'Documentation' });

    expect(resourcesLink).toHaveAttribute('href', '/resources');
    expect(documentationLink).toHaveAttribute('href', '/resources/documentation');
  });

  it('renders chevron separators between items', () => {
    const { container } = render(<ResourcesBreadcrumb items={mockItems} />);

    // Should have chevrons (SVGs) for each breadcrumb item
    const svgs = container.querySelectorAll('svg');
    // Home icon + 2 chevrons = at least 3 SVGs
    expect(svgs.length).toBeGreaterThanOrEqual(3);
  });

  it('applies font-medium to the last item', () => {
    render(<ResourcesBreadcrumb items={mockItems} />);

    const lastItem = screen.getByRole('link', { name: 'Documentation' });
    expect(lastItem).toHaveClass('font-medium');
    expect(lastItem).toHaveClass('text-foreground');
  });

  it('does not apply font-medium to non-last items', () => {
    render(<ResourcesBreadcrumb items={mockItems} />);

    const firstItem = screen.getByRole('link', { name: 'Resources' });
    expect(firstItem).not.toHaveClass('font-medium');
  });

  it('renders with single breadcrumb item', () => {
    const singleItem = [{ title: 'Resources', href: '/resources' }];
    render(<ResourcesBreadcrumb items={singleItem} />);

    expect(screen.getByText('Resources')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: 'Resources' });
    expect(link).toHaveClass('font-medium');
  });

  it('renders with empty items array', () => {
    const { container } = render(<ResourcesBreadcrumb items={[]} />);

    const nav = container.querySelector('nav');
    expect(nav).toBeInTheDocument();
    // Should still have home link
    expect(screen.getByRole('link', { name: '' })).toBeInTheDocument();
  });

  it('renders navigation element', () => {
    const { container } = render(<ResourcesBreadcrumb items={mockItems} />);

    const nav = container.querySelector('nav');
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveClass('flex');
    expect(nav).toHaveClass('items-center');
    expect(nav).toHaveClass('space-x-2');
    expect(nav).toHaveClass('text-sm');
    expect(nav).toHaveClass('text-muted-foreground');
  });

  it('renders home link with hover styling', () => {
    render(<ResourcesBreadcrumb items={mockItems} />);

    const homeLink = screen.getByRole('link', { name: '' });
    expect(homeLink).toHaveClass('hover:text-foreground');
  });

  it('renders breadcrumb items with hover styling', () => {
    render(<ResourcesBreadcrumb items={mockItems} />);

    const resourcesLink = screen.getByRole('link', { name: 'Resources' });
    expect(resourcesLink).toHaveClass('hover:text-foreground');
  });
});

describe('ResourcesBreadcrumb exports', () => {
  it('exports ResourcesBreadcrumb as a named export', () => {
    expect(ResourcesBreadcrumb).toBeDefined();
    expect(typeof ResourcesBreadcrumb).toBe('function');
  });
});
