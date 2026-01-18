import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TutorialGrid } from './TutorialGrid';
import { Tutorial } from '@/types/tutorials';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, _variants, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

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
  formatDistanceToNow: () => '3 days ago',
}));

describe('TutorialGrid', () => {
  const mockTutorials: Tutorial[] = [
    {
      id: 'tutorial-1',
      title: 'Getting Started',
      description: 'Learn the basics',
      type: 'tutorial',
      category: 'beginner',
      duration: 15,
      lastUpdated: '2024-01-01',
      thumbnailUrl: '/thumb1.jpg',
      videoUrl: '/video1.mp4',
      chapters: [{ title: 'Introduction', timestamp: '0:00' }],
      author: {
        name: 'John Doe',
        role: 'Developer',
        avatarUrl: '/avatar1.jpg',
      },
    },
    {
      id: 'tutorial-2',
      title: 'Advanced Techniques',
      description: 'Deep dive into features',
      type: 'tutorial',
      category: 'advanced',
      duration: 30,
      lastUpdated: '2024-01-02',
      thumbnailUrl: '/thumb2.jpg',
      videoUrl: '/video2.mp4',
      chapters: [{ title: 'Setup', timestamp: '0:00' }],
      author: {
        name: 'Jane Smith',
        role: 'Tech Lead',
        avatarUrl: '/avatar2.jpg',
      },
    },
  ];

  it('renders all tutorials', () => {
    render(<TutorialGrid tutorials={mockTutorials} />);

    expect(screen.getByText('Getting Started')).toBeInTheDocument();
    expect(screen.getByText('Advanced Techniques')).toBeInTheDocument();
  });

  it('renders tutorial descriptions', () => {
    render(<TutorialGrid tutorials={mockTutorials} />);

    expect(screen.getByText('Learn the basics')).toBeInTheDocument();
    expect(screen.getByText('Deep dive into features')).toBeInTheDocument();
  });

  it('renders tutorial thumbnails', () => {
    render(<TutorialGrid tutorials={mockTutorials} />);

    const images = screen.getAllByRole('img', { name: /Getting Started|Advanced Techniques/ });
    expect(images.length).toBe(2);
  });

  it('renders links with correct href', () => {
    render(<TutorialGrid tutorials={mockTutorials} />);

    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', '/resources/tutorials/tutorial-1');
    expect(links[1]).toHaveAttribute('href', '/resources/tutorials/tutorial-2');
  });

  it('renders category badges', () => {
    render(<TutorialGrid tutorials={mockTutorials} />);

    expect(screen.getByText('beginner')).toBeInTheDocument();
    expect(screen.getByText('advanced')).toBeInTheDocument();
  });

  it('renders tutorial duration', () => {
    render(<TutorialGrid tutorials={mockTutorials} />);

    expect(screen.getByText('15 min')).toBeInTheDocument();
    expect(screen.getByText('30 min')).toBeInTheDocument();
  });

  it('renders author information', () => {
    render(<TutorialGrid tutorials={mockTutorials} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Developer')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Tech Lead')).toBeInTheDocument();
  });

  it('renders author avatars', () => {
    render(<TutorialGrid tutorials={mockTutorials} />);

    const avatarImages = screen.getAllByRole('img', { name: /John Doe|Jane Smith/ });
    expect(avatarImages.length).toBe(2);
  });

  it('renders with empty tutorials array', () => {
    const { container } = render(<TutorialGrid tutorials={[]} />);

    const grid = container.firstChild as HTMLElement;
    expect(grid).toBeInTheDocument();
    expect(grid.children.length).toBe(0);
  });

  it('renders grid with responsive columns', () => {
    const { container } = render(<TutorialGrid tutorials={mockTutorials} />);

    const grid = container.firstChild as HTMLElement;
    expect(grid).toHaveClass('grid');
    expect(grid).toHaveClass('gap-6');
    expect(grid).toHaveClass('md:grid-cols-2');
    expect(grid).toHaveClass('lg:grid-cols-3');
  });

  it('renders tutorial titles with correct styling', () => {
    render(<TutorialGrid tutorials={mockTutorials} />);

    const title = screen.getByText('Getting Started');
    expect(title).toHaveClass('text-xl');
    expect(title).toHaveClass('font-semibold');
  });

  it('renders descriptions with muted styling', () => {
    render(<TutorialGrid tutorials={mockTutorials} />);

    const description = screen.getByText('Learn the basics');
    expect(description).toHaveClass('text-muted-foreground');
  });

  it('renders play icon overlay on hover area', () => {
    const { container } = render(<TutorialGrid tutorials={mockTutorials} />);

    // Should have play icon containers
    const playOverlays = container.querySelectorAll('.group-hover\\:opacity-100');
    expect(playOverlays.length).toBe(2);
  });
});

describe('TutorialGrid exports', () => {
  it('exports TutorialGrid as a named export', () => {
    expect(TutorialGrid).toBeDefined();
    expect(typeof TutorialGrid).toBe('function');
  });
});
