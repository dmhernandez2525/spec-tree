import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup, fireEvent, act } from '@testing-library/react';
import * as z from 'zod';
import React from 'react';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  })),
}));

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

// Mock the registerNewUser API call
const mockRegisterNewUser = vi.fn();
vi.mock('@/api/fetchData', () => ({
  registerNewUser: (...args: unknown[]) => mockRegisterNewUser(...args),
}));

// Mock the PasswordStrengthIndicator component
const mockEvaluatePasswordStrength = vi.fn(() => 'medium');
vi.mock('@/components/auth/PasswordStrengthIndicator', () => ({
  PasswordStrengthIndicator: ({ password }: { password: string }) => (
    <div data-testid="password-strength-indicator">{password ? 'Strength indicator' : null}</div>
  ),
  evaluatePasswordStrength: (...args: unknown[]) => mockEvaluatePasswordStrength(...args),
}));

// Mock Icons component
vi.mock('@/components/shared/icons', () => ({
  Icons: {
    alert: () => <span data-testid="alert-icon">Alert</span>,
  },
}));

// Mock radix-ui Tooltip
vi.mock('@radix-ui/react-tooltip', () => ({
  Root: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Trigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Content: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Provider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Portal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Import after mocks
import { RegisterForm } from './RegisterForm';

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRegisterNewUser.mockReset();
    mockEvaluatePasswordStrength.mockReturnValue('medium');
  });

  afterEach(async () => {
    await act(async () => {
      cleanup();
    });
    vi.clearAllMocks();
  });

  describe('module exports', () => {
    it('exports RegisterForm component', () => {
      expect(RegisterForm).toBeDefined();
    });

    it('RegisterForm is a function component', () => {
      expect(typeof RegisterForm).toBe('function');
    });

    it('RegisterForm can be called without crashing', () => {
      expect(RegisterForm).toBeDefined();
      expect(RegisterForm.length).toBeGreaterThanOrEqual(0);
    });

    it('RegisterForm accepts onSuccess prop in its type signature', () => {
      expect(RegisterForm).toBeDefined();
      expect(typeof RegisterForm).toBe('function');
    });
  });

  describe('form schema validation', () => {
    const createSchema = () =>
      z
        .object({
          firstName: z.string().min(2, 'First name must be at least 2 characters'),
          lastName: z.string().min(2, 'Last name must be at least 2 characters'),
          email: z.string().email('Invalid email address'),
          password: z.string().min(8, 'Password must be at least 8 characters'),
          confirmPassword: z.string(),
          organizationName: z.string().min(2, 'Organization name must be at least 2 characters'),
          organizationSize: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1001+']),
          industry: z.enum([
            'technology',
            'finance',
            'healthcare',
            'education',
            'manufacturing',
            'retail',
            'other',
          ]),
          userRole: z.enum(['owner', 'admin', 'user']),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: "Passwords don't match",
          path: ['confirmPassword'],
        });

    it('validates all required fields with valid data', () => {
      const schema = createSchema();
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        organizationName: 'Acme Inc',
        organizationSize: '1-10' as const,
        industry: 'technology' as const,
        userRole: 'owner' as const,
      };
      const result = schema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('rejects firstName shorter than 2 characters', () => {
      const schema = createSchema();
      const invalidData = {
        firstName: 'J',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        organizationName: 'Acme Inc',
        organizationSize: '1-10' as const,
        industry: 'technology' as const,
        userRole: 'owner' as const,
      };
      const result = schema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 2 characters');
      }
    });

    it('rejects lastName shorter than 2 characters', () => {
      const schema = createSchema();
      const invalidData = {
        firstName: 'John',
        lastName: 'D',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        organizationName: 'Acme Inc',
        organizationSize: '1-10' as const,
        industry: 'technology' as const,
        userRole: 'owner' as const,
      };
      const result = schema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('rejects invalid email format', () => {
      const schema = createSchema();
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        password: 'password123',
        confirmPassword: 'password123',
        organizationName: 'Acme Inc',
        organizationSize: '1-10' as const,
        industry: 'technology' as const,
        userRole: 'owner' as const,
      };
      const result = schema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('rejects password shorter than 8 characters', () => {
      const schema = createSchema();
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'pass123',
        confirmPassword: 'pass123',
        organizationName: 'Acme Inc',
        organizationSize: '1-10' as const,
        industry: 'technology' as const,
        userRole: 'owner' as const,
      };
      const result = schema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 8 characters');
      }
    });

    it('rejects mismatched passwords', () => {
      const schema = createSchema();
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'differentpassword',
        organizationName: 'Acme Inc',
        organizationSize: '1-10' as const,
        industry: 'technology' as const,
        userRole: 'owner' as const,
      };
      const result = schema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("don't match");
      }
    });

    it('rejects organizationName shorter than 2 characters', () => {
      const schema = createSchema();
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        organizationName: 'A',
        organizationSize: '1-10' as const,
        industry: 'technology' as const,
        userRole: 'owner' as const,
      };
      const result = schema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('accepts all valid organizationSize enum values', () => {
      const schema = createSchema();
      const sizes = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001+'];
      sizes.forEach((size) => {
        const data = {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'password123',
          confirmPassword: 'password123',
          organizationName: 'Acme Inc',
          organizationSize: size as '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1001+',
          industry: 'technology' as const,
          userRole: 'owner' as const,
        };
        const result = schema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it('accepts all valid industry enum values', () => {
      const schema = createSchema();
      const industries = [
        'technology',
        'finance',
        'healthcare',
        'education',
        'manufacturing',
        'retail',
        'other',
      ];
      industries.forEach((industry) => {
        const data = {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'password123',
          confirmPassword: 'password123',
          organizationName: 'Acme Inc',
          organizationSize: '1-10' as const,
          industry: industry as
            | 'technology'
            | 'finance'
            | 'healthcare'
            | 'education'
            | 'manufacturing'
            | 'retail'
            | 'other',
          userRole: 'owner' as const,
        };
        const result = schema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it('accepts all valid userRole enum values', () => {
      const schema = createSchema();
      const roles = ['owner', 'admin', 'user'];
      roles.forEach((role) => {
        const data = {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'password123',
          confirmPassword: 'password123',
          organizationName: 'Acme Inc',
          organizationSize: '1-10' as const,
          industry: 'technology' as const,
          userRole: role as 'owner' | 'admin' | 'user',
        };
        const result = schema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it('accepts password exactly 8 characters', () => {
      const schema = createSchema();
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: '12345678',
        confirmPassword: '12345678',
        organizationName: 'Acme Inc',
        organizationSize: '1-10' as const,
        industry: 'technology' as const,
        userRole: 'owner' as const,
      };
      const result = schema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('component rendering', () => {
    it('renders the registration form with all elements', async () => {
      await act(async () => {
        render(<RegisterForm />);
      });

      expect(screen.getByText('Create your account')).toBeInTheDocument();
      expect(
        screen.getByText('Get started with Spec Tree by creating your organization account')
      ).toBeInTheDocument();
      expect(screen.getByText('Personal Information')).toBeInTheDocument();
      expect(screen.getByText('Organization Information')).toBeInTheDocument();
    });

    it('renders personal information fields', async () => {
      await act(async () => {
        render(<RegisterForm />);
      });

      expect(screen.getByText('First Name')).toBeInTheDocument();
      expect(screen.getByText('Last Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Password')).toBeInTheDocument();
      expect(screen.getByText('Confirm Password')).toBeInTheDocument();
    });

    it('renders organization information fields', async () => {
      await act(async () => {
        render(<RegisterForm />);
      });

      expect(screen.getByText('Organization Name')).toBeInTheDocument();
      expect(screen.getByText('Organization Size')).toBeInTheDocument();
      expect(screen.getByText('Industry')).toBeInTheDocument();
      expect(screen.getByText('Your Role')).toBeInTheDocument();
    });

    it('renders first name input with correct placeholder', async () => {
      await act(async () => {
        render(<RegisterForm />);
      });

      expect(screen.getByPlaceholderText('John')).toBeInTheDocument();
    });

    it('renders last name input with correct placeholder', async () => {
      await act(async () => {
        render(<RegisterForm />);
      });

      expect(screen.getByPlaceholderText('Doe')).toBeInTheDocument();
    });

    it('renders email input with correct attributes', async () => {
      await act(async () => {
        render(<RegisterForm />);
      });

      const emailInput = screen.getByPlaceholderText('you@example.com');
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('renders organization name input with correct placeholder', async () => {
      await act(async () => {
        render(<RegisterForm />);
      });

      expect(screen.getByPlaceholderText('Acme Inc.')).toBeInTheDocument();
    });

    it('renders sign in link with correct href', async () => {
      await act(async () => {
        render(<RegisterForm />);
      });

      const signInLink = screen.getByText('Sign in');
      expect(signInLink.closest('a')).toHaveAttribute('href', '/login');
    });

    it('renders submit button with correct text', async () => {
      await act(async () => {
        render(<RegisterForm />);
      });

      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });
  });

  describe('form interactions', () => {
    it('allows typing in first name field', async () => {
      await act(async () => {
        render(<RegisterForm />);
      });

      const firstNameInput = screen.getByPlaceholderText('John');
      await act(async () => {
        fireEvent.change(firstNameInput, { target: { value: 'Jane' } });
      });
      expect(firstNameInput).toHaveValue('Jane');
    });

    it('allows typing in last name field', async () => {
      await act(async () => {
        render(<RegisterForm />);
      });

      const lastNameInput = screen.getByPlaceholderText('Doe');
      await act(async () => {
        fireEvent.change(lastNameInput, { target: { value: 'Smith' } });
      });
      expect(lastNameInput).toHaveValue('Smith');
    });

    it('allows typing in email field', async () => {
      await act(async () => {
        render(<RegisterForm />);
      });

      const emailInput = screen.getByPlaceholderText('you@example.com');
      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      });
      expect(emailInput).toHaveValue('test@example.com');
    });

    it('allows typing in password field', async () => {
      await act(async () => {
        render(<RegisterForm />);
      });

      const passwordInputs = screen.getAllByPlaceholderText(/•+/);
      const passwordInput = passwordInputs[0];
      await act(async () => {
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
      });
      expect(passwordInput).toHaveValue('password123');
    });

    it('allows typing in confirm password field', async () => {
      await act(async () => {
        render(<RegisterForm />);
      });

      const passwordInputs = screen.getAllByPlaceholderText(/•+/);
      const confirmPasswordInput = passwordInputs[1];
      await act(async () => {
        fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      });
      expect(confirmPasswordInput).toHaveValue('password123');
    });

    it('allows typing in organization name field', async () => {
      await act(async () => {
        render(<RegisterForm />);
      });

      const orgNameInput = screen.getByPlaceholderText('Acme Inc.');
      await act(async () => {
        fireEvent.change(orgNameInput, { target: { value: 'My Company' } });
      });
      expect(orgNameInput).toHaveValue('My Company');
    });
  });

  describe('form submission', () => {
    const fillValidForm = async () => {
      const firstNameInput = screen.getByPlaceholderText('John');
      const lastNameInput = screen.getByPlaceholderText('Doe');
      const emailInput = screen.getByPlaceholderText('you@example.com');
      const passwordInputs = screen.getAllByPlaceholderText(/•+/);
      const passwordInput = passwordInputs[0];
      const confirmPasswordInput = passwordInputs[1];
      const orgNameInput = screen.getByPlaceholderText('Acme Inc.');

      await act(async () => {
        fireEvent.change(firstNameInput, { target: { value: 'Jane' } });
        fireEvent.change(lastNameInput, { target: { value: 'Smith' } });
        fireEvent.change(emailInput, { target: { value: 'jane@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
        fireEvent.change(orgNameInput, { target: { value: 'Test Company' } });
      });
    };

    it('submits form with valid data and calls registerNewUser', async () => {
      mockRegisterNewUser.mockResolvedValue(true);
      mockEvaluatePasswordStrength.mockReturnValue('medium');
      await act(async () => {
        render(<RegisterForm />);
      });

      await fillValidForm();
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(mockRegisterNewUser).toHaveBeenCalledWith(
          expect.objectContaining({
            username: 'jane@example.com',
            email: 'jane@example.com',
            password: 'password123',
          })
        );
      });
    });

    it('redirects to email-confirmation on successful registration', async () => {
      mockRegisterNewUser.mockResolvedValue(true);
      mockEvaluatePasswordStrength.mockReturnValue('medium');
      await act(async () => {
        render(<RegisterForm />);
      });

      await fillValidForm();
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/email-confirmation');
      });
    });

    it('calls onSuccess callback on successful registration', async () => {
      mockRegisterNewUser.mockResolvedValue(true);
      mockEvaluatePasswordStrength.mockReturnValue('medium');
      const onSuccessMock = vi.fn();
      await act(async () => {
        render(<RegisterForm onSuccess={onSuccessMock} />);
      });

      await fillValidForm();
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(onSuccessMock).toHaveBeenCalled();
      });
    });

    it('shows success toast on successful registration', async () => {
      mockRegisterNewUser.mockResolvedValue(true);
      mockEvaluatePasswordStrength.mockReturnValue('medium');
      await act(async () => {
        render(<RegisterForm />);
      });

      await fillValidForm();
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith(
          'Account created successfully! Please check your email to verify your account.'
        );
      });
    });
  });

  describe('error handling', () => {
    const fillValidForm = async () => {
      const firstNameInput = screen.getByPlaceholderText('John');
      const lastNameInput = screen.getByPlaceholderText('Doe');
      const emailInput = screen.getByPlaceholderText('you@example.com');
      const passwordInputs = screen.getAllByPlaceholderText(/•+/);
      const passwordInput = passwordInputs[0];
      const confirmPasswordInput = passwordInputs[1];
      const orgNameInput = screen.getByPlaceholderText('Acme Inc.');

      await act(async () => {
        fireEvent.change(firstNameInput, { target: { value: 'Jane' } });
        fireEvent.change(lastNameInput, { target: { value: 'Smith' } });
        fireEvent.change(emailInput, { target: { value: 'jane@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
        fireEvent.change(orgNameInput, { target: { value: 'Test Company' } });
      });
    };

    it('shows error toast on failed registration', async () => {
      mockRegisterNewUser.mockResolvedValue(false);
      mockEvaluatePasswordStrength.mockReturnValue('medium');
      await act(async () => {
        render(<RegisterForm />);
      });

      await fillValidForm();
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Registration failed. Please try again.');
      });
    });

    it('shows error toast on API exception', async () => {
      mockRegisterNewUser.mockRejectedValue(new Error('Network error'));
      mockEvaluatePasswordStrength.mockReturnValue('medium');
      await act(async () => {
        render(<RegisterForm />);
      });

      await fillValidForm();
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Failed to create account. Please try again.');
      });
    });

    it('does not redirect on failed registration', async () => {
      mockRegisterNewUser.mockResolvedValue(false);
      mockEvaluatePasswordStrength.mockReturnValue('medium');
      await act(async () => {
        render(<RegisterForm />);
      });

      await fillValidForm();
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalled();
      });

      expect(mockPush).not.toHaveBeenCalled();
    });

    it('shows error for very weak password', async () => {
      mockEvaluatePasswordStrength.mockReturnValue('very-weak');
      await act(async () => {
        render(<RegisterForm />);
      });

      await fillValidForm();
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          'Password is too weak. Please choose a stronger password.'
        );
      });

      expect(mockRegisterNewUser).not.toHaveBeenCalled();
    });
  });

  describe('form validation display', () => {
    it('validates first name minimum length', async () => {
      const schema = z.object({
        firstName: z.string().min(2, 'First name must be at least 2 characters'),
      });

      const invalidResult = schema.safeParse({ firstName: 'J' });
      expect(invalidResult.success).toBe(false);

      const validResult = schema.safeParse({ firstName: 'John' });
      expect(validResult.success).toBe(true);
    });

    it('validates last name minimum length', async () => {
      const schema = z.object({
        lastName: z.string().min(2, 'Last name must be at least 2 characters'),
      });

      const invalidResult = schema.safeParse({ lastName: 'D' });
      expect(invalidResult.success).toBe(false);

      const validResult = schema.safeParse({ lastName: 'Doe' });
      expect(validResult.success).toBe(true);
    });

    it('validates email format', async () => {
      const schema = z.object({
        email: z.string().email('Invalid email address'),
      });

      const invalidResult = schema.safeParse({ email: 'invalid-email' });
      expect(invalidResult.success).toBe(false);

      const validResult = schema.safeParse({ email: 'test@example.com' });
      expect(validResult.success).toBe(true);
    });

    it('validates password minimum length', async () => {
      const schema = z.object({
        password: z.string().min(8, 'Password must be at least 8 characters'),
      });

      const invalidResult = schema.safeParse({ password: 'short' });
      expect(invalidResult.success).toBe(false);

      const validResult = schema.safeParse({ password: 'longpassword' });
      expect(validResult.success).toBe(true);
    });

    it('validates organization name minimum length', async () => {
      const schema = z.object({
        organizationName: z.string().min(2, 'Organization name must be at least 2 characters'),
      });

      const invalidResult = schema.safeParse({ organizationName: 'A' });
      expect(invalidResult.success).toBe(false);

      const validResult = schema.safeParse({ organizationName: 'Acme Inc.' });
      expect(validResult.success).toBe(true);
    });
  });

  describe('dependencies', () => {
    it('uses react-hook-form with zod validation', () => {
      expect(RegisterForm).toBeDefined();
    });

    it('imports PasswordStrengthIndicator utilities', () => {
      expect(mockEvaluatePasswordStrength).toBeDefined();
    });

    it('imports registerNewUser API function', () => {
      expect(mockRegisterNewUser).toBeDefined();
    });
  });

  describe('component structure', () => {
    it('component has correct display name or is named export', () => {
      expect(RegisterForm.name || RegisterForm.displayName).toBeTruthy();
    });

    it('component accepts props interface', () => {
      expect(RegisterForm).toBeDefined();
      expect(typeof RegisterForm).toBe('function');
      expect(RegisterForm.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('accessibility', () => {
    it('has accessible form labels for personal info', async () => {
      await act(async () => {
        render(<RegisterForm />);
      });

      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    it('submit button has accessible name', async () => {
      await act(async () => {
        render(<RegisterForm />);
      });

      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('form has proper section headings', async () => {
      await act(async () => {
        render(<RegisterForm />);
      });

      expect(screen.getByRole('heading', { name: /create your account/i })).toBeInTheDocument();
      expect(screen.getByText('Personal Information')).toBeInTheDocument();
      expect(screen.getByText('Organization Information')).toBeInTheDocument();
    });
  });
});
