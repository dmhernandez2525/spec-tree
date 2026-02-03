/**
 * v0 UI Template
 *
 * F2.1.8 - v0 UI Spec Export
 *
 * Templates for generating v0-compatible UI specifications.
 * v0 by Vercel excels at generating React/Next.js/Tailwind UI components.
 * These templates are optimized for v0's strengths in visual component generation.
 */

import {
  FeatureType,
  UserStoryType,
  TaskType,
} from '../types/work-items';

export interface V0UISpecConfig {
  componentName: string;
  description: string;
  visualSpecs?: VisualSpecifications;
  states?: ComponentState[];
  responsiveBehavior?: ResponsiveBehavior;
  interactions?: Interaction[];
  accessibility?: AccessibilityRequirements;
  designTokens?: DesignTokens;
}

export interface VisualSpecifications {
  container?: string;
  layout?: string;
  spacing?: string;
  colors?: ColorSpecs;
  typography?: TypographySpecs;
  borders?: string;
  shadows?: string;
  customClasses?: string[];
}

export interface ColorSpecs {
  primary?: string;
  secondary?: string;
  background?: string;
  text?: string;
  border?: string;
  accent?: string;
  error?: string;
  success?: string;
}

export interface TypographySpecs {
  headings?: string;
  body?: string;
  labels?: string;
  sizes?: Record<string, string>;
}

export interface ComponentState {
  name: string;
  description: string;
  visualChanges?: string;
  tailwindClasses?: string;
}

export interface ResponsiveBehavior {
  mobile?: string;
  tablet?: string;
  desktop?: string;
  breakpoints?: Record<string, string>;
}

export interface Interaction {
  trigger: string;
  action: string;
  feedback?: string;
}

export interface AccessibilityRequirements {
  ariaLabels?: string[];
  keyboardNavigation?: string[];
  focusManagement?: string;
  screenReaderNotes?: string[];
}

export interface DesignTokens {
  spacing?: Record<string, string>;
  colors?: Record<string, string>;
  borderRadius?: Record<string, string>;
  shadows?: Record<string, string>;
}

/**
 * Context for generating v0 UI spec from a feature
 */
export interface V0FeatureContext {
  feature: FeatureType;
  userStories?: UserStoryType[];
  tasks?: TaskType[];
  designTokens?: DesignTokens;
  comments?: string[];
}

/**
 * Default visual specifications for common component types
 */
export const DEFAULT_VISUAL_SPECS: VisualSpecifications = {
  container: 'rounded-lg border border-gray-200 bg-white p-4',
  layout: 'flex flex-col gap-4',
  spacing: 'space-y-4',
  colors: {
    primary: 'bg-blue-500 text-white',
    secondary: 'bg-gray-100 text-gray-900',
    background: 'bg-white',
    text: 'text-gray-900',
    border: 'border-gray-200',
    accent: 'bg-blue-100 text-blue-700',
    error: 'bg-red-50 text-red-700 border-red-200',
    success: 'bg-green-50 text-green-700 border-green-200',
  },
  typography: {
    headings: 'font-semibold tracking-tight',
    body: 'text-sm text-gray-600',
    labels: 'text-xs font-medium text-gray-500 uppercase',
  },
  borders: 'border rounded-md',
  shadows: 'shadow-sm',
};

/**
 * Default component states
 */
export const DEFAULT_COMPONENT_STATES: ComponentState[] = [
  {
    name: 'Default',
    description: 'Initial state when component loads',
    tailwindClasses: 'bg-white border-gray-200',
  },
  {
    name: 'Hover',
    description: 'When user hovers over interactive elements',
    tailwindClasses: 'hover:bg-gray-50 hover:border-gray-300',
  },
  {
    name: 'Focus',
    description: 'When element receives keyboard focus',
    tailwindClasses: 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
  },
  {
    name: 'Disabled',
    description: 'When interaction is not available',
    tailwindClasses: 'opacity-50 cursor-not-allowed',
  },
  {
    name: 'Loading',
    description: 'When data is being fetched or action is processing',
    tailwindClasses: 'animate-pulse bg-gray-100',
  },
];

/**
 * Default responsive behavior
 */
export const DEFAULT_RESPONSIVE_BEHAVIOR: ResponsiveBehavior = {
  mobile: 'Full width, stacked layout, larger touch targets (min 44px)',
  tablet: 'Side-by-side layout where appropriate, medium spacing',
  desktop: 'Maximum width container, optimal reading width, hover states',
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
};

/**
 * Default accessibility requirements
 */
export const DEFAULT_ACCESSIBILITY: AccessibilityRequirements = {
  ariaLabels: [
    'All interactive elements have descriptive aria-labels',
    'Form fields have associated labels',
    'Icons have aria-hidden or descriptive text',
  ],
  keyboardNavigation: [
    'Tab order follows visual layout',
    'Enter/Space activates buttons',
    'Escape closes modals/dropdowns',
    'Arrow keys navigate within components',
  ],
  focusManagement: 'Visible focus indicators on all interactive elements',
  screenReaderNotes: [
    'Announce state changes',
    'Provide context for actions',
    'Use semantic HTML elements',
  ],
};

/**
 * Generate v0 UI spec for a component
 */
export function generateV0UISpec(config: V0UISpecConfig): string {
  const sections: string[] = [];

  // Header
  sections.push(`# Component: ${config.componentName}`);
  sections.push('');

  if (config.description) {
    sections.push(config.description);
    sections.push('');
  }

  // Visual Specifications
  if (config.visualSpecs) {
    sections.push(generateVisualSpecsSection(config.visualSpecs));
  }

  // States
  if (config.states && config.states.length > 0) {
    sections.push(generateStatesSection(config.states));
  }

  // Responsive Behavior
  if (config.responsiveBehavior) {
    sections.push(generateResponsiveSection(config.responsiveBehavior));
  }

  // Interactions
  if (config.interactions && config.interactions.length > 0) {
    sections.push(generateInteractionsSection(config.interactions));
  }

  // Accessibility
  if (config.accessibility) {
    sections.push(generateAccessibilitySection(config.accessibility));
  }

  // Design Tokens
  if (config.designTokens) {
    sections.push(generateDesignTokensSection(config.designTokens));
  }

  return sections.join('\n');
}

/**
 * Generate visual specifications section
 */
function generateVisualSpecsSection(specs: VisualSpecifications): string {
  const lines: string[] = ['## Visual Specifications', ''];

  if (specs.container) {
    lines.push(`- **Container:** \`${specs.container}\``);
  }
  if (specs.layout) {
    lines.push(`- **Layout:** \`${specs.layout}\``);
  }
  if (specs.spacing) {
    lines.push(`- **Spacing:** \`${specs.spacing}\``);
  }
  if (specs.borders) {
    lines.push(`- **Borders:** \`${specs.borders}\``);
  }
  if (specs.shadows) {
    lines.push(`- **Shadows:** \`${specs.shadows}\``);
  }

  if (specs.colors) {
    lines.push('');
    lines.push('### Colors');
    for (const [name, value] of Object.entries(specs.colors)) {
      if (value) {
        lines.push(`- **${capitalizeFirst(name)}:** \`${value}\``);
      }
    }
  }

  if (specs.typography) {
    lines.push('');
    lines.push('### Typography');
    if (specs.typography.headings) {
      lines.push(`- **Headings:** \`${specs.typography.headings}\``);
    }
    if (specs.typography.body) {
      lines.push(`- **Body:** \`${specs.typography.body}\``);
    }
    if (specs.typography.labels) {
      lines.push(`- **Labels:** \`${specs.typography.labels}\``);
    }
  }

  if (specs.customClasses && specs.customClasses.length > 0) {
    lines.push('');
    lines.push('### Custom Classes');
    for (const cls of specs.customClasses) {
      lines.push(`- \`${cls}\``);
    }
  }

  lines.push('');
  return lines.join('\n');
}

/**
 * Generate states section
 */
function generateStatesSection(states: ComponentState[]): string {
  const lines: string[] = ['## States', ''];

  for (const state of states) {
    lines.push(`### ${state.name}`);
    lines.push(state.description);
    if (state.visualChanges) {
      lines.push(`- Visual: ${state.visualChanges}`);
    }
    if (state.tailwindClasses) {
      lines.push(`- Classes: \`${state.tailwindClasses}\``);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Generate responsive behavior section
 */
function generateResponsiveSection(responsive: ResponsiveBehavior): string {
  const lines: string[] = ['## Responsive Behavior', ''];

  if (responsive.mobile) {
    lines.push(`- **Mobile (<640px):** ${responsive.mobile}`);
  }
  if (responsive.tablet) {
    lines.push(`- **Tablet (640px-1024px):** ${responsive.tablet}`);
  }
  if (responsive.desktop) {
    lines.push(`- **Desktop (>1024px):** ${responsive.desktop}`);
  }

  if (responsive.breakpoints && Object.keys(responsive.breakpoints).length > 0) {
    lines.push('');
    lines.push('### Breakpoints');
    for (const [name, value] of Object.entries(responsive.breakpoints)) {
      lines.push(`- **${name}:** ${value}`);
    }
  }

  lines.push('');
  return lines.join('\n');
}

/**
 * Generate interactions section
 */
function generateInteractionsSection(interactions: Interaction[]): string {
  const lines: string[] = ['## Interactions', ''];

  for (const interaction of interactions) {
    lines.push(`- **${interaction.trigger}:** ${interaction.action}`);
    if (interaction.feedback) {
      lines.push(`  - Feedback: ${interaction.feedback}`);
    }
  }

  lines.push('');
  return lines.join('\n');
}

/**
 * Generate accessibility section
 */
function generateAccessibilitySection(accessibility: AccessibilityRequirements): string {
  const lines: string[] = ['## Accessibility', ''];

  if (accessibility.focusManagement) {
    lines.push(`**Focus:** ${accessibility.focusManagement}`);
    lines.push('');
  }

  if (accessibility.ariaLabels && accessibility.ariaLabels.length > 0) {
    lines.push('### ARIA');
    for (const label of accessibility.ariaLabels) {
      lines.push(`- ${label}`);
    }
    lines.push('');
  }

  if (accessibility.keyboardNavigation && accessibility.keyboardNavigation.length > 0) {
    lines.push('### Keyboard Navigation');
    for (const nav of accessibility.keyboardNavigation) {
      lines.push(`- ${nav}`);
    }
    lines.push('');
  }

  if (accessibility.screenReaderNotes && accessibility.screenReaderNotes.length > 0) {
    lines.push('### Screen Reader');
    for (const note of accessibility.screenReaderNotes) {
      lines.push(`- ${note}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Generate design tokens section
 */
function generateDesignTokensSection(tokens: DesignTokens): string {
  const lines: string[] = ['## Design Tokens', ''];

  if (tokens.spacing && Object.keys(tokens.spacing).length > 0) {
    lines.push('### Spacing');
    for (const [name, value] of Object.entries(tokens.spacing)) {
      lines.push(`- **${name}:** ${value}`);
    }
    lines.push('');
  }

  if (tokens.colors && Object.keys(tokens.colors).length > 0) {
    lines.push('### Colors');
    for (const [name, value] of Object.entries(tokens.colors)) {
      lines.push(`- **${name}:** ${value}`);
    }
    lines.push('');
  }

  if (tokens.borderRadius && Object.keys(tokens.borderRadius).length > 0) {
    lines.push('### Border Radius');
    for (const [name, value] of Object.entries(tokens.borderRadius)) {
      lines.push(`- **${name}:** ${value}`);
    }
    lines.push('');
  }

  if (tokens.shadows && Object.keys(tokens.shadows).length > 0) {
    lines.push('### Shadows');
    for (const [name, value] of Object.entries(tokens.shadows)) {
      lines.push(`- **${name}:** ${value}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Generate v0 UI spec from a feature
 */
export function generateV0SpecFromFeature(context: V0FeatureContext): string {
  const { feature, userStories, tasks } = context;
  const sections: string[] = [];

  // Header
  sections.push(`# UI Specification: ${feature.title}`);
  sections.push('');

  if (feature.description) {
    sections.push(feature.description);
    sections.push('');
  }

  // Component Overview
  sections.push('## Component Overview');
  sections.push('');
  if (feature.details) {
    sections.push(feature.details);
    sections.push('');
  }

  // Visual Specifications with defaults
  sections.push(generateVisualSpecsSection(DEFAULT_VISUAL_SPECS));

  // Extract states from acceptance criteria
  const states = extractStatesFromAcceptanceCriteria(feature.acceptanceCriteria);
  if (states.length > 0) {
    sections.push(generateStatesSection(states));
  } else {
    sections.push(generateStatesSection(DEFAULT_COMPONENT_STATES));
  }

  // Responsive behavior
  sections.push(generateResponsiveSection(DEFAULT_RESPONSIVE_BEHAVIOR));

  // Extract interactions from user stories
  if (userStories && userStories.length > 0) {
    const interactions = extractInteractionsFromStories(userStories);
    if (interactions.length > 0) {
      sections.push(generateInteractionsSection(interactions));
    }
  }

  // Accessibility
  sections.push(generateAccessibilitySection(DEFAULT_ACCESSIBILITY));

  // Acceptance Criteria
  if (feature.acceptanceCriteria && feature.acceptanceCriteria.length > 0) {
    sections.push('## Acceptance Criteria');
    sections.push('');
    for (const criterion of feature.acceptanceCriteria) {
      if (criterion.text) {
        sections.push(`- [ ] ${criterion.text}`);
      }
    }
    sections.push('');
  }

  if (context.comments && context.comments.length > 0) {
    sections.push('## Comments');
    sections.push('');
    sections.push(...context.comments);
    sections.push('');
  }

  // Related Tasks
  if (tasks && tasks.length > 0) {
    sections.push('## Implementation Tasks');
    sections.push('');
    for (const task of tasks) {
      sections.push(`- [ ] ${task.title}`);
      if (task.details) {
        sections.push(`  - ${task.details}`);
      }
    }
    sections.push('');
  }

  return sections.join('\n');
}

/**
 * Extract component states from acceptance criteria
 */
function extractStatesFromAcceptanceCriteria(
  acceptanceCriteria?: Array<{ text: string }>
): ComponentState[] {
  if (!acceptanceCriteria || acceptanceCriteria.length === 0) {
    return [];
  }

  const states: ComponentState[] = [];
  const stateKeywords = [
    'when',
    'if',
    'on click',
    'on hover',
    'loading',
    'error',
    'success',
    'empty',
    'disabled',
    'selected',
    'active',
    'expanded',
    'collapsed',
  ];

  for (const criterion of acceptanceCriteria) {
    const text = criterion.text?.toLowerCase() || '';
    for (const keyword of stateKeywords) {
      if (text.includes(keyword)) {
        states.push({
          name: capitalizeFirst(keyword.replace('on ', '')),
          description: criterion.text || '',
        });
        break;
      }
    }
  }

  return states;
}

/**
 * Extract interactions from user stories
 */
function extractInteractionsFromStories(userStories: UserStoryType[]): Interaction[] {
  const interactions: Interaction[] = [];

  for (const story of userStories) {
    if (story.action) {
      interactions.push({
        trigger: `User wants to ${story.action}`,
        action: story.goal || 'Complete the action',
      });
    }

    // Also extract from acceptance criteria
    if (story.acceptanceCriteria) {
      for (const criterion of story.acceptanceCriteria) {
        const text = criterion.text?.toLowerCase() || '';
        if (text.includes('click') || text.includes('tap') || text.includes('press')) {
          interactions.push({
            trigger: 'Click/Tap',
            action: criterion.text || '',
          });
        }
      }
    }
  }

  return interactions;
}

/**
 * Generate bulk v0 specs for multiple features
 */
export function generateBulkV0Specs(contexts: V0FeatureContext[]): string {
  const specs = contexts.map((context, index) => {
    const specContent = generateV0SpecFromFeature(context);
    return `---\n\n# Component ${index + 1}\n\n${specContent}`;
  });

  return specs.join('\n');
}

/**
 * Capitalize first letter of a string
 * @param str - The string to capitalize
 * @returns The string with first letter capitalized, or empty string if input is empty/null
 */
function capitalizeFirst(str: string | null | undefined): string {
  if (!str || str.length === 0) {
    return '';
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}
