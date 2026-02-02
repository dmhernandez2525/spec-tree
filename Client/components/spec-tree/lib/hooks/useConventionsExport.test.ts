/**
 * Tests for useConventionsExport hook
 *
 * F2.1.3 - Project conventions export
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  useConventionsExport,
  formatFrontmatter,
  formatTechStack,
  formatNamingConventions,
  formatCodePatterns,
  formatForbiddenPatterns,
  formatDirectoryStructure,
  generateCombinedMDC,
  generateSeparateFiles,
  sanitizeFilename,
  type ProjectContext,
  type TechStackItem,
  type NamingConvention,
  type CodePattern,
  type ForbiddenPattern,
  type DirectoryEntry,
  type MDCFrontmatter,
} from './useConventionsExport';

// Sample project context for testing
const sampleProjectContext: ProjectContext = {
  name: 'E-Commerce Platform',
  description: 'A modern e-commerce platform built with Next.js',
  techStack: [
    { category: 'Framework', value: 'Next.js 14', description: 'App Router' },
    { category: 'Language', value: 'TypeScript', description: 'strict mode' },
    { category: 'Styling', value: 'Tailwind CSS' },
    { category: 'State', value: 'Zustand + TanStack Query' },
  ],
  namingConventions: [
    { scope: 'Components', pattern: 'PascalCase', location: 'src/components/', example: 'UserProfile.tsx' },
    { scope: 'Hooks', pattern: 'useXxx', location: 'src/hooks/', example: 'useAuth.ts' },
    { scope: 'Utils', pattern: 'camelCase', location: 'src/lib/' },
  ],
  codePatterns: [
    { name: 'Button component', path: 'src/components/ui/button.tsx', description: 'Reusable button' },
    { name: 'Form pattern', path: 'src/components/forms/LoginForm.tsx' },
    { name: 'API client', path: 'src/lib/api/client.ts', description: 'API wrapper' },
  ],
  forbiddenPatterns: [
    { pattern: 'any', reason: 'Type safety', alternative: 'unknown or proper typing' },
    { pattern: '@ts-ignore', reason: 'Technical debt' },
    { pattern: 'console.log', reason: 'Use logger service', alternative: 'logger.info()' },
  ],
  directoryStructure: [
    { path: 'src/app', purpose: 'Next.js App Router pages' },
    { path: 'src/components', purpose: 'React components' },
    { path: 'src/components/ui', purpose: 'Reusable UI components' },
    { path: 'src/hooks', purpose: 'Custom React hooks' },
    { path: 'src/lib', purpose: 'Utilities and services' },
  ],
  additionalNotes: ['Use cn() utility for conditional Tailwind classes', 'Prefer interfaces over type aliases for objects'],
};

describe('formatFrontmatter', () => {
  it('should format basic frontmatter', () => {
    const frontmatter: MDCFrontmatter = {
      title: 'Test Rules',
      description: 'Test description',
    };

    const result = formatFrontmatter(frontmatter);

    expect(result).toContain('---');
    expect(result).toContain('title: Test Rules');
    expect(result).toContain('description: Test description');
    expect(result.match(/---/g)?.length).toBe(2);
  });

  it('should format globs as inline array', () => {
    const frontmatter: MDCFrontmatter = {
      title: 'Test',
      globs: ['src/**/*', 'lib/**/*'],
    };

    const result = formatFrontmatter(frontmatter);

    expect(result).toContain('globs: ["src/**/*", "lib/**/*"]');
  });

  it('should format boolean values', () => {
    const frontmatter: MDCFrontmatter = {
      title: 'Test',
      alwaysApply: true,
    };

    const result = formatFrontmatter(frontmatter);

    expect(result).toContain('alwaysApply: true');
  });

  it('should format tags array', () => {
    const frontmatter: MDCFrontmatter = {
      title: 'Test',
      tags: ['conventions', 'patterns'],
    };

    const result = formatFrontmatter(frontmatter);

    expect(result).toContain('tags: ["conventions", "patterns"]');
  });
});

describe('formatTechStack', () => {
  it('should format tech stack items', () => {
    const items: TechStackItem[] = [
      { category: 'Framework', value: 'Next.js 14', description: 'App Router' },
      { category: 'Language', value: 'TypeScript' },
    ];

    const result = formatTechStack(items);

    expect(result).toContain('## Tech Stack');
    expect(result).toContain('- **Framework**: Next.js 14 (App Router)');
    expect(result).toContain('- **Language**: TypeScript');
    expect(result).not.toContain('()'); // No empty parentheses
  });

  it('should return empty string for empty array', () => {
    const result = formatTechStack([]);
    expect(result).toBe('');
  });
});

describe('formatNamingConventions', () => {
  it('should format naming conventions', () => {
    const conventions: NamingConvention[] = [
      { scope: 'Components', pattern: 'PascalCase', location: 'src/components/', example: 'UserProfile.tsx' },
      { scope: 'Utils', pattern: 'camelCase' },
    ];

    const result = formatNamingConventions(conventions);

    expect(result).toContain('## Naming Conventions');
    expect(result).toContain('- **Components**: PascalCase in `src/components/`');
    expect(result).toContain('(e.g., `UserProfile.tsx`)');
    expect(result).toContain('- **Utils**: camelCase');
  });

  it('should return empty string for empty array', () => {
    const result = formatNamingConventions([]);
    expect(result).toBe('');
  });
});

describe('formatCodePatterns', () => {
  it('should format code patterns', () => {
    const patterns: CodePattern[] = [
      { name: 'Button', path: 'src/components/ui/button.tsx', description: 'Reusable button' },
      { name: 'Form', path: 'src/components/forms/LoginForm.tsx' },
    ];

    const result = formatCodePatterns(patterns);

    expect(result).toContain('## Reference Patterns');
    expect(result).toContain('- **Button**: `src/components/ui/button.tsx` - Reusable button');
    expect(result).toContain('- **Form**: `src/components/forms/LoginForm.tsx`');
  });

  it('should return empty string for empty array', () => {
    const result = formatCodePatterns([]);
    expect(result).toBe('');
  });
});

describe('formatForbiddenPatterns', () => {
  it('should format forbidden patterns', () => {
    const patterns: ForbiddenPattern[] = [
      { pattern: 'any', reason: 'Type safety', alternative: 'unknown' },
      { pattern: '@ts-ignore' },
    ];

    const result = formatForbiddenPatterns(patterns);

    expect(result).toContain('## Forbidden Patterns');
    expect(result).toContain('- NO `any` - Type safety (use unknown instead)');
    expect(result).toContain('- NO `@ts-ignore`');
  });

  it('should return empty string for empty array', () => {
    const result = formatForbiddenPatterns([]);
    expect(result).toBe('');
  });
});

describe('formatDirectoryStructure', () => {
  it('should format directory structure', () => {
    const entries: DirectoryEntry[] = [
      { path: 'src/app', purpose: 'Next.js pages' },
      { path: 'src/components', purpose: 'React components' },
    ];

    const result = formatDirectoryStructure(entries);

    expect(result).toContain('## File Structure');
    expect(result).toContain('```');
    expect(result).toContain('app/');
    expect(result).toContain('# Next.js pages');
    expect(result).toContain('components/');
  });

  it('should return empty string for empty array', () => {
    const result = formatDirectoryStructure([]);
    expect(result).toBe('');
  });
});

describe('generateCombinedMDC', () => {
  it('should generate complete MDC content', () => {
    const result = generateCombinedMDC(sampleProjectContext);

    expect(result).toContain('---');
    expect(result).toContain('title: E-Commerce Platform Development Rules');
    expect(result).toContain('# Project: E-Commerce Platform');
    expect(result).toContain('## Tech Stack');
    expect(result).toContain('## Naming Conventions');
    expect(result).toContain('## Reference Patterns');
    expect(result).toContain('## Forbidden Patterns');
    expect(result).toContain('## File Structure');
    expect(result).toContain('## Additional Notes');
  });

  it('should include description', () => {
    const result = generateCombinedMDC(sampleProjectContext);

    expect(result).toContain('A modern e-commerce platform built with Next.js');
  });

  it('should include timestamp when enabled', () => {
    const result = generateCombinedMDC(sampleProjectContext, { includeTimestamp: true });

    expect(result).toContain('_Generated:');
  });

  it('should exclude sections based on options', () => {
    const result = generateCombinedMDC(sampleProjectContext, {
      includeTechStack: false,
      includeNamingConventions: false,
      includeCodePatterns: false,
      includeForbiddenPatterns: false,
      includeDirectoryStructure: false,
      includeNotes: false,
    });

    expect(result).toContain('# Project: E-Commerce Platform');
    expect(result).not.toContain('## Tech Stack');
    expect(result).not.toContain('## Naming Conventions');
    expect(result).not.toContain('## Reference Patterns');
    expect(result).not.toContain('## Forbidden Patterns');
    expect(result).not.toContain('## File Structure');
    expect(result).not.toContain('## Additional Notes');
  });

  it('should use custom frontmatter', () => {
    const result = generateCombinedMDC(sampleProjectContext, {
      frontmatter: {
        title: 'Custom Title',
        globs: ['custom/**/*'],
        alwaysApply: true,
      },
    });

    expect(result).toContain('title: Custom Title');
    expect(result).toContain('globs: ["custom/**/*"]');
    expect(result).toContain('alwaysApply: true');
  });
});

describe('generateSeparateFiles', () => {
  it('should generate separate files for each category', () => {
    const files = generateSeparateFiles(sampleProjectContext);

    expect(files.length).toBeGreaterThanOrEqual(4);
    expect(files.some((f) => f.filename === 'tech-stack.mdc')).toBe(true);
    expect(files.some((f) => f.filename === 'naming-conventions.mdc')).toBe(true);
    expect(files.some((f) => f.filename === 'code-patterns.mdc')).toBe(true);
    expect(files.some((f) => f.filename === 'forbidden-patterns.mdc')).toBe(true);
    expect(files.some((f) => f.filename === 'file-structure.mdc')).toBe(true);
  });

  it('should include proper frontmatter in each file', () => {
    const files = generateSeparateFiles(sampleProjectContext);
    const techStackFile = files.find((f) => f.filename === 'tech-stack.mdc');

    expect(techStackFile?.content).toContain('---');
    expect(techStackFile?.content).toContain('title: E-Commerce Platform - Tech Stack');
    expect(techStackFile?.content).toContain('tags: ["tech-stack"]');
  });

  it('should categorize files correctly', () => {
    const files = generateSeparateFiles(sampleProjectContext);

    const techStack = files.find((f) => f.filename === 'tech-stack.mdc');
    const patterns = files.find((f) => f.filename === 'code-patterns.mdc');
    const structure = files.find((f) => f.filename === 'file-structure.mdc');

    expect(techStack?.category).toBe('conventions');
    expect(patterns?.category).toBe('patterns');
    expect(structure?.category).toBe('structure');
  });

  it('should skip empty sections', () => {
    const minimalContext: ProjectContext = {
      name: 'Minimal',
      techStack: [{ category: 'Language', value: 'TypeScript' }],
      namingConventions: [],
      codePatterns: [],
      forbiddenPatterns: [],
      directoryStructure: [],
    };

    const files = generateSeparateFiles(minimalContext);

    expect(files.length).toBe(1);
    expect(files[0].filename).toBe('tech-stack.mdc');
  });
});

describe('sanitizeFilename', () => {
  it('should convert to lowercase', () => {
    expect(sanitizeFilename('MyProject')).toBe('myproject');
  });

  it('should replace spaces with hyphens', () => {
    expect(sanitizeFilename('My Project Name')).toBe('my-project-name');
  });

  it('should remove special characters', () => {
    expect(sanitizeFilename('Project (v2)!')).toBe('project-v2');
  });

  it('should trim leading/trailing hyphens', () => {
    expect(sanitizeFilename('--My Project--')).toBe('my-project');
  });
});

describe('useConventionsExport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('exportToMDC', () => {
    it('should export to combined MDC', () => {
      const { result } = renderHook(() => useConventionsExport());

      let exportResult;
      act(() => {
        exportResult = result.current.exportToMDC(sampleProjectContext);
      });

      expect(exportResult!.files.length).toBe(1);
      expect(exportResult!.files[0].category).toBe('combined');
      expect(exportResult!.files[0].filename).toBe('e-commerce-platform-rules.mdc');
      expect(exportResult!.combinedContent).toContain('# Project: E-Commerce Platform');
    });

    it('should set lastExport state', () => {
      const { result } = renderHook(() => useConventionsExport());

      expect(result.current.lastExport).toBeNull();

      act(() => {
        result.current.exportToMDC(sampleProjectContext);
      });

      expect(result.current.lastExport).not.toBeNull();
      expect(result.current.lastExport?.timestamp).toBeDefined();
    });

    it('should call onExportComplete callback', () => {
      const onExportComplete = vi.fn();
      const { result } = renderHook(() => useConventionsExport({ onExportComplete }));

      act(() => {
        result.current.exportToMDC(sampleProjectContext);
      });

      expect(onExportComplete).toHaveBeenCalledTimes(1);
      expect(onExportComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          files: expect.any(Array),
          combinedContent: expect.any(String),
          timestamp: expect.any(String),
        })
      );
    });
  });

  describe('exportToSeparateFiles', () => {
    it('should export to separate files', () => {
      const { result } = renderHook(() => useConventionsExport());

      let files;
      act(() => {
        files = result.current.exportToSeparateFiles(sampleProjectContext);
      });

      expect(files!.length).toBeGreaterThanOrEqual(4);
    });

    it('should update lastExport state', () => {
      const { result } = renderHook(() => useConventionsExport());

      act(() => {
        result.current.exportToSeparateFiles(sampleProjectContext);
      });

      expect(result.current.lastExport).not.toBeNull();
      expect(result.current.lastExport?.files.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('formatting utilities', () => {
    it('should expose formatFrontmatter', () => {
      const { result } = renderHook(() => useConventionsExport());

      const formatted = result.current.formatFrontmatter({ title: 'Test' });

      expect(formatted).toContain('title: Test');
    });

    it('should expose formatTechStack', () => {
      const { result } = renderHook(() => useConventionsExport());

      const formatted = result.current.formatTechStack([{ category: 'Lang', value: 'TS' }]);

      expect(formatted).toContain('**Lang**: TS');
    });

    it('should expose all formatting functions', () => {
      const { result } = renderHook(() => useConventionsExport());

      expect(typeof result.current.formatFrontmatter).toBe('function');
      expect(typeof result.current.formatTechStack).toBe('function');
      expect(typeof result.current.formatNamingConventions).toBe('function');
      expect(typeof result.current.formatCodePatterns).toBe('function');
      expect(typeof result.current.formatForbiddenPatterns).toBe('function');
      expect(typeof result.current.formatDirectoryStructure).toBe('function');
    });
  });

  describe('isExporting state', () => {
    it('should be false initially', () => {
      const { result } = renderHook(() => useConventionsExport());

      expect(result.current.isExporting).toBe(false);
    });

    it('should be false after export completes', () => {
      const { result } = renderHook(() => useConventionsExport());

      act(() => {
        result.current.exportToMDC(sampleProjectContext);
      });

      expect(result.current.isExporting).toBe(false);
    });
  });
});

describe('integration', () => {
  it('should round-trip with useCursorRulesImport data structure', () => {
    // This test validates that the export format is compatible
    // with the import format from F2.1.2
    const context: ProjectContext = {
      name: 'Test Project',
      techStack: [
        { category: 'Framework', value: 'Next.js 14' },
        { category: 'Language', value: 'TypeScript' },
      ],
      namingConventions: [{ scope: 'Components', pattern: 'PascalCase' }],
      codePatterns: [{ name: 'Button', path: 'src/components/ui/button.tsx' }],
      forbiddenPatterns: [{ pattern: 'any' }],
      directoryStructure: [{ path: 'src/app', purpose: 'Pages' }],
    };

    const content = generateCombinedMDC(context);

    // Verify structure matches expected MDC format
    expect(content).toContain('---');
    expect(content).toContain('title:');
    expect(content).toContain('globs:');
    expect(content).toContain('---');
    expect(content).toContain('## Tech Stack');
    expect(content).toContain('- **Framework**: Next.js 14');
    expect(content).toContain('## Forbidden Patterns');
    expect(content).toContain('- NO `any`');
  });
});

describe('validation', () => {
  it('should throw error for empty project name', () => {
    const invalidContext: ProjectContext = {
      name: '',
      techStack: [],
      namingConventions: [],
      codePatterns: [],
      forbiddenPatterns: [],
      directoryStructure: [],
    };

    expect(() => generateCombinedMDC(invalidContext)).toThrow('Project name is required');
  });

  it('should throw error for whitespace-only project name', () => {
    const invalidContext: ProjectContext = {
      name: '   ',
      techStack: [],
      namingConventions: [],
      codePatterns: [],
      forbiddenPatterns: [],
      directoryStructure: [],
    };

    expect(() => generateCombinedMDC(invalidContext)).toThrow('Project name is required');
  });

  it('should use fallback for sanitizeFilename with special chars only', () => {
    const result = sanitizeFilename('!!!@@@###');
    expect(result).toBe('export');
  });

  it('should accept custom fallback for sanitizeFilename', () => {
    const result = sanitizeFilename('!!!', 'custom-fallback');
    expect(result).toBe('custom-fallback');
  });
});

describe('YAML escaping', () => {
  it('should escape special characters in frontmatter title', () => {
    const frontmatter = {
      title: 'Project: Test & Demo',
    };
    const result = formatFrontmatter(frontmatter);
    expect(result).toContain('title: "Project: Test & Demo"');
  });

  it('should escape quotes in globs', () => {
    const frontmatter = {
      globs: ['src/**/"test"/*.ts'],
    };
    const result = formatFrontmatter(frontmatter);
    expect(result).toContain('\\"test\\"');
  });
});
