/**
 * ARIA Attribute Management Utilities
 *
 * Provides helper functions for generating correct ARIA attributes
 * for common interactive patterns: trees, dialogs, tabs, and
 * live regions.
 */

export type AriaRole =
  | 'button'
  | 'checkbox'
  | 'dialog'
  | 'grid'
  | 'gridcell'
  | 'link'
  | 'listbox'
  | 'menu'
  | 'menuitem'
  | 'option'
  | 'progressbar'
  | 'radio'
  | 'radiogroup'
  | 'tab'
  | 'tablist'
  | 'tabpanel'
  | 'textbox'
  | 'tree'
  | 'treeitem';

export interface AriaState {
  expanded?: boolean;
  selected?: boolean;
  disabled?: boolean;
  checked?: boolean | 'mixed';
  pressed?: boolean | 'mixed';
  current?: boolean | 'page' | 'step' | 'location' | 'date' | 'time';
  hidden?: boolean;
  invalid?: boolean;
  required?: boolean;
  readonly?: boolean;
}

export interface AriaProps {
  role: AriaRole;
  [key: string]: string | boolean | number | undefined;
}

/**
 * Roles that support the aria-expanded attribute.
 */
const EXPANDABLE_ROLES: ReadonlySet<AriaRole> = new Set<AriaRole>([
  'button',
  'checkbox',
  'link',
  'listbox',
  'menu',
  'menuitem',
  'tab',
  'treeitem',
]);

/**
 * Roles that support the aria-checked attribute.
 */
const CHECKABLE_ROLES: ReadonlySet<AriaRole> = new Set<AriaRole>([
  'checkbox',
  'menuitem',
  'option',
  'radio',
]);

/**
 * Roles that support the aria-pressed attribute.
 */
const PRESSABLE_ROLES: ReadonlySet<AriaRole> = new Set<AriaRole>([
  'button',
]);

/**
 * Roles that support the aria-selected attribute.
 */
const SELECTABLE_ROLES: ReadonlySet<AriaRole> = new Set<AriaRole>([
  'gridcell',
  'option',
  'tab',
  'treeitem',
]);

/**
 * Generates ARIA props for a given role, with optional state attributes.
 * Only includes state attributes that are valid for the specified role.
 */
export function ariaProps(role: AriaRole, state?: Partial<AriaState>): AriaProps {
  const props: AriaProps = { role };

  if (!state) return props;

  if (state.expanded !== undefined && EXPANDABLE_ROLES.has(role)) {
    props['aria-expanded'] = state.expanded;
  }

  if (state.selected !== undefined && SELECTABLE_ROLES.has(role)) {
    props['aria-selected'] = state.selected;
  }

  if (state.disabled !== undefined) {
    props['aria-disabled'] = state.disabled;
  }

  if (state.checked !== undefined && CHECKABLE_ROLES.has(role)) {
    props['aria-checked'] = state.checked === 'mixed' ? 'mixed' : state.checked;
  }

  if (state.pressed !== undefined && PRESSABLE_ROLES.has(role)) {
    props['aria-pressed'] = state.pressed === 'mixed' ? 'mixed' : state.pressed;
  }

  if (state.current !== undefined) {
    props['aria-current'] = state.current;
  }

  if (state.hidden !== undefined) {
    props['aria-hidden'] = state.hidden;
  }

  if (state.invalid !== undefined) {
    props['aria-invalid'] = state.invalid;
  }

  if (state.required !== undefined) {
    props['aria-required'] = state.required;
  }

  if (state.readonly !== undefined) {
    props['aria-readonly'] = state.readonly;
  }

  return props;
}

/**
 * Returns the complete set of ARIA props for a tree item.
 *
 * @param id - Unique identifier for the tree item
 * @param level - Nesting depth (1-based)
 * @param isExpanded - Whether the item's children are visible
 * @param setSize - Total number of siblings (including this item)
 * @param posInSet - 1-based position among siblings
 */
export function treeItemProps(
  id: string,
  level: number,
  isExpanded: boolean,
  setSize: number,
  posInSet: number,
): Record<string, string | number | boolean> {
  return {
    role: 'treeitem',
    id,
    'aria-level': level,
    'aria-expanded': isExpanded,
    'aria-setsize': setSize,
    'aria-posinset': posInSet,
  };
}

/**
 * Returns ARIA props for a dialog element.
 *
 * @param labelledBy - ID of the element that labels the dialog
 * @param describedBy - Optional ID of the element that describes the dialog
 */
export function dialogProps(
  labelledBy: string,
  describedBy?: string,
): Record<string, string | boolean> {
  const props: Record<string, string | boolean> = {
    role: 'dialog',
    'aria-modal': true,
    'aria-labelledby': labelledBy,
  };

  if (describedBy) {
    props['aria-describedby'] = describedBy;
  }

  return props;
}

/**
 * Returns ARIA props for a tab panel.
 *
 * @param id - Unique ID for the panel
 * @param tabId - ID of the associated tab element
 * @param isSelected - Whether this panel's tab is currently active
 */
export function tabPanelProps(
  id: string,
  tabId: string,
  isSelected: boolean,
): Record<string, string | boolean | number> {
  return {
    role: 'tabpanel',
    id,
    'aria-labelledby': tabId,
    hidden: !isSelected,
    tabIndex: isSelected ? 0 : -1,
  };
}

/**
 * Returns ARIA props for a live region that announces dynamic content.
 *
 * @param politeness - 'polite' waits for idle; 'assertive' interrupts immediately
 */
export function liveRegionProps(
  politeness: 'polite' | 'assertive' = 'polite',
): Record<string, string | boolean> {
  return {
    'aria-live': politeness,
    'aria-atomic': true,
  };
}

/**
 * Element descriptor used for validation, representing an element's
 * role and the ARIA attributes currently applied to it.
 */
export interface ElementDescriptor {
  role: AriaRole;
  attributes: Record<string, string | boolean | number>;
}

/**
 * Validates the ARIA attributes on an element descriptor for
 * common mistakes and returns an array of issue descriptions.
 *
 * Checks include:
 * - aria-expanded on non-expandable roles
 * - aria-checked on non-checkable roles
 * - aria-pressed on non-pressable roles
 * - aria-selected on non-selectable roles
 * - dialog missing aria-labelledby
 * - progressbar missing aria-valuenow
 * - required attributes for specific roles
 */
export function validateAriaAttributes(element: ElementDescriptor): string[] {
  const issues: string[] = [];
  const { role, attributes } = element;

  // Check aria-expanded on non-expandable roles
  if ('aria-expanded' in attributes && !EXPANDABLE_ROLES.has(role)) {
    issues.push(
      `aria-expanded is not valid on role "${role}". Expandable roles: ${Array.from(EXPANDABLE_ROLES).join(', ')}`,
    );
  }

  // Check aria-checked on non-checkable roles
  if ('aria-checked' in attributes && !CHECKABLE_ROLES.has(role)) {
    issues.push(
      `aria-checked is not valid on role "${role}". Checkable roles: ${Array.from(CHECKABLE_ROLES).join(', ')}`,
    );
  }

  // Check aria-pressed on non-pressable roles
  if ('aria-pressed' in attributes && !PRESSABLE_ROLES.has(role)) {
    issues.push(
      `aria-pressed is not valid on role "${role}". Pressable roles: ${Array.from(PRESSABLE_ROLES).join(', ')}`,
    );
  }

  // Check aria-selected on non-selectable roles
  if ('aria-selected' in attributes && !SELECTABLE_ROLES.has(role)) {
    issues.push(
      `aria-selected is not valid on role "${role}". Selectable roles: ${Array.from(SELECTABLE_ROLES).join(', ')}`,
    );
  }

  // Dialog should have aria-labelledby
  if (role === 'dialog' && !('aria-labelledby' in attributes) && !('aria-label' in attributes)) {
    issues.push('dialog must have either aria-labelledby or aria-label');
  }

  // Progressbar should have aria-valuenow
  if (role === 'progressbar' && !('aria-valuenow' in attributes)) {
    issues.push('progressbar should have aria-valuenow to indicate current progress');
  }

  // Treeitem at a non-root level should have aria-level
  if (role === 'treeitem' && !('aria-level' in attributes)) {
    issues.push('treeitem should have aria-level to indicate its depth in the hierarchy');
  }

  return issues;
}
