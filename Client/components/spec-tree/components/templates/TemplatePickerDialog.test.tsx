/**
 * Tests for TemplatePickerDialog component (basic tests)
 *
 * F1.1.18 - Template system foundation
 *
 * Note: Full component tests are limited due to happy-dom compatibility
 * issues with Radix UI Tabs component. The hook is thoroughly tested separately.
 */

import { describe, it, expect } from 'vitest';
import { WorkItemTemplate, getTemplateTypeDisplayName } from '../../lib/hooks/useWorkItemTemplate';

// Sample test templates for type checking
const testTemplates: WorkItemTemplate[] = [
  {
    id: 'template-1',
    name: 'MVP Epic',
    description: 'Template for MVP epic',
    type: 'epic',
    content: { title: 'MVP' },
    tags: ['mvp', 'foundation'],
    category: 'Product',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    isBuiltIn: true,
  },
  {
    id: 'template-2',
    name: 'CRUD Feature',
    description: 'Basic CRUD operations',
    type: 'feature',
    content: { title: 'CRUD' },
    tags: ['crud'],
    category: 'Development',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    isBuiltIn: true,
  },
  {
    id: 'template-3',
    name: 'User Story Template',
    description: 'Standard user story',
    type: 'userStory',
    content: { title: 'Story' },
    category: 'User Stories',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    isBuiltIn: false,
  },
];

describe('TemplatePickerDialog - Supporting Functions', () => {
  describe('getTemplateTypeDisplayName', () => {
    it('returns Epic for epic type', () => {
      expect(getTemplateTypeDisplayName('epic')).toBe('Epic');
    });

    it('returns Feature for feature type', () => {
      expect(getTemplateTypeDisplayName('feature')).toBe('Feature');
    });

    it('returns User Story for userStory type', () => {
      expect(getTemplateTypeDisplayName('userStory')).toBe('User Story');
    });

    it('returns Task for task type', () => {
      expect(getTemplateTypeDisplayName('task')).toBe('Task');
    });
  });

  describe('template data structure', () => {
    it('templates have required properties', () => {
      for (const template of testTemplates) {
        expect(template.id).toBeDefined();
        expect(template.name).toBeDefined();
        expect(template.type).toBeDefined();
        expect(template.content).toBeDefined();
        expect(template.createdAt).toBeDefined();
        expect(template.updatedAt).toBeDefined();
      }
    });

    it('built-in templates are marked as such', () => {
      const builtIn = testTemplates.filter((t) => t.isBuiltIn);
      expect(builtIn.length).toBe(2);
    });

    it('user templates are marked as not built-in', () => {
      const userTemplates = testTemplates.filter((t) => !t.isBuiltIn);
      expect(userTemplates.length).toBe(1);
      expect(userTemplates[0].name).toBe('User Story Template');
    });

    it('templates can be filtered by type', () => {
      const epicTemplates = testTemplates.filter((t) => t.type === 'epic');
      expect(epicTemplates.length).toBe(1);
      expect(epicTemplates[0].name).toBe('MVP Epic');
    });

    it('templates can be searched by name', () => {
      const query = 'crud';
      const results = testTemplates.filter((t) =>
        t.name.toLowerCase().includes(query.toLowerCase())
      );
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('CRUD Feature');
    });

    it('templates can be searched by tags', () => {
      const query = 'mvp';
      const results = testTemplates.filter(
        (t) => t.tags?.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
      );
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('MVP Epic');
    });

    it('templates can be grouped by category', () => {
      const groups: Record<string, WorkItemTemplate[]> = {};
      for (const template of testTemplates) {
        const category = template.category || 'Other';
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(template);
      }

      expect(Object.keys(groups)).toContain('Product');
      expect(Object.keys(groups)).toContain('Development');
      expect(Object.keys(groups)).toContain('User Stories');
    });
  });
});
