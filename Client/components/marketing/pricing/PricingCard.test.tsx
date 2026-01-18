import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PricingCard } from './PricingCard';
import { PricingTier } from '@/types/pricing';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode }) => <div {...props}>{children}</div>,
  },
}));

// Mock icons
vi.mock('@/components/shared/icons', () => ({
  Icons: {
    check: ({ className }: { className?: string }) => (
      <svg data-testid="icon-check" className={className} />
    ),
    x: ({ className }: { className?: string }) => (
      <svg data-testid="icon-x" className={className} />
    ),
    alert: ({ className }: { className?: string }) => (
      <svg data-testid="icon-alert" className={className} />
    ),
  },
}));

describe('PricingCard', () => {
  const mockPlan: PricingTier = {
    id: 'professional',
    name: 'Professional',
    description: 'For growing teams',
    price: {
      monthly: 79,
      annual: 63,
    },
    features: [
      { title: 'Feature 1', description: 'Description 1', included: true },
      { title: 'Feature 2', description: 'Description 2', included: false },
      { title: 'Feature 3', description: 'Description 3', included: '10 items' },
    ],
    hasTrial: true,
    highlight: false,
    button: {
      text: 'Get Started',
      href: '/register',
      variant: 'default',
    },
  };

  it('can be imported', () => {
    expect(PricingCard).toBeDefined();
    expect(typeof PricingCard).toBe('function');
  });

  it('renders plan name', () => {
    render(<PricingCard plan={mockPlan} isAnnual={false} />);

    expect(screen.getByText('Professional')).toBeInTheDocument();
  });

  it('renders plan description', () => {
    render(<PricingCard plan={mockPlan} isAnnual={false} />);

    expect(screen.getByText('For growing teams')).toBeInTheDocument();
  });

  it('renders monthly price when isAnnual is false', () => {
    render(<PricingCard plan={mockPlan} isAnnual={false} />);

    expect(screen.getByText('$79')).toBeInTheDocument();
  });

  it('renders annual price when isAnnual is true', () => {
    render(<PricingCard plan={mockPlan} isAnnual={true} />);

    expect(screen.getByText('$63')).toBeInTheDocument();
  });

  it('shows savings percentage when isAnnual is true', () => {
    render(<PricingCard plan={mockPlan} isAnnual={true} />);

    expect(screen.getByText(/Billed annually/)).toBeInTheDocument();
    expect(screen.getByText(/save/)).toBeInTheDocument();
  });

  it('renders feature list', () => {
    render(<PricingCard plan={mockPlan} isAnnual={false} />);

    expect(screen.getByText('Feature 1')).toBeInTheDocument();
    expect(screen.getByText('Feature 2')).toBeInTheDocument();
    expect(screen.getByText('Feature 3')).toBeInTheDocument();
  });

  it('shows check icon for included features', () => {
    render(<PricingCard plan={mockPlan} isAnnual={false} />);

    const checkIcons = screen.getAllByTestId('icon-check');
    expect(checkIcons.length).toBeGreaterThan(0);
  });

  it('shows x icon for excluded features', () => {
    render(<PricingCard plan={mockPlan} isAnnual={false} />);

    expect(screen.getByTestId('icon-x')).toBeInTheDocument();
  });

  it('renders Most Popular badge when highlight is true', () => {
    const highlightedPlan = { ...mockPlan, highlight: true };
    render(<PricingCard plan={highlightedPlan} isAnnual={false} />);

    expect(screen.getByText('Most Popular')).toBeInTheDocument();
  });

  it('renders Start Free Trial button when hasTrial is true', () => {
    render(<PricingCard plan={mockPlan} isAnnual={false} />);

    expect(screen.getByText('Start Free Trial')).toBeInTheDocument();
  });

  it('renders trial info text when hasTrial is true', () => {
    render(<PricingCard plan={mockPlan} isAnnual={false} />);

    expect(screen.getByText('14-day free trial, no credit card required')).toBeInTheDocument();
  });

  it('calls onStartTrial when trial button is clicked', () => {
    const onStartTrial = vi.fn();
    render(<PricingCard plan={mockPlan} isAnnual={false} onStartTrial={onStartTrial} />);

    const trialButton = screen.getByText('Start Free Trial');
    fireEvent.click(trialButton);

    expect(onStartTrial).toHaveBeenCalledWith('professional');
  });

  it('shows Current Trial Plan badge when trialStatus matches plan', () => {
    const trialStatus = {
      isActive: true,
      planId: 'professional',
      startDate: '2024-01-01',
      endDate: '2024-01-15',
      daysRemaining: 7,
    };

    render(<PricingCard plan={mockPlan} isAnnual={false} trialStatus={trialStatus} />);

    expect(screen.getByText('Current Trial Plan')).toBeInTheDocument();
  });

  it('shows dashboard link when trial is active for current plan', () => {
    const trialStatus = {
      isActive: true,
      planId: 'professional',
      startDate: '2024-01-01',
      endDate: '2024-01-15',
      daysRemaining: 7,
    };

    render(<PricingCard plan={mockPlan} isAnnual={false} trialStatus={trialStatus} />);

    expect(screen.getByRole('link', { name: 'Go to Dashboard' })).toHaveAttribute(
      'href',
      '/user-dashboard'
    );
  });

  it('renders custom features when available', () => {
    const planWithCustomFeatures = {
      ...mockPlan,
      customFeatures: ['Custom feature 1', 'Custom feature 2'],
    };

    render(<PricingCard plan={planWithCustomFeatures} isAnnual={false} />);

    expect(screen.getByText('Also includes:')).toBeInTheDocument();
    expect(screen.getByText('Custom feature 1')).toBeInTheDocument();
    expect(screen.getByText('Custom feature 2')).toBeInTheDocument();
  });
});
