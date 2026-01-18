import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Benefits } from './Benefits';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode }) => <div {...props}>{children}</div>,
  },
}));

// Mock components
vi.mock('@/components/shared/HeadingSection', () => ({
  HeadingSection: ({ heading, description }: { heading: string; description: string }) => (
    <div data-testid="heading-section">
      <h2>{heading}</h2>
      <p>{description}</p>
    </div>
  ),
}));

vi.mock('@/components/layout/Section', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <section data-testid="section">{children}</section>
  ),
}));

vi.mock('@/components/shared/icons', () => ({
  Icons: {
    brain: ({ className }: { className?: string }) => (
      <svg data-testid="icon-brain" className={className} />
    ),
    eye: ({ className }: { className?: string }) => (
      <svg data-testid="icon-eye" className={className} />
    ),
    users: ({ className }: { className?: string }) => (
      <svg data-testid="icon-users" className={className} />
    ),
  },
}));

describe('Benefits', () => {
  it('can be imported', () => {
    expect(Benefits).toBeDefined();
    expect(typeof Benefits).toBe('function');
  });

  it('renders the section wrapper', () => {
    render(<Benefits />);

    expect(screen.getByTestId('section')).toBeInTheDocument();
  });

  it('renders the heading section with correct content', () => {
    render(<Benefits />);

    expect(screen.getByTestId('heading-section')).toBeInTheDocument();
    expect(screen.getByText('Real Results')).toBeInTheDocument();
    expect(
      screen.getByText('See how Spec Tree transforms project management')
    ).toBeInTheDocument();
  });

  it('renders all benefit cards', () => {
    render(<Benefits />);

    expect(screen.getByText('Faster Project Delivery')).toBeInTheDocument();
    expect(screen.getByText('Better Requirements')).toBeInTheDocument();
    expect(screen.getByText('Enhanced Collaboration')).toBeInTheDocument();
  });

  it('renders benefit descriptions', () => {
    render(<Benefits />);

    expect(
      screen.getByText(
        'Reduce project planning time and accelerate delivery with AI-assisted workflows.'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Capture comprehensive requirements with AI-guided questioning and context propagation.'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText('Keep everyone aligned with shared context and clear dependencies.')
    ).toBeInTheDocument();
  });

  it('renders benefit statistics', () => {
    render(<Benefits />);

    // Faster Project Delivery stats
    expect(screen.getByText('40%')).toBeInTheDocument();
    expect(screen.getByText('Faster Planning')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
    expect(screen.getByText('Reduced Rework')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getByText('Team Productivity')).toBeInTheDocument();

    // Better Requirements stats
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('More Complete')).toBeInTheDocument();

    // Enhanced Collaboration stats
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('Better Alignment')).toBeInTheDocument();
  });

  it('renders benefit icons', () => {
    render(<Benefits />);

    expect(screen.getByTestId('icon-brain')).toBeInTheDocument();
    expect(screen.getByTestId('icon-eye')).toBeInTheDocument();
    expect(screen.getByTestId('icon-users')).toBeInTheDocument();
  });
});
