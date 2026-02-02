/**
 * Streaming Text Component
 *
 * F1.1.10 - Streaming AI responses
 *
 * Displays streaming text with cursor animation.
 */

import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface StreamingTextProps {
  /** The text to display */
  text: string;
  /** Whether currently streaming */
  isStreaming?: boolean;
  /** Whether loading/connecting */
  isLoading?: boolean;
  /** Show typing cursor */
  showCursor?: boolean;
  /** Auto-scroll to bottom */
  autoScroll?: boolean;
  /** Class name for the container */
  className?: string;
  /** Class name for the text */
  textClassName?: string;
  /** Placeholder text when empty */
  placeholder?: string;
}

/**
 * Animated cursor component
 */
function StreamingCursor() {
  return (
    <span className="inline-block w-0.5 h-5 ml-0.5 bg-current animate-pulse" />
  );
}

/**
 * Loading indicator
 */
function LoadingIndicator() {
  return (
    <span className="inline-flex items-center gap-1 text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="text-sm">Connecting...</span>
    </span>
  );
}

/**
 * StreamingText Component
 *
 * Renders streaming text with optional cursor and auto-scroll.
 */
export function StreamingText({
  text,
  isStreaming = false,
  isLoading = false,
  showCursor = true,
  autoScroll = true,
  className,
  textClassName,
  placeholder = 'Waiting for response...',
}: StreamingTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when text changes
  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [text, autoScroll]);

  const isEmpty = !text || text.length === 0;

  return (
    <div
      ref={containerRef}
      className={cn(
        'overflow-y-auto whitespace-pre-wrap',
        className
      )}
    >
      {isLoading ? (
        <LoadingIndicator />
      ) : isEmpty ? (
        <span className="text-muted-foreground">{placeholder}</span>
      ) : (
        <>
          <span className={textClassName}>{text}</span>
          {isStreaming && showCursor && <StreamingCursor />}
        </>
      )}
    </div>
  );
}

/**
 * StreamingTextCard Component
 *
 * StreamingText wrapped in a card with header.
 */
interface StreamingTextCardProps extends StreamingTextProps {
  /** Card title */
  title?: string;
  /** Duration of streaming in ms */
  duration?: number | null;
  /** Show stats */
  showStats?: boolean;
}

export function StreamingTextCard({
  title = 'Response',
  duration,
  showStats = true,
  ...props
}: StreamingTextCardProps) {
  const charCount = props.text?.length || 0;
  const wordCount = props.text?.split(/\s+/).filter(Boolean).length || 0;

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="text-sm font-medium">{title}</h3>
        {showStats && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {charCount > 0 && (
              <>
                <span>{wordCount} words</span>
                <span>{charCount} chars</span>
              </>
            )}
            {duration !== null && duration !== undefined && (
              <span>{(duration / 1000).toFixed(1)}s</span>
            )}
          </div>
        )}
      </div>
      <StreamingText
        {...props}
        className={cn('p-4 min-h-[100px] max-h-[400px]', props.className)}
      />
    </div>
  );
}

export default StreamingText;
