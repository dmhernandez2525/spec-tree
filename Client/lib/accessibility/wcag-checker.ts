/**
 * WCAG 2.1 AA Compliance Checker Utilities
 *
 * Provides color contrast analysis, heading hierarchy validation,
 * image alt text checks, form label verification, landmark region
 * validation, and Markdown report generation.
 */

export type ViolationImpact = 'critical' | 'serious' | 'moderate' | 'minor';

export interface WcagViolation {
  id: string;
  impact: ViolationImpact;
  element: string;
  description: string;
  wcagCriteria: string;
  fix: string;
}

export interface WcagCheckResult {
  violations: WcagViolation[];
  passes: number;
  incomplete: number;
  timestamp: number;
}

export interface ContrastResult {
  ratio: number;
  meetsAA: boolean;
  meetsAAA: boolean;
}

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface ImageDescriptor {
  src: string;
  alt?: string;
  ariaLabel?: string;
}

export interface InputDescriptor {
  id: string;
  type: string;
  label?: string;
  ariaLabel?: string;
}

export interface LandmarkSet {
  main?: boolean;
  navigation?: boolean;
  contentinfo?: boolean;
  banner?: boolean;
  complementary?: boolean;
  search?: boolean;
}

/**
 * Parses a CSS color string (hex or rgb) into its RGB components.
 * Supports #rgb, #rrggbb, and rgb(r, g, b) formats.
 *
 * Returns null if the format is not recognized.
 */
export function parseColor(color: string): RgbColor | null {
  const trimmed = color.trim();

  // Match #rrggbb
  const hex6 = /^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/.exec(trimmed);
  if (hex6) {
    return {
      r: parseInt(hex6[1], 16),
      g: parseInt(hex6[2], 16),
      b: parseInt(hex6[3], 16),
    };
  }

  // Match #rgb (shorthand)
  const hex3 = /^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/.exec(trimmed);
  if (hex3) {
    return {
      r: parseInt(hex3[1] + hex3[1], 16),
      g: parseInt(hex3[2] + hex3[2], 16),
      b: parseInt(hex3[3] + hex3[3], 16),
    };
  }

  // Match rgb(r, g, b)
  const rgbMatch = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/.exec(trimmed);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    if (r > 255 || g > 255 || b > 255) return null;
    return { r, g, b };
  }

  return null;
}

/**
 * Computes the WCAG 2.0 relative luminance of an sRGB color.
 * Each channel value should be in the range 0-255.
 *
 * Formula: https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
export function relativeLuminance(r: number, g: number, b: number): number {
  const toLinear = (c: number): number => {
    const srgb = c / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
  };

  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * Calculates the contrast ratio between two colors and evaluates
 * them against WCAG AA and AAA thresholds.
 *
 * AA requires 4.5:1 for normal text (3:1 for large text).
 * AAA requires 7:1 for normal text (4.5:1 for large text).
 *
 * The returned ratio is for normal text sizing. Callers can compare
 * the raw ratio against the large-text thresholds when needed.
 */
export function checkColorContrast(foreground: string, background: string): ContrastResult {
  const fg = parseColor(foreground);
  const bg = parseColor(background);

  if (!fg || !bg) {
    return { ratio: 0, meetsAA: false, meetsAAA: false };
  }

  const lumFg = relativeLuminance(fg.r, fg.g, fg.b);
  const lumBg = relativeLuminance(bg.r, bg.g, bg.b);

  const lighter = Math.max(lumFg, lumBg);
  const darker = Math.min(lumFg, lumBg);

  const ratio = (lighter + 0.05) / (darker + 0.05);

  return {
    ratio: Math.round(ratio * 100) / 100,
    meetsAA: ratio >= 4.5,
    meetsAAA: ratio >= 7,
  };
}

/**
 * Validates heading hierarchy. Headings should be sequential and
 * should not skip levels (e.g., h1 followed by h3 skips h2).
 *
 * @param headings - Array of heading levels (1 through 6)
 * @returns Array of violations for any skipped heading levels
 */
export function checkHeadingHierarchy(headings: number[]): WcagViolation[] {
  const violations: WcagViolation[] = [];

  for (let i = 1; i < headings.length; i++) {
    const current = headings[i];
    const previous = headings[i - 1];

    if (current > previous + 1) {
      violations.push({
        id: `heading-skip-${i}`,
        impact: 'moderate',
        element: `h${current}`,
        description: `Heading level skipped from h${previous} to h${current}`,
        wcagCriteria: '1.3.1 Info and Relationships',
        fix: `Use h${previous + 1} instead of h${current}, or add the missing intermediate heading levels`,
      });
    }
  }

  return violations;
}

/**
 * Checks that all images have appropriate alternative text.
 * Every image must have either a non-empty alt attribute or an
 * aria-label to be accessible.
 *
 * @param images - Array of image descriptors
 * @returns Array of violations for images missing alt text
 */
export function checkImageAltText(images: ImageDescriptor[]): WcagViolation[] {
  const violations: WcagViolation[] = [];

  for (const image of images) {
    const hasAlt = typeof image.alt === 'string' && image.alt.trim().length > 0;
    const hasAriaLabel = typeof image.ariaLabel === 'string' && image.ariaLabel.trim().length > 0;

    if (!hasAlt && !hasAriaLabel) {
      violations.push({
        id: `img-alt-missing-${image.src}`,
        impact: 'critical',
        element: `img[src="${image.src}"]`,
        description: `Image is missing alternative text`,
        wcagCriteria: '1.1.1 Non-text Content',
        fix: `Add an alt attribute or aria-label to the image at "${image.src}"`,
      });
    }
  }

  return violations;
}

/**
 * Checks that all form inputs have an associated label.
 * Inputs must have either a <label> element or an aria-label attribute.
 *
 * @param inputs - Array of input descriptors
 * @returns Array of violations for unlabeled inputs
 */
export function checkFormLabels(inputs: InputDescriptor[]): WcagViolation[] {
  const violations: WcagViolation[] = [];

  for (const input of inputs) {
    const hasLabel = typeof input.label === 'string' && input.label.trim().length > 0;
    const hasAriaLabel = typeof input.ariaLabel === 'string' && input.ariaLabel.trim().length > 0;

    if (!hasLabel && !hasAriaLabel) {
      violations.push({
        id: `form-label-missing-${input.id}`,
        impact: 'serious',
        element: `input#${input.id}[type="${input.type}"]`,
        description: `Form input "${input.id}" has no associated label`,
        wcagCriteria: '1.3.1 Info and Relationships',
        fix: `Add a <label> element with for="${input.id}" or add an aria-label attribute to the input`,
      });
    }
  }

  return violations;
}

/**
 * Validates that the page has the required ARIA landmark regions.
 * At minimum, a page should have main, navigation, and contentinfo regions.
 *
 * @param landmarks - Object describing which landmarks are present
 * @returns Array of violations for missing required landmarks
 */
export function checkLandmarks(landmarks: LandmarkSet): WcagViolation[] {
  const violations: WcagViolation[] = [];

  const required: { key: keyof LandmarkSet; label: string }[] = [
    { key: 'main', label: 'main' },
    { key: 'navigation', label: 'navigation' },
    { key: 'contentinfo', label: 'contentinfo' },
  ];

  for (const { key, label } of required) {
    if (!landmarks[key]) {
      violations.push({
        id: `landmark-missing-${label}`,
        impact: 'serious',
        element: 'body',
        description: `Page is missing a "${label}" landmark region`,
        wcagCriteria: '1.3.1 Info and Relationships',
        fix: `Add a <${label === 'main' ? 'main' : label === 'navigation' ? 'nav' : 'footer'}> element or use role="${label}" on the appropriate container`,
      });
    }
  }

  return violations;
}

/**
 * Generates a Markdown report from a WCAG check result.
 */
export function generateReport(result: WcagCheckResult): string {
  const lines: string[] = [];
  const date = new Date(result.timestamp).toISOString();

  lines.push('# WCAG 2.1 AA Compliance Report');
  lines.push('');
  lines.push(`**Generated:** ${date}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`| Metric | Count |`);
  lines.push(`| --- | --- |`);
  lines.push(`| Violations | ${result.violations.length} |`);
  lines.push(`| Passes | ${result.passes} |`);
  lines.push(`| Incomplete | ${result.incomplete} |`);
  lines.push('');

  if (result.violations.length === 0) {
    lines.push('No violations found. All checks passed.');
    return lines.join('\n');
  }

  lines.push('## Violations');
  lines.push('');

  for (const v of result.violations) {
    lines.push(`### ${v.id}`);
    lines.push('');
    lines.push(`- **Impact:** ${v.impact}`);
    lines.push(`- **Element:** \`${v.element}\``);
    lines.push(`- **WCAG Criteria:** ${v.wcagCriteria}`);
    lines.push(`- **Description:** ${v.description}`);
    lines.push(`- **Fix:** ${v.fix}`);
    lines.push('');
  }

  return lines.join('\n');
}
