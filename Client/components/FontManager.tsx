'use client';
import { createContext, useContext, useState } from 'react';
import {
  Inter,
  Space_Mono,
  Press_Start_2P,
  Roboto_Mono,
  Work_Sans,
} from 'next/font/google';

// Define the available fonts
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const spaceMono = Space_Mono({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-space-mono',
});

const pressStart2P = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-press-start',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
});

const workSans = Work_Sans({
  subsets: ['latin'],
  variable: '--font-work-sans',
});

// Define font options for each style
export const styleFonts = {
  default: {
    heading: 'font-work-sans',
    body: 'font-inter',
  },
  'new-york': {
    heading: 'font-inter',
    body: 'font-inter',
  },
  cyberpunk: {
    heading: 'font-space-mono',
    body: 'font-roboto-mono',
  },
  retro: {
    heading: 'font-press-start',
    body: 'font-press-start',
  },
  glassmorphic: {
    heading: 'font-work-sans',
    body: 'font-inter',
  },
  brutalist: {
    heading: 'font-roboto-mono',
    body: 'font-roboto-mono',
  },
  neumorphic: {
    heading: 'font-work-sans',
    body: 'font-work-sans',
  },
  kawaii: {
    heading: 'font-work-sans',
    body: 'font-work-sans',
  },
  terminal: {
    heading: 'font-space-mono',
    body: 'font-space-mono',
  },
  handdrawn: {
    heading: 'font-work-sans',
    body: 'font-work-sans',
  },
  claymorphic: {
    heading: 'font-work-sans',
    body: 'font-inter',
  },
} as const;

export const fontClasses = {
  'font-inter': inter.variable,
  'font-space-mono': spaceMono.variable,
  'font-press-start': pressStart2P.variable,
  'font-roboto-mono': robotoMono.variable,
  'font-work-sans': workSans.variable,
};

// Types
export type StyleFontConfig = typeof styleFonts;
export type StyleVariant = keyof typeof styleFonts;
export type FontType = 'heading' | 'body';

interface FontContextType {
  currentStyle: StyleVariant;
  setCurrentStyle: (style: StyleVariant) => void;
  getCurrentFonts: () => {
    heading: string;
    body: string;
  };
}

// Create context
const FontContext = createContext<FontContextType | null>(null);

// Font provider component
export function FontProvider({
  children,
  initialStyle = 'default',
}: {
  children: React.ReactNode;
  initialStyle?: StyleVariant;
}) {
  const [currentStyle, setCurrentStyle] = useState<StyleVariant>(initialStyle);

  const getCurrentFonts = () => ({
    heading: styleFonts?.[currentStyle]?.heading,
    body: styleFonts?.[currentStyle]?.body,
  });

  // Include all font variables
  const allFontClasses = Object.values(fontClasses).join(' ');

  return (
    <FontContext.Provider
      value={{ currentStyle, setCurrentStyle, getCurrentFonts }}
    >
      <div className={allFontClasses}>{children}</div>
    </FontContext.Provider>
  );
}

// Hook to use fonts
export function useFonts() {
  const context = useContext(FontContext);
  if (!context) {
    throw new Error('useFonts must be used within a FontProvider');
  }
  return context;
}
