import { describe, it, expect, vi } from 'vitest';
import type { ActionCreatorWithPayload } from '@reduxjs/toolkit';
import makeUpdateHandler from './make-update-handler';

// Helper to create a mock action creator that satisfies ActionCreatorWithPayload
function createMockAction<P>(): ActionCreatorWithPayload<P> & ReturnType<typeof vi.fn> {
  const mockFn = vi.fn((payload: P) => ({ type: 'TEST_ACTION', payload }));
  (mockFn as any).type = 'TEST_ACTION';
  (mockFn as any).match = (action: any): action is { type: string; payload: P } =>
    action?.type === 'TEST_ACTION';
  return mockFn as ActionCreatorWithPayload<P> & ReturnType<typeof vi.fn>;
}

describe('makeUpdateHandler', () => {
  it('creates an update handler function', () => {
    const dispatch = vi.fn();
    const action = createMockAction<any>();
    const parameters = { epicId: 'epic-1' };

    const handler = makeUpdateHandler(dispatch, action, parameters);

    expect(typeof handler).toBe('function');
  });

  it('dispatches action with merged parameters and update params', () => {
    const dispatch = vi.fn();
    const action = createMockAction<any>();
    const parameters = { epicId: 'epic-1' };

    const handler = makeUpdateHandler(dispatch, action, parameters);

    handler({
      field: 'title',
      newValue: 'New Title',
    });

    expect(action).toHaveBeenCalledWith({
      epicId: 'epic-1',
      field: 'title',
      newValue: 'New Title',
    });
    expect(dispatch).toHaveBeenCalled();
  });

  it('includes riskMitigationIndex when provided', () => {
    const dispatch = vi.fn();
    const action = createMockAction<any>();
    const parameters = { epicId: 'epic-1' };

    const handler = makeUpdateHandler(dispatch, action, parameters);

    handler({
      field: 'risksAndMitigation',
      newValue: 'Updated risk',
      riskMitigationIndex: 0,
    });

    expect(action).toHaveBeenCalledWith({
      epicId: 'epic-1',
      field: 'risksAndMitigation',
      newValue: 'Updated risk',
      riskMitigationIndex: 0,
    });
  });

  it('includes arrayIndex and isArrayItem when provided', () => {
    const dispatch = vi.fn();
    const action = createMockAction<any>();
    const parameters = { featureId: 'feature-1' };

    const handler = makeUpdateHandler(dispatch, action, parameters);

    handler({
      field: 'acceptanceCriteria',
      newValue: 'Updated criteria',
      arrayIndex: 2,
      isArrayItem: true,
    });

    expect(action).toHaveBeenCalledWith({
      featureId: 'feature-1',
      field: 'acceptanceCriteria',
      newValue: 'Updated criteria',
      arrayIndex: 2,
      isArrayItem: true,
    });
  });

  it('handles array values for newValue', () => {
    const dispatch = vi.fn();
    const action = createMockAction<any>();
    const parameters = { taskId: 'task-1' };

    const handler = makeUpdateHandler(dispatch, action, parameters);

    handler({
      field: 'dependentTaskIds',
      newValue: ['task-2', 'task-3'],
    });

    expect(action).toHaveBeenCalledWith({
      taskId: 'task-1',
      field: 'dependentTaskIds',
      newValue: ['task-2', 'task-3'],
    });
  });

  it('works with multiple parameter types', () => {
    const dispatch = vi.fn();
    const action = createMockAction<any>();
    const parameters = {
      epicId: 'epic-1',
      featureId: 'feature-1',
      userStoryId: 'story-1',
    };

    const handler = makeUpdateHandler(dispatch, action, parameters);

    handler({
      field: 'description',
      newValue: 'Updated description',
    });

    expect(action).toHaveBeenCalledWith({
      epicId: 'epic-1',
      featureId: 'feature-1',
      userStoryId: 'story-1',
      field: 'description',
      newValue: 'Updated description',
    });
  });

  it('handles custom field names', () => {
    const dispatch = vi.fn();
    const action = createMockAction<any>();
    const parameters = { epicId: 'epic-1' };

    const handler = makeUpdateHandler(dispatch, action, parameters);

    handler({
      field: 'customField',
      newValue: 'custom value',
    });

    expect(action).toHaveBeenCalledWith({
      epicId: 'epic-1',
      field: 'customField',
      newValue: 'custom value',
    });
  });
});
