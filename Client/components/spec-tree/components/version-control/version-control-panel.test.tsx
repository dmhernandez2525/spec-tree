import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import VersionControlPanel from './version-control-panel';

const mockDispatch = vi.fn();
const mockSetSow = vi.fn((payload: unknown) => ({
  type: 'SET_SOW',
  payload,
}));
const mockFetchVersionSnapshots = vi.fn();
const mockCreateVersionSnapshot = vi.fn();
const baseEpic = {
  id: 'epic-1',
  title: 'Auth',
  description: '',
  goal: '',
  successCriteria: '',
  dependencies: '',
  timeline: '',
  resources: '',
  risksAndMitigation: [],
  featureIds: [],
  parentAppId: 'app-1',
  notes: '',
};

const baseSowSnapshot = {
  epics: {
    'epic-1': baseEpic,
  },
  features: {},
  userStories: {},
  tasks: {},
  contextualQuestions: [],
  globalInformation: '',
  selectedModel: 'gpt-4',
  chatApi: 'StartState',
  id: 'app-1',
  apps: {},
};

const compareSowSnapshot = {
  ...baseSowSnapshot,
  epics: {
    ...baseSowSnapshot.epics,
    'epic-2': {
      ...baseEpic,
      id: 'epic-2',
      title: 'Billing',
    },
  },
};

const buildSnapshot = (id: string, name: string, snapshot = baseSowSnapshot) => ({
  id,
  appId: 'app-1',
  name,
  description: null,
  snapshot,
  createdAt: '2026-02-14T00:00:00.000Z',
  createdById: 'user-1',
  createdByName: 'Avery',
  tags: [],
  isMilestone: false,
  milestoneTag: null,
  sourceEvent: 'manual' as const,
  branchName: null,
  parentSnapshotId: null,
});

const mockState = {
  sow: baseSowSnapshot,
  collaboration: {
    isEnabled: true,
    mode: 'edit',
    activity: [],
  },
  user: {
    user: {
      documentId: 'user-1',
      firstName: 'Avery',
      lastName: 'Kim',
      username: 'avery',
      email: 'avery@example.com',
    },
  },
};

vi.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector: (state: typeof mockState) => unknown) =>
    selector(mockState),
}));

vi.mock('@/lib/store/sow-slice', () => ({
  setSow: (payload: unknown) => mockSetSow(payload),
}));

vi.mock('../../lib/api/strapi-service', () => ({
  strapiService: {
    fetchVersionSnapshots: (...args: unknown[]) => mockFetchVersionSnapshots(...args),
    createVersionSnapshot: (...args: unknown[]) => mockCreateVersionSnapshot(...args),
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    log: vi.fn(),
  },
}));

describe('VersionControlPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchVersionSnapshots.mockResolvedValue([
      buildSnapshot('snap-1', 'Baseline'),
      buildSnapshot('snap-2', 'Current', compareSowSnapshot),
    ]);
    mockCreateVersionSnapshot.mockResolvedValue(
      buildSnapshot('snap-new', 'Auto Snapshot')
    );
  });

  it('renders diff output between two snapshots', async () => {
    render(<VersionControlPanel appId="app-1" />);

    fireEvent.click(screen.getByRole('button', { name: /versions/i }));

    await waitFor(() => {
      expect(mockFetchVersionSnapshots).toHaveBeenCalledWith('app-1');
    });

    expect(await screen.findByText(/comparison diff/i)).toBeInTheDocument();
    expect(screen.getByText(/total changes/i)).toBeInTheDocument();
  });

  it('creates auto snapshot when significant event is emitted', async () => {
    render(<VersionControlPanel appId="app-1" />);
    fireEvent.click(screen.getByRole('button', { name: /versions/i }));

    await waitFor(() => {
      expect(mockFetchVersionSnapshots).toHaveBeenCalled();
    });

    window.dispatchEvent(
      new CustomEvent('spectree:auto-snapshot', {
        detail: {
          eventType: 'batch-generation',
          label: 'Additional epics',
        },
      })
    );

    await waitFor(() => {
      expect(mockCreateVersionSnapshot).toHaveBeenCalledWith(
        expect.objectContaining({
          sourceEvent: 'batch-generation',
          name: 'Auto: Additional epics',
        })
      );
    });
  });

  it('creates safety snapshot before restore and dispatches restored state', async () => {
    render(<VersionControlPanel appId="app-1" />);
    fireEvent.click(screen.getByRole('button', { name: /versions/i }));

    await waitFor(() => {
      expect(mockFetchVersionSnapshots).toHaveBeenCalled();
    });

    const restoreButtons = await screen.findAllByRole('button', { name: /restore/i });
    const firstRestoreButton = restoreButtons.at(0);
    expect(firstRestoreButton).toBeDefined();
    if (!firstRestoreButton) {
      throw new Error('Expected restore button');
    }
    fireEvent.click(firstRestoreButton);

    const confirmButton = await screen.findByRole('button', { name: /^restore$/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockCreateVersionSnapshot).toHaveBeenCalledWith(
        expect.objectContaining({
          sourceEvent: 'restore',
          tags: ['restore-backup'],
        })
      );
    });

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'SET_SOW' })
    );
  });
});
