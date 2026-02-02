/**
 * Loading Components Module
 *
 * Provides standardized loading states and components for the application.
 *
 * @example
 * ```tsx
 * import {
 *   LoadingSpinner,
 *   LoadingSkeleton,
 *   LoadingOverlay,
 *   useLoadingState,
 * } from '@/components/shared/loading';
 *
 * // Spinner for inline loading
 * <LoadingSpinner size="md" />
 *
 * // Skeleton for content placeholders
 * <LoadingSkeleton lines={3} />
 *
 * // Overlay for blocking operations
 * <LoadingOverlay isLoading={isSubmitting}>
 *   <Form />
 * </LoadingOverlay>
 *
 * // Hook for state management
 * const { isLoading, withLoading } = useLoadingState();
 * ```
 */

export {
  LoadingSpinner,
  PageLoadingSpinner,
  InlineLoadingSpinner,
} from './LoadingSpinner';

export {
  LoadingSkeleton,
  LoadingSkeletonCard,
  LoadingSkeletonTable,
  LoadingSkeletonList,
} from './LoadingSkeleton';

export { LoadingOverlay, FullScreenLoadingOverlay } from './LoadingOverlay';

export { useLoadingState } from './useLoadingState';

export { LOADING_SIZES } from './types';

export type {
  LoadingVariant,
  LoadingSize,
  LoadingBaseProps,
  LoadingSpinnerProps,
  LoadingOverlayProps,
  LoadingSkeletonProps,
  LoadingSkeletonCardProps,
  LoadingButtonProps,
  UseLoadingStateResult,
} from './types';
