import type { ReactNode } from 'react';

/**
 * Loading state variants for different UI contexts
 */
export type LoadingVariant = 'spinner' | 'skeleton' | 'dots' | 'pulse';

/**
 * Loading sizes
 */
export type LoadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Base props for loading components
 */
export interface LoadingBaseProps {
  /** Size of the loading indicator */
  size?: LoadingSize;
  /** Optional className for styling */
  className?: string;
  /** Accessible label for screen readers */
  'aria-label'?: string;
}

/**
 * Props for the LoadingSpinner component
 */
export interface LoadingSpinnerProps extends LoadingBaseProps {
  /** Color variant */
  variant?: 'default' | 'primary' | 'secondary' | 'muted';
}

/**
 * Props for the LoadingOverlay component
 */
export interface LoadingOverlayProps {
  /** Whether the overlay is visible */
  isLoading: boolean;
  /** Content to display while loading */
  children?: ReactNode;
  /** Loading message text */
  message?: string;
  /** Whether to show blur effect on background */
  blur?: boolean;
  /** Optional className for styling */
  className?: string;
}

/**
 * Props for the LoadingSkeleton component
 */
export interface LoadingSkeletonProps extends LoadingBaseProps {
  /** Skeleton variant */
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  /** Width of the skeleton (CSS value) */
  width?: string | number;
  /** Height of the skeleton (CSS value) */
  height?: string | number;
  /** Number of skeleton lines to render */
  lines?: number;
  /** Whether to animate the skeleton */
  animate?: boolean;
}

/**
 * Props for skeleton card placeholder
 */
export interface LoadingSkeletonCardProps {
  /** Whether to show avatar */
  showAvatar?: boolean;
  /** Number of text lines */
  lines?: number;
  /** Optional className */
  className?: string;
}

/**
 * Props for the LoadingButton component
 */
export interface LoadingButtonProps {
  /** Whether the button is in loading state */
  isLoading: boolean;
  /** Text to show while loading */
  loadingText?: string;
  /** Default button text */
  children: ReactNode;
  /** Loading indicator position */
  loadingPosition?: 'left' | 'right';
}

/**
 * Return type for useLoadingState hook
 */
export interface UseLoadingStateResult {
  /** Current loading state */
  isLoading: boolean;
  /** Current loading message */
  message: string;
  /** Start loading with optional message */
  startLoading: (message?: string) => void;
  /** Stop loading */
  stopLoading: () => void;
  /** Set loading message */
  setMessage: (message: string) => void;
  /** Execute async operation with loading state */
  withLoading: <T>(
    operation: () => Promise<T>,
    options?: { message?: string; successMessage?: string }
  ) => Promise<T | null>;
}

/**
 * Size mappings for consistent sizing
 */
export const LOADING_SIZES: Record<LoadingSize, { spinner: number; text: string }> = {
  xs: { spinner: 12, text: 'text-xs' },
  sm: { spinner: 16, text: 'text-sm' },
  md: { spinner: 24, text: 'text-base' },
  lg: { spinner: 32, text: 'text-lg' },
  xl: { spinner: 48, text: 'text-xl' },
};
