import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TestimonialCard } from './TestimonialCard';

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

describe('TestimonialCard', () => {
  const defaultProps = {
    quote: 'This is a great product!',
    author: 'John Doe',
    role: 'CEO',
    company: 'Test Company',
    image: '/avatar.jpg',
  };

  it('renders the quote', () => {
    render(<TestimonialCard {...defaultProps} />);

    expect(screen.getByText('This is a great product!')).toBeInTheDocument();
  });

  it('renders the author name', () => {
    render(<TestimonialCard {...defaultProps} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders the role', () => {
    render(<TestimonialCard {...defaultProps} />);

    expect(screen.getByText('CEO')).toBeInTheDocument();
  });

  it('renders the company', () => {
    render(<TestimonialCard {...defaultProps} />);

    expect(screen.getByText('Test Company')).toBeInTheDocument();
  });

  it('renders the author image with correct src and alt', () => {
    render(<TestimonialCard {...defaultProps} />);

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', '/avatar.jpg');
    expect(image).toHaveAttribute('alt', 'John Doe');
  });

  it('renders quote icon', () => {
    const { container } = render(<TestimonialCard {...defaultProps} />);

    // Quote icon should be rendered as an SVG
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders author name with correct styling', () => {
    render(<TestimonialCard {...defaultProps} />);

    const authorName = screen.getByText('John Doe');
    expect(authorName).toHaveClass('font-semibold');
  });

  it('renders role with muted styling', () => {
    render(<TestimonialCard {...defaultProps} />);

    const role = screen.getByText('CEO');
    expect(role).toHaveClass('text-sm');
    expect(role).toHaveClass('text-muted-foreground');
  });

  it('renders company with muted styling', () => {
    render(<TestimonialCard {...defaultProps} />);

    const company = screen.getByText('Test Company');
    expect(company).toHaveClass('text-sm');
    expect(company).toHaveClass('text-muted-foreground');
  });

  it('renders quote with correct styling', () => {
    render(<TestimonialCard {...defaultProps} />);

    const quote = screen.getByText('This is a great product!');
    expect(quote).toHaveClass('text-lg');
  });

  it('renders avatar container with rounded styling', () => {
    const { container } = render(<TestimonialCard {...defaultProps} />);

    const avatarContainer = container.querySelector('.rounded-full');
    expect(avatarContainer).toBeInTheDocument();
    expect(avatarContainer).toHaveClass('overflow-hidden');
    expect(avatarContainer).toHaveClass('h-12');
    expect(avatarContainer).toHaveClass('w-12');
  });

  it('renders with long quote text', () => {
    const longQuote = 'This is a very long testimonial quote that spans multiple lines and contains a lot of text to test how the component handles lengthy content.';
    render(<TestimonialCard {...defaultProps} quote={longQuote} />);

    expect(screen.getByText(longQuote)).toBeInTheDocument();
  });

  it('renders with special characters in content', () => {
    render(
      <TestimonialCard
        {...defaultProps}
        quote="Great product! It's amazing & helpful."
        author="Jane O'Brien"
        company="Smith & Associates"
      />
    );

    expect(screen.getByText("Great product! It's amazing & helpful.")).toBeInTheDocument();
    expect(screen.getByText("Jane O'Brien")).toBeInTheDocument();
    expect(screen.getByText('Smith & Associates')).toBeInTheDocument();
  });
});

describe('TestimonialCard exports', () => {
  it('exports TestimonialCard as a named export', () => {
    expect(TestimonialCard).toBeDefined();
    expect(typeof TestimonialCard).toBe('function');
  });
});
