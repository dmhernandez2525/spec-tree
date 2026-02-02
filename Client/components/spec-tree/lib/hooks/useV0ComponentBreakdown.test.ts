/**
 * Tests for useV0ComponentBreakdown hook
 *
 * F2.1.9 - v0 component breakdown
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
  useV0ComponentBreakdown,
  formatContainerClasses,
  formatTypographyClasses,
  formatBreakdownAsMarkdown,
  getCommonStates,
  getCommonResponsive,
  getButtonPreset,
  getCardPreset,
  getInputPreset,
  getModalPreset,
  type ComponentBreakdown,
  type ContainerSpec,
  type TypographySpec,
} from './useV0ComponentBreakdown';

describe('formatContainerClasses', () => {
  it('should format container spec to Tailwind classes', () => {
    const spec: ContainerSpec = {
      layout: 'flex',
      spacing: 'gap-4',
      padding: 'p-4',
      borderRadius: 'rounded-lg',
    };

    const result = formatContainerClasses(spec);

    expect(result).toBe('flex gap-4 p-4 rounded-lg');
  });

  it('should include all properties', () => {
    const spec: ContainerSpec = {
      layout: 'flex',
      spacing: 'gap-2',
      padding: 'p-4',
      border: 'border border-gray-200',
      borderRadius: 'rounded-md',
      background: 'bg-white',
      shadow: 'shadow-sm',
      width: 'w-full',
      height: 'h-auto',
      overflow: 'overflow-hidden',
      additionalClasses: ['relative', 'z-10'],
    };

    const result = formatContainerClasses(spec);

    expect(result).toContain('flex');
    expect(result).toContain('border border-gray-200');
    expect(result).toContain('shadow-sm');
    expect(result).toContain('relative');
    expect(result).toContain('z-10');
  });

  it('should handle empty spec', () => {
    const result = formatContainerClasses({});
    expect(result).toBe('');
  });
});

describe('formatTypographyClasses', () => {
  it('should format typography spec to Tailwind classes', () => {
    const spec: TypographySpec = {
      fontSize: 'text-sm',
      fontWeight: 'font-medium',
      color: 'text-gray-900',
    };

    const result = formatTypographyClasses(spec);

    expect(result).toBe('text-sm font-medium text-gray-900');
  });

  it('should include all typography properties', () => {
    const spec: TypographySpec = {
      fontFamily: 'font-sans',
      fontSize: 'text-base',
      fontWeight: 'font-bold',
      lineHeight: 'leading-relaxed',
      letterSpacing: 'tracking-tight',
      color: 'text-blue-600',
      textAlign: 'text-center',
      textDecoration: 'underline',
    };

    const result = formatTypographyClasses(spec);

    expect(result).toContain('font-sans');
    expect(result).toContain('leading-relaxed');
    expect(result).toContain('underline');
  });
});

describe('getCommonStates', () => {
  it('should return default states', () => {
    const states = getCommonStates();

    expect(states.some((s) => s.name === 'default')).toBe(true);
    expect(states.some((s) => s.name === 'hover')).toBe(true);
    expect(states.some((s) => s.name === 'focus')).toBe(true);
    expect(states.some((s) => s.name === 'disabled')).toBe(true);
  });

  it('should return button-specific states', () => {
    const states = getCommonStates('button');

    expect(states.some((s) => s.name === 'active')).toBe(true);
    expect(states.some((s) => s.name === 'loading')).toBe(true);
  });

  it('should return input-specific states', () => {
    const states = getCommonStates('input');

    expect(states.some((s) => s.name === 'error')).toBe(true);
    expect(states.some((s) => s.name === 'success')).toBe(true);
  });

  it('should return card-specific states', () => {
    const states = getCommonStates('card');

    expect(states.some((s) => s.name === 'active')).toBe(true);
    // Cards typically don't have focus state
    expect(states.every((s) => s.name !== 'focus')).toBe(true);
  });

  it('should return link-specific states', () => {
    const states = getCommonStates('link');

    expect(states.some((s) => s.name === 'default')).toBe(true);
    expect(states.some((s) => s.classes?.includes('text-blue-600'))).toBe(true);
  });
});

describe('getCommonResponsive', () => {
  it('should return mobile, tablet, and desktop breakpoints', () => {
    const responsive = getCommonResponsive();

    expect(responsive.length).toBe(3);
    expect(responsive.some((r) => r.breakpoint === 'mobile')).toBe(true);
    expect(responsive.some((r) => r.breakpoint === 'tablet')).toBe(true);
    expect(responsive.some((r) => r.breakpoint === 'desktop')).toBe(true);
  });

  it('should include layout descriptions', () => {
    const responsive = getCommonResponsive();

    for (const spec of responsive) {
      expect(spec.layout).toBeTruthy();
    }
  });
});

describe('presets', () => {
  describe('getButtonPreset', () => {
    it('should return button configuration', () => {
      const preset = getButtonPreset();

      expect(preset.category).toBe('interactive');
      expect(preset.container).toBeDefined();
      expect(preset.states).toBeDefined();
      expect(preset.interactions).toBeDefined();
      expect(preset.accessibility?.role).toBe('button');
    });

    it('should include variant and size props', () => {
      const preset = getButtonPreset();

      expect(preset.props?.some((p) => p.name === 'variant')).toBe(true);
      expect(preset.props?.some((p) => p.name === 'size')).toBe(true);
    });
  });

  describe('getCardPreset', () => {
    it('should return card configuration', () => {
      const preset = getCardPreset();

      expect(preset.category).toBe('display');
      expect(preset.container?.border).toContain('border');
      expect(preset.container?.shadow).toContain('shadow');
    });

    it('should include child components', () => {
      const preset = getCardPreset();

      expect(preset.children?.some((c) => c.name === 'CardHeader')).toBe(true);
      expect(preset.children?.some((c) => c.name === 'CardContent')).toBe(true);
      expect(preset.children?.some((c) => c.name === 'CardFooter')).toBe(true);
    });
  });

  describe('getInputPreset', () => {
    it('should return input configuration', () => {
      const preset = getInputPreset();

      expect(preset.category).toBe('form');
      expect(preset.states?.some((s) => s.name === 'error')).toBe(true);
    });

    it('should include validation interactions', () => {
      const preset = getInputPreset();

      expect(preset.interactions?.some((i) => i.trigger === 'blur')).toBe(true);
    });
  });

  describe('getModalPreset', () => {
    it('should return modal configuration', () => {
      const preset = getModalPreset();

      expect(preset.category).toBe('overlay');
      expect(preset.container?.layout).toContain('fixed');
    });

    it('should include animations', () => {
      const preset = getModalPreset();

      expect(preset.animations).toBeDefined();
      expect(preset.animations?.some((a) => a.name.includes('fade'))).toBe(true);
    });

    it('should include accessibility specs', () => {
      const preset = getModalPreset();

      expect(preset.accessibility?.role).toBe('dialog');
      expect(preset.accessibility?.keyboardSupport?.some((k) => k.includes('Escape'))).toBe(true);
    });
  });
});

describe('formatBreakdownAsMarkdown', () => {
  const sampleBreakdown: ComponentBreakdown = {
    name: 'TestButton',
    description: 'A test button component',
    category: 'interactive',
    container: {
      layout: 'flex items-center',
      padding: 'px-4 py-2',
      borderRadius: 'rounded-md',
      background: 'bg-blue-600',
    },
    typography: {
      fontSize: 'text-sm',
      fontWeight: 'font-medium',
      color: 'text-white',
    },
    states: [
      { name: 'default', description: 'Normal state' },
      { name: 'hover', description: 'Hovered', classes: ['hover:bg-blue-700'] },
    ],
    responsive: [{ breakpoint: 'mobile', layout: 'Full width' }],
    interactions: [{ trigger: 'click', behavior: 'Triggers action', feedback: 'Visual feedback' }],
    accessibility: {
      role: 'button',
      tabIndex: 0,
    },
    props: [{ name: 'variant', type: 'string', required: false, defaultValue: "'primary'" }],
    notes: ['Use for primary actions'],
  };

  it('should generate markdown with component name', () => {
    const markdown = formatBreakdownAsMarkdown(sampleBreakdown);

    expect(markdown).toContain('# Component: TestButton');
  });

  it('should include visual specifications', () => {
    const markdown = formatBreakdownAsMarkdown(sampleBreakdown);

    expect(markdown).toContain('## Visual Specifications');
    expect(markdown).toContain('Container');
    expect(markdown).toContain('Typography');
  });

  it('should include states section', () => {
    const markdown = formatBreakdownAsMarkdown(sampleBreakdown);

    expect(markdown).toContain('## States');
    expect(markdown).toContain('**Default**');
    expect(markdown).toContain('**Hover**');
    expect(markdown).toContain('hover:bg-blue-700');
  });

  it('should include responsive section', () => {
    const markdown = formatBreakdownAsMarkdown(sampleBreakdown);

    expect(markdown).toContain('## Responsive Behavior');
    expect(markdown).toContain('Mobile');
  });

  it('should include interactions section', () => {
    const markdown = formatBreakdownAsMarkdown(sampleBreakdown);

    expect(markdown).toContain('## Interactions');
    expect(markdown).toContain('**Click**');
    expect(markdown).toContain('Feedback:');
  });

  it('should include accessibility section when present', () => {
    const markdown = formatBreakdownAsMarkdown(sampleBreakdown);

    expect(markdown).toContain('## Accessibility');
    expect(markdown).toContain('Role');
    expect(markdown).toContain('button');
  });

  it('should include props section when present', () => {
    const markdown = formatBreakdownAsMarkdown(sampleBreakdown);

    expect(markdown).toContain('## Props');
    expect(markdown).toContain('variant');
  });

  it('should include notes section', () => {
    const markdown = formatBreakdownAsMarkdown(sampleBreakdown);

    expect(markdown).toContain('## Notes');
    expect(markdown).toContain('primary actions');
  });

  it('should respect options to exclude sections', () => {
    const markdown = formatBreakdownAsMarkdown(sampleBreakdown, {
      includeAccessibility: false,
      includeProps: false,
    });

    expect(markdown).not.toContain('## Accessibility');
    expect(markdown).not.toContain('## Props');
  });
});

describe('useV0ComponentBreakdown', () => {
  describe('generateBreakdown', () => {
    it('should generate a complete breakdown', () => {
      const { result } = renderHook(() => useV0ComponentBreakdown());

      let breakdown;
      act(() => {
        breakdown = result.current.generateBreakdown('MyButton', {
          description: 'A custom button',
          category: 'interactive',
        });
      });

      expect(breakdown!.name).toBe('MyButton');
      expect(breakdown!.description).toBe('A custom button');
      expect(breakdown!.category).toBe('interactive');
      expect(breakdown!.states.length).toBeGreaterThan(0);
      expect(breakdown!.responsive.length).toBeGreaterThan(0);
    });

    it('should update state', () => {
      const { result } = renderHook(() => useV0ComponentBreakdown());

      expect(result.current.lastBreakdown).toBeNull();
      expect(result.current.breakdowns.length).toBe(0);

      act(() => {
        result.current.generateBreakdown('TestComponent', {});
      });

      expect(result.current.lastBreakdown).not.toBeNull();
      expect(result.current.breakdowns.length).toBe(1);
    });

    it('should call onBreakdownGenerated callback', () => {
      const onBreakdownGenerated = vi.fn();
      const { result } = renderHook(() => useV0ComponentBreakdown({ onBreakdownGenerated }));

      act(() => {
        result.current.generateBreakdown('TestComponent', {});
      });

      expect(onBreakdownGenerated).toHaveBeenCalledTimes(1);
      expect(onBreakdownGenerated).toHaveBeenCalledWith(expect.any(Object), expect.any(String));
    });

    it('should use default category from options', () => {
      const { result } = renderHook(() => useV0ComponentBreakdown({ defaultCategory: 'form' }));

      let breakdown;
      act(() => {
        breakdown = result.current.generateBreakdown('FormInput', {});
      });

      expect(breakdown!.category).toBe('form');
    });
  });

  describe('formatAsMarkdown', () => {
    it('should format breakdown to markdown', () => {
      const { result } = renderHook(() => useV0ComponentBreakdown());

      let breakdown;
      act(() => {
        breakdown = result.current.generateBreakdown('TestButton', {
          description: 'Test button',
        });
      });

      const markdown = result.current.formatAsMarkdown(breakdown!);

      expect(markdown).toContain('# Component: TestButton');
      expect(markdown).toContain('Test button');
    });
  });

  describe('formatAsJSON', () => {
    it('should format breakdown to JSON', () => {
      const { result } = renderHook(() => useV0ComponentBreakdown());

      let breakdown;
      act(() => {
        breakdown = result.current.generateBreakdown('TestComponent', {});
      });

      const json = result.current.formatAsJSON(breakdown!);
      const parsed = JSON.parse(json);

      expect(parsed.name).toBe('TestComponent');
    });
  });

  describe('builder functions', () => {
    it('should create container spec', () => {
      const { result } = renderHook(() => useV0ComponentBreakdown());

      const spec = result.current.createContainerSpec({
        layout: 'grid',
        spacing: 'gap-8',
      });

      expect(spec.layout).toBe('grid');
      expect(spec.spacing).toBe('gap-8');
      // Should have defaults
      expect(spec.padding).toBeDefined();
    });

    it('should create typography spec', () => {
      const { result } = renderHook(() => useV0ComponentBreakdown());

      const spec = result.current.createTypographySpec({
        fontSize: 'text-xl',
        fontWeight: 'font-bold',
      });

      expect(spec.fontSize).toBe('text-xl');
      expect(spec.fontWeight).toBe('font-bold');
    });

    it('should create state spec', () => {
      const { result } = renderHook(() => useV0ComponentBreakdown());

      const spec = result.current.createStateSpec('hover', 'Mouse over element', {
        classes: ['bg-gray-100'],
      });

      expect(spec.name).toBe('hover');
      expect(spec.description).toBe('Mouse over element');
      expect(spec.classes).toContain('bg-gray-100');
    });

    it('should create responsive spec', () => {
      const { result } = renderHook(() => useV0ComponentBreakdown());

      const spec = result.current.createResponsiveSpec('tablet', 'Two column layout', ['Stack cards']);

      expect(spec.breakpoint).toBe('tablet');
      expect(spec.layout).toBe('Two column layout');
      expect(spec.changes).toContain('Stack cards');
      expect(spec.minWidth).toBe('768px');
      expect(spec.maxWidth).toBe('1023px');
    });

    it('should create interaction spec', () => {
      const { result } = renderHook(() => useV0ComponentBreakdown());

      const spec = result.current.createInteractionSpec('click', 'Opens modal', 'Button press animation');

      expect(spec.trigger).toBe('click');
      expect(spec.behavior).toBe('Opens modal');
      expect(spec.feedback).toBe('Button press animation');
    });
  });

  describe('presets access', () => {
    it('should expose all preset functions', () => {
      const { result } = renderHook(() => useV0ComponentBreakdown());

      expect(typeof result.current.getCommonStates).toBe('function');
      expect(typeof result.current.getCommonResponsive).toBe('function');
      expect(typeof result.current.getButtonPreset).toBe('function');
      expect(typeof result.current.getCardPreset).toBe('function');
      expect(typeof result.current.getInputPreset).toBe('function');
      expect(typeof result.current.getModalPreset).toBe('function');
    });

    it('should use presets in generation', () => {
      const { result } = renderHook(() => useV0ComponentBreakdown());

      let breakdown;
      act(() => {
        const buttonPreset = result.current.getButtonPreset();
        breakdown = result.current.generateBreakdown('PrimaryButton', buttonPreset);
      });

      expect(breakdown!.category).toBe('interactive');
      expect(breakdown!.accessibility?.role).toBe('button');
    });
  });
});

describe('integration', () => {
  it('should generate v0-compatible component spec', () => {
    const { result } = renderHook(() => useV0ComponentBreakdown());

    let breakdown;
    act(() => {
      breakdown = result.current.generateBreakdown('UserProfileCard', {
        description: 'Displays user profile information with avatar and details',
        category: 'display',
        container: {
          layout: 'flex flex-col',
          spacing: 'gap-4',
          padding: 'p-6',
          border: 'border border-gray-200',
          borderRadius: 'rounded-xl',
          background: 'bg-white',
          shadow: 'shadow-md',
        },
        typography: {
          fontFamily: 'font-sans',
        },
        states: [
          { name: 'default', description: 'Normal display state' },
          {
            name: 'hover',
            description: 'Interactive hover',
            classes: ['shadow-lg', 'transform', 'scale-[1.02]'],
          },
        ],
        responsive: [
          { breakpoint: 'mobile', layout: 'Stack vertically, centered' },
          { breakpoint: 'desktop', layout: 'Horizontal layout with avatar left' },
        ],
        children: [
          { name: 'Avatar', purpose: 'User profile picture' },
          { name: 'UserInfo', purpose: 'Name and bio' },
          { name: 'ActionButtons', purpose: 'Follow/Message buttons', optional: true },
        ],
      });
    });

    const markdown = result.current.formatAsMarkdown(breakdown!);

    // Should have all required sections
    expect(markdown).toContain('# Component: UserProfileCard');
    expect(markdown).toContain('## Visual Specifications');
    expect(markdown).toContain('## States');
    expect(markdown).toContain('## Responsive Behavior');
    expect(markdown).toContain('## Child Components');

    // Should be properly formatted for v0
    expect(markdown).toContain('rounded-xl');
    expect(markdown).toContain('shadow-md');
    expect(markdown).toContain('Mobile');
    expect(markdown).toContain('Desktop');
  });
});
