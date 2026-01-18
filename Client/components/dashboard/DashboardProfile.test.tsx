import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardProfile } from './DashboardProfile';
import { toast } from 'sonner';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockToast = toast as unknown as {
  success: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
};

// Mock the updateUserProfile function
vi.mock('../../lib/store/user-slice', () => ({
  updateUserProfile: vi.fn().mockResolvedValue({}),
}));

describe('DashboardProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the profile page', () => {
    render(<DashboardProfile />);

    expect(screen.getByText('Profile Information')).toBeInTheDocument();
    expect(
      screen.getByText('Update your personal information and contact details.')
    ).toBeInTheDocument();
  });

  it('renders first name and last name fields', () => {
    render(<DashboardProfile />);

    expect(screen.getByText('First Name')).toBeInTheDocument();
    expect(screen.getByText('Last Name')).toBeInTheDocument();
  });

  it('renders email and phone number fields', () => {
    render(<DashboardProfile />);

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Phone Number')).toBeInTheDocument();
  });

  it('renders address fields', () => {
    render(<DashboardProfile />);

    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText('Street Address')).toBeInTheDocument();
    expect(screen.getByText('City')).toBeInTheDocument();
    expect(screen.getByText('State')).toBeInTheDocument();
    expect(screen.getByText('ZIP Code')).toBeInTheDocument();
  });

  it('renders Cancel and Save buttons', () => {
    render(<DashboardProfile />);

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Save changes' })
    ).toBeInTheDocument();
  });

  it('populates form with initial data', () => {
    const initialData = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phoneNumber: '555-1234',
      address: {
        street: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62701',
      },
    };

    render(<DashboardProfile initialData={initialData} />);

    // Check that fields have initial values
    const firstNameInput = screen.getByRole('textbox', { name: 'First Name' });
    const lastNameInput = screen.getByRole('textbox', { name: 'Last Name' });

    expect(firstNameInput).toHaveValue('John');
    expect(lastNameInput).toHaveValue('Doe');
  });

  it('email field is disabled', () => {
    const initialData = {
      email: 'john@example.com',
    };

    render(<DashboardProfile initialData={initialData} />);

    // The email input should be disabled
    const emailInputs = screen.getAllByRole('textbox');
    const emailInput = emailInputs.find(
      (input) => (input as HTMLInputElement).type === 'email'
    );
    expect(emailInput).toBeDisabled();
  });

  it('allows editing first name', async () => {
    const user = userEvent.setup();
    render(<DashboardProfile />);

    const firstNameInput = screen.getByRole('textbox', { name: 'First Name' });
    await user.clear(firstNameInput);
    await user.type(firstNameInput, 'Jane');

    expect(firstNameInput).toHaveValue('Jane');
  });

  it('allows editing last name', async () => {
    const user = userEvent.setup();
    render(<DashboardProfile />);

    const lastNameInput = screen.getByRole('textbox', { name: 'Last Name' });
    await user.clear(lastNameInput);
    await user.type(lastNameInput, 'Smith');

    expect(lastNameInput).toHaveValue('Smith');
  });

  it('shows validation error for short first name', async () => {
    const user = userEvent.setup();
    render(<DashboardProfile />);

    const firstNameInput = screen.getByRole('textbox', { name: 'First Name' });
    await user.clear(firstNameInput);
    await user.type(firstNameInput, 'J');

    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Save changes' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('First name must be at least 2 characters')
      ).toBeInTheDocument();
    });
  });

  it('shows validation error for short last name', async () => {
    const user = userEvent.setup();
    render(<DashboardProfile />);

    const lastNameInput = screen.getByRole('textbox', { name: 'Last Name' });
    await user.clear(lastNameInput);
    await user.type(lastNameInput, 'D');

    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Save changes' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('Last name must be at least 2 characters')
      ).toBeInTheDocument();
    });
  });

  it('phone number input has tel type', () => {
    render(<DashboardProfile />);

    // Find the phone input by its label relationship
    const phoneLabel = screen.getByText('Phone Number');
    const phoneInput = phoneLabel.closest('div')?.querySelector('input');
    expect(phoneInput).toHaveAttribute('type', 'tel');
  });

  it('renders separator between header and form', () => {
    render(<DashboardProfile />);

    // The separator component should be present
    const separator = document.querySelector('[role="none"]');
    expect(separator).toBeInTheDocument();
  });

  it('renders the form element', () => {
    render(<DashboardProfile />);

    const form = document.querySelector('form');
    expect(form).toBeInTheDocument();
  });

  it('submit button exists and is of type submit', () => {
    render(<DashboardProfile />);

    const submitButton = screen.getByRole('button', { name: 'Save changes' });
    expect(submitButton).toHaveAttribute('type', 'submit');
  });

  it('shows success toast after successful form submission', async () => {
    const user = userEvent.setup();

    const initialData = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    };

    render(<DashboardProfile initialData={initialData} />);

    // Submit the form with valid data
    const submitButton = screen.getByRole('button', { name: 'Save changes' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith(
        'Profile updated successfully'
      );
    });
  });
});
