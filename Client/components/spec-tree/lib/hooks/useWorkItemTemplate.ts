/**
 * Work Item Template Hook
 *
 * F1.1.18 - Template system foundation
 *
 * Provides functionality to save work items as templates and reuse them.
 */

import { useState, useCallback, useEffect } from 'react';

/**
 * Template work item type
 */
export type TemplateWorkItemType = 'epic' | 'feature' | 'userStory' | 'task';

/**
 * Base template structure
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface WorkItemTemplate<T = any> {
  /** Unique template ID */
  id: string;
  /** Template name */
  name: string;
  /** Template description */
  description?: string;
  /** Work item type this template applies to */
  type: TemplateWorkItemType;
  /** Template content - the work item data */
  content: T;
  /** Tags for categorization */
  tags?: string[];
  /** When the template was created */
  createdAt: string;
  /** When the template was last updated */
  updatedAt: string;
  /** Category for grouping */
  category?: string;
  /** Whether this is a built-in template */
  isBuiltIn?: boolean;
}

/**
 * Epic template content
 */
export interface EpicTemplateContent {
  title?: string;
  description?: string;
  goal?: string;
  successCriteria?: string;
  dependencies?: string;
  timeline?: string;
  resources?: string;
  notes?: string;
}

/**
 * Feature template content
 */
export interface FeatureTemplateContent {
  title?: string;
  description?: string;
  details?: string;
  acceptanceCriteria?: Array<{ text: string }>;
  notes?: string;
  priority?: string;
  effort?: string;
}

/**
 * User story template content
 */
export interface UserStoryTemplateContent {
  title?: string;
  role?: string;
  action?: string;
  goal?: string;
  points?: string;
  acceptanceCriteria?: Array<{ text: string }>;
  notes?: string;
}

/**
 * Task template content
 */
export interface TaskTemplateContent {
  title?: string;
  details?: string;
  priority?: number;
  notes?: string;
}

/**
 * Template content union type
 */
export type TemplateContent =
  | EpicTemplateContent
  | FeatureTemplateContent
  | UserStoryTemplateContent
  | TaskTemplateContent;

/**
 * Template store (persisted to localStorage)
 */
export interface TemplateStore {
  templates: WorkItemTemplate[];
  lastUpdated: string;
}

/**
 * Options for useWorkItemTemplate hook
 */
export interface UseWorkItemTemplateOptions {
  /** Storage key for localStorage */
  storageKey?: string;
  /** Initial templates (built-in) */
  builtInTemplates?: WorkItemTemplate[];
}

/**
 * Return type for useWorkItemTemplate hook
 */
export interface UseWorkItemTemplateReturn {
  /** All templates */
  templates: WorkItemTemplate[];
  /** Templates filtered by type */
  getTemplatesByType: (type: TemplateWorkItemType) => WorkItemTemplate[];
  /** Get a template by ID */
  getTemplate: (id: string) => WorkItemTemplate | undefined;
  /** Save a work item as a template */
  saveAsTemplate: (
    name: string,
    type: TemplateWorkItemType,
    content: TemplateContent,
    options?: { description?: string; tags?: string[]; category?: string }
  ) => WorkItemTemplate;
  /** Update an existing template */
  updateTemplate: (
    id: string,
    updates: Partial<Omit<WorkItemTemplate, 'id' | 'createdAt' | 'isBuiltIn'>>
  ) => WorkItemTemplate | null;
  /** Delete a template */
  deleteTemplate: (id: string) => boolean;
  /** Apply a template to create new content */
  applyTemplate: (id: string) => TemplateContent | null;
  /** Duplicate a template */
  duplicateTemplate: (id: string, newName?: string) => WorkItemTemplate | null;
  /** Search templates */
  searchTemplates: (query: string) => WorkItemTemplate[];
  /** Export templates as JSON */
  exportTemplates: (templateIds?: string[]) => string;
  /** Import templates from JSON */
  importTemplates: (json: string) => { imported: number; errors: string[] };
  /** Clear all user templates (keep built-in) */
  clearUserTemplates: () => void;
}

/**
 * Default storage key
 */
const DEFAULT_STORAGE_KEY = 'spec-tree-templates';

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `template-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Built-in templates
 */
export const BUILT_IN_TEMPLATES: WorkItemTemplate[] = [
  {
    id: 'builtin-epic-mvp',
    name: 'MVP Epic',
    description: 'Template for minimum viable product epic',
    type: 'epic',
    content: {
      description: 'Implement the minimum viable product features',
      goal: 'Deliver core functionality to early adopters',
      successCriteria: 'All MVP features are complete and tested',
      timeline: 'Sprint 1-3',
    } as EpicTemplateContent,
    tags: ['mvp', 'foundation'],
    category: 'Product',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    isBuiltIn: true,
  },
  {
    id: 'builtin-feature-crud',
    name: 'CRUD Feature',
    description: 'Template for a basic CRUD feature',
    type: 'feature',
    content: {
      details: 'Implement create, read, update, and delete operations',
      acceptanceCriteria: [
        { text: 'Users can create new items' },
        { text: 'Users can view item details' },
        { text: 'Users can update existing items' },
        { text: 'Users can delete items' },
        { text: 'All operations have proper validation' },
      ],
      priority: 'High',
      effort: 'Medium',
    } as FeatureTemplateContent,
    tags: ['crud', 'data'],
    category: 'Development',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    isBuiltIn: true,
  },
  {
    id: 'builtin-story-user-action',
    name: 'User Action Story',
    description: 'Template for standard user action story',
    type: 'userStory',
    content: {
      role: 'user',
      points: '3',
      acceptanceCriteria: [
        { text: 'Given [precondition], when [action], then [expected result]' },
      ],
    } as UserStoryTemplateContent,
    tags: ['user', 'action'],
    category: 'User Stories',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    isBuiltIn: true,
  },
  {
    id: 'builtin-task-implementation',
    name: 'Implementation Task',
    description: 'Template for a code implementation task',
    type: 'task',
    content: {
      details: '1. Implement the logic\n2. Write unit tests\n3. Update documentation',
      priority: 2,
    } as TaskTemplateContent,
    tags: ['development', 'coding'],
    category: 'Development',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    isBuiltIn: true,
  },
];

/**
 * Load templates from localStorage
 */
function loadTemplates(storageKey: string, builtInTemplates: WorkItemTemplate[]): WorkItemTemplate[] {
  if (typeof window === 'undefined') {
    return builtInTemplates;
  }

  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const store: TemplateStore = JSON.parse(stored);
      // Merge built-in templates with user templates
      const userTemplates = store.templates.filter((t) => !t.isBuiltIn);
      return [...builtInTemplates, ...userTemplates];
    }
  } catch {
    // Ignore parse errors
  }

  return builtInTemplates;
}

/**
 * Save templates to localStorage
 */
function saveTemplates(storageKey: string, templates: WorkItemTemplate[]): void {
  if (typeof window === 'undefined') return;

  try {
    // Only save user templates (not built-in)
    const userTemplates = templates.filter((t) => !t.isBuiltIn);
    const store: TemplateStore = {
      templates: userTemplates,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(storageKey, JSON.stringify(store));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Hook for managing work item templates
 */
export function useWorkItemTemplate(
  options: UseWorkItemTemplateOptions = {}
): UseWorkItemTemplateReturn {
  const {
    storageKey = DEFAULT_STORAGE_KEY,
    builtInTemplates = BUILT_IN_TEMPLATES,
  } = options;

  const [templates, setTemplates] = useState<WorkItemTemplate[]>(() =>
    loadTemplates(storageKey, builtInTemplates)
  );

  // Save to localStorage when templates change
  useEffect(() => {
    saveTemplates(storageKey, templates);
  }, [templates, storageKey]);

  /**
   * Get templates filtered by type
   */
  const getTemplatesByType = useCallback(
    (type: TemplateWorkItemType): WorkItemTemplate[] => {
      return templates.filter((t) => t.type === type);
    },
    [templates]
  );

  /**
   * Get a template by ID
   */
  const getTemplate = useCallback(
    (id: string): WorkItemTemplate | undefined => {
      return templates.find((t) => t.id === id);
    },
    [templates]
  );

  /**
   * Save a work item as a template
   */
  const saveAsTemplate = useCallback(
    (
      name: string,
      type: TemplateWorkItemType,
      content: TemplateContent,
      opts?: { description?: string; tags?: string[]; category?: string }
    ): WorkItemTemplate => {
      const now = new Date().toISOString();
      const template: WorkItemTemplate = {
        id: generateId(),
        name,
        description: opts?.description,
        type,
        content,
        tags: opts?.tags,
        category: opts?.category,
        createdAt: now,
        updatedAt: now,
        isBuiltIn: false,
      };

      setTemplates((prev) => [...prev, template]);
      return template;
    },
    []
  );

  /**
   * Update an existing template
   */
  const updateTemplate = useCallback(
    (
      id: string,
      updates: Partial<Omit<WorkItemTemplate, 'id' | 'createdAt' | 'isBuiltIn'>>
    ): WorkItemTemplate | null => {
      let updated: WorkItemTemplate | null = null;

      setTemplates((prev) =>
        prev.map((t) => {
          if (t.id === id && !t.isBuiltIn) {
            updated = {
              ...t,
              ...updates,
              updatedAt: new Date().toISOString(),
            };
            return updated;
          }
          return t;
        })
      );

      return updated;
    },
    []
  );

  /**
   * Delete a template
   */
  const deleteTemplate = useCallback((id: string): boolean => {
    let deleted = false;

    setTemplates((prev) => {
      const template = prev.find((t) => t.id === id);
      if (template && !template.isBuiltIn) {
        deleted = true;
        return prev.filter((t) => t.id !== id);
      }
      return prev;
    });

    return deleted;
  }, []);

  /**
   * Apply a template to get new content
   */
  const applyTemplate = useCallback(
    (id: string): TemplateContent | null => {
      const template = templates.find((t) => t.id === id);
      if (!template) return null;

      // Return a deep copy of the content
      return JSON.parse(JSON.stringify(template.content));
    },
    [templates]
  );

  /**
   * Duplicate a template
   */
  const duplicateTemplate = useCallback(
    (id: string, newName?: string): WorkItemTemplate | null => {
      const original = templates.find((t) => t.id === id);
      if (!original) return null;

      const now = new Date().toISOString();
      const duplicate: WorkItemTemplate = {
        ...JSON.parse(JSON.stringify(original)),
        id: generateId(),
        name: newName || `${original.name} (Copy)`,
        createdAt: now,
        updatedAt: now,
        isBuiltIn: false,
      };

      setTemplates((prev) => [...prev, duplicate]);
      return duplicate;
    },
    [templates]
  );

  /**
   * Search templates by name, description, or tags
   */
  const searchTemplates = useCallback(
    (query: string): WorkItemTemplate[] => {
      if (!query.trim()) return templates;

      const lowerQuery = query.toLowerCase();
      return templates.filter(
        (t) =>
          t.name.toLowerCase().includes(lowerQuery) ||
          t.description?.toLowerCase().includes(lowerQuery) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
          t.category?.toLowerCase().includes(lowerQuery)
      );
    },
    [templates]
  );

  /**
   * Export templates as JSON
   */
  const exportTemplates = useCallback(
    (templateIds?: string[]): string => {
      const toExport = templateIds
        ? templates.filter((t) => templateIds.includes(t.id))
        : templates.filter((t) => !t.isBuiltIn);

      return JSON.stringify(toExport, null, 2);
    },
    [templates]
  );

  /**
   * Import templates from JSON
   */
  const importTemplates = useCallback(
    (json: string): { imported: number; errors: string[] } => {
      const errors: string[] = [];
      let imported = 0;

      try {
        const parsed = JSON.parse(json);
        const toImport = Array.isArray(parsed) ? parsed : [parsed];

        const newTemplates: WorkItemTemplate[] = [];
        const now = new Date().toISOString();

        for (const item of toImport) {
          if (!item.name || !item.type || !item.content) {
            errors.push(`Invalid template: missing required fields`);
            continue;
          }

          if (!['epic', 'feature', 'userStory', 'task'].includes(item.type)) {
            errors.push(`Invalid template type: ${item.type}`);
            continue;
          }

          newTemplates.push({
            ...item,
            id: generateId(),
            createdAt: now,
            updatedAt: now,
            isBuiltIn: false,
          });
          imported++;
        }

        if (newTemplates.length > 0) {
          setTemplates((prev) => [...prev, ...newTemplates]);
        }
      } catch (e) {
        errors.push(`Failed to parse JSON: ${e instanceof Error ? e.message : 'Unknown error'}`);
      }

      return { imported, errors };
    },
    []
  );

  /**
   * Clear all user templates
   */
  const clearUserTemplates = useCallback(() => {
    setTemplates((prev) => prev.filter((t) => t.isBuiltIn));
  }, []);

  return {
    templates,
    getTemplatesByType,
    getTemplate,
    saveAsTemplate,
    updateTemplate,
    deleteTemplate,
    applyTemplate,
    duplicateTemplate,
    searchTemplates,
    exportTemplates,
    importTemplates,
    clearUserTemplates,
  };
}

/**
 * Get display name for template type
 */
export function getTemplateTypeDisplayName(type: TemplateWorkItemType): string {
  switch (type) {
    case 'epic':
      return 'Epic';
    case 'feature':
      return 'Feature';
    case 'userStory':
      return 'User Story';
    case 'task':
      return 'Task';
    default:
      return 'Unknown';
  }
}

export default useWorkItemTemplate;
