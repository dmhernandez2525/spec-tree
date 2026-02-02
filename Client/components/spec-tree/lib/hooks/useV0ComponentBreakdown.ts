/**
 * useV0ComponentBreakdown
 *
 * F2.1.9 - v0 component breakdown
 *
 * Hook for generating component specifications optimized for v0's UI generation.
 * Breaks down UI components into visual specs, states, responsive behavior,
 * and interactions.
 */

import { useCallback, useState } from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * Visual specification for styling
 */
export interface VisualSpec {
  property: string;
  value: string;
  description?: string;
}

/**
 * Container styling specifications
 */
export interface ContainerSpec {
  layout?: string; // e.g., 'flex', 'grid'
  spacing?: string; // e.g., 'gap-4', 'space-y-2'
  padding?: string; // e.g., 'p-4', 'px-6 py-4'
  border?: string; // e.g., 'border border-gray-200'
  borderRadius?: string; // e.g., 'rounded-lg'
  background?: string; // e.g., 'bg-white', 'bg-gray-50'
  shadow?: string; // e.g., 'shadow-sm'
  width?: string; // e.g., 'w-full', 'max-w-md'
  height?: string; // e.g., 'h-auto', 'min-h-[200px]'
  overflow?: string; // e.g., 'overflow-hidden'
  additionalClasses?: string[];
}

/**
 * Typography specifications
 */
export interface TypographySpec {
  fontFamily?: string; // e.g., 'font-sans'
  fontSize?: string; // e.g., 'text-sm', 'text-base'
  fontWeight?: string; // e.g., 'font-medium', 'font-bold'
  lineHeight?: string; // e.g., 'leading-relaxed'
  letterSpacing?: string; // e.g., 'tracking-tight'
  color?: string; // e.g., 'text-gray-900'
  textAlign?: string; // e.g., 'text-center'
  textDecoration?: string; // e.g., 'underline'
}

/**
 * Component state specification
 */
export interface StateSpec {
  name: 'default' | 'hover' | 'active' | 'focus' | 'disabled' | 'loading' | 'error' | 'success';
  description: string;
  visualChanges?: string[];
  classes?: string[];
}

/**
 * Responsive breakpoint specification
 */
export interface ResponsiveSpec {
  breakpoint: 'mobile' | 'tablet' | 'desktop' | 'wide';
  minWidth?: string; // e.g., '768px'
  maxWidth?: string; // e.g., '1024px'
  layout: string;
  changes?: string[];
}

/**
 * Interaction specification
 */
export interface InteractionSpec {
  trigger: 'click' | 'hover' | 'focus' | 'blur' | 'keydown' | 'scroll' | 'drag' | 'touch';
  behavior: string;
  feedback?: string;
  ariaAttributes?: Record<string, string>;
}

/**
 * Accessibility specification
 */
export interface AccessibilitySpec {
  role?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  tabIndex?: number;
  keyboardSupport?: string[];
  screenReaderNotes?: string[];
}

/**
 * Animation specification
 */
export interface AnimationSpec {
  name: string;
  trigger?: string;
  duration?: string;
  easing?: string;
  properties?: string[];
  classes?: string[];
}

/**
 * Prop definition for the component
 */
export interface PropSpec {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description?: string;
}

/**
 * Child component reference
 */
export interface ChildComponentSpec {
  name: string;
  purpose: string;
  optional?: boolean;
}

/**
 * Complete component breakdown
 */
export interface ComponentBreakdown {
  name: string;
  description: string;
  category?: 'layout' | 'navigation' | 'form' | 'display' | 'feedback' | 'overlay' | 'interactive';

  // Visual specifications
  container: ContainerSpec;
  typography?: TypographySpec;
  visualSpecs?: VisualSpec[];

  // States
  states: StateSpec[];

  // Responsive behavior
  responsive: ResponsiveSpec[];

  // Interactions
  interactions: InteractionSpec[];

  // Accessibility
  accessibility?: AccessibilitySpec;

  // Animations
  animations?: AnimationSpec[];

  // Component API
  props?: PropSpec[];

  // Composition
  children?: ChildComponentSpec[];

  // Additional notes
  notes?: string[];
}

/**
 * Options for generating breakdown
 */
export interface BreakdownOptions {
  includeAnimations?: boolean;
  includeAccessibility?: boolean;
  includeProps?: boolean;
  includeChildren?: boolean;
  format?: 'markdown' | 'json';
}

/**
 * Hook options
 */
export interface UseV0ComponentBreakdownOptions {
  defaultCategory?: ComponentBreakdown['category'];
  onBreakdownGenerated?: (breakdown: ComponentBreakdown, formatted: string) => void;
}

/**
 * Hook return type
 */
export interface UseV0ComponentBreakdownReturn {
  // Generation functions
  generateBreakdown: (name: string, specs: Partial<ComponentBreakdown>) => ComponentBreakdown;
  formatAsMarkdown: (breakdown: ComponentBreakdown, options?: BreakdownOptions) => string;
  formatAsJSON: (breakdown: ComponentBreakdown) => string;

  // Builder functions
  createContainerSpec: (spec: Partial<ContainerSpec>) => ContainerSpec;
  createTypographySpec: (spec: Partial<TypographySpec>) => TypographySpec;
  createStateSpec: (name: StateSpec['name'], description: string, options?: Partial<StateSpec>) => StateSpec;
  createResponsiveSpec: (
    breakpoint: ResponsiveSpec['breakpoint'],
    layout: string,
    changes?: string[]
  ) => ResponsiveSpec;
  createInteractionSpec: (
    trigger: InteractionSpec['trigger'],
    behavior: string,
    feedback?: string
  ) => InteractionSpec;

  // Presets
  getCommonStates: (componentType?: 'button' | 'input' | 'card' | 'link') => StateSpec[];
  getCommonResponsive: () => ResponsiveSpec[];
  getButtonPreset: () => Partial<ComponentBreakdown>;
  getCardPreset: () => Partial<ComponentBreakdown>;
  getInputPreset: () => Partial<ComponentBreakdown>;
  getModalPreset: () => Partial<ComponentBreakdown>;

  // State
  breakdowns: ComponentBreakdown[];
  lastBreakdown: ComponentBreakdown | null;
}

// ============================================================================
// Default Values
// ============================================================================

const DEFAULT_CONTAINER: ContainerSpec = {
  layout: 'flex',
  spacing: 'gap-4',
  padding: 'p-4',
  borderRadius: 'rounded-lg',
};

const DEFAULT_TYPOGRAPHY: TypographySpec = {
  fontFamily: 'font-sans',
  fontSize: 'text-base',
  fontWeight: 'font-normal',
  color: 'text-gray-900',
};

// ============================================================================
// Formatting Functions
// ============================================================================

/**
 * Format container spec as Tailwind classes string
 */
export function formatContainerClasses(spec: ContainerSpec): string {
  const classes: string[] = [];

  if (spec.layout) classes.push(spec.layout);
  if (spec.spacing) classes.push(spec.spacing);
  if (spec.padding) classes.push(spec.padding);
  if (spec.border) classes.push(spec.border);
  if (spec.borderRadius) classes.push(spec.borderRadius);
  if (spec.background) classes.push(spec.background);
  if (spec.shadow) classes.push(spec.shadow);
  if (spec.width) classes.push(spec.width);
  if (spec.height) classes.push(spec.height);
  if (spec.overflow) classes.push(spec.overflow);
  if (spec.additionalClasses) classes.push(...spec.additionalClasses);

  return classes.join(' ');
}

/**
 * Format typography spec as Tailwind classes string
 */
export function formatTypographyClasses(spec: TypographySpec): string {
  const classes: string[] = [];

  if (spec.fontFamily) classes.push(spec.fontFamily);
  if (spec.fontSize) classes.push(spec.fontSize);
  if (spec.fontWeight) classes.push(spec.fontWeight);
  if (spec.lineHeight) classes.push(spec.lineHeight);
  if (spec.letterSpacing) classes.push(spec.letterSpacing);
  if (spec.color) classes.push(spec.color);
  if (spec.textAlign) classes.push(spec.textAlign);
  if (spec.textDecoration) classes.push(spec.textDecoration);

  return classes.join(' ');
}

/**
 * Format state spec as markdown
 */
function formatStateMarkdown(state: StateSpec): string {
  const lines: string[] = [`- **${capitalizeFirst(state.name)}**: ${state.description}`];

  if (state.visualChanges && state.visualChanges.length > 0) {
    for (const change of state.visualChanges) {
      lines.push(`  - ${change}`);
    }
  }

  if (state.classes && state.classes.length > 0) {
    lines.push(`  - Classes: \`${state.classes.join(' ')}\``);
  }

  return lines.join('\n');
}

/**
 * Format responsive spec as markdown
 */
function formatResponsiveMarkdown(spec: ResponsiveSpec): string {
  const breakpointLabels: Record<ResponsiveSpec['breakpoint'], string> = {
    mobile: 'Mobile (<768px)',
    tablet: 'Tablet (768px-1024px)',
    desktop: 'Desktop (>1024px)',
    wide: 'Wide (>1440px)',
  };

  const lines: string[] = [`- **${breakpointLabels[spec.breakpoint]}**: ${spec.layout}`];

  if (spec.changes && spec.changes.length > 0) {
    for (const change of spec.changes) {
      lines.push(`  - ${change}`);
    }
  }

  return lines.join('\n');
}

/**
 * Format interaction spec as markdown
 */
function formatInteractionMarkdown(spec: InteractionSpec): string {
  const lines: string[] = [`- **${capitalizeFirst(spec.trigger)}**: ${spec.behavior}`];

  if (spec.feedback) {
    lines.push(`  - Feedback: ${spec.feedback}`);
  }

  if (spec.ariaAttributes && Object.keys(spec.ariaAttributes).length > 0) {
    const attrs = Object.entries(spec.ariaAttributes)
      .map(([k, v]) => `${k}="${v}"`)
      .join(', ');
    lines.push(`  - ARIA: ${attrs}`);
  }

  return lines.join('\n');
}

/**
 * Format accessibility spec as markdown
 */
function formatAccessibilityMarkdown(spec: AccessibilitySpec): string {
  const lines: string[] = ['## Accessibility'];

  if (spec.role) lines.push(`- **Role**: ${spec.role}`);
  if (spec.ariaLabel) lines.push(`- **aria-label**: "${spec.ariaLabel}"`);
  if (spec.ariaDescribedBy) lines.push(`- **aria-describedby**: "${spec.ariaDescribedBy}"`);
  if (spec.tabIndex !== undefined) lines.push(`- **tabIndex**: ${spec.tabIndex}`);

  if (spec.keyboardSupport && spec.keyboardSupport.length > 0) {
    lines.push('- **Keyboard Support**:');
    for (const key of spec.keyboardSupport) {
      lines.push(`  - ${key}`);
    }
  }

  if (spec.screenReaderNotes && spec.screenReaderNotes.length > 0) {
    lines.push('- **Screen Reader Notes**:');
    for (const note of spec.screenReaderNotes) {
      lines.push(`  - ${note}`);
    }
  }

  return lines.join('\n');
}

/**
 * Format animation spec as markdown
 */
function formatAnimationMarkdown(spec: AnimationSpec): string {
  const lines: string[] = [`- **${spec.name}**`];

  if (spec.trigger) lines.push(`  - Trigger: ${spec.trigger}`);
  if (spec.duration) lines.push(`  - Duration: ${spec.duration}`);
  if (spec.easing) lines.push(`  - Easing: ${spec.easing}`);

  if (spec.properties && spec.properties.length > 0) {
    lines.push(`  - Properties: ${spec.properties.join(', ')}`);
  }

  if (spec.classes && spec.classes.length > 0) {
    lines.push(`  - Classes: \`${spec.classes.join(' ')}\``);
  }

  return lines.join('\n');
}

/**
 * Format prop spec as markdown
 */
function formatPropMarkdown(spec: PropSpec): string {
  const required = spec.required ? '(required)' : '(optional)';
  const defaultVal = spec.defaultValue ? ` = ${spec.defaultValue}` : '';
  const desc = spec.description ? ` - ${spec.description}` : '';

  return `- \`${spec.name}: ${spec.type}\` ${required}${defaultVal}${desc}`;
}

/**
 * Capitalize first letter
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format complete breakdown as markdown
 */
export function formatBreakdownAsMarkdown(
  breakdown: ComponentBreakdown,
  options: BreakdownOptions = {}
): string {
  const {
    includeAnimations = true,
    includeAccessibility = true,
    includeProps = true,
    includeChildren = true,
  } = options;

  const sections: string[] = [];

  // Header
  sections.push(`# Component: ${breakdown.name}`);
  sections.push('');
  sections.push(breakdown.description);

  if (breakdown.category) {
    sections.push(`\n**Category**: ${breakdown.category}`);
  }

  // Visual Specifications
  sections.push('\n## Visual Specifications');
  sections.push(`- **Container**: \`${formatContainerClasses(breakdown.container)}\``);

  if (breakdown.typography) {
    sections.push(`- **Typography**: \`${formatTypographyClasses(breakdown.typography)}\``);
  }

  if (breakdown.visualSpecs && breakdown.visualSpecs.length > 0) {
    for (const spec of breakdown.visualSpecs) {
      const desc = spec.description ? ` (${spec.description})` : '';
      sections.push(`- **${spec.property}**: ${spec.value}${desc}`);
    }
  }

  // States
  if (breakdown.states.length > 0) {
    sections.push('\n## States');
    for (const state of breakdown.states) {
      sections.push(formatStateMarkdown(state));
    }
  }

  // Responsive Behavior
  if (breakdown.responsive.length > 0) {
    sections.push('\n## Responsive Behavior');
    for (const spec of breakdown.responsive) {
      sections.push(formatResponsiveMarkdown(spec));
    }
  }

  // Interactions
  if (breakdown.interactions.length > 0) {
    sections.push('\n## Interactions');
    for (const spec of breakdown.interactions) {
      sections.push(formatInteractionMarkdown(spec));
    }
  }

  // Accessibility
  if (includeAccessibility && breakdown.accessibility) {
    sections.push('\n' + formatAccessibilityMarkdown(breakdown.accessibility));
  }

  // Animations
  if (includeAnimations && breakdown.animations && breakdown.animations.length > 0) {
    sections.push('\n## Animations');
    for (const anim of breakdown.animations) {
      sections.push(formatAnimationMarkdown(anim));
    }
  }

  // Props
  if (includeProps && breakdown.props && breakdown.props.length > 0) {
    sections.push('\n## Props');
    for (const prop of breakdown.props) {
      sections.push(formatPropMarkdown(prop));
    }
  }

  // Children
  if (includeChildren && breakdown.children && breakdown.children.length > 0) {
    sections.push('\n## Child Components');
    for (const child of breakdown.children) {
      const optional = child.optional ? ' (optional)' : '';
      sections.push(`- **${child.name}**${optional}: ${child.purpose}`);
    }
  }

  // Notes
  if (breakdown.notes && breakdown.notes.length > 0) {
    sections.push('\n## Notes');
    for (const note of breakdown.notes) {
      sections.push(`- ${note}`);
    }
  }

  return sections.join('\n');
}

// ============================================================================
// Presets
// ============================================================================

/**
 * Get common states for component types
 */
export function getCommonStates(componentType: 'button' | 'input' | 'card' | 'link' = 'button'): StateSpec[] {
  const baseStates: StateSpec[] = [
    { name: 'default', description: 'Normal appearance' },
    { name: 'hover', description: 'Mouse over the element', classes: ['hover:bg-gray-100'] },
    { name: 'focus', description: 'Element has keyboard focus', classes: ['focus:ring-2', 'focus:ring-blue-500'] },
    { name: 'disabled', description: 'Element is not interactive', classes: ['opacity-50', 'cursor-not-allowed'] },
  ];

  switch (componentType) {
    case 'button':
      return [
        ...baseStates,
        { name: 'active', description: 'Button is being pressed', classes: ['active:scale-95'] },
        { name: 'loading', description: 'Action is in progress', visualChanges: ['Spinner replaces content'] },
      ];
    case 'input':
      return [
        ...baseStates,
        { name: 'error', description: 'Validation failed', classes: ['border-red-500', 'focus:ring-red-500'] },
        { name: 'success', description: 'Validation passed', classes: ['border-green-500'] },
      ];
    case 'card':
      return [
        ...baseStates.filter((s) => s.name !== 'focus'),
        { name: 'active', description: 'Card is selected', classes: ['ring-2', 'ring-blue-500'] },
      ];
    case 'link':
      return [
        { name: 'default', description: 'Normal link appearance', classes: ['text-blue-600'] },
        { name: 'hover', description: 'Mouse over link', classes: ['underline'] },
        { name: 'active', description: 'Link is being clicked', classes: ['text-blue-800'] },
        { name: 'focus', description: 'Link has focus', classes: ['outline-none', 'ring-2'] },
      ];
    default:
      return baseStates;
  }
}

/**
 * Get common responsive breakpoints
 */
export function getCommonResponsive(): ResponsiveSpec[] {
  return [
    { breakpoint: 'mobile', maxWidth: '767px', layout: 'Stack vertically, full width' },
    { breakpoint: 'tablet', minWidth: '768px', maxWidth: '1023px', layout: 'Two-column grid' },
    { breakpoint: 'desktop', minWidth: '1024px', layout: 'Full horizontal layout' },
  ];
}

/**
 * Button component preset
 */
export function getButtonPreset(): Partial<ComponentBreakdown> {
  return {
    category: 'interactive',
    container: {
      layout: 'inline-flex items-center justify-center',
      padding: 'px-4 py-2',
      borderRadius: 'rounded-md',
      background: 'bg-blue-600',
    },
    typography: {
      fontSize: 'text-sm',
      fontWeight: 'font-medium',
      color: 'text-white',
    },
    states: getCommonStates('button'),
    interactions: [
      { trigger: 'click', behavior: 'Triggers onClick handler', feedback: 'Visual press effect' },
      { trigger: 'keydown', behavior: 'Enter/Space activates button', feedback: 'Same as click' },
    ],
    accessibility: {
      role: 'button',
      tabIndex: 0,
      keyboardSupport: ['Enter to activate', 'Space to activate'],
    },
    props: [
      { name: 'variant', type: "'primary' | 'secondary' | 'outline' | 'ghost'", required: false, defaultValue: "'primary'" },
      { name: 'size', type: "'sm' | 'md' | 'lg'", required: false, defaultValue: "'md'" },
      { name: 'disabled', type: 'boolean', required: false, defaultValue: 'false' },
      { name: 'loading', type: 'boolean', required: false, defaultValue: 'false' },
      { name: 'onClick', type: '() => void', required: false },
    ],
  };
}

/**
 * Card component preset
 */
export function getCardPreset(): Partial<ComponentBreakdown> {
  return {
    category: 'display',
    container: {
      layout: 'flex flex-col',
      spacing: 'gap-4',
      padding: 'p-6',
      border: 'border border-gray-200',
      borderRadius: 'rounded-lg',
      background: 'bg-white',
      shadow: 'shadow-sm',
    },
    states: getCommonStates('card'),
    responsive: [
      { breakpoint: 'mobile', layout: 'Full width, stacked content' },
      { breakpoint: 'desktop', layout: 'Fixed width in grid' },
    ],
    children: [
      { name: 'CardHeader', purpose: 'Title and actions area', optional: true },
      { name: 'CardContent', purpose: 'Main content area' },
      { name: 'CardFooter', purpose: 'Actions and metadata', optional: true },
    ],
    props: [
      { name: 'variant', type: "'default' | 'outline' | 'elevated'", required: false, defaultValue: "'default'" },
      { name: 'interactive', type: 'boolean', required: false, defaultValue: 'false', description: 'Enables hover effects' },
    ],
  };
}

/**
 * Input component preset
 */
export function getInputPreset(): Partial<ComponentBreakdown> {
  return {
    category: 'form',
    container: {
      layout: 'flex flex-col',
      spacing: 'gap-1.5',
      width: 'w-full',
    },
    typography: {
      fontSize: 'text-sm',
      color: 'text-gray-900',
    },
    states: getCommonStates('input'),
    interactions: [
      { trigger: 'focus', behavior: 'Shows focus ring', feedback: 'Blue ring around input' },
      { trigger: 'blur', behavior: 'Validates input', feedback: 'Shows error if invalid' },
      { trigger: 'keydown', behavior: 'Updates value on input' },
    ],
    accessibility: {
      role: 'textbox',
      tabIndex: 0,
      keyboardSupport: ['Type to enter text', 'Tab to move focus'],
    },
    children: [
      { name: 'Label', purpose: 'Input label', optional: true },
      { name: 'Input', purpose: 'The actual input element' },
      { name: 'HelperText', purpose: 'Hint or error message', optional: true },
    ],
    props: [
      { name: 'type', type: "'text' | 'email' | 'password' | 'number'", required: false, defaultValue: "'text'" },
      { name: 'placeholder', type: 'string', required: false },
      { name: 'value', type: 'string', required: false },
      { name: 'onChange', type: '(value: string) => void', required: false },
      { name: 'error', type: 'string', required: false, description: 'Error message to display' },
    ],
  };
}

/**
 * Modal component preset
 */
export function getModalPreset(): Partial<ComponentBreakdown> {
  return {
    category: 'overlay',
    container: {
      layout: 'fixed inset-0 flex items-center justify-center',
      padding: 'p-4',
      background: 'bg-black/50',
    },
    states: [
      { name: 'default', description: 'Modal is open and visible' },
      { name: 'loading', description: 'Content is loading' },
    ],
    responsive: [
      { breakpoint: 'mobile', layout: 'Full screen with small padding', changes: ['No max-width', 'Full height option'] },
      { breakpoint: 'desktop', layout: 'Centered with max-width', changes: ['max-w-lg', 'Auto height'] },
    ],
    interactions: [
      { trigger: 'click', behavior: 'Clicking backdrop closes modal' },
      { trigger: 'keydown', behavior: 'Escape key closes modal' },
    ],
    accessibility: {
      role: 'dialog',
      ariaLabel: 'Modal dialog',
      keyboardSupport: ['Escape to close', 'Tab trapped within modal'],
      screenReaderNotes: ['Focus moves to modal on open', 'Focus returns to trigger on close'],
    },
    animations: [
      { name: 'backdrop-fade', trigger: 'mount', duration: '150ms', easing: 'ease-out', properties: ['opacity'] },
      { name: 'content-scale', trigger: 'mount', duration: '200ms', easing: 'ease-out', properties: ['transform', 'opacity'] },
    ],
    children: [
      { name: 'ModalHeader', purpose: 'Title and close button' },
      { name: 'ModalContent', purpose: 'Main content area' },
      { name: 'ModalFooter', purpose: 'Action buttons', optional: true },
    ],
    props: [
      { name: 'open', type: 'boolean', required: true },
      { name: 'onClose', type: '() => void', required: true },
      { name: 'title', type: 'string', required: false },
      { name: 'size', type: "'sm' | 'md' | 'lg' | 'full'", required: false, defaultValue: "'md'" },
    ],
  };
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook for generating v0-optimized component breakdowns
 */
export function useV0ComponentBreakdown(
  options: UseV0ComponentBreakdownOptions = {}
): UseV0ComponentBreakdownReturn {
  const { defaultCategory, onBreakdownGenerated } = options;

  const [breakdowns, setBreakdowns] = useState<ComponentBreakdown[]>([]);
  const [lastBreakdown, setLastBreakdown] = useState<ComponentBreakdown | null>(null);

  /**
   * Generate a complete component breakdown
   */
  const generateBreakdown = useCallback(
    (name: string, specs: Partial<ComponentBreakdown>): ComponentBreakdown => {
      const breakdown: ComponentBreakdown = {
        name,
        description: specs.description || `${name} component`,
        category: specs.category || defaultCategory,
        container: specs.container || DEFAULT_CONTAINER,
        typography: specs.typography || DEFAULT_TYPOGRAPHY,
        visualSpecs: specs.visualSpecs || [],
        states: specs.states || getCommonStates(),
        responsive: specs.responsive || getCommonResponsive(),
        interactions: specs.interactions || [],
        accessibility: specs.accessibility,
        animations: specs.animations,
        props: specs.props,
        children: specs.children,
        notes: specs.notes,
      };

      setBreakdowns((prev) => [...prev, breakdown]);
      setLastBreakdown(breakdown);

      const formatted = formatBreakdownAsMarkdown(breakdown);
      onBreakdownGenerated?.(breakdown, formatted);

      return breakdown;
    },
    [defaultCategory, onBreakdownGenerated]
  );

  /**
   * Format breakdown as markdown
   */
  const formatAsMarkdown = useCallback(
    (breakdown: ComponentBreakdown, formatOptions?: BreakdownOptions): string => {
      return formatBreakdownAsMarkdown(breakdown, formatOptions);
    },
    []
  );

  /**
   * Format breakdown as JSON
   */
  const formatAsJSON = useCallback((breakdown: ComponentBreakdown): string => {
    return JSON.stringify(breakdown, null, 2);
  }, []);

  /**
   * Create container spec helper
   */
  const createContainerSpec = useCallback((spec: Partial<ContainerSpec>): ContainerSpec => {
    return { ...DEFAULT_CONTAINER, ...spec };
  }, []);

  /**
   * Create typography spec helper
   */
  const createTypographySpec = useCallback((spec: Partial<TypographySpec>): TypographySpec => {
    return { ...DEFAULT_TYPOGRAPHY, ...spec };
  }, []);

  /**
   * Create state spec helper
   */
  const createStateSpec = useCallback(
    (name: StateSpec['name'], description: string, opts?: Partial<StateSpec>): StateSpec => {
      return { name, description, ...opts };
    },
    []
  );

  /**
   * Create responsive spec helper
   */
  const createResponsiveSpec = useCallback(
    (breakpoint: ResponsiveSpec['breakpoint'], layout: string, changes?: string[]): ResponsiveSpec => {
      const widths: Record<ResponsiveSpec['breakpoint'], { minWidth?: string; maxWidth?: string }> = {
        mobile: { maxWidth: '767px' },
        tablet: { minWidth: '768px', maxWidth: '1023px' },
        desktop: { minWidth: '1024px', maxWidth: '1439px' },
        wide: { minWidth: '1440px' },
      };

      return { breakpoint, layout, changes, ...widths[breakpoint] };
    },
    []
  );

  /**
   * Create interaction spec helper
   */
  const createInteractionSpec = useCallback(
    (trigger: InteractionSpec['trigger'], behavior: string, feedback?: string): InteractionSpec => {
      return { trigger, behavior, feedback };
    },
    []
  );

  return {
    // Generation functions
    generateBreakdown,
    formatAsMarkdown,
    formatAsJSON,

    // Builder functions
    createContainerSpec,
    createTypographySpec,
    createStateSpec,
    createResponsiveSpec,
    createInteractionSpec,

    // Presets
    getCommonStates,
    getCommonResponsive,
    getButtonPreset,
    getCardPreset,
    getInputPreset,
    getModalPreset,

    // State
    breakdowns,
    lastBreakdown,
  };
}

export default useV0ComponentBreakdown;
