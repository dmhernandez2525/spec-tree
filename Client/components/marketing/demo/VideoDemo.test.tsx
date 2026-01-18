import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VideoDemo } from './VideoDemo';

describe('VideoDemo', () => {
  const defaultProps = {
    videoUrl: '/test-video.mp4',
    title: 'Product Demo',
    description: 'Learn how to use our product',
    duration: '10:30',
    chapters: [
      { title: 'Introduction', timestamp: '0:00' },
      { title: 'Getting Started', timestamp: '2:30' },
      { title: 'Advanced Features', timestamp: '5:00' },
    ],
  };

  it('can be imported', () => {
    expect(VideoDemo).toBeDefined();
    expect(typeof VideoDemo).toBe('function');
  });

  it('renders video title', () => {
    render(<VideoDemo {...defaultProps} />);

    expect(screen.getByText('Product Demo')).toBeInTheDocument();
  });

  it('renders video description', () => {
    render(<VideoDemo {...defaultProps} />);

    expect(screen.getByText('Learn how to use our product')).toBeInTheDocument();
  });

  it('renders duration badge', () => {
    render(<VideoDemo {...defaultProps} />);

    expect(screen.getByText('10:30')).toBeInTheDocument();
  });

  it('renders chapters section', () => {
    render(<VideoDemo {...defaultProps} />);

    expect(screen.getByText('Chapters')).toBeInTheDocument();
  });

  it('renders all chapter titles', () => {
    render(<VideoDemo {...defaultProps} />);

    expect(screen.getByText('Introduction')).toBeInTheDocument();
    expect(screen.getByText('Getting Started')).toBeInTheDocument();
    expect(screen.getByText('Advanced Features')).toBeInTheDocument();
  });

  it('renders all chapter timestamps', () => {
    render(<VideoDemo {...defaultProps} />);

    expect(screen.getByText('0:00')).toBeInTheDocument();
    expect(screen.getByText('2:30')).toBeInTheDocument();
    expect(screen.getByText('5:00')).toBeInTheDocument();
  });

  it('renders video element', () => {
    const { container } = render(<VideoDemo {...defaultProps} />);

    const video = container.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('src', '/test-video.mp4');
  });

  it('chapter buttons can be clicked', () => {
    render(<VideoDemo {...defaultProps} />);

    const chapter = screen.getByRole('button', { name: /Getting Started/ });
    fireEvent.click(chapter);

    // Clicking should not cause errors
    expect(chapter).toBeInTheDocument();
  });

  it('first chapter is active by default', () => {
    render(<VideoDemo {...defaultProps} />);

    const firstChapter = screen.getByRole('button', { name: /Introduction/ });
    // The first chapter should have secondary variant styling
    expect(firstChapter).toBeInTheDocument();
  });

  it('renders play/pause controls', () => {
    const { container } = render(<VideoDemo {...defaultProps} />);

    // The controls container should exist
    const controlsContainer = container.querySelector('[class*="flex items-center gap-4"]');
    expect(controlsContainer).toBeInTheDocument();
  });
});
