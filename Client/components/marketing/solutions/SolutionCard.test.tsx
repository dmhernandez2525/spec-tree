import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SolutionCard from './SolutionCard';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
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

describe('SolutionCard', () => {
  const defaultProps = {
    title: 'Test Solution',
    description: 'Test Description',
    imageUrl: '/test-image.jpg',
    href: '/solutions/test',
    features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4'],
    type: 'industry' as const,
  };

  it('renders the title', () => {
    render(<SolutionCard {...defaultProps} />);

    expect(screen.getByText('Test Solution')).toBeInTheDocument();
  });

  it('renders the description', () => {
    render(<SolutionCard {...defaultProps} />);

    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders the image with correct src and alt', () => {
    render(<SolutionCard {...defaultProps} />);

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', '/test-image.jpg');
    expect(image).toHaveAttribute('alt', 'Test Solution');
  });

  it('renders as a link with correct href', () => {
    render(<SolutionCard {...defaultProps} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/solutions/test');
  });

  it('renders Industry badge for industry type', () => {
    render(<SolutionCard {...defaultProps} type="industry" />);

    expect(screen.getByText('Industry')).toBeInTheDocument();
  });

  it('renders Role badge for role type', () => {
    render(<SolutionCard {...defaultProps} type="role" />);

    expect(screen.getByText('Role')).toBeInTheDocument();
  });

  it('renders only first 3 features', () => {
    render(<SolutionCard {...defaultProps} />);

    expect(screen.getByText('Feature 1')).toBeInTheDocument();
    expect(screen.getByText('Feature 2')).toBeInTheDocument();
    expect(screen.getByText('Feature 3')).toBeInTheDocument();
    expect(screen.queryByText('Feature 4')).not.toBeInTheDocument();
  });

  it('renders check icons for each feature', () => {
    const { container } = render(<SolutionCard {...defaultProps} />);

    // Each feature should have a check icon (SVG)
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(3);
  });

  it('renders with fewer than 3 features', () => {
    render(<SolutionCard {...defaultProps} features={['Only Feature']} />);

    expect(screen.getByText('Only Feature')).toBeInTheDocument();
    expect(screen.queryByText('Feature 2')).not.toBeInTheDocument();
  });

  it('renders with empty features array', () => {
    render(<SolutionCard {...defaultProps} features={[]} />);

    expect(screen.getByText('Test Solution')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <SolutionCard {...defaultProps} className="custom-class" />
    );

    const wrapper = container.querySelector('.custom-class');
    expect(wrapper).toBeInTheDocument();
  });

  it('renders title with correct styling', () => {
    render(<SolutionCard {...defaultProps} />);

    const title = screen.getByText('Test Solution');
    expect(title).toHaveClass('text-xl');
    expect(title).toHaveClass('font-bold');
  });

  it('renders description with muted styling', () => {
    render(<SolutionCard {...defaultProps} />);

    const description = screen.getByText('Test Description');
    expect(description).toHaveClass('text-muted-foreground');
  });

  it('renders feature text with correct styling', () => {
    render(<SolutionCard {...defaultProps} />);

    const feature = screen.getByText('Feature 1');
    expect(feature).toHaveClass('text-sm');
    expect(feature).toHaveClass('text-muted-foreground');
  });
});

describe('SolutionCard exports', () => {
  it('exports SolutionCard as default export', () => {
    expect(SolutionCard).toBeDefined();
    expect(typeof SolutionCard).toBe('function');
  });
});
