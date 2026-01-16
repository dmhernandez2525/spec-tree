'use client';

import React, { useEffect, useState } from 'react';
import { Moon, Sun, Copy, Check, Info, Settings, Pipette } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  generateTheme,
  generateThemeCSS,
  baseColors,
  StyleVariant,
  ThemeOptions,
  ThemeColors,
} from './generateThemes';
import ScrollableCode from '../shared/ScrollableCode';
import { useFonts } from '@/components/FontManager';

interface Props {
  onThemeChange?: (theme: ReturnType<typeof generateTheme>['theme']) => void;
}

const THEME_COLORS: Array<{ key: keyof ThemeColors; label: string }> = [
  { key: 'background', label: 'Background' },
  { key: 'foreground', label: 'Foreground' },
  { key: 'primary', label: 'Primary' },
  { key: 'primaryForeground', label: 'Primary Foreground' },
  { key: 'secondary', label: 'Secondary' },
  { key: 'secondaryForeground', label: 'Secondary Foreground' },
  { key: 'muted', label: 'Muted' },
  { key: 'mutedForeground', label: 'Muted Foreground' },
  { key: 'accent', label: 'Accent' },
  { key: 'accentForeground', label: 'Accent Foreground' },
  { key: 'destructive', label: 'Destructive' },
  { key: 'destructiveForeground', label: 'Destructive Foreground' },
  { key: 'border', label: 'Border' },
  { key: 'input', label: 'Input' },
  { key: 'ring', label: 'Ring' },
];

const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};

function HSLToString(h: number, s: number, l: number): string {
  return `${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%`;
}

function stringToHSL(
  hslString: string
): { h: number; s: number; l: number } | null {
  const match = hslString.match(/^(\d+)\s+(\d+)%?\s+(\d+)%?$/);
  if (!match) return null;
  return {
    h: parseInt(match[1], 10),
    s: parseInt(match[2], 10),
    l: parseInt(match[3], 10),
  };
}

export function CustomizationPanel({ onThemeChange }: Props): JSX.Element {
  const { setCurrentStyle } = useFonts();
  const { setTheme: setMode, resolvedTheme: mode } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);

  const [config, setConfig] = useState<ThemeOptions>({
    style: 'new-york',
    theme: 'zinc',
    radius: 0.5,
  });

  // Main theme colors state
  const [customColors, setCustomColors] = useState<{
    light: Partial<ThemeColors>;
    dark: Partial<ThemeColors>;
  }>({
    light: {},
    dark: {},
  });

  // Draft colors state for the dialog
  const [draftColors, setDraftColors] = useState<{
    light: Partial<ThemeColors>;
    dark: Partial<ThemeColors>;
  }>({
    light: {},
    dark: {},
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only apply theme changes when customColors changes (not draftColors)
  useEffect(() => {
    const { theme, applyThemeVariables } = generateTheme({
      ...config,
      customColors,
    });

    applyThemeVariables(mode === 'dark');
    onThemeChange?.(theme);
  }, [config, customColors, mode, onThemeChange]);

  const handleCustomColorChange = (
    mode: 'light' | 'dark',
    key: keyof ThemeColors,
    value: string
  ) => {
    setDraftColors((prev) => ({
      ...prev,
      [mode]: {
        ...prev[mode],
        [key]: value,
      },
    }));
  };

  const handleCopyTheme = async () => {
    const { theme } = generateTheme({ ...config, customColors });
    const css = generateThemeCSS(theme);
    const success = await copyToClipboard(css);
    if (success) {
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  const handleStyleChange = (value: StyleVariant) => {
    setConfig((prev) => ({ ...prev, style: value }));
    setCurrentStyle(value);
  };

  const handleColorChange = (colorName: string) => {
    setConfig((prev) => ({ ...prev, theme: colorName }));
  };

  const handleRadiusChange = (radius: number) => {
    setConfig((prev) => ({ ...prev, radius }));
  };
  const handleDialogOpen = (open: boolean) => {
    if (open) {
      // When opening, set draft colors to current custom colors
      setDraftColors(customColors);
    }
    setIsCustomizing(open);
  };

  const handleSaveColors = () => {
    // Apply draft colors to actual custom colors
    setCustomColors(draftColors);
    setIsCustomizing(false);
  };

  const handleResetColors = () => {
    // Reset draft colors
    setDraftColors({ light: {}, dark: {} });
  };

  const handleCancelCustomization = () => {
    // Discard draft changes
    setDraftColors(customColors);
    setIsCustomizing(false);
  };

  const ColorInput = ({
    mode,
    colorKey,
    label,
  }: {
    mode: 'light' | 'dark';
    colorKey: keyof ThemeColors;
    label: string;
  }) => {
    const currentValue = draftColors[mode][colorKey] || '';
    const hslValue = stringToHSL(currentValue);

    return (
      <div className="space-y-1">
        <Label className="text-xs">
          {label}
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3 w-3 inline-block ml-1 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Enter HSL values (e.g., 210 100% 50%)</p>
            </TooltipContent>
          </Tooltip>
        </Label>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder={`e.g., 210 100% 50%`}
            value={currentValue}
            onChange={(e) =>
              handleCustomColorChange(mode, colorKey, e.target.value)
            }
            className="h-8 text-sm flex-1"
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-8 h-8 p-0"
                style={{
                  background: currentValue ? `hsl(${currentValue})` : undefined,
                }}
              >
                <Pipette className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-4">
              <div className="space-y-4">
                {/* Hue Slider */}
                <div className="space-y-2">
                  <Label>Hue</Label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={hslValue?.h || 0}
                    onChange={(e) => {
                      const h = parseInt(e.target.value);
                      handleCustomColorChange(
                        mode,
                        colorKey,
                        HSLToString(h, hslValue?.s || 100, hslValue?.l || 50)
                      );
                    }}
                    className="w-full"
                  />
                </div>

                {/* Saturation Slider */}
                <div className="space-y-2">
                  <Label>Saturation</Label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={hslValue?.s || 100}
                    onChange={(e) => {
                      const s = parseInt(e.target.value);
                      handleCustomColorChange(
                        mode,
                        colorKey,
                        HSLToString(hslValue?.h || 0, s, hslValue?.l || 50)
                      );
                    }}
                    className="w-full"
                  />
                </div>

                {/* Lightness Slider */}
                <div className="space-y-2">
                  <Label>Lightness</Label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={hslValue?.l || 50}
                    onChange={(e) => {
                      const l = parseInt(e.target.value);
                      handleCustomColorChange(
                        mode,
                        colorKey,
                        HSLToString(hslValue?.h || 0, hslValue?.s || 100, l)
                      );
                    }}
                    className="w-full"
                  />
                </div>

                {/* Preview */}
                <div
                  className="h-8 w-full rounded border"
                  style={{
                    background: currentValue
                      ? `hsl(${currentValue})`
                      : undefined,
                  }}
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    );
  };

  const CustomColorsDialog = () => (
    <Dialog open={isCustomizing} onOpenChange={handleDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-2xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Custom Colors</DialogTitle>
          <DialogDescription>
            Override theme colors with custom HSL values
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="light">
          <TabsList>
            <TabsTrigger value="light">Light Mode</TabsTrigger>
            <TabsTrigger value="dark">Dark Mode</TabsTrigger>
          </TabsList>

          <TabsContent value="light">
            <ScrollArea className="h-[400px] pr-4">
              <div className="grid grid-cols-2 gap-4">
                {THEME_COLORS.map(({ key, label }) => (
                  <ColorInput
                    key={key}
                    mode="light"
                    colorKey={key}
                    label={label}
                  />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="dark">
            <ScrollArea className="h-[400px] pr-4">
              <div className="grid grid-cols-2 gap-4">
                {THEME_COLORS.map(({ key, label }) => (
                  <ColorInput
                    key={key}
                    mode="dark"
                    colorKey={key}
                    label={label}
                  />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleResetColors}>
            Reset
          </Button>
          <Button variant="outline" onClick={handleCancelCustomization}>
            Cancel
          </Button>
          <Button onClick={handleSaveColors}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  if (!mounted) {
    return (
      <div className="p-6 rounded-lg border shadow-md w-full max-w-md">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-6 rounded-lg border shadow-md w-full max-w-md">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Customize</h2>
          <p className="text-sm text-muted-foreground">
            Pick a style and color for your components.
          </p>
        </div>
        <div className="flex gap-2">
          <CustomColorsDialog />
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Copy className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Theme CSS</DialogTitle>
                <DialogDescription>
                  Copy the CSS code for your theme configuration.
                </DialogDescription>
              </DialogHeader>
              <pre className="p-4 rounded-lg bg-muted overflow-x-auto">
                <ScrollableCode
                  content={generateThemeCSS(
                    generateTheme({ ...config, customColors }).theme
                  )}
                />
              </pre>
              <Button onClick={handleCopyTheme}>
                {hasCopied ? (
                  <Check className="mr-2 h-4 w-4" />
                ) : (
                  <Copy className="mr-2 h-4 w-4" />
                )}
                Copy CSS
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-6">
        {/* Style Selection */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Style</label>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Choose between different component styles.</p>
                <p className="mt-1">
                  <strong>Default:</strong> Minimal style with clean lines
                  <br />
                  <strong>New York:</strong> Modern style with subtle shadows
                </p>
              </TooltipContent>
            </Tooltip>

            <ToggleGroup
              type="single"
              value={config.style}
              onValueChange={handleStyleChange}
              className="grid grid-cols-4 gap-2"
            >
              <ToggleGroupItem value="default">Default</ToggleGroupItem>
              <ToggleGroupItem value="new-york">New York</ToggleGroupItem>
              <ToggleGroupItem value="cyberpunk">Cyberpunk</ToggleGroupItem>
              <ToggleGroupItem value="retro">Retro</ToggleGroupItem>
              <ToggleGroupItem value="glassmorphic">Glass</ToggleGroupItem>
              <ToggleGroupItem value="brutalist">Brutalist</ToggleGroupItem>
              <ToggleGroupItem value="neumorphic">Neumorphic</ToggleGroupItem>
              <ToggleGroupItem value="kawaii">Kawaii</ToggleGroupItem>
              <ToggleGroupItem value="terminal">Terminal</ToggleGroupItem>
              <ToggleGroupItem value="handdrawn">Handdrawn</ToggleGroupItem>
              <ToggleGroupItem value="claymorphic">Claymorphic</ToggleGroupItem>
              <ToggleGroupItem value="schematic">Schematic</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {/* Color Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Color</label>
          <div className="grid grid-cols-4 gap-2">
            {baseColors.map((color) => {
              const isActive = config.theme === color.name;
              return (
                <Button
                  key={color.name}
                  variant={isActive ? 'default' : 'outline'}
                  className={`h-12 p-0 ${
                    isActive ? 'border-2 border-primary' : ''
                  }`}
                  style={
                    {
                      '--theme-color': `hsl(${
                        color.activeColor[mode === 'dark' ? 'dark' : 'light']
                      })`,
                    } as React.CSSProperties
                  }
                  onClick={() => handleColorChange(color.name)}
                >
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{
                        backgroundColor: 'var(--theme-color)',
                      }}
                    />
                    <span className="text-xs">{color.label}</span>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Radius Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Radius</label>
          <div className="grid grid-cols-5 gap-2">
            {['0', '0.3', '0.5', '0.75', '1.0'].map((value) => {
              const radius = parseFloat(value);
              const isActive = config.radius === radius;
              return (
                <Button
                  key={value}
                  variant={isActive ? 'default' : 'outline'}
                  className={isActive ? 'border-2 border-primary' : ''}
                  onClick={() => handleRadiusChange(radius)}
                >
                  <span className="text-xs">{value}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Mode Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Mode</label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={mode === 'light' ? 'default' : 'outline'}
              onClick={() => setMode('light')}
              className="flex-1"
            >
              <Sun className="mr-2 h-4 w-4" />
              Light
            </Button>
            <Button
              variant={mode === 'dark' ? 'default' : 'outline'}
              onClick={() => setMode('dark')}
              className="flex-1"
            >
              <Moon className="mr-2 h-4 w-4" />
              Dark
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export additional components and utilities
export { generateTheme, generateThemeCSS, baseColors };

// Types export
export type { ThemeOptions, StyleVariant };
