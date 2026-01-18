import { describe, it, expect, vi } from 'vitest';
import makeDeleteHandler from './make-delete-handler';
import { ActionCreatorWithPayload } from '@reduxjs/toolkit';

describe('makeDeleteHandler', () => {
  it('returns a function', () => {
    const mockDispatch = vi.fn();
    const mockAction = vi.fn() as unknown as ActionCreatorWithPayload<{ id: string }>;
    const parameters = { id: 'test-id' };

    const handler = makeDeleteHandler(mockDispatch, mockAction, parameters);

    expect(typeof handler).toBe('function');
  });

  it('dispatches action with parameters when handler is called', () => {
    const mockDispatch = vi.fn();
    const mockAction = vi.fn((params) => ({ type: 'TEST_ACTION', payload: params }));
    const parameters = { id: 'test-id' };

    const handler = makeDeleteHandler(
      mockDispatch,
      mockAction as unknown as ActionCreatorWithPayload<{ id: string }>,
      parameters
    );

    handler();

    expect(mockAction).toHaveBeenCalledWith(parameters);
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('works with multiple parameters', () => {
    const mockDispatch = vi.fn();
    const mockAction = vi.fn((params) => ({ type: 'TEST_ACTION', payload: params }));
    const parameters = { id: 'test-id', type: 'epic', parentId: 'parent-123' };

    const handler = makeDeleteHandler(
      mockDispatch,
      mockAction as unknown as ActionCreatorWithPayload<{ id: string; type: string; parentId: string }>,
      parameters
    );

    handler();

    expect(mockAction).toHaveBeenCalledWith({
      id: 'test-id',
      type: 'epic',
      parentId: 'parent-123',
    });
  });

  it('returns void when called', () => {
    const mockDispatch = vi.fn();
    const mockAction = vi.fn() as unknown as ActionCreatorWithPayload<{ id: string }>;
    const parameters = { id: 'test-id' };

    const handler = makeDeleteHandler(mockDispatch, mockAction, parameters);

    const result = handler();

    expect(result).toBeUndefined();
  });

  it('can be called multiple times', () => {
    const mockDispatch = vi.fn();
    const mockAction = vi.fn((params) => ({ type: 'TEST_ACTION', payload: params }));
    const parameters = { id: 'test-id' };

    const handler = makeDeleteHandler(
      mockDispatch,
      mockAction as unknown as ActionCreatorWithPayload<{ id: string }>,
      parameters
    );

    handler();
    handler();
    handler();

    expect(mockAction).toHaveBeenCalledTimes(3);
    expect(mockDispatch).toHaveBeenCalledTimes(3);
  });
});
