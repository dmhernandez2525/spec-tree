import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeadingSection } from './HeadingSection';

describe('HeadingSection', () => {
  it('renders the heading when provided', () => {
    render(<HeadingSection heading="Test Heading" />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Test Heading')).toBeInTheDocument();
  });

  it('renders the description when provided', () => {
    render(<HeadingSection description="Test Description" />);

    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders both heading and description when provided', () => {
    render(<HeadingSection heading="My Heading" description="My Description" />);

    expect(screen.getByText('My Heading')).toBeInTheDocument();
    expect(screen.getByText('My Description')).toBeInTheDocument();
  });

  it('does not render heading element when heading is not provided', () => {
    render(<HeadingSection description="Only Description" />);

    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
  });

  it('does not render description element when description is not provided', () => {
    const { container } = render(<HeadingSection heading="Only Heading" />);

    expect(screen.getByText('Only Heading')).toBeInTheDocument();
    expect(container.querySelector('p')).not.toBeInTheDocument();
  });

  it('applies center alignment by default', () => {
    const { container } = render(<HeadingSection heading="Centered" />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('text-center');
  });

  it('applies left alignment when specified', () => {
    const { container } = render(<HeadingSection heading="Left Aligned" align="left" />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('text-left');
  });

  it('applies right alignment when specified', () => {
    const { container } = render(<HeadingSection heading="Right Aligned" align="right" />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('text-right');
  });

  it('applies custom className when provided', () => {
    const { container } = render(<HeadingSection heading="Custom" className="custom-class" />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('custom-class');
  });

  it('applies custom textColor to heading when provided', () => {
    render(<HeadingSection heading="Colored" textColor="blue" />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveStyle({ color: 'blue' });
  });

  it('does not apply inline style when textColor is not provided', () => {
    render(<HeadingSection heading="No Color" />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).not.toHaveAttribute('style');
  });

  it('applies base styles to container', () => {
    const { container } = render(<HeadingSection heading="Base" />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('space-y-4');
  });

  it('applies responsive styles to heading', () => {
    render(<HeadingSection heading="Responsive" />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('text-3xl');
    expect(heading).toHaveClass('font-bold');
    expect(heading).toHaveClass('tracking-tighter');
  });

  it('applies styles to description paragraph', () => {
    render(<HeadingSection description="Styled Description" />);

    const description = screen.getByText('Styled Description');
    expect(description).toHaveClass('text-muted-foreground');
    expect(description).toHaveClass('mx-auto');
    expect(description).toHaveClass('max-w-[700px]');
  });
});

describe('HeadingSection exports', () => {
  it('exports HeadingSection as a named export', () => {
    expect(HeadingSection).toBeDefined();
    expect(typeof HeadingSection).toBe('function');
  });
});
