import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  exportToJSON,
  exportToCSV,
  parseJSONImport,
  parseCSVImport,
  downloadFile,
  exportToMarkdown,
} from './import-export';
import type { RootState } from '@/lib/store';

describe('import-export utilities', () => {
  const createMockState = (sowOverrides = {}): RootState => ({
    sow: {
      id: 'app-123',
      globalInformation: 'Global app description',
      epics: {
        'epic-1': {
          id: 'epic-1',
          documentId: 'epic-1',
          title: 'Epic One',
          description: 'First epic description',
          parentAppId: 'app-123',
          featureIds: ['feature-1'],
          contextualQuestions: [],
        },
      },
      features: {
        'feature-1': {
          id: 'feature-1',
          documentId: 'feature-1',
          title: 'Feature One',
          description: 'First feature description',
          parentEpicId: 'epic-1',
          userStoryIds: ['story-1'],
          contextualQuestions: [],
        },
      },
      userStories: {
        'story-1': {
          id: 'story-1',
          documentId: 'story-1',
          title: 'Story One',
          role: 'developer',
          action: 'create tests',
          goal: 'ensure quality',
          points: '5',
          parentFeatureId: 'feature-1',
          taskIds: ['task-1'],
          contextualQuestions: [],
        },
      },
      tasks: {
        'task-1': {
          id: 'task-1',
          documentId: 'task-1',
          title: 'Task One',
          details: 'Task details here',
          priority: 1,
          parentUserStoryId: 'story-1',
          dependentTaskIds: [],
          contextualQuestions: [],
        },
      },
      epicIds: ['epic-1'],
      contextualQuestions: [],
      isLoading: false,
      error: null,
      ...sowOverrides,
    },
  } as unknown as RootState);

  describe('exportToJSON', () => {
    it('exports data with correct structure', () => {
      const state = createMockState();
      const result = exportToJSON(state);
      const parsed = JSON.parse(result);

      expect(parsed.version).toBe('1.0.0');
      expect(parsed.exportedAt).toBeDefined();
      expect(parsed.app).toBeDefined();
      expect(parsed.epics).toBeDefined();
      expect(parsed.features).toBeDefined();
      expect(parsed.userStories).toBeDefined();
      expect(parsed.tasks).toBeDefined();
      expect(parsed.metadata).toBeDefined();
    });

    it('includes app information', () => {
      const state = createMockState();
      const result = exportToJSON(state);
      const parsed = JSON.parse(result);

      expect(parsed.app.id).toBe('app-123');
      expect(parsed.app.name).toBe('Spec Tree Export');
      expect(parsed.app.description).toBe('Global app description');
    });

    it('includes all epics', () => {
      const state = createMockState();
      const result = exportToJSON(state);
      const parsed = JSON.parse(result);

      expect(parsed.epics).toHaveLength(1);
      expect(parsed.epics[0].id).toBe('epic-1');
      expect(parsed.epics[0].title).toBe('Epic One');
    });

    it('includes all features', () => {
      const state = createMockState();
      const result = exportToJSON(state);
      const parsed = JSON.parse(result);

      expect(parsed.features).toHaveLength(1);
      expect(parsed.features[0].id).toBe('feature-1');
    });

    it('includes all user stories', () => {
      const state = createMockState();
      const result = exportToJSON(state);
      const parsed = JSON.parse(result);

      expect(parsed.userStories).toHaveLength(1);
      expect(parsed.userStories[0].id).toBe('story-1');
    });

    it('includes all tasks', () => {
      const state = createMockState();
      const result = exportToJSON(state);
      const parsed = JSON.parse(result);

      expect(parsed.tasks).toHaveLength(1);
      expect(parsed.tasks[0].id).toBe('task-1');
    });

    it('includes correct metadata counts', () => {
      const state = createMockState();
      const result = exportToJSON(state);
      const parsed = JSON.parse(result);

      expect(parsed.metadata.totalEpics).toBe(1);
      expect(parsed.metadata.totalFeatures).toBe(1);
      expect(parsed.metadata.totalUserStories).toBe(1);
      expect(parsed.metadata.totalTasks).toBe(1);
    });

    it('handles empty state', () => {
      const state = createMockState({
        epics: {},
        features: {},
        userStories: {},
        tasks: {},
      });
      const result = exportToJSON(state);
      const parsed = JSON.parse(result);

      expect(parsed.epics).toHaveLength(0);
      expect(parsed.features).toHaveLength(0);
      expect(parsed.userStories).toHaveLength(0);
      expect(parsed.tasks).toHaveLength(0);
      expect(parsed.metadata.totalEpics).toBe(0);
    });

    it('handles null values in collections', () => {
      const state = createMockState({
        epics: { 'epic-1': null, 'epic-2': { id: 'epic-2', title: 'Valid Epic' } },
      });
      const result = exportToJSON(state);
      const parsed = JSON.parse(result);

      expect(parsed.epics).toHaveLength(1);
      expect(parsed.epics[0].id).toBe('epic-2');
    });

    it('produces valid JSON string', () => {
      const state = createMockState();
      const result = exportToJSON(state);

      expect(() => JSON.parse(result)).not.toThrow();
    });
  });

  describe('exportToCSV', () => {
    it('includes header row', () => {
      const state = createMockState();
      const result = exportToCSV(state);
      const lines = result.split('\n');

      expect(lines[0]).toBe('Type,ID,Title,Description,Parent ID,Status,Points');
    });

    it('exports epics with correct format', () => {
      const state = createMockState();
      const result = exportToCSV(state);
      const lines = result.split('\n');
      const epicLine = lines.find((l) => l.startsWith('Epic,'));

      expect(epicLine).toContain('Epic');
      expect(epicLine).toContain('epic-1');
      expect(epicLine).toContain('Epic One');
    });

    it('exports features with correct format', () => {
      const state = createMockState();
      const result = exportToCSV(state);
      const lines = result.split('\n');
      const featureLine = lines.find((l) => l.startsWith('Feature,'));

      expect(featureLine).toContain('Feature');
      expect(featureLine).toContain('feature-1');
      expect(featureLine).toContain('Feature One');
    });

    it('exports user stories with role/action/goal format', () => {
      const state = createMockState();
      const result = exportToCSV(state);
      const lines = result.split('\n');
      const storyLine = lines.find((l) => l.startsWith('User Story,'));

      expect(storyLine).toContain('User Story');
      expect(storyLine).toContain('story-1');
      expect(storyLine).toContain('developer');
    });

    it('exports tasks with correct format', () => {
      const state = createMockState();
      const result = exportToCSV(state);
      const lines = result.split('\n');
      const taskLine = lines.find((l) => l.startsWith('Task,'));

      expect(taskLine).toContain('Task');
      expect(taskLine).toContain('task-1');
      expect(taskLine).toContain('Task One');
    });

    it('escapes fields with commas', () => {
      const state = createMockState({
        epics: {
          'epic-1': {
            id: 'epic-1',
            title: 'Epic, with comma',
            description: 'Description',
            parentAppId: 'app-123',
          },
        },
      });
      const result = exportToCSV(state);

      expect(result).toContain('"Epic, with comma"');
    });

    it('escapes fields with quotes', () => {
      const state = createMockState({
        epics: {
          'epic-1': {
            id: 'epic-1',
            title: 'Epic with "quotes"',
            description: 'Description',
            parentAppId: 'app-123',
          },
        },
      });
      const result = exportToCSV(state);

      expect(result).toContain('"Epic with ""quotes"""');
    });

    it('escapes fields with newlines', () => {
      const state = createMockState({
        epics: {
          'epic-1': {
            id: 'epic-1',
            title: 'Epic with\nnewline',
            description: 'Description',
            parentAppId: 'app-123',
          },
        },
      });
      const result = exportToCSV(state);

      expect(result).toContain('"Epic with\nnewline"');
    });

    it('handles empty state', () => {
      const state = createMockState({
        epics: {},
        features: {},
        userStories: {},
        tasks: {},
      });
      const result = exportToCSV(state);
      const lines = result.split('\n');

      expect(lines).toHaveLength(1); // Just header
    });

    it('handles missing title and description', () => {
      const state = createMockState({
        epics: {
          'epic-1': {
            id: 'epic-1',
            title: undefined,
            description: undefined,
            parentAppId: 'app-123',
          },
        },
        features: {},
        userStories: {},
        tasks: {},
      });
      const result = exportToCSV(state);

      expect(result).toContain('Epic,epic-1,,,app-123');
    });
  });

  describe('parseJSONImport', () => {
    it('parses valid JSON import data', () => {
      const importData = {
        version: '1.0.0',
        exportedAt: '2024-01-15T00:00:00Z',
        app: { id: 'app-1', name: 'Test', description: 'Desc' },
        epics: [{ id: 'epic-1', title: 'Epic One' }],
        features: [],
        userStories: [],
        tasks: [],
        metadata: { totalEpics: 1, totalFeatures: 0, totalUserStories: 0, totalTasks: 0 },
      };

      const result = parseJSONImport(JSON.stringify(importData));

      expect(result).not.toBeNull();
      expect(result?.version).toBe('1.0.0');
      expect(result?.epics).toHaveLength(1);
    });

    it('returns null for invalid JSON', () => {
      const result = parseJSONImport('not valid json');

      expect(result).toBeNull();
    });

    it('returns null when version is missing', () => {
      const importData = {
        epics: [],
      };

      const result = parseJSONImport(JSON.stringify(importData));

      expect(result).toBeNull();
    });

    it('returns null when epics is missing', () => {
      const importData = {
        version: '1.0.0',
      };

      const result = parseJSONImport(JSON.stringify(importData));

      expect(result).toBeNull();
    });

    it('returns null when epics is not an array', () => {
      const importData = {
        version: '1.0.0',
        epics: 'not an array',
      };

      const result = parseJSONImport(JSON.stringify(importData));

      expect(result).toBeNull();
    });

    it('logs error for invalid data', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      parseJSONImport('invalid');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('parseCSVImport', () => {
    it('parses valid CSV with all types', () => {
      const csv = `Type,ID,Title,Description,Parent ID
Epic,epic-1,Epic One,Epic description,
Feature,feature-1,Feature One,Feature description,epic-1
User Story,story-1,Story One,Story description,feature-1
Task,task-1,Task One,Task description,story-1`;

      const result = parseCSVImport(csv);

      expect(result).not.toBeNull();
      expect(result?.epics).toHaveLength(1);
      expect(result?.features).toHaveLength(1);
      expect(result?.userStories).toHaveLength(1);
      expect(result?.tasks).toHaveLength(1);
    });

    it('parses epic data correctly', () => {
      const csv = `Type,ID,Title,Description,Parent ID
Epic,epic-1,Epic One,Epic description,app-123`;

      const result = parseCSVImport(csv);

      expect(result?.epics[0].id).toBe('epic-1');
      expect(result?.epics[0].title).toBe('Epic One');
      expect(result?.epics[0].description).toBe('Epic description');
      expect(result?.epics[0].parentAppId).toBe('app-123');
    });

    it('parses feature data correctly', () => {
      const csv = `Type,ID,Title,Description,Parent ID
Feature,feature-1,Feature One,Feature description,epic-1`;

      const result = parseCSVImport(csv);

      expect(result?.features[0].id).toBe('feature-1');
      expect(result?.features[0].title).toBe('Feature One');
      expect(result?.features[0].parentEpicId).toBe('epic-1');
    });

    it('parses user story data correctly', () => {
      const csv = `Type,ID,Title,Description,Parent ID
User Story,story-1,Story One,Story action description,feature-1`;

      const result = parseCSVImport(csv);

      expect(result?.userStories[0].id).toBe('story-1');
      expect(result?.userStories[0].title).toBe('Story One');
      expect(result?.userStories[0].action).toBe('Story action description');
      expect(result?.userStories[0].parentFeatureId).toBe('feature-1');
    });

    it('parses task data correctly', () => {
      const csv = `Type,ID,Title,Description,Parent ID
Task,task-1,Task One,Task details,story-1`;

      const result = parseCSVImport(csv);

      expect(result?.tasks[0].id).toBe('task-1');
      expect(result?.tasks[0].title).toBe('Task One');
      expect(result?.tasks[0].details).toBe('Task details');
      expect(result?.tasks[0].parentUserStoryId).toBe('story-1');
    });

    it('handles "userstory" type variation', () => {
      const csv = `Type,ID,Title,Description,Parent ID
userstory,story-1,Story One,Description,feature-1`;

      const result = parseCSVImport(csv);

      expect(result?.userStories).toHaveLength(1);
    });

    it('handles "story" type variation', () => {
      const csv = `Type,ID,Title,Description,Parent ID
story,story-1,Story One,Description,feature-1`;

      const result = parseCSVImport(csv);

      expect(result?.userStories).toHaveLength(1);
    });

    it('handles quoted fields with commas', () => {
      const csv = `Type,ID,Title,Description,Parent ID
Epic,epic-1,"Epic, with comma",Description,`;

      const result = parseCSVImport(csv);

      expect(result?.epics[0].title).toBe('Epic, with comma');
    });

    it('handles quoted fields with escaped quotes', () => {
      const csv = `Type,ID,Title,Description,Parent ID
Epic,epic-1,"Epic with ""quotes""",Description,`;

      const result = parseCSVImport(csv);

      expect(result?.epics[0].title).toBe('Epic with "quotes"');
    });

    it('returns null for empty CSV', () => {
      const result = parseCSVImport('');

      expect(result).toBeNull();
    });

    it('returns null for CSV with only header', () => {
      const csv = `Type,ID,Title,Description,Parent ID`;

      const result = parseCSVImport(csv);

      expect(result).toBeNull();
    });

    it('returns null when Type column is missing', () => {
      const csv = `ID,Title,Description,Parent ID
epic-1,Epic One,Description,`;

      const result = parseCSVImport(csv);

      expect(result).toBeNull();
    });

    it('returns null when Title column is missing', () => {
      const csv = `Type,ID,Description,Parent ID
Epic,epic-1,Description,`;

      const result = parseCSVImport(csv);

      expect(result).toBeNull();
    });

    it('generates ID when not provided', () => {
      const csv = `Type,ID,Title,Description,Parent ID
Epic,,Epic One,Description,`;

      const result = parseCSVImport(csv);

      expect(result?.epics[0].id).toMatch(/^import-\d+-\d+$/);
    });

    it('ignores unknown types', () => {
      const csv = `Type,ID,Title,Description,Parent ID
Unknown,unknown-1,Unknown One,Description,`;

      const result = parseCSVImport(csv);

      expect(result?.epics).toHaveLength(0);
      expect(result?.features).toHaveLength(0);
      expect(result?.userStories).toHaveLength(0);
      expect(result?.tasks).toHaveLength(0);
    });

    it('handles empty parent ID for epics', () => {
      const csv = `Type,ID,Title,Description,Parent ID
Epic,epic-1,Epic One,Description,`;

      const result = parseCSVImport(csv);

      expect(result?.epics[0].parentAppId).toBeNull();
    });

    it('logs error for invalid CSV', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      parseCSVImport('');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('downloadFile', () => {
    let _originalDocument: typeof document;
    let mockLink: Partial<HTMLAnchorElement>;
    let createObjectURLSpy: ReturnType<typeof vi.fn>;
    let revokeObjectURLSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      };

      createObjectURLSpy = vi.fn().mockReturnValue('blob:mock-url');
      revokeObjectURLSpy = vi.fn();

      vi.stubGlobal('URL', {
        createObjectURL: createObjectURLSpy,
        revokeObjectURL: revokeObjectURLSpy,
      });

      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as HTMLAnchorElement);
      vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
      vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);
    });

    afterEach(() => {
      vi.restoreAllMocks();
      vi.unstubAllGlobals();
    });

    it('creates a blob with correct content and type', () => {
      const blobSpy = vi.fn();
      vi.stubGlobal('Blob', class MockBlob {
        constructor(content: string[], options: { type: string }) {
          blobSpy(content, options);
        }
      });

      downloadFile('test content', 'test.txt', 'text/plain');

      expect(blobSpy).toHaveBeenCalledWith(['test content'], { type: 'text/plain' });
    });

    it('creates object URL from blob', () => {
      downloadFile('test content', 'test.txt', 'text/plain');

      expect(createObjectURLSpy).toHaveBeenCalled();
    });

    it('sets correct download filename', () => {
      downloadFile('test content', 'myfile.json', 'application/json');

      expect(mockLink.download).toBe('myfile.json');
    });

    it('triggers link click', () => {
      downloadFile('test content', 'test.txt', 'text/plain');

      expect(mockLink.click).toHaveBeenCalled();
    });

    it('cleans up by removing link and revoking URL', () => {
      downloadFile('test content', 'test.txt', 'text/plain');

      expect(document.body.removeChild).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');
    });
  });

  describe('exportToMarkdown', () => {
    it('includes header', () => {
      const state = createMockState();
      const result = exportToMarkdown(state);

      expect(result).toContain('# Spec Tree Export');
    });

    it('includes export date', () => {
      const state = createMockState();
      const result = exportToMarkdown(state);

      expect(result).toContain('*Exported on');
    });

    it('includes global information as description', () => {
      const state = createMockState();
      const result = exportToMarkdown(state);

      expect(result).toContain('## Description');
      expect(result).toContain('Global app description');
    });

    it('does not include description section when globalInformation is empty', () => {
      const state = createMockState({ globalInformation: '' });
      const result = exportToMarkdown(state);

      expect(result).not.toContain('## Description');
    });

    it('includes epic sections', () => {
      const state = createMockState();
      const result = exportToMarkdown(state);

      expect(result).toContain('## Epic: Epic One');
      expect(result).toContain('First epic description');
    });

    it('includes feature sections', () => {
      const state = createMockState();
      const result = exportToMarkdown(state);

      expect(result).toContain('### Feature: Feature One');
      expect(result).toContain('First feature description');
    });

    it('includes user story sections', () => {
      const state = createMockState();
      const result = exportToMarkdown(state);

      expect(result).toContain('#### User Story: Story One');
      expect(result).toContain('As a **developer**');
      expect(result).toContain('I want to **create tests**');
      expect(result).toContain('so that **ensure quality**');
    });

    it('includes story points', () => {
      const state = createMockState();
      const result = exportToMarkdown(state);

      expect(result).toContain('**Story Points:** 5');
    });

    it('includes task list', () => {
      const state = createMockState();
      const result = exportToMarkdown(state);

      expect(result).toContain('**Tasks:**');
      expect(result).toContain('- [ ] Task One');
      expect(result).toContain('(priority: 1)');
    });

    it('handles empty state', () => {
      const state = createMockState({
        epics: {},
        features: {},
        userStories: {},
        tasks: {},
        globalInformation: '',
      });
      const result = exportToMarkdown(state);

      expect(result).toContain('# Spec Tree Export');
      expect(result).not.toContain('## Epic:');
    });

    it('handles missing optional fields', () => {
      const state = createMockState({
        epics: {
          'epic-1': {
            id: 'epic-1',
            title: 'Epic Without Description',
            description: '',
            parentAppId: 'app-123',
            featureIds: [],
          },
        },
        features: {},
        userStories: {},
        tasks: {},
      });
      const result = exportToMarkdown(state);

      expect(result).toContain('## Epic: Epic Without Description');
    });

    it('handles user story without role/action/goal', () => {
      const state = createMockState({
        epics: {
          'epic-1': {
            id: 'epic-1',
            title: 'Epic',
            description: '',
            parentAppId: 'app-123',
            featureIds: ['feature-1'],
          },
        },
        features: {
          'feature-1': {
            id: 'feature-1',
            title: 'Feature',
            description: '',
            parentEpicId: 'epic-1',
            userStoryIds: ['story-1'],
          },
        },
        userStories: {
          'story-1': {
            id: 'story-1',
            title: 'Story',
            role: '',
            action: '',
            goal: '',
            points: '',
            parentFeatureId: 'feature-1',
            taskIds: [],
          },
        },
        tasks: {},
      });
      const result = exportToMarkdown(state);

      expect(result).toContain('#### User Story: Story');
      // Should not include user story format if all fields are empty
      expect(result).not.toContain('As a ****, I want to **');
    });

    it('handles tasks without priority', () => {
      const state = createMockState({
        epics: {
          'epic-1': {
            id: 'epic-1',
            title: 'Epic',
            parentAppId: 'app-123',
            featureIds: ['feature-1'],
          },
        },
        features: {
          'feature-1': {
            id: 'feature-1',
            title: 'Feature',
            parentEpicId: 'epic-1',
            userStoryIds: ['story-1'],
          },
        },
        userStories: {
          'story-1': {
            id: 'story-1',
            title: 'Story',
            parentFeatureId: 'feature-1',
            taskIds: ['task-1'],
          },
        },
        tasks: {
          'task-1': {
            id: 'task-1',
            title: 'Task Without Priority',
            parentUserStoryId: 'story-1',
          },
        },
      });
      const result = exportToMarkdown(state);

      expect(result).toContain('- [ ] Task Without Priority');
      expect(result).not.toContain('priority:');
    });

    it('correctly nests features under their parent epic', () => {
      const state = createMockState({
        epics: {
          'epic-1': { id: 'epic-1', title: 'Epic 1', parentAppId: 'app-123', featureIds: [] },
          'epic-2': { id: 'epic-2', title: 'Epic 2', parentAppId: 'app-123', featureIds: [] },
        },
        features: {
          'feature-1': { id: 'feature-1', title: 'Feature for Epic 1', parentEpicId: 'epic-1', userStoryIds: [] },
          'feature-2': { id: 'feature-2', title: 'Feature for Epic 2', parentEpicId: 'epic-2', userStoryIds: [] },
        },
        userStories: {},
        tasks: {},
      });
      const result = exportToMarkdown(state);

      // Check that features appear after their parent epic
      const epic1Index = result.indexOf('## Epic: Epic 1');
      const feature1Index = result.indexOf('### Feature: Feature for Epic 1');
      const epic2Index = result.indexOf('## Epic: Epic 2');
      const feature2Index = result.indexOf('### Feature: Feature for Epic 2');

      expect(feature1Index).toBeGreaterThan(epic1Index);
      expect(feature1Index).toBeLessThan(epic2Index);
      expect(feature2Index).toBeGreaterThan(epic2Index);
    });
  });
});
