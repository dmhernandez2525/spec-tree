import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemberManagement } from './MemberManagement';

// Mock dispatch function that can be controlled
const mockDispatchUnwrap = vi.fn();
const mockDispatch = vi.fn(() => ({
  unwrap: mockDispatchUnwrap,
}));

// Store state that can be modified
let mockMembers: Array<{
  id: string;
  userId: string;
  role: string;
  joinedAt: string;
}> = [];
let mockCurrentUserRole: string = 'admin';

// Mock Redux
vi.mock('@/lib/hooks/use-store', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: vi.fn((selector) => {
    const mockState = {
      organization: {
        members: mockMembers,
      },
      auth: {
        organizationRole: mockCurrentUserRole,
      },
    };
    return selector(mockState);
  }),
}));

// Mock organization-slice actions
const mockUpdateMemberRole = vi.fn();
const mockRemoveMember = vi.fn();

vi.mock('@/lib/store/organization-slice', () => ({
  updateMemberRole: (data: unknown) => {
    mockUpdateMemberRole(data);
    return { type: 'organization/updateMemberRole', payload: data };
  },
  removeMember: (id: string) => {
    mockRemoveMember(id);
    return { type: 'organization/removeMember', payload: id };
  },
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { toast } from 'sonner';

const _mockToast = toast as unknown as {
  success: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
};

// Mock Icons
vi.mock('@/components/shared/icons', () => ({
  Icons: {
    alert: ({ className }: { className?: string }) => (
      <span data-testid="icon-alert" className={className}>
        Alert
      </span>
    ),
  },
}));

describe('MemberManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDispatchUnwrap.mockResolvedValue({});
    mockCurrentUserRole = 'admin';
    mockMembers = [
      {
        id: 'member_1',
        userId: 'user_1',
        role: 'admin',
        joinedAt: '2024-01-15T00:00:00.000Z',
      },
      {
        id: 'member_2',
        userId: 'user_2',
        role: 'member',
        joinedAt: '2024-02-20T00:00:00.000Z',
      },
    ];
  });

  describe('Component Export', () => {
    it('exports MemberManagement as named export', () => {
      expect(MemberManagement).toBeDefined();
      expect(typeof MemberManagement).toBe('function');
    });
  });

  describe('Card Rendering', () => {
    it('renders card title and description', () => {
      render(<MemberManagement />);
      expect(screen.getByText('Team Members')).toBeInTheDocument();
      expect(
        screen.getByText('Manage your organizations team members and their roles')
      ).toBeInTheDocument();
    });
  });

  describe('Table Structure', () => {
    it('renders table with headers', () => {
      render(<MemberManagement />);
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('Member')).toBeInTheDocument();
      expect(screen.getByText('Role')).toBeInTheDocument();
      expect(screen.getByText('Joined')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('renders correct number of rows', () => {
      render(<MemberManagement />);
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBe(3); // 1 header + 2 data rows
    });
  });

  describe('Member Display', () => {
    it('renders member information', () => {
      render(<MemberManagement />);

      // Should have 2 users
      const userNames = screen.getAllByText('User Name');
      expect(userNames.length).toBe(2);

      const emails = screen.getAllByText('user@example.com');
      expect(emails.length).toBe(2);

      const activeBadges = screen.getAllByText('Active');
      expect(activeBadges.length).toBe(2);
    });
  });

  describe('Role Management for Admin', () => {
    it('renders role selects for admin users', () => {
      render(<MemberManagement />);
      const comboboxes = screen.getAllByRole('combobox');
      expect(comboboxes.length).toBe(2);
    });

    // Note: Radix UI Select component requires hasPointerCapture which is not
    // fully implemented in happy-dom. Role selection is tested via the combobox presence.
  });

  describe('Role Display for Non-Admin', () => {
    beforeEach(() => {
      mockCurrentUserRole = 'member';
    });

    it('does not render role selects for non-admin users', () => {
      render(<MemberManagement />);
      const comboboxes = screen.queryAllByRole('combobox');
      expect(comboboxes.length).toBe(0);
    });

    it('renders role as badge for non-admin users', () => {
      render(<MemberManagement />);
      expect(screen.getByText('Administrator')).toBeInTheDocument();
      expect(screen.getByText('Team Member')).toBeInTheDocument();
    });
  });

  describe('Remove Member for Admin', () => {
    it('renders remove buttons for non-owner members', () => {
      render(<MemberManagement />);
      const removeButtons = screen.getAllByTestId('icon-alert');
      expect(removeButtons.length).toBeGreaterThan(0);
    });

    it('does not render remove button for owner members', () => {
      mockMembers = [
        {
          id: 'member_1',
          userId: 'user_1',
          role: 'owner',
          joinedAt: '2024-01-15T00:00:00.000Z',
        },
      ];

      render(<MemberManagement />);
      const removeButtons = screen.queryAllByTestId('icon-alert');
      expect(removeButtons.length).toBe(0);
    });

  });

  describe('Remove Member for Non-Admin', () => {
    beforeEach(() => {
      mockCurrentUserRole = 'member';
    });

    it('does not render remove buttons for non-admin users', () => {
      render(<MemberManagement />);
      const removeButtons = screen.queryAllByTestId('icon-alert');
      expect(removeButtons.length).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty members list', () => {
      mockMembers = [];
      render(<MemberManagement />);
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBe(1); // Only header
    });

    it('handles single member', () => {
      mockMembers = [
        {
          id: 'member_1',
          userId: 'user_1',
          role: 'admin',
          joinedAt: '2024-01-15T00:00:00.000Z',
        },
      ];

      render(<MemberManagement />);
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBe(2); // Header + 1 member
    });
  });

  describe('Accessibility', () => {
    it('has accessible table structure', () => {
      render(<MemberManagement />);
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('remove buttons have screen reader text', () => {
      render(<MemberManagement />);
      const srTexts = screen.getAllByText('Remove member');
      expect(srTexts.length).toBeGreaterThan(0);
    });
  });
});
