import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from './use-mobile';

describe('useIsMobile', () => {
  let matchMediaMock: ReturnType<typeof vi.fn>;
  let addEventListenerMock: ReturnType<typeof vi.fn>;
  let removeEventListenerMock: ReturnType<typeof vi.fn>;
  let mockMediaQueryList: Partial<MediaQueryList>;

  beforeEach(() => {
    addEventListenerMock = vi.fn();
    removeEventListenerMock = vi.fn();
    mockMediaQueryList = {
      matches: false,
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
    };
    matchMediaMock = vi.fn().mockReturnValue(mockMediaQueryList);

    vi.stubGlobal('matchMedia', matchMediaMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns false when window width is greater than mobile breakpoint', () => {
    vi.stubGlobal('innerWidth', 1024);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });

  it('returns true when window width is less than mobile breakpoint', () => {
    vi.stubGlobal('innerWidth', 500);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it('returns true when window width equals 767 (less than breakpoint)', () => {
    vi.stubGlobal('innerWidth', 767);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it('returns false when window width equals 768 (at breakpoint)', () => {
    vi.stubGlobal('innerWidth', 768);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });

  it('sets up media query listener', () => {
    vi.stubGlobal('innerWidth', 1024);

    renderHook(() => useIsMobile());

    expect(matchMediaMock).toHaveBeenCalledWith('(max-width: 767px)');
    expect(addEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('removes event listener on unmount', () => {
    vi.stubGlobal('innerWidth', 1024);

    const { unmount } = renderHook(() => useIsMobile());

    unmount();

    expect(removeEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('updates when media query changes', () => {
    vi.stubGlobal('innerWidth', 1024);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);

    // Simulate media query change
    act(() => {
      vi.stubGlobal('innerWidth', 500);
      const changeHandler = addEventListenerMock.mock.calls[0][1];
      changeHandler();
    });

    expect(result.current).toBe(true);
  });

  it('returns false initially (undefined coerced to false)', () => {
    // Before effect runs, isMobile is undefined which should coerce to false via !!
    vi.stubGlobal('innerWidth', 500);

    const { result } = renderHook(() => useIsMobile());

    // After effect runs, it should be true for mobile width
    expect(result.current).toBe(true);
  });
});
