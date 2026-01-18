import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InteractiveDemo } from './InteractiveDemo';

// Mock icons
vi.mock('@/components/shared/icons', () => ({
  Icons: {
    alert: ({ className }: { className?: string }) => (
      <svg data-testid="icon-alert" className={className} />
    ),
  },
}));

describe('InteractiveDemo', () => {
  it('can be imported', () => {
    expect(InteractiveDemo).toBeDefined();
    expect(typeof InteractiveDemo).toBe('function');
  });

  it('renders step indicators', () => {
    render(<InteractiveDemo />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders initial step question', () => {
    render(<InteractiveDemo />);

    expect(screen.getByText('What type of project are you planning?')).toBeInTheDocument();
  });

  it('renders step description', () => {
    render(<InteractiveDemo />);

    expect(
      screen.getByText('This helps our AI generate relevant context-gathering questions.')
    ).toBeInTheDocument();
  });

  it('renders input for project type', () => {
    render(<InteractiveDemo />);

    expect(screen.getByPlaceholderText('e.g., Mobile App Development')).toBeInTheDocument();
  });

  it('renders continue button', () => {
    render(<InteractiveDemo />);

    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
  });

  it('continue button is disabled when input is empty', () => {
    render(<InteractiveDemo />);

    const continueButton = screen.getByRole('button', { name: 'Continue' });
    expect(continueButton).toBeDisabled();
  });

  it('continue button is enabled when input has value', () => {
    render(<InteractiveDemo />);

    const input = screen.getByPlaceholderText('e.g., Mobile App Development');
    fireEvent.change(input, { target: { value: 'Web Application' } });

    const continueButton = screen.getByRole('button', { name: 'Continue' });
    expect(continueButton).not.toBeDisabled();
  });

  it('shows loading state when form is submitted', () => {
    render(<InteractiveDemo />);

    const input = screen.getByPlaceholderText('e.g., Mobile App Development');
    fireEvent.change(input, { target: { value: 'Mobile App' } });

    const continueButton = screen.getByRole('button', { name: 'Continue' });
    fireEvent.click(continueButton);

    // The button should be disabled while loading
    expect(continueButton).toBeDisabled();
  });

  it('renders the initial project type input', () => {
    render(<InteractiveDemo />);

    const input = screen.getByPlaceholderText('e.g., Mobile App Development');
    expect(input).toBeInTheDocument();
    expect(input.tagName.toLowerCase()).toBe('input');
  });
});
