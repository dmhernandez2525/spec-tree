import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProcessImplementationSteps } from './ProcessImplementationSteps';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: { children: React.ReactNode; className?: string }) => (
      <div className={className} {...props}>{children}</div>
    ),
  },
}));

describe('ProcessImplementationSteps', () => {
  it('can be imported', () => {
    expect(ProcessImplementationSteps).toBeDefined();
    expect(typeof ProcessImplementationSteps).toBe('function');
  });

  it('renders all implementation steps', () => {
    render(<ProcessImplementationSteps />);

    expect(screen.getByText('Discovery & Planning')).toBeInTheDocument();
    expect(screen.getByText('Setup & Configuration')).toBeInTheDocument();
    expect(screen.getByText('Training & Onboarding')).toBeInTheDocument();
    expect(screen.getByText('Testing & Refinement')).toBeInTheDocument();
    expect(screen.getByText('Full Deployment')).toBeInTheDocument();
  });

  it('renders step numbers', () => {
    render(<ProcessImplementationSteps />);

    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Step 2')).toBeInTheDocument();
    expect(screen.getByText('Step 3')).toBeInTheDocument();
    expect(screen.getByText('Step 4')).toBeInTheDocument();
    expect(screen.getByText('Step 5')).toBeInTheDocument();
  });

  it('renders step descriptions', () => {
    render(<ProcessImplementationSteps />);

    expect(
      screen.getByText(/Initial consultation to understand your organization's needs/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Technical setup of Spec Tree, including user roles/)
    ).toBeInTheDocument();
  });

  it('renders step durations', () => {
    render(<ProcessImplementationSteps />);

    // Multiple steps have durations, so we use getAllByText
    const durationElements = screen.getAllByText(/\d+-?\d* weeks?/);
    expect(durationElements.length).toBeGreaterThan(0);
  });

  it('renders Deliverables heading for each step', () => {
    render(<ProcessImplementationSteps />);

    const deliverableHeadings = screen.getAllByText('Deliverables:');
    expect(deliverableHeadings).toHaveLength(5);
  });

  it('renders deliverables for Discovery step', () => {
    render(<ProcessImplementationSteps />);

    expect(screen.getByText('Needs assessment document')).toBeInTheDocument();
    expect(screen.getByText('Custom implementation roadmap')).toBeInTheDocument();
    expect(screen.getByText('Project timeline')).toBeInTheDocument();
    expect(screen.getByText('Resource allocation plan')).toBeInTheDocument();
  });

  it('renders deliverables for Setup step', () => {
    render(<ProcessImplementationSteps />);

    expect(screen.getByText('Configured Spec Tree instance')).toBeInTheDocument();
    expect(screen.getByText('Custom templates')).toBeInTheDocument();
    expect(screen.getByText('User roles and permissions setup')).toBeInTheDocument();
  });

  it('renders Duration label', () => {
    render(<ProcessImplementationSteps />);

    const durationLabels = screen.getAllByText('Duration:');
    expect(durationLabels).toHaveLength(5);
  });

  it('renders step icons', () => {
    render(<ProcessImplementationSteps />);

    // Emoji icons should be rendered
    expect(screen.getByText('🎯')).toBeInTheDocument();
    expect(screen.getByText('⚙️')).toBeInTheDocument();
    expect(screen.getByText('📚')).toBeInTheDocument();
    expect(screen.getByText('🔍')).toBeInTheDocument();
    expect(screen.getByText('🚀')).toBeInTheDocument();
  });
});
