import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useAsyncState from './useAsyncState';

describe('useAsyncState', () => {
  describe('initialization', () => {
    it('initializes with idle state', () => {
      const { result } = renderHook(() => useAsyncState());

      expect(result.current.state).toBe('idle');
    });

    it('initializes with null error message', () => {
      const { result } = renderHook(() => useAsyncState());

      expect(result.current.errorMessage).toBeNull();
    });

    it('exposes all required functions', () => {
      const { result } = renderHook(() => useAsyncState());

      expect(typeof result.current.startLoading).toBe('function');
      expect(typeof result.current.stopLoading).toBe('function');
      expect(typeof result.current.handleError).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
    });
  });

  describe('startLoading', () => {
    it('sets state to loading', () => {
      const { result } = renderHook(() => useAsyncState());

      act(() => {
        result.current.startLoading();
      });

      expect(result.current.state).toBe('loading');
    });

    it('clears error message when starting loading', () => {
      const { result } = renderHook(() => useAsyncState());

      act(() => {
        result.current.handleError('Previous error');
        result.current.startLoading();
      });

      expect(result.current.errorMessage).toBeNull();
    });
  });

  describe('stopLoading', () => {
    it('sets state to idle', () => {
      const { result } = renderHook(() => useAsyncState());

      act(() => {
        result.current.startLoading();
        result.current.stopLoading();
      });

      expect(result.current.state).toBe('idle');
    });

    it('clears error message when stopping loading', () => {
      const { result } = renderHook(() => useAsyncState());

      act(() => {
        result.current.handleError('Some error');
        result.current.stopLoading();
      });

      expect(result.current.errorMessage).toBeNull();
    });
  });

  describe('handleError', () => {
    it('sets state to error', () => {
      const { result } = renderHook(() => useAsyncState());

      act(() => {
        result.current.handleError('Something went wrong');
      });

      expect(result.current.state).toBe('error');
    });

    it('sets error message', () => {
      const { result } = renderHook(() => useAsyncState());

      act(() => {
        result.current.handleError('Custom error message');
      });

      expect(result.current.errorMessage).toBe('Custom error message');
    });

    it('uses default error message when none provided', () => {
      const { result } = renderHook(() => useAsyncState());

      act(() => {
        result.current.handleError();
      });

      expect(result.current.errorMessage).toBe('An error occurred. Please try again.');
    });
  });

  describe('clearError', () => {
    it('sets state to idle', () => {
      const { result } = renderHook(() => useAsyncState());

      act(() => {
        result.current.handleError('Error');
        result.current.clearError();
      });

      expect(result.current.state).toBe('idle');
    });

    it('clears error message', () => {
      const { result } = renderHook(() => useAsyncState());

      act(() => {
        result.current.handleError('Error message');
        result.current.clearError();
      });

      expect(result.current.errorMessage).toBeNull();
    });
  });

  describe('state transitions', () => {
    it('handles loading -> success flow', () => {
      const { result } = renderHook(() => useAsyncState());

      act(() => {
        result.current.startLoading();
      });
      expect(result.current.state).toBe('loading');

      act(() => {
        result.current.stopLoading();
      });
      expect(result.current.state).toBe('idle');
    });

    it('handles loading -> error flow', () => {
      const { result } = renderHook(() => useAsyncState());

      act(() => {
        result.current.startLoading();
      });
      expect(result.current.state).toBe('loading');

      act(() => {
        result.current.handleError('Failed to load');
      });
      expect(result.current.state).toBe('error');
      expect(result.current.errorMessage).toBe('Failed to load');
    });

    it('handles error -> retry flow', () => {
      const { result } = renderHook(() => useAsyncState());

      act(() => {
        result.current.handleError('Initial error');
      });
      expect(result.current.state).toBe('error');

      act(() => {
        result.current.startLoading();
      });
      expect(result.current.state).toBe('loading');
      expect(result.current.errorMessage).toBeNull();
    });
  });
});
