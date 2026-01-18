import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResourcesHeader } from './ResourcesHeader';

describe('ResourcesHeader', () => {
  it('renders the title', () => {
    render(<ResourcesHeader title="Test Title" description="Test Description" />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders the description', () => {
    render(<ResourcesHeader title="Test Title" description="Test Description" />);

    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders HeadingSection with left alignment', () => {
    const { container } = render(<ResourcesHeader title="Test Title" description="Test Description" />);

    // HeadingSection should have left alignment
    const headingSection = container.querySelector('.text-left');
    expect(headingSection).toBeInTheDocument();
  });

  it('renders separator', () => {
    const { container } = render(<ResourcesHeader title="Test Title" description="Test Description" />);

    // Separator should be rendered (typically has role="none" or similar)
    const separator = container.querySelector('[data-orientation]') || container.querySelector('hr');
    // The Separator component uses data-orientation attribute
    expect(separator || container.querySelector('.bg-border')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ResourcesHeader title="Test" description="Test" className="custom-class" />
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('custom-class');
  });

  it('applies default space-y-4 styling', () => {
    const { container } = render(<ResourcesHeader title="Test" description="Test" />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('space-y-4');
  });

  it('renders title as heading', () => {
    render(<ResourcesHeader title="Heading Title" description="Test Description" />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Heading Title');
  });

  it('renders description in paragraph', () => {
    render(<ResourcesHeader title="Test" description="Paragraph Description" />);

    const paragraph = screen.getByText('Paragraph Description');
    expect(paragraph.tagName.toLowerCase()).toBe('p');
  });

  it('merges custom className with default styles', () => {
    const { container } = render(
      <ResourcesHeader title="Test" description="Test" className="mt-10" />
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('space-y-4');
    expect(wrapper).toHaveClass('mt-10');
  });
});

describe('ResourcesHeader exports', () => {
  it('exports ResourcesHeader as a named export', () => {
    expect(ResourcesHeader).toBeDefined();
    expect(typeof ResourcesHeader).toBe('function');
  });
});
