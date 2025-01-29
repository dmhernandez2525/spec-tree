// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import ExportManager from './ExportManager';

// Color token sections
const initialColorTokens = {
  base: [
    {
      name: 'accent',
      light: 'colors/accent-light',
      dark: 'colors/accent-dark',
    },
    {
      name: 'accent-foreground',
      light: 'colors/accent-foreground-light',
      dark: 'colors/accent-foreground-dark',
    },
    {
      name: 'background',
      light: 'colors/background-light',
      dark: 'colors/background-dark',
    },
    {
      name: 'border',
      light: 'colors/border-light',
      dark: 'colors/border-dark',
    },
    { name: 'card', light: 'colors/card-light', dark: 'colors/card-dark' },
    {
      name: 'card-foreground',
      light: 'colors/card-foreground-light',
      dark: 'colors/card-foreground-dark',
    },
    {
      name: 'destructive',
      light: 'colors/destructive-light',
      dark: 'colors/destructive-dark',
    },
    {
      name: 'destructive-foreground',
      light: 'colors/destructive-foreground-light',
      dark: 'colors/destructive-foreground-dark',
    },
    {
      name: 'foreground',
      light: 'colors/foreground-light',
      dark: 'colors/foreground-dark',
    },
    { name: 'input', light: 'colors/input-light', dark: 'colors/input-dark' },
    { name: 'muted', light: 'colors/muted-light', dark: 'colors/muted-dark' },
    {
      name: 'muted-foreground',
      light: 'colors/muted-foreground-light',
      dark: 'colors/muted-foreground-dark',
    },
    {
      name: 'popover',
      light: 'colors/popover-light',
      dark: 'colors/popover-dark',
    },
    {
      name: 'popover-foreground',
      light: 'colors/popover-foreground-light',
      dark: 'colors/popover-foreground-dark',
    },
    {
      name: 'primary',
      light: 'colors/primary-light',
      dark: 'colors/primary-dark',
    },
    {
      name: 'primary-foreground',
      light: 'colors/primary-foreground-light',
      dark: 'colors/primary-foreground-dark',
    },
  ],
  alpha: [
    { name: '10', light: 'FFFFFF', dark: '090909', opacity: '90%' },
    { name: '20', light: 'FFFFFF', dark: '090909', opacity: '80%' },
    { name: '30', light: 'FFFFFF', dark: '090909', opacity: '70%' },
    { name: '40', light: 'FFFFFF', dark: '090909', opacity: '60%' },
    { name: '50', light: 'FFFFFF', dark: '090909', opacity: '50%' },
    { name: '60', light: 'FFFFFF', dark: '090909', opacity: '40%' },
    { name: '70', light: 'FFFFFF', dark: '090909', opacity: '30%' },
    { name: '80', light: 'FFFFFF', dark: '090909', opacity: '20%' },
    { name: '90', light: 'FFFFFF', dark: '090909', opacity: '10%' },
  ],
  charts: [
    {
      name: 'chart-1',
      light: 'colors/chart-1-light',
      dark: 'colors/chart-1-dark',
    },
    {
      name: 'chart-2',
      light: 'colors/chart-2-light',
      dark: 'colors/chart-2-dark',
    },
    {
      name: 'chart-3',
      light: 'colors/chart-3-light',
      dark: 'colors/chart-3-dark',
    },
    {
      name: 'chart-4',
      light: 'colors/chart-4-light',
      dark: 'colors/chart-4-dark',
    },
    {
      name: 'chart-5',
      light: 'colors/chart-5-light',
      dark: 'colors/chart-5-dark',
    },
  ],
  sidebar: [
    {
      name: 'sidebar-background',
      light: 'colors/sidebar-background-light',
      dark: 'colors/sidebar-background-dark',
    },
    {
      name: 'sidebar-foreground',
      light: 'colors/sidebar-foreground-light',
      dark: 'colors/sidebar-foreground-dark',
    },
    {
      name: 'sidebar-primary',
      light: 'colors/sidebar-primary-light',
      dark: 'colors/sidebar-primary-dark',
    },
    {
      name: 'sidebar-primary-foreground',
      light: 'colors/sidebar-primary-foreground-light',
      dark: 'colors/sidebar-primary-foreground-dark',
    },
    {
      name: 'sidebar-accent',
      light: 'colors/sidebar-accent-light',
      dark: 'colors/sidebar-accent-dark',
    },
    {
      name: 'sidebar-accent-foreground',
      light: 'colors/sidebar-accent-foreground-light',
      dark: 'colors/sidebar-accent-foreground-dark',
    },
    {
      name: 'sidebar-border',
      light: 'colors/sidebar-border-light',
      dark: 'colors/sidebar-border-dark',
    },
    {
      name: 'sidebar-ring',
      light: 'colors/sidebar-ring-light',
      dark: 'colors/sidebar-ring-dark',
    },
  ],
  utility: [
    { name: 'ring', light: 'colors/ring-light', dark: 'colors/ring-dark' },
    {
      name: 'ring-offset',
      light: 'tailwind colors/base/white',
      dark: 'tailwind colors/base/white',
    },
    {
      name: 'secondary',
      light: 'colors/secondary-light',
      dark: 'colors/secondary-dark',
    },
    {
      name: 'secondary-foreground',
      light: 'colors/secondary-foreground-light',
      dark: 'colors/secondary-foreground-dark',
    },
  ],
};

// Typography token sections
const initialTypographyTokens = {
  fontFamily: {
    sans: { value: 'Inter', weights: ['400', '500', '600', '700'] },
    serif: { value: 'Merriweather', weights: ['400', '700'] },
    mono: { value: 'JetBrains Mono', weights: ['400', '500', '700'] },
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
};

// Additional token sections (with deviation flags)
const additionalTokens = {
  containers: {
    deviation: true,
    items: [
      { name: 'container-default', light: '80rem', dark: '80rem' },
      { name: 'container-narrow', light: '64rem', dark: '64rem' },
      { name: 'container-wide', light: '80%', dark: '80%' },
      { name: 'container-full', light: '100%', dark: '100%' },
    ],
  },
  spacing: {
    deviation: true,
    items: [
      { name: 'section-padding-sm', light: '2rem', dark: '2rem' },
      { name: 'section-padding-md', light: '3rem', dark: '3rem' },
      { name: 'section-padding-lg', light: '4rem', dark: '4rem' },
      { name: 'section-margin-sm', light: '2rem', dark: '2rem' },
      { name: 'section-margin-md', light: '3rem', dark: '3rem' },
      { name: 'section-margin-lg', light: '4rem', dark: '4rem' },
    ],
  },
  grid: {
    deviation: true,
    items: [
      { name: 'grid-gap', light: '1.5rem', dark: '1.5rem' },
      { name: 'grid-cols-2', light: '2', dark: '2' },
      { name: 'grid-cols-3', light: '3', dark: '3' },
      { name: 'grid-cols-4', light: '4', dark: '4' },
    ],
  },
  radius: {
    deviation: true,
    items: [
      { name: 'radius', light: '0.5rem', dark: '0.5rem' },
      { name: 'button-radius', light: 'var(--radius)', dark: 'var(--radius)' },
      { name: 'card-radius', light: 'var(--radius)', dark: 'var(--radius)' },
    ],
  },
  border: {
    deviation: true,
    items: [
      { name: 'border-width', light: '1px', dark: '1px' },
      { name: 'border-style', light: 'solid', dark: 'solid' },
    ],
  },
  shadows: {
    deviation: true,
    items: [
      {
        name: 'shadow',
        light: '0 1px 3px rgba(0,0,0,0.12)',
        dark: '0 1px 3px rgba(0,0,0,0.24)',
      },
    ],
  },
  layout: {
    deviation: true,
    items: [
      { name: 'container-max-width', light: '80rem', dark: '80rem' },
      { name: 'section-padding', light: '2rem', dark: '2rem' },
      { name: 'grid-gap', light: '1.5rem', dark: '1.5rem' },
      { name: 'margin-scale', light: '4rem', dark: '4rem' },
    ],
  },
};

// Define Tailwind's default colors
const colors = {
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },
  gray: {
    50: '#fafafa',
    100: '#f4f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },
  zinc: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b',
  },
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },
  violet: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
    950: '#2e1065',
  },
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
    950: '#3b0764',
  },
};

const ColorPicker = ({ value, onChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('libraries');

  const filteredPalettes = Object.entries(colors).filter(([name]) =>
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper function to get the display color
  const getDisplayColor = (value) => {
    if (!value) return null;

    // Handle existing color format (e.g., "colors/accent-light")
    if (value.startsWith('colors/')) {
      return '#000000'; // Default color for now
    }

    // Handle Tailwind color format (e.g., "violet-500")
    const [palette, shade] = value.split('-');
    return colors[palette]?.[shade];
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal h-8"
        >
          <div className="flex items-center gap-2">
            {value && (
              <div
                className="h-4 w-4 rounded"
                style={{
                  backgroundColor: getDisplayColor(value) || 'currentColor',
                }}
              />
            )}
            <span>{value || 'Select color'}</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Tabs
          defaultValue="libraries"
          className="w-full"
          onValueChange={setActiveTab}
        >
          <div className="flex items-center border-b px-3">
            <TabsList className="h-9 bg-transparent p-0">
              <TabsTrigger
                value="custom"
                className={cn(
                  'rounded-none border-b-2 border-transparent px-3 pb-3 pt-2 font-semibold',
                  activeTab === 'custom' && 'border-primary'
                )}
              >
                Custom
              </TabsTrigger>
              <TabsTrigger
                value="libraries"
                className={cn(
                  'rounded-none border-b-2 border-transparent px-3 pb-3 pt-2 font-semibold',
                  activeTab === 'libraries' && 'border-primary'
                )}
              >
                Libraries
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="custom" className="p-0">
            <div className="p-4 space-y-4">
              {/* Custom color picker UI would go here */}
              <span className="text-sm text-muted-foreground">
                Custom color picker coming soon
              </span>
            </div>
          </TabsContent>

          <TabsContent value="libraries" className="p-0">
            <div className="border-b p-4">
              <Input
                placeholder="Search libraries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8"
              />
            </div>
            <ScrollArea className="h-[300px]">
              {filteredPalettes.map(([paletteName, shades]) => (
                <div key={paletteName} className="p-4 border-b last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{paletteName}</span>
                  </div>
                  <div className="grid grid-cols-11 gap-1">
                    {Object.entries(shades).map(([shade, hexColor]) => (
                      <Button
                        key={`${paletteName}-${shade}`}
                        variant="ghost"
                        className="h-5 w-5 p-0 hover:scale-110 transition-transform rounded-sm"
                        style={{
                          backgroundColor: hexColor,
                        }}
                        onClick={() => onChange(`${paletteName}-${shade}`)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};

const borderStyles = [
  'none',
  'solid',
  'dashed',
  'dotted',
  'double',
  'groove',
  'ridge',
  'inset',
  'outset',
];

const isColorToken = (section, tokenName) => {
  const colorSections = ['base', 'charts', 'sidebar'];
  if (colorSections.includes(section)) return true;
  if (
    tokenName.includes('color') ||
    tokenName.includes('background') ||
    tokenName.includes('foreground')
  )
    return true;
  return false;
};

const isDimensionToken = (section, tokenName) => {
  const dimensionSections = ['spacing', 'containers', 'grid'];
  if (dimensionSections.includes(section)) return true;
  if (
    tokenName.includes('radius') ||
    tokenName.includes('width') ||
    tokenName.includes('size')
  )
    return true;
  return false;
};

const isPercentageToken = (section, tokenName) => {
  if (section === 'alpha') return true;
  if (tokenName.includes('opacity')) return true;
  return false;
};

const isStyleToken = (section, tokenName) => {
  return tokenName.includes('style');
};

const TokenInput = ({ type, value, onChange, token, section }) => {
  if (type === 'color') {
    return <ColorPicker value={value} onChange={onChange} />;
  }

  if (type === 'dimension') {
    return (
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g., 1rem, 16px, 100%"
        className="h-8"
      />
    );
  }

  if (type === 'percentage') {
    return (
      <Input
        type="number"
        min="0"
        max="100"
        value={value.replace('%', '')}
        onChange={(e) => onChange(`${e.target.value}%`)}
        className="h-8"
      />
    );
  }

  if (type === 'style') {
    return (
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-8">
          <SelectValue>{value}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {borderStyles.map((style) => (
            <SelectItem key={style} value={style}>
              {style}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8"
    />
  );
};

const TokenTable = ({ title, tokens, onUpdate }) => {
  const getInputType = (section, tokenName) => {
    if (isColorToken(section.toLowerCase(), tokenName.toLowerCase()))
      return 'color';
    if (isDimensionToken(section.toLowerCase(), tokenName.toLowerCase()))
      return 'dimension';
    if (isPercentageToken(section.toLowerCase(), tokenName.toLowerCase()))
      return 'percentage';
    if (isStyleToken(section.toLowerCase(), tokenName.toLowerCase()))
      return 'style';
    return 'text';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-medium">{title}</h3>
        {tokens.deviation && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>This section deviates from the Figma file structure</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {tokens.deviation && (
          <h2>This section deviates from the Figma file structure</h2>
        )}
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2 w-[200px]">Name</th>
            <th className="text-left p-2">Light</th>
            <th className="text-left p-2">Dark</th>
          </tr>
        </thead>
        <tbody>
          {tokens.items.map((token) => (
            <tr key={token.name} className="border-b">
              <td className="p-2">
                <span className="text-sm">{token.name}</span>
              </td>
              <td className="p-2">
                <TokenInput
                  type={getInputType(title, token.name)}
                  value={token.light}
                  onChange={(value) => onUpdate(token.name, 'light', value)}
                  token={token}
                  section={title}
                />
              </td>
              <td className="p-2">
                <TokenInput
                  type={getInputType(title, token.name)}
                  value={token.dark}
                  onChange={(value) => onUpdate(token.name, 'dark', value)}
                  token={token}
                  section={title}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const FontPreview = ({ fontFamily, fontSize, fontWeight, lineHeight }) => (
  <div
    className="p-4 border rounded-md mt-4"
    style={{
      fontFamily: fontFamily,
      fontSize: fontSize,
      fontWeight: fontWeight,
      lineHeight: lineHeight,
    }}
  >
    <p>The quick brown fox jumps over the lazy dog</p>
    <p>ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
    <p>abcdefghijklmnopqrstuvwxyz</p>
    <p>1234567890!@#$%^&*()</p>
  </div>
);

const TypographyManager = ({ tokens, onUpdate }) => {
  const [googleFonts, setGoogleFonts] = useState([]);
  const [selectedFamily, setSelectedFamily] = useState('sans');
  const [previewSize, setPreviewSize] = useState('base');
  const [previewWeight, setPreviewWeight] = useState('normal');
  const [previewHeight, setPreviewHeight] = useState('normal');

  useEffect(() => {
    const fetchGoogleFonts = async () => {
      try {
        const API_KEY = 'YOUR_GOOGLE_FONTS_API_KEY';
        const response = await fetch(
          `https://www.googleapis.com/webfonts/v1/webfonts?key=${API_KEY}&sort=popularity`
        );
        const data = await response.json();
        setGoogleFonts(data.items.slice(0, 100)); // Get top 100 fonts
      } catch (error) {
        console.error('Error fetching Google Fonts:', error);
      }
    };

    fetchGoogleFonts();
  }, []);

  useEffect(() => {
    // Load selected fonts
    const loadFonts = async () => {
      const fontFamilies = Object.values(tokens.fontFamily).map((f) => f.value);
      const uniqueFamilies = [...new Set(fontFamilies)];

      uniqueFamilies.forEach((family) => {
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=${family.replace(
          ' ',
          '+'
        )}&display=swap`;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      });
    };

    loadFonts();
  }, [tokens.fontFamily]);

  return (
    <div className="space-y-6">
      {/* Font Families */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Font Families</h3>
        {Object.entries(tokens.fontFamily).map(([familyType, config]) => (
          <div key={familyType} className="grid grid-cols-2 gap-4 items-center">
            <Label>{familyType}</Label>
            <Select
              value={config.value}
              onValueChange={(value) =>
                onUpdate('fontFamily', familyType, value)
              }
            >
              <SelectTrigger>
                <SelectValue>{config.value}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {googleFonts.map((font) => (
                  <SelectItem key={font.family} value={font.family}>
                    {font.family}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      {/* Font Sizes */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Font Sizes</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(tokens.fontSize).map(([size, value]) => (
            <div key={size} className="grid grid-cols-2 gap-4 items-center">
              <Label>{size}</Label>
              <Input
                value={value}
                onChange={(e) => onUpdate('fontSize', size, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Preview</h3>
        <div className="grid grid-cols-4 gap-4">
          <Select value={selectedFamily} onValueChange={setSelectedFamily}>
            <SelectTrigger>
              <SelectValue>Font Family</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.keys(tokens.fontFamily).map((family) => (
                <SelectItem key={family} value={family}>
                  {family}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={previewSize} onValueChange={setPreviewSize}>
            <SelectTrigger>
              <SelectValue>Size</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.keys(tokens.fontSize).map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={previewWeight} onValueChange={setPreviewWeight}>
            <SelectTrigger>
              <SelectValue>Weight</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.keys(tokens.fontWeight).map((weight) => (
                <SelectItem key={weight} value={weight}>
                  {weight}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={previewHeight} onValueChange={setPreviewHeight}>
            <SelectTrigger>
              <SelectValue>Line Height</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.keys(tokens.lineHeight).map((height) => (
                <SelectItem key={height} value={height}>
                  {height}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <FontPreview
          fontFamily={tokens.fontFamily[selectedFamily].value}
          fontSize={tokens.fontSize[previewSize]}
          fontWeight={tokens.fontWeight[previewWeight]}
          lineHeight={tokens.lineHeight[previewHeight]}
        />
      </div>
    </div>
  );
};

const DesignSystemManager = () => {
  const [colorTokens, setColorTokens] = useState(() => {
    // Convert initialColorTokens to new format with deviation flags
    return Object.entries(initialColorTokens).reduce((acc, [key, value]) => {
      acc[key] = {
        deviation: false,
        items: value,
      };
      return acc;
    }, {});
  });

  const [typographyTokens, setTypographyTokens] = useState(
    initialTypographyTokens
  );

  // Merge additional tokens
  useEffect(() => {
    setColorTokens((prev) => ({
      ...prev,
      ...additionalTokens,
    }));
  }, []);

  const handleColorUpdate = (section, tokenName, mode, value) => {
    setColorTokens((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        items: prev[section].items.map((token) =>
          token.name === tokenName ? { ...token, [mode]: value } : token
        ),
      },
    }));
  };

  const handleTypographyUpdate = (category, key, value) => {
    setTypographyTokens((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        ...(category === 'fontFamily'
          ? { [key]: { ...prev.fontFamily[key], value } }
          : { [key]: value }),
      },
    }));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Design System Manager</CardTitle>
          <ExportManager
            colorTokens={colorTokens}
            typographyTokens={typographyTokens}
          />
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="colors">
            <TabsList>
              <TabsTrigger value="colors">Colors</TabsTrigger>
              <TabsTrigger value="typography">Typography</TabsTrigger>
            </TabsList>
            <TabsContent value="colors">
              {Object.entries(colorTokens).map(([section, sectionTokens]) => (
                <TokenTable
                  key={section}
                  title={section.charAt(0).toUpperCase() + section.slice(1)}
                  tokens={sectionTokens}
                  onUpdate={(tokenName, mode, value) =>
                    handleColorUpdate(section, tokenName, mode, value)
                  }
                />
              ))}
            </TabsContent>
            <TabsContent value="typography">
              <TypographyManager
                tokens={typographyTokens}
                onUpdate={handleTypographyUpdate}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DesignSystemManager;
