import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/src/test/test-utils';
import type { TeamActivity } from '@/types/organization';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/user-dashboard/organization',
}));

import { ActivityFeed } from './ActivityFeed';

describe('ActivityFeed', () => {
  const mockActivities: TeamActivity[] = [
    {
      id: 'activity-1',
      type: 'edit',
      actorId: 'user-1',
      actorName: 'John Doe',
      target: 'Epic: User Auth',
      metadata: {},
      happenedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    {
      id: 'activity-2',
      type: 'comment',
      actorId: 'user-2',
      actorName: 'Jane Smith',
      target: 'Feature: Login',
      metadata: {},
      happenedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'activity-3',
      type: 'generation',
      actorId: 'user-1',
      actorName: 'John Doe',
      target: 'SDD: Payments',
      metadata: {},
      happenedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const stateWithActivities = {
    workspace: {
      workspaces: [],
      activities: mockActivities,
      auditLogs: [],
      templates: [],
      apiKeys: [],
      quota: null,
      isLoading: false,
      error: null,
    },
    organization: {
      currentOrganization: { id: 'org-123', name: 'Test Org' },
      members: [],
      invites: [],
      subscription: null,
      isLoading: false,
      error: null,
    },
  };

  it('shows empty state when no activities exist', () => {
    const emptyState = {
      ...stateWithActivities,
      workspace: {
        ...stateWithActivities.workspace,
        activities: [],
      },
    };
    render(<ActivityFeed />, { initialState: emptyState as any });

    expect(screen.getByText('No recent activity.')).toBeInTheDocument();
  });

  it('renders activity entries with actor names', () => {
    render(<ActivityFeed />, { initialState: stateWithActivities as any });

    expect(screen.getAllByText('John Doe')).toHaveLength(2);
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('renders activity type badges', () => {
    render(<ActivityFeed />, { initialState: stateWithActivities as any });

    expect(screen.getByText('Edited')).toBeInTheDocument();
    expect(screen.getByText('Commented')).toBeInTheDocument();
    expect(screen.getByText('Generated')).toBeInTheDocument();
  });

  it('renders target information', () => {
    render(<ActivityFeed />, { initialState: stateWithActivities as any });

    expect(screen.getByText('Epic: User Auth')).toBeInTheDocument();
    expect(screen.getByText('Feature: Login')).toBeInTheDocument();
    expect(screen.getByText('SDD: Payments')).toBeInTheDocument();
  });

  it('displays relative time for recent activities', () => {
    render(<ActivityFeed />, { initialState: stateWithActivities as any });

    expect(screen.getByText('5m ago')).toBeInTheDocument();
    expect(screen.getByText('2h ago')).toBeInTheDocument();
    expect(screen.getByText('3d ago')).toBeInTheDocument();
  });

  it('renders heading text', () => {
    render(<ActivityFeed />, { initialState: stateWithActivities as any });

    expect(screen.getByText('Team Activity')).toBeInTheDocument();
  });

  it('displays all activity type labels', () => {
    const allTypes: TeamActivity[] = [
      { id: '1', type: 'edit', actorId: 'u1', actorName: 'A', target: 't', metadata: {}, happenedAt: new Date().toISOString() },
      { id: '2', type: 'permission_change', actorId: 'u1', actorName: 'B', target: 't', metadata: {}, happenedAt: new Date().toISOString() },
      { id: '3', type: 'template', actorId: 'u1', actorName: 'C', target: 't', metadata: {}, happenedAt: new Date().toISOString() },
      { id: '4', type: 'settings', actorId: 'u1', actorName: 'D', target: 't', metadata: {}, happenedAt: new Date().toISOString() },
    ];
    const state = {
      ...stateWithActivities,
      workspace: { ...stateWithActivities.workspace, activities: allTypes },
    };
    render(<ActivityFeed />, { initialState: state as any });

    expect(screen.getByText('Edited')).toBeInTheDocument();
    expect(screen.getByText('Permission change')).toBeInTheDocument();
    expect(screen.getByText('Template update')).toBeInTheDocument();
    expect(screen.getByText('Settings update')).toBeInTheDocument();
  });
});
