import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './use-local-storage';

describe('useLocalStorage', () => {
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };

  beforeEach(() => {
    vi.stubGlobal('localStorage', localStorageMock);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns initial value when localStorage is empty', () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useLocalStorage('key', 'initial'));

    expect(result.current[0]).toBe('initial');
  });

  it('returns stored value from localStorage', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify('stored value'));

    const { result } = renderHook(() => useLocalStorage('key', 'initial'));

    expect(result.current[0]).toBe('stored value');
  });

  it('stores object values', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify({ foo: 'bar' }));

    const { result } = renderHook(() =>
      useLocalStorage('key', { foo: 'default' })
    );

    expect(result.current[0]).toEqual({ foo: 'bar' });
  });

  it('updates state and localStorage when setValue is called', () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useLocalStorage('testKey', 'initial'));

    act(() => {
      result.current[1]('new value');
    });

    expect(result.current[0]).toBe('new value');
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'testKey',
      JSON.stringify('new value')
    );
  });

  it('supports function updates', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(5));

    const { result } = renderHook(() => useLocalStorage('count', 0));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(6);
  });

  it('handles array values', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify([1, 2, 3]));

    const { result } = renderHook(() => useLocalStorage<number[]>('list', []));

    expect(result.current[0]).toEqual([1, 2, 3]);

    act(() => {
      result.current[1]([4, 5, 6]);
    });

    expect(result.current[0]).toEqual([4, 5, 6]);
  });

  it('handles boolean values', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(true));

    const { result } = renderHook(() => useLocalStorage('enabled', false));

    expect(result.current[0]).toBe(true);

    act(() => {
      result.current[1](false);
    });

    expect(result.current[0]).toBe(false);
  });

  it('returns initial value when getItem throws error', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('Storage error');
    });

    const { result } = renderHook(() =>
      useLocalStorage('key', 'fallback')
    );

    expect(result.current[0]).toBe('fallback');
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('handles setItem error gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('Quota exceeded');
    });

    const { result } = renderHook(() => useLocalStorage('key', 'initial'));

    act(() => {
      result.current[1]('new value');
    });

    // State should still update even if localStorage fails
    expect(result.current[0]).toBe('new value');
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('responds to storage events from other tabs', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify('initial'));

    const { result } = renderHook(() => useLocalStorage('shared-key', ''));

    // Simulate storage event from another tab
    act(() => {
      const event = new StorageEvent('storage', {
        key: 'shared-key',
        newValue: JSON.stringify('updated from other tab'),
      });
      window.dispatchEvent(event);
    });

    expect(result.current[0]).toBe('updated from other tab');
  });

  it('ignores storage events for different keys', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify('initial'));

    const { result } = renderHook(() => useLocalStorage('my-key', ''));

    act(() => {
      const event = new StorageEvent('storage', {
        key: 'other-key',
        newValue: JSON.stringify('should not update'),
      });
      window.dispatchEvent(event);
    });

    expect(result.current[0]).toBe('initial');
  });

  it('ignores storage events without newValue', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify('initial'));

    const { result } = renderHook(() => useLocalStorage('my-key', ''));

    act(() => {
      const event = new StorageEvent('storage', {
        key: 'my-key',
        newValue: null,
      });
      window.dispatchEvent(event);
    });

    expect(result.current[0]).toBe('initial');
  });

  it('cleans up event listener on unmount', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    localStorageMock.getItem.mockReturnValue(null);

    const { unmount } = renderHook(() => useLocalStorage('key', 'initial'));

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'storage',
      expect.any(Function)
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'storage',
      expect.any(Function)
    );

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it('maintains value when key changes', () => {
    // The hook uses useState lazy initializer which only runs once
    // so changing key doesn't re-read from localStorage
    localStorageMock.getItem.mockReturnValue(JSON.stringify('initial'));

    const { result, rerender } = renderHook(
      ({ key }) => useLocalStorage(key, 'default'),
      { initialProps: { key: 'key1' } }
    );

    expect(result.current[0]).toBe('initial');

    // When key changes, the component would need to remount to re-initialize
    // The current implementation doesn't automatically re-read
    rerender({ key: 'key2' });

    // Value persists from the initial mount
    expect(result.current[0]).toBe('initial');
  });

  it('handles complex objects', () => {
    const complexObject = {
      user: {
        name: 'Test',
        settings: {
          theme: 'dark',
          notifications: true,
        },
      },
      items: [1, 2, 3],
    };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(complexObject));

    const { result } = renderHook(() =>
      useLocalStorage('complex', { user: null, items: [] })
    );

    expect(result.current[0]).toEqual(complexObject);
  });
});
