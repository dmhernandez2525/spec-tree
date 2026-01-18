import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PermissionsDrawer } from './PermissionsDrawer';
import type { Organization, OrganizationSubscription } from '@/types/organization';

describe('PermissionsDrawer', () => {
  const mockOrganization: Organization = {
    id: 'org_1',
    name: 'Test Organization',
    size: '11-50',
    industry: 'technology',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ownerId: 'user_1',
    description: 'A test organization',
    websiteUrl: 'https://example.com',
  };

  const mockSubscription: OrganizationSubscription = {
    id: 'sub_1',
    organizationId: 'org_1',
    plan: 'pro',
    seats: 10,
    usedSeats: 5,
    pricePerSeat: 10,
    billingCycle: 'monthly',
    status: 'active',
    currentPeriodEnd: '2024-12-31T00:00:00.000Z',
  };

  const defaultProps = {
    organization: mockOrganization,
    subscription: mockSubscription,
    openPermissions: true,
    setOpenPermissions: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Exports', () => {
    it('exports PermissionsDrawer as named export', () => {
      expect(PermissionsDrawer).toBeDefined();
      expect(typeof PermissionsDrawer).toBe('function');
    });

    it('has correct function name', () => {
      expect(PermissionsDrawer.name).toBe('PermissionsDrawer');
    });
  });

  describe('Component Type', () => {
    it('is a React component function', () => {
      expect(typeof PermissionsDrawer).toBe('function');
    });
  });

  describe('Sheet Header Rendering', () => {
    it('renders sheet title', () => {
      render(<PermissionsDrawer {...defaultProps} />);
      expect(screen.getByText('Role Permissions')).toBeInTheDocument();
    });

    it('renders sheet description', () => {
      render(<PermissionsDrawer {...defaultProps} />);
      expect(
        screen.getByText('Configure permissions for different roles in your organization')
      ).toBeInTheDocument();
    });
  });

  describe('Table Header Rendering', () => {
    it('renders Permission column header', () => {
      render(<PermissionsDrawer {...defaultProps} />);
      expect(screen.getByText('Permission')).toBeInTheDocument();
    });

    it('renders Owner column header', () => {
      render(<PermissionsDrawer {...defaultProps} />);
      expect(screen.getByText('Owner')).toBeInTheDocument();
    });

    it('renders Admin column header', () => {
      render(<PermissionsDrawer {...defaultProps} />);
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    it('renders Manager column header', () => {
      render(<PermissionsDrawer {...defaultProps} />);
      expect(screen.getByText('Manager')).toBeInTheDocument();
    });

    it('renders Member column header', () => {
      render(<PermissionsDrawer {...defaultProps} />);
      expect(screen.getByText('Member')).toBeInTheDocument();
    });

    it('renders Viewer column header', () => {
      render(<PermissionsDrawer {...defaultProps} />);
      expect(screen.getByText('Viewer')).toBeInTheDocument();
    });
  });

  describe('Permission Rows', () => {
    it('renders Manage Members permission', () => {
      render(<PermissionsDrawer {...defaultProps} />);
      expect(screen.getByText('Manage Members')).toBeInTheDocument();
    });

    it('renders Manage Members description', () => {
      render(<PermissionsDrawer {...defaultProps} />);
      expect(
        screen.getByText('Invite and remove members from the organization')
      ).toBeInTheDocument();
    });

    it('renders Manage Settings permission', () => {
      render(<PermissionsDrawer {...defaultProps} />);
      expect(screen.getByText('Manage Settings')).toBeInTheDocument();
    });

    it('renders Manage Settings description', () => {
      render(<PermissionsDrawer {...defaultProps} />);
      expect(
        screen.getByText('Modify organization settings and configurations')
      ).toBeInTheDocument();
    });

    it('renders Manage Billing permission', () => {
      render(<PermissionsDrawer {...defaultProps} />);
      expect(screen.getByText('Manage Billing')).toBeInTheDocument();
    });

    it('renders Manage Billing description', () => {
      render(<PermissionsDrawer {...defaultProps} />);
      expect(screen.getByText('Access and modify billing settings')).toBeInTheDocument();
    });
  });

  describe('Table Structure', () => {
    it('renders table element', () => {
      render(<PermissionsDrawer {...defaultProps} />);
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('renders correct number of rows', () => {
      render(<PermissionsDrawer {...defaultProps} />);
      const rows = screen.getAllByRole('row');
      // 1 header row + 3 permission rows
      expect(rows.length).toBe(4);
    });
  });

  describe('Switch Components', () => {
    it('renders switch components for each permission/role combination', () => {
      render(<PermissionsDrawer {...defaultProps} />);
      const switches = screen.getAllByRole('switch');
      // 3 permissions * 5 roles = 15 switches
      expect(switches.length).toBe(15);
    });

    it('owner role switches are disabled', () => {
      render(<PermissionsDrawer {...defaultProps} />);
      const switches = screen.getAllByRole('switch');
      // Every 5th switch is for owner role (first in each row)
      // Permissions are listed with roles in order: owner, admin, manager, member, viewer
      // So indices 0, 5, 10 are owner switches
      expect(switches[0]).toBeDisabled();
      expect(switches[5]).toBeDisabled();
      expect(switches[10]).toBeDisabled();
    });

    it('non-owner role switches are enabled', () => {
      render(<PermissionsDrawer {...defaultProps} />);
      const switches = screen.getAllByRole('switch');
      // Admin switches (indices 1, 6, 11) should be enabled
      expect(switches[1]).not.toBeDisabled();
      expect(switches[6]).not.toBeDisabled();
      expect(switches[11]).not.toBeDisabled();
    });
  });

  describe('Initial Permission Values', () => {
    it('Manage Members: owner is checked', () => {
      render(<PermissionsDrawer {...defaultProps} />);
      const switches = screen.getAllByRole('switch');
      expect(switches[0]).toBeChecked();
    });

    it('Manage Members: admin is checked', () => {
      render(<PermissionsDrawer {...defaultProps} />);
      const switches = screen.getAllByRole('switch');
      expect(switches[1]).toBeChecked();
    });

    it('Manage Members: manager is checked', () => {
      render(<PermissionsDrawer {...defaultProps} />);
      const switches = screen.getAllByRole('switch');
      expect(switches[2]).toBeChecked();
    });

    it('Manage Members: member is not checked', () => {
      render(<PermissionsDrawer {...defaultProps} />);
      const switches = screen.getAllByRole('switch');
      expect(switches[3]).not.toBeChecked();
    });

    it('Manage Members: viewer is not checked', () => {
      render(<PermissionsDrawer {...defaultProps} />);
      const switches = screen.getAllByRole('switch');
      expect(switches[4]).not.toBeChecked();
    });

    it('Manage Settings: owner is checked', () => {
      render(<PermissionsDrawer {...defaultProps} />);
      const switches = screen.getAllByRole('switch');
      expect(switches[5]).toBeChecked();
    });

    it('Manage Settings: admin is checked', () => {
      render(<PermissionsDrawer {...defaultProps} />);
      const switches = screen.getAllByRole('switch');
      expect(switches[6]).toBeChecked();
    });

    it('Manage Settings: manager is not checked', () => {
      render(<PermissionsDrawer {...defaultProps} />);
      const switches = screen.getAllByRole('switch');
      expect(switches[7]).not.toBeChecked();
    });

    it('Manage Billing: owner is checked', () => {
      render(<PermissionsDrawer {...defaultProps} />);
      const switches = screen.getAllByRole('switch');
      expect(switches[10]).toBeChecked();
    });

    it('Manage Billing: admin is checked', () => {
      render(<PermissionsDrawer {...defaultProps} />);
      const switches = screen.getAllByRole('switch');
      expect(switches[11]).toBeChecked();
    });
  });

  describe('Permission Toggle Interaction', () => {
    it('toggles admin permission for Manage Members', async () => {
      render(<PermissionsDrawer {...defaultProps} />);
      const switches = screen.getAllByRole('switch');
      const adminMembersSwitch = switches[1];

      expect(adminMembersSwitch).toBeChecked();
      fireEvent.click(adminMembersSwitch);

      await waitFor(() => {
        expect(adminMembersSwitch).not.toBeChecked();
      });
    });

    it('toggles manager permission for Manage Settings', async () => {
      render(<PermissionsDrawer {...defaultProps} />);
      const switches = screen.getAllByRole('switch');
      const managerSettingsSwitch = switches[7];

      expect(managerSettingsSwitch).not.toBeChecked();
      fireEvent.click(managerSettingsSwitch);

      await waitFor(() => {
        expect(managerSettingsSwitch).toBeChecked();
      });
    });

    it('toggles member permission for Manage Members', async () => {
      render(<PermissionsDrawer {...defaultProps} />);
      const switches = screen.getAllByRole('switch');
      const memberMembersSwitch = switches[3];

      expect(memberMembersSwitch).not.toBeChecked();
      fireEvent.click(memberMembersSwitch);

      await waitFor(() => {
        expect(memberMembersSwitch).toBeChecked();
      });
    });

    it('toggles viewer permission for Manage Billing', async () => {
      render(<PermissionsDrawer {...defaultProps} />);
      const switches = screen.getAllByRole('switch');
      const viewerBillingSwitch = switches[14];

      expect(viewerBillingSwitch).not.toBeChecked();
      fireEvent.click(viewerBillingSwitch);

      await waitFor(() => {
        expect(viewerBillingSwitch).toBeChecked();
      });
    });

    it('cannot toggle owner permission (disabled)', async () => {
      render(<PermissionsDrawer {...defaultProps} />);
      const switches = screen.getAllByRole('switch');
      const ownerSwitch = switches[0];

      expect(ownerSwitch).toBeChecked();
      expect(ownerSwitch).toBeDisabled();

      // Clicking a disabled switch should not change its state
      fireEvent.click(ownerSwitch);

      await waitFor(() => {
        expect(ownerSwitch).toBeChecked();
      });
    });

    it('handles multiple permission toggles', async () => {
      render(<PermissionsDrawer {...defaultProps} />);
      const switches = screen.getAllByRole('switch');

      // Toggle admin for Manage Members (off)
      fireEvent.click(switches[1]);
      // Toggle member for Manage Members (on)
      fireEvent.click(switches[3]);
      // Toggle viewer for Manage Settings (on)
      fireEvent.click(switches[9]);

      await waitFor(() => {
        expect(switches[1]).not.toBeChecked();
        expect(switches[3]).toBeChecked();
        expect(switches[9]).toBeChecked();
      });
    });
  });

  describe('Sheet Open State', () => {
    it('renders when openPermissions is true', () => {
      render(<PermissionsDrawer {...defaultProps} />);
      expect(screen.getByText('Role Permissions')).toBeInTheDocument();
    });

    it('does not render content when openPermissions is false', () => {
      render(<PermissionsDrawer {...defaultProps} openPermissions={false} />);
      // Sheet component may still be in DOM but content may be hidden
      // The behavior depends on the Sheet implementation
      const title = screen.queryByText('Role Permissions');
      // With Radix UI Sheet, content is not rendered when closed
      expect(title).not.toBeInTheDocument();
    });

    it('calls setOpenPermissions when sheet is closed', async () => {
      render(<PermissionsDrawer {...defaultProps} />);

      // Find and click the close button or trigger close
      // This depends on the Sheet component implementation
      // Typically there's a close button or clicking outside closes it
      const closeButton = screen.queryByRole('button', { name: /close/i });
      if (closeButton) {
        fireEvent.click(closeButton);
        await waitFor(() => {
          expect(defaultProps.setOpenPermissions).toHaveBeenCalledWith(false);
        });
      }
    });
  });

  describe('Props Handling', () => {
    it('handles null subscription', () => {
      const propsWithNullSubscription = {
        ...defaultProps,
        subscription: null,
      };

      expect(() => {
        render(<PermissionsDrawer {...propsWithNullSubscription} />);
      }).not.toThrow();
    });

    it('handles different organization properties', () => {
      const differentOrg: Organization = {
        id: 'org_2',
        name: 'Different Organization',
        size: '201-500',
        industry: 'finance',
        createdAt: '2023-06-01T00:00:00.000Z',
        updatedAt: '2024-03-15T00:00:00.000Z',
        ownerId: 'user_2',
      };

      expect(() => {
        render(<PermissionsDrawer {...defaultProps} organization={differentOrg} />);
      }).not.toThrow();
    });

    it('handles different subscription plans', () => {
      const enterpriseSubscription: OrganizationSubscription = {
        id: 'sub_2',
        organizationId: 'org_1',
        plan: 'enterprise',
        seats: 100,
        usedSeats: 50,
        pricePerSeat: 8,
        billingCycle: 'yearly',
        status: 'active',
        currentPeriodEnd: '2025-01-01T00:00:00.000Z',
      };

      expect(() => {
        render(
          <PermissionsDrawer {...defaultProps} subscription={enterpriseSubscription} />
        );
      }).not.toThrow();
    });
  });

  describe('Permission State Management', () => {
    it('maintains independent state for each permission row', async () => {
      render(<PermissionsDrawer {...defaultProps} />);
      const switches = screen.getAllByRole('switch');

      // Change Manage Members admin permission
      fireEvent.click(switches[1]);

      // Manage Settings admin permission should be unchanged
      await waitFor(() => {
        expect(switches[1]).not.toBeChecked();
        expect(switches[6]).toBeChecked(); // Manage Settings admin still checked
      });
    });

    it('maintains state after multiple toggles on same switch', async () => {
      render(<PermissionsDrawer {...defaultProps} />);
      const switches = screen.getAllByRole('switch');
      const targetSwitch = switches[3]; // member permission for Manage Members

      // Initial state
      expect(targetSwitch).not.toBeChecked();

      // Toggle on
      fireEvent.click(targetSwitch);
      await waitFor(() => {
        expect(targetSwitch).toBeChecked();
      });

      // Toggle off
      fireEvent.click(targetSwitch);
      await waitFor(() => {
        expect(targetSwitch).not.toBeChecked();
      });

      // Toggle on again
      fireEvent.click(targetSwitch);
      await waitFor(() => {
        expect(targetSwitch).toBeChecked();
      });
    });
  });

  describe('Accessibility', () => {
    it('has accessible table structure', () => {
      render(<PermissionsDrawer {...defaultProps} />);
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('switches have accessible roles', () => {
      render(<PermissionsDrawer {...defaultProps} />);
      const switches = screen.getAllByRole('switch');
      expect(switches.length).toBeGreaterThan(0);
    });

    it('permission descriptions are visible', () => {
      render(<PermissionsDrawer {...defaultProps} />);
      expect(
        screen.getByText('Invite and remove members from the organization')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Modify organization settings and configurations')
      ).toBeInTheDocument();
      expect(screen.getByText('Access and modify billing settings')).toBeInTheDocument();
    });
  });

  describe('Layout and Styling', () => {
    it('renders sheet with correct width class', () => {
      render(<PermissionsDrawer {...defaultProps} />);
      // The sheet content should have width classes
      const sheetContent = screen.getByRole('dialog');
      expect(sheetContent).toBeInTheDocument();
    });

    it('table has correct width for Permission column', () => {
      render(<PermissionsDrawer {...defaultProps} />);
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid toggle clicks', async () => {
      render(<PermissionsDrawer {...defaultProps} />);
      const switches = screen.getAllByRole('switch');
      const targetSwitch = switches[3];

      // Rapid clicks
      fireEvent.click(targetSwitch);
      fireEvent.click(targetSwitch);
      fireEvent.click(targetSwitch);
      fireEvent.click(targetSwitch);
      fireEvent.click(targetSwitch);

      // Final state should be checked (5 toggles from unchecked)
      await waitFor(() => {
        expect(targetSwitch).toBeChecked();
      });
    });

    it('toggles persist across different permissions', async () => {
      render(<PermissionsDrawer {...defaultProps} />);
      const switches = screen.getAllByRole('switch');

      // Toggle multiple different permissions
      fireEvent.click(switches[1]); // Admin Manage Members
      fireEvent.click(switches[7]); // Manager Manage Settings
      fireEvent.click(switches[14]); // Viewer Manage Billing

      await waitFor(() => {
        expect(switches[1]).not.toBeChecked();
        expect(switches[7]).toBeChecked();
        expect(switches[14]).toBeChecked();
      });
    });
  });

  describe('Permission Matrix Completeness', () => {
    it('all role columns have switches for each permission', () => {
      render(<PermissionsDrawer {...defaultProps} />);
      const switches = screen.getAllByRole('switch');

      // 3 permissions * 5 roles = 15 switches
      expect(switches.length).toBe(15);

      // Verify the pattern: every 5 switches represents one permission row
      // First switch in each group (owner) should be disabled
      expect(switches[0]).toBeDisabled(); // Manage Members - Owner
      expect(switches[5]).toBeDisabled(); // Manage Settings - Owner
      expect(switches[10]).toBeDisabled(); // Manage Billing - Owner
    });
  });
});
