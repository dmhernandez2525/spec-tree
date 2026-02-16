import { describe, it, expect } from 'vitest';
import {
  WORKFLOW_TEMPLATES,
  generateWorkflow,
  getAvailableTemplates,
} from './github-actions';

// ---------------------------------------------------------------------------
// WORKFLOW_TEMPLATES
// ---------------------------------------------------------------------------

describe('WORKFLOW_TEMPLATES', () => {
  it('has exactly 4 templates', () => {
    expect(WORKFLOW_TEMPLATES).toHaveLength(4);
  });

  it.each(WORKFLOW_TEMPLATES)(
    'template "$id" has id, name, description, and workflow fields',
    (template) => {
      expect(typeof template.id).toBe('string');
      expect(template.id.length).toBeGreaterThan(0);

      expect(typeof template.name).toBe('string');
      expect(template.name.length).toBeGreaterThan(0);

      expect(typeof template.description).toBe('string');
      expect(template.description.length).toBeGreaterThan(0);

      expect(typeof template.workflow).toBe('string');
      expect(template.workflow.length).toBeGreaterThan(0);
    },
  );
});

// ---------------------------------------------------------------------------
// getAvailableTemplates
// ---------------------------------------------------------------------------

describe('getAvailableTemplates', () => {
  it('returns all workflow templates', () => {
    const templates = getAvailableTemplates();
    expect(templates).toBe(WORKFLOW_TEMPLATES);
    expect(templates).toHaveLength(4);
  });
});

// ---------------------------------------------------------------------------
// generateWorkflow
// ---------------------------------------------------------------------------

describe('generateWorkflow', () => {
  it('returns null for an unknown template id', () => {
    const result = generateWorkflow('nonexistent', {});
    expect(result).toBeNull();
  });

  it('replaces placeholders with provided metadata values', () => {
    const result = generateWorkflow('ci-test', {
      BRANCH: 'main',
      NODE_VERSION: '20',
    });

    expect(result).not.toBeNull();
    expect(result).toContain('branches: [main]');
    expect(result).toContain('node-version: 20');
    expect(result).not.toContain('{{BRANCH}}');
    expect(result).not.toContain('{{NODE_VERSION}}');
  });

  it('leaves unmatched placeholders in place', () => {
    const result = generateWorkflow('deploy-preview', {
      BRANCH: 'main',
      NODE_VERSION: '20',
    });

    expect(result).not.toBeNull();
    // PREVIEW_URL and DEPLOY_TOKEN were not provided
    expect(result).toContain('{{PREVIEW_URL}}');
    expect(result).toContain('{{DEPLOY_TOKEN}}');
  });

  it('produces valid YAML content for the ci-test template', () => {
    const result = generateWorkflow('ci-test', {
      BRANCH: 'main',
      NODE_VERSION: '20',
    });

    expect(result).not.toBeNull();
    expect(result).toContain('name: CI Test Suite');
    expect(result).toContain('on:');
    expect(result).toContain('jobs:');
    expect(result).toContain('runs-on: ubuntu-latest');
    expect(result).toContain('npm ci');
    expect(result).toContain('npm test');
  });

  it('replaces all occurrences of a repeated placeholder', () => {
    // The ci-test template uses {{BRANCH}} twice (push + pull_request)
    const result = generateWorkflow('ci-test', {
      BRANCH: 'develop',
      NODE_VERSION: '18',
    });

    expect(result).not.toBeNull();
    const branchMatches = result!.match(/branches: \[develop\]/g);
    expect(branchMatches).not.toBeNull();
    expect(branchMatches!.length).toBe(2);
  });
});
