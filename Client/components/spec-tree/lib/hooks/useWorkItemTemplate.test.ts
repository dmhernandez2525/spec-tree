/**
 * Tests for useWorkItemTemplate hook
 *
 * F1.1.18 - Template system foundation
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useWorkItemTemplate,
  BUILT_IN_TEMPLATES,
  getTemplateTypeDisplayName,
  WorkItemTemplate,
  FeatureTemplateContent,
} from './useWorkItemTemplate';

describe('useWorkItemTemplate', () => {
  describe('initialization', () => {
    it('starts with built-in templates', () => {
      const { result } = renderHook(() => useWorkItemTemplate());

      expect(result.current.templates.length).toBeGreaterThan(0);
      expect(result.current.templates.some((t) => t.isBuiltIn)).toBe(true);
    });
  });

  describe('getTemplatesByType', () => {
    it('filters templates by type', () => {
      const { result } = renderHook(() => useWorkItemTemplate());

      const epicTemplates = result.current.getTemplatesByType('epic');
      expect(epicTemplates.every((t) => t.type === 'epic')).toBe(true);
    });

    it('returns empty array for type with no templates', () => {
      const { result } = renderHook(() =>
        useWorkItemTemplate({ builtInTemplates: [] })
      );

      const templates = result.current.getTemplatesByType('epic');
      expect(templates).toEqual([]);
    });
  });

  describe('getTemplate', () => {
    it('returns template by ID', () => {
      const { result } = renderHook(() => useWorkItemTemplate());

      const template = result.current.getTemplate('builtin-epic-mvp');
      expect(template).toBeDefined();
      expect(template?.name).toBe('MVP Epic');
    });

    it('returns undefined for non-existent ID', () => {
      const { result } = renderHook(() => useWorkItemTemplate());

      const template = result.current.getTemplate('non-existent');
      expect(template).toBeUndefined();
    });
  });

  describe('saveAsTemplate', () => {
    it('creates a new template', () => {
      const { result } = renderHook(() => useWorkItemTemplate());

      let newTemplate: WorkItemTemplate;
      act(() => {
        newTemplate = result.current.saveAsTemplate(
          'My Custom Template',
          'feature',
          { title: 'Custom Feature', description: 'Test' }
        );
      });

      expect(newTemplate!.name).toBe('My Custom Template');
      expect(newTemplate!.type).toBe('feature');
      expect(newTemplate!.isBuiltIn).toBe(false);
      expect(result.current.templates.some((t) => t.id === newTemplate!.id)).toBe(true);
    });

    it('supports optional description, tags, and category', () => {
      const { result } = renderHook(() => useWorkItemTemplate());

      let newTemplate: WorkItemTemplate;
      act(() => {
        newTemplate = result.current.saveAsTemplate(
          'Tagged Template',
          'task',
          { title: 'Test Task' },
          {
            description: 'A test template',
            tags: ['test', 'example'],
            category: 'Testing',
          }
        );
      });

      expect(newTemplate!.description).toBe('A test template');
      expect(newTemplate!.tags).toEqual(['test', 'example']);
      expect(newTemplate!.category).toBe('Testing');
    });
  });

  describe('updateTemplate', () => {
    it('updates a user template', () => {
      const { result } = renderHook(() => useWorkItemTemplate());

      let savedTemplate: WorkItemTemplate;
      act(() => {
        savedTemplate = result.current.saveAsTemplate('Original', 'feature', {
          title: 'Original Title',
        });
      });

      act(() => {
        result.current.updateTemplate(savedTemplate.id, {
          name: 'Updated Name',
        });
      });

      // Check the template was updated in the list
      const updated = result.current.getTemplate(savedTemplate.id);
      expect(updated?.name).toBe('Updated Name');
    });

    it('does not update built-in templates', () => {
      const { result } = renderHook(() => useWorkItemTemplate());

      act(() => {
        result.current.updateTemplate('builtin-epic-mvp', {
          name: 'Hacked Name',
        });
      });

      // Original should be unchanged
      expect(result.current.getTemplate('builtin-epic-mvp')?.name).toBe('MVP Epic');
    });

    it('returns null for non-existent template', () => {
      const { result } = renderHook(() => useWorkItemTemplate());

      let updated: WorkItemTemplate | null;
      act(() => {
        updated = result.current.updateTemplate('non-existent', { name: 'Test' });
      });

      expect(updated).toBeNull();
    });
  });

  describe('deleteTemplate', () => {
    it('deletes a user template', () => {
      const { result } = renderHook(() => useWorkItemTemplate());

      let savedTemplate: WorkItemTemplate;
      act(() => {
        savedTemplate = result.current.saveAsTemplate('To Delete', 'task', {
          title: 'Test',
        });
      });

      act(() => {
        result.current.deleteTemplate(savedTemplate.id);
      });

      // Check it's gone
      expect(result.current.getTemplate(savedTemplate.id)).toBeUndefined();
    });

    it('does not delete built-in templates', () => {
      const { result } = renderHook(() => useWorkItemTemplate());

      let deleted: boolean;
      act(() => {
        deleted = result.current.deleteTemplate('builtin-epic-mvp');
      });

      expect(deleted).toBe(false);
      expect(result.current.getTemplate('builtin-epic-mvp')).toBeDefined();
    });

    it('returns false for non-existent template', () => {
      const { result } = renderHook(() => useWorkItemTemplate());

      let deleted: boolean;
      act(() => {
        deleted = result.current.deleteTemplate('non-existent');
      });

      expect(deleted).toBe(false);
    });
  });

  describe('applyTemplate', () => {
    it('returns a copy of template content', () => {
      const { result } = renderHook(() => useWorkItemTemplate());

      let content: FeatureTemplateContent | null;
      act(() => {
        content = result.current.applyTemplate('builtin-feature-crud') as FeatureTemplateContent;
      });

      expect(content).not.toBeNull();
      expect(content!.acceptanceCriteria).toBeDefined();
      expect(content!.acceptanceCriteria!.length).toBeGreaterThan(0);
    });

    it('returns a deep copy (modifications do not affect original)', () => {
      const { result } = renderHook(() => useWorkItemTemplate());

      let content: FeatureTemplateContent | null;
      act(() => {
        content = result.current.applyTemplate('builtin-feature-crud') as FeatureTemplateContent;
      });

      // Modify the returned content
      content!.priority = 'Low';

      // Original should be unchanged
      const original = result.current.getTemplate('builtin-feature-crud');
      expect((original!.content as FeatureTemplateContent).priority).toBe('High');
    });

    it('returns null for non-existent template', () => {
      const { result } = renderHook(() => useWorkItemTemplate());

      let content: unknown;
      act(() => {
        content = result.current.applyTemplate('non-existent');
      });

      expect(content).toBeNull();
    });
  });

  describe('duplicateTemplate', () => {
    it('creates a copy of a template', () => {
      const { result } = renderHook(() => useWorkItemTemplate());

      let duplicate: WorkItemTemplate | null;
      act(() => {
        duplicate = result.current.duplicateTemplate('builtin-epic-mvp');
      });

      expect(duplicate).not.toBeNull();
      expect(duplicate!.id).not.toBe('builtin-epic-mvp');
      expect(duplicate!.name).toBe('MVP Epic (Copy)');
      expect(duplicate!.isBuiltIn).toBe(false);
    });

    it('uses custom name when provided', () => {
      const { result } = renderHook(() => useWorkItemTemplate());

      let duplicate: WorkItemTemplate | null;
      act(() => {
        duplicate = result.current.duplicateTemplate('builtin-epic-mvp', 'My Epic Copy');
      });

      expect(duplicate!.name).toBe('My Epic Copy');
    });

    it('returns null for non-existent template', () => {
      const { result } = renderHook(() => useWorkItemTemplate());

      let duplicate: WorkItemTemplate | null;
      act(() => {
        duplicate = result.current.duplicateTemplate('non-existent');
      });

      expect(duplicate).toBeNull();
    });
  });

  describe('searchTemplates', () => {
    it('searches by name', () => {
      const { result } = renderHook(() => useWorkItemTemplate());

      const results = result.current.searchTemplates('MVP');
      expect(results.some((t) => t.name === 'MVP Epic')).toBe(true);
    });

    it('searches by description', () => {
      const { result } = renderHook(() => useWorkItemTemplate());

      const results = result.current.searchTemplates('minimum viable');
      expect(results.some((t) => t.name === 'MVP Epic')).toBe(true);
    });

    it('searches by tags', () => {
      const { result } = renderHook(() => useWorkItemTemplate());

      const results = result.current.searchTemplates('crud');
      expect(results.some((t) => t.name === 'CRUD Feature')).toBe(true);
    });

    it('returns all templates for empty query', () => {
      const { result } = renderHook(() => useWorkItemTemplate());

      const results = result.current.searchTemplates('');
      expect(results.length).toBe(result.current.templates.length);
    });

    it('is case insensitive', () => {
      const { result } = renderHook(() => useWorkItemTemplate());

      const results = result.current.searchTemplates('mvp');
      expect(results.some((t) => t.name === 'MVP Epic')).toBe(true);
    });
  });

  describe('exportTemplates', () => {
    it('exports user templates as JSON', () => {
      const { result } = renderHook(() => useWorkItemTemplate());

      act(() => {
        result.current.saveAsTemplate('Export Test', 'feature', { title: 'Test' });
      });

      const json = result.current.exportTemplates();
      const parsed = JSON.parse(json);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.some((t: WorkItemTemplate) => t.name === 'Export Test')).toBe(true);
      // Should not include built-in templates
      expect(parsed.some((t: WorkItemTemplate) => t.isBuiltIn)).toBe(false);
    });

    it('exports specific templates by ID', () => {
      const { result } = renderHook(() => useWorkItemTemplate());

      let template1: WorkItemTemplate;
      act(() => {
        template1 = result.current.saveAsTemplate('Template 1', 'epic', { title: '1' });
        result.current.saveAsTemplate('Template 2', 'epic', { title: '2' });
      });

      const json = result.current.exportTemplates([template1!.id]);
      const parsed = JSON.parse(json);

      expect(parsed.length).toBe(1);
      expect(parsed[0].name).toBe('Template 1');
    });
  });

  describe('importTemplates', () => {
    it('imports valid templates', () => {
      const { result } = renderHook(() => useWorkItemTemplate());

      const toImport = [
        {
          name: 'Imported Template',
          type: 'task',
          content: { title: 'Imported Task' },
        },
      ];

      let importResult: { imported: number; errors: string[] };
      act(() => {
        importResult = result.current.importTemplates(JSON.stringify(toImport));
      });

      expect(importResult!.imported).toBe(1);
      expect(importResult!.errors.length).toBe(0);
      expect(result.current.templates.some((t) => t.name === 'Imported Template')).toBe(true);
    });

    it('handles invalid JSON', () => {
      const { result } = renderHook(() => useWorkItemTemplate());

      let importResult: { imported: number; errors: string[] };
      act(() => {
        importResult = result.current.importTemplates('invalid json');
      });

      expect(importResult!.imported).toBe(0);
      expect(importResult!.errors.length).toBeGreaterThan(0);
    });

    it('handles templates missing required fields', () => {
      const { result } = renderHook(() => useWorkItemTemplate());

      const invalid = [{ name: 'Missing Fields' }]; // Missing type and content

      let importResult: { imported: number; errors: string[] };
      act(() => {
        importResult = result.current.importTemplates(JSON.stringify(invalid));
      });

      expect(importResult!.imported).toBe(0);
      expect(importResult!.errors.length).toBeGreaterThan(0);
    });

    it('handles invalid type', () => {
      const { result } = renderHook(() => useWorkItemTemplate());

      const invalid = [
        { name: 'Bad Type', type: 'invalidType', content: {} },
      ];

      let importResult: { imported: number; errors: string[] };
      act(() => {
        importResult = result.current.importTemplates(JSON.stringify(invalid));
      });

      expect(importResult!.imported).toBe(0);
      expect(importResult!.errors.some((e) => e.includes('Invalid template type'))).toBe(true);
    });
  });

  describe('clearUserTemplates', () => {
    it('removes all user templates but keeps built-in', () => {
      const { result } = renderHook(() => useWorkItemTemplate());

      act(() => {
        result.current.saveAsTemplate('User Template 1', 'epic', { title: '1' });
        result.current.saveAsTemplate('User Template 2', 'feature', { title: '2' });
      });

      const beforeCount = result.current.templates.length;

      act(() => {
        result.current.clearUserTemplates();
      });

      expect(result.current.templates.length).toBeLessThan(beforeCount);
      expect(result.current.templates.every((t) => t.isBuiltIn)).toBe(true);
    });
  });
});

describe('BUILT_IN_TEMPLATES', () => {
  it('includes templates for all types', () => {
    const types = BUILT_IN_TEMPLATES.map((t) => t.type);
    expect(types).toContain('epic');
    expect(types).toContain('feature');
    expect(types).toContain('userStory');
    expect(types).toContain('task');
  });

  it('all templates have required fields', () => {
    for (const template of BUILT_IN_TEMPLATES) {
      expect(template.id).toBeDefined();
      expect(template.name).toBeDefined();
      expect(template.type).toBeDefined();
      expect(template.content).toBeDefined();
      expect(template.isBuiltIn).toBe(true);
    }
  });
});

describe('getTemplateTypeDisplayName', () => {
  it('returns correct display names', () => {
    expect(getTemplateTypeDisplayName('epic')).toBe('Epic');
    expect(getTemplateTypeDisplayName('feature')).toBe('Feature');
    expect(getTemplateTypeDisplayName('userStory')).toBe('User Story');
    expect(getTemplateTypeDisplayName('task')).toBe('Task');
  });
});
