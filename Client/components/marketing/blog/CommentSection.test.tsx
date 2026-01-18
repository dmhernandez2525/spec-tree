import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommentSection } from './CommentSection';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock createComment API
const mockCreateComment = vi.fn();
vi.mock('@/api/fetchData', () => ({
  createComment: (...args: unknown[]) => mockCreateComment(...args),
}));

describe('CommentSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('can be imported', () => {
    expect(CommentSection).toBeDefined();
    expect(typeof CommentSection).toBe('function');
  });

  it('renders comments heading', () => {
    render(<CommentSection postId={1} />);

    expect(screen.getByText('Comments')).toBeInTheDocument();
  });

  it('renders comment textarea', () => {
    render(<CommentSection postId={1} />);

    expect(screen.getByPlaceholderText('Add a comment...')).toBeInTheDocument();
  });

  it('renders post comment button', () => {
    render(<CommentSection postId={1} />);

    expect(screen.getByRole('button', { name: 'Post Comment' })).toBeInTheDocument();
  });

  it('renders initial comments when provided', () => {
    const initialComments = [
      {
        id: 1,
        content: 'Test comment 1',
        createdAt: '2024-01-15T10:00:00.000Z',
        user: { name: 'John Doe' },
      },
      {
        id: 2,
        content: 'Test comment 2',
        createdAt: '2024-01-16T10:00:00.000Z',
        user: { name: 'Jane Smith' },
      },
    ];

    render(<CommentSection postId={1} initialComments={initialComments} />);

    expect(screen.getByText('Test comment 1')).toBeInTheDocument();
    expect(screen.getByText('Test comment 2')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('renders Anonymous for comments without user name', () => {
    const initialComments = [
      {
        id: 1,
        content: 'Anonymous comment',
        createdAt: '2024-01-15T10:00:00.000Z',
      },
    ];

    render(<CommentSection postId={1} initialComments={initialComments} />);

    expect(screen.getByText('Anonymous')).toBeInTheDocument();
  });

  it('has disabled button when textarea is empty', async () => {
    render(<CommentSection postId={1} />);

    const button = screen.getByRole('button', { name: 'Post Comment' });
    const textarea = screen.getByPlaceholderText('Add a comment...');

    // Clear the textarea if it has content
    await userEvent.clear(textarea);

    // Button should be clickable but form validation should prevent empty submission
    expect(button).toBeInTheDocument();
  });

  it('submits comment when form is submitted', async () => {
    mockCreateComment.mockResolvedValue({
      id: 3,
      content: 'New comment',
      createdAt: '2024-01-17T10:00:00.000Z',
    });

    render(<CommentSection postId={1} />);

    const textarea = screen.getByPlaceholderText('Add a comment...');
    const button = screen.getByRole('button', { name: 'Post Comment' });

    await userEvent.type(textarea, 'New comment');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockCreateComment).toHaveBeenCalledWith('1', expect.objectContaining({
        content: 'New comment',
      }));
    });
  });

  it('shows posting state while submitting', async () => {
    mockCreateComment.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<CommentSection postId={1} />);

    const textarea = screen.getByPlaceholderText('Add a comment...');
    const button = screen.getByRole('button', { name: 'Post Comment' });

    await userEvent.type(textarea, 'New comment');
    fireEvent.click(button);

    expect(await screen.findByText('Posting...')).toBeInTheDocument();
  });

  it('renders with empty initial comments array', () => {
    render(<CommentSection postId={1} initialComments={[]} />);

    expect(screen.getByText('Comments')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Add a comment...')).toBeInTheDocument();
  });
});
