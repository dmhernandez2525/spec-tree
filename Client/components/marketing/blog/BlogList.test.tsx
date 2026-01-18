import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BlogList } from './BlogList';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn((date: Date) => date.toISOString().split('T')[0]),
}));

// Mock LoadingSpinner
vi.mock('@/components/shared/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

// Mock fetchPosts API
const mockFetchPosts = vi.fn();
vi.mock('@/api/fetchData', () => ({
  fetchPosts: () => mockFetchPosts(),
}));

describe('BlogList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('can be imported', () => {
    expect(BlogList).toBeDefined();
    expect(typeof BlogList).toBe('function');
  });

  it('shows loading spinner initially and empty state when no posts', async () => {
    mockFetchPosts.mockResolvedValue({ data: [] });

    render(<BlogList />);

    // Wait for the fetch to complete
    await waitFor(() => {
      expect(screen.getByText('No Blog Posts Yet')).toBeInTheDocument();
    });

    expect(
      screen.getByText('Check back soon for exciting new content!')
    ).toBeInTheDocument();
  });

  it('renders error message when fetch fails', async () => {
    mockFetchPosts.mockRejectedValue(new Error('Failed to fetch'));

    render(<BlogList />);

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to fetch')).toBeInTheDocument();
    });
  });

  it('renders blog posts when available', async () => {
    const mockPosts = [
      {
        documentId: '1',
        id: 1,
        title: 'Test Post 1',
        description: 'Test description 1',
        updatedAt: '2024-01-01T00:00:00.000Z',
        headerImage: { url: '/test-image-1.jpg' },
        category: { name: 'Technology' },
      },
      {
        documentId: '2',
        id: 2,
        title: 'Test Post 2',
        description: 'Test description 2',
        updatedAt: '2024-01-02T00:00:00.000Z',
        category: { name: 'Business' },
      },
    ];

    mockFetchPosts.mockResolvedValue({ data: mockPosts });

    render(<BlogList />);

    await waitFor(() => {
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
    });

    expect(screen.getByText('Test Post 2')).toBeInTheDocument();
    expect(screen.getByText('Test description 1')).toBeInTheDocument();
    expect(screen.getByText('Test description 2')).toBeInTheDocument();
  });

  it('renders category badges when categories exist', async () => {
    const mockPosts = [
      {
        documentId: '1',
        id: 1,
        title: 'Test Post',
        description: 'Test description',
        updatedAt: '2024-01-01T00:00:00.000Z',
        category: { name: 'Technology' },
      },
    ];

    mockFetchPosts.mockResolvedValue({ data: mockPosts });

    render(<BlogList />);

    await waitFor(() => {
      expect(screen.getByText('Technology')).toBeInTheDocument();
    });
  });

  it('renders empty state image', async () => {
    mockFetchPosts.mockResolvedValue({ data: [] });

    render(<BlogList />);

    await waitFor(() => {
      expect(screen.getByAltText('No blog posts')).toBeInTheDocument();
    });
  });
});
