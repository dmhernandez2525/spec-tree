import type { SowSnapshot } from '@/types/version-snapshot';

export type SnapshotCollectionKey = 'epics' | 'features' | 'userStories' | 'tasks';

interface SnapshotRecord {
  [key: string]: unknown;
  title?: unknown;
}

export interface SnapshotDiffEntry {
  id: string;
  title: string;
  changedFields: string[];
}

export interface SnapshotCollectionDiff {
  added: SnapshotDiffEntry[];
  removed: SnapshotDiffEntry[];
  modified: SnapshotDiffEntry[];
  totals: {
    base: number;
    compare: number;
    added: number;
    removed: number;
    modified: number;
  };
}

export interface SnapshotDiffResult {
  epics: SnapshotCollectionDiff;
  features: SnapshotCollectionDiff;
  userStories: SnapshotCollectionDiff;
  tasks: SnapshotCollectionDiff;
  totalChanges: number;
}

const toSnapshotRecordMap = (value: unknown): Record<string, SnapshotRecord> => {
  if (!value || typeof value !== 'object') {
    return {};
  }

  return Object.entries(value as Record<string, unknown>).reduce(
    (accumulator, [id, item]) => {
      if (item && typeof item === 'object') {
        accumulator[id] = item as SnapshotRecord;
      }
      return accumulator;
    },
    {} as Record<string, SnapshotRecord>
  );
};

const toDisplayTitle = (id: string, item: SnapshotRecord): string => {
  if (typeof item.title === 'string' && item.title.trim()) {
    return item.title;
  }

  return id;
};

const areValuesEqual = (first: unknown, second: unknown): boolean =>
  JSON.stringify(first) === JSON.stringify(second);

const getChangedFields = (
  baseItem: SnapshotRecord,
  compareItem: SnapshotRecord
): string[] => {
  const keys = new Set([
    ...Object.keys(baseItem),
    ...Object.keys(compareItem),
  ]);

  const changedFields: string[] = [];
  keys.forEach((field) => {
    if (!areValuesEqual(baseItem[field], compareItem[field])) {
      changedFields.push(field);
    }
  });

  return changedFields.sort((left, right) => left.localeCompare(right));
};

const buildCollectionDiff = (
  baseCollection: unknown,
  compareCollection: unknown
): SnapshotCollectionDiff => {
  const baseItems = toSnapshotRecordMap(baseCollection);
  const compareItems = toSnapshotRecordMap(compareCollection);

  const baseIds = Object.keys(baseItems);
  const compareIds = Object.keys(compareItems);

  const added: SnapshotDiffEntry[] = [];
  const removed: SnapshotDiffEntry[] = [];
  const modified: SnapshotDiffEntry[] = [];

  compareIds.forEach((id) => {
    if (!baseItems[id]) {
      const compareItem = compareItems[id];
      added.push({
        id,
        title: toDisplayTitle(id, compareItem),
        changedFields: [],
      });
    }
  });

  baseIds.forEach((id) => {
    const baseItem = baseItems[id];
    const compareItem = compareItems[id];

    if (!compareItem) {
      removed.push({
        id,
        title: toDisplayTitle(id, baseItem),
        changedFields: [],
      });
      return;
    }

    const changedFields = getChangedFields(baseItem, compareItem);
    if (changedFields.length > 0) {
      modified.push({
        id,
        title: toDisplayTitle(id, compareItem),
        changedFields,
      });
    }
  });

  const compareEntries = (left: SnapshotDiffEntry, right: SnapshotDiffEntry) =>
    left.title.localeCompare(right.title);

  added.sort(compareEntries);
  removed.sort(compareEntries);
  modified.sort(compareEntries);

  return {
    added,
    removed,
    modified,
    totals: {
      base: baseIds.length,
      compare: compareIds.length,
      added: added.length,
      removed: removed.length,
      modified: modified.length,
    },
  };
};

export const buildSnapshotDiff = (
  baseSnapshot: SowSnapshot,
  compareSnapshot: SowSnapshot
): SnapshotDiffResult => {
  const epics = buildCollectionDiff(baseSnapshot.epics, compareSnapshot.epics);
  const features = buildCollectionDiff(
    baseSnapshot.features,
    compareSnapshot.features
  );
  const userStories = buildCollectionDiff(
    baseSnapshot.userStories,
    compareSnapshot.userStories
  );
  const tasks = buildCollectionDiff(baseSnapshot.tasks, compareSnapshot.tasks);

  const totalChanges =
    epics.totals.added +
    epics.totals.removed +
    epics.totals.modified +
    features.totals.added +
    features.totals.removed +
    features.totals.modified +
    userStories.totals.added +
    userStories.totals.removed +
    userStories.totals.modified +
    tasks.totals.added +
    tasks.totals.removed +
    tasks.totals.modified;

  return {
    epics,
    features,
    userStories,
    tasks,
    totalChanges,
  };
};
