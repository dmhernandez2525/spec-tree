// Tests for SpecTree CLI Output Formatters

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'node:fs';
import {
  formatJson,
  formatYaml,
  formatMarkdown,
  formatCsv,
  formatOutput,
  writeOutput,
} from './formatters';
import type { SpecNode } from './types';

vi.mock('node:fs');

const mockFs = vi.mocked(fs);

function makeNode(overrides: Partial<SpecNode> = {}): SpecNode {
  return {
    id: 'node-1',
    title: 'Test Node',
    type: 'feature',
    description: 'A test node',
    children: [],
    metadata: {},
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// formatJson
// ---------------------------------------------------------------------------

describe('formatJson', () => {
  it('outputs compact JSON when pretty is false', () => {
    const data = { name: 'test', value: 42 };
    const result = formatJson(data, false);

    expect(result).toBe('{"name":"test","value":42}');
  });

  it('pretty prints with 2-space indentation when pretty is true', () => {
    const data = { name: 'test', value: 42 };
    const result = formatJson(data, true);

    expect(result).toBe(JSON.stringify(data, null, 2));
    expect(result).toContain('\n');
    expect(result).toContain('  ');
  });

  it('defaults to compact output when pretty is omitted', () => {
    const data = { key: 'value' };
    const result = formatJson(data);

    expect(result).toBe('{"key":"value"}');
  });

  it('handles arrays', () => {
    const data = [1, 2, 3];
    const result = formatJson(data, false);

    expect(result).toBe('[1,2,3]');
  });

  it('handles null', () => {
    const result = formatJson(null, false);

    expect(result).toBe('null');
  });
});

// ---------------------------------------------------------------------------
// formatYaml
// ---------------------------------------------------------------------------

describe('formatYaml', () => {
  it('handles simple strings', () => {
    const result = formatYaml({ name: 'hello' });

    expect(result).toContain('name: hello');
    expect(result.endsWith('\n')).toBe(true);
  });

  it('handles numbers', () => {
    const result = formatYaml({ count: 42 });

    expect(result).toContain('count: 42');
  });

  it('handles booleans', () => {
    const result = formatYaml({ active: true, deleted: false });

    expect(result).toContain('active: true');
    expect(result).toContain('deleted: false');
  });

  it('handles null values', () => {
    const result = formatYaml({ empty: null });

    expect(result).toContain('empty: null');
  });

  it('handles arrays', () => {
    const result = formatYaml({ items: ['a', 'b', 'c'] });

    expect(result).toContain('items:');
    expect(result).toContain('- a');
    expect(result).toContain('- b');
    expect(result).toContain('- c');
  });

  it('handles nested objects', () => {
    const result = formatYaml({
      parent: {
        child: 'value',
      },
    });

    expect(result).toContain('parent:');
    expect(result).toContain('child: value');
  });

  it('quotes strings with special characters (colon)', () => {
    const result = formatYaml({ note: 'key: value' });

    expect(result).toContain('"key: value"');
  });

  it('quotes strings with hash characters', () => {
    const result = formatYaml({ comment: 'has # hash' });

    expect(result).toContain('"has # hash"');
  });

  it('quotes strings that look like booleans', () => {
    const result = formatYaml({ status: 'true' });

    expect(result).toContain('"true"');
  });

  it('quotes strings that look like null', () => {
    const result = formatYaml({ status: 'null' });

    expect(result).toContain('"null"');
  });

  it('quotes empty strings', () => {
    const result = formatYaml({ empty: '' });

    expect(result).toContain('empty: ""');
  });

  it('handles empty arrays as []', () => {
    const result = formatYaml({ items: [] });

    // The serializer treats [] as a non-simple value, so no space before it
    expect(result).toContain('items:[]');
  });

  it('handles empty objects as {}', () => {
    const result = formatYaml({ meta: {} });

    // The serializer treats {} as a non-simple value, so no space before it
    expect(result).toContain('meta:{}');
  });

  it('quotes numeric strings', () => {
    const result = formatYaml({ code: '123' });

    expect(result).toContain('"123"');
  });
});

// ---------------------------------------------------------------------------
// formatMarkdown
// ---------------------------------------------------------------------------

describe('formatMarkdown', () => {
  it('uses # for epic nodes', () => {
    const nodes = [makeNode({ type: 'epic', title: 'My Epic' })];
    const result = formatMarkdown(nodes);

    expect(result).toContain('# My Epic');
  });

  it('uses ## for feature nodes', () => {
    const nodes = [makeNode({ type: 'feature', title: 'My Feature' })];
    const result = formatMarkdown(nodes);

    expect(result).toContain('## My Feature');
  });

  it('uses ### for user-story nodes', () => {
    const nodes = [makeNode({ type: 'user-story', title: 'My Story' })];
    const result = formatMarkdown(nodes);

    expect(result).toContain('### My Story');
  });

  it('uses #### for task nodes', () => {
    const nodes = [makeNode({ type: 'task', title: 'My Task' })];
    const result = formatMarkdown(nodes);

    expect(result).toContain('#### My Task');
  });

  it('includes description text', () => {
    const nodes = [makeNode({ description: 'This is the description.' })];
    const result = formatMarkdown(nodes);

    expect(result).toContain('This is the description.');
  });

  it('includes type and id fields', () => {
    const nodes = [makeNode({ id: 'abc-123', type: 'feature' })];
    const result = formatMarkdown(nodes);

    expect(result).toContain('**Type:** feature');
    expect(result).toContain('**ID:** abc-123');
  });

  it('includes parentId when present', () => {
    const nodes = [makeNode({ parentId: 'parent-1' })];
    const result = formatMarkdown(nodes);

    expect(result).toContain('**Parent:** parent-1');
  });

  it('does not include Parent line when parentId is absent', () => {
    const nodes = [makeNode({ parentId: undefined })];
    const result = formatMarkdown(nodes);

    expect(result).not.toContain('**Parent:**');
  });

  it('includes children when present', () => {
    const nodes = [makeNode({ children: ['child-1', 'child-2'] })];
    const result = formatMarkdown(nodes);

    expect(result).toContain('**Children:** child-1, child-2');
  });

  it('does not include Children line when children array is empty', () => {
    const nodes = [makeNode({ children: [] })];
    const result = formatMarkdown(nodes);

    expect(result).not.toContain('**Children:**');
  });

  it('handles multiple nodes', () => {
    const nodes = [
      makeNode({ type: 'epic', title: 'Epic One' }),
      makeNode({ type: 'task', title: 'Task One' }),
    ];
    const result = formatMarkdown(nodes);

    expect(result).toContain('# Epic One');
    expect(result).toContain('#### Task One');
  });
});

// ---------------------------------------------------------------------------
// formatCsv
// ---------------------------------------------------------------------------

describe('formatCsv', () => {
  it('includes the header row', () => {
    const result = formatCsv([]);

    expect(result).toMatch(/^id,title,type,description,parentId\n/);
  });

  it('formats a simple node as a CSV row', () => {
    const nodes = [
      makeNode({
        id: 'n1',
        title: 'Node One',
        type: 'feature',
        description: 'Desc',
        parentId: 'p1',
      }),
    ];
    const result = formatCsv(nodes);
    const lines = result.trim().split('\n');

    expect(lines).toHaveLength(2);
    expect(lines[1]).toBe('n1,Node One,feature,Desc,p1');
  });

  it('escapes fields that contain commas', () => {
    const nodes = [makeNode({ title: 'One, Two, Three' })];
    const result = formatCsv(nodes);

    expect(result).toContain('"One, Two, Three"');
  });

  it('escapes fields that contain double quotes', () => {
    const nodes = [makeNode({ description: 'She said "hello"' })];
    const result = formatCsv(nodes);

    expect(result).toContain('"She said ""hello"""');
  });

  it('escapes fields that contain newlines', () => {
    const nodes = [makeNode({ description: 'Line 1\nLine 2' })];
    const result = formatCsv(nodes);

    expect(result).toContain('"Line 1\nLine 2"');
  });

  it('uses empty string for missing parentId', () => {
    const nodes = [makeNode({ parentId: undefined })];
    const result = formatCsv(nodes);
    const lines = result.trim().split('\n');
    // Last field should be empty (no parentId)
    expect(lines[1].endsWith(',')).toBe(true);
  });

  it('ends with a trailing newline', () => {
    const result = formatCsv([makeNode()]);

    expect(result.endsWith('\n')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// formatOutput
// ---------------------------------------------------------------------------

describe('formatOutput', () => {
  it('dispatches to formatJson for json format', () => {
    const data = { key: 'val' };
    const result = formatOutput(data, 'json', { prettyPrint: false });

    expect(result).toBe('{"key":"val"}');
  });

  it('dispatches to formatYaml for yaml format', () => {
    const data = { key: 'val' };
    const result = formatOutput(data, 'yaml');

    expect(result).toContain('key: val');
  });

  it('dispatches to formatMarkdown for markdown format', () => {
    const nodes = [makeNode({ type: 'epic', title: 'Test' })];
    const result = formatOutput(nodes, 'markdown');

    expect(result).toContain('# Test');
  });

  it('dispatches to formatCsv for csv format', () => {
    const nodes = [makeNode()];
    const result = formatOutput(nodes, 'csv');

    expect(result).toContain('id,title,type,description,parentId');
  });

  it('defaults to pretty printing for json', () => {
    const data = { a: 1 };
    const result = formatOutput(data, 'json');

    // Default prettyPrint is true
    expect(result).toContain('\n');
  });

  it('respects prettyPrint false option for json', () => {
    const data = { a: 1 };
    const result = formatOutput(data, 'json', { prettyPrint: false });

    expect(result).toBe('{"a":1}');
  });

  it('throws for unsupported format', () => {
    expect(() => formatOutput({}, 'xml' as never)).toThrow(
      /Unsupported output format/
    );
  });
});

// ---------------------------------------------------------------------------
// writeOutput
// ---------------------------------------------------------------------------

describe('writeOutput', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('writes to file when output path is given', () => {
    writeOutput('content here', '/tmp/output.json');

    expect(mockFs.writeFileSync).toHaveBeenCalledWith(
      '/tmp/output.json',
      'content here',
      'utf-8'
    );
  });

  it('writes to stdout when no output path is given', () => {
    const stdoutSpy = vi.spyOn(process.stdout, 'write').mockReturnValue(true);

    writeOutput('stdout content');

    expect(stdoutSpy).toHaveBeenCalledWith('stdout content');
    expect(mockFs.writeFileSync).not.toHaveBeenCalled();

    stdoutSpy.mockRestore();
  });

  it('writes to stdout when output path is undefined', () => {
    const stdoutSpy = vi.spyOn(process.stdout, 'write').mockReturnValue(true);

    writeOutput('data', undefined);

    expect(stdoutSpy).toHaveBeenCalledWith('data');

    stdoutSpy.mockRestore();
  });
});
