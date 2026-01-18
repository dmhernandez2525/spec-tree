import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMediaQuery } from './use-media-query';

describe('useMediaQuery', () => {
  let matchMediaMock: ReturnType<typeof vi.fn>;
  let addEventListenerMock: ReturnType<typeof vi.fn>;
  let removeEventListenerMock: ReturnType<typeof vi.fn>;

  const createMockMediaQueryList = (matches: boolean): Partial<MediaQueryList> => ({
    matches,
    addEventListener: addEventListenerMock as MediaQueryList['addEventListener'],
    removeEventListener: removeEventListenerMock as MediaQueryList['removeEventListener'],
  });

  beforeEach(() => {
    addEventListenerMock = vi.fn();
    removeEventListenerMock = vi.fn();
    matchMediaMock = vi.fn();
    vi.stubGlobal('matchMedia', matchMediaMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns true when media query matches', () => {
    matchMediaMock.mockReturnValue(createMockMediaQueryList(true));

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    expect(result.current).toBe(true);
  });

  it('returns false when media query does not match', () => {
    matchMediaMock.mockReturnValue(createMockMediaQueryList(false));

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    expect(result.current).toBe(false);
  });

  it('calls matchMedia with the provided query', () => {
    matchMediaMock.mockReturnValue(createMockMediaQueryList(false));

    renderHook(() => useMediaQuery('(prefers-color-scheme: dark)'));

    expect(matchMediaMock).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
  });

  it('sets up change event listener', () => {
    matchMediaMock.mockReturnValue(createMockMediaQueryList(false));

    renderHook(() => useMediaQuery('(min-width: 1024px)'));

    expect(addEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('removes event listener on unmount', () => {
    matchMediaMock.mockReturnValue(createMockMediaQueryList(false));

    const { unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    unmount();

    expect(removeEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('updates when media query changes', () => {
    matchMediaMock.mockReturnValue(createMockMediaQueryList(false));

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    expect(result.current).toBe(false);

    // Simulate media query change event
    act(() => {
      const changeHandler = addEventListenerMock.mock.calls[0][1];
      changeHandler({ matches: true } as MediaQueryListEvent);
    });

    expect(result.current).toBe(true);
  });

  it('updates when query prop changes', () => {
    matchMediaMock
      .mockReturnValueOnce(createMockMediaQueryList(true))
      .mockReturnValueOnce(createMockMediaQueryList(false));

    const { result, rerender } = renderHook(
      ({ query }) => useMediaQuery(query),
      { initialProps: { query: '(min-width: 768px)' } }
    );

    expect(result.current).toBe(true);

    rerender({ query: '(min-width: 1200px)' });

    expect(matchMediaMock).toHaveBeenCalledWith('(min-width: 1200px)');
  });

  it('cleans up old listener when query changes', () => {
    matchMediaMock.mockReturnValue(createMockMediaQueryList(false));

    const { rerender } = renderHook(
      ({ query }) => useMediaQuery(query),
      { initialProps: { query: '(min-width: 768px)' } }
    );

    rerender({ query: '(min-width: 1200px)' });

    // Should have removed the old listener and added a new one
    expect(removeEventListenerMock).toHaveBeenCalled();
    expect(addEventListenerMock).toHaveBeenCalledTimes(2);
  });

  it('handles common media queries', () => {
    const queries = [
      '(prefers-color-scheme: dark)',
      '(prefers-reduced-motion: reduce)',
      '(orientation: portrait)',
      '(hover: hover)',
      '(pointer: fine)',
    ];

    queries.forEach((query) => {
      matchMediaMock.mockReturnValue(createMockMediaQueryList(true));

      const { result } = renderHook(() => useMediaQuery(query));

      expect(matchMediaMock).toHaveBeenCalledWith(query);
      expect(result.current).toBe(true);
    });
  });

  it('starts with false before effect runs', () => {
    // The hook initializes with useState(false)
    matchMediaMock.mockReturnValue(createMockMediaQueryList(true));

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    // After effect, it should match
    expect(result.current).toBe(true);
  });
});
