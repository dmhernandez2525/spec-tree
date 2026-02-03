import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useActivityLogger from './useActivityLogger';

const mockDispatch = vi.fn();
const mockUseSelector = vi.fn();

vi.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector: (state: unknown) => unknown) => mockUseSelector(selector),
}));

describe('useActivityLogger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('dispatches activity when collaboration is enabled', () => {
    const mockState = {
      user: {
        user: {
          documentId: 'user-1',
          firstName: 'Avery',
          lastName: 'Kim',
          username: 'avery',
          email: 'avery@example.com',
        },
      },
      collaboration: {
        isEnabled: true,
        mode: 'edit',
        activity: [],
      },
    };

    mockUseSelector.mockImplementation((selector) => selector(mockState));

    const { result } = renderHook(() => useActivityLogger());

    act(() => {
      result.current.logActivity('created', 'epic', 'Authentication');
    });

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        type: 'collaboration/addActivity',
        payload: expect.objectContaining({
          userId: 'user-1',
          userName: 'Avery Kim',
          action: 'created',
          targetType: 'epic',
          targetTitle: 'Authentication',
        }),
      })
    );
  });

  it('skips dispatch when collaboration is disabled', () => {
    const mockState = {
      user: { user: null },
      collaboration: {
        isEnabled: false,
        mode: 'edit',
        activity: [],
      },
    };

    mockUseSelector.mockImplementation((selector) => selector(mockState));

    const { result } = renderHook(() => useActivityLogger());

    act(() => {
      result.current.logActivity('created', 'epic', 'Authentication');
    });

    expect(mockDispatch).not.toHaveBeenCalled();
  });
});
