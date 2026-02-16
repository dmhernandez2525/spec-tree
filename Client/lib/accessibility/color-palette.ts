/**
 * Accessible Color Palette Utilities
 *
 * Color validation, contrast checking, and automatic adjustment
 * to ensure all SpecTree UI colors meet WCAG 2.1 AA requirements.
 */

import { checkColorContrast, parseColor, relativeLuminance } from './wcag-checker';

export interface ColorPair {
  foreground: string;
  background: string;
  contrastRatio: number;
  meetsAA: boolean;
  meetsAAA: boolean;
}

/**
 * SpecTree's semantic color palette.
 * Maps role names to hex colors used throughout the application.
 */
export const SPEC_TREE_COLORS: Record<string, string> = {
  epic: '#7c3aed',
  feature: '#2563eb',
  userStory: '#059669',
  task: '#d97706',
  background: '#ffffff',
  foregroundPrimary: '#0f172a',
  foregroundSecondary: '#475569',
  border: '#e2e8f0',
} as const;

/**
 * Validates all foreground/background combinations in a palette
 * against WCAG AA and AAA contrast thresholds.
 *
 * Foreground colors are those whose keys contain "foreground" or
 * are semantic role colors (epic, feature, etc.). Background colors
 * are those whose keys contain "background".
 *
 * @param colors - Object mapping color names to hex values
 * @returns Array of ColorPair results for each combination tested
 */
export function validatePalette(colors: Record<string, string>): ColorPair[] {
  const results: ColorPair[] = [];

  const backgroundKeys = Object.keys(colors).filter(
    (key) => key.toLowerCase().includes('background'),
  );
  const foregroundKeys = Object.keys(colors).filter(
    (key) => !key.toLowerCase().includes('background') && !key.toLowerCase().includes('border'),
  );

  for (const fgKey of foregroundKeys) {
    for (const bgKey of backgroundKeys) {
      const contrast = checkColorContrast(colors[fgKey], colors[bgKey]);
      results.push({
        foreground: colors[fgKey],
        background: colors[bgKey],
        contrastRatio: contrast.ratio,
        meetsAA: contrast.meetsAA,
        meetsAAA: contrast.meetsAAA,
      });
    }
  }

  return results;
}

/**
 * Converts a hex color string to HSL components.
 * Returns hue in degrees (0-360), saturation (0-1), lightness (0-1).
 */
function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const rgb = parseColor(hex);
  if (!rgb) return null;

  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h: number;
  if (max === r) {
    h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  } else if (max === g) {
    h = ((b - r) / d + 2) / 6;
  } else {
    h = ((r - g) / d + 4) / 6;
  }

  return { h: h * 360, s, l };
}

/**
 * Converts HSL components to a hex color string.
 *
 * @param h - Hue in degrees (0-360)
 * @param s - Saturation (0-1)
 * @param l - Lightness (0-1)
 */
function hslToHex(h: number, s: number, l: number): string {
  const hueToRgb = (p: number, q: number, t: number): number => {
    let tc = t;
    if (tc < 0) tc += 1;
    if (tc > 1) tc -= 1;
    if (tc < 1 / 6) return p + (q - p) * 6 * tc;
    if (tc < 1 / 2) return q;
    if (tc < 2 / 3) return p + (q - p) * (2 / 3 - tc) * 6;
    return p;
  };

  let r: number;
  let g: number;
  let b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hNorm = h / 360;
    r = hueToRgb(p, q, hNorm + 1 / 3);
    g = hueToRgb(p, q, hNorm);
    b = hueToRgb(p, q, hNorm - 1 / 3);
  }

  const toHex = (c: number): string => {
    const val = Math.round(c * 255);
    const clamped = Math.max(0, Math.min(255, val));
    return clamped.toString(16).padStart(2, '0');
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Suggests an accessible alternative foreground color that meets
 * the target contrast ratio against the given background.
 *
 * Adjusts the foreground's lightness (darker or lighter) until
 * the target ratio is met, preserving the original hue and saturation.
 *
 * @param foreground - Current foreground hex color
 * @param background - Background hex color
 * @param targetRatio - Minimum contrast ratio to achieve (default 4.5 for AA)
 * @returns An adjusted foreground hex color meeting the target ratio
 */
export function suggestAccessibleAlternative(
  foreground: string,
  background: string,
  targetRatio: number = 4.5,
): string {
  const current = checkColorContrast(foreground, background);
  if (current.ratio >= targetRatio) return foreground;

  const fgHsl = hexToHsl(foreground);
  const bgRgb = parseColor(background);
  if (!fgHsl || !bgRgb) return foreground;

  const bgLum = relativeLuminance(bgRgb.r, bgRgb.g, bgRgb.b);

  // Determine whether to darken or lighten based on background luminance
  const shouldDarken = bgLum > 0.5;

  let bestColor = foreground;
  let bestRatio = current.ratio;

  // Binary search for the lightness that achieves the target ratio
  let low = shouldDarken ? 0 : fgHsl.l;
  let high = shouldDarken ? fgHsl.l : 1;

  for (let i = 0; i < 50; i++) {
    const mid = (low + high) / 2;
    const candidate = hslToHex(fgHsl.h, fgHsl.s, mid);
    const result = checkColorContrast(candidate, background);

    if (result.ratio >= targetRatio) {
      bestColor = candidate;
      bestRatio = result.ratio;

      // Try to get closer to original lightness while still meeting ratio
      if (shouldDarken) {
        low = mid;
      } else {
        high = mid;
      }
    } else {
      if (shouldDarken) {
        high = mid;
      } else {
        low = mid;
      }
    }
  }

  // If adjustment within original hue did not work, fall back to black or white
  if (bestRatio < targetRatio) {
    return shouldDarken ? '#000000' : '#ffffff';
  }

  return bestColor;
}

/**
 * Given a set of base colors, generates an accessible palette where
 * every color meets WCAG AA contrast (4.5:1) against the palette's
 * background color.
 *
 * If no "background" key exists, white (#ffffff) is assumed.
 *
 * @param baseColors - Object mapping color names to hex values
 * @returns A new palette with adjusted colors that all meet AA contrast
 */
export function generateAccessiblePalette(
  baseColors: Record<string, string>,
): Record<string, string> {
  const result: Record<string, string> = { ...baseColors };
  const background = baseColors.background || '#ffffff';

  for (const key of Object.keys(result)) {
    if (key === 'background' || key === 'border') continue;

    const contrast = checkColorContrast(result[key], background);
    if (!contrast.meetsAA) {
      result[key] = suggestAccessibleAlternative(result[key], background);
    }
  }

  return result;
}
