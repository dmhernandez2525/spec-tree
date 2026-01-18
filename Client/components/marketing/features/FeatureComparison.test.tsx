import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeatureComparison } from './FeatureComparison';

// Mock icons
vi.mock('@/components/shared/icons', () => ({
  Icons: {
    check: ({ className }: { className?: string }) => (
      <svg data-testid="icon-check" className={className} />
    ),
    x: ({ className }: { className?: string }) => (
      <svg data-testid="icon-x" className={className} />
    ),
  },
}));

describe('FeatureComparison', () => {
  it('can be imported', () => {
    expect(FeatureComparison).toBeDefined();
    expect(typeof FeatureComparison).toBe('function');
  });

  it('renders main heading', () => {
    render(<FeatureComparison />);

    expect(screen.getByText('Why Choose Spec Tree?')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<FeatureComparison />);

    expect(
      screen.getByText(
        'See how our modern approach compares to traditional project management tools'
      )
    ).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<FeatureComparison />);

    expect(screen.getByText('Feature')).toBeInTheDocument();
    expect(screen.getByText('Spec Tree')).toBeInTheDocument();
    expect(screen.getByText('Traditional Tools')).toBeInTheDocument();
  });

  it('renders feature names', () => {
    render(<FeatureComparison />);

    expect(screen.getByText('AI-Powered Context Gathering')).toBeInTheDocument();
    expect(screen.getByText('Automated Work Item Generation')).toBeInTheDocument();
    expect(screen.getByText('Context Propagation')).toBeInTheDocument();
    expect(screen.getByText('Template System')).toBeInTheDocument();
    expect(screen.getByText('Integration Capabilities')).toBeInTheDocument();
    expect(screen.getByText('Analytics & Reporting')).toBeInTheDocument();
  });

  it('renders feature descriptions', () => {
    render(<FeatureComparison />);

    expect(
      screen.getByText(
        'Intelligent system that asks relevant questions based on project type'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText('Generate complete project hierarchies from high-level concepts')
    ).toBeInTheDocument();
  });

  it('renders check icons for supported features', () => {
    render(<FeatureComparison />);

    const checkIcons = screen.getAllByTestId('icon-check');
    expect(checkIcons.length).toBeGreaterThan(0);
  });

  it('renders x icons for unsupported features', () => {
    render(<FeatureComparison />);

    const xIcons = screen.getAllByTestId('icon-x');
    expect(xIcons.length).toBeGreaterThan(0);
  });

  it('renders a table element', () => {
    render(<FeatureComparison />);

    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('renders all 6 feature rows', () => {
    render(<FeatureComparison />);

    const rows = screen.getAllByRole('row');
    // 1 header row + 6 feature rows = 7
    expect(rows).toHaveLength(7);
  });
});
