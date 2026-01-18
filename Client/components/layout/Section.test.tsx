import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Section from './Section';

describe('Section', () => {
  it('renders children correctly', () => {
    render(<Section>Test Content</Section>);

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders as section element', () => {
    const { container } = render(<Section>Content</Section>);

    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
    expect(section?.tagName.toLowerCase()).toBe('section');
  });

  it('applies default background class', () => {
    const { container } = render(<Section>Content</Section>);

    const section = container.querySelector('section');
    expect(section).toHaveClass('bg-background');
  });

  it('applies muted background class', () => {
    const { container } = render(<Section background="muted">Content</Section>);

    const section = container.querySelector('section');
    expect(section).toHaveClass('bg-muted');
    expect(section).not.toHaveClass('bg-background');
  });

  it('applies primary background class', () => {
    const { container } = render(<Section background="primary">Content</Section>);

    const section = container.querySelector('section');
    expect(section).toHaveClass('bg-primary');
    expect(section).toHaveClass('text-primary-foreground');
    expect(section).not.toHaveClass('bg-background');
  });

  it('applies full width class', () => {
    const { container } = render(<Section>Content</Section>);

    const section = container.querySelector('section');
    expect(section).toHaveClass('w-full');
  });

  it('accepts custom className', () => {
    const { container } = render(<Section className="custom-section-class">Content</Section>);

    const section = container.querySelector('section');
    expect(section).toHaveClass('custom-section-class');
    expect(section).toHaveClass('bg-background');
  });

  it('uses default containerSize of wide', () => {
    render(<Section>Content</Section>);

    const containerDiv = screen.getByText('Content');
    expect(containerDiv).toHaveClass('container-wide');
  });

  it('applies narrow containerSize', () => {
    render(<Section containerSize="narrow">Content</Section>);

    const containerDiv = screen.getByText('Content');
    expect(containerDiv).toHaveClass('container-narrow');
  });

  it('applies default containerSize', () => {
    render(<Section containerSize="default">Content</Section>);

    const containerDiv = screen.getByText('Content');
    expect(containerDiv).toHaveClass('container');
  });

  it('applies full containerSize', () => {
    render(<Section containerSize="full">Content</Section>);

    const containerDiv = screen.getByText('Content');
    expect(containerDiv).toHaveClass('container-full');
  });

  it('applies containerClassName to Container', () => {
    render(<Section containerClassName="custom-container-class">Content</Section>);

    const containerDiv = screen.getByText('Content');
    expect(containerDiv).toHaveClass('custom-container-class');
  });

  it('combines section className and containerClassName', () => {
    const { container } = render(
      <Section className="section-class" containerClassName="container-class">
        Content
      </Section>
    );

    const section = container.querySelector('section');
    const containerDiv = screen.getByText('Content');

    expect(section).toHaveClass('section-class');
    expect(containerDiv).toHaveClass('container-class');
  });

  it('renders multiple children', () => {
    render(
      <Section>
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </Section>
    );

    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
    expect(screen.getByText('Child 3')).toBeInTheDocument();
  });

  it('renders complex children with proper nesting', () => {
    render(
      <Section>
        <h1>Section Title</h1>
        <p>Section paragraph</p>
        <div>
          <span>Nested content</span>
        </div>
      </Section>
    );

    expect(screen.getByText('Section Title')).toBeInTheDocument();
    expect(screen.getByText('Section paragraph')).toBeInTheDocument();
    expect(screen.getByText('Nested content')).toBeInTheDocument();
  });

  it('combines all props correctly', () => {
    const { container } = render(
      <Section
        className="my-section"
        containerClassName="my-container"
        containerSize="narrow"
        background="primary"
      >
        Content
      </Section>
    );

    const section = container.querySelector('section');
    const containerDiv = screen.getByText('Content');

    expect(section).toHaveClass('my-section');
    expect(section).toHaveClass('bg-primary');
    expect(section).toHaveClass('text-primary-foreground');
    expect(containerDiv).toHaveClass('my-container');
    expect(containerDiv).toHaveClass('container-narrow');
  });

  it('applies background variants correctly', () => {
    const { container, rerender } = render(<Section background="default">Content</Section>);
    let section = container.querySelector('section');
    expect(section).toHaveClass('bg-background');

    rerender(<Section background="muted">Content</Section>);
    section = container.querySelector('section');
    expect(section).toHaveClass('bg-muted');

    rerender(<Section background="primary">Content</Section>);
    section = container.querySelector('section');
    expect(section).toHaveClass('bg-primary');
    expect(section).toHaveClass('text-primary-foreground');
  });
});
