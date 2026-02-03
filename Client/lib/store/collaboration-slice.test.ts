import { describe, it, expect } from 'vitest';
import {
  collaborationReducer,
  setMode,
  setEnabled,
  addActivity,
  clearActivity,
} from './collaboration-slice';
import type { CollaborationActivity } from '@/types/collaboration';

describe('collaboration-slice', () => {
  it('returns the initial state', () => {
    const state = collaborationReducer(undefined, { type: 'init' });
    expect(state.mode).toBe('edit');
    expect(state.isEnabled).toBe(true);
    expect(state.activity).toEqual([]);
  });

  it('updates mode and enabled state', () => {
    const state = collaborationReducer(undefined, { type: 'init' });
    const modeState = collaborationReducer(state, setMode('read-only'));
    expect(modeState.mode).toBe('read-only');

    const enabledState = collaborationReducer(modeState, setEnabled(false));
    expect(enabledState.isEnabled).toBe(false);
  });

  it('adds and clears activity', () => {
    const activity: CollaborationActivity = {
      id: 'activity-1',
      userId: 'user-1',
      userName: 'Avery Kim',
      action: 'created',
      targetType: 'epic',
      targetTitle: 'Authentication',
      timestamp: new Date().toISOString(),
    };

    const state = collaborationReducer(undefined, addActivity(activity));
    expect(state.activity).toHaveLength(1);
    expect(state.activity[0].id).toBe('activity-1');

    const clearedState = collaborationReducer(state, clearActivity());
    expect(clearedState.activity).toEqual([]);
  });
});
