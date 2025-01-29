// @ts-nocheck
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

const ExportManager = ({ colorTokens, typographyTokens }) => {
  const generateFigmaTheme = () => {
    const theme = {
      colors: {
        light: {},
        dark: {},
      },
      typography: {
        fontFamily: {},
        fontSize: {},
        fontWeight: {},
        lineHeight: {},
      },
    };

    // Process color tokens
    Object.entries(colorTokens).forEach(([section, { items }]) => {
      items.forEach((token) => {
        const tokenName = `${section}-${token.name}`;
        theme.colors.light[tokenName] = token.light;
        theme.colors.dark[tokenName] = token.dark;
      });
    });

    // Process typography tokens
    Object.entries(typographyTokens.fontFamily).forEach(([key, value]) => {
      theme.typography.fontFamily[key] = value.value;
    });
    Object.entries(typographyTokens.fontSize).forEach(([key, value]) => {
      theme.typography.fontSize[key] = value;
    });
    Object.entries(typographyTokens.fontWeight).forEach(([key, value]) => {
      theme.typography.fontWeight[key] = value;
    });
    Object.entries(typographyTokens.lineHeight).forEach(([key, value]) => {
      theme.typography.lineHeight[key] = value;
    });

    return theme;
  };

  const generateLocalTheme = () => {
    let cssVariables = ':root {\n';
    let darkTheme = '.dark {\n';

    // Process color tokens
    Object.entries(colorTokens).forEach(([section, { items }]) => {
      items.forEach((token) => {
        const tokenName = `${section}-${token.name}`;
        cssVariables += `  --${tokenName}: ${token.light};\n`;
        darkTheme += `  --${tokenName}: ${token.dark};\n`;
      });
    });

    // Process typography tokens
    Object.entries(typographyTokens).forEach(([category, tokens]) => {
      Object.entries(tokens).forEach(([key, value]) => {
        const actualValue = typeof value === 'object' ? value.value : value;
        cssVariables += `  --${category}-${key}: ${actualValue};\n`;
      });
    });

    cssVariables += '}\n\n';
    darkTheme += '}\n';

    return cssVariables + darkTheme;
  };

  const downloadTheme = (content, filename) => {
    const blob = new Blob([JSON.stringify(content, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  };

  const downloadCssTheme = (content, filename) => {
    const blob = new Blob([content], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export Theme
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={() =>
            downloadTheme(generateFigmaTheme(), 'figma-theme.json')
          }
        >
          Export for Figma
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => downloadCssTheme(generateLocalTheme(), 'theme.css')}
        >
          Export for Local Development
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportManager;
