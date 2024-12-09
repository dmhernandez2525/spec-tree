export type ColorScheme = {
  [key: string]: string;
};

export type ThemeColors = {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
};

export type BaseColor = {
  name: string;
  label: string;
  cssVars: {
    light: ColorScheme;
    dark: ColorScheme;
  };
  activeColor: {
    light: string;
    dark: string;
  };
};

export type StyleVariant =
  | 'default'
  | 'new-york'
  | 'cyberpunk'
  | 'retro'
  | 'glassmorphic'
  | 'brutalist'
  | 'neumorphic'
  | 'kawaii'
  | 'terminal'
  | 'handdrawn'
  | 'claymorphic'
  | 'schematic';

export type ThemeOptions = {
  style: StyleVariant;
  theme: string;
  radius: number;
  customColors?: Partial<{
    light: Partial<ThemeColors>;
    dark: Partial<ThemeColors>;
  }>;
};

const hsl = (hue: number, saturation: number, lightness: number): string =>
  `${hue} ${saturation}% ${lightness}%`;

// Helper function to convert ThemeColors to CSS Variables format
const themeColorsToCssVars = (colors: Partial<ThemeColors>): ColorScheme => {
  const mapping: Record<keyof ThemeColors, string> = {
    background: '--background',
    foreground: '--foreground',
    card: '--card',
    cardForeground: '--card-foreground',
    popover: '--popover',
    popoverForeground: '--popover-foreground',
    primary: '--primary',
    primaryForeground: '--primary-foreground',
    secondary: '--secondary',
    secondaryForeground: '--secondary-foreground',
    muted: '--muted',
    mutedForeground: '--muted-foreground',
    accent: '--accent',
    accentForeground: '--accent-foreground',
    destructive: '--destructive',
    destructiveForeground: '--destructive-foreground',
    border: '--border',
    input: '--input',
    ring: '--ring',
  };

  return Object.entries(colors).reduce((vars, [key, value]) => {
    const cssVarName = mapping[key as keyof ThemeColors];
    if (cssVarName) {
      vars[cssVarName] = value;
    }
    return vars;
  }, {} as ColorScheme);
};

const createColorVariants = (
  hue: number,
  baseSaturation: number
): BaseColor['cssVars'] => ({
  light: {
    '--background': hsl(hue, baseSaturation * 0.05, 100),
    '--foreground': hsl(hue, baseSaturation * 0.85, 3.9),
    '--card': hsl(hue, 0, 100),
    '--card-foreground': hsl(hue, baseSaturation * 0.85, 3.9),
    '--popover': hsl(hue, 0, 100),
    '--popover-foreground': hsl(hue, baseSaturation * 0.85, 3.9),
    '--primary': hsl(hue, baseSaturation, 45),
    '--primary-foreground': hsl(hue, baseSaturation * 0.85, 98),
    '--secondary': hsl(hue, baseSaturation * 0.7, 85),
    '--secondary-foreground': hsl(hue, baseSaturation * 0.75, 10),
    '--muted': hsl(hue, baseSaturation * 0.7, 95.9),
    '--muted-foreground': hsl(hue, baseSaturation * 0.5, 46.1),
    '--accent': hsl(hue, baseSaturation * 0.7, 95.9),
    '--accent-foreground': hsl(hue, baseSaturation * 0.75, 10),
    '--destructive': '0 84.2% 60.2%',
    '--destructive-foreground': '0 0% 98%',
    '--border': hsl(hue, baseSaturation * 0.7, 90),
    '--input': hsl(hue, baseSaturation * 0.7, 90),
    '--ring': hsl(hue, baseSaturation, 45),
    '--chart-1': '12 76% 61%',
    '--chart-2': '173 58% 39%',
    '--chart-3': '197 37% 24%',
    '--chart-4': '43 74% 66%',
    '--chart-5': '27 87% 67%',
  },
  dark: {
    '--background': hsl(hue, baseSaturation * 0.75, 3.9),
    '--foreground': hsl(hue, 0, 98),
    '--card': hsl(hue, baseSaturation * 0.75, 3.9),
    '--card-foreground': hsl(hue, 0, 98),
    '--popover': hsl(hue, baseSaturation * 0.75, 3.9),
    '--popover-foreground': hsl(hue, 0, 98),
    '--primary': hsl(hue, baseSaturation, 55),
    '--primary-foreground': hsl(hue, baseSaturation * 0.75, 10),
    '--secondary': hsl(hue, baseSaturation * 0.65, 35),
    '--secondary-foreground': hsl(hue, 0, 98),
    '--muted': hsl(hue, baseSaturation * 0.65, 15.9),
    '--muted-foreground': hsl(hue, baseSaturation * 0.5, 64.9),
    '--accent': hsl(hue, baseSaturation * 0.65, 15.9),
    '--accent-foreground': hsl(hue, 0, 98),
    '--destructive': '0 62.8% 30.6%',
    '--destructive-foreground': '0 0% 98%',
    '--border': hsl(hue, baseSaturation * 0.65, 15.9),
    '--input': hsl(hue, baseSaturation * 0.65, 15.9),
    '--ring': hsl(hue, baseSaturation, 55),
    '--chart-1': '220 70% 50%',
    '--chart-2': '160 60% 45%',
    '--chart-3': '30 80% 55%',
    '--chart-4': '280 65% 60%',
    '--chart-5': '340 75% 55%',
  },
});

// Base colors with adjusted saturation and lightness values
export const baseColors: BaseColor[] = [
  {
    name: 'zinc',
    label: 'Zinc',
    cssVars: createColorVariants(240, 10),
    activeColor: {
      light: '240 5.9% 10%',
      dark: '240 5.9% 90%',
    },
  },
  {
    name: 'slate',
    label: 'Slate',
    cssVars: createColorVariants(215, 20),
    activeColor: {
      light: '215 20% 65%',
      dark: '215 20% 65%',
    },
  },
  {
    name: 'stone',
    label: 'Stone',
    cssVars: createColorVariants(20, 15),
    activeColor: {
      light: '20 15% 65%',
      dark: '20 15% 65%',
    },
  },
  {
    name: 'gray',
    label: 'Gray',
    cssVars: createColorVariants(220, 10),
    activeColor: {
      light: '220 10% 65%',
      dark: '220 10% 65%',
    },
  },
  {
    name: 'neutral',
    label: 'Neutral',
    cssVars: createColorVariants(0, 0),
    activeColor: {
      light: '0 0% 50%',
      dark: '0 0% 50%',
    },
  },
  {
    name: 'red',
    label: 'Red',
    cssVars: createColorVariants(0, 75),
    activeColor: {
      light: '0 75% 50%',
      dark: '0 75% 50%',
    },
  },
  {
    name: 'rose',
    label: 'Rose',
    cssVars: createColorVariants(340, 75),
    activeColor: {
      light: '340 75% 50%',
      dark: '340 75% 50%',
    },
  },
  {
    name: 'orange',
    label: 'Orange',
    cssVars: createColorVariants(25, 75),
    activeColor: {
      light: '25 75% 50%',
      dark: '25 75% 50%',
    },
  },
  {
    name: 'green',
    label: 'Green',
    cssVars: createColorVariants(142, 75),
    activeColor: {
      light: '142 75% 50%',
      dark: '142 75% 50%',
    },
  },
  {
    name: 'blue',
    label: 'Blue',
    cssVars: createColorVariants(220, 75),
    activeColor: {
      light: '220 75% 50%',
      dark: '220 75% 50%',
    },
  },
  {
    name: 'yellow',
    label: 'Yellow',
    cssVars: createColorVariants(48, 75),
    activeColor: {
      light: '48 75% 50%',
      dark: '48 75% 50%',
    },
  },
  {
    name: 'violet',
    label: 'Violet',
    cssVars: createColorVariants(270, 75),
    activeColor: {
      light: '270 75% 50%',
      dark: '270 75% 50%',
    },
  },
];

export const styleVariants = {
  default: {
    '--card': '0 0% 100%',
    '--popover': '0 0% 100%',
    '--border': '240 5.9% 90%',
    '--ring': '240 5.9% 10%',
    '--shadow': '0 1px 3px rgba(0,0,0,0.12)',
    '--border-width': '1px',
    '--border-style': 'solid',
    '--button-radius': 'var(--radius)',
    '--card-radius': 'var(--radius)',
    '--font-heading': 'var(--font-work-sans)',
    '--font-body': 'var(--font-inter)',
  },
  'new-york': {
    '--card': '10 10% 98%',
    '--popover': '10 10% 98%',
    '--border': '240 5% 85%',
    '--ring': '222.2 84% 15%',
    '--shadow': '0 2px 4px rgba(0,0,0,0.08)',
    '--border-width': '1px',
    '--border-style': 'solid',
    '--button-radius': 'var(--radius)',
    '--card-radius': 'var(--radius)',
    '--font-heading': 'var(--font-inter)',
    '--font-body': 'var(--font-inter)',
  },
  cyberpunk: {
    '--card': '0 0% 100%',
    '--popover': '0 0% 100%',
    '--border': '286 100% 65%',
    '--ring': '320 100% 65%',
    '--shadow': '0 0 10px rgba(255,0,255,0.3), 0 0 20px rgba(0,255,255,0.2)',
    '--border-width': '2px',
    '--border-style': 'dashed',
    '--button-radius': '0',
    '--card-radius': '0 var(--radius) 0 var(--radius)',
    '--font-heading': 'var(--font-space-mono)',
    '--font-body': 'var(--font-roboto-mono)',
  },
  retro: {
    '--card': '48 20% 95%',
    '--popover': '48 20% 95%',
    '--border': '30 20% 50%',
    '--ring': '30 30% 50%',
    '--shadow': '4px 4px 0 rgba(0,0,0,0.85)',
    '--border-width': '3px',
    '--border-style': 'solid',
    '--button-radius': '0',
    '--card-radius': '0',
    '--font-heading': 'var(--font-press-start)',
    '--font-body': 'var(--font-press-start)',
  },
  glassmorphic: {
    '--card': '0 0% 100% / 0.1',
    '--popover': '0 0% 100% / 0.1',
    '--border': '0 0% 100% / 0.1',
    '--ring': '0 0% 100% / 0.5',
    '--shadow': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    '--border-width': '1px',
    '--border-style': 'solid',
    '--button-radius': 'calc(var(--radius) * 2)',
    '--card-radius': 'calc(var(--radius) * 2)',
    '--font-heading': 'var(--font-work-sans)',
    '--font-body': 'var(--font-inter)',
  },
  brutalist: {
    '--card': '0 0% 100%',
    '--popover': '0 0% 100%',
    '--border': '240 5.9% 90%',
    '--ring': '240 5.9% 10%',
    '--shadow': 'none',
    '--border-width': '4px',
    '--border-style': 'solid',
    '--button-radius': '0',
    '--card-radius': '0',
    '--font-heading': 'var(--font-roboto-mono)',
    '--font-body': 'var(--font-roboto-mono)',
  },

  neumorphic: {
    '--card': '0 0% 95%',
    '--popover': '0 0% 95%',
    '--border': '0 0% 90%',
    '--ring': '0 0% 80%',
    '--shadow':
      '6px 6px 12px rgba(0,0,0,0.2), -6px -6px 12px rgba(255,255,255,0.7)',
    '--border-width': '0',
    '--border-style': 'solid',
    '--button-radius': 'calc(var(--radius) * 2)',
    '--card-radius': 'calc(var(--radius) * 2)',
    '--font-heading': 'var(--font-work-sans)',
    '--font-body': 'var(--font-work-sans)',
  },

  kawaii: {
    '--card': '0 0% 100%',
    '--popover': '0 0% 100%',
    '--border': 'var(--primary)',
    '--ring': 'var(--primary)',
    '--shadow': '8px 8px 0 rgba(0,0,0,0.1)',
    '--border-width': '4px',
    '--border-style': 'solid',
    '--button-radius': '9999px',
    '--card-radius': '2rem',
    '--font-heading': 'var(--font-work-sans)',
    '--font-body': 'var(--font-work-sans)',
  },

  terminal: {
    '--card': '0 0% 10%',
    '--popover': '0 0% 10%',
    '--border': 'var(--primary)',
    '--ring': 'var(--primary)',
    '--shadow': '0 0 20px var(--primary)',
    '--border-width': '1px',
    '--border-style': 'solid',
    '--button-radius': '0',
    '--card-radius': '0',
    '--font-heading': 'var(--font-space-mono)',
    '--font-body': 'var(--font-space-mono)',
  },

  handdrawn: {
    '--card': '0 0% 100%',
    '--popover': '0 0% 100%',
    '--border': 'var(--primary)',
    '--ring': 'var(--primary)',
    '--shadow': 'none',
    '--border-width': '2px',
    '--border-style': 'solid',
    '--button-radius': '0.5rem',
    '--card-radius': '0.5rem',
    '--font-heading': 'var(--font-work-sans)',
    '--font-body': 'var(--font-work-sans)',
  },

  claymorphic: {
    '--card': '0 0% 100%',
    '--popover': '0 0% 100%',
    '--border': 'transparent',
    '--ring': 'var(--primary)',
    '--shadow':
      '0 8px 0 0 hsl(var(--card)/0.5), 0 16px 0 0 hsl(var(--card)/0.3), 0 24px 0 0 hsl(var(--card)/0.1)',
    '--border-width': '0',
    '--border-style': 'solid',
    '--button-radius': 'calc(var(--radius) * 1.5)',
    '--card-radius': 'calc(var(--radius) * 1.5)',
    '--font-heading': 'var(--font-work-sans)',
    '--font-body': 'var(--font-inter)',
  },

  schematic: {
    '--card': '220 15% 12%',
    '--popover': '220 15% 12%',
    '--border': '220 10% 30%',
    '--ring': '210 90% 50%',
    '--shadow': '0 4px 12px hsla(210,15%,8%,0.2)',
    '--border-width': '1px',
    '--border-style': 'solid',
    '--button-radius': 'calc(var(--radius) * 1.25)',
    '--card-radius': 'calc(var(--radius) * 1.25)',
    '--font-heading': 'var(--font-work-sans)',
    '--font-body': 'var(--font-inter)',
  },
} as const;
// Generate complete theme with all necessary CSS variables
export function generateTheme({
  style,
  theme: colorName,
  radius,
  customColors,
}: ThemeOptions) {
  const baseColor = baseColors.find((c) => c.name === colorName);
  if (!baseColor && !customColors) {
    throw new Error(
      `Color ${colorName} not found and no custom colors provided`
    );
  }

  const styleOverrides = styleVariants[style];

  // Merge base colors with custom colors if provided
  const lightVars = {
    ...(baseColor?.cssVars.light || {}),
    ...(customColors?.light ? themeColorsToCssVars(customColors.light) : {}),
  };

  const darkVars = {
    ...(baseColor?.cssVars.dark || {}),
    ...(customColors?.dark ? themeColorsToCssVars(customColors.dark) : {}),
  };

  // Create a function to apply CSS variables to the document root
  const applyThemeVariables = (isDark: boolean = false) => {
    const variables = isDark ? darkVars : lightVars;
    const root = document.documentElement;

    // Apply color variables
    Object.entries(variables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Apply style variant variables
    if (styleOverrides) {
      Object.entries(styleOverrides).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }

    // Apply radius
    root.style.setProperty('--radius', `${radius}rem`);

    // For the schematic theme, let's add a subtle schematic pattern as a background overlay.
    if (style === 'schematic') {
      // The schematic theme: Adding a subtle schematic grid pattern using CSS masks or background images.
      // We'll define a pattern that looks like grid lines, subtle and modern.
      // We'll apply this pattern to the :root and .dark selectors.
      // Since we cannot use placeholders, we directly define the pattern here.

      const patternDataLight = `
        background-image:
          linear-gradient(to right, hsla(0,0%,100%,0.05) 1px, transparent 1px),
          linear-gradient(to bottom, hsla(0,0%,100%,0.05) 1px, transparent 1px);
        background-size: 20px 20px;
      `;
      const patternDataDark = `
        background-image:
          linear-gradient(to right, hsla(0,0%,100%,0.02) 1px, transparent 1px),
          linear-gradient(to bottom, hsla(0,0%,100%,0.02) 1px, transparent 1px);
        background-size: 20px 20px;
      `;

      // If we are applying for light mode:
      if (!isDark) {
        root.style.setProperty('--schematic-pattern', patternDataLight);
      } else {
        root.style.setProperty('--schematic-pattern', patternDataDark);
      }

      // The pattern will be applied globally using these variables
    } else {
      // Clear pattern if switching themes
      const root = document.documentElement;
      root.style.removeProperty('--schematic-pattern');
    }
  };

  return {
    theme: {
      [`${style}-${colorName}-${radius}`]: {
        '@layer': {
          base: {
            ':root': {
              ...lightVars,
              ...styleOverrides,
              '--radius': `${radius}rem`,
            },
            '.dark': {
              ...darkVars,
              '--radius': `${radius}rem`,
            },
          },
        },
      },
    },
    applyThemeVariables,
  };
}

// Generate CSS string for the theme
export function generateThemeCSS(
  theme: ReturnType<typeof generateTheme>['theme']
): string {
  const themeKey = Object.keys(theme)[0];
  const themeData = theme[themeKey]['@layer'].base;

  return `
@layer base {
  :root {
${Object.entries(themeData[':root'])
  .map(([key, value]) => `    ${key}: ${value};`)
  .join('\n')}
  }

  .dark {
${Object.entries(themeData['.dark'])
  .map(([key, value]) => `    ${key}: ${value};`)
  .join('\n')}
  }
}
`.trim();
}
