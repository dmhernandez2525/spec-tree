import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StreamingText, StreamingTextCard } from './StreamingText';

describe('StreamingText', () => {
  describe('basic rendering', () => {
    it('renders text', () => {
      render(<StreamingText text="Hello World" />);

      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('shows placeholder when empty', () => {
      render(<StreamingText text="" />);

      expect(screen.getByText('Waiting for response...')).toBeInTheDocument();
    });

    it('shows custom placeholder', () => {
      render(<StreamingText text="" placeholder="Custom placeholder" />);

      expect(screen.getByText('Custom placeholder')).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('shows loading indicator when loading', () => {
      render(<StreamingText text="" isLoading />);

      expect(screen.getByText('Connecting...')).toBeInTheDocument();
    });

    it('hides text while loading', () => {
      render(<StreamingText text="Some text" isLoading />);

      expect(screen.queryByText('Some text')).not.toBeInTheDocument();
    });
  });

  describe('streaming state', () => {
    it('shows cursor when streaming', () => {
      const { container } = render(<StreamingText text="Hello" isStreaming />);

      // Cursor is a span with animate-pulse class
      const cursor = container.querySelector('.animate-pulse');
      expect(cursor).toBeInTheDocument();
    });

    it('hides cursor when not streaming', () => {
      const { container } = render(<StreamingText text="Hello" isStreaming={false} />);

      const cursor = container.querySelector('.animate-pulse');
      expect(cursor).not.toBeInTheDocument();
    });

    it('respects showCursor prop', () => {
      const { container } = render(
        <StreamingText text="Hello" isStreaming showCursor={false} />
      );

      const cursor = container.querySelector('.animate-pulse');
      expect(cursor).not.toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('applies className to container', () => {
      const { container } = render(
        <StreamingText text="Hello" className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('applies textClassName to text', () => {
      render(<StreamingText text="Hello" textClassName="text-lg" />);

      const text = screen.getByText('Hello');
      expect(text).toHaveClass('text-lg');
    });
  });
});

describe('StreamingTextCard', () => {
  it('renders with default title', () => {
    render(<StreamingTextCard text="Hello" />);

    expect(screen.getByText('Response')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    render(<StreamingTextCard text="Hello" title="Custom Title" />);

    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('shows word count', () => {
    render(<StreamingTextCard text="Hello world test" />);

    expect(screen.getByText('3 words')).toBeInTheDocument();
  });

  it('shows character count', () => {
    render(<StreamingTextCard text="Hello" />);

    expect(screen.getByText('5 chars')).toBeInTheDocument();
  });

  it('shows duration', () => {
    render(<StreamingTextCard text="Hello" duration={1500} />);

    expect(screen.getByText('1.5s')).toBeInTheDocument();
  });

  it('hides stats when showStats is false', () => {
    render(<StreamingTextCard text="Hello world" showStats={false} />);

    expect(screen.queryByText(/words/)).not.toBeInTheDocument();
    expect(screen.queryByText(/chars/)).not.toBeInTheDocument();
  });

  it('does not show stats for empty text', () => {
    render(<StreamingTextCard text="" />);

    expect(screen.queryByText(/words/)).not.toBeInTheDocument();
    expect(screen.queryByText(/chars/)).not.toBeInTheDocument();
  });
});
