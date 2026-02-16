/**
 * GitHub Actions workflow template generation for F3.1.3 - GitHub Integration
 *
 * Provides pre-built workflow templates that can be customized with
 * spec metadata and committed to a repository's `.github/workflows/`
 * directory.
 */

import type { GitHubActionsTemplate } from '@/types/github';

// ---------------------------------------------------------------------------
// Workflow Templates
// ---------------------------------------------------------------------------

/**
 * Collection of pre-built GitHub Actions workflow templates.
 *
 * Each template uses `{{VARIABLE}}` placeholders that are replaced by
 * `generateWorkflow` with values from spec metadata.
 */
export const WORKFLOW_TEMPLATES: GitHubActionsTemplate[] = [
  {
    id: 'ci-test',
    name: 'CI Test Suite',
    description: 'Runs the test suite on every push and pull request.',
    workflow: [
      'name: CI Test Suite',
      '',
      'on:',
      '  push:',
      '    branches: [{{BRANCH}}]',
      '  pull_request:',
      '    branches: [{{BRANCH}}]',
      '',
      'jobs:',
      '  test:',
      '    runs-on: ubuntu-latest',
      '    steps:',
      '      - uses: actions/checkout@v4',
      '      - name: Setup Node.js',
      '        uses: actions/setup-node@v4',
      '        with:',
      '          node-version: {{NODE_VERSION}}',
      '          cache: npm',
      '      - name: Install dependencies',
      '        run: npm ci',
      '      - name: Run tests',
      '        run: npm test',
    ].join('\n'),
  },
  {
    id: 'lint-check',
    name: 'Lint and Format Check',
    description: 'Runs ESLint and Prettier checks on every push and pull request.',
    workflow: [
      'name: Lint and Format Check',
      '',
      'on:',
      '  push:',
      '    branches: [{{BRANCH}}]',
      '  pull_request:',
      '    branches: [{{BRANCH}}]',
      '',
      'jobs:',
      '  lint:',
      '    runs-on: ubuntu-latest',
      '    steps:',
      '      - uses: actions/checkout@v4',
      '      - name: Setup Node.js',
      '        uses: actions/setup-node@v4',
      '        with:',
      '          node-version: {{NODE_VERSION}}',
      '          cache: npm',
      '      - name: Install dependencies',
      '        run: npm ci',
      '      - name: Run ESLint',
      '        run: npx eslint . --max-warnings 0',
      '      - name: Check formatting',
      '        run: npx prettier --check .',
    ].join('\n'),
  },
  {
    id: 'deploy-preview',
    name: 'Deploy Preview',
    description: 'Deploys a preview environment for each pull request.',
    workflow: [
      'name: Deploy Preview',
      '',
      'on:',
      '  pull_request:',
      '    branches: [{{BRANCH}}]',
      '',
      'jobs:',
      '  deploy-preview:',
      '    runs-on: ubuntu-latest',
      '    steps:',
      '      - uses: actions/checkout@v4',
      '      - name: Setup Node.js',
      '        uses: actions/setup-node@v4',
      '        with:',
      '          node-version: {{NODE_VERSION}}',
      '          cache: npm',
      '      - name: Install dependencies',
      '        run: npm ci',
      '      - name: Build',
      '        run: npm run build',
      '        env:',
      '          PREVIEW_URL: {{PREVIEW_URL}}',
      '          DEPLOY_TOKEN: {{DEPLOY_TOKEN}}',
      '      - name: Deploy to preview',
      '        run: npm run deploy:preview',
      '        env:',
      '          PREVIEW_URL: {{PREVIEW_URL}}',
      '          DEPLOY_TOKEN: {{DEPLOY_TOKEN}}',
    ].join('\n'),
  },
  {
    id: 'release',
    name: 'Release Workflow',
    description: 'Creates a release with a changelog when a version tag is pushed.',
    workflow: [
      'name: Release',
      '',
      'on:',
      '  push:',
      '    tags:',
      '      - "v*"',
      '',
      'permissions:',
      '  contents: write',
      '',
      'jobs:',
      '  release:',
      '    runs-on: ubuntu-latest',
      '    steps:',
      '      - uses: actions/checkout@v4',
      '        with:',
      '          fetch-depth: 0',
      '      - name: Setup Node.js',
      '        uses: actions/setup-node@v4',
      '        with:',
      '          node-version: {{NODE_VERSION}}',
      '          cache: npm',
      '      - name: Install dependencies',
      '        run: npm ci',
      '      - name: Generate changelog',
      '        id: changelog',
      '        run: |',
      '          PREV_TAG=$(git describe --tags --abbrev=0 HEAD^ 2>/dev/null || echo "")',
      '          if [ -n "$PREV_TAG" ]; then',
      '            echo "changes<<EOF" >> "$GITHUB_OUTPUT"',
      '            git log --pretty=format:"- %s (%h)" "$PREV_TAG"..HEAD >> "$GITHUB_OUTPUT"',
      '            echo "" >> "$GITHUB_OUTPUT"',
      '            echo "EOF" >> "$GITHUB_OUTPUT"',
      '          else',
      '            echo "changes=Initial release" >> "$GITHUB_OUTPUT"',
      '          fi',
      '      - name: Create GitHub Release',
      '        uses: actions/create-release@v1',
      '        env:',
      '          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}',
      '        with:',
      '          tag_name: ${{ github.ref_name }}',
      '          release_name: Release ${{ github.ref_name }}',
      '          body: ${{ steps.changelog.outputs.changes }}',
      '          draft: false',
      '          prerelease: false',
    ].join('\n'),
  },
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate a workflow file by applying spec metadata to a template.
 *
 * Looks up the template by `templateId`, then replaces every
 * `{{VARIABLE}}` placeholder with the corresponding value from
 * `specMetadata`. Placeholders without a matching key are left as-is
 * so the caller can identify missing values.
 *
 * Returns `null` if no template matches the given ID.
 */
export function generateWorkflow(
  templateId: string,
  specMetadata: Record<string, string>,
): string | null {
  const template = WORKFLOW_TEMPLATES.find((t) => t.id === templateId);

  if (!template) {
    return null;
  }

  let output = template.workflow;

  for (const [key, value] of Object.entries(specMetadata)) {
    const placeholder = `{{${key}}}`;
    output = output.split(placeholder).join(value);
  }

  return output;
}

/**
 * Return the full list of available workflow templates.
 *
 * Useful for rendering a template picker in the UI.
 */
export function getAvailableTemplates(): GitHubActionsTemplate[] {
  return WORKFLOW_TEMPLATES;
}
