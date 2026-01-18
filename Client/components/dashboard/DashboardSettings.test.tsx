import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardSettings } from './DashboardSettings';
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

describe('DashboardSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the settings page', () => {
    render(<DashboardSettings />);

    expect(screen.getByText('Account Settings')).toBeInTheDocument();
    expect(
      screen.getByText('Manage your account settings and preferences.')
    ).toBeInTheDocument();
  });

  it('renders the Change Password card', () => {
    render(<DashboardSettings />);

    expect(screen.getByText('Change Password')).toBeInTheDocument();
    expect(
      screen.getByText('Update your password to keep your account secure.')
    ).toBeInTheDocument();
  });

  it('renders password input fields', () => {
    render(<DashboardSettings />);

    expect(screen.getByLabelText('Current Password')).toBeInTheDocument();
    expect(screen.getByLabelText('New Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument();
  });

  it('renders Update Password button', () => {
    render(<DashboardSettings />);

    expect(
      screen.getByRole('button', { name: 'Update Password' })
    ).toBeInTheDocument();
  });

  it('renders the Delete Account card', () => {
    render(<DashboardSettings />);

    // The h3 title in the card
    const deleteAccountHeading = screen.getByRole('heading', { name: 'Delete Account' });
    expect(deleteAccountHeading).toBeInTheDocument();
    expect(
      screen.getByText('Permanently delete your account and all associated data.')
    ).toBeInTheDocument();
  });

  it('renders delete confirmation warning', () => {
    render(<DashboardSettings />);

    expect(
      screen.getByText('This action cannot be undone. Please be certain.')
    ).toBeInTheDocument();
  });

  it('renders Delete Account button to trigger dialog', () => {
    render(<DashboardSettings />);

    const deleteButtons = screen.getAllByRole('button', {
      name: 'Delete Account',
    });
    expect(deleteButtons.length).toBeGreaterThan(0);
  });

  it('opens delete confirmation dialog when Delete Account button is clicked', async () => {
    const user = userEvent.setup();
    render(<DashboardSettings />);

    const deleteButton = screen.getAllByRole('button', {
      name: 'Delete Account',
    })[0];
    await user.click(deleteButton);

    expect(screen.getByText('Are you absolutely sure?')).toBeInTheDocument();
  });

  it('renders confirmation input in delete dialog', async () => {
    const user = userEvent.setup();
    render(<DashboardSettings />);

    const deleteButton = screen.getAllByRole('button', {
      name: 'Delete Account',
    })[0];
    await user.click(deleteButton);

    expect(
      screen.getByPlaceholderText('Type DELETE to confirm')
    ).toBeInTheDocument();
  });

  it('shows error toast when DELETE is not typed correctly', async () => {
    const user = userEvent.setup();
    render(<DashboardSettings />);

    // Open dialog
    const triggerButton = screen.getAllByRole('button', {
      name: 'Delete Account',
    })[0];
    await user.click(triggerButton);

    // Wait for dialog to open, then find the confirmation button
    await waitFor(() => {
      expect(screen.getByText('Are you absolutely sure?')).toBeInTheDocument();
    });

    // Find the delete button in the dialog (dialog footer button)
    const dialogButtons = screen.getAllByRole('button', {
      name: 'Delete Account',
    });
    const confirmButton = dialogButtons[dialogButtons.length - 1];
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        'Please type DELETE to confirm account deletion'
      );
    });
  });

  it('shows success toast when DELETE is typed correctly and delete is triggered', async () => {
    const user = userEvent.setup();
    render(<DashboardSettings />);

    // Open dialog
    const triggerButton = screen.getAllByRole('button', {
      name: 'Delete Account',
    })[0];
    await user.click(triggerButton);

    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByText('Are you absolutely sure?')).toBeInTheDocument();
    });

    // Type DELETE in confirmation input
    const input = screen.getByPlaceholderText('Type DELETE to confirm');
    await user.type(input, 'DELETE');

    // Click delete button in dialog
    const dialogButtons = screen.getAllByRole('button', {
      name: 'Delete Account',
    });
    const confirmButton = dialogButtons[dialogButtons.length - 1];
    await user.click(confirmButton);

    await waitFor(
      () => {
        expect(mockToast.success).toHaveBeenCalledWith(
          'Account deleted successfully'
        );
      },
      { timeout: 3000 }
    );
  });

  it('disables the button while deletion is in progress', async () => {
    const user = userEvent.setup();
    render(<DashboardSettings />);

    // Open dialog
    const triggerButton = screen.getAllByRole('button', {
      name: 'Delete Account',
    })[0];
    await user.click(triggerButton);

    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByText('Are you absolutely sure?')).toBeInTheDocument();
    });

    // Type DELETE
    const input = screen.getByPlaceholderText('Type DELETE to confirm');
    await user.type(input, 'DELETE');

    // Click delete and check loading state
    const dialogButtons = screen.getAllByRole('button', {
      name: 'Delete Account',
    });
    const confirmButton = dialogButtons[dialogButtons.length - 1];
    await user.click(confirmButton);

    // After clicking, the button should show loading state
    await waitFor(() => {
      expect(screen.getByText('Deleting...')).toBeInTheDocument();
    });
  });

  it('password inputs have correct type attribute', () => {
    render(<DashboardSettings />);

    const currentPassword = screen.getByLabelText('Current Password');
    const newPassword = screen.getByLabelText('New Password');
    const confirmPassword = screen.getByLabelText('Confirm New Password');

    expect(currentPassword).toHaveAttribute('type', 'password');
    expect(newPassword).toHaveAttribute('type', 'password');
    expect(confirmPassword).toHaveAttribute('type', 'password');
  });

  it('applies destructive styling to Delete Account card', () => {
    render(<DashboardSettings />);

    // Find the h3 heading specifically
    const deleteTitle = screen.getByRole('heading', { name: 'Delete Account' });
    expect(deleteTitle).toHaveClass('text-destructive');
  });
});
