import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAIGenerationRecovery } from './useAIGenerationRecovery';

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    log: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('useAIGenerationRecovery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with idle state', () => {
    const { result } = renderHook(() => useAIGenerationRecovery());

    expect(result.current.state.status).toBe('idle');
    expect(result.current.state.error).toBeNull();
    expect(result.current.state.attemptCount).toBe(0);
  });

  it('sets generating state while executing', async () => {
    const { result } = renderHook(() => useAIGenerationRecovery());

    let resolvePromise: (value: string) => void;
    const promise = new Promise<string>((resolve) => {
      resolvePromise = resolve;
    });

    act(() => {
      result.current.execute(() => promise, 'test');
    });

    expect(result.current.state.status).toBe('generating');

    await act(async () => {
      resolvePromise!('result');
      await promise;
    });

    expect(result.current.state.status).toBe('success');
  });

  it('returns result on successful generation', async () => {
    const { result } = renderHook(() => useAIGenerationRecovery<string>());

    let returnedResult: string | null = null;

    await act(async () => {
      returnedResult = await result.current.execute(
        async () => 'generated content',
        'test'
      );
    });

    expect(returnedResult).toBe('generated content');
    expect(result.current.state.status).toBe('success');
  });

  it('sets error state on failure', async () => {
    const { result } = renderHook(() =>
      useAIGenerationRecovery({ maxAutoRetries: 0 })
    );

    await act(async () => {
      await result.current.execute(
        async () => {
          throw new Error('Generation failed');
        },
        'test'
      );
    });

    expect(result.current.state.status).toBe('error');
    expect(result.current.state.error).not.toBeNull();
    expect(result.current.state.error?.category).toBe('unknown');
  });

  it('classifies network errors correctly', async () => {
    const { result } = renderHook(() =>
      useAIGenerationRecovery({ maxAutoRetries: 0 })
    );

    await act(async () => {
      await result.current.execute(
        async () => {
          throw new Error('Failed to fetch: network error');
        },
        'test'
      );
    });

    expect(result.current.state.error?.category).toBe('network');
    expect(result.current.state.recoveryOptions.length).toBeGreaterThan(0);
  });

  it('provides recovery options for retryable errors', async () => {
    const { result } = renderHook(() =>
      useAIGenerationRecovery({ maxAutoRetries: 0 })
    );

    await act(async () => {
      await result.current.execute(
        async () => {
          throw new Error('Request timed out');
        },
        'test'
      );
    });

    expect(result.current.state.error?.retryable).toBe(true);
    expect(result.current.state.recoveryOptions.some((o) => o.action === 'retry')).toBe(
      true
    );
  });

  it('calls onSuccess callback on success', async () => {
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useAIGenerationRecovery({ onSuccess }));

    await act(async () => {
      await result.current.execute(async () => 'result', 'test');
    });

    expect(onSuccess).toHaveBeenCalledWith('result');
  });

  it('calls onError callback on failure', async () => {
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useAIGenerationRecovery({ onError, maxAutoRetries: 0 })
    );

    await act(async () => {
      await result.current.execute(
        async () => {
          throw new Error('Failed');
        },
        'test'
      );
    });

    expect(onError).toHaveBeenCalled();
    expect(onError.mock.calls[0][0].category).toBeDefined();
  });

  it('allows manual retry after failure', async () => {
    const { result } = renderHook(() =>
      useAIGenerationRecovery({ maxAutoRetries: 0 })
    );

    let callCount = 0;

    await act(async () => {
      await result.current.execute(async () => {
        callCount++;
        if (callCount === 1) {
          throw new Error('First attempt failed');
        }
        return 'success';
      }, 'test');
    });

    expect(result.current.state.status).toBe('error');

    await act(async () => {
      const retryResult = await result.current.retry();
      expect(retryResult).toBe('success');
    });

    expect(result.current.state.status).toBe('success');
  });

  it('increments attempt count on each try', async () => {
    const { result } = renderHook(() =>
      useAIGenerationRecovery({ maxAutoRetries: 0 })
    );

    await act(async () => {
      await result.current.execute(
        async () => {
          throw new Error('Failed');
        },
        'test'
      );
    });

    expect(result.current.state.attemptCount).toBe(1);

    await act(async () => {
      await result.current.retry();
    });

    expect(result.current.state.attemptCount).toBe(2);
  });

  it('resets state when reset is called', async () => {
    const { result } = renderHook(() =>
      useAIGenerationRecovery({ maxAutoRetries: 0 })
    );

    await act(async () => {
      await result.current.execute(
        async () => {
          throw new Error('Failed');
        },
        'test'
      );
    });

    expect(result.current.state.status).toBe('error');

    act(() => {
      result.current.reset();
    });

    expect(result.current.state.status).toBe('idle');
    expect(result.current.state.error).toBeNull();
    expect(result.current.state.attemptCount).toBe(0);
  });

  it('canAutoRecover is false when maxAutoRetries is exceeded', async () => {
    // Use maxAutoRetries: 0 to prevent actual auto-retry delays
    const { result } = renderHook(() =>
      useAIGenerationRecovery({ maxAutoRetries: 0 })
    );

    await act(async () => {
      await result.current.execute(
        async () => {
          throw new Error('Timeout');
        },
        'test'
      );
    });

    // After one attempt with maxAutoRetries: 0, canAutoRecover should be false
    // because attemptCount (1) > maxAutoRetries (0)
    expect(result.current.state.status).toBe('error');
    expect(result.current.canAutoRecover).toBe(false);
  });

  it('returns null when retrying without previous generation', async () => {
    const { result } = renderHook(() => useAIGenerationRecovery());

    let retryResult: unknown = undefined;
    await act(async () => {
      retryResult = await result.current.retry();
    });

    expect(retryResult).toBeNull();
  });

  it('calls onRecoveryAttempt when recovering', async () => {
    const onRecoveryAttempt = vi.fn();
    let callCount = 0;

    const generationFn = async () => {
      callCount++;
      if (callCount === 1) throw new Error('Failed');
      return 'success';
    };

    const { result } = renderHook(() =>
      useAIGenerationRecovery({ onRecoveryAttempt, maxAutoRetries: 0 })
    );

    // First call - will fail
    await act(async () => {
      await result.current.execute(generationFn, 'test');
    });

    expect(result.current.state.status).toBe('error');

    // Second call - retry
    await act(async () => {
      await result.current.retry();
    });

    expect(onRecoveryAttempt).toHaveBeenCalledWith('retry', expect.any(Number));
  });
});
