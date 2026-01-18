import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CTASection } from './CTASection';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock components
vi.mock('@/components/layout/Section', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <section data-testid="section">{children}</section>
  ),
}));

vi.mock('@/components/shared/icons', () => ({
  Icons: {
    phone: ({ className }: { className?: string }) => (
      <svg data-testid="icon-phone" className={className} />
    ),
  },
}));

describe('CTASection', () => {
  it('can be imported', () => {
    expect(CTASection).toBeDefined();
    expect(typeof CTASection).toBe('function');
  });

  it('renders the section wrapper', () => {
    render(<CTASection />);

    expect(screen.getByTestId('section')).toBeInTheDocument();
  });

  it('renders the main heading', () => {
    render(<CTASection />);

    expect(
      screen.getByText('Ready to Transform Your Project Planning?')
    ).toBeInTheDocument();
  });

  it('renders the description', () => {
    render(<CTASection />);

    expect(
      screen.getByText('Join thousands of teams using Spec Tree to deliver better projects, faster.')
    ).toBeInTheDocument();
  });

  it('renders CTA buttons with correct links', () => {
    render(<CTASection />);

    const trialLink = screen.getByRole('link', { name: 'Start Free Trial' });
    expect(trialLink).toHaveAttribute('href', '/register');

    const demoLink = screen.getByRole('link', { name: /Schedule Demo/ });
    expect(demoLink).toHaveAttribute('href', '/contact');
  });

  it('renders the phone icon in demo button', () => {
    render(<CTASection />);

    expect(screen.getByTestId('icon-phone')).toBeInTheDocument();
  });

  it('renders statistics', () => {
    render(<CTASection />);

    expect(screen.getByText('10,000+')).toBeInTheDocument();
    expect(screen.getByText('Active Users')).toBeInTheDocument();

    expect(screen.getByText('25,000+')).toBeInTheDocument();
    expect(screen.getByText('Projects Completed')).toBeInTheDocument();

    expect(screen.getByText('40%')).toBeInTheDocument();
    expect(screen.getByText('Time Saved')).toBeInTheDocument();

    expect(screen.getByText('98%')).toBeInTheDocument();
    expect(screen.getByText('Customer Satisfaction')).toBeInTheDocument();
  });
});
