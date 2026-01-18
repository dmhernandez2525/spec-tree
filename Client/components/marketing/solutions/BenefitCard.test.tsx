import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BenefitCard } from './BenefitCard';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

import { vi } from 'vitest';

describe('BenefitCard', () => {
  it('renders the title', () => {
    render(
      <BenefitCard
        title="Test Title"
        description="Test Description"
        icon="check"
      />
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders the description', () => {
    render(
      <BenefitCard
        title="Test Title"
        description="Test Description"
        icon="check"
      />
    );

    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders the icon', () => {
    const { container } = render(
      <BenefitCard
        title="Test Title"
        description="Test Description"
        icon="check"
      />
    );

    // Icon should be rendered as an SVG
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <BenefitCard
        title="Test Title"
        description="Test Description"
        icon="check"
        className="custom-class"
      />
    );

    // The Card component should have the custom class
    const card = container.querySelector('.custom-class');
    expect(card).toBeInTheDocument();
  });

  it('renders with different icons', () => {
    const { rerender, container } = render(
      <BenefitCard
        title="Test Title"
        description="Test Description"
        icon="users"
      />
    );

    expect(container.querySelector('svg')).toBeInTheDocument();

    rerender(
      <BenefitCard
        title="Test Title"
        description="Test Description"
        icon="brain"
      />
    );

    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders title with correct styling', () => {
    render(
      <BenefitCard
        title="Styled Title"
        description="Test Description"
        icon="check"
      />
    );

    const title = screen.getByText('Styled Title');
    expect(title).toHaveClass('font-semibold');
    expect(title).toHaveClass('text-lg');
  });

  it('renders description with muted text styling', () => {
    render(
      <BenefitCard
        title="Test Title"
        description="Muted Description"
        icon="check"
      />
    );

    const description = screen.getByText('Muted Description');
    expect(description).toHaveClass('text-muted-foreground');
    expect(description).toHaveClass('text-sm');
  });

  it('renders icon container with background', () => {
    const { container } = render(
      <BenefitCard
        title="Test Title"
        description="Test Description"
        icon="check"
      />
    );

    const iconContainer = container.querySelector('.bg-primary\\/10');
    expect(iconContainer).toBeInTheDocument();
  });
});

describe('BenefitCard exports', () => {
  it('exports BenefitCard as a named export', () => {
    expect(BenefitCard).toBeDefined();
    expect(typeof BenefitCard).toBe('function');
  });
});
