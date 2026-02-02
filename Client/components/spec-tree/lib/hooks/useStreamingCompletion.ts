/**
 * Streaming Completion Hook
 *
 * F1.1.10 - Streaming AI responses
 *
 * Provides real-time streaming of AI completions with state management.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { AIMessage, AIProviderType } from '../api/providers/ai-provider';

/**
 * Streaming state
 */
export type StreamingStatus = 'idle' | 'connecting' | 'streaming' | 'complete' | 'error' | 'cancelled';

/**
 * Streaming options
 */
export interface StreamingOptions {
  /** Model to use for completion */
  model?: string;
  /** Maximum tokens to generate */
  maxTokens?: number;
  /** Temperature for generation */
  temperature?: number;
  /** API endpoint for streaming */
  endpoint?: string;
  /** Callback when each chunk arrives */
  onChunk?: (chunk: string, fullText: string) => void;
  /** Callback when streaming completes */
  onComplete?: (fullText: string) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
}

/**
 * Streaming completion state
 */
export interface StreamingState {
  /** Current streaming status */
  status: StreamingStatus;
  /** Accumulated text from stream */
  text: string;
  /** Error if any occurred */
  error: Error | null;
  /** Is currently streaming */
  isStreaming: boolean;
  /** Is loading (connecting) */
  isLoading: boolean;
  /** Is complete */
  isComplete: boolean;
  /** Provider used for streaming */
  provider: AIProviderType | null;
  /** Model used for streaming */
  model: string | null;
  /** Start time of stream */
  startTime: number | null;
  /** Duration of stream in ms */
  duration: number | null;
}

/**
 * Streaming completion actions
 */
export interface StreamingActions {
  /** Start streaming a completion */
  stream: (messages: AIMessage[], options?: StreamingOptions) => Promise<void>;
  /** Cancel the current stream */
  cancel: () => void;
  /** Reset the state */
  reset: () => void;
  /** Append text manually (for testing) */
  appendText: (text: string) => void;
}

/**
 * Return type of useStreamingCompletion
 */
export interface UseStreamingCompletionReturn extends StreamingState, StreamingActions {}

/**
 * Default streaming endpoint
 */
const DEFAULT_ENDPOINT = '/api/chat/stream';

/**
 * Initial state
 */
const initialState: StreamingState = {
  status: 'idle',
  text: '',
  error: null,
  isStreaming: false,
  isLoading: false,
  isComplete: false,
  provider: null,
  model: null,
  startTime: null,
  duration: null,
};

/**
 * Parse SSE data from a chunk
 */
export function parseSSEChunk(chunk: string): string[] {
  const lines = chunk.split('\n');
  const messages: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('data: ')) {
      const data = trimmed.slice(6);
      if (data !== '[DONE]') {
        try {
          const parsed = JSON.parse(data);
          // Handle OpenAI format
          if (parsed.choices?.[0]?.delta?.content) {
            messages.push(parsed.choices[0].delta.content);
          }
          // Handle Claude format
          else if (parsed.delta?.text) {
            messages.push(parsed.delta.text);
          }
          // Handle plain text format
          else if (typeof parsed === 'string') {
            messages.push(parsed);
          }
          // Handle content_block_delta (Claude)
          else if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
            messages.push(parsed.delta.text);
          }
        } catch {
          // If not JSON, treat as plain text
          if (data.length > 0 && data !== '[DONE]') {
            messages.push(data);
          }
        }
      }
    }
  }

  return messages;
}

/**
 * Hook for streaming AI completions
 */
export function useStreamingCompletion(): UseStreamingCompletionReturn {
  const [state, setState] = useState<StreamingState>(initialState);
  const abortControllerRef = useRef<AbortController | null>(null);
  const textRef = useRef<string>('');

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const stream = useCallback(
    async (messages: AIMessage[], options: StreamingOptions = {}) => {
      const {
        model = 'gpt-3.5-turbo',
        maxTokens,
        temperature,
        endpoint = DEFAULT_ENDPOINT,
        onChunk,
        onComplete,
        onError,
      } = options;

      // Cancel any existing stream
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Reset state
      textRef.current = '';
      const startTime = Date.now();

      setState({
        status: 'connecting',
        text: '',
        error: null,
        isStreaming: false,
        isLoading: true,
        isComplete: false,
        provider: null,
        model,
        startTime,
        duration: null,
      });

      // Create abort controller
      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages,
            model,
            maxTokens,
            temperature,
            stream: true,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (!response.body) {
          throw new Error('Response body is null');
        }

        // Determine provider from model
        let provider: AIProviderType = 'openai';
        if (model.startsWith('claude')) {
          provider = 'anthropic';
        } else if (model.startsWith('gemini')) {
          provider = 'gemini';
        }

        setState((prev) => ({
          ...prev,
          status: 'streaming',
          isStreaming: true,
          isLoading: false,
          provider,
        }));

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          const parsedMessages = parseSSEChunk(chunk);

          for (const message of parsedMessages) {
            textRef.current += message;
            onChunk?.(message, textRef.current);

            setState((prev) => ({
              ...prev,
              text: textRef.current,
            }));
          }
        }

        const duration = Date.now() - startTime;

        setState((prev) => ({
          ...prev,
          status: 'complete',
          isStreaming: false,
          isComplete: true,
          duration,
        }));

        onComplete?.(textRef.current);
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          setState((prev) => ({
            ...prev,
            status: 'cancelled',
            isStreaming: false,
            isLoading: false,
            duration: Date.now() - startTime,
          }));
          return;
        }

        const err = error instanceof Error ? error : new Error('Unknown error');

        setState((prev) => ({
          ...prev,
          status: 'error',
          error: err,
          isStreaming: false,
          isLoading: false,
          duration: Date.now() - startTime,
        }));

        onError?.(err);
      }
    },
    []
  );

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    cancel();
    textRef.current = '';
    setState(initialState);
  }, [cancel]);

  const appendText = useCallback((text: string) => {
    textRef.current += text;
    setState((prev) => ({
      ...prev,
      text: textRef.current,
    }));
  }, []);

  return {
    ...state,
    stream,
    cancel,
    reset,
    appendText,
  };
}

/**
 * Simulate streaming for testing/demo purposes
 */
export function simulateStream(
  text: string,
  options: {
    delayMs?: number;
    chunkSize?: number;
    onChunk?: (chunk: string, fullText: string) => void;
    onComplete?: (fullText: string) => void;
  } = {}
): { cancel: () => void } {
  const { delayMs = 50, chunkSize = 5, onChunk, onComplete } = options;
  let cancelled = false;
  let accumulated = '';

  const words = text.split(' ');
  let index = 0;

  const interval = setInterval(() => {
    if (cancelled || index >= words.length) {
      clearInterval(interval);
      if (!cancelled) {
        onComplete?.(accumulated);
      }
      return;
    }

    const chunk = words.slice(index, index + chunkSize).join(' ') + ' ';
    accumulated += chunk;
    onChunk?.(chunk, accumulated);
    index += chunkSize;
  }, delayMs);

  return {
    cancel: () => {
      cancelled = true;
      clearInterval(interval);
    },
  };
}
