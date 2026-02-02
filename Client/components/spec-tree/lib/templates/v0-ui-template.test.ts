/**
 * v0 UI Template Tests
 *
 * F2.1.8 - v0 UI Spec Export
 */

import { describe, it, expect } from 'vitest';
import {
  generateV0UISpec,
  generateV0SpecFromFeature,
  generateBulkV0Specs,
  V0UISpecConfig,
  V0FeatureContext,
  VisualSpecifications,
  ComponentState,
  ResponsiveBehavior,
  Interaction,
  AccessibilityRequirements,
  DesignTokens,
  DEFAULT_VISUAL_SPECS,
  DEFAULT_COMPONENT_STATES,
  DEFAULT_RESPONSIVE_BEHAVIOR,
  DEFAULT_ACCESSIBILITY,
} from './v0-ui-template';
import { FeatureType, UserStoryType, TaskType } from '../types/work-items';

describe('v0-ui-template', () => {
  describe('generateV0UISpec', () => {
    it('generates basic spec with component name and description', () => {
      const config: V0UISpecConfig = {
        componentName: 'TestButton',
        description: 'A test button component',
      };

      const result = generateV0UISpec(config);

      expect(result).toContain('# Component: TestButton');
      expect(result).toContain('A test button component');
    });

    it('generates spec with visual specifications', () => {
      const visualSpecs: VisualSpecifications = {
        container: 'rounded-lg p-4',
        layout: 'flex flex-col',
        spacing: 'gap-4',
        borders: 'border border-gray-200',
        shadows: 'shadow-md',
      };

      const config: V0UISpecConfig = {
        componentName: 'Card',
        description: 'A card component',
        visualSpecs,
      };

      const result = generateV0UISpec(config);

      expect(result).toContain('## Visual Specifications');
      expect(result).toContain('`rounded-lg p-4`');
      expect(result).toContain('`flex flex-col`');
      expect(result).toContain('`gap-4`');
      expect(result).toContain('`border border-gray-200`');
      expect(result).toContain('`shadow-md`');
    });

    it('generates spec with color specifications', () => {
      const visualSpecs: VisualSpecifications = {
        colors: {
          primary: 'bg-blue-500 text-white',
          secondary: 'bg-gray-100',
          error: 'bg-red-50 text-red-700',
        },
      };

      const config: V0UISpecConfig = {
        componentName: 'Alert',
        description: 'An alert component',
        visualSpecs,
      };

      const result = generateV0UISpec(config);

      expect(result).toContain('### Colors');
      expect(result).toContain('**Primary:** `bg-blue-500 text-white`');
      expect(result).toContain('**Secondary:** `bg-gray-100`');
      expect(result).toContain('**Error:** `bg-red-50 text-red-700`');
    });

    it('generates spec with typography specifications', () => {
      const visualSpecs: VisualSpecifications = {
        typography: {
          headings: 'font-bold text-xl',
          body: 'text-sm text-gray-600',
          labels: 'text-xs uppercase',
        },
      };

      const config: V0UISpecConfig = {
        componentName: 'Text',
        description: 'Text component',
        visualSpecs,
      };

      const result = generateV0UISpec(config);

      expect(result).toContain('### Typography');
      expect(result).toContain('**Headings:** `font-bold text-xl`');
      expect(result).toContain('**Body:** `text-sm text-gray-600`');
      expect(result).toContain('**Labels:** `text-xs uppercase`');
    });

    it('generates spec with component states', () => {
      const states: ComponentState[] = [
        {
          name: 'Default',
          description: 'Initial state',
          tailwindClasses: 'bg-white',
        },
        {
          name: 'Hover',
          description: 'On mouse hover',
          tailwindClasses: 'hover:bg-gray-50',
        },
        {
          name: 'Disabled',
          description: 'When disabled',
          tailwindClasses: 'opacity-50 cursor-not-allowed',
          visualChanges: 'Faded appearance',
        },
      ];

      const config: V0UISpecConfig = {
        componentName: 'Button',
        description: 'Button component',
        states,
      };

      const result = generateV0UISpec(config);

      expect(result).toContain('## States');
      expect(result).toContain('### Default');
      expect(result).toContain('Initial state');
      expect(result).toContain('Classes: `bg-white`');
      expect(result).toContain('### Hover');
      expect(result).toContain('### Disabled');
      expect(result).toContain('Visual: Faded appearance');
    });

    it('generates spec with responsive behavior', () => {
      const responsiveBehavior: ResponsiveBehavior = {
        mobile: 'Full width, stacked',
        tablet: 'Side by side',
        desktop: 'Max width container',
        breakpoints: {
          sm: '640px',
          md: '768px',
        },
      };

      const config: V0UISpecConfig = {
        componentName: 'Layout',
        description: 'Layout component',
        responsiveBehavior,
      };

      const result = generateV0UISpec(config);

      expect(result).toContain('## Responsive Behavior');
      expect(result).toContain('**Mobile (<640px):** Full width, stacked');
      expect(result).toContain('**Tablet (640px-1024px):** Side by side');
      expect(result).toContain('**Desktop (>1024px):** Max width container');
      expect(result).toContain('### Breakpoints');
      expect(result).toContain('**sm:** 640px');
    });

    it('generates spec with interactions', () => {
      const interactions: Interaction[] = [
        {
          trigger: 'Click button',
          action: 'Opens modal',
          feedback: 'Button shows loading state',
        },
        {
          trigger: 'Press Escape',
          action: 'Closes modal',
        },
      ];

      const config: V0UISpecConfig = {
        componentName: 'Modal',
        description: 'Modal component',
        interactions,
      };

      const result = generateV0UISpec(config);

      expect(result).toContain('## Interactions');
      expect(result).toContain('**Click button:** Opens modal');
      expect(result).toContain('Feedback: Button shows loading state');
      expect(result).toContain('**Press Escape:** Closes modal');
    });

    it('generates spec with accessibility requirements', () => {
      const accessibility: AccessibilityRequirements = {
        ariaLabels: ['Button has aria-label', 'Modal has role="dialog"'],
        keyboardNavigation: ['Tab navigates through', 'Enter activates'],
        focusManagement: 'Focus trapped in modal',
        screenReaderNotes: ['Announces state changes'],
      };

      const config: V0UISpecConfig = {
        componentName: 'Dialog',
        description: 'Dialog component',
        accessibility,
      };

      const result = generateV0UISpec(config);

      expect(result).toContain('## Accessibility');
      expect(result).toContain('**Focus:** Focus trapped in modal');
      expect(result).toContain('### ARIA');
      expect(result).toContain('Button has aria-label');
      expect(result).toContain('### Keyboard Navigation');
      expect(result).toContain('Tab navigates through');
      expect(result).toContain('### Screen Reader');
      expect(result).toContain('Announces state changes');
    });

    it('generates spec with design tokens', () => {
      const designTokens: DesignTokens = {
        spacing: {
          xs: '4px',
          sm: '8px',
        },
        colors: {
          brand: '#0066FF',
        },
        borderRadius: {
          sm: '4px',
        },
        shadows: {
          sm: '0 1px 2px rgba(0,0,0,0.1)',
        },
      };

      const config: V0UISpecConfig = {
        componentName: 'Theme',
        description: 'Theme tokens',
        designTokens,
      };

      const result = generateV0UISpec(config);

      expect(result).toContain('## Design Tokens');
      expect(result).toContain('### Spacing');
      expect(result).toContain('**xs:** 4px');
      expect(result).toContain('### Colors');
      expect(result).toContain('**brand:** #0066FF');
      expect(result).toContain('### Border Radius');
      expect(result).toContain('**sm:** 4px');
      expect(result).toContain('### Shadows');
    });

    it('generates complete spec with all sections', () => {
      const config: V0UISpecConfig = {
        componentName: 'CompleteComponent',
        description: 'A fully specified component',
        visualSpecs: DEFAULT_VISUAL_SPECS,
        states: DEFAULT_COMPONENT_STATES,
        responsiveBehavior: DEFAULT_RESPONSIVE_BEHAVIOR,
        accessibility: DEFAULT_ACCESSIBILITY,
      };

      const result = generateV0UISpec(config);

      expect(result).toContain('# Component: CompleteComponent');
      expect(result).toContain('## Visual Specifications');
      expect(result).toContain('## States');
      expect(result).toContain('## Responsive Behavior');
      expect(result).toContain('## Accessibility');
    });
  });

  describe('generateV0SpecFromFeature', () => {
    const mockFeature: FeatureType = {
      id: 'feature-1',
      title: 'Date Range Picker',
      description: 'A component for selecting date ranges',
      details: 'Allows users to select start and end dates',
      dependencies: '',
      acceptanceCriteria: [
        { text: 'Display preset options' },
        { text: 'Support custom date selection' },
        { text: 'When loading, show spinner' },
      ],
      parentEpicId: 'epic-1',
      userStoryIds: [],
      notes: '',
      priority: 'high',
      effort: 'medium',
    };

    it('generates spec from feature', () => {
      const context: V0FeatureContext = {
        feature: mockFeature,
      };

      const result = generateV0SpecFromFeature(context);

      expect(result).toContain('# UI Specification: Date Range Picker');
      expect(result).toContain('A component for selecting date ranges');
      expect(result).toContain('## Component Overview');
      expect(result).toContain('Allows users to select start and end dates');
    });

    it('includes acceptance criteria', () => {
      const context: V0FeatureContext = {
        feature: mockFeature,
      };

      const result = generateV0SpecFromFeature(context);

      expect(result).toContain('## Acceptance Criteria');
      expect(result).toContain('- [ ] Display preset options');
      expect(result).toContain('- [ ] Support custom date selection');
    });

    it('extracts states from acceptance criteria', () => {
      const context: V0FeatureContext = {
        feature: mockFeature,
      };

      const result = generateV0SpecFromFeature(context);

      expect(result).toContain('## States');
      // The function extracts "when" as a state keyword from "When loading, show spinner"
      expect(result).toContain('When');
      expect(result).toContain('show spinner');
    });

    it('includes user stories as interactions', () => {
      const mockUserStory: UserStoryType = {
        id: 'story-1',
        title: 'Select Date Range',
        role: 'user',
        action: 'select a date range',
        goal: 'filter my data by date',
        points: '3',
        acceptanceCriteria: [{ text: 'Click to select start date' }],
        notes: '',
        parentFeatureId: 'feature-1',
        taskIds: [],
        developmentOrder: 1,
      };

      const context: V0FeatureContext = {
        feature: mockFeature,
        userStories: [mockUserStory],
      };

      const result = generateV0SpecFromFeature(context);

      expect(result).toContain('## Interactions');
      expect(result).toContain('select a date range');
    });

    it('includes tasks as implementation tasks', () => {
      const mockTask: TaskType = {
        id: 'task-1',
        title: 'Create calendar grid',
        details: 'Implement 7x6 calendar grid',
        priority: 1,
        notes: '',
        parentUserStoryId: 'story-1',
        dependentTaskIds: [],
      };

      const context: V0FeatureContext = {
        feature: mockFeature,
        tasks: [mockTask],
      };

      const result = generateV0SpecFromFeature(context);

      expect(result).toContain('## Implementation Tasks');
      expect(result).toContain('- [ ] Create calendar grid');
      expect(result).toContain('Implement 7x6 calendar grid');
    });

    it('includes default visual specs', () => {
      const context: V0FeatureContext = {
        feature: mockFeature,
      };

      const result = generateV0SpecFromFeature(context);

      expect(result).toContain('## Visual Specifications');
      expect(result).toContain('rounded-lg border');
    });

    it('includes default responsive behavior', () => {
      const context: V0FeatureContext = {
        feature: mockFeature,
      };

      const result = generateV0SpecFromFeature(context);

      expect(result).toContain('## Responsive Behavior');
      expect(result).toContain('Mobile');
      expect(result).toContain('Desktop');
    });

    it('includes default accessibility', () => {
      const context: V0FeatureContext = {
        feature: mockFeature,
      };

      const result = generateV0SpecFromFeature(context);

      expect(result).toContain('## Accessibility');
      expect(result).toContain('ARIA');
      expect(result).toContain('Keyboard Navigation');
    });
  });

  describe('generateBulkV0Specs', () => {
    it('generates multiple specs separated by dividers', () => {
      const feature1: FeatureType = {
        id: 'feature-1',
        title: 'Feature One',
        description: 'First feature',
        details: '',
        dependencies: '',
        acceptanceCriteria: [],
        parentEpicId: 'epic-1',
        userStoryIds: [],
        notes: '',
        priority: '',
        effort: '',
      };

      const feature2: FeatureType = {
        id: 'feature-2',
        title: 'Feature Two',
        description: 'Second feature',
        details: '',
        dependencies: '',
        acceptanceCriteria: [],
        parentEpicId: 'epic-1',
        userStoryIds: [],
        notes: '',
        priority: '',
        effort: '',
      };

      const contexts: V0FeatureContext[] = [
        { feature: feature1 },
        { feature: feature2 },
      ];

      const result = generateBulkV0Specs(contexts);

      expect(result).toContain('# Component 1');
      expect(result).toContain('Feature One');
      expect(result).toContain('# Component 2');
      expect(result).toContain('Feature Two');
      expect(result).toContain('---');
    });

    it('handles empty array', () => {
      const result = generateBulkV0Specs([]);
      expect(result).toBe('');
    });

    it('handles single feature', () => {
      const feature: FeatureType = {
        id: 'feature-1',
        title: 'Solo Feature',
        description: 'Only one',
        details: '',
        dependencies: '',
        acceptanceCriteria: [],
        parentEpicId: 'epic-1',
        userStoryIds: [],
        notes: '',
        priority: '',
        effort: '',
      };

      const contexts: V0FeatureContext[] = [{ feature }];
      const result = generateBulkV0Specs(contexts);

      expect(result).toContain('# Component 1');
      expect(result).toContain('Solo Feature');
      expect((result.match(/---/g) || []).length).toBe(1);
    });
  });

  describe('DEFAULT constants', () => {
    it('DEFAULT_VISUAL_SPECS has expected properties', () => {
      expect(DEFAULT_VISUAL_SPECS.container).toBeDefined();
      expect(DEFAULT_VISUAL_SPECS.layout).toBeDefined();
      expect(DEFAULT_VISUAL_SPECS.colors).toBeDefined();
      expect(DEFAULT_VISUAL_SPECS.typography).toBeDefined();
    });

    it('DEFAULT_COMPONENT_STATES has common states', () => {
      const stateNames = DEFAULT_COMPONENT_STATES.map((s) => s.name);
      expect(stateNames).toContain('Default');
      expect(stateNames).toContain('Hover');
      expect(stateNames).toContain('Focus');
      expect(stateNames).toContain('Disabled');
      expect(stateNames).toContain('Loading');
    });

    it('DEFAULT_RESPONSIVE_BEHAVIOR covers all viewport sizes', () => {
      expect(DEFAULT_RESPONSIVE_BEHAVIOR.mobile).toBeDefined();
      expect(DEFAULT_RESPONSIVE_BEHAVIOR.tablet).toBeDefined();
      expect(DEFAULT_RESPONSIVE_BEHAVIOR.desktop).toBeDefined();
      expect(DEFAULT_RESPONSIVE_BEHAVIOR.breakpoints).toBeDefined();
    });

    it('DEFAULT_ACCESSIBILITY covers key requirements', () => {
      expect(DEFAULT_ACCESSIBILITY.ariaLabels).toBeDefined();
      expect(DEFAULT_ACCESSIBILITY.keyboardNavigation).toBeDefined();
      expect(DEFAULT_ACCESSIBILITY.focusManagement).toBeDefined();
      expect(DEFAULT_ACCESSIBILITY.screenReaderNotes).toBeDefined();
    });
  });
});
