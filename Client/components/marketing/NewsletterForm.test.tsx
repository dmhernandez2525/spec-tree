import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NewsletterForm } from './NewsletterForm';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock api
vi.mock('@/api/fetchData', () => ({
  addToNewsletter: vi.fn(),
}));

describe('NewsletterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('can be imported', () => {
    expect(NewsletterForm).toBeDefined();
    expect(typeof NewsletterForm).toBe('function');
  });

  it('renders the default header', () => {
    render(<NewsletterForm />);

    expect(screen.getByText('Join our newsletter')).toBeInTheDocument();
  });

  it('renders the default subheader', () => {
    render(<NewsletterForm />);

    expect(
      screen.getByText('Get updates on our latest content and news')
    ).toBeInTheDocument();
  });

  it('renders custom header when provided', () => {
    render(
      <NewsletterForm
        data={{ header: 'Custom Header', subHeader: 'Custom Subheader' }}
      />
    );

    expect(screen.getByText('Custom Header')).toBeInTheDocument();
    expect(screen.getByText('Custom Subheader')).toBeInTheDocument();
  });

  it('renders form fields', () => {
    render(<NewsletterForm />);

    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone Number (Optional)')).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<NewsletterForm />);

    expect(screen.getByRole('button', { name: 'Subscribe' })).toBeInTheDocument();
  });

  it('renders privacy policy link', () => {
    render(<NewsletterForm />);

    const privacyLink = screen.getByRole('link', { name: 'Privacy Policy' });
    expect(privacyLink).toHaveAttribute('href', '/privacy');
  });

  it('renders input placeholders', () => {
    render(<NewsletterForm />);

    expect(screen.getByPlaceholderText('John')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Doe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('john@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('123-456-7890')).toBeInTheDocument();
  });
});
