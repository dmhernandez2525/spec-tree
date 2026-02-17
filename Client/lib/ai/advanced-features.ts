// F10.2 - Advanced AI Features
// Provides AI model configuration, token estimation, cost calculation,
// prompt building, response parsing, and quality scoring for SpecTree.

export interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'local';
  maxTokens: number;
  costPer1kTokens: number;
}

export interface GenerationConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

export const DEFAULT_GENERATION_CONFIG: GenerationConfig = {
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 4096,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
};

export const AVAILABLE_MODELS: AIModel[] = [
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'openai',
    maxTokens: 8192,
    costPer1kTokens: 0.03,
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    maxTokens: 4096,
    costPer1kTokens: 0.002,
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    maxTokens: 4096,
    costPer1kTokens: 0.015,
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'anthropic',
    maxTokens: 4096,
    costPer1kTokens: 0.003,
  },
];

/**
 * Rough token count estimate. Uses the heuristic of ~4 characters per token,
 * which is a commonly accepted approximation for English text.
 */
export function estimateTokenCount(text: string): number {
  if (!text || text.length === 0) return 0;
  return Math.ceil(text.length / 4);
}

/**
 * Calculates the estimated cost in dollars for a given number of tokens
 * and a specific model. Returns null if the model is not found.
 */
export function estimateCost(
  tokenCount: number,
  modelId: string
): number | null {
  const model = AVAILABLE_MODELS.find((m) => m.id === modelId);
  if (!model) return null;

  const cost = (tokenCount / 1000) * model.costPer1kTokens;
  return Math.round(cost * 1000000) / 1000000;
}

export interface SpecGenerationOptions {
  context?: string;
  format?: 'detailed' | 'concise' | 'technical';
  includeAcceptanceCriteria?: boolean;
  includeEstimates?: boolean;
}

/**
 * Builds a structured prompt for specification generation.
 * Includes the project description, optional context, and format instructions
 * to guide the AI in producing well-structured specifications.
 */
export function buildSpecGenerationPrompt(
  description: string,
  options?: SpecGenerationOptions
): string {
  const format = options?.format || 'detailed';
  const includeAC = options?.includeAcceptanceCriteria !== false;
  const includeEstimates = options?.includeEstimates !== false;

  const sections: string[] = [
    'You are a software specification expert. Generate a comprehensive specification based on the following description.',
    '',
    '## Project Description',
    description,
  ];

  if (options?.context) {
    sections.push('', '## Additional Context', options.context);
  }

  sections.push('', '## Format Instructions');

  const formatInstructions: Record<string, string> = {
    detailed:
      'Provide a detailed specification with full descriptions, edge cases, and implementation notes.',
    concise:
      'Provide a concise specification with key requirements and brief descriptions.',
    technical:
      'Provide a technical specification with architecture details, data models, and API contracts.',
  };

  sections.push(formatInstructions[format]);

  sections.push('', '## Required Sections');
  sections.push('- Title');
  sections.push('- Description');
  sections.push('- Requirements (functional and non-functional)');

  if (includeAC) {
    sections.push('- Acceptance Criteria');
  }

  if (includeEstimates) {
    sections.push('- Effort Estimates');
  }

  sections.push('- Dependencies');
  sections.push('- Risks and Assumptions');

  sections.push(
    '',
    'Please respond with a well-structured specification in JSON format.'
  );

  return sections.join('\n');
}

/**
 * Builds a prompt for AI-driven specification review.
 * Includes the spec content and configurable quality criteria
 * for the AI to evaluate against.
 */
export function buildReviewPrompt(
  spec: string,
  criteria?: string[]
): string {
  const defaultCriteria = [
    'Completeness: Does the spec cover all necessary aspects?',
    'Clarity: Is the language clear and unambiguous?',
    'Testability: Can the requirements be verified through testing?',
    'Feasibility: Are the requirements technically achievable?',
    'Consistency: Are there any contradictions or conflicts?',
  ];

  const reviewCriteria = criteria || defaultCriteria;

  const sections: string[] = [
    'You are a senior software architect reviewing a specification. Evaluate the following spec against the provided quality criteria.',
    '',
    '## Specification',
    spec,
    '',
    '## Quality Criteria',
  ];

  reviewCriteria.forEach((criterion, index) => {
    sections.push(`${index + 1}. ${criterion}`);
  });

  sections.push(
    '',
    '## Review Instructions',
    'For each criterion, provide:',
    '- A score from 1-10',
    '- Specific feedback with examples',
    '- Suggestions for improvement',
    '',
    'Respond in JSON format with an array of review items.'
  );

  return sections.join('\n');
}

export interface ParsedAIResponse {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}

/**
 * Attempts to extract structured data (JSON) from an AI text response.
 * Supports responses where JSON is embedded in markdown code blocks
 * or returned as raw JSON. Returns a success/error result object.
 */
export function parseAIResponse(
  response: string,
  expectedFormat: 'json' | 'markdown' | 'text' = 'json'
): ParsedAIResponse {
  if (!response || response.trim() === '') {
    return { success: false, error: 'Empty response' };
  }

  if (expectedFormat === 'text') {
    return { success: true, data: { content: response } };
  }

  if (expectedFormat === 'markdown') {
    return { success: true, data: { content: response } };
  }

  // Try to extract JSON from the response
  try {
    // First, try direct JSON parse
    const parsed = JSON.parse(response);
    return { success: true, data: parsed };
  } catch {
    // Try to find JSON in code blocks
    const codeBlockMatch = response.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (codeBlockMatch) {
      try {
        const parsed = JSON.parse(codeBlockMatch[1].trim());
        return { success: true, data: parsed };
      } catch {
        return {
          success: false,
          error: 'Found code block but could not parse JSON',
        };
      }
    }

    // Try to find a JSON-like structure in the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return { success: true, data: parsed };
      } catch {
        return { success: false, error: 'Found JSON-like content but parsing failed' };
      }
    }

    return { success: false, error: 'No valid JSON found in response' };
  }
}

export interface SpecForScoring {
  title?: string;
  description?: string;
  requirements?: string[];
  acceptanceCriteria?: string[];
  estimates?: Record<string, unknown>;
  dependencies?: string[];
  risks?: string[];
  assumptions?: string[];
}

/**
 * Calculates a quality score (0-100) for a specification based on
 * completeness of key sections. Each section contributes a weighted
 * portion to the total score.
 */
export function calculateQualityScore(spec: SpecForScoring): number {
  if (!spec || Object.keys(spec).length === 0) return 0;

  let score = 0;

  // Title: 15 points
  if (spec.title && spec.title.trim().length > 0) {
    score += 10;
    if (spec.title.trim().length >= 10) score += 5;
  }

  // Description: 25 points
  if (spec.description && spec.description.trim().length > 0) {
    score += 10;
    if (spec.description.trim().length >= 50) score += 10;
    if (spec.description.trim().length >= 200) score += 5;
  }

  // Requirements: 20 points
  if (spec.requirements && spec.requirements.length > 0) {
    score += 10;
    if (spec.requirements.length >= 3) score += 5;
    if (spec.requirements.length >= 5) score += 5;
  }

  // Acceptance Criteria: 20 points
  if (spec.acceptanceCriteria && spec.acceptanceCriteria.length > 0) {
    score += 10;
    if (spec.acceptanceCriteria.length >= 3) score += 5;
    if (spec.acceptanceCriteria.length >= 5) score += 5;
  }

  // Estimates: 5 points
  if (spec.estimates && Object.keys(spec.estimates).length > 0) {
    score += 5;
  }

  // Dependencies: 5 points
  if (spec.dependencies && spec.dependencies.length > 0) {
    score += 5;
  }

  // Risks: 5 points
  if (spec.risks && spec.risks.length > 0) {
    score += 5;
  }

  // Assumptions: 5 points
  if (spec.assumptions && spec.assumptions.length > 0) {
    score += 5;
  }

  return Math.min(score, 100);
}
