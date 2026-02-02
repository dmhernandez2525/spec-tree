'use client';

import { useState, useCallback, useRef } from 'react';
import {
  classifyAIError,
  getRecoveryOptions,
  logAIError,
  canRecoverWith,
  getFallbackModel,
  AIError,
  RecoveryOption,
  RecoveryAction,
} from '@/lib/utils/ai-error-recovery';
import { logger } from '@/lib/logger';

export interface GenerationState {
  status: 'idle' | 'generating' | 'success' | 'error' | 'recovering';
  error: AIError | null;
  recoveryOptions: RecoveryOption[];
  attemptCount: number;
  lastAttemptModel?: string;
}

export interface UseAIGenerationRecoveryOptions {
  maxAutoRetries?: number;
  onSuccess?: (result: unknown) => void;
  onError?: (error: AIError) => void;
  onRecoveryAttempt?: (action: RecoveryAction, attemptCount: number) => void;
}

export interface UseAIGenerationRecoveryReturn<T> {
  state: GenerationState;
  execute: (generationFn: () => Promise<T>, context: string) => Promise<T | null>;
  retry: () => Promise<T | null>;
  retryWithModel: (model: string) => Promise<T | null>;
  recover: (action: RecoveryAction) => Promise<T | null>;
  reset: () => void;
  canAutoRecover: boolean;
}

const initialState: GenerationState = {
  status: 'idle',
  error: null,
  recoveryOptions: [],
  attemptCount: 0,
};

/**
 * Hook for managing AI generation with automatic error recovery
 */
export function useAIGenerationRecovery<T>(
  options: UseAIGenerationRecoveryOptions = {}
): UseAIGenerationRecoveryReturn<T> {
  const {
    maxAutoRetries = 2,
    onSuccess,
    onError,
    onRecoveryAttempt,
  } = options;

  const [state, setState] = useState<GenerationState>(initialState);
  const lastGenerationFn = useRef<(() => Promise<T>) | null>(null);
  const lastContext = useRef<string>('');
  const currentModel = useRef<string | undefined>(undefined);

  const reset = useCallback(() => {
    setState(initialState);
    lastGenerationFn.current = null;
    lastContext.current = '';
    currentModel.current = undefined;
  }, []);

  const handleError = useCallback(
    (error: unknown, context: string): AIError => {
      const aiError = classifyAIError(error);
      const recoveryOptions = getRecoveryOptions(aiError);

      logAIError(aiError, context);

      setState((prev) => ({
        ...prev,
        status: 'error',
        error: aiError,
        recoveryOptions,
      }));

      onError?.(aiError);

      return aiError;
    },
    [onError]
  );

  const execute = useCallback(
    async (
      generationFn: () => Promise<T>,
      context: string
    ): Promise<T | null> => {
      lastGenerationFn.current = generationFn;
      lastContext.current = context;

      setState((prev) => ({
        ...prev,
        status: 'generating',
        error: null,
        recoveryOptions: [],
        attemptCount: prev.attemptCount + 1,
      }));

      try {
        const result = await generationFn();

        setState((prev) => ({
          ...prev,
          status: 'success',
          error: null,
          recoveryOptions: [],
        }));

        onSuccess?.(result);
        logger.log('AIGeneration', `Success in ${context}`, {
          attemptCount: state.attemptCount + 1,
        });

        return result;
      } catch (error) {
        const aiError = handleError(error, context);

        // Auto-retry for retryable errors if within limits
        if (
          aiError.retryable &&
          canRecoverWith(aiError, 'retry') &&
          state.attemptCount < maxAutoRetries
        ) {
          logger.log('AIGeneration', `Auto-retrying ${context}`, {
            attemptCount: state.attemptCount + 1,
            maxAutoRetries,
          });

          // Small delay before auto-retry
          await new Promise((resolve) => setTimeout(resolve, 1000));

          return execute(generationFn, context);
        }

        return null;
      }
    },
    [handleError, maxAutoRetries, onSuccess, state.attemptCount]
  );

  const retry = useCallback(async (): Promise<T | null> => {
    if (!lastGenerationFn.current) {
      logger.warn('AIGeneration', 'No generation function to retry');
      return null;
    }

    onRecoveryAttempt?.('retry', state.attemptCount + 1);

    return execute(lastGenerationFn.current, lastContext.current);
  }, [execute, onRecoveryAttempt, state.attemptCount]);

  const retryWithModel = useCallback(
    async (model: string): Promise<T | null> => {
      if (!lastGenerationFn.current) {
        logger.warn('AIGeneration', 'No generation function to retry');
        return null;
      }

      currentModel.current = model;
      onRecoveryAttempt?.('switch_model', state.attemptCount + 1);

      setState((prev) => ({
        ...prev,
        status: 'recovering',
        lastAttemptModel: model,
      }));

      logger.log('AIGeneration', `Retrying with model ${model}`);

      return execute(lastGenerationFn.current, lastContext.current);
    },
    [execute, onRecoveryAttempt, state.attemptCount]
  );

  const recover = useCallback(
    async (action: RecoveryAction): Promise<T | null> => {
      if (!state.error || !canRecoverWith(state.error, action)) {
        logger.warn('AIGeneration', `Cannot recover with action: ${action}`);
        return null;
      }

      onRecoveryAttempt?.(action, state.attemptCount + 1);

      setState((prev) => ({
        ...prev,
        status: 'recovering',
      }));

      switch (action) {
        case 'retry':
          return retry();

        case 'switch_model':
          const fallbackModel = getFallbackModel(
            currentModel.current || 'gpt-3.5-turbo-16k'
          );
          if (fallbackModel) {
            return retryWithModel(fallbackModel);
          }
          logger.warn('AIGeneration', 'No fallback model available');
          return null;

        case 'wait_and_retry':
          const waitMs = state.error.suggestedWaitMs || 5000;
          logger.log('AIGeneration', `Waiting ${waitMs}ms before retry`);
          await new Promise((resolve) => setTimeout(resolve, waitMs));
          return retry();

        case 'retry_with_smaller_context':
          // This requires the caller to modify the generation function
          // We'll just do a regular retry - the UI should guide the user
          logger.log('AIGeneration', 'Retry with smaller context requested');
          return retry();

        default:
          // Non-automatic recovery actions (manual_edit, contact_support, check_connection)
          logger.log('AIGeneration', `Manual recovery action requested: ${action}`);
          return null;
      }
    },
    [state.error, state.attemptCount, onRecoveryAttempt, retry, retryWithModel]
  );

  const canAutoRecover =
    state.status === 'error' &&
    state.error !== null &&
    state.error.retryable &&
    state.attemptCount <= maxAutoRetries;

  return {
    state,
    execute,
    retry,
    retryWithModel,
    recover,
    reset,
    canAutoRecover,
  };
}

export default useAIGenerationRecovery;
