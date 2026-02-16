/**
 * Documentation generation utilities for SpecTree.
 * Provides functions to generate markdown-based API docs, getting started guides,
 * changelogs, table of contents, and formatted doc pages.
 */

export interface DocSection {
  id: string;
  title: string;
  content: string;
  order: number;
  subsections: DocSection[];
}

export interface DocConfig {
  projectName: string;
  version: string;
  sections: DocSection[];
  lastUpdated: string;
}

export interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  parameters: { name: string; type: string; required: boolean; description: string }[];
  response: string;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: { type: string; description: string }[];
}

export interface DocPageMetadata {
  lastUpdated?: string;
  author?: string;
  category?: string;
}

/**
 * Generates markdown API documentation from an array of endpoint definitions.
 */
export function generateApiDocs(endpoints: ApiEndpoint[]): string {
  if (endpoints.length === 0) {
    return '# API Documentation\n\nNo endpoints documented yet.\n';
  }

  const lines: string[] = ['# API Documentation\n'];

  for (const endpoint of endpoints) {
    lines.push(`## \`${endpoint.method.toUpperCase()} ${endpoint.path}\`\n`);
    lines.push(`${endpoint.description}\n`);

    if (endpoint.parameters.length > 0) {
      lines.push('### Parameters\n');
      lines.push('| Name | Type | Required | Description |');
      lines.push('|------|------|----------|-------------|');

      for (const param of endpoint.parameters) {
        const required = param.required ? 'Yes' : 'No';
        lines.push(`| ${param.name} | ${param.type} | ${required} | ${param.description} |`);
      }

      lines.push('');
    }

    lines.push('### Response\n');
    lines.push(`\`\`\`json\n${endpoint.response}\n\`\`\`\n`);
  }

  return lines.join('\n');
}

/**
 * Generates a getting started guide with installation, setup, and quick start sections.
 */
export function generateGettingStarted(config: DocConfig): string {
  const lines: string[] = [
    `# Getting Started with ${config.projectName}\n`,
    `> Version ${config.version}\n`,
    '## Installation\n',
    'Install the package using your preferred package manager:\n',
    '```bash',
    `npm install ${config.projectName.toLowerCase().replace(/\s+/g, '-')}`,
    '```\n',
    'Or with yarn:\n',
    '```bash',
    `yarn add ${config.projectName.toLowerCase().replace(/\s+/g, '-')}`,
    '```\n',
    '## Setup\n',
    'After installation, configure your project:\n',
    '1. Create a configuration file in your project root',
    `2. Import ${config.projectName} into your application`,
    '3. Initialize with your project settings\n',
    '## Quick Start\n',
    `Here is a minimal example to get you up and running with ${config.projectName}:\n`,
    '```typescript',
    `import { init } from '${config.projectName.toLowerCase().replace(/\s+/g, '-')}';`,
    '',
    'const app = init({',
    `  name: '${config.projectName}',`,
    `  version: '${config.version}',`,
    '});',
    '```\n',
  ];

  if (config.sections.length > 0) {
    lines.push('## Next Steps\n');
    for (const section of config.sections) {
      lines.push(`- [${section.title}](#${section.id})`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Generates a formatted changelog from an array of changelog entries.
 * Groups changes by type within each version.
 */
export function generateChangelog(entries: ChangelogEntry[]): string {
  if (entries.length === 0) {
    return '# Changelog\n\nNo changes recorded yet.\n';
  }

  const lines: string[] = ['# Changelog\n'];

  const typeLabels: Record<string, string> = {
    added: 'Added',
    changed: 'Changed',
    deprecated: 'Deprecated',
    removed: 'Removed',
    fixed: 'Fixed',
    security: 'Security',
  };

  for (const entry of entries) {
    lines.push(`## [${entry.version}] - ${entry.date}\n`);

    const grouped: Record<string, string[]> = {};
    for (const change of entry.changes) {
      const type = change.type.toLowerCase();
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(change.description);
    }

    for (const [type, descriptions] of Object.entries(grouped)) {
      const label = typeLabels[type] || type.charAt(0).toUpperCase() + type.slice(1);
      lines.push(`### ${label}\n`);
      for (const desc of descriptions) {
        lines.push(`- ${desc}`);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

/**
 * Generates a nested markdown table of contents from a DocSection hierarchy.
 */
export function buildTableOfContents(sections: DocSection[]): string {
  const lines: string[] = ['# Table of Contents\n'];

  const sorted = [...sections].sort((a, b) => a.order - b.order);

  function renderSection(section: DocSection, depth: number): void {
    const indent = '  '.repeat(depth);
    lines.push(`${indent}- [${section.title}](#${section.id})`);

    if (section.subsections.length > 0) {
      const sortedSubs = [...section.subsections].sort((a, b) => a.order - b.order);
      for (const sub of sortedSubs) {
        renderSection(sub, depth + 1);
      }
    }
  }

  for (const section of sorted) {
    renderSection(section, 0);
  }

  lines.push('');
  return lines.join('\n');
}

/**
 * Wraps content in a standard doc page template with header, last updated info,
 * and optional navigation hints.
 */
export function formatDocPage(
  title: string,
  content: string,
  metadata?: DocPageMetadata,
): string {
  const lines: string[] = [];

  lines.push('---');
  lines.push(`title: ${title}`);
  if (metadata?.lastUpdated) {
    lines.push(`lastUpdated: ${metadata.lastUpdated}`);
  }
  if (metadata?.author) {
    lines.push(`author: ${metadata.author}`);
  }
  if (metadata?.category) {
    lines.push(`category: ${metadata.category}`);
  }
  lines.push('---\n');

  lines.push(`# ${title}\n`);

  if (metadata?.lastUpdated) {
    lines.push(`*Last updated: ${metadata.lastUpdated}*\n`);
  }

  lines.push(content);

  lines.push('\n---\n');
  lines.push('*Navigate: [Home](/) | [API Reference](/docs/api) | [Guide](/docs/guide)*\n');

  return lines.join('\n');
}
