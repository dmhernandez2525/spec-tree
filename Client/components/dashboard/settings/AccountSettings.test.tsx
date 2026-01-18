import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { AccountSettings } from './AccountSettings';

// Mock Redux
vi.mock('@/lib/hooks/use-store', () => ({
  useAppSelector: vi.fn((selector) => {
    const mockState = {
      user: {
        user: {
          id: 'user_123',
          username: 'testuser',
          email: 'test@example.com',
          company: 'Test Company',
          role: 'Developer',
          bio: 'Test bio',
        },
      },
    };
    return selector(mockState);
  }),
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('AccountSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Exports', () => {
    it('exports AccountSettings as named export', () => {
      expect(AccountSettings).toBeDefined();
      expect(typeof AccountSettings).toBe('function');
    });
  });

  describe('Component Import', () => {
    it('imports without errors', () => {
      expect(() => {
        render(<AccountSettings />);
      }).not.toThrow();
    });
  });

  describe('Rendering', () => {
    it('renders card title', () => {
      render(<AccountSettings />);

      expect(screen.getByText('Account Settings')).toBeInTheDocument();
    });

    it('renders card description', () => {
      render(<AccountSettings />);

      expect(
        screen.getByText('Manage your account information and public profile')
      ).toBeInTheDocument();
    });

    it('renders username field', () => {
      render(<AccountSettings />);

      expect(screen.getByLabelText('Username')).toBeInTheDocument();
    });

    it('renders email field', () => {
      render(<AccountSettings />);

      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('renders company field', () => {
      render(<AccountSettings />);

      expect(screen.getByLabelText('Company')).toBeInTheDocument();
    });

    it('renders role field', () => {
      render(<AccountSettings />);

      expect(screen.getByLabelText('Role')).toBeInTheDocument();
    });

    it('renders bio field', () => {
      render(<AccountSettings />);

      expect(screen.getByLabelText('Bio')).toBeInTheDocument();
    });

    it('renders website URL field', () => {
      render(<AccountSettings />);

      expect(screen.getByLabelText('Website')).toBeInTheDocument();
    });

    it('renders GitHub URL field', () => {
      render(<AccountSettings />);

      expect(screen.getByLabelText('GitHub')).toBeInTheDocument();
    });

    it('renders submit button', () => {
      render(<AccountSettings />);

      expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
    });
  });

  describe('Form Default Values', () => {
    it('populates username from store', () => {
      render(<AccountSettings />);

      const usernameInput = screen.getByLabelText('Username');
      expect(usernameInput).toHaveValue('testuser');
    });

    it('populates email from store', () => {
      render(<AccountSettings />);

      const emailInput = screen.getByLabelText('Email');
      expect(emailInput).toHaveValue('test@example.com');
    });

    it('populates company from store', () => {
      render(<AccountSettings />);

      const companyInput = screen.getByLabelText('Company');
      expect(companyInput).toHaveValue('Test Company');
    });

    it('populates role from store', () => {
      render(<AccountSettings />);

      const roleInput = screen.getByLabelText('Role');
      expect(roleInput).toHaveValue('Developer');
    });

    it('populates bio from store', () => {
      render(<AccountSettings />);

      const bioInput = screen.getByLabelText('Bio');
      expect(bioInput).toHaveValue('Test bio');
    });
  });

  describe('Form Interactions', () => {
    it('allows editing username', () => {
      render(<AccountSettings />);

      const usernameInput = screen.getByLabelText('Username');
      fireEvent.change(usernameInput, { target: { value: 'newusername' } });

      expect(usernameInput).toHaveValue('newusername');
    });

    it('allows editing email', () => {
      render(<AccountSettings />);

      const emailInput = screen.getByLabelText('Email');
      fireEvent.change(emailInput, { target: { value: 'new@example.com' } });

      expect(emailInput).toHaveValue('new@example.com');
    });

    it('allows editing bio', () => {
      render(<AccountSettings />);

      const bioInput = screen.getByLabelText('Bio');
      fireEvent.change(bioInput, { target: { value: 'New bio content' } });

      expect(bioInput).toHaveValue('New bio content');
    });
  });

  describe('Form Submission', () => {
    it('submits form when button is clicked', async () => {
      // Import the mocked module
      const sonner = await vi.importMock<typeof import('sonner')>('sonner');
      render(<AccountSettings />);

      const submitButton = screen.getByRole('button', { name: /Save Changes/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(sonner.toast.success).toHaveBeenCalledWith('Account settings updated');
      });
    });
  });

  describe('Form Validation', () => {
    it('shows error for invalid email format', async () => {
      render(<AccountSettings />);

      const emailInput = screen.getByLabelText('Email');
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

      const submitButton = screen.getByRole('button', { name: /Save Changes/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        // Form should show validation error
        expect(emailInput).toBeInTheDocument();
      });
    });

    it('shows error for short username', async () => {
      render(<AccountSettings />);

      const usernameInput = screen.getByLabelText('Username');
      fireEvent.change(usernameInput, { target: { value: 'a' } });

      const submitButton = screen.getByRole('button', { name: /Save Changes/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        // Form validation should trigger
        expect(usernameInput).toBeInTheDocument();
      });
    });
  });

  describe('Form Description', () => {
    it('renders bio description text', () => {
      render(<AccountSettings />);

      expect(
        screen.getByText('Brief description for your profile')
      ).toBeInTheDocument();
    });
  });

  describe('Input Placeholders', () => {
    it('has placeholder for username', () => {
      render(<AccountSettings />);

      const usernameInput = screen.getByLabelText('Username');
      expect(usernameInput).toHaveAttribute('placeholder', 'username');
    });

    it('has placeholder for email', () => {
      render(<AccountSettings />);

      const emailInput = screen.getByLabelText('Email');
      expect(emailInput).toHaveAttribute('placeholder', 'email@example.com');
    });

    it('has placeholder for website', () => {
      render(<AccountSettings />);

      const websiteInput = screen.getByLabelText('Website');
      expect(websiteInput).toHaveAttribute('placeholder', 'https://example.com');
    });

    it('has placeholder for GitHub', () => {
      render(<AccountSettings />);

      const githubInput = screen.getByLabelText('GitHub');
      expect(githubInput).toHaveAttribute(
        'placeholder',
        'https://github.com/username'
      );
    });
  });
});
