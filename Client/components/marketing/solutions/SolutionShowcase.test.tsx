import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SolutionShowcase } from './SolutionShowcase';

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

describe('SolutionShowcase', () => {
  const defaultProps = {
    title: 'Test Showcase',
    description: 'Test showcase description',
    features: [
      { title: 'Feature 1', description: 'Feature 1 description' },
      { title: 'Feature 2', description: 'Feature 2 description' },
    ],
    image: '/test-showcase.jpg',
  };

  it('renders the title', () => {
    render(<SolutionShowcase {...defaultProps} />);

    expect(screen.getByText('Test Showcase')).toBeInTheDocument();
  });

  it('renders the description', () => {
    render(<SolutionShowcase {...defaultProps} />);

    expect(screen.getByText('Test showcase description')).toBeInTheDocument();
  });

  it('renders the image with correct src and alt', () => {
    render(<SolutionShowcase {...defaultProps} />);

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', '/test-showcase.jpg');
    expect(image).toHaveAttribute('alt', 'Test Showcase');
  });

  it('renders all features', () => {
    render(<SolutionShowcase {...defaultProps} />);

    expect(screen.getByText('Feature 1')).toBeInTheDocument();
    expect(screen.getByText('Feature 1 description')).toBeInTheDocument();
    expect(screen.getByText('Feature 2')).toBeInTheDocument();
    expect(screen.getByText('Feature 2 description')).toBeInTheDocument();
  });

  it('renders with imageLeft true by default', () => {
    const { container } = render(<SolutionShowcase {...defaultProps} />);

    const imageContainer = container.querySelector('.aspect-video');
    expect(imageContainer).not.toHaveClass('lg:order-last');
  });

  it('renders with image on right when imageLeft is false', () => {
    const { container } = render(<SolutionShowcase {...defaultProps} imageLeft={false} />);

    const imageContainer = container.querySelector('.aspect-video');
    expect(imageContainer).toHaveClass('lg:order-last');
  });

  it('renders title with correct styling', () => {
    render(<SolutionShowcase {...defaultProps} />);

    const title = screen.getByRole('heading', { level: 2, name: 'Test Showcase' });
    expect(title).toHaveClass('text-3xl');
    expect(title).toHaveClass('font-bold');
  });

  it('renders description with muted styling', () => {
    render(<SolutionShowcase {...defaultProps} />);

    const description = screen.getByText('Test showcase description');
    expect(description).toHaveClass('text-muted-foreground');
    expect(description).toHaveClass('text-lg');
  });

  it('renders feature titles as h3 elements', () => {
    render(<SolutionShowcase {...defaultProps} />);

    const featureTitle = screen.getByText('Feature 1');
    expect(featureTitle.tagName.toLowerCase()).toBe('h3');
    expect(featureTitle).toHaveClass('font-semibold');
  });

  it('renders feature descriptions with muted styling', () => {
    render(<SolutionShowcase {...defaultProps} />);

    const featureDescription = screen.getByText('Feature 1 description');
    expect(featureDescription).toHaveClass('text-muted-foreground');
  });

  it('renders with empty features array', () => {
    render(<SolutionShowcase {...defaultProps} features={[]} />);

    expect(screen.getByText('Test Showcase')).toBeInTheDocument();
    expect(screen.queryByText('Feature 1')).not.toBeInTheDocument();
  });

  it('renders grid layout', () => {
    const { container } = render(<SolutionShowcase {...defaultProps} />);

    const grid = container.firstChild as HTMLElement;
    expect(grid).toHaveClass('grid');
    expect(grid).toHaveClass('gap-12');
    expect(grid).toHaveClass('lg:grid-cols-2');
  });

  it('renders features in a grid with gap', () => {
    const { container } = render(<SolutionShowcase {...defaultProps} />);

    const featuresGrid = container.querySelector('.grid.gap-6');
    expect(featuresGrid).toBeInTheDocument();
  });
});

describe('SolutionShowcase exports', () => {
  it('exports SolutionShowcase as a named export', () => {
    expect(SolutionShowcase).toBeDefined();
    expect(typeof SolutionShowcase).toBe('function');
  });
});
