import { describe, expect, it } from 'vitest';
import type { SowSnapshot } from '@/types/version-snapshot';
import { buildSnapshotDiff } from './version-diff';

const createSnapshot = (
  overrides: Partial<SowSnapshot>
): SowSnapshot => ({
  epics: {},
  features: {},
  userStories: {},
  tasks: {},
  contextualQuestions: [],
  globalInformation: '',
  selectedModel: 'gpt-4',
  chatApi: 'StartState',
  id: 'app-1',
  apps: {},
  ...overrides,
});

describe('buildSnapshotDiff', () => {
  it('tracks added, removed, and modified work items', () => {
    const epicOne = {
      id: 'epic-1',
      title: 'Auth',
      description: 'Old',
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

    const base = createSnapshot({
      epics: {
        'epic-1': epicOne,
      },
      tasks: {
        'task-1': {
          id: 'task-1',
          title: 'Setup',
          details: 'Configure env',
          priority: 1,
          notes: '',
          parentUserStoryId: 'story-1',
          dependentTaskIds: [],
        },
      },
    });

    const compare = createSnapshot({
      epics: {
        'epic-1': {
          ...epicOne,
          description: 'Updated',
        },
        'epic-2': {
          ...epicOne,
          id: 'epic-2',
          title: 'Billing',
        },
      },
    });

    const result = buildSnapshotDiff(base, compare);

    expect(result.epics.totals.added).toBe(1);
    expect(result.epics.totals.modified).toBe(1);
    expect(result.tasks.totals.removed).toBe(1);
    expect(result.epics.modified[0].changedFields).toContain('description');
    expect(result.totalChanges).toBe(3);
  });

  it('returns zero changes for identical snapshots', () => {
    const snapshot = createSnapshot({
      epics: {
        'epic-1': {
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
        },
      },
    });

    const result = buildSnapshotDiff(snapshot, snapshot);

    expect(result.totalChanges).toBe(0);
    expect(result.epics.modified).toHaveLength(0);
    expect(result.epics.added).toHaveLength(0);
    expect(result.epics.removed).toHaveLength(0);
  });
});
