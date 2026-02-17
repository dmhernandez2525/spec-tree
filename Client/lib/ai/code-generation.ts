// F11.3 - Code Generation Integration
// Generates code scaffolds and boilerplate from specification nodes.
// Supports multiple languages, frameworks, and output styles.

// ---------------------------------------------------------------------------
// Types & Interfaces
// ---------------------------------------------------------------------------

export type CodeLanguage =
  | 'typescript'
  | 'javascript'
  | 'python'
  | 'go'
  | 'rust'
  | 'java';

export interface CodeTemplate {
  language: CodeLanguage;
  framework?: string;
  template: string;
  variables: string[];
}

export interface GeneratedCode {
  filename: string;
  language: CodeLanguage;
  content: string;
  imports: string[];
  exports: string[];
}

export interface CodeGenOptions {
  language: CodeLanguage;
  framework?: string;
  includeTests?: boolean;
  includeTypes?: boolean;
  style?: 'functional' | 'class-based';
}

export interface SpecInput {
  title: string;
  description: string;
  type: 'epic' | 'feature' | 'story' | 'task';
  acceptanceCriteria?: string[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const FILE_EXTENSIONS: Record<CodeLanguage, string> = {
  typescript: '.ts',
  javascript: '.js',
  python: '.py',
  go: '.go',
  rust: '.rs',
  java: '.java',
};

export const FRAMEWORK_TEMPLATES: Record<string, string> = {
  react: [
    'import React from "react";',
    '',
    '// {{description}}',
    'export function {{name}}() {',
    '  return <div>{{name}}</div>;',
    '}',
  ].join('\n'),
  express: [
    'import express from "express";',
    '',
    '// {{description}}',
    'const router = express.Router();',
    '',
    'router.get("/", (req, res) => {',
    '  res.json({ message: "{{name}}" });',
    '});',
    '',
    'export default router;',
  ].join('\n'),
  fastapi: [
    'from fastapi import APIRouter',
    '',
    '# {{description}}',
    'router = APIRouter()',
    '',
    '',
    '@router.get("/")',
    'async def {{name}}():',
    '    return {"message": "{{name}}"}',
  ].join('\n'),
  gin: [
    'package main',
    '',
    'import "github.com/gin-gonic/gin"',
    '',
    '// {{description}}',
    'func {{name}}(c *gin.Context) {',
    '\tc.JSON(200, gin.H{"message": "{{name}}"})',
    '}',
  ].join('\n'),
};

// ---------------------------------------------------------------------------
// Utility Functions
// ---------------------------------------------------------------------------

/**
 * Converts a title string to a kebab-case filename with the appropriate
 * file extension for the given language. Strips characters that are not
 * alphanumeric, spaces, or hyphens before transforming.
 */
export function toFilename(title: string, language: CodeLanguage): string {
  const sanitized = title
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  const base = sanitized || 'untitled';
  return `${base}${FILE_EXTENSIONS[language]}`;
}

/**
 * Converts a string to PascalCase.
 * Example: "user profile card" => "UserProfileCard"
 */
export function toPascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9\s-_]/g, '')
    .split(/[\s\-_]+/)
    .filter((word) => word.length > 0)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

/**
 * Converts a string to camelCase.
 * Example: "user profile card" => "userProfileCard"
 */
export function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  if (pascal.length === 0) return '';
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Converts a string to snake_case.
 * Example: "User Profile Card" => "user_profile_card"
 */
export function toSnakeCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9\s-_]/g, '')
    .trim()
    .toLowerCase()
    .split(/[\s\-_]+/)
    .filter((word) => word.length > 0)
    .join('_');
}

// ---------------------------------------------------------------------------
// Code Generation Functions
// ---------------------------------------------------------------------------

/**
 * Generates a type or interface definition based on the spec title and
 * description. Output varies by language:
 * - TypeScript: export interface
 * - Python: @dataclass
 * - Go: struct
 * - Java: public class
 * - Rust: struct with derive macros
 * - JavaScript: JSDoc typedef
 */
export function generateTypeDefinition(
  spec: SpecInput,
  language: CodeLanguage
): string {
  const name = toPascalCase(spec.title);

  const generators: Record<CodeLanguage, () => string> = {
    typescript: () =>
      [
        `// ${spec.description}`,
        `export interface ${name} {`,
        '  id: string;',
        '  name: string;',
        '  description: string;',
        '  createdAt: Date;',
        '  updatedAt: Date;',
        '}',
      ].join('\n'),

    javascript: () =>
      [
        `// ${spec.description}`,
        '/**',
        ` * @typedef {Object} ${name}`,
        ' * @property {string} id',
        ' * @property {string} name',
        ' * @property {string} description',
        ' * @property {Date} createdAt',
        ' * @property {Date} updatedAt',
        ' */',
      ].join('\n'),

    python: () =>
      [
        'from dataclasses import dataclass',
        'from datetime import datetime',
        '',
        '',
        `# ${spec.description}`,
        '@dataclass',
        `class ${name}:`,
        '    id: str',
        '    name: str',
        '    description: str',
        '    created_at: datetime',
        '    updated_at: datetime',
      ].join('\n'),

    go: () =>
      [
        'package main',
        '',
        'import "time"',
        '',
        `// ${name} - ${spec.description}`,
        `type ${name} struct {`,
        '\tID          string    `json:"id"`',
        '\tName        string    `json:"name"`',
        '\tDescription string    `json:"description"`',
        '\tCreatedAt   time.Time `json:"createdAt"`',
        '\tUpdatedAt   time.Time `json:"updatedAt"`',
        '}',
      ].join('\n'),

    rust: () =>
      [
        'use chrono::{DateTime, Utc};',
        'use serde::{Deserialize, Serialize};',
        '',
        `/// ${spec.description}`,
        '#[derive(Debug, Clone, Serialize, Deserialize)]',
        `pub struct ${name} {`,
        '    pub id: String,',
        '    pub name: String,',
        '    pub description: String,',
        '    pub created_at: DateTime<Utc>,',
        '    pub updated_at: DateTime<Utc>,',
        '}',
      ].join('\n'),

    java: () =>
      [
        'import java.time.Instant;',
        '',
        `// ${spec.description}`,
        `public class ${name} {`,
        '    private String id;',
        '    private String name;',
        '    private String description;',
        '    private Instant createdAt;',
        '    private Instant updatedAt;',
        '',
        `    public ${name}() {}`,
        '',
        `    public ${name}(String id, String name, String description, Instant createdAt, Instant updatedAt) {`,
        '        this.id = id;',
        '        this.name = name;',
        '        this.description = description;',
        '        this.createdAt = createdAt;',
        '        this.updatedAt = updatedAt;',
        '    }',
        '',
        '    public String getId() { return id; }',
        '    public void setId(String id) { this.id = id; }',
        '    public String getName() { return name; }',
        '    public void setName(String name) { this.name = name; }',
        '    public String getDescription() { return description; }',
        '    public void setDescription(String description) { this.description = description; }',
        '    public Instant getCreatedAt() { return createdAt; }',
        '    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }',
        '    public Instant getUpdatedAt() { return updatedAt; }',
        '    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }',
        '}',
      ].join('\n'),
  };

  return generators[language]();
}

/**
 * Generates a function stub in the given language. When style is
 * "functional", produces a standalone function. When "class-based",
 * wraps the function inside a class or struct implementation.
 */
export function generateFunction(
  name: string,
  description: string,
  language: CodeLanguage,
  style: 'functional' | 'class-based'
): string {
  const funcName = toCamelCase(name);
  const className = toPascalCase(name);

  if (style === 'functional') {
    return generateFunctionalStub(funcName, description, language);
  }

  return generateClassBasedStub(className, funcName, description, language);
}

function generateFunctionalStub(
  funcName: string,
  description: string,
  language: CodeLanguage
): string {
  const stubs: Record<CodeLanguage, string> = {
    typescript: [
      `// ${description}`,
      `export function ${funcName}(): void {`,
      '  // TODO: implement',
      '}',
    ].join('\n'),

    javascript: [
      `// ${description}`,
      `export function ${funcName}() {`,
      '  // TODO: implement',
      '}',
    ].join('\n'),

    python: [
      `# ${description}`,
      `def ${toSnakeCase(funcName)}():`,
      '    # TODO: implement',
      '    pass',
    ].join('\n'),

    go: [
      `// ${toPascalCase(funcName)} - ${description}`,
      `func ${toPascalCase(funcName)}() {`,
      '\t// TODO: implement',
      '}',
    ].join('\n'),

    rust: [
      `/// ${description}`,
      `pub fn ${toSnakeCase(funcName)}() {`,
      '    // TODO: implement',
      '}',
    ].join('\n'),

    java: [
      `    // ${description}`,
      `    public void ${funcName}() {`,
      '        // TODO: implement',
      '    }',
    ].join('\n'),
  };

  return stubs[language];
}

function generateClassBasedStub(
  className: string,
  methodName: string,
  description: string,
  language: CodeLanguage
): string {
  const stubs: Record<CodeLanguage, string> = {
    typescript: [
      `// ${description}`,
      `export class ${className} {`,
      `  ${methodName}(): void {`,
      '    // TODO: implement',
      '  }',
      '}',
    ].join('\n'),

    javascript: [
      `// ${description}`,
      `export class ${className} {`,
      `  ${methodName}() {`,
      '    // TODO: implement',
      '  }',
      '}',
    ].join('\n'),

    python: [
      `# ${description}`,
      `class ${className}:`,
      `    def ${toSnakeCase(methodName)}(self):`,
      '        # TODO: implement',
      '        pass',
    ].join('\n'),

    go: [
      `// ${className} - ${description}`,
      `type ${className} struct{}`,
      '',
      `// ${toPascalCase(methodName)} implements the core logic.`,
      `func (s *${className}) ${toPascalCase(methodName)}() {`,
      '\t// TODO: implement',
      '}',
    ].join('\n'),

    rust: [
      `/// ${description}`,
      `pub struct ${className};`,
      '',
      `impl ${className} {`,
      `    pub fn ${toSnakeCase(methodName)}(&self) {`,
      '        // TODO: implement',
      '    }',
      '}',
    ].join('\n'),

    java: [
      `// ${description}`,
      `public class ${className} {`,
      `    public void ${methodName}() {`,
      '        // TODO: implement',
      '    }',
      '}',
    ].join('\n'),
  };

  return stubs[language];
}

/**
 * Generates a test file for the given spec. Includes one test per
 * acceptance criterion when provided. Falls back to a single placeholder
 * test when no criteria exist.
 */
export function generateTestStub(
  spec: SpecInput,
  language: CodeLanguage
): string {
  const name = toPascalCase(spec.title);
  const criteria = spec.acceptanceCriteria || [];

  const testGenerators: Record<CodeLanguage, () => string> = {
    typescript: () => generateTsJsTests(name, criteria, true),
    javascript: () => generateTsJsTests(name, criteria, false),
    python: () => generatePythonTests(name, criteria),
    go: () => generateGoTests(name, criteria),
    rust: () => generateRustTests(name, criteria),
    java: () => generateJavaTests(name, criteria),
  };

  return testGenerators[language]();
}

function generateTsJsTests(
  name: string,
  criteria: string[],
  _isTypeScript: boolean
): string {
  const lines: string[] = [];

  lines.push(`describe('${name}', () => {`);

  if (criteria.length === 0) {
    lines.push(`  it('should work as expected', () => {`);
    lines.push('    // TODO: implement test');
    lines.push('    expect(true).toBe(true);');
    lines.push('  });');
  } else {
    criteria.forEach((criterion, index) => {
      if (index > 0) lines.push('');
      lines.push(`  it('should ${criterion.toLowerCase()}', () => {`);
      lines.push('    // TODO: implement test');
      lines.push('    expect(true).toBe(true);');
      lines.push('  });');
    });
  }

  lines.push('});');
  return lines.join('\n');
}

function generatePythonTests(name: string, criteria: string[]): string {
  const snakeName = toSnakeCase(name);
  const lines: string[] = [];

  if (criteria.length === 0) {
    lines.push(`def test_${snakeName}_works():`);
    lines.push('    # TODO: implement test');
    lines.push('    assert True');
  } else {
    criteria.forEach((criterion, index) => {
      if (index > 0) lines.push('');
      const testName = toSnakeCase(criterion);
      lines.push(`def test_${snakeName}_${testName}():`);
      lines.push(`    # ${criterion}`);
      lines.push('    assert True');
    });
  }

  return lines.join('\n');
}

function generateGoTests(name: string, criteria: string[]): string {
  const lines: string[] = ['package main', '', 'import "testing"', ''];

  if (criteria.length === 0) {
    lines.push(`func Test${name}(t *testing.T) {`);
    lines.push('\t// TODO: implement test');
    lines.push('}');
  } else {
    criteria.forEach((criterion, index) => {
      if (index > 0) lines.push('');
      const testSuffix = toPascalCase(criterion);
      lines.push(`func Test${name}${testSuffix}(t *testing.T) {`);
      lines.push(`\t// ${criterion}`);
      lines.push('\t// TODO: implement test');
      lines.push('}');
    });
  }

  return lines.join('\n');
}

function generateRustTests(name: string, criteria: string[]): string {
  const snakeName = toSnakeCase(name);
  const lines: string[] = ['#[cfg(test)]', `mod ${snakeName}_tests {`, ''];

  if (criteria.length === 0) {
    lines.push('    #[test]');
    lines.push(`    fn test_${snakeName}() {`);
    lines.push('        // TODO: implement test');
    lines.push('        assert!(true);');
    lines.push('    }');
  } else {
    criteria.forEach((criterion, index) => {
      if (index > 0) lines.push('');
      const testName = toSnakeCase(criterion);
      lines.push('    #[test]');
      lines.push(`    fn test_${snakeName}_${testName}() {`);
      lines.push(`        // ${criterion}`);
      lines.push('        assert!(true);');
      lines.push('    }');
    });
  }

  lines.push('}');
  return lines.join('\n');
}

function generateJavaTests(name: string, criteria: string[]): string {
  const lines: string[] = [
    'import org.junit.jupiter.api.Test;',
    'import static org.junit.jupiter.api.Assertions.*;',
    '',
    `public class ${name}Test {`,
  ];

  if (criteria.length === 0) {
    lines.push('');
    lines.push('    @Test');
    lines.push(`    void test${name}() {`);
    lines.push('        // TODO: implement test');
    lines.push('        assertTrue(true);');
    lines.push('    }');
  } else {
    criteria.forEach((criterion) => {
      lines.push('');
      lines.push('    @Test');
      lines.push(`    void test${toPascalCase(criterion)}() {`);
      lines.push(`        // ${criterion}`);
      lines.push('        assertTrue(true);');
      lines.push('    }');
    });
  }

  lines.push('}');
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Template Engine
// ---------------------------------------------------------------------------

/**
 * Replaces all {{key}} placeholders in the template string with
 * corresponding values from the variables record. Placeholders without
 * a matching key are left unchanged.
 */
export function applyTemplate(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;
  const keys = Object.keys(variables);

  keys.forEach((key) => {
    const placeholder = `{{${key}}}`;
    // Replace all occurrences of this placeholder
    while (result.includes(placeholder)) {
      result = result.replace(placeholder, variables[key]);
    }
  });

  return result;
}

// ---------------------------------------------------------------------------
// Complexity Estimation
// ---------------------------------------------------------------------------

/**
 * Estimates the complexity of a spec based on description length and
 * the number of acceptance criteria.
 * - Low: description < 100 chars AND <= 2 criteria
 * - High: description > 500 chars OR > 5 criteria
 * - Medium: everything else
 */
export function estimateComplexity(
  spec: SpecInput
): 'low' | 'medium' | 'high' {
  const descLength = spec.description.length;
  const criteriaCount = spec.acceptanceCriteria?.length ?? 0;

  if (descLength > 500 || criteriaCount > 5) return 'high';
  if (descLength < 100 && criteriaCount <= 2) return 'low';
  return 'medium';
}

// ---------------------------------------------------------------------------
// Main Generation Orchestrator
// ---------------------------------------------------------------------------

/**
 * Generates an array of code files from a specification. Always produces
 * the main implementation file. Optionally generates a types file and
 * a test file based on the provided options. When a framework is specified,
 * the framework template is used for the main file.
 */
export function generateFromSpec(
  spec: SpecInput,
  options: CodeGenOptions
): GeneratedCode[] {
  const results: GeneratedCode[] = [];
  const { language, framework, includeTests, includeTypes, style } = options;
  const resolvedStyle = style || 'functional';
  const name = toPascalCase(spec.title);
  const camelName = toCamelCase(spec.title);

  // Main implementation file
  const mainFilename = toFilename(spec.title, language);
  let mainContent: string;

  if (framework && FRAMEWORK_TEMPLATES[framework]) {
    mainContent = applyTemplate(FRAMEWORK_TEMPLATES[framework], {
      name: resolvedStyle === 'class-based' ? name : camelName,
      description: spec.description,
    });
  } else {
    mainContent = generateFunction(
      spec.title,
      spec.description,
      language,
      resolvedStyle
    );
  }

  const mainFile: GeneratedCode = {
    filename: mainFilename,
    language,
    content: mainContent,
    imports: [],
    exports: [resolvedStyle === 'class-based' ? name : camelName],
  };

  // Add framework imports if applicable
  if (framework === 'react') {
    mainFile.imports.push('React');
  } else if (framework === 'express') {
    mainFile.imports.push('express');
  }

  results.push(mainFile);

  // Types file (when requested)
  if (includeTypes) {
    const typesFilename = toFilename(`${spec.title}-types`, language);
    const typesContent = generateTypeDefinition(spec, language);

    results.push({
      filename: typesFilename,
      language,
      content: typesContent,
      imports: [],
      exports: [name],
    });
  }

  // Test file (when requested)
  if (includeTests) {
    const testExtensions: Record<CodeLanguage, string> = {
      typescript: '.test.ts',
      javascript: '.test.js',
      python: '_test.py',
      go: '_test.go',
      rust: '_test.rs',
      java: 'Test.java',
    };

    const baseSlug = spec.title
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    const testFilename = `${baseSlug || 'untitled'}${testExtensions[language]}`;
    const testContent = generateTestStub(spec, language);

    results.push({
      filename: testFilename,
      language,
      content: testContent,
      imports: [],
      exports: [],
    });
  }

  return results;
}
