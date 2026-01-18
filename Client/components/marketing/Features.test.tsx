import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Features } from './Features';

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
    plug: ({ className }: { className?: string }) => (
      <svg data-testid="icon-plug" className={className} />
    ),
    barChart: ({ className }: { className?: string }) => (
      <svg data-testid="icon-barChart" className={className} />
    ),
  },
}));

describe('Features', () => {
  it('can be imported', () => {
    expect(Features).toBeDefined();
    expect(typeof Features).toBe('function');
  });

  it('renders the section wrapper', () => {
    render(<Features />);

    expect(screen.getByTestId('section')).toBeInTheDocument();
  });

  it('renders the heading section with correct content', () => {
    render(<Features />);

    expect(screen.getByTestId('heading-section')).toBeInTheDocument();
    expect(screen.getByText('Powerful Features')).toBeInTheDocument();
    expect(
      screen.getByText('Transform how you plan and execute projects with our AI-powered tools')
    ).toBeInTheDocument();
  });

  it('renders all feature cards', () => {
    render(<Features />);

    expect(screen.getByText('AI-Powered Context Gathering')).toBeInTheDocument();
    expect(screen.getByText('Smart Work Item Generation')).toBeInTheDocument();
    expect(screen.getByText('Context Propagation')).toBeInTheDocument();
    expect(screen.getByText('Template System')).toBeInTheDocument();
    expect(screen.getByText('Integration Hub')).toBeInTheDocument();
    expect(screen.getByText('Real-time Analytics')).toBeInTheDocument();
  });

  it('renders feature descriptions', () => {
    render(<Features />);

    expect(
      screen.getByText(
        'Intelligent system that asks relevant questions to gather comprehensive project requirements.'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Automatically generate epics, features, user stories, and tasks with smart dependencies.'
      )
    ).toBeInTheDocument();
  });

  it('renders feature icons', () => {
    render(<Features />);

    // Should have at least one brain icon
    expect(screen.getByTestId('icon-brain')).toBeInTheDocument();
    // Should have at least one barChart icon
    expect(screen.getByTestId('icon-barChart')).toBeInTheDocument();
  });
});
