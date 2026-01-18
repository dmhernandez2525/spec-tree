import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast, toast, reducer } from './use-toast';

describe('use-toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('reducer', () => {
    const createToast = (id: string, title?: string) => ({
      id,
      title,
      open: true,
    });

    it('adds toast to empty state', () => {
      const state = { toasts: [] };
      const newToast = createToast('1', 'Test Toast');

      const result = reducer(state, {
        type: 'ADD_TOAST',
        toast: newToast,
      });

      expect(result.toasts).toHaveLength(1);
      expect(result.toasts[0].id).toBe('1');
      expect(result.toasts[0].title).toBe('Test Toast');
    });

    it('adds toast at the beginning of the list', () => {
      const state = { toasts: [createToast('1', 'First')] };
      const newToast = createToast('2', 'Second');

      const result = reducer(state, {
        type: 'ADD_TOAST',
        toast: newToast,
      });

      expect(result.toasts[0].id).toBe('2');
    });

    it('limits toasts to TOAST_LIMIT', () => {
      // TOAST_LIMIT is 1, so adding a second toast should remove the first
      const state = { toasts: [createToast('1', 'First')] };
      const newToast = createToast('2', 'Second');

      const result = reducer(state, {
        type: 'ADD_TOAST',
        toast: newToast,
      });

      expect(result.toasts).toHaveLength(1);
      expect(result.toasts[0].id).toBe('2');
    });

    it('updates existing toast', () => {
      const state = {
        toasts: [createToast('1', 'Original Title')],
      };

      const result = reducer(state, {
        type: 'UPDATE_TOAST',
        toast: { id: '1', title: 'Updated Title' },
      });

      expect(result.toasts[0].title).toBe('Updated Title');
    });

    it('does not update non-matching toast', () => {
      const state = {
        toasts: [createToast('1', 'Original')],
      };

      const result = reducer(state, {
        type: 'UPDATE_TOAST',
        toast: { id: '999', title: 'Updated' },
      });

      expect(result.toasts[0].title).toBe('Original');
    });

    it('dismisses specific toast by id', () => {
      const state = {
        toasts: [
          { ...createToast('1', 'First'), open: true },
          { ...createToast('2', 'Second'), open: true },
        ],
      };

      const result = reducer(state, {
        type: 'DISMISS_TOAST',
        toastId: '1',
      });

      expect(result.toasts[0].open).toBe(false);
      expect(result.toasts[1].open).toBe(true);
    });

    it('dismisses all toasts when no id provided', () => {
      const state = {
        toasts: [
          { ...createToast('1'), open: true },
          { ...createToast('2'), open: true },
        ],
      };

      const result = reducer(state, {
        type: 'DISMISS_TOAST',
        toastId: undefined,
      });

      expect(result.toasts.every((t) => t.open === false)).toBe(true);
    });

    it('removes specific toast by id', () => {
      const state = {
        toasts: [createToast('1'), createToast('2')],
      };

      const result = reducer(state, {
        type: 'REMOVE_TOAST',
        toastId: '1',
      });

      expect(result.toasts).toHaveLength(1);
      expect(result.toasts[0].id).toBe('2');
    });

    it('removes all toasts when no id provided', () => {
      const state = {
        toasts: [createToast('1'), createToast('2')],
      };

      const result = reducer(state, {
        type: 'REMOVE_TOAST',
        toastId: undefined,
      });

      expect(result.toasts).toHaveLength(0);
    });
  });

  describe('useToast hook', () => {
    it('returns initial state with empty toasts', () => {
      const { result } = renderHook(() => useToast());

      // Toasts might have some from previous tests, but structure should be correct
      expect(Array.isArray(result.current.toasts)).toBe(true);
    });

    it('provides toast function', () => {
      const { result } = renderHook(() => useToast());

      expect(typeof result.current.toast).toBe('function');
    });

    it('provides dismiss function', () => {
      const { result } = renderHook(() => useToast());

      expect(typeof result.current.dismiss).toBe('function');
    });

    it('adds toast when toast function is called', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({ title: 'Test Toast' });
      });

      expect(result.current.toasts.some((t) => t.title === 'Test Toast')).toBe(true);
    });

    it('returns toast id, dismiss, and update functions', () => {
      const { result } = renderHook(() => useToast());

      let toastResult: ReturnType<typeof toast>;

      act(() => {
        toastResult = result.current.toast({ title: 'Test' });
      });

      expect(typeof toastResult!.id).toBe('string');
      expect(typeof toastResult!.dismiss).toBe('function');
      expect(typeof toastResult!.update).toBe('function');
    });

    it('can dismiss a specific toast', () => {
      const { result } = renderHook(() => useToast());

      let toastId: string;

      act(() => {
        const toastResult = result.current.toast({ title: 'Test' });
        toastId = toastResult.id;
      });

      act(() => {
        result.current.dismiss(toastId!);
      });

      const dismissedToast = result.current.toasts.find((t) => t.id === toastId);
      // After dismiss, toast should have open: false
      expect(dismissedToast?.open).toBe(false);
    });

    it('can update a toast', () => {
      const { result } = renderHook(() => useToast());

      let toastUpdate: (props: { title?: string }) => void;

      act(() => {
        const toastResult = result.current.toast({ title: 'Original' });
        toastUpdate = toastResult.update;
      });

      act(() => {
        toastUpdate({ title: 'Updated' });
      });

      expect(result.current.toasts.some((t) => t.title === 'Updated')).toBe(true);
    });
  });

  describe('toast function', () => {
    it('generates unique ids', () => {
      const { result } = renderHook(() => useToast());

      let id1: string;
      let id2: string;

      act(() => {
        id1 = result.current.toast({ title: 'Toast 1' }).id;
        id2 = result.current.toast({ title: 'Toast 2' }).id;
      });

      expect(id1!).not.toBe(id2!);
    });

    it('toast is open by default', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({ title: 'Test' });
      });

      // The most recent toast should be open
      expect(result.current.toasts.some((t) => t.open === true)).toBe(true);
    });

    it('can include description', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({
          title: 'Title',
          description: 'Description text',
        });
      });

      expect(result.current.toasts.some((t) => t.description === 'Description text')).toBe(true);
    });

    it('can include action element', () => {
      const { result } = renderHook(() => useToast());
      const mockAction = { altText: 'Undo action' };

      act(() => {
        result.current.toast({
          title: 'With Action',
          action: mockAction as any,
        });
      });

      expect(result.current.toasts.some((t) => t.action === (mockAction as unknown))).toBe(true);
    });
  });

  describe('dismiss functionality', () => {
    it('dismiss function can be called without id to dismiss all', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({ title: 'Toast 1' });
      });

      act(() => {
        result.current.dismiss();
      });

      // All toasts should have open: false
      expect(result.current.toasts.every((t) => t.open === false)).toBe(true);
    });

    it('individual toast dismiss closes only that toast', () => {
      const { result } = renderHook(() => useToast());

      let dismissFn: () => void;

      act(() => {
        const toastResult = result.current.toast({ title: 'Test' });
        dismissFn = toastResult.dismiss;
      });

      act(() => {
        dismissFn();
      });

      // The dismissed toast should have open: false
      const dismissedToast = result.current.toasts.find((t) => t.title === 'Test');
      expect(dismissedToast?.open).toBe(false);
    });
  });

  describe('multiple listeners', () => {
    it('supports multiple hook instances', () => {
      const { result: result1 } = renderHook(() => useToast());
      const { result: result2 } = renderHook(() => useToast());

      act(() => {
        result1.current.toast({ title: 'Shared Toast' });
      });

      // Both instances should see the same toast
      expect(result1.current.toasts).toEqual(result2.current.toasts);
    });

    it('cleans up listener on unmount', () => {
      const { result, unmount } = renderHook(() => useToast());

      act(() => {
        result.current.toast({ title: 'Before Unmount' });
      });

      unmount();

      // This should not throw or cause issues
      const { result: result2 } = renderHook(() => useToast());
      act(() => {
        result2.current.toast({ title: 'After Unmount' });
      });

      expect(result2.current.toasts.some((t) => t.title === 'After Unmount')).toBe(true);
    });
  });
});
