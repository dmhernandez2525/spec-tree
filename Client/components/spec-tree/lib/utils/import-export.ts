import { EpicType, FeatureType, UserStoryType, TaskType } from '../types/work-items';
import { RootState } from '@/lib/store';

interface ExportData {
  version: string;
  exportedAt: string;
  app: {
    id: string | null;
    name: string;
    description: string;
  };
  epics: EpicType[];
  features: FeatureType[];
  userStories: UserStoryType[];
  tasks: TaskType[];
  metadata: {
    totalEpics: number;
    totalFeatures: number;
    totalUserStories: number;
    totalTasks: number;
  };
}

/**
 * Export spec tree data to JSON format
 */
export function exportToJSON(state: RootState): string {
  const sowState = state.sow;

  const epics = Object.values(sowState.epics || {}).filter(Boolean) as EpicType[];
  const features = Object.values(sowState.features || {}).filter(Boolean) as FeatureType[];
  const userStories = Object.values(sowState.userStories || {}).filter(Boolean) as UserStoryType[];
  const tasks = Object.values(sowState.tasks || {}).filter(Boolean) as TaskType[];

  const exportData: ExportData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    app: {
      id: sowState.id || null,
      name: 'Spec Tree Export',
      description: sowState.globalInformation || '',
    },
    epics,
    features,
    userStories,
    tasks,
    metadata: {
      totalEpics: epics.length,
      totalFeatures: features.length,
      totalUserStories: userStories.length,
      totalTasks: tasks.length,
    },
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Export spec tree data to CSV format
 */
export function exportToCSV(state: RootState): string {
  const sowState = state.sow;
  const rows: string[] = [];

  // Header
  rows.push('Type,ID,Title,Description,Parent ID,Status,Points');

  // Epics
  const epics = Object.values(sowState.epics || {}).filter(Boolean) as EpicType[];
  for (const epic of epics) {
    rows.push(
      [
        'Epic',
        epic.id,
        escapeCSV(epic.title || ''),
        escapeCSV(epic.description || ''),
        epic.parentAppId || '',
        '',
        '',
      ].join(',')
    );
  }

  // Features
  const features = Object.values(sowState.features || {}).filter(Boolean) as FeatureType[];
  for (const feature of features) {
    rows.push(
      [
        'Feature',
        feature.id,
        escapeCSV(feature.title || ''),
        escapeCSV(feature.description || ''),
        feature.parentEpicId || '',
        '',
        '',
      ].join(',')
    );
  }

  // User Stories
  const userStories = Object.values(sowState.userStories || {}).filter(Boolean) as UserStoryType[];
  for (const story of userStories) {
    // Build description from role, action, goal
    const storyDescription = `As a ${story.role || 'user'}, I want to ${story.action || ''} so that ${story.goal || ''}`;
    rows.push(
      [
        'User Story',
        story.id,
        escapeCSV(story.title || ''),
        escapeCSV(storyDescription),
        story.parentFeatureId || '',
        '',
        story.points?.toString() || '',
      ].join(',')
    );
  }

  // Tasks
  const tasks = Object.values(sowState.tasks || {}).filter(Boolean) as TaskType[];
  for (const task of tasks) {
    rows.push(
      [
        'Task',
        task.id,
        escapeCSV(task.title || ''),
        escapeCSV(task.details || ''),
        task.parentUserStoryId || '',
        '',
        task.priority?.toString() || '',
      ].join(',')
    );
  }

  return rows.join('\n');
}

/**
 * Escape CSV field value
 */
function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Parse imported JSON data
 */
export function parseJSONImport(jsonString: string): ExportData | null {
  try {
    const data = JSON.parse(jsonString);

    // Validate the structure
    if (!data.version || !data.epics || !Array.isArray(data.epics)) {
      throw new Error('Invalid import file structure');
    }

    return data as ExportData;
  } catch (error) {
    console.error('Failed to parse import data:', error);
    return null;
  }
}

/**
 * Parse imported CSV data
 */
export function parseCSVImport(csvString: string): {
  epics: Partial<EpicType>[];
  features: Partial<FeatureType>[];
  userStories: Partial<UserStoryType>[];
  tasks: Partial<TaskType>[];
} | null {
  try {
    const lines = csvString.split('\n').filter((line) => line.trim());

    if (lines.length < 2) {
      throw new Error('CSV file is empty or has no data rows');
    }

    const header = lines[0].split(',');
    const typeIndex = header.findIndex((h) => h.toLowerCase().includes('type'));
    const idIndex = header.findIndex((h) => h.toLowerCase().includes('id'));
    const titleIndex = header.findIndex((h) => h.toLowerCase().includes('title'));
    const descIndex = header.findIndex((h) => h.toLowerCase().includes('desc'));
    const parentIndex = header.findIndex((h) => h.toLowerCase().includes('parent'));

    if (typeIndex === -1 || titleIndex === -1) {
      throw new Error('CSV must have Type and Title columns');
    }

    const result = {
      epics: [] as Partial<EpicType>[],
      features: [] as Partial<FeatureType>[],
      userStories: [] as Partial<UserStoryType>[],
      tasks: [] as Partial<TaskType>[],
    };

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const type = values[typeIndex]?.toLowerCase();
      const id = values[idIndex] || `import-${Date.now()}-${i}`;
      const title = values[titleIndex] || '';
      const description = descIndex >= 0 ? values[descIndex] : '';
      const parentId = parentIndex >= 0 ? values[parentIndex] : '';

      switch (type) {
        case 'epic':
          result.epics.push({ id, title, description, parentAppId: parentId || null });
          break;
        case 'feature':
          result.features.push({ id, title, description, parentEpicId: parentId });
          break;
        case 'user story':
        case 'userstory':
        case 'story':
          // UserStoryType doesn't have description, it has role/action/goal
          result.userStories.push({ id, title, action: description, parentFeatureId: parentId });
          break;
        case 'task':
          // TaskType uses 'details' instead of 'description'
          result.tasks.push({ id, title, details: description, parentUserStoryId: parentId });
          break;
      }
    }

    return result;
  } catch (error) {
    console.error('Failed to parse CSV import:', error);
    return null;
  }
}

/**
 * Parse a single CSV line handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * Download data as a file
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export to Markdown format for documentation
 */
export function exportToMarkdown(state: RootState): string {
  const sowState = state.sow;
  const lines: string[] = [];

  lines.push('# Spec Tree Export');
  lines.push('');
  lines.push(`*Exported on ${new Date().toLocaleDateString()}*`);
  lines.push('');

  if (sowState.globalInformation) {
    lines.push('## Description');
    lines.push('');
    lines.push(sowState.globalInformation);
    lines.push('');
  }

  const epics = Object.values(sowState.epics || {}).filter(Boolean) as EpicType[];
  const allFeatures = Object.values(sowState.features || {}).filter(Boolean) as FeatureType[];
  const allUserStories = Object.values(sowState.userStories || {}).filter(Boolean) as UserStoryType[];
  const allTasks = Object.values(sowState.tasks || {}).filter(Boolean) as TaskType[];

  for (const epic of epics) {
    lines.push(`## Epic: ${epic.title}`);
    lines.push('');
    if (epic.description) {
      lines.push(epic.description);
      lines.push('');
    }

    const features = allFeatures.filter((f) => f.parentEpicId === epic.id);

    for (const feature of features) {
      lines.push(`### Feature: ${feature.title}`);
      lines.push('');
      if (feature.description) {
        lines.push(feature.description);
        lines.push('');
      }

      const stories = allUserStories.filter((s) => s.parentFeatureId === feature.id);

      for (const story of stories) {
        lines.push(`#### User Story: ${story.title}`);
        lines.push('');
        // Build description from role, action, goal
        if (story.role || story.action || story.goal) {
          lines.push(`As a **${story.role || 'user'}**, I want to **${story.action || ''}** so that **${story.goal || ''}**.`);
          lines.push('');
        }
        if (story.points) {
          lines.push(`**Story Points:** ${story.points}`);
          lines.push('');
        }

        const tasks = allTasks.filter((t) => t.parentUserStoryId === story.id);

        if (tasks.length > 0) {
          lines.push('**Tasks:**');
          lines.push('');
          for (const task of tasks) {
            lines.push(`- [ ] ${task.title}${task.priority ? ` (priority: ${task.priority})` : ''}`);
          }
          lines.push('');
        }
      }
    }
  }

  return lines.join('\n');
}
