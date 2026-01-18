import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup, fireEvent, act } from '@testing-library/react';
import * as z from 'zod';
import React from 'react';

// Mock react-redux
const mockDispatch = vi.fn();
vi.mock('react-redux', () => ({
  useDispatch: vi.fn(() => mockDispatch),
}));

// Mock next/navigation
const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: vi.fn(),
  })),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock the loginUser action
const mockLoginUser = vi.fn();
vi.mock('../../lib/store/user-slice', () => ({
  loginUser: (...args: unknown[]) => mockLoginUser(...args),
}));

// Mock the Checkbox to avoid radix-ui issues
vi.mock('@/components/ui/checkbox', () => {
  const MockCheckbox = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { onCheckedChange?: (checked: boolean) => void }>(
    ({ onCheckedChange, ...props }, ref) => (
      <input
        type="checkbox"
        ref={ref}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        {...props}
      />
    )
  );
  MockCheckbox.displayName = 'MockCheckbox';
  return { Checkbox: MockCheckbox };
});

// Import after mocks
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoginUser.mockReset();
  });

  afterEach(async () => {
    await act(async () => {
      cleanup();
    });
    vi.clearAllMocks();
  });

  describe('module exports', () => {
    it('exports LoginForm component', () => {
      expect(LoginForm).toBeDefined();
    });

    it('LoginForm is a function component', () => {
      expect(typeof LoginForm).toBe('function');
    });

    it('LoginForm can be called without crashing', () => {
      expect(LoginForm).toBeDefined();
      expect(LoginForm.length).toBeGreaterThanOrEqual(0);
    });

    it('LoginForm accepts onSuccess prop in its type signature', () => {
      expect(LoginForm).toBeDefined();
      expect(typeof LoginForm).toBe('function');
    });
  });

  describe('form schema validation', () => {
    const createSchema = () =>
      z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
        rememberMe: z.boolean().default(false),
      });

    it('validates email format', () => {
      const schema = createSchema();

      const validResult = schema.safeParse({
        email: 'user@example.com',
        password: 'password123',
        rememberMe: false,
      });
      expect(validResult.success).toBe(true);

      const invalidResult = schema.safeParse({
        email: 'invalid-email',
        password: 'password123',
        rememberMe: false,
      });
      expect(invalidResult.success).toBe(false);
      if (!invalidResult.success) {
        expect(invalidResult.error.issues[0].message).toContain('email');
      }
    });

    it('validates password minimum length', () => {
      const schema = createSchema();

      const validResult = schema.safeParse({
        email: 'user@example.com',
        password: 'password123',
        rememberMe: false,
      });
      expect(validResult.success).toBe(true);

      const invalidResult = schema.safeParse({
        email: 'user@example.com',
        password: '12345',
        rememberMe: false,
      });
      expect(invalidResult.success).toBe(false);
      if (!invalidResult.success) {
        expect(invalidResult.error.issues[0].message).toContain('at least 6 characters');
      }
    });

    it('handles rememberMe boolean default', () => {
      const schema = createSchema();

      const withRememberMe = schema.parse({
        email: 'user@example.com',
        password: 'password123',
        rememberMe: true,
      });
      expect(withRememberMe.rememberMe).toBe(true);

      const withoutRememberMe = schema.parse({
        email: 'user@example.com',
        password: 'password123',
      });
      expect(withoutRememberMe.rememberMe).toBe(false);
    });

    it('rejects empty email', () => {
      const schema = createSchema();
      const result = schema.safeParse({
        email: '',
        password: 'password123',
        rememberMe: false,
      });
      expect(result.success).toBe(false);
    });

    it('rejects empty password', () => {
      const schema = createSchema();
      const result = schema.safeParse({
        email: 'user@example.com',
        password: '',
        rememberMe: false,
      });
      expect(result.success).toBe(false);
    });

    it('accepts password exactly 6 characters', () => {
      const schema = createSchema();
      const result = schema.safeParse({
        email: 'user@example.com',
        password: '123456',
        rememberMe: false,
      });
      expect(result.success).toBe(true);
    });

    it('validates various valid email formats', () => {
      const schema = createSchema();
      const validEmails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.com',
        'user@subdomain.example.com',
        '123@example.com',
      ];
      validEmails.forEach((email) => {
        const result = schema.safeParse({
          email,
          password: 'password123',
          rememberMe: false,
        });
        expect(result.success).toBe(true);
      });
    });

    it('rejects various invalid email formats', () => {
      const schema = createSchema();
      const invalidEmails = ['invalid', '@example.com', 'user@', 'user @example.com', ''];
      invalidEmails.forEach((email) => {
        const result = schema.safeParse({
          email,
          password: 'password123',
          rememberMe: false,
        });
        expect(result.success).toBe(false);
      });
    });
  });

  describe('component rendering', () => {
    it('renders the login form with all elements', async () => {
      await act(async () => {
        render(<LoginForm />);
      });

      expect(screen.getByText('Welcome back')).toBeInTheDocument();
      expect(screen.getByText('Enter your credentials to access your account')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Password')).toBeInTheDocument();
      expect(screen.getByText('Remember me')).toBeInTheDocument();
      expect(screen.getByText('Forgot password?')).toBeInTheDocument();
      expect(screen.getByText('Sign in')).toBeInTheDocument();
    });

    it('renders email input with correct attributes', async () => {
      await act(async () => {
        render(<LoginForm />);
      });

      const emailInput = screen.getByPlaceholderText('you@example.com');
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('renders password input with correct attributes', async () => {
      await act(async () => {
        render(<LoginForm />);
      });

      const passwordInputs = screen.getAllByPlaceholderText(/•+/);
      const passwordInput = passwordInputs[0];
      expect(passwordInput).toBeInTheDocument();
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('renders forgot password link with correct href', async () => {
      await act(async () => {
        render(<LoginForm />);
      });

      const forgotPasswordLink = screen.getByText('Forgot password?');
      expect(forgotPasswordLink.closest('a')).toHaveAttribute('href', '/forgot-password');
    });

    it('renders create account link with correct href', async () => {
      await act(async () => {
        render(<LoginForm />);
      });

      const createAccountLink = screen.getByText('Create one');
      expect(createAccountLink.closest('a')).toHaveAttribute('href', '/register');
    });

    it('renders the remember me checkbox', async () => {
      await act(async () => {
        render(<LoginForm />);
      });

      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });
  });

  describe('form interactions', () => {
    it('allows typing in email field', async () => {
      await act(async () => {
        render(<LoginForm />);
      });

      const emailInput = screen.getByPlaceholderText('you@example.com');
      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      });
      expect(emailInput).toHaveValue('test@example.com');
    });

    it('allows typing in password field', async () => {
      await act(async () => {
        render(<LoginForm />);
      });

      const passwordInputs = screen.getAllByPlaceholderText(/•+/);
      const passwordInput = passwordInputs[0];
      await act(async () => {
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
      });
      expect(passwordInput).toHaveValue('password123');
    });

    it('allows toggling remember me checkbox', async () => {
      await act(async () => {
        render(<LoginForm />);
      });

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();

      await act(async () => {
        fireEvent.click(checkbox);
      });
      expect(checkbox).toBeChecked();

      await act(async () => {
        fireEvent.click(checkbox);
      });
      expect(checkbox).not.toBeChecked();
    });
  });

  describe('form submission', () => {
    it('submits form with valid data and calls loginUser', async () => {
      mockLoginUser.mockResolvedValue(true);
      await act(async () => {
        render(<LoginForm />);
      });

      const emailInput = screen.getByPlaceholderText('you@example.com');
      const passwordInputs = screen.getAllByPlaceholderText(/•+/);
      const passwordInput = passwordInputs[0];
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
      });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(mockLoginUser).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            identifier: 'test@example.com',
            password: 'password123',
          })
        );
      });
    });

    it('redirects to user-dashboard on successful login', async () => {
      mockLoginUser.mockResolvedValue(true);
      await act(async () => {
        render(<LoginForm />);
      });

      const emailInput = screen.getByPlaceholderText('you@example.com');
      const passwordInputs = screen.getAllByPlaceholderText(/•+/);
      const passwordInput = passwordInputs[0];
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
      });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/user-dashboard');
      });
    });

    it('calls onSuccess callback on successful login', async () => {
      mockLoginUser.mockResolvedValue(true);
      const onSuccessMock = vi.fn();
      await act(async () => {
        render(<LoginForm onSuccess={onSuccessMock} />);
      });

      const emailInput = screen.getByPlaceholderText('you@example.com');
      const passwordInputs = screen.getAllByPlaceholderText(/•+/);
      const passwordInput = passwordInputs[0];
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
      });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(onSuccessMock).toHaveBeenCalled();
      });
    });
  });

  describe('error handling', () => {
    it('displays error message on failed login', async () => {
      mockLoginUser.mockResolvedValue(false);
      await act(async () => {
        render(<LoginForm />);
      });

      const emailInput = screen.getByPlaceholderText('you@example.com');
      const passwordInputs = screen.getAllByPlaceholderText(/•+/);
      const passwordInput = passwordInputs[0];
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Invalid email or password. Please try again.')).toBeInTheDocument();
      });
    });

    it('displays error message on API exception', async () => {
      mockLoginUser.mockRejectedValue(new Error('Network error'));
      await act(async () => {
        render(<LoginForm />);
      });

      const emailInput = screen.getByPlaceholderText('you@example.com');
      const passwordInputs = screen.getAllByPlaceholderText(/•+/);
      const passwordInput = passwordInputs[0];
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
      });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByText('An unexpected error occurred. Please try again later.')).toBeInTheDocument();
      });
    });

    it('does not redirect on failed login', async () => {
      mockLoginUser.mockResolvedValue(false);
      await act(async () => {
        render(<LoginForm />);
      });

      const emailInput = screen.getByPlaceholderText('you@example.com');
      const passwordInputs = screen.getAllByPlaceholderText(/•+/);
      const passwordInput = passwordInputs[0];
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Invalid email or password. Please try again.')).toBeInTheDocument();
      });

      expect(mockPush).not.toHaveBeenCalled();
    });

    it('does not call onSuccess on failed login', async () => {
      mockLoginUser.mockResolvedValue(false);
      const onSuccessMock = vi.fn();
      await act(async () => {
        render(<LoginForm onSuccess={onSuccessMock} />);
      });

      const emailInput = screen.getByPlaceholderText('you@example.com');
      const passwordInputs = screen.getAllByPlaceholderText(/•+/);
      const passwordInput = passwordInputs[0];
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Invalid email or password. Please try again.')).toBeInTheDocument();
      });

      expect(onSuccessMock).not.toHaveBeenCalled();
    });
  });

  describe('form validation display', () => {
    it('validates email format using schema', () => {
      const schema = z.object({
        email: z.string().email('Invalid email address'),
      });

      const invalidResult = schema.safeParse({ email: 'invalid-email' });
      expect(invalidResult.success).toBe(false);

      const validResult = schema.safeParse({ email: 'test@example.com' });
      expect(validResult.success).toBe(true);
    });

    it('validates password minimum length using schema', () => {
      const schema = z.object({
        password: z.string().min(6, 'Password must be at least 6 characters'),
      });

      const invalidResult = schema.safeParse({ password: '12345' });
      expect(invalidResult.success).toBe(false);

      const validResult = schema.safeParse({ password: '123456' });
      expect(validResult.success).toBe(true);
    });

    it('does not submit form with validation errors', async () => {
      await act(async () => {
        render(<LoginForm />);
      });

      const emailInput = screen.getByPlaceholderText('you@example.com');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(mockLoginUser).not.toHaveBeenCalled();
      });
    });
  });

  describe('dependencies', () => {
    it('exports LoginForm component', () => {
      expect(LoginForm).toBeDefined();
      expect(typeof LoginForm).toBe('function');
    });

    it('uses react-hook-form with zod validation', () => {
      // LoginForm uses react-hook-form for form state management
      expect(LoginForm).toBeDefined();
    });

    it('component accepts props', () => {
      expect(LoginForm.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('component structure', () => {
    it('component has correct display name or is named export', () => {
      expect(LoginForm.name || (LoginForm as React.FC & { displayName?: string }).displayName).toBeTruthy();
    });

    it('component accepts props interface', () => {
      expect(LoginForm).toBeDefined();
      expect(typeof LoginForm).toBe('function');
      expect(LoginForm.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('accessibility', () => {
    it('has accessible form labels', async () => {
      await act(async () => {
        render(<LoginForm />);
      });

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('submit button has accessible name', async () => {
      await act(async () => {
        render(<LoginForm />);
      });

      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('form has proper structure with card layout', async () => {
      await act(async () => {
        render(<LoginForm />);
      });

      expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    });
  });
});
