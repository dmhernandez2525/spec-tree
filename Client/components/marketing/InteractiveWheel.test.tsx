import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Hero } from './InteractiveWheel';

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

describe('InteractiveWheel Hero', () => {
  const defaultData = {
    header: 'Test Wheel Header',
    subHeader: 'Test Wheel Subheader',
  };

  it('can be imported', () => {
    expect(Hero).toBeDefined();
    expect(typeof Hero).toBe('function');
  });

  it('renders with basic data', () => {
    render(<Hero data={defaultData} />);

    expect(screen.getByText('Test Wheel Header')).toBeInTheDocument();
    expect(screen.getByText('Test Wheel Subheader')).toBeInTheDocument();
  });

  it('renders hero image when provided', () => {
    const dataWithImage = {
      ...defaultData,
      heroImage: {
        url: '/test-wheel-image.jpg',
        caption: 'Wheel Image Caption',
      },
    };

    render(<Hero data={dataWithImage} />);

    const image = screen.getByAltText('Wheel Image Caption');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/test-wheel-image.jpg');
  });

  it('uses default alt text for hero image without caption', () => {
    const dataWithImage = {
      ...defaultData,
      heroImage: {
        url: '/test-image.jpg',
      },
    };

    render(<Hero data={dataWithImage} />);

    const image = screen.getByAltText('Hero background');
    expect(image).toBeInTheDocument();
  });

  it('renders scroll down button when onScrollDown is provided', () => {
    const onScrollDown = vi.fn();
    render(<Hero data={defaultData} onScrollDown={onScrollDown} />);

    // Find the button with the ChevronDown icon
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(onScrollDown).toHaveBeenCalledTimes(1);
  });

  it('does not render scroll down button when onScrollDown is not provided', () => {
    render(<Hero data={defaultData} />);

    const buttons = screen.queryAllByRole('button');
    expect(buttons).toHaveLength(0);
  });

  it('applies correct container classes', () => {
    const { container } = render(<Hero data={defaultData} />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('relative');
    expect(wrapper).toHaveClass('min-h-[516px]');
    expect(wrapper).toHaveClass('bg-secondary');
  });
});
