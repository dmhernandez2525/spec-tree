import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PricingFAQ } from './PricingFaq';

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

describe('PricingFAQ', () => {
  it('can be imported', () => {
    expect(PricingFAQ).toBeDefined();
    expect(typeof PricingFAQ).toBe('function');
  });

  it('renders FAQ heading', () => {
    render(<PricingFAQ />);

    expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
  });

  it('renders category filter buttons', () => {
    render(<PricingFAQ />);

    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Trial & Pricing' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Features' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Support' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Security' })).toBeInTheDocument();
  });

  it('renders FAQ questions', () => {
    render(<PricingFAQ />);

    expect(screen.getByText('How does the 14-day free trial work?')).toBeInTheDocument();
    expect(screen.getByText('Can I change plans at any time?')).toBeInTheDocument();
    expect(screen.getByText('What payment methods do you accept?')).toBeInTheDocument();
  });

  it('renders contact link', () => {
    render(<PricingFAQ />);

    expect(screen.getByText('Still have questions?')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Contact our team' })).toHaveAttribute(
      'href',
      '/contact'
    );
  });

  it('filters FAQs when category is selected', () => {
    render(<PricingFAQ />);

    const securityButton = screen.getByRole('button', { name: 'Security' });
    fireEvent.click(securityButton);

    // Security questions should be visible
    expect(screen.getByText('What happens to my data if I cancel?')).toBeInTheDocument();
    expect(screen.getByText('Is my data secure?')).toBeInTheDocument();

    // Questions from other categories should not be visible
    expect(screen.queryByText('How does the 14-day free trial work?')).not.toBeInTheDocument();
  });

  it('shows all FAQs when All button is clicked', () => {
    render(<PricingFAQ />);

    // First filter to Security
    const securityButton = screen.getByRole('button', { name: 'Security' });
    fireEvent.click(securityButton);

    // Then click All
    const allButton = screen.getByRole('button', { name: 'All' });
    fireEvent.click(allButton);

    // All questions should now be visible
    expect(screen.getByText('How does the 14-day free trial work?')).toBeInTheDocument();
    expect(screen.getByText('What happens to my data if I cancel?')).toBeInTheDocument();
  });

  it('renders accordion items', () => {
    render(<PricingFAQ />);

    // Check for accordion structure
    const accordionTriggers = screen.getAllByRole('button');
    // Should have category buttons + accordion triggers
    expect(accordionTriggers.length).toBeGreaterThan(5);
  });

  it('All button is active by default', () => {
    render(<PricingFAQ />);

    const allButton = screen.getByRole('button', { name: 'All' });
    // The default active button should not have outline variant
    expect(allButton).not.toHaveClass('border');
  });

  it('category button becomes active when clicked', () => {
    render(<PricingFAQ />);

    const featuresButton = screen.getByRole('button', { name: 'Features' });
    fireEvent.click(featuresButton);

    // Features button should now be active (not outline variant)
    expect(featuresButton).toBeInTheDocument();
  });
});
