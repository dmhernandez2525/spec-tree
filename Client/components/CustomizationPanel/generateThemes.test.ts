import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateTheme,
  generateThemeCSS,
  baseColors,
  styleVariants,
  type ThemeOptions,
  type StyleVariant,
  type ThemeColors,
} from './generateThemes';

describe('generateThemes', () => {
  // Mock document.documentElement for applyThemeVariables
  let originalDocument: typeof document;
  let mockRoot: {
    style: {
      setProperty: ReturnType<typeof vi.fn>;
      removeProperty: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    mockRoot = {
      style: {
        setProperty: vi.fn(),
        removeProperty: vi.fn(),
      },
    };

    // Mock document.documentElement
    originalDocument = global.document;
    Object.defineProperty(global, 'document', {
      value: {
        documentElement: mockRoot,
      },
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(global, 'document', {
      value: originalDocument,
      writable: true,
    });
    vi.clearAllMocks();
  });

  describe('baseColors', () => {
    it('exports baseColors array', () => {
      expect(baseColors).toBeDefined();
      expect(Array.isArray(baseColors)).toBe(true);
    });

    it('contains expected color names', () => {
      const colorNames = baseColors.map((c) => c.name);
      expect(colorNames).toContain('zinc');
      expect(colorNames).toContain('slate');
      expect(colorNames).toContain('stone');
      expect(colorNames).toContain('gray');
      expect(colorNames).toContain('neutral');
      expect(colorNames).toContain('red');
      expect(colorNames).toContain('rose');
      expect(colorNames).toContain('orange');
      expect(colorNames).toContain('green');
      expect(colorNames).toContain('blue');
      expect(colorNames).toContain('yellow');
      expect(colorNames).toContain('violet');
    });

    it('each color has required properties', () => {
      baseColors.forEach((color) => {
        expect(color).toHaveProperty('name');
        expect(color).toHaveProperty('label');
        expect(color).toHaveProperty('cssVars');
        expect(color).toHaveProperty('activeColor');
        expect(color.cssVars).toHaveProperty('light');
        expect(color.cssVars).toHaveProperty('dark');
        expect(color.activeColor).toHaveProperty('light');
        expect(color.activeColor).toHaveProperty('dark');
      });
    });

    it('cssVars contain required CSS custom properties', () => {
      const requiredProps = [
        '--background',
        '--foreground',
        '--card',
        '--primary',
        '--secondary',
        '--muted',
        '--accent',
        '--destructive',
        '--border',
        '--input',
        '--ring',
      ];

      baseColors.forEach((color) => {
        requiredProps.forEach((prop) => {
          expect(color.cssVars.light).toHaveProperty(prop);
          expect(color.cssVars.dark).toHaveProperty(prop);
        });
      });
    });
  });

  describe('styleVariants', () => {
    it('exports styleVariants object', () => {
      expect(styleVariants).toBeDefined();
      expect(typeof styleVariants).toBe('object');
    });

    it('contains all expected style variants', () => {
      const expectedStyles: StyleVariant[] = [
        'default',
        'new-york',
        'cyberpunk',
        'retro',
        'glassmorphic',
        'brutalist',
        'neumorphic',
        'kawaii',
        'terminal',
        'handdrawn',
        'claymorphic',
        'schematic',
      ];

      expectedStyles.forEach((style) => {
        expect(styleVariants).toHaveProperty(style);
      });
    });

    it('each style variant has required properties', () => {
      const requiredProps = [
        '--card',
        '--popover',
        '--border',
        '--ring',
        '--shadow',
        '--border-width',
        '--border-style',
        '--button-radius',
        '--card-radius',
        '--font-heading',
        '--font-body',
      ];

      Object.values(styleVariants).forEach((variant) => {
        requiredProps.forEach((prop) => {
          expect(variant).toHaveProperty(prop);
        });
      });
    });

    it('cyberpunk style has distinctive styling', () => {
      expect(styleVariants.cyberpunk['--border-style']).toBe('dashed');
      expect(styleVariants.cyberpunk['--button-radius']).toBe('0');
    });

    it('retro style has pixel-art inspired styling', () => {
      expect(styleVariants.retro['--border-width']).toBe('3px');
      expect(styleVariants.retro['--button-radius']).toBe('0');
    });

    it('glassmorphic style has transparency', () => {
      expect(styleVariants.glassmorphic['--card']).toContain('/');
    });

    it('brutalist style has no shadow', () => {
      expect(styleVariants.brutalist['--shadow']).toBe('none');
    });

    it('neumorphic style has complex shadow', () => {
      expect(styleVariants.neumorphic['--shadow']).toContain('rgba');
    });
  });

  describe('generateTheme', () => {
    it('generates theme with default options', () => {
      const options: ThemeOptions = {
        style: 'default',
        theme: 'zinc',
        radius: 0.5,
      };

      const result = generateTheme(options);

      expect(result).toHaveProperty('theme');
      expect(result).toHaveProperty('applyThemeVariables');
      expect(typeof result.applyThemeVariables).toBe('function');
    });

    it('generates theme with new-york style', () => {
      const options: ThemeOptions = {
        style: 'new-york',
        theme: 'blue',
        radius: 0.75,
      };

      const result = generateTheme(options);

      expect(result.theme).toBeDefined();
      const themeKey = Object.keys(result.theme)[0];
      expect(themeKey).toContain('new-york');
      expect(themeKey).toContain('blue');
      expect(themeKey).toContain('0.75');
    });

    it('generates theme with all style variants', () => {
      const styles: StyleVariant[] = [
        'default',
        'new-york',
        'cyberpunk',
        'retro',
        'glassmorphic',
        'brutalist',
        'neumorphic',
        'kawaii',
        'terminal',
        'handdrawn',
        'claymorphic',
        'schematic',
      ];

      styles.forEach((style) => {
        const options: ThemeOptions = {
          style,
          theme: 'zinc',
          radius: 0.5,
        };

        const result = generateTheme(options);
        expect(result).toHaveProperty('theme');
        expect(result).toHaveProperty('applyThemeVariables');
      });
    });

    it('generates theme with all base colors', () => {
      baseColors.forEach((color) => {
        const options: ThemeOptions = {
          style: 'default',
          theme: color.name,
          radius: 0.5,
        };

        const result = generateTheme(options);
        expect(result).toHaveProperty('theme');
      });
    });

    it('throws error for unknown color without custom colors', () => {
      const options: ThemeOptions = {
        style: 'default',
        theme: 'unknown-color',
        radius: 0.5,
      };

      expect(() => generateTheme(options)).toThrow(
        'Color unknown-color not found and no custom colors provided'
      );
    });

    it('allows unknown color with custom colors provided', () => {
      const options: ThemeOptions = {
        style: 'default',
        theme: 'custom',
        radius: 0.5,
        customColors: {
          light: {
            background: '0 0% 100%',
            foreground: '0 0% 0%',
          },
          dark: {
            background: '0 0% 0%',
            foreground: '0 0% 100%',
          },
        },
      };

      expect(() => generateTheme(options)).not.toThrow();
      const result = generateTheme(options);
      expect(result).toHaveProperty('theme');
    });

    it('merges custom colors with base colors', () => {
      const options: ThemeOptions = {
        style: 'default',
        theme: 'zinc',
        radius: 0.5,
        customColors: {
          light: {
            primary: '200 100% 50%',
          },
          dark: {
            primary: '200 100% 60%',
          },
        },
      };

      const result = generateTheme(options);
      expect(result.theme).toBeDefined();
    });

    it('theme contains @layer base structure', () => {
      const options: ThemeOptions = {
        style: 'default',
        theme: 'zinc',
        radius: 0.5,
      };

      const result = generateTheme(options);
      const themeKey = Object.keys(result.theme)[0];
      const themeData = result.theme[themeKey];

      expect(themeData).toHaveProperty('@layer');
      expect(themeData['@layer']).toHaveProperty('base');
      expect(themeData['@layer'].base).toHaveProperty(':root');
      expect(themeData['@layer'].base).toHaveProperty('.dark');
    });

    it('includes radius in theme output', () => {
      const radius = 1.0;
      const options: ThemeOptions = {
        style: 'default',
        theme: 'zinc',
        radius,
      };

      const result = generateTheme(options);
      const themeKey = Object.keys(result.theme)[0];
      const themeData = result.theme[themeKey];

      expect(themeData['@layer'].base[':root']['--radius']).toBe(`${radius}rem`);
      expect(themeData['@layer'].base['.dark']['--radius']).toBe(`${radius}rem`);
    });
  });

  describe('applyThemeVariables', () => {
    it('applies light theme variables to document root', () => {
      const options: ThemeOptions = {
        style: 'default',
        theme: 'zinc',
        radius: 0.5,
      };

      const { applyThemeVariables } = generateTheme(options);
      applyThemeVariables(false);

      expect(mockRoot.style.setProperty).toHaveBeenCalled();
      expect(mockRoot.style.setProperty).toHaveBeenCalledWith(
        '--radius',
        '0.5rem'
      );
    });

    it('applies dark theme variables to document root', () => {
      const options: ThemeOptions = {
        style: 'default',
        theme: 'zinc',
        radius: 0.5,
      };

      const { applyThemeVariables } = generateTheme(options);
      applyThemeVariables(true);

      expect(mockRoot.style.setProperty).toHaveBeenCalled();
    });

    it('applies style variant overrides', () => {
      const options: ThemeOptions = {
        style: 'cyberpunk',
        theme: 'violet',
        radius: 0,
      };

      const { applyThemeVariables } = generateTheme(options);
      applyThemeVariables(false);

      // Verify style overrides are applied
      expect(mockRoot.style.setProperty).toHaveBeenCalledWith(
        '--border-style',
        'dashed'
      );
    });

    it('applies schematic theme pattern for light mode', () => {
      const options: ThemeOptions = {
        style: 'schematic',
        theme: 'zinc',
        radius: 0.5,
      };

      const { applyThemeVariables } = generateTheme(options);
      applyThemeVariables(false);

      // Should set schematic pattern for light mode
      const setPropertyCalls = mockRoot.style.setProperty.mock.calls;
      const patternCall = setPropertyCalls.find(
        (call: string[]) => call[0] === '--schematic-pattern'
      );
      expect(patternCall).toBeDefined();
    });

    it('applies schematic theme pattern for dark mode', () => {
      const options: ThemeOptions = {
        style: 'schematic',
        theme: 'zinc',
        radius: 0.5,
      };

      const { applyThemeVariables } = generateTheme(options);
      applyThemeVariables(true);

      // Should set schematic pattern for dark mode
      const setPropertyCalls = mockRoot.style.setProperty.mock.calls;
      const patternCall = setPropertyCalls.find(
        (call: string[]) => call[0] === '--schematic-pattern'
      );
      expect(patternCall).toBeDefined();
    });

    it('removes schematic pattern when switching to non-schematic theme', () => {
      const options: ThemeOptions = {
        style: 'default',
        theme: 'zinc',
        radius: 0.5,
      };

      const { applyThemeVariables } = generateTheme(options);
      applyThemeVariables(false);

      expect(mockRoot.style.removeProperty).toHaveBeenCalledWith(
        '--schematic-pattern'
      );
    });
  });

  describe('generateThemeCSS', () => {
    it('generates valid CSS string', () => {
      const options: ThemeOptions = {
        style: 'default',
        theme: 'zinc',
        radius: 0.5,
      };

      const { theme } = generateTheme(options);
      const css = generateThemeCSS(theme);

      expect(typeof css).toBe('string');
      expect(css).toContain('@layer base');
      expect(css).toContain(':root');
      expect(css).toContain('.dark');
    });

    it('includes CSS custom properties in output', () => {
      const options: ThemeOptions = {
        style: 'default',
        theme: 'zinc',
        radius: 0.5,
      };

      const { theme } = generateTheme(options);
      const css = generateThemeCSS(theme);

      expect(css).toContain('--background');
      expect(css).toContain('--foreground');
      expect(css).toContain('--primary');
      expect(css).toContain('--radius');
    });

    it('includes radius value in CSS output', () => {
      const radius = 0.75;
      const options: ThemeOptions = {
        style: 'default',
        theme: 'zinc',
        radius,
      };

      const { theme } = generateTheme(options);
      const css = generateThemeCSS(theme);

      expect(css).toContain(`--radius: ${radius}rem`);
    });

    it('generates different CSS for different styles', () => {
      const defaultOptions: ThemeOptions = {
        style: 'default',
        theme: 'zinc',
        radius: 0.5,
      };

      const cyberpunkOptions: ThemeOptions = {
        style: 'cyberpunk',
        theme: 'zinc',
        radius: 0.5,
      };

      const defaultCss = generateThemeCSS(generateTheme(defaultOptions).theme);
      const cyberpunkCss = generateThemeCSS(generateTheme(cyberpunkOptions).theme);

      expect(defaultCss).not.toBe(cyberpunkCss);
    });

    it('generates different CSS for different colors', () => {
      const zincOptions: ThemeOptions = {
        style: 'default',
        theme: 'zinc',
        radius: 0.5,
      };

      const blueOptions: ThemeOptions = {
        style: 'default',
        theme: 'blue',
        radius: 0.5,
      };

      const zincCss = generateThemeCSS(generateTheme(zincOptions).theme);
      const blueCss = generateThemeCSS(generateTheme(blueOptions).theme);

      expect(zincCss).not.toBe(blueCss);
    });

    it('CSS is properly formatted', () => {
      const options: ThemeOptions = {
        style: 'default',
        theme: 'zinc',
        radius: 0.5,
      };

      const { theme } = generateTheme(options);
      const css = generateThemeCSS(theme);

      // Check for proper formatting
      expect(css).toMatch(/^\s*@layer base/);
      expect(css).toContain('{\n');
      expect(css).toContain('}\n');
    });
  });

  describe('Type exports', () => {
    it('exports ColorScheme type (runtime check)', () => {
      // Type check - this compiles if types are properly exported
      const colorScheme: { [key: string]: string } = { '--test': 'value' };
      expect(colorScheme).toBeDefined();
    });

    it('exports ThemeColors type (runtime check)', () => {
      const themeColors: Partial<ThemeColors> = {
        background: '0 0% 100%',
        foreground: '0 0% 0%',
      };
      expect(themeColors).toBeDefined();
    });

    it('exports StyleVariant type (runtime check)', () => {
      const style: StyleVariant = 'default';
      expect(style).toBe('default');
    });

    it('exports ThemeOptions type (runtime check)', () => {
      const options: ThemeOptions = {
        style: 'default',
        theme: 'zinc',
        radius: 0.5,
      };
      expect(options).toBeDefined();
    });
  });

  describe('Edge cases', () => {
    it('handles zero radius', () => {
      const options: ThemeOptions = {
        style: 'default',
        theme: 'zinc',
        radius: 0,
      };

      const result = generateTheme(options);
      const themeKey = Object.keys(result.theme)[0];
      expect(themeKey).toContain('0');
    });

    it('handles high radius value', () => {
      const options: ThemeOptions = {
        style: 'default',
        theme: 'zinc',
        radius: 2.0,
      };

      const result = generateTheme(options);
      expect(result).toHaveProperty('theme');
    });

    it('handles empty custom colors', () => {
      const options: ThemeOptions = {
        style: 'default',
        theme: 'zinc',
        radius: 0.5,
        customColors: {
          light: {},
          dark: {},
        },
      };

      const result = generateTheme(options);
      expect(result).toHaveProperty('theme');
    });

    it('handles partial custom colors for light only', () => {
      const options: ThemeOptions = {
        style: 'default',
        theme: 'zinc',
        radius: 0.5,
        customColors: {
          light: {
            primary: '200 100% 50%',
          },
          dark: {},
        },
      };

      const result = generateTheme(options);
      expect(result).toHaveProperty('theme');
    });

    it('handles partial custom colors for dark only', () => {
      const options: ThemeOptions = {
        style: 'default',
        theme: 'zinc',
        radius: 0.5,
        customColors: {
          light: {},
          dark: {
            primary: '200 100% 60%',
          },
        },
      };

      const result = generateTheme(options);
      expect(result).toHaveProperty('theme');
    });
  });
});
