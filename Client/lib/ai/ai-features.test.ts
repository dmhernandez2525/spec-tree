import { describe, it, expect } from 'vitest';
import {
  estimateTokenCount,
  estimateCost,
  buildSpecGenerationPrompt,
  buildReviewPrompt,
  parseAIResponse,
  calculateQualityScore,
  AVAILABLE_MODELS,
  DEFAULT_GENERATION_CONFIG,
  SpecForScoring,
} from './advanced-features';

describe('estimateTokenCount', () => {
  it('estimates tokens correctly for standard text', () => {
    // 20 chars / 4 = 5 tokens
    const result = estimateTokenCount('Hello World Testing!');

    expect(result).toBe(5);
  });

  it('handles empty string', () => {
    const result = estimateTokenCount('');

    expect(result).toBe(0);
  });

  it('rounds up for partial tokens', () => {
    // 5 chars / 4 = 1.25 -> ceil = 2
    const result = estimateTokenCount('Hello');

    expect(result).toBe(2);
  });

  it('handles long text', () => {
    const text = 'a'.repeat(1000);
    const result = estimateTokenCount(text);

    expect(result).toBe(250);
  });

  it('handles single character', () => {
    const result = estimateTokenCount('x');

    expect(result).toBe(1);
  });
});

describe('estimateCost', () => {
  it('calculates cost for gpt-4', () => {
    const result = estimateCost(1000, 'gpt-4');

    expect(result).toBe(0.03);
  });

  it('calculates cost for gpt-3.5-turbo', () => {
    const result = estimateCost(1000, 'gpt-3.5-turbo');

    expect(result).toBe(0.002);
  });

  it('calculates cost for claude-3-opus', () => {
    const result = estimateCost(1000, 'claude-3-opus');

    expect(result).toBe(0.015);
  });

  it('calculates cost for claude-3-sonnet', () => {
    const result = estimateCost(1000, 'claude-3-sonnet');

    expect(result).toBe(0.003);
  });

  it('returns null for unknown model', () => {
    const result = estimateCost(1000, 'unknown-model');

    expect(result).toBeNull();
  });

  it('calculates cost for zero tokens', () => {
    const result = estimateCost(0, 'gpt-4');

    expect(result).toBe(0);
  });

  it('scales linearly with token count', () => {
    const cost1k = estimateCost(1000, 'gpt-4')!;
    const cost2k = estimateCost(2000, 'gpt-4')!;

    expect(cost2k).toBeCloseTo(cost1k * 2, 6);
  });
});

describe('buildSpecGenerationPrompt', () => {
  it('includes the project description', () => {
    const result = buildSpecGenerationPrompt('Build a task management app');

    expect(result).toContain('Build a task management app');
  });

  it('includes format instructions', () => {
    const result = buildSpecGenerationPrompt('Test project');

    expect(result).toContain('Format Instructions');
  });

  it('includes required sections by default', () => {
    const result = buildSpecGenerationPrompt('Test project');

    expect(result).toContain('Title');
    expect(result).toContain('Description');
    expect(result).toContain('Requirements');
    expect(result).toContain('Acceptance Criteria');
    expect(result).toContain('Effort Estimates');
  });

  it('includes additional context when provided', () => {
    const result = buildSpecGenerationPrompt('Test project', {
      context: 'This is for an enterprise SaaS platform',
    });

    expect(result).toContain('Additional Context');
    expect(result).toContain('enterprise SaaS platform');
  });

  it('respects concise format option', () => {
    const result = buildSpecGenerationPrompt('Test', {
      format: 'concise',
    });

    expect(result).toContain('concise specification');
  });

  it('respects technical format option', () => {
    const result = buildSpecGenerationPrompt('Test', {
      format: 'technical',
    });

    expect(result).toContain('technical specification');
  });

  it('excludes acceptance criteria when option is false', () => {
    const result = buildSpecGenerationPrompt('Test', {
      includeAcceptanceCriteria: false,
    });

    expect(result).not.toContain('Acceptance Criteria');
  });

  it('excludes estimates when option is false', () => {
    const result = buildSpecGenerationPrompt('Test', {
      includeEstimates: false,
    });

    expect(result).not.toContain('Effort Estimates');
  });

  it('requests JSON format response', () => {
    const result = buildSpecGenerationPrompt('Test');

    expect(result).toContain('JSON format');
  });
});

describe('buildReviewPrompt', () => {
  it('includes spec content', () => {
    const result = buildReviewPrompt('My specification content here');

    expect(result).toContain('My specification content here');
  });

  it('includes default criteria when none provided', () => {
    const result = buildReviewPrompt('Test spec');

    expect(result).toContain('Completeness');
    expect(result).toContain('Clarity');
    expect(result).toContain('Testability');
    expect(result).toContain('Feasibility');
    expect(result).toContain('Consistency');
  });

  it('uses custom criteria when provided', () => {
    const criteria = ['Performance', 'Security', 'Scalability'];
    const result = buildReviewPrompt('Test spec', criteria);

    expect(result).toContain('Performance');
    expect(result).toContain('Security');
    expect(result).toContain('Scalability');
    expect(result).not.toContain('Completeness');
  });

  it('includes scoring instructions', () => {
    const result = buildReviewPrompt('Test spec');

    expect(result).toContain('score from 1-10');
  });

  it('includes review instructions section', () => {
    const result = buildReviewPrompt('Test spec');

    expect(result).toContain('Review Instructions');
    expect(result).toContain('Suggestions for improvement');
  });
});

describe('parseAIResponse', () => {
  it('extracts JSON from a valid JSON response', () => {
    const response = '{"title": "Test", "description": "A test spec"}';
    const result = parseAIResponse(response);

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ title: 'Test', description: 'A test spec' });
  });

  it('extracts JSON from a code block', () => {
    const response = 'Here is the result:\n```json\n{"title": "Test"}\n```';
    const result = parseAIResponse(response);

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ title: 'Test' });
  });

  it('handles malformed response gracefully', () => {
    const response = 'This is not JSON at all, just plain text without braces.';
    const result = parseAIResponse(response);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('handles empty response', () => {
    const result = parseAIResponse('');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Empty response');
  });

  it('handles text format', () => {
    const result = parseAIResponse('Just some text', 'text');

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ content: 'Just some text' });
  });

  it('handles markdown format', () => {
    const result = parseAIResponse('# Heading\nContent', 'markdown');

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ content: '# Heading\nContent' });
  });

  it('extracts JSON embedded in surrounding text', () => {
    const response = 'Here is the data: {"key": "value"} end.';
    const result = parseAIResponse(response);

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ key: 'value' });
  });
});

describe('calculateQualityScore', () => {
  it('scores a full spec high', () => {
    const spec: SpecForScoring = {
      title: 'A comprehensive project specification',
      description:
        'This is a very detailed description of the project that covers all the necessary information and provides context for the development team. It includes background, goals, and scope details that span over two hundred characters easily.',
      requirements: ['Req 1', 'Req 2', 'Req 3', 'Req 4', 'Req 5'],
      acceptanceCriteria: ['AC 1', 'AC 2', 'AC 3', 'AC 4', 'AC 5'],
      estimates: { effort: '3 sprints', complexity: 'high' },
      dependencies: ['Auth service', 'Database'],
      risks: ['Performance issues under load'],
      assumptions: ['Team has TypeScript experience'],
    };
    const score = calculateQualityScore(spec);

    expect(score).toBeGreaterThanOrEqual(90);
  });

  it('scores a minimal spec low', () => {
    const spec: SpecForScoring = {
      title: 'Short',
      description: 'Brief.',
    };
    const score = calculateQualityScore(spec);

    expect(score).toBeLessThanOrEqual(30);
  });

  it('returns 0 for empty spec', () => {
    const score = calculateQualityScore({});

    expect(score).toBe(0);
  });

  it('awards points for title length', () => {
    const shortTitle = calculateQualityScore({ title: 'Hi' });
    const longTitle = calculateQualityScore({
      title: 'A much longer and more descriptive title',
    });

    expect(longTitle).toBeGreaterThan(shortTitle);
  });

  it('awards points for description length', () => {
    const shortDesc = calculateQualityScore({
      title: 'Test',
      description: 'Short',
    });
    const longDesc = calculateQualityScore({
      title: 'Test',
      description: 'A much more detailed description that provides ample context about the project requirements and goals',
    });

    expect(longDesc).toBeGreaterThan(shortDesc);
  });

  it('awards points for requirements count', () => {
    const fewReqs = calculateQualityScore({
      requirements: ['Req 1'],
    });
    const manyReqs = calculateQualityScore({
      requirements: ['Req 1', 'Req 2', 'Req 3', 'Req 4', 'Req 5'],
    });

    expect(manyReqs).toBeGreaterThan(fewReqs);
  });

  it('caps score at 100', () => {
    const spec: SpecForScoring = {
      title: 'A very comprehensive project title for testing',
      description:
        'An incredibly detailed description that goes on and on with extensive information covering every possible aspect of the project, its background, constraints, and expected outcomes. The description is purposefully very long to test the upper boundary and ensure the scoring function handles maximum values correctly.',
      requirements: Array.from({ length: 10 }, (_, i) => `Req ${i + 1}`),
      acceptanceCriteria: Array.from({ length: 10 }, (_, i) => `AC ${i + 1}`),
      estimates: { effort: '5 sprints' },
      dependencies: ['Dep 1', 'Dep 2'],
      risks: ['Risk 1', 'Risk 2'],
      assumptions: ['Assumption 1'],
    };
    const score = calculateQualityScore(spec);

    expect(score).toBeLessThanOrEqual(100);
  });

  it('handles null spec gracefully', () => {
    const score = calculateQualityScore(null as unknown as SpecForScoring);

    expect(score).toBe(0);
  });
});

describe('AVAILABLE_MODELS', () => {
  it('has the expected count of models', () => {
    expect(AVAILABLE_MODELS).toHaveLength(4);
  });

  it('each model has all required fields', () => {
    AVAILABLE_MODELS.forEach((model) => {
      expect(model.id).toBeDefined();
      expect(model.name).toBeDefined();
      expect(model.provider).toBeDefined();
      expect(model.maxTokens).toBeGreaterThan(0);
      expect(model.costPer1kTokens).toBeGreaterThan(0);
    });
  });

  it('includes openai models', () => {
    const openaiModels = AVAILABLE_MODELS.filter(
      (m) => m.provider === 'openai'
    );

    expect(openaiModels).toHaveLength(2);
  });

  it('includes anthropic models', () => {
    const anthropicModels = AVAILABLE_MODELS.filter(
      (m) => m.provider === 'anthropic'
    );

    expect(anthropicModels).toHaveLength(2);
  });

  it('has unique model ids', () => {
    const ids = AVAILABLE_MODELS.map((m) => m.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(ids.length);
  });
});

describe('DEFAULT_GENERATION_CONFIG', () => {
  it('has expected temperature', () => {
    expect(DEFAULT_GENERATION_CONFIG.temperature).toBe(0.7);
  });

  it('has expected maxTokens', () => {
    expect(DEFAULT_GENERATION_CONFIG.maxTokens).toBe(4096);
  });

  it('has expected topP', () => {
    expect(DEFAULT_GENERATION_CONFIG.topP).toBe(1);
  });

  it('has expected frequencyPenalty', () => {
    expect(DEFAULT_GENERATION_CONFIG.frequencyPenalty).toBe(0);
  });

  it('has expected presencePenalty', () => {
    expect(DEFAULT_GENERATION_CONFIG.presencePenalty).toBe(0);
  });

  it('has a model set', () => {
    expect(DEFAULT_GENERATION_CONFIG.model).toBeDefined();
    expect(DEFAULT_GENERATION_CONFIG.model.length).toBeGreaterThan(0);
  });
});
