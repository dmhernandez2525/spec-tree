import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// wcag-checker imports
import {
  parseColor,
  relativeLuminance,
  checkColorContrast,
  checkHeadingHierarchy,
  checkImageAltText,
  checkFormLabels,
  checkLandmarks,
  generateReport,
} from './wcag-checker';
import type { WcagCheckResult } from './wcag-checker';

// keyboard-nav imports
import {
  FOCUSABLE_SELECTOR,
  handleArrowNavigation,
  isElementVisible,
  getFocusableElements,
  getTabOrder,
  announceToScreenReader,
  createFocusTrap,
} from './keyboard-nav';

// aria-helpers imports
import {
  ariaProps,
  treeItemProps,
  dialogProps,
  tabPanelProps,
  liveRegionProps,
  validateAriaAttributes,
} from './aria-helpers';
import type { ElementDescriptor } from './aria-helpers';

// color-palette imports
import {
  SPEC_TREE_COLORS,
  validatePalette,
  suggestAccessibleAlternative,
  generateAccessiblePalette,
} from './color-palette';

// ---------------------------------------------------------------------------
// wcag-checker.ts
// ---------------------------------------------------------------------------

describe('wcag-checker', () => {
  describe('parseColor', () => {
    it('parses 6-digit hex color', () => {
      const result = parseColor('#ff5733');
      expect(result).toEqual({ r: 255, g: 87, b: 51 });
    });

    it('parses 3-digit shorthand hex color', () => {
      const result = parseColor('#f00');
      expect(result).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('parses rgb() format', () => {
      const result = parseColor('rgb(100, 200, 50)');
      expect(result).toEqual({ r: 100, g: 200, b: 50 });
    });

    it('returns null for invalid color string', () => {
      expect(parseColor('not-a-color')).toBeNull();
    });

    it('returns null for rgb values exceeding 255', () => {
      expect(parseColor('rgb(300, 100, 100)')).toBeNull();
    });

    it('handles uppercase hex digits', () => {
      const result = parseColor('#AABBCC');
      expect(result).toEqual({ r: 170, g: 187, b: 204 });
    });

    it('trims whitespace from input', () => {
      const result = parseColor('  #000000  ');
      expect(result).toEqual({ r: 0, g: 0, b: 0 });
    });
  });

  describe('relativeLuminance', () => {
    it('returns 1.0 for pure white', () => {
      const lum = relativeLuminance(255, 255, 255);
      expect(lum).toBeCloseTo(1.0, 2);
    });

    it('returns 0.0 for pure black', () => {
      const lum = relativeLuminance(0, 0, 0);
      expect(lum).toBeCloseTo(0.0, 2);
    });

    it('returns intermediate value for mid-gray', () => {
      const lum = relativeLuminance(128, 128, 128);
      expect(lum).toBeGreaterThan(0);
      expect(lum).toBeLessThan(1);
    });

    it('weights green channel most heavily', () => {
      const lumRed = relativeLuminance(255, 0, 0);
      const lumGreen = relativeLuminance(0, 255, 0);
      const lumBlue = relativeLuminance(0, 0, 255);
      expect(lumGreen).toBeGreaterThan(lumRed);
      expect(lumGreen).toBeGreaterThan(lumBlue);
    });
  });

  describe('checkColorContrast', () => {
    it('reports white on black as meeting AA and AAA', () => {
      const result = checkColorContrast('#ffffff', '#000000');
      expect(result.ratio).toBe(21);
      expect(result.meetsAA).toBe(true);
      expect(result.meetsAAA).toBe(true);
    });

    it('reports low contrast pair as failing AA', () => {
      // Light gray on white has poor contrast
      const result = checkColorContrast('#cccccc', '#ffffff');
      expect(result.meetsAA).toBe(false);
    });

    it('correctly handles large text threshold (3:1 is accessible for large text)', () => {
      // Find a color pair with ratio between 3 and 4.5
      const result = checkColorContrast('#767676', '#ffffff');
      // #767676 on white is approximately 4.54:1, right at the AA boundary
      expect(result.ratio).toBeGreaterThanOrEqual(3);
      expect(result.meetsAA).toBe(true);
    });

    it('returns zero ratio for invalid colors', () => {
      const result = checkColorContrast('invalid', '#ffffff');
      expect(result.ratio).toBe(0);
      expect(result.meetsAA).toBe(false);
    });

    it('produces a symmetric ratio regardless of argument order', () => {
      const r1 = checkColorContrast('#333333', '#ffffff');
      const r2 = checkColorContrast('#ffffff', '#333333');
      expect(r1.ratio).toBe(r2.ratio);
    });
  });

  describe('checkHeadingHierarchy', () => {
    it('returns no violations for sequential headings', () => {
      const violations = checkHeadingHierarchy([1, 2, 3, 4]);
      expect(violations).toHaveLength(0);
    });

    it('returns a violation when levels are skipped', () => {
      const violations = checkHeadingHierarchy([1, 3]);
      expect(violations).toHaveLength(1);
      expect(violations[0].element).toBe('h3');
      expect(violations[0].impact).toBe('moderate');
    });

    it('allows going back to a higher level', () => {
      const violations = checkHeadingHierarchy([1, 2, 3, 2]);
      expect(violations).toHaveLength(0);
    });

    it('detects multiple skips', () => {
      const violations = checkHeadingHierarchy([1, 3, 6]);
      expect(violations).toHaveLength(2);
    });

    it('returns no violations for a single heading', () => {
      const violations = checkHeadingHierarchy([2]);
      expect(violations).toHaveLength(0);
    });

    it('returns no violations for an empty array', () => {
      const violations = checkHeadingHierarchy([]);
      expect(violations).toHaveLength(0);
    });
  });

  describe('checkImageAltText', () => {
    it('returns no violation when alt text is provided', () => {
      const violations = checkImageAltText([{ src: 'logo.png', alt: 'Company logo' }]);
      expect(violations).toHaveLength(0);
    });

    it('returns no violation when aria-label is provided', () => {
      const violations = checkImageAltText([{ src: 'icon.svg', ariaLabel: 'Settings icon' }]);
      expect(violations).toHaveLength(0);
    });

    it('returns a violation when both alt and aria-label are missing', () => {
      const violations = checkImageAltText([{ src: 'photo.jpg' }]);
      expect(violations).toHaveLength(1);
      expect(violations[0].impact).toBe('critical');
      expect(violations[0].wcagCriteria).toBe('1.1.1 Non-text Content');
    });

    it('returns a violation for empty alt string', () => {
      const violations = checkImageAltText([{ src: 'bg.png', alt: '   ' }]);
      expect(violations).toHaveLength(1);
    });

    it('checks multiple images independently', () => {
      const violations = checkImageAltText([
        { src: 'good.png', alt: 'Good' },
        { src: 'bad.png' },
        { src: 'also-bad.png', alt: '' },
      ]);
      expect(violations).toHaveLength(2);
    });
  });

  describe('checkFormLabels', () => {
    it('returns no violation for a labeled input', () => {
      const violations = checkFormLabels([
        { id: 'email', type: 'email', label: 'Email address' },
      ]);
      expect(violations).toHaveLength(0);
    });

    it('returns no violation for input with aria-label', () => {
      const violations = checkFormLabels([
        { id: 'search', type: 'text', ariaLabel: 'Search' },
      ]);
      expect(violations).toHaveLength(0);
    });

    it('returns a violation for unlabeled input', () => {
      const violations = checkFormLabels([
        { id: 'username', type: 'text' },
      ]);
      expect(violations).toHaveLength(1);
      expect(violations[0].impact).toBe('serious');
    });

    it('returns a violation for input with empty label', () => {
      const violations = checkFormLabels([
        { id: 'name', type: 'text', label: '  ' },
      ]);
      expect(violations).toHaveLength(1);
    });
  });

  describe('checkLandmarks', () => {
    it('returns no violations when all required landmarks are present', () => {
      const violations = checkLandmarks({
        main: true,
        navigation: true,
        contentinfo: true,
      });
      expect(violations).toHaveLength(0);
    });

    it('returns a violation for missing main landmark', () => {
      const violations = checkLandmarks({
        navigation: true,
        contentinfo: true,
      });
      expect(violations).toHaveLength(1);
      expect(violations[0].id).toBe('landmark-missing-main');
    });

    it('returns violations for all missing landmarks', () => {
      const violations = checkLandmarks({});
      expect(violations).toHaveLength(3);
    });

    it('ignores optional landmarks', () => {
      const violations = checkLandmarks({
        main: true,
        navigation: true,
        contentinfo: true,
        banner: false,
        complementary: false,
      });
      expect(violations).toHaveLength(0);
    });
  });

  describe('generateReport', () => {
    it('generates a report with no violations', () => {
      const result: WcagCheckResult = {
        violations: [],
        passes: 10,
        incomplete: 0,
        timestamp: Date.now(),
      };
      const report = generateReport(result);
      expect(report).toContain('# WCAG 2.1 AA Compliance Report');
      expect(report).toContain('No violations found');
      expect(report).toContain('| Passes | 10 |');
    });

    it('generates a report listing violations', () => {
      const result: WcagCheckResult = {
        violations: [
          {
            id: 'test-violation',
            impact: 'critical',
            element: 'img',
            description: 'Missing alt text',
            wcagCriteria: '1.1.1',
            fix: 'Add alt attribute',
          },
        ],
        passes: 5,
        incomplete: 1,
        timestamp: Date.now(),
      };
      const report = generateReport(result);
      expect(report).toContain('## Violations');
      expect(report).toContain('### test-violation');
      expect(report).toContain('**Impact:** critical');
      expect(report).toContain('| Violations | 1 |');
    });

    it('includes the timestamp in the report', () => {
      const ts = new Date('2025-06-15T12:00:00Z').getTime();
      const result: WcagCheckResult = {
        violations: [],
        passes: 0,
        incomplete: 0,
        timestamp: ts,
      };
      const report = generateReport(result);
      expect(report).toContain('2025-06-15');
    });
  });
});

// ---------------------------------------------------------------------------
// keyboard-nav.ts
// ---------------------------------------------------------------------------

describe('keyboard-nav', () => {
  describe('FOCUSABLE_SELECTOR', () => {
    it('includes anchor elements with href', () => {
      expect(FOCUSABLE_SELECTOR).toContain('a[href]');
    });

    it('includes buttons that are not disabled', () => {
      expect(FOCUSABLE_SELECTOR).toContain('button:not([disabled])');
    });

    it('includes input elements that are not disabled', () => {
      expect(FOCUSABLE_SELECTOR).toContain('input:not([disabled])');
    });

    it('includes select elements', () => {
      expect(FOCUSABLE_SELECTOR).toContain('select:not([disabled])');
    });

    it('includes textarea elements', () => {
      expect(FOCUSABLE_SELECTOR).toContain('textarea:not([disabled])');
    });

    it('includes elements with tabindex but not -1', () => {
      expect(FOCUSABLE_SELECTOR).toContain('[tabindex]:not([tabindex="-1"])');
    });

    it('includes elements with role="button"', () => {
      expect(FOCUSABLE_SELECTOR).toContain('[role="button"]:not([disabled])');
    });
  });

  describe('handleArrowNavigation', () => {
    const mockElements = [{}, {}, {}, {}] as HTMLElement[];

    it('moves forward on "down" direction', () => {
      const next = handleArrowNavigation(mockElements, 0, 'down');
      expect(next).toBe(1);
    });

    it('moves forward on "right" direction', () => {
      const next = handleArrowNavigation(mockElements, 1, 'right');
      expect(next).toBe(2);
    });

    it('moves backward on "up" direction', () => {
      const next = handleArrowNavigation(mockElements, 2, 'up');
      expect(next).toBe(1);
    });

    it('moves backward on "left" direction', () => {
      const next = handleArrowNavigation(mockElements, 3, 'left');
      expect(next).toBe(2);
    });

    it('wraps around to the end when moving backward from index 0', () => {
      const next = handleArrowNavigation(mockElements, 0, 'up');
      expect(next).toBe(3);
    });

    it('wraps around to the start when moving forward from last index', () => {
      const next = handleArrowNavigation(mockElements, 3, 'down');
      expect(next).toBe(0);
    });

    it('returns 0 for an empty element array', () => {
      const next = handleArrowNavigation([], 0, 'down');
      expect(next).toBe(0);
    });
  });

  describe('isElementVisible', () => {
    let element: HTMLElement;

    beforeEach(() => {
      element = document.createElement('div');
      document.body.appendChild(element);
    });

    afterEach(() => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });

    it('returns true for a visible element', () => {
      element.style.display = 'block';
      element.style.visibility = 'visible';
      element.style.opacity = '1';
      expect(isElementVisible(element)).toBe(true);
    });

    it('returns false for display: none', () => {
      element.style.display = 'none';
      expect(isElementVisible(element)).toBe(false);
    });

    it('returns false for visibility: hidden', () => {
      element.style.visibility = 'hidden';
      expect(isElementVisible(element)).toBe(false);
    });

    it('returns false for opacity: 0', () => {
      element.style.opacity = '0';
      expect(isElementVisible(element)).toBe(false);
    });
  });

  describe('getFocusableElements', () => {
    let container: HTMLElement;

    beforeEach(() => {
      container = document.createElement('div');
      document.body.appendChild(container);
    });

    afterEach(() => {
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    });

    it('finds buttons within the container', () => {
      container.innerHTML = '<button>Click me</button><span>Not focusable</span>';
      const elements = getFocusableElements(container);
      expect(elements.length).toBe(1);
      expect(elements[0].tagName).toBe('BUTTON');
    });

    it('excludes disabled buttons', () => {
      container.innerHTML = '<button disabled>Disabled</button>';
      const elements = getFocusableElements(container);
      expect(elements.length).toBe(0);
    });
  });

  describe('getTabOrder', () => {
    let container: HTMLElement;

    beforeEach(() => {
      container = document.createElement('div');
      document.body.appendChild(container);
    });

    afterEach(() => {
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    });

    it('sorts elements with positive tabindex before tabindex 0', () => {
      container.innerHTML = `
        <button tabindex="0" id="btn-a">A</button>
        <button tabindex="2" id="btn-b">B</button>
        <button tabindex="1" id="btn-c">C</button>
      `;
      const ordered = getTabOrder(container);
      expect(ordered[0].id).toBe('btn-c'); // tabindex 1
      expect(ordered[1].id).toBe('btn-b'); // tabindex 2
      expect(ordered[2].id).toBe('btn-a'); // tabindex 0
    });

    it('preserves DOM order for elements with the same tabindex', () => {
      container.innerHTML = `
        <button id="first">First</button>
        <button id="second">Second</button>
        <button id="third">Third</button>
      `;
      const ordered = getTabOrder(container);
      expect(ordered[0].id).toBe('first');
      expect(ordered[1].id).toBe('second');
      expect(ordered[2].id).toBe('third');
    });
  });

  describe('announceToScreenReader', () => {
    afterEach(() => {
      // Clean up any live regions left in the DOM
      document.querySelectorAll('[aria-live]').forEach((el) => el.remove());
    });

    it('creates an aria-live region in the document', () => {
      announceToScreenReader('Test announcement');
      const region = document.querySelector('[aria-live]');
      expect(region).not.toBeNull();
      expect(region?.getAttribute('aria-live')).toBe('polite');
    });

    it('uses role="alert" for assertive announcements', () => {
      announceToScreenReader('Urgent message', 'assertive');
      const region = document.querySelector('[aria-live="assertive"]');
      expect(region).not.toBeNull();
      expect(region?.getAttribute('role')).toBe('alert');
    });
  });

  describe('createFocusTrap', () => {
    let container: HTMLElement;

    beforeEach(() => {
      container = document.createElement('div');
      container.id = 'trap-container';
      container.innerHTML = `
        <button id="first-btn">First</button>
        <button id="second-btn">Second</button>
        <button id="third-btn">Third</button>
      `;
      document.body.appendChild(container);
    });

    afterEach(() => {
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    });

    it('focuses the first focusable element on activate', () => {
      const trap = createFocusTrap({
        container: '#trap-container',
        returnFocus: false,
      });
      trap.activate();
      expect(document.activeElement?.id).toBe('first-btn');
      trap.deactivate();
    });

    it('focuses the initialFocus element when specified', () => {
      const trap = createFocusTrap({
        container: '#trap-container',
        initialFocus: '#second-btn',
        returnFocus: false,
      });
      trap.activate();
      expect(document.activeElement?.id).toBe('second-btn');
      trap.deactivate();
    });
  });
});

// ---------------------------------------------------------------------------
// aria-helpers.ts
// ---------------------------------------------------------------------------

describe('aria-helpers', () => {
  describe('ariaProps', () => {
    it('returns the role when no state is provided', () => {
      const props = ariaProps('button');
      expect(props.role).toBe('button');
      expect(Object.keys(props)).toHaveLength(1);
    });

    it('includes aria-expanded for expandable roles', () => {
      const props = ariaProps('button', { expanded: true });
      expect(props['aria-expanded']).toBe(true);
    });

    it('omits aria-expanded for non-expandable roles', () => {
      const props = ariaProps('progressbar', { expanded: true });
      expect(props['aria-expanded']).toBeUndefined();
    });

    it('includes aria-disabled for any role', () => {
      const props = ariaProps('textbox', { disabled: true });
      expect(props['aria-disabled']).toBe(true);
    });

    it('includes aria-checked for checkable roles', () => {
      const props = ariaProps('checkbox', { checked: true });
      expect(props['aria-checked']).toBe(true);
    });

    it('supports mixed state for checkbox', () => {
      const props = ariaProps('checkbox', { checked: 'mixed' });
      expect(props['aria-checked']).toBe('mixed');
    });

    it('includes aria-pressed for button role', () => {
      const props = ariaProps('button', { pressed: true });
      expect(props['aria-pressed']).toBe(true);
    });

    it('includes aria-selected for selectable roles', () => {
      const props = ariaProps('tab', { selected: true });
      expect(props['aria-selected']).toBe(true);
    });

    it('includes aria-invalid for any role', () => {
      const props = ariaProps('textbox', { invalid: true });
      expect(props['aria-invalid']).toBe(true);
    });

    it('includes aria-required for any role', () => {
      const props = ariaProps('textbox', { required: true });
      expect(props['aria-required']).toBe(true);
    });
  });

  describe('treeItemProps', () => {
    it('returns all required tree item ARIA attributes', () => {
      const props = treeItemProps('item-1', 2, true, 5, 3);
      expect(props.role).toBe('treeitem');
      expect(props.id).toBe('item-1');
      expect(props['aria-level']).toBe(2);
      expect(props['aria-expanded']).toBe(true);
      expect(props['aria-setsize']).toBe(5);
      expect(props['aria-posinset']).toBe(3);
    });

    it('sets aria-expanded to false for collapsed items', () => {
      const props = treeItemProps('item-2', 1, false, 3, 1);
      expect(props['aria-expanded']).toBe(false);
    });
  });

  describe('dialogProps', () => {
    it('includes role, modal, and labelledby', () => {
      const props = dialogProps('dialog-title');
      expect(props.role).toBe('dialog');
      expect(props['aria-modal']).toBe(true);
      expect(props['aria-labelledby']).toBe('dialog-title');
    });

    it('includes describedby when provided', () => {
      const props = dialogProps('title', 'desc');
      expect(props['aria-describedby']).toBe('desc');
    });

    it('omits describedby when not provided', () => {
      const props = dialogProps('title');
      expect(props['aria-describedby']).toBeUndefined();
    });
  });

  describe('tabPanelProps', () => {
    it('returns visible panel when selected', () => {
      const props = tabPanelProps('panel-1', 'tab-1', true);
      expect(props.role).toBe('tabpanel');
      expect(props.id).toBe('panel-1');
      expect(props['aria-labelledby']).toBe('tab-1');
      expect(props.hidden).toBe(false);
      expect(props.tabIndex).toBe(0);
    });

    it('returns hidden panel when not selected', () => {
      const props = tabPanelProps('panel-2', 'tab-2', false);
      expect(props.hidden).toBe(true);
      expect(props.tabIndex).toBe(-1);
    });
  });

  describe('liveRegionProps', () => {
    it('defaults to polite', () => {
      const props = liveRegionProps();
      expect(props['aria-live']).toBe('polite');
      expect(props['aria-atomic']).toBe(true);
    });

    it('can be set to assertive', () => {
      const props = liveRegionProps('assertive');
      expect(props['aria-live']).toBe('assertive');
    });
  });

  describe('validateAriaAttributes', () => {
    it('catches aria-expanded on non-expandable roles', () => {
      const el: ElementDescriptor = {
        role: 'progressbar',
        attributes: { 'aria-expanded': true },
      };
      const issues = validateAriaAttributes(el);
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0]).toContain('aria-expanded');
    });

    it('catches aria-checked on non-checkable roles', () => {
      const el: ElementDescriptor = {
        role: 'button',
        attributes: { 'aria-checked': true },
      };
      const issues = validateAriaAttributes(el);
      expect(issues.some((msg) => msg.includes('aria-checked'))).toBe(true);
    });

    it('catches aria-pressed on non-pressable roles', () => {
      const el: ElementDescriptor = {
        role: 'link',
        attributes: { 'aria-pressed': true },
      };
      const issues = validateAriaAttributes(el);
      expect(issues.some((msg) => msg.includes('aria-pressed'))).toBe(true);
    });

    it('catches missing aria-labelledby on dialog', () => {
      const el: ElementDescriptor = {
        role: 'dialog',
        attributes: {},
      };
      const issues = validateAriaAttributes(el);
      expect(issues.some((msg) => msg.includes('dialog'))).toBe(true);
    });

    it('passes when dialog has aria-labelledby', () => {
      const el: ElementDescriptor = {
        role: 'dialog',
        attributes: { 'aria-labelledby': 'title' },
      };
      const issues = validateAriaAttributes(el);
      expect(issues.some((msg) => msg.includes('dialog must have'))).toBe(false);
    });

    it('catches missing aria-valuenow on progressbar', () => {
      const el: ElementDescriptor = {
        role: 'progressbar',
        attributes: {},
      };
      const issues = validateAriaAttributes(el);
      expect(issues.some((msg) => msg.includes('aria-valuenow'))).toBe(true);
    });

    it('catches missing aria-level on treeitem', () => {
      const el: ElementDescriptor = {
        role: 'treeitem',
        attributes: {},
      };
      const issues = validateAriaAttributes(el);
      expect(issues.some((msg) => msg.includes('aria-level'))).toBe(true);
    });

    it('returns no issues for a properly configured element', () => {
      const el: ElementDescriptor = {
        role: 'checkbox',
        attributes: { 'aria-checked': false },
      };
      const issues = validateAriaAttributes(el);
      expect(issues).toHaveLength(0);
    });
  });
});

// ---------------------------------------------------------------------------
// color-palette.ts
// ---------------------------------------------------------------------------

describe('color-palette', () => {
  describe('SPEC_TREE_COLORS', () => {
    it('has the expected epic color', () => {
      expect(SPEC_TREE_COLORS.epic).toBe('#7c3aed');
    });

    it('has the expected feature color', () => {
      expect(SPEC_TREE_COLORS.feature).toBe('#2563eb');
    });

    it('has a background color', () => {
      expect(SPEC_TREE_COLORS.background).toBe('#ffffff');
    });

    it('has foregroundPrimary color', () => {
      expect(SPEC_TREE_COLORS.foregroundPrimary).toBeDefined();
    });

    it('has foregroundSecondary color', () => {
      expect(SPEC_TREE_COLORS.foregroundSecondary).toBeDefined();
    });

    it('has userStory color', () => {
      expect(SPEC_TREE_COLORS.userStory).toBe('#059669');
    });

    it('has task color', () => {
      expect(SPEC_TREE_COLORS.task).toBe('#d97706');
    });

    it('has border color', () => {
      expect(SPEC_TREE_COLORS.border).toBe('#e2e8f0');
    });
  });

  describe('validatePalette', () => {
    it('identifies failing color pairs', () => {
      const palette = {
        foreground: '#cccccc', // light gray, poor contrast on white
        background: '#ffffff',
      };
      const results = validatePalette(palette);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].meetsAA).toBe(false);
    });

    it('identifies passing color pairs', () => {
      const palette = {
        foreground: '#000000',
        background: '#ffffff',
      };
      const results = validatePalette(palette);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].meetsAA).toBe(true);
      expect(results[0].meetsAAA).toBe(true);
    });

    it('excludes border colors from foreground checks', () => {
      const palette = {
        primary: '#000000',
        border: '#e2e8f0',
        background: '#ffffff',
      };
      const results = validatePalette(palette);
      // Only primary should be checked, not border
      expect(results).toHaveLength(1);
      expect(results[0].foreground).toBe('#000000');
    });

    it('checks each foreground against each background', () => {
      const palette = {
        primary: '#000000',
        accent: '#333333',
        background: '#ffffff',
      };
      const results = validatePalette(palette);
      expect(results).toHaveLength(2);
    });

    it('returns ColorPair objects with contrastRatio', () => {
      const palette = {
        text: '#0f172a',
        background: '#ffffff',
      };
      const results = validatePalette(palette);
      expect(results[0].contrastRatio).toBeGreaterThan(1);
      expect(results[0]).toHaveProperty('foreground');
      expect(results[0]).toHaveProperty('background');
      expect(results[0]).toHaveProperty('meetsAA');
      expect(results[0]).toHaveProperty('meetsAAA');
    });
  });

  describe('suggestAccessibleAlternative', () => {
    it('returns the original color if it already meets the target', () => {
      const result = suggestAccessibleAlternative('#000000', '#ffffff');
      expect(result).toBe('#000000');
    });

    it('returns an adjusted color that meets the target ratio', () => {
      // Light gray on white fails AA
      const adjusted = suggestAccessibleAlternative('#aaaaaa', '#ffffff');
      const contrast = checkColorContrast(adjusted, '#ffffff');
      expect(contrast.meetsAA).toBe(true);
    });

    it('darkens foreground when background is light', () => {
      const original = '#aaaaaa';
      const adjusted = suggestAccessibleAlternative(original, '#ffffff');
      // The adjusted color should be darker (lower hex values)
      const originalParsed = parseColor(original);
      const adjustedParsed = parseColor(adjusted);
      expect(adjustedParsed).not.toBeNull();
      if (originalParsed && adjustedParsed) {
        const originalSum = originalParsed.r + originalParsed.g + originalParsed.b;
        const adjustedSum = adjustedParsed.r + adjustedParsed.g + adjustedParsed.b;
        expect(adjustedSum).toBeLessThan(originalSum);
      }
    });

    it('lightens foreground when background is dark', () => {
      const original = '#555555';
      const adjusted = suggestAccessibleAlternative(original, '#000000');
      const contrast = checkColorContrast(adjusted, '#000000');
      expect(contrast.meetsAA).toBe(true);
    });

    it('accepts a custom target ratio', () => {
      const adjusted = suggestAccessibleAlternative('#aaaaaa', '#ffffff', 7);
      const contrast = checkColorContrast(adjusted, '#ffffff');
      expect(contrast.ratio).toBeGreaterThanOrEqual(7);
    });
  });

  describe('generateAccessiblePalette', () => {
    it('adjusts colors that do not meet AA contrast', () => {
      const base = {
        text: '#aaaaaa', // fails on white
        background: '#ffffff',
      };
      const accessible = generateAccessiblePalette(base);
      const contrast = checkColorContrast(accessible.text, accessible.background);
      expect(contrast.meetsAA).toBe(true);
    });

    it('preserves colors that already meet AA', () => {
      const base = {
        text: '#000000',
        background: '#ffffff',
      };
      const accessible = generateAccessiblePalette(base);
      expect(accessible.text).toBe('#000000');
    });

    it('preserves the background color', () => {
      const base = {
        text: '#aaaaaa',
        background: '#f0f0f0',
      };
      const accessible = generateAccessiblePalette(base);
      expect(accessible.background).toBe('#f0f0f0');
    });

    it('preserves the border color without adjustment', () => {
      const base = {
        text: '#000000',
        border: '#e2e8f0',
        background: '#ffffff',
      };
      const accessible = generateAccessiblePalette(base);
      expect(accessible.border).toBe('#e2e8f0');
    });

    it('handles missing background key by assuming white', () => {
      const base = {
        heading: '#aaaaaa',
      };
      const accessible = generateAccessiblePalette(base);
      const contrast = checkColorContrast(accessible.heading, '#ffffff');
      expect(contrast.meetsAA).toBe(true);
    });
  });
});
