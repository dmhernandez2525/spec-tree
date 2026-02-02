/**
 * Tests for useMarkdownExport hook
 *
 * F1.1.13 - Markdown export
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
  useMarkdownExport,
  getWorkItemTypeDisplayName,
  getWorkItemTypeEmoji,
  getHeadingPrefix,
  formatUserStoryDescription,
  getStyleDescription,
  getAvailableStyles,
  formatWorkItemAsMarkdown,
  buildItemTree,
  generateMarkdownContent,
  type ExportableWorkItem,
} from './useMarkdownExport';

const sampleItems: ExportableWorkItem[] = [
  {
    id: 'epic-1',
    type: 'epic',
    title: 'Epic One',
    description: 'First epic description',
    parentId: null,
    status: 'in-progress',
  },
  {
    id: 'feature-1',
    type: 'feature',
    title: 'Feature One',
    description: 'Feature description',
    parentId: 'epic-1',
  },
  {
    id: 'story-1',
    type: 'userStory',
    title: 'Story One',
    role: 'developer',
    action: 'create tests',
    goal: 'ensure quality',
    parentId: 'feature-1',
    points: 5,
    acceptanceCriteria: ['Tests pass', 'Coverage above 80%'],
  },
  {
    id: 'task-1',
    type: 'task',
    title: 'Task One',
    details: 'Task details',
    parentId: 'story-1',
    priority: 1,
    status: 'completed',
  },
];

describe('getWorkItemTypeDisplayName', () => {
  it('should return correct display names', () => {
    expect(getWorkItemTypeDisplayName('epic')).toBe('Epic');
    expect(getWorkItemTypeDisplayName('feature')).toBe('Feature');
    expect(getWorkItemTypeDisplayName('userStory')).toBe('User Story');
    expect(getWorkItemTypeDisplayName('task')).toBe('Task');
  });
});

describe('getWorkItemTypeEmoji', () => {
  it('should return correct emojis', () => {
    expect(getWorkItemTypeEmoji('epic')).toBe('🎯');
    expect(getWorkItemTypeEmoji('feature')).toBe('✨');
    expect(getWorkItemTypeEmoji('userStory')).toBe('📝');
    expect(getWorkItemTypeEmoji('task')).toBe('✅');
  });
});

describe('getHeadingPrefix', () => {
  it('should return correct heading prefix', () => {
    expect(getHeadingPrefix(1)).toBe('#');
    expect(getHeadingPrefix(2)).toBe('##');
    expect(getHeadingPrefix(3)).toBe('###');
    expect(getHeadingPrefix(6)).toBe('######');
  });

  it('should clamp heading level to valid range', () => {
    expect(getHeadingPrefix(0)).toBe('#');
    expect(getHeadingPrefix(7)).toBe('######');
  });
});

describe('formatUserStoryDescription', () => {
  it('should format user story with role/action/goal', () => {
    const item: ExportableWorkItem = {
      id: 'story-1',
      type: 'userStory',
      title: 'Test Story',
      role: 'user',
      action: 'do something',
      goal: 'achieve result',
    };

    const result = formatUserStoryDescription(item);

    expect(result).toContain('As a **user**');
    expect(result).toContain('I want to **do something**');
    expect(result).toContain('so that **achieve result**');
  });

  it('should return description for non-user-story items', () => {
    const item: ExportableWorkItem = {
      id: 'epic-1',
      type: 'epic',
      title: 'Epic',
      description: 'Epic description',
    };

    expect(formatUserStoryDescription(item)).toBe('Epic description');
  });

  it('should return details for task items', () => {
    const item: ExportableWorkItem = {
      id: 'task-1',
      type: 'task',
      title: 'Task',
      details: 'Task details',
    };

    expect(formatUserStoryDescription(item)).toBe('Task details');
  });

  it('should handle missing role/action/goal', () => {
    const item: ExportableWorkItem = {
      id: 'story-1',
      type: 'userStory',
      title: 'Test Story',
      description: 'Fallback description',
    };

    expect(formatUserStoryDescription(item)).toBe('Fallback description');
  });
});

describe('getStyleDescription', () => {
  it('should return correct descriptions', () => {
    expect(getStyleDescription('hierarchical')).toContain('Nested');
    expect(getStyleDescription('flat')).toContain('same-level');
    expect(getStyleDescription('table')).toContain('Tabular');
    expect(getStyleDescription('checklist')).toContain('Checkbox');
  });
});

describe('getAvailableStyles', () => {
  it('should return all available styles', () => {
    const styles = getAvailableStyles();

    expect(styles).toContain('hierarchical');
    expect(styles).toContain('flat');
    expect(styles).toContain('table');
    expect(styles).toContain('checklist');
    expect(styles.length).toBe(4);
  });
});

describe('formatWorkItemAsMarkdown', () => {
  it('should format epic as hierarchical', () => {
    const result = formatWorkItemAsMarkdown(sampleItems[0], { style: 'hierarchical' });

    expect(result).toContain('# 🎯 Epic One');
    expect(result).toContain('First epic description');
    expect(result).toContain('**Type:** Epic');
  });

  it('should format as table row', () => {
    const result = formatWorkItemAsMarkdown(sampleItems[0], { style: 'table' });

    expect(result).toContain('|');
    expect(result).toContain('Epic');
    expect(result).toContain('Epic One');
  });

  it('should format as checklist', () => {
    const result = formatWorkItemAsMarkdown(sampleItems[0], { style: 'checklist' });

    expect(result).toContain('- [ ]');
    expect(result).toContain('🎯');
    expect(result).toContain('**Epic One**');
  });

  it('should mark completed items in checklist', () => {
    const result = formatWorkItemAsMarkdown(sampleItems[3], { style: 'checklist' });

    expect(result).toContain('- [x]');
  });

  it('should include IDs when requested', () => {
    const result = formatWorkItemAsMarkdown(sampleItems[0], { includeIds: true });

    expect(result).toContain('epic-1');
  });

  it('should include acceptance criteria when present', () => {
    const result = formatWorkItemAsMarkdown(sampleItems[2], { includeAcceptanceCriteria: true });

    expect(result).toContain('**Acceptance Criteria:**');
    expect(result).toContain('- [ ] Tests pass');
    expect(result).toContain('- [ ] Coverage above 80%');
  });
});

describe('buildItemTree', () => {
  it('should build tree from flat items', () => {
    const tree = buildItemTree(sampleItems);

    expect(tree.get(null)).toHaveLength(1);
    expect(tree.get('epic-1')).toHaveLength(1);
    expect(tree.get('feature-1')).toHaveLength(1);
    expect(tree.get('story-1')).toHaveLength(1);
  });

  it('should handle empty items', () => {
    const tree = buildItemTree([]);

    expect(tree.size).toBe(0);
  });
});

describe('generateMarkdownContent', () => {
  it('should generate hierarchical markdown', () => {
    const content = generateMarkdownContent(sampleItems, { style: 'hierarchical' });

    expect(content).toContain('# Spec Tree Export');
    expect(content).toContain('Epic One');
    expect(content).toContain('Feature One');
    expect(content).toContain('Story One');
    expect(content).toContain('Task One');
  });

  it('should generate table markdown', () => {
    const content = generateMarkdownContent(sampleItems, { style: 'table' });

    expect(content).toContain('| Type | Title | Description | Status |');
    expect(content).toContain('|---|---|---|---|');
    expect(content).toContain('Epic One');
  });

  it('should generate checklist markdown', () => {
    const content = generateMarkdownContent(sampleItems, { style: 'checklist' });

    expect(content).toContain('- [ ]');
    expect(content).toContain('- [x]'); // completed task
  });

  it('should filter by type', () => {
    const content = generateMarkdownContent(sampleItems, { filterTypes: ['epic', 'feature'] });

    expect(content).toContain('Epic One');
    expect(content).toContain('Feature One');
    expect(content).not.toContain('Story One');
    expect(content).not.toContain('Task One');
  });

  it('should include footer with date', () => {
    const content = generateMarkdownContent(sampleItems);

    expect(content).toContain('---');
    expect(content).toContain('*Exported on');
  });

  it('should handle empty items', () => {
    const content = generateMarkdownContent([]);

    expect(content).toContain('# Spec Tree Export');
    expect(content).toContain('*No items to export.*');
  });

  it('should include IDs in table when requested', () => {
    const content = generateMarkdownContent(sampleItems, { style: 'table', includeIds: true });

    expect(content).toContain('| ID |');
    expect(content).toContain('epic-1');
  });
});

describe('useMarkdownExport', () => {
  describe('exportToMarkdown', () => {
    it('should export items to Markdown', () => {
      const { result } = renderHook(() => useMarkdownExport());

      let exportResult: ReturnType<typeof result.current.exportToMarkdown> | undefined;
      act(() => {
        exportResult = result.current.exportToMarkdown(sampleItems);
      });

      expect(exportResult!.content).toContain('Epic One');
      expect(exportResult!.content).toContain('Feature One');
      expect(exportResult!.itemCount).toBe(4);
    });

    it('should set lastExport state', () => {
      const { result } = renderHook(() => useMarkdownExport());

      expect(result.current.lastExport).toBeNull();

      act(() => {
        result.current.exportToMarkdown(sampleItems);
      });

      expect(result.current.lastExport).not.toBeNull();
      expect(result.current.lastExport?.timestamp).toBeDefined();
    });

    it('should call onExportComplete callback', () => {
      const onExportComplete = vi.fn();
      const { result } = renderHook(() => useMarkdownExport({ onExportComplete }));

      act(() => {
        result.current.exportToMarkdown(sampleItems);
      });

      expect(onExportComplete).toHaveBeenCalledTimes(1);
      expect(onExportComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.any(String),
          itemCount: 4,
        })
      );
    });

    it('should use custom filename', () => {
      const { result } = renderHook(() => useMarkdownExport());

      let exportResult: ReturnType<typeof result.current.exportToMarkdown> | undefined;
      act(() => {
        exportResult = result.current.exportToMarkdown(sampleItems, { filename: 'custom.md' });
      });

      expect(exportResult!.filename).toBe('custom.md');
    });

    it('should use default filename from options', () => {
      const { result } = renderHook(() => useMarkdownExport({ defaultFilename: 'my-export.md' }));

      let exportResult: ReturnType<typeof result.current.exportToMarkdown> | undefined;
      act(() => {
        exportResult = result.current.exportToMarkdown(sampleItems);
      });

      expect(exportResult!.filename).toBe('my-export.md');
    });

    it('should use default style from options', () => {
      const { result } = renderHook(() => useMarkdownExport({ defaultStyle: 'table' }));

      let exportResult: ReturnType<typeof result.current.exportToMarkdown> | undefined;
      act(() => {
        exportResult = result.current.exportToMarkdown(sampleItems);
      });

      expect(exportResult!.content).toContain('| Type | Title |');
    });
  });

  describe('formatWorkItemAsMarkdown utility', () => {
    it('should format items correctly', () => {
      const { result } = renderHook(() => useMarkdownExport());

      const formatted = result.current.formatWorkItemAsMarkdown(sampleItems[0]);

      expect(formatted).toContain('Epic One');
      expect(formatted).toContain('🎯');
    });
  });

  describe('getHeadingPrefix utility', () => {
    it('should be accessible from hook', () => {
      const { result } = renderHook(() => useMarkdownExport());

      expect(result.current.getHeadingPrefix(2)).toBe('##');
    });
  });

  describe('style helpers', () => {
    it('should expose getStyleDescription', () => {
      const { result } = renderHook(() => useMarkdownExport());

      expect(typeof result.current.getStyleDescription).toBe('function');
      expect(result.current.getStyleDescription('table')).toContain('Tabular');
    });

    it('should expose getAvailableStyles', () => {
      const { result } = renderHook(() => useMarkdownExport());

      expect(typeof result.current.getAvailableStyles).toBe('function');
      expect(result.current.getAvailableStyles()).toHaveLength(4);
    });
  });

  describe('isExporting state', () => {
    it('should be false initially', () => {
      const { result } = renderHook(() => useMarkdownExport());

      expect(result.current.isExporting).toBe(false);
    });

    it('should be false after export completes', () => {
      const { result } = renderHook(() => useMarkdownExport());

      act(() => {
        result.current.exportToMarkdown(sampleItems);
      });

      expect(result.current.isExporting).toBe(false);
    });
  });
});

describe('integration', () => {
  it('should produce valid markdown structure', () => {
    const { result } = renderHook(() => useMarkdownExport());

    let exportResult: ReturnType<typeof result.current.exportToMarkdown> | undefined;
    act(() => {
      exportResult = result.current.exportToMarkdown(sampleItems);
    });

    const content = exportResult!.content;

    // Should have document title
    expect(content).toMatch(/^# Spec Tree Export/);

    // Should have footer
    expect(content).toContain('---');
    expect(content).toContain('*Exported on');
  });

  it('should handle empty items array', () => {
    const { result } = renderHook(() => useMarkdownExport());

    let exportResult: ReturnType<typeof result.current.exportToMarkdown> | undefined;
    act(() => {
      exportResult = result.current.exportToMarkdown([]);
    });

    expect(exportResult!.itemCount).toBe(0);
    expect(exportResult!.content).toContain('*No items to export.*');
  });

  it('should escape pipe characters in table format', () => {
    const itemsWithPipes: ExportableWorkItem[] = [
      {
        id: 'test-1',
        type: 'epic',
        title: 'Title | With | Pipes',
        description: 'Description | also | has | pipes',
      },
    ];

    const { result } = renderHook(() => useMarkdownExport());

    let exportResult: ReturnType<typeof result.current.exportToMarkdown> | undefined;
    act(() => {
      exportResult = result.current.exportToMarkdown(itemsWithPipes, { style: 'table' });
    });

    expect(exportResult!.content).toContain('\\|');
  });

  it('should maintain hierarchy in hierarchical style', () => {
    const { result } = renderHook(() => useMarkdownExport());

    let exportResult: ReturnType<typeof result.current.exportToMarkdown> | undefined;
    act(() => {
      exportResult = result.current.exportToMarkdown(sampleItems, { style: 'hierarchical' });
    });

    const content = exportResult!.content;

    // Epic should come before its children in the output
    const epicIndex = content.indexOf('Epic One');
    const featureIndex = content.indexOf('Feature One');
    const storyIndex = content.indexOf('Story One');
    const taskIndex = content.indexOf('Task One');

    expect(epicIndex).toBeLessThan(featureIndex);
    expect(featureIndex).toBeLessThan(storyIndex);
    expect(storyIndex).toBeLessThan(taskIndex);
  });
});
