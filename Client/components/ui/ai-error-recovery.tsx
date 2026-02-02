'use client';

import { AlertCircle, RefreshCw, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { AIError, RecoveryOption, RecoveryAction } from '@/lib/utils/ai-error-recovery';
import type { GenerationState } from '@/lib/hooks/useAIGenerationRecovery';

interface AIErrorRecoveryProps {
  state: GenerationState;
  onRecover: (action: RecoveryAction) => void;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Component for displaying AI generation errors with recovery options
 */
export function AIErrorRecovery({
  state,
  onRecover,
  onDismiss,
  className,
}: AIErrorRecoveryProps) {
  // Show component for error or recovering states
  const isRecovering = state.status === 'recovering';
  const isError = state.status === 'error';

  if ((!isError && !isRecovering) || !state.error) {
    return null;
  }

  const { error, recoveryOptions } = state;

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        'bg-destructive/5 border-destructive/20',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-destructive">
            Generation Failed
          </h4>
          <p className="mt-1 text-sm text-muted-foreground">
            {error.userMessage}
          </p>

          {recoveryOptions.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {recoveryOptions.map((option) => (
                <RecoveryButton
                  key={option.action}
                  option={option}
                  onClick={() => onRecover(option.action)}
                  disabled={isRecovering}
                  isLoading={isRecovering && option.isPrimary}
                />
              ))}
            </div>
          )}

          {state.attemptCount > 1 && (
            <p className="mt-2 text-xs text-muted-foreground">
              Attempt {state.attemptCount} of generation
            </p>
          )}
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Dismiss error"
          >
            <span className="sr-only">Dismiss</span>
            <span aria-hidden>×</span>
          </button>
        )}
      </div>
    </div>
  );
}

interface RecoveryButtonProps {
  option: RecoveryOption;
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
}

function RecoveryButton({
  option,
  onClick,
  disabled,
  isLoading,
}: RecoveryButtonProps) {
  const Icon = getActionIcon(option.action);

  return (
    <Button
      variant={option.isPrimary ? 'default' : 'outline'}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      title={option.description}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Icon className="h-4 w-4 mr-2" />
      )}
      {option.label}
    </Button>
  );
}

function getActionIcon(action: RecoveryAction) {
  switch (action) {
    case 'retry':
    case 'retry_with_smaller_context':
    case 'wait_and_retry':
      return RefreshCw;
    case 'switch_model':
    case 'manual_edit':
    case 'contact_support':
    case 'check_connection':
    default:
      return ArrowRight;
  }
}

/**
 * Compact inline error indicator for smaller spaces
 */
export function AIErrorIndicator({
  error,
  onRetry,
  className,
}: {
  error: AIError | null;
  onRetry?: () => void;
  className?: string;
}) {
  if (!error) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-sm text-destructive',
        className
      )}
    >
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span className="truncate">{error.userMessage}</span>
      {onRetry && error.retryable && (
        <button
          onClick={onRetry}
          className="text-destructive hover:underline flex-shrink-0"
        >
          Retry
        </button>
      )}
    </div>
  );
}

export default AIErrorRecovery;
