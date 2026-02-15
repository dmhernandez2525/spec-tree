import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, act } from '@testing-library/react';
import { OrganizationManagement } from './OrganizationManagement';

// Mock Redux
vi.mock('@/lib/hooks/use-store', () => ({
  useAppDispatch: vi.fn(() => vi.fn(() => ({
    unwrap: vi.fn().mockResolvedValue({}),
  }))),
  useAppSelector: vi.fn((selector) => {
    const mockState = {
      organization: {
        currentOrganization: {
          id: 'org_123',
          name: 'Test Organization',
          size: '11-50',
          industry: 'technology',
        },
        subscription: {
          id: 'sub_123',
          plan: 'pro',
          status: 'active',
          seats: 10,
          usedSeats: 5,
          pricePerSeat: 10,
        },
        isLoading: false,
        error: null,
        members: [],
        invites: [],
      },
      auth: {
        organizationId: 'org_123',
        organizationRole: 'admin',
      },
    };
    return selector(mockState);
  }),
}));

// Mock organization-slice
vi.mock('@/lib/store/organization-slice', () => ({
  fetchOrganizationData: vi.fn((id) => ({
    type: 'organization/fetchOrganizationData',
    payload: id,
  })),
  updateOrganization: vi.fn((data) => ({
    type: 'organization/updateOrganization',
    payload: data,
  })),
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

// Mock Icons
vi.mock('@/components/shared/icons', () => ({
  Icons: {
    spinner: ({ className }: { className?: string }) => (
      <span data-testid="icon-spinner" className={className}>
        Spinner
      </span>
    ),
    alert: ({ className }: { className?: string }) => (
      <span data-testid="icon-alert" className={className}>
        Alert
      </span>
    ),
    users: ({ className }: { className?: string }) => (
      <span data-testid="icon-users" className={className}>
        Users
      </span>
    ),
    settings: ({ className }: { className?: string }) => (
      <span data-testid="icon-settings" className={className}>
        Settings
      </span>
    ),
    creditCard: ({ className }: { className?: string }) => (
      <span data-testid="icon-credit-card" className={className}>
        CreditCard
      </span>
    ),
    key: ({ className }: { className?: string }) => (
      <span data-testid="icon-key" className={className}>
        Key
      </span>
    ),
    plug: ({ className }: { className?: string }) => (
      <span data-testid="icon-plug" className={className}>
        Plug
      </span>
    ),
    brain: ({ className }: { className?: string }) => (
      <span data-testid="icon-brain" className={className}>
        Brain
      </span>
    ),
    eye: ({ className }: { className?: string }) => (
      <span data-testid="icon-eye" className={className}>
        Eye
      </span>
    ),
    sparkles: ({ className }: { className?: string }) => (
      <span data-testid="icon-sparkles" className={className}>
        Sparkles
      </span>
    ),
    shield: ({ className }: { className?: string }) => (
      <span data-testid="icon-shield" className={className}>
        Shield
      </span>
    ),
  },
}));

// Mock child components to simplify testing
vi.mock('./InviteUsers', () => ({
  InviteUsers: () => <div data-testid="invite-users">InviteUsers Component</div>,
}));

vi.mock('./MemberManagement', () => ({
  MemberManagement: () => (
    <div data-testid="member-management">MemberManagement Component</div>
  ),
}));

vi.mock('./SubscriptionManagement', () => ({
  SubscriptionManagement: () => (
    <div data-testid="subscription-management">SubscriptionManagement Component</div>
  ),
}));

vi.mock('./PermissionsDrawer', () => ({
  PermissionsDrawer: () => (
    <div data-testid="permissions-drawer">PermissionsDrawer Component</div>
  ),
}));

vi.mock('./settings/OrganizationSettings', () => ({
  OrganizationSettings: () => (
    <div data-testid="organization-settings">OrganizationSettings Component</div>
  ),
}));

vi.mock('./settings/SSOSettings', () => ({
  SSOSettings: () => <div data-testid="sso-settings">SSOSettings Component</div>,
}));

vi.mock('./settings/IntegrationsSettings', () => ({
  IntegrationsSettings: () => (
    <div data-testid="integrations-settings">IntegrationsSettings Component</div>
  ),
}));

vi.mock('./settings/AISettings', () => ({
  AISettings: () => <div data-testid="ai-settings">AISettings Component</div>,
}));

vi.mock('./ActivityFeed', () => ({
  ActivityFeed: () => <div data-testid="activity-feed">ActivityFeed Component</div>,
}));

vi.mock('./AuditLogViewer', () => ({
  AuditLogViewer: () => <div data-testid="audit-log-viewer">AuditLogViewer Component</div>,
}));

vi.mock('./TemplateLibrary', () => ({
  TemplateLibrary: () => <div data-testid="template-library">TemplateLibrary Component</div>,
}));

vi.mock('./APIKeyManager', () => ({
  APIKeyManager: () => <div data-testid="api-key-manager">APIKeyManager Component</div>,
}));

vi.mock('./QuotaDisplay', () => ({
  QuotaDisplay: () => <div data-testid="quota-display">QuotaDisplay Component</div>,
}));

describe('OrganizationManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await act(async () => {
      cleanup();
    });
  });

  describe('Exports', () => {
    it('exports OrganizationManagement as named export', () => {
      expect(OrganizationManagement).toBeDefined();
      expect(typeof OrganizationManagement).toBe('function');
    });
  });

  describe('Component Import', () => {
    it('imports without errors', async () => {
      await act(async () => {
        expect(() => {
          render(<OrganizationManagement />);
        }).not.toThrow();
      });
    });
  });

  describe('Rendering', () => {
    it('renders page title', async () => {
      await act(async () => {
        render(<OrganizationManagement />);
      });

      expect(screen.getByText('Organization Management')).toBeInTheDocument();
    });

    it('renders page description', async () => {
      await act(async () => {
        render(<OrganizationManagement />);
      });

      expect(
        screen.getByText('Manage your organizations settings and team')
      ).toBeInTheDocument();
    });

    it('renders subscription plan badge', async () => {
      await act(async () => {
        render(<OrganizationManagement />);
      });

      expect(screen.getByText('PRO Plan')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('renders Team Members tab', async () => {
      await act(async () => {
        render(<OrganizationManagement />);
      });

      expect(screen.getByRole('tab', { name: /Team Members/i })).toBeInTheDocument();
    });

    it('renders Settings tab', async () => {
      await act(async () => {
        render(<OrganizationManagement />);
      });

      // Use getAllByRole to handle multiple "Settings" text (icon + tab name)
      const tabs = screen.getAllByRole('tab');
      const settingsTab = tabs.find(tab => tab.textContent?.includes('Settings') && !tab.textContent?.includes('AI'));
      expect(settingsTab).toBeInTheDocument();
    });

    it('renders Subscription tab', async () => {
      await act(async () => {
        render(<OrganizationManagement />);
      });

      expect(screen.getByRole('tab', { name: /Subscription/i })).toBeInTheDocument();
    });

    it('renders SSO tab', async () => {
      await act(async () => {
        render(<OrganizationManagement />);
      });

      expect(screen.getByRole('tab', { name: /SSO/i })).toBeInTheDocument();
    });

    it('renders Integrations tab', async () => {
      await act(async () => {
        render(<OrganizationManagement />);
      });

      expect(screen.getByRole('tab', { name: /Integrations/i })).toBeInTheDocument();
    });

    it('renders AI Settings tab', async () => {
      await act(async () => {
        render(<OrganizationManagement />);
      });

      expect(screen.getByRole('tab', { name: /AI Settings/i })).toBeInTheDocument();
    });
  });

  describe('Default Tab Content', () => {
    it('shows MemberManagement by default', async () => {
      await act(async () => {
        render(<OrganizationManagement />);
      });

      expect(screen.getByTestId('member-management')).toBeInTheDocument();
    });

    it('shows InviteUsers by default', async () => {
      await act(async () => {
        render(<OrganizationManagement />);
      });

      expect(screen.getByTestId('invite-users')).toBeInTheDocument();
    });
  });

  describe('Tab Icons', () => {
    it('renders icons for each tab', async () => {
      await act(async () => {
        render(<OrganizationManagement />);
      });

      expect(screen.getByTestId('icon-users')).toBeInTheDocument();
      expect(screen.getByTestId('icon-settings')).toBeInTheDocument();
      expect(screen.getByTestId('icon-credit-card')).toBeInTheDocument();
      expect(screen.getAllByTestId('icon-key')).toHaveLength(2); // SSO + API Keys
      expect(screen.getByTestId('icon-plug')).toBeInTheDocument();
      expect(screen.getByTestId('icon-brain')).toBeInTheDocument();
      expect(screen.getByTestId('icon-eye')).toBeInTheDocument();
      expect(screen.getByTestId('icon-sparkles')).toBeInTheDocument();
      expect(screen.getByTestId('icon-shield')).toBeInTheDocument();
    });
  });

  describe('Permissions Button', () => {
    it('renders Manage Permissions button for admin', async () => {
      await act(async () => {
        render(<OrganizationManagement />);
      });

      expect(
        screen.getByRole('button', { name: /Manage Permissions/i })
      ).toBeInTheDocument();
    });
  });
});
