import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/src/test/test-utils';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/user-dashboard/organization',
}));

import { QuotaDisplay } from './QuotaDisplay';

describe('QuotaDisplay', () => {
  const baseState = {
    workspace: {
      workspaces: [],
      activities: [],
      auditLogs: [],
      templates: [],
      apiKeys: [],
      quota: null,
      isLoading: false,
      error: null,
    },
    organization: {
      currentOrganization: {
        id: 'org-123',
        name: 'Test Org',
        aiGenerationQuota: 500,
        aiGenerationUsage: 200,
      },
      members: [],
      invites: [],
      subscription: null,
      isLoading: false,
      error: null,
    },
  };

  it('returns null when no quota is set', () => {
    const stateNoOrg = {
      ...baseState,
      organization: {
        ...baseState.organization,
        currentOrganization: null,
      },
    };
    const { container } = render(<QuotaDisplay />, { initialState: stateNoOrg as any });

    expect(container.querySelector('[class*="card"]')).toBeNull();
  });

  it('renders quota card with title', () => {
    render(<QuotaDisplay />, { initialState: baseState as any });

    expect(screen.getByText('AI Generation Quota')).toBeInTheDocument();
  });

  it('displays usage and limit text', () => {
    render(<QuotaDisplay />, { initialState: baseState as any });

    expect(screen.getByText(/200 \/ 500 generations used/)).toBeInTheDocument();
  });

  it('displays percentage', () => {
    render(<QuotaDisplay />, { initialState: baseState as any });

    expect(screen.getByText('40%')).toBeInTheDocument();
  });

  it('shows near limit badge when usage is 80%+', () => {
    const nearLimitState = {
      ...baseState,
      organization: {
        ...baseState.organization,
        currentOrganization: {
          ...baseState.organization.currentOrganization,
          aiGenerationUsage: 420,
        },
      },
    };
    render(<QuotaDisplay />, { initialState: nearLimitState as any });

    expect(screen.getByText('Near limit')).toBeInTheDocument();
  });

  it('shows limit reached badge when usage is 100%', () => {
    const atLimitState = {
      ...baseState,
      organization: {
        ...baseState.organization,
        currentOrganization: {
          ...baseState.organization.currentOrganization,
          aiGenerationUsage: 500,
        },
      },
    };
    render(<QuotaDisplay />, { initialState: atLimitState as any });

    expect(screen.getByText('Limit reached')).toBeInTheDocument();
  });

  it('caps percentage at 100 when usage exceeds quota', () => {
    const overLimitState = {
      ...baseState,
      organization: {
        ...baseState.organization,
        currentOrganization: {
          ...baseState.organization.currentOrganization,
          aiGenerationUsage: 600,
        },
      },
    };
    render(<QuotaDisplay />, { initialState: overLimitState as any });

    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('renders reset cycle info text', () => {
    render(<QuotaDisplay />, { initialState: baseState as any });

    expect(
      screen.getByText(/Usage resets at the beginning of each billing cycle/)
    ).toBeInTheDocument();
  });
});
