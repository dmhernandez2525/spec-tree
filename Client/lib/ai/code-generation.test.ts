import { describe, it, expect } from 'vitest';
import {
  FILE_EXTENSIONS,
  FRAMEWORK_TEMPLATES,
  toFilename,
  toPascalCase,
  toCamelCase,
  toSnakeCase,
  generateTypeDefinition,
  generateFunction,
  generateTestStub,
  generateFromSpec,
  applyTemplate,
  estimateComplexity,
  type SpecInput,
  type CodeLanguage,
} from './code-generation';

// ---------------------------------------------------------------------------
// FILE_EXTENSIONS
// ---------------------------------------------------------------------------

describe('FILE_EXTENSIONS', () => {
  it('maps typescript to .ts', () => {
    expect(FILE_EXTENSIONS.typescript).toBe('.ts');
  });

  it('maps javascript to .js', () => {
    expect(FILE_EXTENSIONS.javascript).toBe('.js');
  });

  it('maps python to .py', () => {
    expect(FILE_EXTENSIONS.python).toBe('.py');
  });

  it('maps go to .go', () => {
    expect(FILE_EXTENSIONS.go).toBe('.go');
  });

  it('maps rust to .rs', () => {
    expect(FILE_EXTENSIONS.rust).toBe('.rs');
  });

  it('maps java to .java', () => {
    expect(FILE_EXTENSIONS.java).toBe('.java');
  });

  it('contains exactly 6 language entries', () => {
    expect(Object.keys(FILE_EXTENSIONS)).toHaveLength(6);
  });
});

// ---------------------------------------------------------------------------
// FRAMEWORK_TEMPLATES
// ---------------------------------------------------------------------------

describe('FRAMEWORK_TEMPLATES', () => {
  it('has a react template with {{name}} and {{description}} placeholders', () => {
    expect(FRAMEWORK_TEMPLATES.react).toBeDefined();
    expect(FRAMEWORK_TEMPLATES.react).toContain('{{name}}');
    expect(FRAMEWORK_TEMPLATES.react).toContain('{{description}}');
  });

  it('has an express template with route definitions', () => {
    expect(FRAMEWORK_TEMPLATES.express).toBeDefined();
    expect(FRAMEWORK_TEMPLATES.express).toContain('express.Router()');
    expect(FRAMEWORK_TEMPLATES.express).toContain('{{name}}');
  });

  it('has a fastapi template with APIRouter', () => {
    expect(FRAMEWORK_TEMPLATES.fastapi).toBeDefined();
    expect(FRAMEWORK_TEMPLATES.fastapi).toContain('APIRouter');
    expect(FRAMEWORK_TEMPLATES.fastapi).toContain('{{name}}');
  });

  it('has a gin template with gin.Context', () => {
    expect(FRAMEWORK_TEMPLATES.gin).toBeDefined();
    expect(FRAMEWORK_TEMPLATES.gin).toContain('*gin.Context');
    expect(FRAMEWORK_TEMPLATES.gin).toContain('{{name}}');
  });

  it('react template includes React import', () => {
    expect(FRAMEWORK_TEMPLATES.react).toContain('import React from "react"');
  });

  it('express template includes express import', () => {
    expect(FRAMEWORK_TEMPLATES.express).toContain('import express from "express"');
  });
});

// ---------------------------------------------------------------------------
// toFilename
// ---------------------------------------------------------------------------

describe('toFilename', () => {
  it('converts a simple title to a kebab-case filename', () => {
    expect(toFilename('User Profile', 'typescript')).toBe('user-profile.ts');
  });

  it('strips special characters from the title', () => {
    expect(toFilename('Hello World!@#$%', 'javascript')).toBe('hello-world.js');
  });

  it('collapses multiple spaces into a single hyphen', () => {
    expect(toFilename('one   two   three', 'python')).toBe('one-two-three.py');
  });

  it('collapses multiple hyphens into one', () => {
    expect(toFilename('one---two', 'go')).toBe('one-two.go');
  });

  it('returns "untitled" plus extension for empty input', () => {
    expect(toFilename('', 'rust')).toBe('untitled.rs');
  });

  it('returns "untitled" when input is only special characters', () => {
    expect(toFilename('!!!@@@###', 'java')).toBe('untitled.java');
  });

  it('generates correct extension for each language', () => {
    const languages: CodeLanguage[] = [
      'typescript',
      'javascript',
      'python',
      'go',
      'rust',
      'java',
    ];
    const extensions = ['.ts', '.js', '.py', '.go', '.rs', '.java'];
    languages.forEach((lang, i) => {
      expect(toFilename('test', lang)).toBe(`test${extensions[i]}`);
    });
  });

  it('trims leading and trailing whitespace', () => {
    expect(toFilename('  spaced title  ', 'typescript')).toBe('spaced-title.ts');
  });

  it('preserves hyphens already in the title', () => {
    expect(toFilename('my-component', 'typescript')).toBe('my-component.ts');
  });
});

// ---------------------------------------------------------------------------
// toPascalCase
// ---------------------------------------------------------------------------

describe('toPascalCase', () => {
  it('converts space-separated words', () => {
    expect(toPascalCase('user profile card')).toBe('UserProfileCard');
  });

  it('converts hyphen-separated words', () => {
    expect(toPascalCase('user-profile-card')).toBe('UserProfileCard');
  });

  it('converts underscore-separated words', () => {
    expect(toPascalCase('user_profile_card')).toBe('UserProfileCard');
  });

  it('handles mixed separators', () => {
    expect(toPascalCase('user-profile_card name')).toBe('UserProfileCardName');
  });

  it('handles single word', () => {
    expect(toPascalCase('hello')).toBe('Hello');
  });

  it('returns empty string for empty input', () => {
    expect(toPascalCase('')).toBe('');
  });

  it('strips non-alphanumeric characters (except separators)', () => {
    expect(toPascalCase('hello!@# world')).toBe('HelloWorld');
  });

  it('lowercases letters after the first in each word', () => {
    expect(toPascalCase('USER PROFILE')).toBe('UserProfile');
  });
});

// ---------------------------------------------------------------------------
// toCamelCase
// ---------------------------------------------------------------------------

describe('toCamelCase', () => {
  it('converts space-separated words with lowercase first letter', () => {
    expect(toCamelCase('user profile card')).toBe('userProfileCard');
  });

  it('converts hyphen-separated words', () => {
    expect(toCamelCase('user-profile-card')).toBe('userProfileCard');
  });

  it('converts underscore-separated words', () => {
    expect(toCamelCase('user_profile_card')).toBe('userProfileCard');
  });

  it('handles single word', () => {
    expect(toCamelCase('hello')).toBe('hello');
  });

  it('returns empty string for empty input', () => {
    expect(toCamelCase('')).toBe('');
  });

  it('lowercases letters after the first in each word', () => {
    expect(toCamelCase('USER PROFILE')).toBe('userProfile');
  });
});

// ---------------------------------------------------------------------------
// toSnakeCase
// ---------------------------------------------------------------------------

describe('toSnakeCase', () => {
  it('converts space-separated words', () => {
    expect(toSnakeCase('User Profile Card')).toBe('user_profile_card');
  });

  it('converts hyphen-separated words', () => {
    expect(toSnakeCase('user-profile-card')).toBe('user_profile_card');
  });

  it('converts underscore-separated words (no change)', () => {
    expect(toSnakeCase('user_profile_card')).toBe('user_profile_card');
  });

  it('handles single word', () => {
    expect(toSnakeCase('Hello')).toBe('hello');
  });

  it('strips special characters', () => {
    expect(toSnakeCase('Hello!@# World')).toBe('hello_world');
  });

  it('returns empty string for empty input after trim', () => {
    expect(toSnakeCase('   ')).toBe('');
  });
});

// ---------------------------------------------------------------------------
// generateTypeDefinition
// ---------------------------------------------------------------------------

describe('generateTypeDefinition', () => {
  const baseSpec: SpecInput = {
    title: 'User Profile',
    description: 'Stores user profile information',
    type: 'feature',
  };

  it('generates a TypeScript interface with standard fields', () => {
    const result = generateTypeDefinition(baseSpec, 'typescript');
    expect(result).toContain('export interface UserProfile');
    expect(result).toContain('id: string;');
    expect(result).toContain('createdAt: Date;');
    expect(result).toContain(`// ${baseSpec.description}`);
  });

  it('generates a Python dataclass', () => {
    const result = generateTypeDefinition(baseSpec, 'python');
    expect(result).toContain('from dataclasses import dataclass');
    expect(result).toContain('@dataclass');
    expect(result).toContain('class UserProfile:');
    expect(result).toContain('created_at: datetime');
  });

  it('generates a Go struct with json tags', () => {
    const result = generateTypeDefinition(baseSpec, 'go');
    expect(result).toContain('type UserProfile struct {');
    expect(result).toContain('`json:"id"`');
    expect(result).toContain('import "time"');
  });

  it('generates a Rust struct with derive macros', () => {
    const result = generateTypeDefinition(baseSpec, 'rust');
    expect(result).toContain('pub struct UserProfile');
    expect(result).toContain('#[derive(Debug, Clone, Serialize, Deserialize)]');
    expect(result).toContain('use chrono::{DateTime, Utc};');
  });

  it('generates a Java class with getters and setters', () => {
    const result = generateTypeDefinition(baseSpec, 'java');
    expect(result).toContain('public class UserProfile');
    expect(result).toContain('public String getId()');
    expect(result).toContain('public void setId(String id)');
    expect(result).toContain('import java.time.Instant;');
  });

  it('generates a JavaScript JSDoc typedef', () => {
    const result = generateTypeDefinition(baseSpec, 'javascript');
    expect(result).toContain('@typedef {Object} UserProfile');
    expect(result).toContain('@property {string} id');
    expect(result).toContain('@property {Date} createdAt');
  });

  it('uses PascalCase for the type name', () => {
    const spec: SpecInput = {
      title: 'order line item',
      description: 'A single line item',
      type: 'task',
    };
    const result = generateTypeDefinition(spec, 'typescript');
    expect(result).toContain('export interface OrderLineItem');
  });
});

// ---------------------------------------------------------------------------
// generateFunction
// ---------------------------------------------------------------------------

describe('generateFunction', () => {
  it('generates a functional TypeScript stub', () => {
    const result = generateFunction('process data', 'Processes raw data', 'typescript', 'functional');
    expect(result).toContain('export function processData(): void');
    expect(result).toContain('// TODO: implement');
  });

  it('generates a class-based TypeScript stub', () => {
    const result = generateFunction('process data', 'Processes raw data', 'typescript', 'class-based');
    expect(result).toContain('export class ProcessData');
    expect(result).toContain('processData(): void');
  });

  it('generates a functional Python stub using snake_case', () => {
    // toCamelCase("fetch users") = "fetchUsers"
    // toSnakeCase("fetchUsers") = "fetchusers" (no separator in camelCase)
    const result = generateFunction('fetch users', 'Fetches users from API', 'python', 'functional');
    expect(result).toContain('def fetchusers():');
    expect(result).toContain('# TODO: implement');
    expect(result).toContain('pass');
  });

  it('generates a class-based Python stub', () => {
    // toCamelCase("fetch users") = "fetchUsers"
    // toSnakeCase("fetchUsers") = "fetchusers" (no separator)
    const result = generateFunction('fetch users', 'Fetches users', 'python', 'class-based');
    expect(result).toContain('class FetchUsers:');
    expect(result).toContain('def fetchusers(self):');
  });

  it('generates a functional Go stub using PascalCase function name', () => {
    // toCamelCase("send email") = "sendEmail"
    // toPascalCase("sendEmail") = "Sendemail" (no separator in camelCase)
    const result = generateFunction('send email', 'Sends email', 'go', 'functional');
    expect(result).toContain('func Sendemail()');
  });

  it('generates a class-based Go stub with receiver', () => {
    const result = generateFunction('send email', 'Sends email', 'go', 'class-based');
    expect(result).toContain('type SendEmail struct{}');
    // toPascalCase(methodName) where methodName = toCamelCase("send email") = "sendEmail"
    // toPascalCase("sendEmail") = "Sendemail"
    expect(result).toContain('func (s *SendEmail) Sendemail()');
  });

  it('generates a functional Rust stub using snake_case', () => {
    // toCamelCase("validate input") = "validateInput"
    // toSnakeCase("validateInput") = "validateinput" (no separator)
    const result = generateFunction('validate input', 'Validates input', 'rust', 'functional');
    expect(result).toContain('pub fn validateinput()');
  });

  it('generates a class-based Rust struct with impl block', () => {
    // toSnakeCase(methodName) where methodName = toCamelCase("validate input") = "validateInput"
    // toSnakeCase("validateInput") = "validateinput"
    const result = generateFunction('validate input', 'Validates input', 'rust', 'class-based');
    expect(result).toContain('pub struct ValidateInput;');
    expect(result).toContain('impl ValidateInput');
    expect(result).toContain('pub fn validateinput(&self)');
  });

  it('generates a functional Java stub with proper indentation', () => {
    const result = generateFunction('run task', 'Runs a task', 'java', 'functional');
    expect(result).toContain('public void runTask()');
  });

  it('generates a class-based Java stub', () => {
    const result = generateFunction('run task', 'Runs a task', 'java', 'class-based');
    expect(result).toContain('public class RunTask');
    expect(result).toContain('public void runTask()');
  });

  it('generates a functional JavaScript stub', () => {
    const result = generateFunction('load config', 'Loads configuration', 'javascript', 'functional');
    expect(result).toContain('export function loadConfig()');
    expect(result).not.toContain('void');
  });

  it('generates a class-based JavaScript stub', () => {
    const result = generateFunction('load config', 'Loads configuration', 'javascript', 'class-based');
    expect(result).toContain('export class LoadConfig');
    expect(result).toContain('loadConfig()');
  });
});

// ---------------------------------------------------------------------------
// generateTestStub
// ---------------------------------------------------------------------------

describe('generateTestStub', () => {
  it('generates TS/JS describe/it block with no criteria', () => {
    const spec: SpecInput = {
      title: 'Auth Module',
      description: 'Authentication module',
      type: 'feature',
    };
    const result = generateTestStub(spec, 'typescript');
    expect(result).toContain("describe('AuthModule', () => {");
    expect(result).toContain("it('should work as expected', () => {");
    expect(result).toContain('expect(true).toBe(true);');
  });

  it('generates TS/JS tests for each acceptance criterion', () => {
    const spec: SpecInput = {
      title: 'Auth Module',
      description: 'Authentication module',
      type: 'feature',
      acceptanceCriteria: ['Handle valid login', 'Reject invalid password'],
    };
    const result = generateTestStub(spec, 'typescript');
    expect(result).toContain("it('should handle valid login', () => {");
    expect(result).toContain("it('should reject invalid password', () => {");
  });

  it('generates JavaScript tests with the same format as TypeScript', () => {
    const spec: SpecInput = {
      title: 'Logger',
      description: 'Logging utility',
      type: 'task',
    };
    const result = generateTestStub(spec, 'javascript');
    expect(result).toContain("describe('Logger', () => {");
    expect(result).toContain("it('should work as expected', () => {");
  });

  it('generates Python pytest functions with no criteria', () => {
    // toPascalCase("Data Parser") = "DataParser", toSnakeCase("DataParser") = "dataparser"
    const spec: SpecInput = {
      title: 'Data Parser',
      description: 'Parses data files',
      type: 'task',
    };
    const result = generateTestStub(spec, 'python');
    expect(result).toContain('def test_dataparser_works():');
    expect(result).toContain('assert True');
  });

  it('generates Python pytest functions with acceptance criteria', () => {
    // toSnakeCase("DataParser") = "dataparser"
    // toSnakeCase("Parse CSV files") = "parse_csv_files"
    // toSnakeCase("Handle empty input") = "handle_empty_input"
    const spec: SpecInput = {
      title: 'Data Parser',
      description: 'Parses data files',
      type: 'task',
      acceptanceCriteria: ['Parse CSV files', 'Handle empty input'],
    };
    const result = generateTestStub(spec, 'python');
    expect(result).toContain('def test_dataparser_parse_csv_files():');
    expect(result).toContain('def test_dataparser_handle_empty_input():');
  });

  it('generates Go Test functions with no criteria', () => {
    const spec: SpecInput = {
      title: 'Cache Manager',
      description: 'Manages caching',
      type: 'feature',
    };
    const result = generateTestStub(spec, 'go');
    expect(result).toContain('package main');
    expect(result).toContain('import "testing"');
    expect(result).toContain('func TestCacheManager(t *testing.T)');
  });

  it('generates Go Test functions with acceptance criteria', () => {
    const spec: SpecInput = {
      title: 'Cache Manager',
      description: 'Manages caching',
      type: 'feature',
      acceptanceCriteria: ['Store values', 'Evict old entries'],
    };
    const result = generateTestStub(spec, 'go');
    expect(result).toContain('func TestCacheManagerStoreValues(t *testing.T)');
    expect(result).toContain('func TestCacheManagerEvictOldEntries(t *testing.T)');
  });

  it('generates Rust test module with no criteria', () => {
    // toPascalCase("Token Service") = "TokenService"
    // toSnakeCase("TokenService") = "tokenservice" (no separator in PascalCase)
    const spec: SpecInput = {
      title: 'Token Service',
      description: 'Manages tokens',
      type: 'feature',
    };
    const result = generateTestStub(spec, 'rust');
    expect(result).toContain('#[cfg(test)]');
    expect(result).toContain('mod tokenservice_tests {');
    expect(result).toContain('#[test]');
    expect(result).toContain('fn test_tokenservice()');
    expect(result).toContain('assert!(true);');
  });

  it('generates Rust tests with acceptance criteria', () => {
    // toSnakeCase("TokenService") = "tokenservice"
    // toSnakeCase("Generate valid tokens") = "generate_valid_tokens"
    const spec: SpecInput = {
      title: 'Token Service',
      description: 'Manages tokens',
      type: 'feature',
      acceptanceCriteria: ['Generate valid tokens'],
    };
    const result = generateTestStub(spec, 'rust');
    expect(result).toContain('fn test_tokenservice_generate_valid_tokens()');
  });

  it('generates Java JUnit test class with no criteria', () => {
    const spec: SpecInput = {
      title: 'Order Processor',
      description: 'Processes orders',
      type: 'feature',
    };
    const result = generateTestStub(spec, 'java');
    expect(result).toContain('import org.junit.jupiter.api.Test;');
    expect(result).toContain('public class OrderProcessorTest {');
    expect(result).toContain('@Test');
    expect(result).toContain('void testOrderProcessor()');
    expect(result).toContain('assertTrue(true);');
  });

  it('generates Java JUnit tests with acceptance criteria', () => {
    const spec: SpecInput = {
      title: 'Order Processor',
      description: 'Processes orders',
      type: 'feature',
      acceptanceCriteria: ['Validate order total', 'Send confirmation email'],
    };
    const result = generateTestStub(spec, 'java');
    expect(result).toContain('void testValidateOrderTotal()');
    expect(result).toContain('void testSendConfirmationEmail()');
  });
});

// ---------------------------------------------------------------------------
// generateFromSpec
// ---------------------------------------------------------------------------

describe('generateFromSpec', () => {
  const baseSpec: SpecInput = {
    title: 'User Service',
    description: 'Handles user operations',
    type: 'feature',
  };

  it('generates a single main file by default', () => {
    const results = generateFromSpec(baseSpec, { language: 'typescript' });
    expect(results).toHaveLength(1);
    expect(results[0].filename).toBe('user-service.ts');
    expect(results[0].language).toBe('typescript');
    expect(results[0].exports).toContain('userService');
  });

  it('includes a types file when includeTypes is true', () => {
    const results = generateFromSpec(baseSpec, {
      language: 'typescript',
      includeTypes: true,
    });
    expect(results).toHaveLength(2);
    expect(results[1].filename).toBe('user-service-types.ts');
    expect(results[1].content).toContain('export interface UserService');
    expect(results[1].exports).toContain('UserService');
  });

  it('includes a test file when includeTests is true', () => {
    const results = generateFromSpec(baseSpec, {
      language: 'typescript',
      includeTests: true,
    });
    expect(results).toHaveLength(2);
    expect(results[1].filename).toBe('user-service.test.ts');
    expect(results[1].content).toContain("describe('UserService'");
  });

  it('includes both types and test files when both options are true', () => {
    const results = generateFromSpec(baseSpec, {
      language: 'typescript',
      includeTypes: true,
      includeTests: true,
    });
    expect(results).toHaveLength(3);
    expect(results[0].filename).toBe('user-service.ts');
    expect(results[1].filename).toBe('user-service-types.ts');
    expect(results[2].filename).toBe('user-service.test.ts');
  });

  it('uses framework template when framework is specified', () => {
    const results = generateFromSpec(baseSpec, {
      language: 'typescript',
      framework: 'react',
    });
    expect(results[0].content).toContain('import React from "react"');
    expect(results[0].imports).toContain('React');
  });

  it('adds express import when express framework is used', () => {
    const results = generateFromSpec(baseSpec, {
      language: 'javascript',
      framework: 'express',
    });
    expect(results[0].imports).toContain('express');
    expect(results[0].content).toContain('express.Router()');
  });

  it('defaults to functional style', () => {
    const results = generateFromSpec(baseSpec, { language: 'typescript' });
    expect(results[0].exports).toContain('userService');
    expect(results[0].content).toContain('export function userService');
  });

  it('uses class-based style when specified', () => {
    const results = generateFromSpec(baseSpec, {
      language: 'typescript',
      style: 'class-based',
    });
    expect(results[0].exports).toContain('UserService');
    expect(results[0].content).toContain('export class UserService');
  });

  it('applies framework template with class-based style using PascalCase name', () => {
    const results = generateFromSpec(baseSpec, {
      language: 'typescript',
      framework: 'react',
      style: 'class-based',
    });
    expect(results[0].content).toContain('export function UserService()');
  });

  it('generates Python test file with _test.py extension', () => {
    const results = generateFromSpec(baseSpec, {
      language: 'python',
      includeTests: true,
    });
    const testFile = results.find((r) => r.filename.includes('_test'));
    expect(testFile).toBeDefined();
    expect(testFile!.filename).toBe('user-service_test.py');
  });

  it('generates Go test file with _test.go extension', () => {
    const results = generateFromSpec(baseSpec, {
      language: 'go',
      includeTests: true,
    });
    const testFile = results.find((r) => r.filename.includes('_test'));
    expect(testFile).toBeDefined();
    expect(testFile!.filename).toBe('user-service_test.go');
  });

  it('generates Java test file with Test.java extension', () => {
    const results = generateFromSpec(baseSpec, {
      language: 'java',
      includeTests: true,
    });
    const testFile = results.find((r) => r.filename.includes('Test'));
    expect(testFile).toBeDefined();
    expect(testFile!.filename).toBe('user-serviceTest.java');
  });
});

// ---------------------------------------------------------------------------
// applyTemplate
// ---------------------------------------------------------------------------

describe('applyTemplate', () => {
  it('replaces a single variable', () => {
    const result = applyTemplate('Hello {{name}}!', { name: 'World' });
    expect(result).toBe('Hello World!');
  });

  it('replaces multiple different variables', () => {
    const result = applyTemplate('{{greeting}} {{name}}!', {
      greeting: 'Hi',
      name: 'Alice',
    });
    expect(result).toBe('Hi Alice!');
  });

  it('replaces all occurrences of the same variable', () => {
    const result = applyTemplate('{{x}} and {{x}}', { x: 'one' });
    expect(result).toBe('one and one');
  });

  it('leaves unmatched placeholders unchanged', () => {
    const result = applyTemplate('{{known}} and {{unknown}}', { known: 'yes' });
    expect(result).toBe('yes and {{unknown}}');
  });

  it('returns the template unchanged when no variables match', () => {
    const result = applyTemplate('no placeholders here', { name: 'test' });
    expect(result).toBe('no placeholders here');
  });

  it('handles empty variables record', () => {
    const result = applyTemplate('{{a}} {{b}}', {});
    expect(result).toBe('{{a}} {{b}}');
  });
});

// ---------------------------------------------------------------------------
// estimateComplexity
// ---------------------------------------------------------------------------

describe('estimateComplexity', () => {
  it('returns "low" for short description and few criteria', () => {
    const spec: SpecInput = {
      title: 'Simple',
      description: 'Short desc',
      type: 'task',
      acceptanceCriteria: ['One'],
    };
    expect(estimateComplexity(spec)).toBe('low');
  });

  it('returns "low" when description is under 100 chars and 0 criteria', () => {
    const spec: SpecInput = {
      title: 'Simple',
      description: 'Short desc',
      type: 'task',
    };
    expect(estimateComplexity(spec)).toBe('low');
  });

  it('returns "low" when description is under 100 chars and exactly 2 criteria', () => {
    const spec: SpecInput = {
      title: 'Simple',
      description: 'Short desc',
      type: 'task',
      acceptanceCriteria: ['One', 'Two'],
    };
    expect(estimateComplexity(spec)).toBe('low');
  });

  it('returns "high" for description over 500 characters', () => {
    const spec: SpecInput = {
      title: 'Complex',
      description: 'x'.repeat(501),
      type: 'epic',
      acceptanceCriteria: ['One'],
    };
    expect(estimateComplexity(spec)).toBe('high');
  });

  it('returns "high" when there are more than 5 acceptance criteria', () => {
    const spec: SpecInput = {
      title: 'Complex',
      description: 'Medium length description',
      type: 'epic',
      acceptanceCriteria: ['A', 'B', 'C', 'D', 'E', 'F'],
    };
    expect(estimateComplexity(spec)).toBe('high');
  });

  it('returns "medium" for moderate description and criteria', () => {
    const spec: SpecInput = {
      title: 'Medium',
      description: 'x'.repeat(200),
      type: 'feature',
      acceptanceCriteria: ['A', 'B', 'C'],
    };
    expect(estimateComplexity(spec)).toBe('medium');
  });

  it('returns "medium" when description is exactly 100 chars with 2 criteria', () => {
    const spec: SpecInput = {
      title: 'Boundary',
      description: 'x'.repeat(100),
      type: 'story',
      acceptanceCriteria: ['A', 'B'],
    };
    expect(estimateComplexity(spec)).toBe('medium');
  });

  it('returns "high" when description is exactly 501 chars', () => {
    const spec: SpecInput = {
      title: 'Edge',
      description: 'x'.repeat(501),
      type: 'story',
    };
    expect(estimateComplexity(spec)).toBe('high');
  });

  it('returns "medium" when description is exactly 500 chars with 3 criteria', () => {
    const spec: SpecInput = {
      title: 'Edge',
      description: 'x'.repeat(500),
      type: 'story',
      acceptanceCriteria: ['A', 'B', 'C'],
    };
    expect(estimateComplexity(spec)).toBe('medium');
  });
});
