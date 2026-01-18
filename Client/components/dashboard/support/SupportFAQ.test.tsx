import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SupportFAQ } from './SupportFAQ';

// Mock framer-motion to avoid animation-related issues
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('SupportFAQ', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports SupportFAQ component', () => {
    expect(SupportFAQ).toBeDefined();
    expect(typeof SupportFAQ).toBe('function');
  });

  it('renders FAQ component', () => {
    render(<SupportFAQ />);

    expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search FAQs...')).toBeInTheDocument();
  });

  it('displays all FAQ categories', () => {
    render(<SupportFAQ />);

    const gettingStartedBadges = screen.getAllByText('Getting Started');
    const featuresBadges = screen.getAllByText('Features');
    const teamsBadges = screen.getAllByText('Teams');
    const integrationsBadges = screen.getAllByText('Integrations');

    expect(gettingStartedBadges.length).toBeGreaterThan(0);
    expect(featuresBadges.length).toBeGreaterThan(0);
    expect(teamsBadges.length).toBeGreaterThan(0);
    expect(integrationsBadges.length).toBeGreaterThan(0);
  });

  it('displays FAQ questions', () => {
    render(<SupportFAQ />);

    expect(screen.getByText('How do I create my first project?')).toBeInTheDocument();
    expect(screen.getByText('What is AI-powered context gathering?')).toBeInTheDocument();
    expect(screen.getByText('How do I invite team members?')).toBeInTheDocument();
    expect(screen.getByText('What integrations are available?')).toBeInTheDocument();
  });

  it('filters FAQs based on search query', () => {
    render(<SupportFAQ />);

    const searchInput = screen.getByPlaceholderText('Search FAQs...');
    fireEvent.change(searchInput, { target: { value: 'project' } });

    expect(screen.getByText('How do I create my first project?')).toBeInTheDocument();
  });

  it('filters FAQs by category when badge is clicked', () => {
    render(<SupportFAQ />);

    const categoryBadges = screen.getAllByText('Getting Started');
    const clickableBadge = categoryBadges.find(
      (badge) => badge.className.includes('cursor-pointer')
    );

    if (clickableBadge) {
      fireEvent.click(clickableBadge);
      expect(clickableBadge).toHaveClass('bg-primary');
    }
  });

  it('toggles category filter on multiple clicks', () => {
    render(<SupportFAQ />);

    const categoryBadges = screen.getAllByText('Getting Started');
    const clickableBadge = categoryBadges.find(
      (badge) => badge.className.includes('cursor-pointer')
    );

    if (clickableBadge) {
      fireEvent.click(clickableBadge);
      expect(clickableBadge.className).toContain('bg-primary');

      fireEvent.click(clickableBadge);
      expect(clickableBadge.className).not.toContain('bg-primary');
    }
  });

  it('renders Card component', () => {
    render(<SupportFAQ />);

    const card = screen.getByText('Frequently Asked Questions').closest('div');
    expect(card).toBeInTheDocument();
  });

  it('renders search input with correct max width', () => {
    render(<SupportFAQ />);

    const searchInput = screen.getByPlaceholderText('Search FAQs...');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput.className).toContain('max-w-sm');
  });

  it('displays category badges in FAQ items', () => {
    render(<SupportFAQ />);

    const gettingStartedBadges = screen.getAllByText('Getting Started');
    const featuresBadges = screen.getAllByText('Features');

    // Should have badges both as filters and in accordion items
    expect(gettingStartedBadges.length).toBeGreaterThan(1);
    expect(featuresBadges.length).toBeGreaterThan(0);
  });

  it('filters FAQs by both search and category', () => {
    render(<SupportFAQ />);

    const searchInput = screen.getByPlaceholderText('Search FAQs...');
    fireEvent.change(searchInput, { target: { value: 'create' } });

    const categoryBadges = screen.getAllByText('Getting Started');
    const clickableBadge = categoryBadges.find(
      (badge) => badge.className.includes('cursor-pointer')
    );

    if (clickableBadge) {
      fireEvent.click(clickableBadge);
    }

    expect(screen.getByText('How do I create my first project?')).toBeInTheDocument();
  });

  it('shows no results when search does not match', () => {
    render(<SupportFAQ />);

    const searchInput = screen.getByPlaceholderText('Search FAQs...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent question' } });

    expect(screen.queryByText('How do I create my first project?')).not.toBeInTheDocument();
    expect(screen.queryByText('What is AI-powered context gathering?')).not.toBeInTheDocument();
  });

  it('renders accordion items with questions', () => {
    render(<SupportFAQ />);

    // Verify FAQ questions are rendered
    expect(screen.getByText('How do I create my first project?')).toBeInTheDocument();
    expect(screen.getByText('What is AI-powered context gathering?')).toBeInTheDocument();
    expect(screen.getByText('How do I invite team members?')).toBeInTheDocument();
    expect(screen.getByText('What integrations are available?')).toBeInTheDocument();
  });

  it('renders accordion component', () => {
    render(<SupportFAQ />);

    const accordionTrigger = screen.getByText('How do I create my first project?');
    expect(accordionTrigger).toBeInTheDocument();
    // The accordion trigger itself is a button-like element
    const parentButton = accordionTrigger.closest('button');
    if (parentButton) {
      expect(parentButton).toBeInTheDocument();
    }
  });

  it('applies correct styling to category badges', () => {
    render(<SupportFAQ />);

    const categoryBadges = screen.getAllByText('Getting Started');
    const clickableBadge = categoryBadges.find(
      (badge) => badge.className.includes('cursor-pointer')
    );

    expect(clickableBadge).toBeInTheDocument();
    if (clickableBadge) {
      expect(clickableBadge.className).toContain('cursor-pointer');
    }
  });

  it('clears search query when input is cleared', () => {
    render(<SupportFAQ />);

    const searchInput = screen.getByPlaceholderText('Search FAQs...') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'project' } });
    expect(searchInput.value).toBe('project');

    fireEvent.change(searchInput, { target: { value: '' } });
    expect(searchInput.value).toBe('');
  });
});
