import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResourceGrid } from './ResourceGrid';
import { Resource } from '@/types/resources';

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  formatDistanceToNow: () => '2 days ago',
}));

describe('ResourceGrid', () => {
  const mockResources: Resource[] = [
    {
      id: '1',
      title: 'Resource 1',
      description: 'Description 1',
      type: 'documentation',
      category: 'getting-started',
      readTime: 5,
      lastUpdated: '2024-01-01',
      imageUrl: '/image1.jpg',
      href: '/resources/1',
    },
    {
      id: '2',
      title: 'Resource 2',
      description: 'Description 2',
      type: 'guide',
      category: 'advanced',
      readTime: 10,
      lastUpdated: '2024-01-02',
      imageUrl: '/image2.jpg',
      href: '/resources/2',
    },
  ];

  it('renders all resources', () => {
    render(<ResourceGrid resources={mockResources} />);

    expect(screen.getByText('Resource 1')).toBeInTheDocument();
    expect(screen.getByText('Resource 2')).toBeInTheDocument();
  });

  it('renders resource descriptions', () => {
    render(<ResourceGrid resources={mockResources} />);

    expect(screen.getByText('Description 1')).toBeInTheDocument();
    expect(screen.getByText('Description 2')).toBeInTheDocument();
  });

  it('renders resource images', () => {
    render(<ResourceGrid resources={mockResources} />);

    const images = screen.getAllByRole('img');
    expect(images.length).toBe(2);
    expect(images[0]).toHaveAttribute('src', '/image1.jpg');
    expect(images[1]).toHaveAttribute('src', '/image2.jpg');
  });

  it('renders links with correct href', () => {
    render(<ResourceGrid resources={mockResources} />);

    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', '/resources/1');
    expect(links[1]).toHaveAttribute('href', '/resources/2');
  });

  it('renders resource type badges', () => {
    render(<ResourceGrid resources={mockResources} />);

    expect(screen.getByText('documentation')).toBeInTheDocument();
    expect(screen.getByText('guide')).toBeInTheDocument();
  });

  it('renders read time for each resource', () => {
    render(<ResourceGrid resources={mockResources} />);

    expect(screen.getByText('5 min read')).toBeInTheDocument();
    expect(screen.getByText('10 min read')).toBeInTheDocument();
  });

  it('renders last updated date', () => {
    render(<ResourceGrid resources={mockResources} />);

    // Should show formatted date distance
    const updatedElements = screen.getAllByText(/Updated/);
    expect(updatedElements.length).toBe(2);
  });

  it('renders with empty resources array', () => {
    const { container } = render(<ResourceGrid resources={[]} />);

    const grid = container.firstChild as HTMLElement;
    expect(grid).toBeInTheDocument();
    expect(grid.children.length).toBe(0);
  });

  it('renders grid with responsive columns', () => {
    const { container } = render(<ResourceGrid resources={mockResources} />);

    const grid = container.firstChild as HTMLElement;
    expect(grid).toHaveClass('grid');
    expect(grid).toHaveClass('gap-6');
    expect(grid).toHaveClass('md:grid-cols-2');
    expect(grid).toHaveClass('lg:grid-cols-3');
  });

  it('renders resource titles with correct styling', () => {
    render(<ResourceGrid resources={mockResources} />);

    const title = screen.getByText('Resource 1');
    expect(title).toHaveClass('text-xl');
    expect(title).toHaveClass('font-semibold');
  });

  it('renders descriptions with muted styling', () => {
    render(<ResourceGrid resources={mockResources} />);

    const description = screen.getByText('Description 1');
    expect(description).toHaveClass('text-muted-foreground');
  });

  it('formats type with hyphen replaced by space', () => {
    const resourceWithHyphenType: Resource[] = [
      {
        ...mockResources[0],
        type: 'api-reference',
      },
    ];
    render(<ResourceGrid resources={resourceWithHyphenType} />);

    expect(screen.getByText('api reference')).toBeInTheDocument();
  });
});

describe('ResourceGrid exports', () => {
  it('exports ResourceGrid as a named export', () => {
    expect(ResourceGrid).toBeDefined();
    expect(typeof ResourceGrid).toBe('function');
  });
});
