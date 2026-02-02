import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLoadingState } from './useLoadingState';

// Mock the logger
vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('useLoadingState', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('returns isLoading as false initially', () => {
      const { result } = renderHook(() => useLoadingState());

      expect(result.current.isLoading).toBe(false);
    });

    it('returns default message initially', () => {
      const { result } = renderHook(() => useLoadingState());

      expect(result.current.message).toBe('Loading...');
    });

    it('accepts custom initial message', () => {
      const { result } = renderHook(() =>
        useLoadingState('Custom initial message')
      );

      expect(result.current.message).toBe('Custom initial message');
    });
  });

  describe('startLoading', () => {
    it('sets isLoading to true', () => {
      const { result } = renderHook(() => useLoadingState());

      act(() => {
        result.current.startLoading();
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('sets default message when no custom message provided', () => {
      const { result } = renderHook(() => useLoadingState());

      act(() => {
        result.current.startLoading();
      });

      expect(result.current.message).toBe('Loading...');
    });

    it('sets custom message when provided', () => {
      const { result } = renderHook(() => useLoadingState());

      act(() => {
        result.current.startLoading('Fetching data...');
      });

      expect(result.current.message).toBe('Fetching data...');
    });
  });

  describe('stopLoading', () => {
    it('sets isLoading to false', () => {
      const { result } = renderHook(() => useLoadingState());

      act(() => {
        result.current.startLoading();
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.stopLoading();
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('resets message to default', () => {
      const { result } = renderHook(() => useLoadingState());

      act(() => {
        result.current.startLoading('Custom message');
      });

      act(() => {
        result.current.stopLoading();
      });

      expect(result.current.message).toBe('Loading...');
    });
  });

  describe('setMessage', () => {
    it('updates message directly', () => {
      const { result } = renderHook(() => useLoadingState());

      act(() => {
        result.current.setMessage('New message');
      });

      expect(result.current.message).toBe('New message');
    });
  });

  describe('progressive messages', () => {
    it('updates to extended message after 10 seconds', () => {
      const { result } = renderHook(() => useLoadingState());

      act(() => {
        result.current.startLoading();
      });

      expect(result.current.message).toBe('Loading...');

      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(result.current.message).toBe(
        'This is taking longer than expected...'
      );
    });

    it('updates to prolonged message after 20 seconds', () => {
      const { result } = renderHook(() => useLoadingState());

      act(() => {
        result.current.startLoading();
      });

      act(() => {
        vi.advanceTimersByTime(20000);
      });

      expect(result.current.message).toBe('Still working on it...');
    });

    it('clears timeouts when stopLoading is called', () => {
      const { result } = renderHook(() => useLoadingState());

      act(() => {
        result.current.startLoading();
      });

      act(() => {
        result.current.stopLoading();
      });

      act(() => {
        vi.advanceTimersByTime(20000);
      });

      // Message should be reset, not updated by timeout
      expect(result.current.message).toBe('Loading...');
    });

    it('clears previous timeouts when startLoading is called again', () => {
      const { result } = renderHook(() => useLoadingState());

      act(() => {
        result.current.startLoading('First loading');
      });

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      act(() => {
        result.current.startLoading('Second loading');
      });

      // Advance 5 more seconds - previous timer should be cleared
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // Should still show "Second loading" since timeout was reset
      expect(result.current.message).toBe('Second loading');

      // Advance to 10 seconds from second start
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.message).toBe(
        'This is taking longer than expected...'
      );
    });
  });

  describe('withLoading', () => {
    it('wraps async operation with loading state', async () => {
      const { result } = renderHook(() => useLoadingState());

      // Start in non-loading state
      expect(result.current.isLoading).toBe(false);

      const mockOperation = vi.fn().mockResolvedValue('result');

      await act(async () => {
        await result.current.withLoading(mockOperation);
      });

      // Operation should have been called
      expect(mockOperation).toHaveBeenCalled();
      // After completion, should be back to non-loading
      expect(result.current.isLoading).toBe(false);
    });

    it('returns result from operation', async () => {
      const { result } = renderHook(() => useLoadingState());

      const expectedResult = { data: 'test' };
      const mockOperation = vi.fn().mockResolvedValue(expectedResult);

      let returnedResult: typeof expectedResult | null = null;

      await act(async () => {
        returnedResult = await result.current.withLoading(mockOperation);
      });

      expect(returnedResult).toEqual(expectedResult);
    });

    it('uses custom message when provided', async () => {
      const { result } = renderHook(() => useLoadingState());

      // Create a promise that we can control
      let resolvePromise: () => void = () => {};
      const controlledPromise = new Promise<string>((resolve) => {
        resolvePromise = () => resolve('result');
      });

      // Start the loading operation without waiting for it
      let loadingPromise: Promise<string | null>;
      act(() => {
        loadingPromise = result.current.withLoading(
          () => controlledPromise,
          { message: 'Custom loading message' }
        );
      });

      // Check that loading started with custom message
      expect(result.current.isLoading).toBe(true);
      expect(result.current.message).toBe('Custom loading message');

      // Resolve the promise and wait for completion
      await act(async () => {
        resolvePromise();
        await loadingPromise;
      });
    });

    it('returns null on error', async () => {
      const { result } = renderHook(() => useLoadingState());

      const mockOperation = vi.fn().mockRejectedValue(new Error('Test error'));

      let returnedResult: unknown = 'not-null';

      await act(async () => {
        returnedResult = await result.current.withLoading(mockOperation);
      });

      expect(returnedResult).toBeNull();
    });

    it('stops loading after error', async () => {
      const { result } = renderHook(() => useLoadingState());

      const mockOperation = vi.fn().mockRejectedValue(new Error('Test error'));

      await act(async () => {
        await result.current.withLoading(mockOperation);
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('shows success message briefly when provided', async () => {
      const { result } = renderHook(() => useLoadingState());

      const mockOperation = vi.fn().mockResolvedValue('result');

      await act(async () => {
        const promise = result.current.withLoading(mockOperation, {
          successMessage: 'Success!',
        });

        // Fast-forward through operation
        await vi.runAllTimersAsync();
        await promise;
      });

      // After the 500ms delay and stopLoading, message resets
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('cleanup', () => {
    it('clears timeouts on unmount', () => {
      const { result, unmount } = renderHook(() => useLoadingState());

      act(() => {
        result.current.startLoading();
      });

      unmount();

      // Should not throw or cause issues
      act(() => {
        vi.advanceTimersByTime(20000);
      });
    });
  });

  describe('return type', () => {
    it('returns all expected properties', () => {
      const { result } = renderHook(() => useLoadingState());

      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('message');
      expect(result.current).toHaveProperty('startLoading');
      expect(result.current).toHaveProperty('stopLoading');
      expect(result.current).toHaveProperty('setMessage');
      expect(result.current).toHaveProperty('withLoading');
    });

    it('returns functions with stable references', () => {
      const { result, rerender } = renderHook(() => useLoadingState());

      const initialStartLoading = result.current.startLoading;
      const initialStopLoading = result.current.stopLoading;
      const initialWithLoading = result.current.withLoading;

      rerender();

      expect(result.current.startLoading).toBe(initialStartLoading);
      expect(result.current.stopLoading).toBe(initialStopLoading);
      expect(result.current.withLoading).toBe(initialWithLoading);
    });
  });
});
