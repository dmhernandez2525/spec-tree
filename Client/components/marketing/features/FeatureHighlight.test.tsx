import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeatureHighlight } from './FeatureHighlight';

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock icons
vi.mock('@/components/shared/icons', () => ({
  Icons: {
    check: ({ className }: { className?: string }) => (
      <svg data-testid="icon-check" className={className} />
    ),
  },
}));

describe('FeatureHighlight', () => {
  const defaultProps = {
    title: 'Amazing Feature',
    description: 'This feature does amazing things',
    image: '/feature-image.jpg',
    features: ['Feature point 1', 'Feature point 2', 'Feature point 3'],
  };

  it('can be imported', () => {
    expect(FeatureHighlight).toBeDefined();
    expect(typeof FeatureHighlight).toBe('function');
  });

  it('renders title', () => {
    render(<FeatureHighlight {...defaultProps} />);

    expect(screen.getByText('Amazing Feature')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<FeatureHighlight {...defaultProps} />);

    expect(screen.getByText('This feature does amazing things')).toBeInTheDocument();
  });

  it('renders image with correct alt text', () => {
    render(<FeatureHighlight {...defaultProps} />);

    const image = screen.getByAltText('Amazing Feature');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/feature-image.jpg');
  });

  it('renders all feature points', () => {
    render(<FeatureHighlight {...defaultProps} />);

    expect(screen.getByText('Feature point 1')).toBeInTheDocument();
    expect(screen.getByText('Feature point 2')).toBeInTheDocument();
    expect(screen.getByText('Feature point 3')).toBeInTheDocument();
  });

  it('renders check icons for each feature', () => {
    render(<FeatureHighlight {...defaultProps} />);

    const checkIcons = screen.getAllByTestId('icon-check');
    expect(checkIcons).toHaveLength(3);
  });

  it('renders image on left by default', () => {
    const { container } = render(<FeatureHighlight {...defaultProps} />);

    const imageContainer = container.querySelector('.relative.aspect-square');
    expect(imageContainer).not.toHaveClass('lg:order-last');
  });

  it('renders image on right when imageLeft is false', () => {
    const { container } = render(<FeatureHighlight {...defaultProps} imageLeft={false} />);

    const imageContainer = container.querySelector('.relative.aspect-square');
    expect(imageContainer).toHaveClass('lg:order-last');
  });

  it('renders in a grid layout', () => {
    const { container } = render(<FeatureHighlight {...defaultProps} />);

    const grid = container.querySelector('.grid');
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveClass('lg:grid-cols-2');
  });
});
