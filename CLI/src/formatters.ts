// SpecTree CLI Output Formatters (F3.1.4)

import * as fs from 'node:fs';
import { SpecNode, OutputFormat, ExportOptions } from './types';

/**
 * Serializes data to a JSON string with optional pretty-printing.
 */
export function formatJson(data: unknown, pretty: boolean = false): string {
  if (pretty) {
    return JSON.stringify(data, null, 2);
  }
  return JSON.stringify(data);
}

/**
 * Simple YAML serializer. Handles strings, numbers, booleans,
 * arrays, null/undefined, and nested objects. No external dependencies.
 */
export function formatYaml(data: unknown): string {
  return serializeYamlValue(data, 0).trimEnd() + '\n';
}

function serializeYamlValue(value: unknown, indent: number): string {
  if (value === null || value === undefined) {
    return 'null';
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  if (typeof value === 'number') {
    return String(value);
  }

  if (typeof value === 'string') {
    return yamlEscapeString(value);
  }

  if (Array.isArray(value)) {
    return serializeYamlArray(value, indent);
  }

  if (typeof value === 'object') {
    return serializeYamlObject(value as Record<string, unknown>, indent);
  }

  return String(value);
}

function yamlEscapeString(str: string): string {
  // Use quoted style if the string contains special characters,
  // is empty, or could be misinterpreted as a YAML type
  const needsQuotes =
    str === '' ||
    str.includes(':') ||
    str.includes('#') ||
    str.includes('\n') ||
    str.includes('"') ||
    str.includes("'") ||
    str.startsWith(' ') ||
    str.endsWith(' ') ||
    str === 'true' ||
    str === 'false' ||
    str === 'null' ||
    str === 'yes' ||
    str === 'no' ||
    /^\d+$/.test(str);

  if (needsQuotes) {
    const escaped = str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return `"${escaped}"`;
  }

  return str;
}

function serializeYamlArray(arr: unknown[], indent: number): string {
  if (arr.length === 0) {
    return '[]';
  }

  const prefix = '  '.repeat(indent);
  const lines: string[] = [];

  for (const item of arr) {
    if (
      typeof item === 'object' &&
      item !== null &&
      !Array.isArray(item)
    ) {
      // Object items: put first key on the same line as the dash
      const entries = Object.entries(item as Record<string, unknown>);
      if (entries.length === 0) {
        lines.push(`${prefix}- {}`);
        continue;
      }

      const [firstKey, firstVal] = entries[0];
      const firstValStr = serializeYamlValue(firstVal, indent + 2);
      const isSimpleFirst =
        typeof firstVal !== 'object' || firstVal === null;

      if (isSimpleFirst) {
        lines.push(`${prefix}- ${firstKey}: ${firstValStr}`);
      } else {
        lines.push(`${prefix}- ${firstKey}:`);
        lines.push(firstValStr);
      }

      for (let i = 1; i < entries.length; i++) {
        const [key, val] = entries[i];
        const valStr = serializeYamlValue(val, indent + 2);
        const isSimple = typeof val !== 'object' || val === null;

        if (isSimple) {
          lines.push(`${prefix}  ${key}: ${valStr}`);
        } else {
          lines.push(`${prefix}  ${key}:`);
          lines.push(valStr);
        }
      }
    } else {
      const itemStr = serializeYamlValue(item, indent + 1);
      lines.push(`${prefix}- ${itemStr}`);
    }
  }

  return '\n' + lines.join('\n');
}

function serializeYamlObject(
  obj: Record<string, unknown>,
  indent: number
): string {
  const entries = Object.entries(obj);

  if (entries.length === 0) {
    return '{}';
  }

  const prefix = '  '.repeat(indent);
  const lines: string[] = [];

  for (const [key, val] of entries) {
    const valStr = serializeYamlValue(val, indent + 1);
    const isSimple =
      typeof val !== 'object' || val === null;

    if (isSimple) {
      lines.push(`${prefix}${key}: ${valStr}`);
    } else {
      lines.push(`${prefix}${key}:${valStr}`);
    }
  }

  // If called at the top level (indent 0), return as-is.
  // If nested, prefix with newline so it starts on the next line.
  if (indent === 0) {
    return lines.join('\n');
  }

  return '\n' + lines.join('\n');
}

/**
 * Converts an array of SpecNodes to a Markdown document.
 * Header depth is based on node type:
 *   # for epic, ## for feature, ### for user-story, #### for task
 */
export function formatMarkdown(nodes: SpecNode[]): string {
  const headerDepth: Record<string, string> = {
    epic: '#',
    feature: '##',
    'user-story': '###',
    task: '####',
  };

  const sections: string[] = [];

  for (const node of nodes) {
    const prefix = headerDepth[node.type] || '####';
    const lines: string[] = [];

    lines.push(`${prefix} ${node.title}`);
    lines.push('');

    if (node.description) {
      lines.push(node.description);
      lines.push('');
    }

    lines.push(`**Type:** ${node.type}`);
    lines.push(`**ID:** ${node.id}`);

    if (node.parentId) {
      lines.push(`**Parent:** ${node.parentId}`);
    }

    if (node.children.length > 0) {
      lines.push(`**Children:** ${node.children.join(', ')}`);
    }

    lines.push('');
    sections.push(lines.join('\n'));
  }

  return sections.join('\n');
}

/**
 * Converts an array of SpecNodes to CSV format with the headers:
 * id, title, type, description, parentId
 */
export function formatCsv(nodes: SpecNode[]): string {
  const headers = 'id,title,type,description,parentId';
  const rows: string[] = [headers];

  for (const node of nodes) {
    const fields = [
      csvEscapeField(node.id),
      csvEscapeField(node.title),
      csvEscapeField(node.type),
      csvEscapeField(node.description),
      csvEscapeField(node.parentId || ''),
    ];
    rows.push(fields.join(','));
  }

  return rows.join('\n') + '\n';
}

function csvEscapeField(value: string): string {
  if (
    value.includes(',') ||
    value.includes('"') ||
    value.includes('\n')
  ) {
    const escaped = value.replace(/"/g, '""');
    return `"${escaped}"`;
  }
  return value;
}

/**
 * Dispatcher that selects the appropriate formatter based on
 * the requested output format and applies the given options.
 */
export function formatOutput(
  data: unknown,
  format: OutputFormat,
  options: Partial<ExportOptions> = {}
): string {
  const prettyPrint = options.prettyPrint ?? true;

  const formatters: Record<OutputFormat, () => string> = {
    json: () => formatJson(data, prettyPrint),
    yaml: () => formatYaml(data),
    markdown: () => formatMarkdown(data as SpecNode[]),
    csv: () => formatCsv(data as SpecNode[]),
  };

  const formatter = formatters[format];

  if (!formatter) {
    throw new Error(`Unsupported output format: ${format}`);
  }

  return formatter();
}

/**
 * Writes content to a file at the specified path, or to stdout
 * if no path is provided.
 */
export function writeOutput(content: string, outputPath?: string): void {
  if (outputPath) {
    fs.writeFileSync(outputPath, content, 'utf-8');
  } else {
    process.stdout.write(content);
  }
}
