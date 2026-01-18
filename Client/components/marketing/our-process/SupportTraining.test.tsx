import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SupportTraining from './SupportTraining';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: { children: React.ReactNode; className?: string }) => (
      <div className={className} {...props}>{children}</div>
    ),
  },
}));

describe('SupportTraining', () => {
  it('can be imported', () => {
    expect(SupportTraining).toBeDefined();
    expect(typeof SupportTraining).toBe('function');
  });

  it('renders without crashing', () => {
    render(<SupportTraining />);

    // This component exports ProcessImplementationSteps
    expect(screen.getByText('Discovery & Planning')).toBeInTheDocument();
  });

  it('renders all implementation steps', () => {
    render(<SupportTraining />);

    expect(screen.getByText('Discovery & Planning')).toBeInTheDocument();
    expect(screen.getByText('Setup & Configuration')).toBeInTheDocument();
    expect(screen.getByText('Training & Onboarding')).toBeInTheDocument();
    expect(screen.getByText('Testing & Refinement')).toBeInTheDocument();
    expect(screen.getByText('Full Deployment')).toBeInTheDocument();
  });

  it('renders deliverables section', () => {
    render(<SupportTraining />);

    const deliverableHeadings = screen.getAllByText('Deliverables:');
    expect(deliverableHeadings).toHaveLength(5);
  });
});
