import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useLoadingMessage from './useLoadingMessage';

describe('useLoadingMessage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('returns "Loading..." when loading starts', () => {
      const { result } = renderHook(() => useLoadingMessage(true, 'Dashboard'));

      expect(result.current).toBe('Loading...');
    });

    it('returns "Loading..." when not loading', () => {
      const { result } = renderHook(() => useLoadingMessage(false, 'Dashboard'));

      expect(result.current).toBe('Loading...');
    });
  });

  describe('message progression', () => {
    it('shows first warning after 10 seconds', () => {
      const { result } = renderHook(() => useLoadingMessage(true, 'Dashboard'));

      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(result.current).toBe('This is taking longer than normal...');
    });

    it('shows second warning after 20 seconds', () => {
      const { result } = renderHook(() => useLoadingMessage(true, 'Dashboard'));

      act(() => {
        vi.advanceTimersByTime(20000);
      });

      expect(result.current).toBe('Hmm... Still working on it.');
    });

    it('shows component-specific error message after 30 seconds', () => {
      const { result } = renderHook(() => useLoadingMessage(true, 'Dashboard'));

      act(() => {
        vi.advanceTimersByTime(30000);
      });

      expect(result.current).toBe(
        'Having trouble loading Dashboard. Please wait or try refreshing.'
      );
    });

    it('includes correct component name in final message', () => {
      const { result } = renderHook(() => useLoadingMessage(true, 'User Profile'));

      act(() => {
        vi.advanceTimersByTime(30000);
      });

      expect(result.current).toContain('User Profile');
    });
  });

  describe('loading state changes', () => {
    it('resets message when loading becomes false', () => {
      const { result, rerender } = renderHook(
        ({ isLoading }) => useLoadingMessage(isLoading, 'Dashboard'),
        { initialProps: { isLoading: true } }
      );

      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(result.current).toBe('This is taking longer than normal...');

      rerender({ isLoading: false });

      expect(result.current).toBe('Loading...');
    });

    it('starts fresh when loading becomes true again', () => {
      const { result, rerender } = renderHook(
        ({ isLoading }) => useLoadingMessage(isLoading, 'Dashboard'),
        { initialProps: { isLoading: true } }
      );

      act(() => {
        vi.advanceTimersByTime(10000);
      });

      rerender({ isLoading: false });
      rerender({ isLoading: true });

      expect(result.current).toBe('Loading...');

      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(result.current).toBe('This is taking longer than normal...');
    });
  });

  describe('cleanup', () => {
    it('clears timeouts on unmount', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
      const { unmount } = renderHook(() => useLoadingMessage(true, 'Dashboard'));

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('clears timeouts when loading becomes false', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
      const { rerender } = renderHook(
        ({ isLoading }) => useLoadingMessage(isLoading, 'Dashboard'),
        { initialProps: { isLoading: true } }
      );

      rerender({ isLoading: false });

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });

  describe('component name changes', () => {
    it('updates final message when component name changes', () => {
      const { result, rerender } = renderHook(
        ({ componentName }) => useLoadingMessage(true, componentName),
        { initialProps: { componentName: 'Dashboard' } }
      );

      act(() => {
        vi.advanceTimersByTime(30000);
      });

      expect(result.current).toContain('Dashboard');

      // Reset and change component name
      rerender({ componentName: 'Settings' });

      act(() => {
        vi.advanceTimersByTime(30000);
      });

      expect(result.current).toContain('Settings');
    });
  });
});
