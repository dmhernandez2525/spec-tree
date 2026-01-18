import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BlogPost } from './BlogPost';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn((date: Date) => date.toISOString().split('T')[0]),
}));

// Mock marked
vi.mock('marked', () => ({
  marked: vi.fn((content: string) => `<p>${content}</p>`),
}));

// Mock sanitize
vi.mock('@/lib/sanitize', () => ({
  sanitizeHtml: vi.fn((content: string) => content),
}));

// Mock LoadingSpinner
vi.mock('@/components/shared/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

// Mock CommentSection
vi.mock('@/components/marketing/blog/CommentSection', () => ({
  CommentSection: ({ postId }: { postId: number }) => (
    <div data-testid="comment-section">Comments for post {postId}</div>
  ),
}));

describe('BlogPost', () => {
  const mockPost = {
    id: 1,
    documentId: 'test-doc-id',
    title: 'Test Blog Post',
    description: 'This is a test blog post description',
    entireBlogPage: '# Test Content\n\nThis is the blog content.',
    updatedAt: '2024-01-15T10:00:00.000Z',
    category: { name: 'Technology' },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('can be imported', () => {
    expect(BlogPost).toBeDefined();
    expect(typeof BlogPost).toBe('function');
  });

  it('renders blog post not found when post is null', () => {
    // @ts-expect-error - testing null case
    render(<BlogPost post={null} />);

    expect(screen.getByText('Blog post not found.')).toBeInTheDocument();
  });

  it('renders blog post title', () => {
    render(<BlogPost post={mockPost} />);

    expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
  });

  it('renders blog post description', () => {
    render(<BlogPost post={mockPost} />);

    expect(screen.getByText('This is a test blog post description')).toBeInTheDocument();
  });

  it('renders back to blog button', () => {
    render(<BlogPost post={mockPost} />);

    expect(screen.getByRole('button', { name: /Back to Blog/i })).toBeInTheDocument();
  });

  it('navigates to blog page when back button is clicked', () => {
    render(<BlogPost post={mockPost} />);

    const backButton = screen.getByRole('button', { name: /Back to Blog/i });
    fireEvent.click(backButton);

    expect(mockPush).toHaveBeenCalledWith('/blog');
  });

  it('renders category badge when category exists', () => {
    render(<BlogPost post={mockPost} />);

    expect(screen.getByText('Technology')).toBeInTheDocument();
  });

  it('renders date badge', () => {
    render(<BlogPost post={mockPost} />);

    // Since we mocked date-fns format to return ISO date
    expect(screen.getByText('2024-01-15')).toBeInTheDocument();
  });

  it('renders comment section', () => {
    render(<BlogPost post={mockPost} />);

    expect(screen.getByTestId('comment-section')).toBeInTheDocument();
    expect(screen.getByText('Comments for post 1')).toBeInTheDocument();
  });

  it('renders blog content from markdown', () => {
    render(<BlogPost post={mockPost} />);

    // The mocked marked function wraps content in <p> tags
    const contentDiv = document.querySelector('.prose');
    expect(contentDiv).toBeInTheDocument();
  });

  it('handles post without category', () => {
    const postWithoutCategory = {
      ...mockPost,
      category: undefined,
    };

    render(<BlogPost post={postWithoutCategory} />);

    expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
    // Should not crash without category
  });
});
