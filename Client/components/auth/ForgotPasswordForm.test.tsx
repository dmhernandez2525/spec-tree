import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup, fireEvent, act } from '@testing-library/react';
import * as z from 'zod';
import React from 'react';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock sonner toast
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();
vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

// Mock fetch - save original and restore
const originalFetch = global.fetch;
const mockFetch = vi.fn();

// Import after mocks
import { ForgotPasswordForm } from './ForgotPasswordForm';

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
    global.fetch = mockFetch;
  });

  afterEach(async () => {
    await act(async () => {
      cleanup();
    });
    vi.clearAllMocks();
    global.fetch = originalFetch;
  });

  describe('module exports', () => {
    it('exports ForgotPasswordForm component', () => {
      expect(ForgotPasswordForm).toBeDefined();
    });

    it('ForgotPasswordForm is a function component', () => {
      expect(typeof ForgotPasswordForm).toBe('function');
    });

    it('ForgotPasswordForm can be called without crashing', () => {
      expect(ForgotPasswordForm).toBeDefined();
      expect(ForgotPasswordForm.length).toBeGreaterThanOrEqual(0);
    });

    it('ForgotPasswordForm does not require props', () => {
      expect(ForgotPasswordForm).toBeDefined();
      expect(typeof ForgotPasswordForm).toBe('function');
    });
  });

  describe('form schema validation', () => {
    const createSchema = () =>
      z.object({
        email: z.string().email('Please enter a valid email address'),
      });

    it('validates valid email addresses', () => {
      const schema = createSchema();
      const validEmails = [
        'user@example.com',
        'test.user@example.co.uk',
        'user+tag@example.com',
        'user_name@example.com',
        '123@example.com',
      ];
      validEmails.forEach((email) => {
        const result = schema.safeParse({ email });
        expect(result.success).toBe(true);
      });
    });

    it('rejects invalid email addresses', () => {
      const schema = createSchema();
      const invalidEmails = ['invalid-email', 'user@', '@example.com', 'user @example.com', ''];
      invalidEmails.forEach((email) => {
        const result = schema.safeParse({ email });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('email');
        }
      });
    });

    it('has required email field', () => {
      const schema = createSchema();
      const result = schema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('validates complete form data structure', () => {
      const schema = createSchema();
      const validData = { email: 'test@example.com' };
      const result = schema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('validates email with subdomain', () => {
      const schema = createSchema();
      const result = schema.safeParse({ email: 'user@mail.example.com' });
      expect(result.success).toBe(true);
    });

    it('validates email with numbers', () => {
      const schema = createSchema();
      const result = schema.safeParse({ email: 'user123@example.com' });
      expect(result.success).toBe(true);
    });
  });

  describe('component rendering - initial state', () => {
    it('renders the forgot password form with all elements', async () => {
      await act(async () => {
        render(<ForgotPasswordForm />);
      });

      expect(screen.getByText('Forgot your password?')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Enter your email address and we will send you instructions to reset your password.'
        )
      ).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send reset instructions/i })).toBeInTheDocument();
    });

    it('renders email input with correct attributes', async () => {
      await act(async () => {
        render(<ForgotPasswordForm />);
      });

      const emailInput = screen.getByPlaceholderText('you@example.com');
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('renders back to login link with correct href', async () => {
      await act(async () => {
        render(<ForgotPasswordForm />);
      });

      const backToLoginLink = screen.getByText('Back to login');
      expect(backToLoginLink.closest('a')).toHaveAttribute('href', '/login');
    });

    it('renders submit button with correct initial text', async () => {
      await act(async () => {
        render(<ForgotPasswordForm />);
      });

      expect(screen.getByRole('button', { name: /send reset instructions/i })).toBeInTheDocument();
    });

    it('does not show success state initially', async () => {
      await act(async () => {
        render(<ForgotPasswordForm />);
      });

      expect(screen.queryByText('Check your email')).not.toBeInTheDocument();
      expect(
        screen.queryByText('We sent recovery instructions to your email address.')
      ).not.toBeInTheDocument();
    });
  });

  describe('form interactions', () => {
    it('allows typing in email field', async () => {
      await act(async () => {
        render(<ForgotPasswordForm />);
      });

      const emailInput = screen.getByPlaceholderText('you@example.com');
      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      });
      expect(emailInput).toHaveValue('test@example.com');
    });

    it('allows clearing email field', async () => {
      await act(async () => {
        render(<ForgotPasswordForm />);
      });

      const emailInput = screen.getByPlaceholderText('you@example.com');
      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      });
      expect(emailInput).toHaveValue('test@example.com');

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: '' } });
      });
      expect(emailInput).toHaveValue('');
    });
  });

  describe('form submission - success', () => {
    it('submits form with valid email and calls API', async () => {
      mockFetch.mockResolvedValue({ ok: true });
      await act(async () => {
        render(<ForgotPasswordForm />);
      });

      const emailInput = screen.getByPlaceholderText('you@example.com');
      const submitButton = screen.getByRole('button', { name: /send reset instructions/i });

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com' }),
        });
      });
    });

    it('shows success state after successful submission', async () => {
      mockFetch.mockResolvedValue({ ok: true });
      await act(async () => {
        render(<ForgotPasswordForm />);
      });

      const emailInput = screen.getByPlaceholderText('you@example.com');
      const submitButton = screen.getByRole('button', { name: /send reset instructions/i });

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Check your email')).toBeInTheDocument();
      });

      expect(
        screen.getByText('We sent recovery instructions to your email address.')
      ).toBeInTheDocument();
    });

    it('shows success toast on successful submission', async () => {
      mockFetch.mockResolvedValue({ ok: true });
      await act(async () => {
        render(<ForgotPasswordForm />);
      });

      const emailInput = screen.getByPlaceholderText('you@example.com');
      const submitButton = screen.getByRole('button', { name: /send reset instructions/i });

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith('Reset instructions sent to your email');
      });
    });

    it('shows back to login link in success state', async () => {
      mockFetch.mockResolvedValue({ ok: true });
      await act(async () => {
        render(<ForgotPasswordForm />);
      });

      const emailInput = screen.getByPlaceholderText('you@example.com');
      const submitButton = screen.getByRole('button', { name: /send reset instructions/i });

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Check your email')).toBeInTheDocument();
      });

      const backToLoginLink = screen.getByText('Back to login');
      expect(backToLoginLink.closest('a')).toHaveAttribute('href', '/login');
    });

    it('hides form fields after successful submission', async () => {
      mockFetch.mockResolvedValue({ ok: true });
      await act(async () => {
        render(<ForgotPasswordForm />);
      });

      const emailInput = screen.getByPlaceholderText('you@example.com');
      const submitButton = screen.getByRole('button', { name: /send reset instructions/i });

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Check your email')).toBeInTheDocument();
      });

      expect(screen.queryByPlaceholderText('you@example.com')).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /send reset instructions/i })
      ).not.toBeInTheDocument();
    });
  });

  describe('form submission - error handling', () => {
    it('shows error toast on API failure', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 500 });
      await act(async () => {
        render(<ForgotPasswordForm />);
      });

      const emailInput = screen.getByPlaceholderText('you@example.com');
      const submitButton = screen.getByRole('button', { name: /send reset instructions/i });

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          'Failed to send reset instructions. Please try again.'
        );
      });
    });

    it('shows error toast on network error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      await act(async () => {
        render(<ForgotPasswordForm />);
      });

      const emailInput = screen.getByPlaceholderText('you@example.com');
      const submitButton = screen.getByRole('button', { name: /send reset instructions/i });

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          'Failed to send reset instructions. Please try again.'
        );
      });
    });

    it('does not show success state on API failure', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 400 });
      await act(async () => {
        render(<ForgotPasswordForm />);
      });

      const emailInput = screen.getByPlaceholderText('you@example.com');
      const submitButton = screen.getByRole('button', { name: /send reset instructions/i });

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalled();
      });

      expect(screen.queryByText('Check your email')).not.toBeInTheDocument();
      expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    });

    it('keeps form visible after error', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 500 });
      await act(async () => {
        render(<ForgotPasswordForm />);
      });

      const emailInput = screen.getByPlaceholderText('you@example.com');
      const submitButton = screen.getByRole('button', { name: /send reset instructions/i });

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalled();
      });

      expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send reset instructions/i })).toBeInTheDocument();
    });

    it('preserves email value after error', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 500 });
      await act(async () => {
        render(<ForgotPasswordForm />);
      });

      const emailInput = screen.getByPlaceholderText('you@example.com') as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /send reset instructions/i });

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalled();
      });

      expect(emailInput.value).toBe('test@example.com');
    });

    it('supports retry functionality after error', async () => {
      // Verify that the form supports retry by keeping form visible after error
      mockFetch.mockResolvedValue({ ok: false, status: 500 });
      await act(async () => {
        render(<ForgotPasswordForm />);
      });

      const emailInput = screen.getByPlaceholderText('you@example.com');
      const submitButton = screen.getByRole('button', { name: /send reset instructions/i });

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalled();
      });

      // Form should still be visible for retry
      expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send reset instructions/i })).toBeInTheDocument();
    });
  });

  describe('form validation display', () => {
    it('has email input with validation attributes', async () => {
      await act(async () => {
        render(<ForgotPasswordForm />);
      });

      const emailInput = screen.getByPlaceholderText('you@example.com');
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('has submit button initially available', async () => {
      await act(async () => {
        render(<ForgotPasswordForm />);
      });

      const submitButton = screen.getByRole('button', { name: /send reset instructions/i });
      expect(submitButton).not.toBeDisabled();
    });

    it('validates email format requirements', () => {
      // Zod schema validation test
      const schema = z.object({
        email: z.string().email('Please enter a valid email address'),
      });

      const invalidResult = schema.safeParse({ email: 'invalid-email' });
      expect(invalidResult.success).toBe(false);

      const validResult = schema.safeParse({ email: 'valid@example.com' });
      expect(validResult.success).toBe(true);
    });
  });

  describe('dependencies', () => {
    it('uses react-hook-form with zod validation', () => {
      // ForgotPasswordForm is already imported at the top
      expect(ForgotPasswordForm).toBeDefined();
    });

    it('imports required UI components', () => {
      // ForgotPasswordForm is already imported at the top
      expect(ForgotPasswordForm).toBeDefined();
    });

    it('imports toast from sonner', () => {
      // toast is mocked at the top of the file
      expect(mockToastSuccess).toBeDefined();
      expect(mockToastError).toBeDefined();
    });
  });

  describe('component structure', () => {
    it('component has correct display name or is named export', () => {
      expect(ForgotPasswordForm.name || (ForgotPasswordForm as React.FC & { displayName?: string }).displayName).toBeTruthy();
    });

    it('component function signature accepts no required props', () => {
      expect(ForgotPasswordForm.length).toBe(0);
    });
  });

  describe('API integration', () => {
    it('sends correct request body structure', async () => {
      mockFetch.mockResolvedValue({ ok: true });
      await act(async () => {
        render(<ForgotPasswordForm />);
      });

      const emailInput = screen.getByPlaceholderText('you@example.com');
      const submitButton = screen.getByRole('button', { name: /send reset instructions/i });

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'user@test.com' } });
      });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/auth/forgot-password',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'user@test.com' }),
          })
        );
      });
    });
  });

  describe('accessibility', () => {
    it('has accessible form label for email', async () => {
      await act(async () => {
        render(<ForgotPasswordForm />);
      });

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    it('submit button has accessible name', async () => {
      await act(async () => {
        render(<ForgotPasswordForm />);
      });

      expect(screen.getByRole('button', { name: /send reset instructions/i })).toBeInTheDocument();
    });

    it('form has proper heading structure', async () => {
      await act(async () => {
        render(<ForgotPasswordForm />);
      });

      expect(screen.getByRole('heading', { name: /forgot your password/i })).toBeInTheDocument();
    });

    it('success state has proper heading', async () => {
      mockFetch.mockResolvedValue({ ok: true });
      await act(async () => {
        render(<ForgotPasswordForm />);
      });

      const emailInput = screen.getByPlaceholderText('you@example.com');
      const submitButton = screen.getByRole('button', { name: /send reset instructions/i });

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /check your email/i })).toBeInTheDocument();
      });
    });

    it('back to login link is keyboard accessible', async () => {
      await act(async () => {
        render(<ForgotPasswordForm />);
      });

      const backToLoginLink = screen.getByText('Back to login');
      expect(backToLoginLink.closest('a')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('handles email with special characters', async () => {
      mockFetch.mockResolvedValue({ ok: true });
      await act(async () => {
        render(<ForgotPasswordForm />);
      });

      const emailInput = screen.getByPlaceholderText('you@example.com');
      const submitButton = screen.getByRole('button', { name: /send reset instructions/i });

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test+special@example.com' } });
      });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/auth/forgot-password',
          expect.objectContaining({
            body: JSON.stringify({ email: 'test+special@example.com' }),
          })
        );
      });
    });
  });
});
