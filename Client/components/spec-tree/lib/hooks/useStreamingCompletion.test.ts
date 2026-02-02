import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useStreamingCompletion,
  parseSSEChunk,
  simulateStream,
} from './useStreamingCompletion';

describe('useStreamingCompletion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('starts with idle status', () => {
      const { result } = renderHook(() => useStreamingCompletion());

      expect(result.current.status).toBe('idle');
      expect(result.current.text).toBe('');
      expect(result.current.error).toBeNull();
      expect(result.current.isStreaming).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isComplete).toBe(false);
    });

    it('has all required functions', () => {
      const { result } = renderHook(() => useStreamingCompletion());

      expect(typeof result.current.stream).toBe('function');
      expect(typeof result.current.cancel).toBe('function');
      expect(typeof result.current.reset).toBe('function');
      expect(typeof result.current.appendText).toBe('function');
    });

    it('has null provider and model initially', () => {
      const { result } = renderHook(() => useStreamingCompletion());

      expect(result.current.provider).toBeNull();
      expect(result.current.model).toBeNull();
      expect(result.current.startTime).toBeNull();
      expect(result.current.duration).toBeNull();
    });
  });

  describe('cancel function', () => {
    it('can be called without error when idle', () => {
      const { result } = renderHook(() => useStreamingCompletion());

      expect(() => {
        act(() => {
          result.current.cancel();
        });
      }).not.toThrow();

      expect(result.current.status).toBe('idle');
    });
  });

  describe('reset function', () => {
    it('resets state with appendText', () => {
      const { result } = renderHook(() => useStreamingCompletion());

      act(() => {
        result.current.appendText('Hello');
      });

      expect(result.current.text).toBe('Hello');

      act(() => {
        result.current.reset();
      });

      expect(result.current.status).toBe('idle');
      expect(result.current.text).toBe('');
      expect(result.current.error).toBeNull();
    });
  });

  describe('appendText function', () => {
    it('appends text to current text', () => {
      const { result } = renderHook(() => useStreamingCompletion());

      act(() => {
        result.current.appendText('Hello');
      });

      expect(result.current.text).toBe('Hello');

      act(() => {
        result.current.appendText(' World');
      });

      expect(result.current.text).toBe('Hello World');
    });

    it('works with empty strings', () => {
      const { result } = renderHook(() => useStreamingCompletion());

      act(() => {
        result.current.appendText('');
      });

      expect(result.current.text).toBe('');

      act(() => {
        result.current.appendText('Hello');
      });

      expect(result.current.text).toBe('Hello');
    });
  });
});

describe('parseSSEChunk', () => {
  it('parses OpenAI format', () => {
    const chunk = 'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n';
    const messages = parseSSEChunk(chunk);
    expect(messages).toEqual(['Hello']);
  });

  it('parses Claude format', () => {
    const chunk = 'data: {"delta":{"text":"Hello"}}\n\n';
    const messages = parseSSEChunk(chunk);
    expect(messages).toEqual(['Hello']);
  });

  it('parses Claude content_block_delta format', () => {
    const chunk = 'data: {"type":"content_block_delta","delta":{"text":"Hello"}}\n\n';
    const messages = parseSSEChunk(chunk);
    expect(messages).toEqual(['Hello']);
  });

  it('handles [DONE] marker', () => {
    const chunk = 'data: [DONE]\n\n';
    const messages = parseSSEChunk(chunk);
    expect(messages).toEqual([]);
  });

  it('handles multiple messages', () => {
    const chunk =
      'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n' +
      'data: {"choices":[{"delta":{"content":" World"}}]}\n\n';
    const messages = parseSSEChunk(chunk);
    expect(messages).toEqual(['Hello', ' World']);
  });

  it('handles empty chunks', () => {
    const chunk = '\n\n';
    const messages = parseSSEChunk(chunk);
    expect(messages).toEqual([]);
  });

  it('handles non-JSON data gracefully', () => {
    const chunk = 'data: plain text\n\n';
    const messages = parseSSEChunk(chunk);
    expect(messages).toEqual(['plain text']);
  });

  it('handles mixed content', () => {
    const chunk =
      'data: {"choices":[{"delta":{"content":"First"}}]}\n\n' +
      'data: [DONE]\n\n' +
      'data: {"choices":[{"delta":{"content":"Third"}}]}\n\n';
    const messages = parseSSEChunk(chunk);
    expect(messages).toEqual(['First', 'Third']);
  });

  it('handles empty data field', () => {
    const chunk = 'data: \n\n';
    const messages = parseSSEChunk(chunk);
    expect(messages).toEqual([]);
  });
});

describe('simulateStream', () => {
  it('returns cancel function', () => {
    const { cancel } = simulateStream('Hello World');

    expect(typeof cancel).toBe('function');

    // Clean up
    cancel();
  });

  it('can be constructed with options', () => {
    const onChunk = vi.fn();
    const onComplete = vi.fn();

    const { cancel } = simulateStream('Hello', {
      delayMs: 50,
      chunkSize: 5,
      onChunk,
      onComplete,
    });

    // Clean up immediately
    cancel();
  });

  it('accepts custom delay and chunk size', () => {
    const { cancel } = simulateStream('Test text here', {
      delayMs: 100,
      chunkSize: 2,
    });

    cancel();
  });
});
