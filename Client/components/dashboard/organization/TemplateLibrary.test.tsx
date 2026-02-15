import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/src/test/test-utils';
import type { SharedTemplate } from '@/types/organization';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/user-dashboard/organization',
}));

import { TemplateLibrary } from './TemplateLibrary';

describe('TemplateLibrary', () => {
  const mockTemplates: SharedTemplate[] = [
    {
      id: 'tmpl-1',
      name: 'User Story Template',
      description: 'Standard user story format',
      category: 'user-story',
      template: {},
      createdById: 'user-1',
      lastUsedAt: null,
      createdAt: '2024-01-15T00:00:00Z',
    },
    {
      id: 'tmpl-2',
      name: 'Bug Report Template',
      description: 'Bug reporting format with reproduction steps',
      category: 'bug',
      template: {},
      createdById: 'user-1',
      lastUsedAt: '2024-02-10T00:00:00Z',
      createdAt: '2024-01-20T00:00:00Z',
    },
  ];

  const stateWithTemplates = {
    workspace: {
      workspaces: [],
      activities: [],
      auditLogs: [],
      templates: mockTemplates,
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
    auth: {
      isLoggedIn: true,
      organizationRole: 'admin',
    },
    user: {
      user: { documentId: 'user-1' },
      token: null,
    },
  };

  it('shows empty state when no templates exist', () => {
    const emptyState = {
      ...stateWithTemplates,
      workspace: { ...stateWithTemplates.workspace, templates: [] },
    };
    render(<TemplateLibrary />, { initialState: emptyState as any });

    expect(screen.getByText('No shared templates yet.')).toBeInTheDocument();
  });

  it('renders heading', () => {
    render(<TemplateLibrary />, { initialState: stateWithTemplates as any });

    expect(screen.getByText('Shared Templates')).toBeInTheDocument();
  });

  it('displays template names', () => {
    render(<TemplateLibrary />, { initialState: stateWithTemplates as any });

    expect(screen.getByText('User Story Template')).toBeInTheDocument();
    expect(screen.getByText('Bug Report Template')).toBeInTheDocument();
  });

  it('displays template descriptions', () => {
    render(<TemplateLibrary />, { initialState: stateWithTemplates as any });

    expect(screen.getByText('Standard user story format')).toBeInTheDocument();
    expect(screen.getByText('Bug reporting format with reproduction steps')).toBeInTheDocument();
  });

  it('displays template categories as badges', () => {
    render(<TemplateLibrary />, { initialState: stateWithTemplates as any });

    expect(screen.getByText('user-story')).toBeInTheDocument();
    expect(screen.getByText('bug')).toBeInTheDocument();
  });

  it('renders New Template button for admin users', () => {
    render(<TemplateLibrary />, { initialState: stateWithTemplates as any });

    expect(screen.getByText('New Template')).toBeInTheDocument();
  });

  it('hides New Template button for viewer users', () => {
    const viewerState = {
      ...stateWithTemplates,
      auth: { isLoggedIn: true, organizationRole: 'viewer' },
    };
    render(<TemplateLibrary />, { initialState: viewerState as any });

    expect(screen.queryByText('New Template')).not.toBeInTheDocument();
  });

  it('renders Delete buttons for admin users', () => {
    render(<TemplateLibrary />, { initialState: stateWithTemplates as any });

    const deleteButtons = screen.getAllByText('Delete');
    expect(deleteButtons.length).toBe(2);
  });

  it('hides Delete buttons for viewer users', () => {
    const viewerState = {
      ...stateWithTemplates,
      auth: { isLoggedIn: true, organizationRole: 'viewer' },
    };
    render(<TemplateLibrary />, { initialState: viewerState as any });

    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });
});
