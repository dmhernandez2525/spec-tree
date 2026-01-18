import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResourceDetail } from './ResourceDetail';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  formatDistanceToNow: () => '5 days ago',
}));

// Mock Section component
vi.mock('@/components/layout/Section', () => ({
  default: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <section className={className}>{children}</section>
  ),
}));

describe('ResourceDetail', () => {
  const defaultProps = {
    title: 'Test Resource',
    description: 'Test Description',
    content: 'Test Content',
    type: 'documentation',
    readTime: 10,
    lastUpdated: '2024-01-01',
    category: 'getting-started',
    relatedResources: [
      { id: '1', title: 'Related 1', href: '/resources/1' },
      { id: '2', title: 'Related 2', href: '/resources/2' },
    ],
  };

  it('renders the title', () => {
    render(<ResourceDetail {...defaultProps} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Test Resource' })).toBeInTheDocument();
  });

  it('renders the description', () => {
    render(<ResourceDetail {...defaultProps} />);

    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders the back to resources button', () => {
    render(<ResourceDetail {...defaultProps} />);

    const backLink = screen.getByRole('link', { name: /Back to Resources/i });
    expect(backLink).toHaveAttribute('href', '/resources');
  });

  it('renders the resource type badge', () => {
    render(<ResourceDetail {...defaultProps} />);

    expect(screen.getByText('documentation')).toBeInTheDocument();
  });

  it('renders the read time', () => {
    render(<ResourceDetail {...defaultProps} />);

    expect(screen.getByText('10 min read')).toBeInTheDocument();
  });

  it('renders the last updated date', () => {
    render(<ResourceDetail {...defaultProps} />);

    expect(screen.getByText(/Updated/)).toBeInTheDocument();
  });

  it('renders related resources section', () => {
    render(<ResourceDetail {...defaultProps} />);

    expect(screen.getByRole('heading', { level: 2, name: 'Related Resources' })).toBeInTheDocument();
  });

  it('renders all related resources', () => {
    render(<ResourceDetail {...defaultProps} />);

    expect(screen.getByText('Related 1')).toBeInTheDocument();
    expect(screen.getByText('Related 2')).toBeInTheDocument();
  });

  it('renders related resources as links', () => {
    render(<ResourceDetail {...defaultProps} />);

    const relatedLink1 = screen.getByRole('link', { name: 'Related 1' });
    const relatedLink2 = screen.getByRole('link', { name: 'Related 2' });

    expect(relatedLink1).toHaveAttribute('href', '/resources/1');
    expect(relatedLink2).toHaveAttribute('href', '/resources/2');
  });

  it('formats type with hyphen replaced by space', () => {
    render(<ResourceDetail {...defaultProps} type="api-reference" />);

    expect(screen.getByText('api reference')).toBeInTheDocument();
  });

  it('renders with empty related resources', () => {
    render(<ResourceDetail {...defaultProps} relatedResources={[]} />);

    expect(screen.getByRole('heading', { level: 2, name: 'Related Resources' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Related 1' })).not.toBeInTheDocument();
  });

  it('renders title with correct styling', () => {
    render(<ResourceDetail {...defaultProps} />);

    const title = screen.getByRole('heading', { level: 1, name: 'Test Resource' });
    expect(title).toHaveClass('text-4xl');
    expect(title).toHaveClass('font-bold');
  });

  it('renders description with correct styling', () => {
    render(<ResourceDetail {...defaultProps} />);

    const description = screen.getByText('Test Description');
    expect(description).toHaveClass('text-xl');
    expect(description).toHaveClass('text-muted-foreground');
  });

  it('renders back button with ghost variant', () => {
    const { container } = render(<ResourceDetail {...defaultProps} />);

    // Find the button wrapper that contains "Back to Resources"
    const backButton = container.querySelector('.mb-8');
    expect(backButton).toBeInTheDocument();
  });

  it('renders arrow icon in back button', () => {
    const { container } = render(<ResourceDetail {...defaultProps} />);

    // Back button should have an SVG icon
    const backLink = screen.getByRole('link', { name: /Back to Resources/i });
    const svg = backLink.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});

describe('ResourceDetail exports', () => {
  it('exports ResourceDetail as a named export', () => {
    expect(ResourceDetail).toBeDefined();
    expect(typeof ResourceDetail).toBe('function');
  });
});
