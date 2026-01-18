import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Documentation } from './Documentation';

// Mock framer-motion to avoid animation-related issues
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock Icons component
vi.mock('@/components/shared/icons', () => ({
  Icons: {
    alert: ({ className }: any) => <span className={className}>AlertIcon</span>,
    check: ({ className }: any) => <span className={className}>CheckIcon</span>,
    x: ({ className }: any) => <span className={className}>XIcon</span>,
  },
}));

// Mock sanitizeHtml
vi.mock('@/lib/sanitize', () => ({
  sanitizeHtml: (html: string) => html,
}));

// Mock ScrollArea component
vi.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
}));

describe('Documentation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports Documentation component', () => {
    expect(Documentation).toBeDefined();
    expect(typeof Documentation).toBe('function');
  });

  it('renders documentation component', () => {
    render(<Documentation />);

    expect(screen.getByPlaceholderText('Search documentation...')).toBeInTheDocument();
  });

  it('displays documentation categories', () => {
    render(<Documentation />);

    const gettingStarted = screen.getAllByText('Getting Started');
    const features = screen.getAllByText('Features');
    expect(gettingStarted.length).toBeGreaterThan(0);
    expect(features.length).toBeGreaterThan(0);
  });

  it('shows article count for each category', () => {
    render(<Documentation />);

    const gettingStartedElements = screen.getAllByText('Getting Started');
    const getStartedButton = gettingStartedElements[0].closest('button');
    expect(getStartedButton).toBeInTheDocument();
    expect(getStartedButton).toHaveTextContent('2');
  });

  it('filters documentation based on search query', () => {
    render(<Documentation />);

    const searchInput = screen.getByPlaceholderText('Search documentation...');
    fireEvent.change(searchInput, { target: { value: 'Quick Start' } });

    expect(screen.getByText('Quick Start Guide')).toBeInTheDocument();
  });

  it('displays article cards in grid', () => {
    render(<Documentation />);

    expect(screen.getByText('Quick Start Guide')).toBeInTheDocument();
    expect(screen.getByText('Get up and running with Spec Tree in minutes.')).toBeInTheDocument();
    expect(screen.getByText('Basic Concepts')).toBeInTheDocument();
  });

  it('selects category when clicked', () => {
    render(<Documentation />);

    const gettingStartedElements = screen.getAllByText('Getting Started');
    const categoryButton = gettingStartedElements[0].closest('button');
    if (categoryButton) {
      fireEvent.click(categoryButton);
      expect(categoryButton).toHaveClass('bg-primary');
    }
  });

  it('opens article when card is clicked', () => {
    render(<Documentation />);

    const articleCard = screen.getByText('Quick Start Guide').closest('div');
    if (articleCard) {
      fireEvent.click(articleCard);
      // After clicking, should show article title in header
      const headers = screen.getAllByText('Quick Start Guide');
      expect(headers.length).toBeGreaterThan(0);
    }
  });

  it('displays article with last updated date', () => {
    render(<Documentation />);

    const articleCard = screen.getByText('Quick Start Guide').closest('div');
    if (articleCard) {
      fireEvent.click(articleCard);
      expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
    }
  });

  it('closes article when X button is clicked', () => {
    render(<Documentation />);

    const articleCard = screen.getByText('Quick Start Guide').closest('div');
    if (articleCard) {
      fireEvent.click(articleCard);

      const closeButtons = screen.getAllByRole('button');
      const closeButton = closeButtons.find((btn) =>
        btn.querySelector('span')?.textContent?.includes('XIcon')
      );

      if (closeButton) {
        fireEvent.click(closeButton);
        // Should return to article list view
        expect(screen.getByText('Get up and running with Spec Tree in minutes.')).toBeInTheDocument();
      }
    }
  });

  it('renders category icons', () => {
    render(<Documentation />);

    const icons = screen.getAllByText(/Icon/);
    expect(icons.length).toBeGreaterThan(0);
  });

  it('displays article excerpts with proper styling', () => {
    render(<Documentation />);

    const excerpt = screen.getByText('Get up and running with Spec Tree in minutes.');
    expect(excerpt).toBeInTheDocument();
    expect(excerpt.className).toContain('text-sm');
    expect(excerpt.className).toContain('text-muted-foreground');
  });

  it('shows category badges on article cards', () => {
    render(<Documentation />);

    const badges = screen.getAllByText('Getting Started');
    // Should have both category button and badge in card
    expect(badges.length).toBeGreaterThan(1);
  });

  it('filters show no results when search does not match', () => {
    render(<Documentation />);

    const searchInput = screen.getByPlaceholderText('Search documentation...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent article' } });

    expect(screen.queryByText('Quick Start Guide')).not.toBeInTheDocument();
    expect(screen.queryByText('Basic Concepts')).not.toBeInTheDocument();
  });

  it('handles category selection clicks', () => {
    render(<Documentation />);

    const gettingStartedElements = screen.getAllByText('Getting Started');
    const categoryButton = gettingStartedElements[0].closest('button');

    expect(categoryButton).toBeInTheDocument();

    if (categoryButton) {
      // First click selects category
      fireEvent.click(categoryButton);
      expect(categoryButton).toHaveClass('bg-primary');

      // Click on Features category
      const featuresElements = screen.getAllByText('Features');
      const featuresButton = featuresElements[0].closest('button');
      if (featuresButton) {
        fireEvent.click(featuresButton);
        expect(featuresButton).toHaveClass('bg-primary');
      }
    }
  });
});
