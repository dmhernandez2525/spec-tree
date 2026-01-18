import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EnterpriseCTA } from './EnterpriseCTA';

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
    h2: ({ children, ...props }: { children: React.ReactNode }) => <h2 {...props}>{children}</h2>,
    p: ({ children, ...props }: { children: React.ReactNode }) => <p {...props}>{children}</p>,
    ul: ({ children, ...props }: { children: React.ReactNode }) => <ul {...props}>{children}</ul>,
  },
}));

// Mock icons
vi.mock('@/components/shared/icons', () => ({
  Icons: {
    check: ({ className }: { className?: string }) => (
      <svg data-testid="icon-check" className={className} />
    ),
  },
}));

describe('EnterpriseCTA', () => {
  it('can be imported', () => {
    expect(EnterpriseCTA).toBeDefined();
    expect(typeof EnterpriseCTA).toBe('function');
  });

  it('renders main heading', () => {
    render(<EnterpriseCTA />);

    expect(screen.getByText('Enterprise Solutions')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<EnterpriseCTA />);

    expect(
      screen.getByText('Custom solutions for large organizations with unique requirements')
    ).toBeInTheDocument();
  });

  it('renders all benefits', () => {
    render(<EnterpriseCTA />);

    expect(screen.getByText('Custom AI model training')).toBeInTheDocument();
    expect(screen.getByText('Dedicated support team')).toBeInTheDocument();
    expect(screen.getByText('Custom integrations')).toBeInTheDocument();
    expect(screen.getByText('Enterprise SLA')).toBeInTheDocument();
    expect(screen.getByText('Advanced security features')).toBeInTheDocument();
    expect(screen.getByText('On-premise deployment options')).toBeInTheDocument();
  });

  it('renders check icons for benefits', () => {
    render(<EnterpriseCTA />);

    const checkIcons = screen.getAllByTestId('icon-check');
    expect(checkIcons).toHaveLength(6);
  });

  it('renders CTA section heading', () => {
    render(<EnterpriseCTA />);

    expect(screen.getByText('Ready to get started?')).toBeInTheDocument();
  });

  it('renders contact description', () => {
    render(<EnterpriseCTA />);

    expect(
      screen.getByText('Contact our sales team for a custom quote')
    ).toBeInTheDocument();
  });

  it('renders Contact Sales button with correct link', () => {
    render(<EnterpriseCTA />);

    const contactLink = screen.getByRole('link', { name: 'Contact Sales' });
    expect(contactLink).toHaveAttribute('href', '/contact');
  });

  it('renders View Case Studies button with correct link', () => {
    render(<EnterpriseCTA />);

    const caseStudiesLink = screen.getByRole('link', { name: 'View Case Studies' });
    expect(caseStudiesLink).toHaveAttribute('href', '/resources/case-studies');
  });
});
