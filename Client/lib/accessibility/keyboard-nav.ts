/**
 * Keyboard Navigation Utilities
 *
 * Focus trapping, arrow key navigation, screen reader announcements,
 * and tab order management for accessible interactive components.
 */

export interface FocusTrapConfig {
  /** CSS selector for the container element */
  container: string;
  /** CSS selector for the element to focus when the trap activates */
  initialFocus?: string;
  /** Whether to restore focus to the previously focused element on deactivation */
  returnFocus: boolean;
}

export interface FocusTrap {
  activate: () => void;
  deactivate: () => void;
}

/**
 * CSS selector that matches all natively focusable elements.
 */
export const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[role="button"]:not([disabled])',
].join(', ');

/**
 * Returns all focusable elements within a container element.
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const elements = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  return elements.filter(isElementVisible);
}

/**
 * Creates a focus trap that keeps Tab / Shift+Tab cycling within
 * the given container. Returns activate / deactivate handles.
 */
export function createFocusTrap(config: FocusTrapConfig): FocusTrap {
  let previousFocus: HTMLElement | null = null;
  let containerEl: HTMLElement | null = null;
  let keydownHandler: ((e: KeyboardEvent) => void) | null = null;

  const activate = (): void => {
    containerEl = document.querySelector<HTMLElement>(config.container);
    if (!containerEl) return;

    previousFocus = document.activeElement as HTMLElement | null;

    const focusable = getFocusableElements(containerEl);
    if (focusable.length === 0) return;

    // Focus the initial element or the first focusable element
    if (config.initialFocus) {
      const initial = containerEl.querySelector<HTMLElement>(config.initialFocus);
      if (initial) {
        initial.focus();
      } else {
        focusable[0].focus();
      }
    } else {
      focusable[0].focus();
    }

    keydownHandler = (e: KeyboardEvent): void => {
      if (e.key !== 'Tab' || !containerEl) return;

      const elements = getFocusableElements(containerEl);
      if (elements.length === 0) return;

      const firstElement = elements[0];
      const lastElement = elements[elements.length - 1];

      if (e.shiftKey) {
        // Shift+Tab: wrap from first to last
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: wrap from last to first
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', keydownHandler);
  };

  const deactivate = (): void => {
    if (keydownHandler) {
      document.removeEventListener('keydown', keydownHandler);
      keydownHandler = null;
    }

    if (config.returnFocus && previousFocus) {
      previousFocus.focus();
      previousFocus = null;
    }

    containerEl = null;
  };

  return { activate, deactivate };
}

/**
 * Calculates the next focus index when using arrow key navigation.
 * Wraps around at both ends of the element list.
 *
 * @param elements - Array of elements being navigated
 * @param currentIndex - Index of the currently focused element
 * @param direction - Arrow key direction
 * @returns The index of the element that should receive focus
 */
export function handleArrowNavigation(
  elements: HTMLElement[],
  currentIndex: number,
  direction: 'up' | 'down' | 'left' | 'right',
): number {
  if (elements.length === 0) return 0;

  const forward = direction === 'down' || direction === 'right';
  const step = forward ? 1 : -1;
  const nextIndex = currentIndex + step;

  // Wrap around
  if (nextIndex < 0) return elements.length - 1;
  if (nextIndex >= elements.length) return 0;

  return nextIndex;
}

/**
 * Determines whether an element is visible in the document.
 * Checks offsetParent, computed display/visibility, and opacity.
 */
export function isElementVisible(element: HTMLElement): boolean {
  // offsetParent is null for hidden elements (display: none, or not in DOM)
  // Exception: <body> and fixed-position elements may have null offsetParent while visible
  if (element.offsetParent === null && element.tagName !== 'BODY') {
    const style = window.getComputedStyle(element);
    if (style.position !== 'fixed' && style.position !== 'sticky') {
      return false;
    }
  }

  const style = window.getComputedStyle(element);

  if (style.display === 'none') return false;
  if (style.visibility === 'hidden') return false;
  if (parseFloat(style.opacity) === 0) return false;

  return true;
}

/**
 * Creates a temporary aria-live region to announce a message
 * to screen readers. The region is automatically removed after
 * the announcement has had time to be read.
 *
 * @param message - The text to announce
 * @param priority - 'polite' waits for the user to be idle; 'assertive' interrupts
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite',
): void {
  const region = document.createElement('div');
  region.setAttribute('aria-live', priority);
  region.setAttribute('aria-atomic', 'true');
  region.setAttribute('role', priority === 'assertive' ? 'alert' : 'status');

  // Visually hidden but accessible to screen readers
  Object.assign(region.style, {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: '0',
  });

  document.body.appendChild(region);

  // Set text content after a brief delay so the live region is registered first
  requestAnimationFrame(() => {
    region.textContent = message;
  });

  // Remove after enough time for the screen reader to process
  setTimeout(() => {
    if (region.parentNode) {
      region.parentNode.removeChild(region);
    }
  }, 3000);
}

/**
 * Returns focusable elements within a container, sorted by their
 * effective tab order. Elements with an explicit positive tabindex
 * come first (in ascending tabindex order), followed by elements
 * with tabindex 0 or no explicit tabindex (in DOM order).
 */
export function getTabOrder(container: HTMLElement): HTMLElement[] {
  const elements = getFocusableElements(container);

  const withTabIndex: { element: HTMLElement; tabIndex: number; domOrder: number }[] =
    elements.map((el, index) => ({
      element: el,
      tabIndex: el.tabIndex,
      domOrder: index,
    }));

  withTabIndex.sort((a, b) => {
    // Elements with tabindex > 0 come first, sorted ascending
    const aPositive = a.tabIndex > 0;
    const bPositive = b.tabIndex > 0;

    if (aPositive && bPositive) return a.tabIndex - b.tabIndex;
    if (aPositive) return -1;
    if (bPositive) return 1;

    // Both have tabindex 0 or no explicit tabindex: preserve DOM order
    return a.domOrder - b.domOrder;
  });

  return withTabIndex.map((item) => item.element);
}
