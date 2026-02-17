/**
 * Responsive Design Utilities
 *
 * Provides breakpoint detection, device type classification,
 * fluid typography calculations, and WCAG-compliant touch target
 * sizing for the SpecTree application.
 */

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Tailwind CSS-aligned breakpoint thresholds in pixels.
 */
export const BREAKPOINTS: Record<Breakpoint, number> = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

/**
 * Ordered list of breakpoints from smallest to largest,
 * used internally for threshold lookups.
 */
const BREAKPOINT_ORDER: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'];

/**
 * Determine the current breakpoint for a given viewport width.
 * Returns the largest breakpoint whose threshold is at or below the width.
 */
export function getBreakpoint(width: number): Breakpoint {
  for (let i = 0; i < BREAKPOINT_ORDER.length; i++) {
    const bp = BREAKPOINT_ORDER[i];
    if (width >= BREAKPOINTS[bp]) {
      return bp;
    }
  }
  return 'xs';
}

/**
 * Returns true if the given width falls below the medium breakpoint (768px),
 * indicating a mobile viewport.
 */
export function isMobile(width: number): boolean {
  return width < BREAKPOINTS.md;
}

/**
 * Returns true if the given width falls within the tablet range,
 * at or above medium (768px) but below large (1024px).
 */
export function isTablet(width: number): boolean {
  return width >= BREAKPOINTS.md && width < BREAKPOINTS.lg;
}

/**
 * Returns true if the given width is at or above the large breakpoint (1024px),
 * indicating a desktop viewport.
 */
export function isDesktop(width: number): boolean {
  return width >= BREAKPOINTS.lg;
}

/**
 * Suggested column counts per breakpoint for grid layouts.
 */
const COLUMN_MAP: Record<Breakpoint, number> = {
  xs: 1,
  sm: 1,
  md: 2,
  lg: 3,
  xl: 4,
  '2xl': 4,
};

/**
 * Returns the recommended number of grid columns for a given breakpoint.
 */
export function getColumnsForBreakpoint(breakpoint: Breakpoint): number {
  return COLUMN_MAP[breakpoint];
}

/**
 * Calculate a fluid font size that scales linearly between a minimum
 * and maximum viewport width, clamped to the specified size bounds.
 *
 * This mirrors the behavior of CSS clamp() for fluid typography:
 *   clamp(minSize, baseSize scaled by viewport, maxSize)
 *
 * @param baseSize - The ideal font size at a reference width (in px)
 * @param minSize - The minimum font size (in px)
 * @param maxSize - The maximum font size (in px)
 * @param width - The current viewport width (in px)
 * @returns The computed font size in px
 */
export function clampFontSize(
  baseSize: number,
  minSize: number,
  maxSize: number,
  width: number,
): number {
  // Scale linearly between sm and xl breakpoints
  const minWidth = BREAKPOINTS.sm; // 640
  const maxWidth = BREAKPOINTS.xl; // 1280

  if (width <= minWidth) return minSize;
  if (width >= maxWidth) return maxSize;

  // Linear interpolation between min and max
  const ratio = (width - minWidth) / (maxWidth - minWidth);
  const scaled = minSize + ratio * (maxSize - minSize);

  // Clamp within bounds
  return Math.max(minSize, Math.min(maxSize, scaled));
}

/**
 * Returns the minimum touch target size in pixels per WCAG 2.5.5 guidelines.
 * Mobile breakpoints (xs, sm) use 44px; tablet and desktop use 36px.
 */
export function getTouchTarget(breakpoint: Breakpoint): number {
  const mobileSizes: Breakpoint[] = ['xs', 'sm'];
  return mobileSizes.includes(breakpoint) ? 44 : 36;
}
