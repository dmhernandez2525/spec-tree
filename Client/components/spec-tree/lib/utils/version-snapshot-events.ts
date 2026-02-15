export type AutoSnapshotEventType =
  | 'batch-generation'
  | 'bulk-move'
  | 'import';

export interface AutoSnapshotEventDetail {
  eventType: AutoSnapshotEventType;
  label: string;
}

const AUTO_SNAPSHOT_EVENT_NAME = 'spectree:auto-snapshot';

const isAutoSnapshotEventDetail = (
  value: unknown
): value is AutoSnapshotEventDetail => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const detail = value as Partial<AutoSnapshotEventDetail>;
  const validType =
    detail.eventType === 'batch-generation' ||
    detail.eventType === 'bulk-move' ||
    detail.eventType === 'import';

  return validType && typeof detail.label === 'string' && detail.label.trim().length > 0;
};

export const dispatchAutoSnapshotEvent = (
  detail: AutoSnapshotEventDetail
): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<AutoSnapshotEventDetail>(AUTO_SNAPSHOT_EVENT_NAME, {
      detail,
    })
  );
};

export const subscribeAutoSnapshotEvent = (
  callback: (detail: AutoSnapshotEventDetail) => void
): (() => void) => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handler = (event: Event): void => {
    const customEvent = event as CustomEvent<unknown>;
    if (isAutoSnapshotEventDetail(customEvent.detail)) {
      callback(customEvent.detail);
    }
  };

  window.addEventListener(AUTO_SNAPSHOT_EVENT_NAME, handler);

  return () => {
    window.removeEventListener(AUTO_SNAPSHOT_EVENT_NAME, handler);
  };
};
