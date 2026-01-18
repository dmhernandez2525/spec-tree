import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Container from './Container';

describe('Container', () => {
  it('renders children correctly', () => {
    render(<Container>Test Content</Container>);

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders as div by default', () => {
    render(<Container>Content</Container>);

    const container = screen.getByText('Content');
    expect(container.tagName.toLowerCase()).toBe('div');
  });

  it('applies default size class', () => {
    render(<Container>Content</Container>);

    const container = screen.getByText('Content');
    expect(container).toHaveClass('container');
  });

  it('applies narrow size class', () => {
    render(<Container size="narrow">Content</Container>);

    const container = screen.getByText('Content');
    expect(container).toHaveClass('container-narrow');
    expect(container).not.toHaveClass('container');
  });

  it('applies wide size class', () => {
    render(<Container size="wide">Content</Container>);

    const container = screen.getByText('Content');
    expect(container).toHaveClass('container-wide');
    expect(container).not.toHaveClass('container');
  });

  it('applies full size class', () => {
    render(<Container size="full">Content</Container>);

    const container = screen.getByText('Content');
    expect(container).toHaveClass('container-full');
    expect(container).not.toHaveClass('container');
  });

  it('accepts custom className', () => {
    render(<Container className="custom-class">Content</Container>);

    const container = screen.getByText('Content');
    expect(container).toHaveClass('custom-class');
    expect(container).toHaveClass('container');
  });

  it('renders as custom element when as prop is provided', () => {
    render(<Container as="section">Content</Container>);

    const container = screen.getByText('Content');
    expect(container.tagName.toLowerCase()).toBe('section');
  });

  it('renders as article element', () => {
    render(<Container as="article">Content</Container>);

    const container = screen.getByText('Content');
    expect(container.tagName.toLowerCase()).toBe('article');
  });

  it('renders as main element', () => {
    render(<Container as="main">Content</Container>);

    const container = screen.getByText('Content');
    expect(container.tagName.toLowerCase()).toBe('main');
  });

  it('combines size and className correctly', () => {
    render(
      <Container size="narrow" className="my-custom-class">
        Content
      </Container>
    );

    const container = screen.getByText('Content');
    expect(container).toHaveClass('container-narrow');
    expect(container).toHaveClass('my-custom-class');
  });

  it('renders multiple children', () => {
    render(
      <Container>
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </Container>
    );

    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
    expect(screen.getByText('Child 3')).toBeInTheDocument();
  });

  it('renders complex children', () => {
    render(
      <Container>
        <div>
          <h1>Title</h1>
          <p>Paragraph text</p>
        </div>
      </Container>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Paragraph text')).toBeInTheDocument();
  });

  it('applies all size variants correctly', () => {
    const { rerender } = render(<Container size="default">Content</Container>);
    expect(screen.getByText('Content')).toHaveClass('container');

    rerender(<Container size="narrow">Content</Container>);
    expect(screen.getByText('Content')).toHaveClass('container-narrow');

    rerender(<Container size="wide">Content</Container>);
    expect(screen.getByText('Content')).toHaveClass('container-wide');

    rerender(<Container size="full">Content</Container>);
    expect(screen.getByText('Content')).toHaveClass('container-full');
  });
});
