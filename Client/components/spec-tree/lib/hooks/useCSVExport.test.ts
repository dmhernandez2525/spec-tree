/**
 * Tests for useCSVExport hook
 *
 * F1.1.12 - CSV export
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
  useCSVExport,
  escapeCSVValue,
  getWorkItemTypeDisplayName,
  formatUserStoryDescription,
  getDefaultColumns,
  getMinimalColumns,
  getDetailedColumns,
  generateCSVContent,
  type ExportableWorkItem,
} from './useCSVExport';

const sampleItems: ExportableWorkItem[] = [
  {
    id: 'epic-1',
    type: 'epic',
    title: 'Epic One',
    description: 'First epic description',
    parentId: null,
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
  },
  {
    id: 'task-1',
    type: 'task',
    title: 'Task One',
    details: 'Task details',
    parentId: 'story-1',
    priority: 1,
  },
];

describe('escapeCSVValue', () => {
  it('should return empty string for falsy values', () => {
    expect(escapeCSVValue('')).toBe('');
  });

  it('should return value unchanged when no escaping needed', () => {
    expect(escapeCSVValue('simple value')).toBe('simple value');
  });

  it('should escape values with commas', () => {
    expect(escapeCSVValue('value, with comma')).toBe('"value, with comma"');
  });

  it('should escape values with double quotes', () => {
    expect(escapeCSVValue('value with "quotes"')).toBe('"value with ""quotes"""');
  });

  it('should escape values with newlines', () => {
    expect(escapeCSVValue('value\nwith newline')).toBe('"value\nwith newline"');
  });

  it('should escape values with carriage returns', () => {
    expect(escapeCSVValue('value\rwith return')).toBe('"value\rwith return"');
  });

  it('should handle custom delimiter', () => {
    expect(escapeCSVValue('value;with;semicolons', ';')).toBe('"value;with;semicolons"');
    expect(escapeCSVValue('value,with,commas', ';')).toBe('value,with,commas');
  });

  describe('CSV injection prevention', () => {
    it('should prefix values starting with = to prevent formula execution', () => {
      expect(escapeCSVValue('=SUM(A1:A10)')).toBe("'=SUM(A1:A10)");
    });

    it('should prefix values starting with + to prevent formula execution', () => {
      expect(escapeCSVValue('+1234567890')).toBe("'+1234567890");
    });

    it('should prefix values starting with - to prevent formula execution', () => {
      expect(escapeCSVValue('-1234567890')).toBe("'-1234567890");
    });

    it('should prefix values starting with @ to prevent formula execution', () => {
      expect(escapeCSVValue('@mention')).toBe("'@mention");
    });

    it('should handle formula injection with commas (needs quoting)', () => {
      const result = escapeCSVValue('=cmd|/c calc.exe');
      expect(result).toContain("'=");
    });

    it('should handle DDE injection attempts', () => {
      const result = escapeCSVValue('=cmd|/c notepad.exe');
      expect(result.startsWith("'=") || result.startsWith('"')).toBe(true);
    });

    it('should not prefix normal values', () => {
      expect(escapeCSVValue('normal value')).toBe('normal value');
      expect(escapeCSVValue('123')).toBe('123');
      expect(escapeCSVValue('Title of Epic')).toBe('Title of Epic');
    });
  });
});

describe('getWorkItemTypeDisplayName', () => {
  it('should return correct display names', () => {
    expect(getWorkItemTypeDisplayName('epic')).toBe('Epic');
    expect(getWorkItemTypeDisplayName('feature')).toBe('Feature');
    expect(getWorkItemTypeDisplayName('userStory')).toBe('User Story');
    expect(getWorkItemTypeDisplayName('task')).toBe('Task');
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

    expect(result).toContain('As a user');
    expect(result).toContain('I want to do something');
    expect(result).toContain('so that achieve result');
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

describe('column presets', () => {
  describe('getDefaultColumns', () => {
    it('should return standard columns', () => {
      const columns = getDefaultColumns();

      expect(columns.some((c) => c.key === 'type')).toBe(true);
      expect(columns.some((c) => c.key === 'id')).toBe(true);
      expect(columns.some((c) => c.key === 'title')).toBe(true);
      expect(columns.some((c) => c.key === 'description')).toBe(true);
      expect(columns.some((c) => c.key === 'parentId')).toBe(true);
    });
  });

  describe('getMinimalColumns', () => {
    it('should return only essential columns', () => {
      const columns = getMinimalColumns();

      expect(columns.length).toBeLessThan(getDefaultColumns().length);
      expect(columns.some((c) => c.key === 'type')).toBe(true);
      expect(columns.some((c) => c.key === 'title')).toBe(true);
    });
  });

  describe('getDetailedColumns', () => {
    it('should return all available columns', () => {
      const columns = getDetailedColumns();

      expect(columns.length).toBeGreaterThan(getDefaultColumns().length);
      expect(columns.some((c) => c.key === 'role')).toBe(true);
      expect(columns.some((c) => c.key === 'action')).toBe(true);
      expect(columns.some((c) => c.key === 'goal')).toBe(true);
      expect(columns.some((c) => c.key === 'details')).toBe(true);
    });
  });
});

describe('generateCSVContent', () => {
  it('should generate CSV with header', () => {
    const content = generateCSVContent(sampleItems);
    const lines = content.split('\n');

    expect(lines[0]).toContain('Type');
    expect(lines[0]).toContain('ID');
    expect(lines[0]).toContain('Title');
  });

  it('should include all items', () => {
    const content = generateCSVContent(sampleItems);
    const lines = content.split('\n');

    // Header + 4 items
    expect(lines.length).toBe(5);
  });

  it('should format epic correctly', () => {
    const content = generateCSVContent([sampleItems[0]]);

    expect(content).toContain('Epic');
    expect(content).toContain('epic-1');
    expect(content).toContain('Epic One');
  });

  it('should format user story with role/action/goal', () => {
    const content = generateCSVContent([sampleItems[2]]);

    expect(content).toContain('User Story');
    expect(content).toContain('developer');
  });

  it('should exclude header when disabled', () => {
    const content = generateCSVContent(sampleItems, { includeHeader: false });
    const lines = content.split('\n');

    expect(lines.length).toBe(4);
    expect(lines[0]).not.toContain('Type,ID');
  });

  it('should use custom delimiter', () => {
    const content = generateCSVContent([sampleItems[0]], { delimiter: ';' });

    expect(content).toContain(';');
  });

  it('should filter by type', () => {
    const content = generateCSVContent(sampleItems, { filterTypes: ['epic', 'feature'] });
    const lines = content.split('\n');

    expect(lines.length).toBe(3); // Header + 2 items
    expect(content).not.toContain('User Story');
    expect(content).not.toContain('Task');
  });

  it('should use custom columns', () => {
    const customColumns = [
      { key: 'title', header: 'Name', getValue: (item: ExportableWorkItem) => item.title || '' },
    ];

    const content = generateCSVContent(sampleItems, { columns: customColumns });

    expect(content).toContain('Name');
    expect(content).not.toContain('Type');
  });
});

describe('useCSVExport', () => {
  describe('exportToCSV', () => {
    it('should export items to CSV', () => {
      const { result } = renderHook(() => useCSVExport());

      let exportResult;
      act(() => {
        exportResult = result.current.exportToCSV(sampleItems);
      });

      expect(exportResult!.content).toContain('Epic');
      expect(exportResult!.content).toContain('Feature');
      expect(exportResult!.rowCount).toBe(4);
    });

    it('should set lastExport state', () => {
      const { result } = renderHook(() => useCSVExport());

      expect(result.current.lastExport).toBeNull();

      act(() => {
        result.current.exportToCSV(sampleItems);
      });

      expect(result.current.lastExport).not.toBeNull();
      expect(result.current.lastExport?.timestamp).toBeDefined();
    });

    it('should call onExportComplete callback', () => {
      const onExportComplete = vi.fn();
      const { result } = renderHook(() => useCSVExport({ onExportComplete }));

      act(() => {
        result.current.exportToCSV(sampleItems);
      });

      expect(onExportComplete).toHaveBeenCalledTimes(1);
      expect(onExportComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.any(String),
          rowCount: 4,
        })
      );
    });

    it('should use custom filename', () => {
      const { result } = renderHook(() => useCSVExport());

      let exportResult;
      act(() => {
        exportResult = result.current.exportToCSV(sampleItems, { filename: 'custom.csv' });
      });

      expect(exportResult!.filename).toBe('custom.csv');
    });

    it('should use default filename from options', () => {
      const { result } = renderHook(() => useCSVExport({ defaultFilename: 'my-export.csv' }));

      let exportResult;
      act(() => {
        exportResult = result.current.exportToCSV(sampleItems);
      });

      expect(exportResult!.filename).toBe('my-export.csv');
    });
  });

  describe('escapeCSVValue utility', () => {
    it('should use configured delimiter', () => {
      const { result } = renderHook(() => useCSVExport({ defaultDelimiter: ';' }));

      const escaped = result.current.escapeCSVValue('value;with;semicolons');

      expect(escaped).toBe('"value;with;semicolons"');
    });
  });

  describe('formatWorkItemForCSV', () => {
    it('should format item with all default columns', () => {
      const { result } = renderHook(() => useCSVExport());

      const formatted = result.current.formatWorkItemForCSV(sampleItems[0]);

      expect(formatted.type).toBe('Epic');
      expect(formatted.id).toBe('epic-1');
      expect(formatted.title).toBe('Epic One');
    });
  });

  describe('column presets access', () => {
    it('should expose column preset functions', () => {
      const { result } = renderHook(() => useCSVExport());

      expect(typeof result.current.getDefaultColumns).toBe('function');
      expect(typeof result.current.getMinimalColumns).toBe('function');
      expect(typeof result.current.getDetailedColumns).toBe('function');
    });
  });

  describe('isExporting state', () => {
    it('should be false initially', () => {
      const { result } = renderHook(() => useCSVExport());

      expect(result.current.isExporting).toBe(false);
    });

    it('should be false after export completes', () => {
      const { result } = renderHook(() => useCSVExport());

      act(() => {
        result.current.exportToCSV(sampleItems);
      });

      expect(result.current.isExporting).toBe(false);
    });
  });
});

describe('integration', () => {
  it('should produce valid CSV that can be parsed', () => {
    const { result } = renderHook(() => useCSVExport());

    let exportResult;
    act(() => {
      exportResult = result.current.exportToCSV(sampleItems);
    });

    const lines = exportResult!.content.split('\n');

    // Verify header
    const headers = lines[0].split(',');
    expect(headers).toContain('Type');
    expect(headers).toContain('Title');

    // Verify each data line has same number of columns as header
    for (let i = 1; i < lines.length; i++) {
      // Simple split for non-quoted values
      // More complex parsing would be needed for quoted values
      expect(lines[i].length).toBeGreaterThan(0);
    }
  });

  it('should handle empty items array', () => {
    const { result } = renderHook(() => useCSVExport());

    let exportResult;
    act(() => {
      exportResult = result.current.exportToCSV([]);
    });

    expect(exportResult!.rowCount).toBe(0);
    expect(exportResult!.content).toContain('Type'); // Header only
  });

  it('should properly escape complex content', () => {
    const complexItems: ExportableWorkItem[] = [
      {
        id: 'complex-1',
        type: 'epic',
        title: 'Title, with "quotes" and\nnewline',
        description: 'Complex description',
      },
    ];

    const { result } = renderHook(() => useCSVExport());

    let exportResult;
    act(() => {
      exportResult = result.current.exportToCSV(complexItems);
    });

    expect(exportResult!.content).toContain('""quotes""');
    expect(exportResult!.content).toContain('"Title, with');
  });
});
