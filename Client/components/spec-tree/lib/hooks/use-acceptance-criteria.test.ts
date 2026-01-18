import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAcceptanceCriteria } from './use-acceptance-criteria';

describe('useAcceptanceCriteria', () => {
  const mockUpdateFeature = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns add, remove, and update functions', () => {
    const { result } = renderHook(() =>
      useAcceptanceCriteria(['Criteria 1'], mockUpdateFeature)
    );

    expect(typeof result.current.add).toBe('function');
    expect(typeof result.current.remove).toBe('function');
    expect(typeof result.current.update).toBe('function');
  });

  describe('add', () => {
    it('calls updateFeature with empty string for new criteria', () => {
      const { result } = renderHook(() =>
        useAcceptanceCriteria(['Existing'], mockUpdateFeature)
      );

      act(() => {
        result.current.add();
      });

      expect(mockUpdateFeature).toHaveBeenCalledWith({
        field: 'acceptanceCriteria',
        newValue: '',
        isArrayItem: true,
      });
    });
  });

  describe('remove', () => {
    it('removes criteria at specified index', () => {
      const criteria = ['Criteria 1', 'Criteria 2', 'Criteria 3'];
      const { result } = renderHook(() =>
        useAcceptanceCriteria(criteria, mockUpdateFeature)
      );

      act(() => {
        result.current.remove(1);
      });

      expect(mockUpdateFeature).toHaveBeenCalledWith({
        field: 'acceptanceCriteria',
        newValue: ['Criteria 1', 'Criteria 3'],
      });
    });

    it('removes first criteria when index is 0', () => {
      const criteria = ['First', 'Second'];
      const { result } = renderHook(() =>
        useAcceptanceCriteria(criteria, mockUpdateFeature)
      );

      act(() => {
        result.current.remove(0);
      });

      expect(mockUpdateFeature).toHaveBeenCalledWith({
        field: 'acceptanceCriteria',
        newValue: ['Second'],
      });
    });

    it('removes last criteria when index is last', () => {
      const criteria = ['First', 'Second', 'Last'];
      const { result } = renderHook(() =>
        useAcceptanceCriteria(criteria, mockUpdateFeature)
      );

      act(() => {
        result.current.remove(2);
      });

      expect(mockUpdateFeature).toHaveBeenCalledWith({
        field: 'acceptanceCriteria',
        newValue: ['First', 'Second'],
      });
    });
  });

  describe('update', () => {
    it('updates criteria at specified index', () => {
      const criteria = ['Old value'];
      const { result } = renderHook(() =>
        useAcceptanceCriteria(criteria, mockUpdateFeature)
      );

      act(() => {
        result.current.update(0, 'New value');
      });

      expect(mockUpdateFeature).toHaveBeenCalledWith({
        field: 'acceptanceCriteria',
        newValue: 'New value',
        arrayIndex: 0,
      });
    });

    it('updates criteria at middle index', () => {
      const criteria = ['First', 'Second', 'Third'];
      const { result } = renderHook(() =>
        useAcceptanceCriteria(criteria, mockUpdateFeature)
      );

      act(() => {
        result.current.update(1, 'Updated Second');
      });

      expect(mockUpdateFeature).toHaveBeenCalledWith({
        field: 'acceptanceCriteria',
        newValue: 'Updated Second',
        arrayIndex: 1,
      });
    });
  });

  it('works with empty criteria array', () => {
    const { result } = renderHook(() =>
      useAcceptanceCriteria([], mockUpdateFeature)
    );

    act(() => {
      result.current.add();
    });

    expect(mockUpdateFeature).toHaveBeenCalledWith({
      field: 'acceptanceCriteria',
      newValue: '',
      isArrayItem: true,
    });
  });
});
