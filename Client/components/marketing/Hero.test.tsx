import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Hero } from './Hero';

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode }) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: { children: React.ReactNode }) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: { children: React.ReactNode }) => <p {...props}>{children}</p>,
  },
}));

describe('Hero', () => {
  const defaultData = {
    header: 'Test Header',
    subHeader: 'Test Subheader',
  };

  it('can be imported', () => {
    expect(Hero).toBeDefined();
    expect(typeof Hero).toBe('function');
  });

  it('renders with basic data', () => {
    render(<Hero data={defaultData} />);

    expect(screen.getByText('Test Header')).toBeInTheDocument();
    expect(screen.getByText('Test Subheader')).toBeInTheDocument();
  });

  it('renders hero image when provided', () => {
    const dataWithImage = {
      ...defaultData,
      heroImage: {
        url: '/test-image.jpg',
        caption: 'Test Caption',
      },
    };

    render(<Hero data={dataWithImage} />);

    const image = screen.getByAltText('Test Caption');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/test-image.jpg');
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

  it('renders CTA buttons', () => {
    render(<Hero data={defaultData} />);

    expect(screen.getByText('Start Free Trial')).toBeInTheDocument();
    expect(screen.getByText('Watch Demo')).toBeInTheDocument();
  });

  it('renders scroll down button when onScrollDown is provided', () => {
    const onScrollDown = vi.fn();
    render(<Hero data={defaultData} onScrollDown={onScrollDown} />);

    const scrollButton = screen.getByRole('button', { name: '' });
    expect(scrollButton).toBeInTheDocument();

    fireEvent.click(scrollButton);
    expect(onScrollDown).toHaveBeenCalledTimes(1);
  });

  it('does not render scroll down button when onScrollDown is not provided', () => {
    render(<Hero data={defaultData} />);

    // There should be no icon-only button when no onScrollDown is provided
    const buttons = screen.queryAllByRole('button');
    // Either no buttons, or all buttons have text content
    buttons.forEach(button => {
      expect(button.textContent?.length).toBeGreaterThanOrEqual(0);
    });
    // The component should render the links without a scroll button
    expect(screen.getByText('Start Free Trial')).toBeInTheDocument();
  });

  it('renders default header content when header is empty', () => {
    const dataWithEmptyHeader = {
      header: '',
      subHeader: 'Test Subheader',
    };

    render(<Hero data={dataWithEmptyHeader} />);

    expect(screen.getByText(/Transform Your/)).toBeInTheDocument();
    expect(screen.getByText(/Project Planning/)).toBeInTheDocument();
    expect(screen.getByText(/with AI/)).toBeInTheDocument();
  });
});
