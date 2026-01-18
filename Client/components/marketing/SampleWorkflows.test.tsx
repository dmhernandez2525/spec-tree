import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SampleWorkflows } from './SampleWorkflows';

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

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
  default: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <section data-testid="section" className={className}>{children}</section>
  ),
}));

vi.mock('@/components/shared/icons', () => ({
  Icons: {
    brain: ({ className }: { className?: string }) => (
      <svg data-testid="icon-brain" className={className} />
    ),
    users: ({ className }: { className?: string }) => (
      <svg data-testid="icon-users" className={className} />
    ),
    check: ({ className }: { className?: string }) => (
      <svg data-testid="icon-check" className={className} />
    ),
  },
}));

describe('SampleWorkflows', () => {
  it('can be imported', () => {
    expect(SampleWorkflows).toBeDefined();
    expect(typeof SampleWorkflows).toBe('function');
  });

  it('renders the section wrapper', () => {
    render(<SampleWorkflows />);

    expect(screen.getByTestId('section')).toBeInTheDocument();
  });

  it('renders the heading section with correct content', () => {
    render(<SampleWorkflows />);

    expect(screen.getByTestId('heading-section')).toBeInTheDocument();
    expect(screen.getByText('Sample Workflows')).toBeInTheDocument();
    expect(
      screen.getByText('See how Spec Tree streamlines common development processes')
    ).toBeInTheDocument();
  });

  it('renders workflow titles', () => {
    render(<SampleWorkflows />);

    expect(screen.getByText('Feature Development')).toBeInTheDocument();
    expect(screen.getByText('Sprint Planning')).toBeInTheDocument();
  });

  it('renders workflow descriptions', () => {
    render(<SampleWorkflows />);

    expect(
      screen.getByText('From concept to implementation with AI-assisted planning')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Streamlined sprint organization and story breakdown')
    ).toBeInTheDocument();
  });

  it('renders feature development steps', () => {
    render(<SampleWorkflows />);

    expect(screen.getByText('Initial Context')).toBeInTheDocument();
    expect(
      screen.getByText('AI guides you through capturing comprehensive requirements')
    ).toBeInTheDocument();
    expect(screen.getByText('Auto Generation')).toBeInTheDocument();
    expect(screen.getByText('Review & Refine')).toBeInTheDocument();
    expect(screen.getByText('Implementation')).toBeInTheDocument();
  });

  it('renders sprint planning steps', () => {
    render(<SampleWorkflows />);

    expect(screen.getByText('Backlog Review')).toBeInTheDocument();
    expect(screen.getByText('Story Generation')).toBeInTheDocument();
    expect(screen.getByText('Task Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Assignment')).toBeInTheDocument();
  });

  it('renders workflow images', () => {
    render(<SampleWorkflows />);

    expect(screen.getByAltText('Feature Development')).toBeInTheDocument();
    expect(screen.getByAltText('Sprint Planning')).toBeInTheDocument();
  });

  it('renders step icons', () => {
    render(<SampleWorkflows />);

    // Should have icons for the steps
    expect(screen.getByTestId('icon-brain')).toBeInTheDocument();
    expect(screen.getByTestId('icon-check')).toBeInTheDocument();
    expect(screen.getAllByTestId('icon-users').length).toBeGreaterThan(0);
  });
});
