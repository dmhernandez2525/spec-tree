import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

// Mock the FeatureAnnouncementContext
const mockShowAnnouncement = vi.fn();
const mockMarkAnnouncementAsSeen = vi.fn();
let mockSeenAnnouncements = new Set<string>();

vi.mock('@/components/dashboard/announcement/FeatureAnnouncementContext', () => ({
  useFeatureAnnouncements: () => ({
    showAnnouncement: mockShowAnnouncement,
    seenAnnouncements: mockSeenAnnouncements,
    markAnnouncementAsSeen: mockMarkAnnouncementAsSeen,
  }),
}));

import { useFeatureAnnouncement } from './use-feature-announcement';

describe('useFeatureAnnouncement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSeenAnnouncements = new Set<string>();
  });

  it('returns hasSeenFeature as false for unseen features', () => {
    const { result } = renderHook(() => useFeatureAnnouncement('new-feature'));

    expect(result.current.hasSeenFeature).toBe(false);
  });

  it('returns hasSeenFeature as true for seen features', () => {
    mockSeenAnnouncements = new Set(['existing-feature']);

    const { result } = renderHook(() => useFeatureAnnouncement('existing-feature'));

    expect(result.current.hasSeenFeature).toBe(true);
  });

  it('calls showAnnouncement for unseen features', () => {
    renderHook(() => useFeatureAnnouncement('new-feature'));

    expect(mockShowAnnouncement).toHaveBeenCalledWith('new-feature');
  });

  it('does not call showAnnouncement for seen features', () => {
    mockSeenAnnouncements = new Set(['existing-feature']);

    renderHook(() => useFeatureAnnouncement('existing-feature'));

    expect(mockShowAnnouncement).not.toHaveBeenCalled();
  });

  it('provides markFeatureAsSeen function that marks the specific feature', () => {
    const { result } = renderHook(() => useFeatureAnnouncement('test-feature'));

    result.current.markFeatureAsSeen();

    expect(mockMarkAnnouncementAsSeen).toHaveBeenCalledWith('test-feature');
  });

  it('handles different feature IDs correctly', () => {
    mockSeenAnnouncements = new Set(['feature-a']);

    const { result: resultA } = renderHook(() => useFeatureAnnouncement('feature-a'));
    const { result: resultB } = renderHook(() => useFeatureAnnouncement('feature-b'));

    expect(resultA.current.hasSeenFeature).toBe(true);
    expect(resultB.current.hasSeenFeature).toBe(false);
  });
});
