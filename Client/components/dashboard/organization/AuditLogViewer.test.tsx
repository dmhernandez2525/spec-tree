import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/src/test/test-utils';
import type { AuditLogEntry } from '@/types/organization';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/user-dashboard/organization',
}));

import { AuditLogViewer } from './AuditLogViewer';

describe('AuditLogViewer', () => {
  const mockLogs: AuditLogEntry[] = [
    {
      id: 'log-1',
      action: 'member_added',
      actorId: 'user-1',
      actorName: 'Admin User',
      targetId: 'user-2',
      targetType: 'member',
      metadata: {},
      happenedAt: '2024-02-15T12:00:00Z',
    },
    {
      id: 'log-2',
      action: 'permission_change',
      actorId: 'user-1',
      actorName: 'Admin User',
      targetId: 'user-3',
      targetType: 'member',
      metadata: { from: 'viewer', to: 'admin' },
      happenedAt: '2024-02-14T10:00:00Z',
    },
    {
      id: 'log-3',
      action: 'api_key_created',
      actorId: 'user-1',
      actorName: 'Admin User',
      targetId: 'key-1',
      targetType: 'api_key',
      metadata: {},
      happenedAt: '2024-02-13T08:00:00Z',
    },
  ];

  const stateWithLogs = {
    workspace: {
      workspaces: [],
      activities: [],
      auditLogs: mockLogs,
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

  it('shows empty state when no logs exist', () => {
    const emptyState = {
      ...stateWithLogs,
      workspace: { ...stateWithLogs.workspace, auditLogs: [] },
    };
    render(<AuditLogViewer />, { initialState: emptyState as any });

    expect(screen.getByText('No audit logs found.')).toBeInTheDocument();
  });

  it('renders audit log entries with actor names', () => {
    render(<AuditLogViewer />, { initialState: stateWithLogs as any });

    expect(screen.getAllByText('Admin User')).toHaveLength(3);
  });

  it('renders audit action labels', () => {
    render(<AuditLogViewer />, { initialState: stateWithLogs as any });

    expect(screen.getByText('Member added')).toBeInTheDocument();
    expect(screen.getByText('Permission changed')).toBeInTheDocument();
    expect(screen.getByText('API key created')).toBeInTheDocument();
  });

  it('displays target type information', () => {
    render(<AuditLogViewer />, { initialState: stateWithLogs as any });

    const memberTargets = screen.getAllByText(/Target: member/);
    expect(memberTargets.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/Target: api_key/)).toBeInTheDocument();
  });

  it('displays target ID when present', () => {
    render(<AuditLogViewer />, { initialState: stateWithLogs as any });

    expect(screen.getByText(/\(user-2\)/)).toBeInTheDocument();
    expect(screen.getByText(/\(key-1\)/)).toBeInTheDocument();
  });

  it('renders heading and search input', () => {
    render(<AuditLogViewer />, { initialState: stateWithLogs as any });

    expect(screen.getByText('Audit Log')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search logs...')).toBeInTheDocument();
  });

  it('filters logs by search term', async () => {
    const { user } = render(<AuditLogViewer />, { initialState: stateWithLogs as any });

    const searchInput = screen.getByPlaceholderText('Search logs...');
    await user.type(searchInput, 'api_key');

    expect(screen.getByText('API key created')).toBeInTheDocument();
    expect(screen.queryByText('Member added')).not.toBeInTheDocument();
    expect(screen.queryByText('Permission changed')).not.toBeInTheDocument();
  });

  it('filters logs by action label text', async () => {
    const { user } = render(<AuditLogViewer />, { initialState: stateWithLogs as any });

    const searchInput = screen.getByPlaceholderText('Search logs...');
    await user.type(searchInput, 'Permission changed');

    expect(screen.getByText('Permission changed')).toBeInTheDocument();
    expect(screen.queryByText('Member added')).not.toBeInTheDocument();
  });

  it('shows empty state when search matches nothing', async () => {
    const { user } = render(<AuditLogViewer />, { initialState: stateWithLogs as any });

    const searchInput = screen.getByPlaceholderText('Search logs...');
    await user.type(searchInput, 'zzz-no-match');

    expect(screen.getByText('No audit logs found.')).toBeInTheDocument();
  });

  it('renders pagination controls', () => {
    render(<AuditLogViewer />, { initialState: stateWithLogs as any });

    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText('Page 1')).toBeInTheDocument();
  });

  it('disables Previous button on first page', () => {
    render(<AuditLogViewer />, { initialState: stateWithLogs as any });

    const prevButton = screen.getByText('Previous');
    expect(prevButton).toBeDisabled();
  });

  it('disables Next when fewer results than page size', () => {
    render(<AuditLogViewer />, { initialState: stateWithLogs as any });

    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeDisabled();
  });
});
