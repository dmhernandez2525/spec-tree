// F11.1 - AI Spec Quality Scoring
// Provides quality analysis and scoring for software specification documents.
// Evaluates completeness, clarity, consistency, testability, and feasibility.

export type QualityDimension =
  | 'completeness'
  | 'clarity'
  | 'consistency'
  | 'testability'
  | 'feasibility';

export interface QualityScore {
  dimension: QualityDimension;
  score: number; // 0-100
  feedback: string;
  suggestions: string[];
}

export interface QualityReport {
  overallScore: number;
  dimensions: QualityScore[];
  summary: string;
  timestamp: number;
}

export interface SpecSection {
  title: string;
  content: string;
  wordCount: number;
  hasAcceptanceCriteria: boolean;
  hasDependencies: boolean;
}

// Minimum thresholds for completeness scoring
export const MIN_SECTIONS = 3;
export const MIN_WORD_COUNT_PER_SECTION = 20;
export const IDEAL_SECTIONS = 8;

// Clarity analysis constants
export const MAX_AVG_SENTENCE_LENGTH = 25;
export const AMBIGUOUS_WORDS = [
  'maybe',
  'probably',
  'might',
  'could',
  'possibly',
  'sometimes',
  'usually',
];
export const PASSIVE_VOICE_PATTERNS = [
  'is done',
  'was created',
  'will be handled',
  'is handled',
  'was done',
  'is performed',
  'was performed',
  'will be done',
  'is managed',
  'was managed',
  'will be managed',
  'is processed',
  'was processed',
  'will be processed',
  'is executed',
  'was executed',
  'will be executed',
];

// Testability analysis constants
export const ACTION_VERBS = ['shall', 'must', 'will'];

// Feasibility constraints defaults
export const DEFAULT_MAX_SECTIONS = 20;
export const DEFAULT_MAX_WORDS_PER_SECTION = 2000;

// Quality dimension weights for the overall score
export const DIMENSION_WEIGHTS: Record<QualityDimension, number> = {
  completeness: 0.25,
  clarity: 0.2,
  consistency: 0.15,
  testability: 0.25,
  feasibility: 0.15,
};

/**
 * Clamps a value between 0 and 100.
 */
function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

/**
 * Splits text into sentences using common sentence-ending punctuation.
 * Filters out empty results from the split.
 */
function splitSentences(text: string): string[] {
  return text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Counts the number of words in a string.
 */
function countWords(text: string): number {
  if (!text || text.trim().length === 0) return 0;
  return text.trim().split(/\s+/).length;
}

/**
 * Analyzes spec completeness based on section count, word count,
 * acceptance criteria presence, and dependency tracking.
 */
export function analyzeCompleteness(sections: SpecSection[]): QualityScore {
  const suggestions: string[] = [];

  if (!sections || sections.length === 0) {
    return {
      dimension: 'completeness',
      score: 0,
      feedback: 'No sections found. The specification is empty.',
      suggestions: ['Add at least 3 sections covering requirements, design, and acceptance criteria.'],
    };
  }

  let score = 0;

  // Section count scoring (up to 30 points)
  const sectionRatio = Math.min(sections.length / IDEAL_SECTIONS, 1);
  score += sectionRatio * 30;

  if (sections.length < MIN_SECTIONS) {
    suggestions.push(
      `Add more sections. Found ${sections.length}, but at least ${MIN_SECTIONS} are recommended.`
    );
  }

  // Word count scoring (up to 25 points)
  const totalWords = sections.reduce((sum, s) => sum + s.wordCount, 0);
  const avgWords = totalWords / sections.length;
  const wordScore = Math.min(avgWords / MIN_WORD_COUNT_PER_SECTION, 1) * 25;
  score += wordScore;

  const shortSections = sections.filter(
    (s) => s.wordCount < MIN_WORD_COUNT_PER_SECTION
  );
  if (shortSections.length > 0) {
    suggestions.push(
      `${shortSections.length} section(s) have fewer than ${MIN_WORD_COUNT_PER_SECTION} words. Expand them with more detail.`
    );
  }

  // Empty sections penalty
  const emptySections = sections.filter(
    (s) => !s.content || s.content.trim().length === 0
  );
  if (emptySections.length > 0) {
    const penalty = (emptySections.length / sections.length) * 15;
    score -= penalty;
    suggestions.push(
      `${emptySections.length} section(s) are empty. Fill in content for all sections.`
    );
  }

  // Acceptance criteria scoring (up to 25 points)
  const sectionsWithAC = sections.filter((s) => s.hasAcceptanceCriteria);
  const acRatio = sectionsWithAC.length / sections.length;
  score += acRatio * 25;

  if (sectionsWithAC.length === 0) {
    suggestions.push('No sections include acceptance criteria. Add measurable criteria to validate requirements.');
  } else if (acRatio < 0.5) {
    suggestions.push('Less than half of sections include acceptance criteria. Consider adding criteria to more sections.');
  }

  // Dependency tracking scoring (up to 20 points)
  const sectionsWithDeps = sections.filter((s) => s.hasDependencies);
  const depRatio = sectionsWithDeps.length / sections.length;
  score += depRatio * 20;

  if (sectionsWithDeps.length === 0) {
    suggestions.push('No sections track dependencies. Documenting dependencies helps with planning and risk assessment.');
  }

  const feedback = score >= 80
    ? 'The specification is comprehensive with good coverage across sections.'
    : score >= 60
      ? 'The specification covers the basics but could benefit from more detail.'
      : 'The specification has significant gaps that should be addressed.';

  return {
    dimension: 'completeness',
    score: clampScore(score),
    feedback,
    suggestions,
  };
}

/**
 * Analyzes spec clarity by examining sentence length, ambiguous words,
 * and passive voice usage.
 */
export function analyzeClarity(content: string): QualityScore {
  const suggestions: string[] = [];

  if (!content || content.trim().length === 0) {
    return {
      dimension: 'clarity',
      score: 0,
      feedback: 'No content to analyze for clarity.',
      suggestions: ['Provide specification content to evaluate.'],
    };
  }

  let score = 100;

  // Sentence length analysis
  const sentences = splitSentences(content);
  if (sentences.length === 0) {
    return {
      dimension: 'clarity',
      score: 20,
      feedback: 'Content does not contain complete sentences.',
      suggestions: ['Write complete sentences with proper punctuation.'],
    };
  }

  const avgWordsPerSentence =
    sentences.reduce((sum, s) => sum + countWords(s), 0) / sentences.length;

  if (avgWordsPerSentence > MAX_AVG_SENTENCE_LENGTH) {
    const penalty = Math.min(
      (avgWordsPerSentence - MAX_AVG_SENTENCE_LENGTH) * 2,
      30
    );
    score -= penalty;
    suggestions.push(
      `Average sentence length is ${Math.round(avgWordsPerSentence)} words. ` +
      `Aim for ${MAX_AVG_SENTENCE_LENGTH} words or fewer per sentence.`
    );
  }

  // Ambiguous words analysis
  const contentLower = content.toLowerCase();
  const foundAmbiguous: string[] = [];
  AMBIGUOUS_WORDS.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = content.match(regex);
    if (matches && matches.length > 0) {
      foundAmbiguous.push(word);
    }
  });

  if (foundAmbiguous.length > 0) {
    const penalty = Math.min(foundAmbiguous.length * 5, 25);
    score -= penalty;
    suggestions.push(
      `Found ambiguous words: ${foundAmbiguous.join(', ')}. ` +
      'Replace with precise, definitive language.'
    );
  }

  // Passive voice analysis
  const foundPassive: string[] = [];
  PASSIVE_VOICE_PATTERNS.forEach((pattern) => {
    if (contentLower.includes(pattern)) {
      foundPassive.push(pattern);
    }
  });

  if (foundPassive.length > 0) {
    const penalty = Math.min(foundPassive.length * 4, 20);
    score -= penalty;
    suggestions.push(
      `Found passive voice patterns: "${foundPassive.join('", "')}". ` +
      'Use active voice for clearer requirements (e.g., "The system processes..." instead of "is processed").'
    );
  }

  const feedback = score >= 80
    ? 'The specification uses clear, precise language.'
    : score >= 60
      ? 'The specification is mostly clear but contains some ambiguous or wordy passages.'
      : 'The specification needs significant clarity improvements to reduce ambiguity.';

  return {
    dimension: 'clarity',
    score: clampScore(score),
    feedback,
    suggestions,
  };
}

/**
 * Analyzes spec consistency by checking for uniform formatting,
 * presence of titles, structural similarity, and duplicate section titles.
 */
export function analyzeConsistency(sections: SpecSection[]): QualityScore {
  const suggestions: string[] = [];

  if (!sections || sections.length === 0) {
    return {
      dimension: 'consistency',
      score: 0,
      feedback: 'No sections to analyze for consistency.',
      suggestions: ['Add specification sections to evaluate.'],
    };
  }

  if (sections.length === 1) {
    return {
      dimension: 'consistency',
      score: 80,
      feedback: 'Only one section present. Consistency is trivially satisfied but the spec may be incomplete.',
      suggestions: ['Consider adding more sections for a thorough specification.'],
    };
  }

  let score = 100;

  // Check that all sections have titles
  const missingTitles = sections.filter(
    (s) => !s.title || s.title.trim().length === 0
  );
  if (missingTitles.length > 0) {
    const penalty = (missingTitles.length / sections.length) * 25;
    score -= penalty;
    suggestions.push(
      `${missingTitles.length} section(s) are missing titles. Every section should have a descriptive title.`
    );
  }

  // Check for duplicate section titles
  const titleCounts: Record<string, number> = {};
  sections.forEach((s) => {
    const normalized = (s.title || '').trim().toLowerCase();
    if (normalized.length > 0) {
      titleCounts[normalized] = (titleCounts[normalized] || 0) + 1;
    }
  });

  const duplicates = Object.entries(titleCounts).filter(
    ([, count]) => count > 1
  );
  if (duplicates.length > 0) {
    const duplicateNames = duplicates.map(([title]) => title);
    const penalty = Math.min(duplicates.length * 10, 30);
    score -= penalty;
    suggestions.push(
      `Duplicate section titles found: "${duplicateNames.join('", "')}". ` +
      'Each section should have a unique title.'
    );
  }

  // Check structural similarity (word count variance)
  const wordCounts = sections.map((s) => s.wordCount);
  const avgWordCount =
    wordCounts.reduce((sum, wc) => sum + wc, 0) / wordCounts.length;

  if (avgWordCount > 0) {
    const variance =
      wordCounts.reduce(
        (sum, wc) => sum + Math.pow(wc - avgWordCount, 2),
        0
      ) / wordCounts.length;
    const stdDev = Math.sqrt(variance);
    const coeffOfVariation = stdDev / avgWordCount;

    // High variation in section length suggests inconsistent depth
    if (coeffOfVariation > 1.5) {
      score -= 20;
      suggestions.push(
        'Section lengths vary dramatically. Aim for more consistent depth across sections.'
      );
    } else if (coeffOfVariation > 1.0) {
      score -= 10;
      suggestions.push(
        'Some sections are significantly longer or shorter than others. Consider balancing content across sections.'
      );
    }
  }

  // Check consistency of acceptance criteria presence
  const withAC = sections.filter((s) => s.hasAcceptanceCriteria).length;
  if (withAC > 0 && withAC < sections.length) {
    const acRatio = withAC / sections.length;
    if (acRatio < 0.5) {
      score -= 10;
      suggestions.push(
        'Acceptance criteria are present in some sections but not others. Apply them consistently.'
      );
    }
  }

  const feedback = score >= 80
    ? 'The specification maintains consistent formatting and structure.'
    : score >= 60
      ? 'The specification has some structural inconsistencies that should be addressed.'
      : 'The specification lacks consistent formatting and structure across sections.';

  return {
    dimension: 'consistency',
    score: clampScore(score),
    feedback,
    suggestions,
  };
}

/**
 * Analyzes spec testability based on acceptance criteria presence,
 * measurable outcomes (numbers/percentages), and action verbs.
 */
export function analyzeTestability(sections: SpecSection[]): QualityScore {
  const suggestions: string[] = [];

  if (!sections || sections.length === 0) {
    return {
      dimension: 'testability',
      score: 0,
      feedback: 'No sections to analyze for testability.',
      suggestions: ['Add specification sections with acceptance criteria.'],
    };
  }

  let score = 0;

  // Acceptance criteria presence (up to 40 points)
  const sectionsWithAC = sections.filter((s) => s.hasAcceptanceCriteria);
  const acRatio = sectionsWithAC.length / sections.length;
  score += acRatio * 40;

  if (sectionsWithAC.length === 0) {
    suggestions.push(
      'No sections contain acceptance criteria. Add specific, testable criteria to each requirement.'
    );
  } else if (acRatio < 0.75) {
    suggestions.push(
      `Only ${sectionsWithAC.length} of ${sections.length} sections have acceptance criteria. ` +
      'Add criteria to the remaining sections.'
    );
  }

  // Measurable outcomes (up to 30 points)
  const allContent = sections.map((s) => s.content).join(' ');
  const measurablePattern = /\d+(\.\d+)?(%|ms|seconds?|minutes?|hours?|days?|bytes?|kb|mb|gb)/gi;
  const measurableMatches = allContent.match(measurablePattern);
  const measurableCount = measurableMatches ? measurableMatches.length : 0;

  // Also check for standalone numbers and percentages
  const numberPattern = /\b\d+(\.\d+)?\b/g;
  const numberMatches = allContent.match(numberPattern);
  const numberCount = numberMatches ? numberMatches.length : 0;

  if (measurableCount >= 5) {
    score += 30;
  } else if (measurableCount >= 2) {
    score += 20;
  } else if (numberCount >= 3) {
    score += 15;
  } else if (numberCount >= 1) {
    score += 10;
  }

  if (measurableCount === 0 && numberCount === 0) {
    suggestions.push(
      'No measurable outcomes found. Include specific numbers, percentages, or time constraints to make requirements verifiable.'
    );
  } else if (measurableCount < 2) {
    suggestions.push(
      'Few measurable outcomes found. Add more quantified targets (e.g., "response time under 200ms", "99.9% uptime").'
    );
  }

  // Action verbs scoring (up to 30 points)
  const foundActionVerbs: string[] = [];
  ACTION_VERBS.forEach((verb) => {
    const regex = new RegExp(`\\b${verb}\\b`, 'gi');
    const matches = allContent.match(regex);
    if (matches && matches.length > 0) {
      foundActionVerbs.push(verb);
    }
  });

  if (foundActionVerbs.length >= 3) {
    score += 30;
  } else if (foundActionVerbs.length >= 2) {
    score += 20;
  } else if (foundActionVerbs.length >= 1) {
    score += 10;
  }

  if (foundActionVerbs.length === 0) {
    suggestions.push(
      'No action verbs ("shall", "must", "will") found. Use definitive language to express requirements.'
    );
  } else if (foundActionVerbs.length < 2) {
    suggestions.push(
      'Limited use of action verbs. Use "shall", "must", and "will" more frequently to express clear obligations.'
    );
  }

  const feedback = score >= 80
    ? 'The specification is highly testable with clear acceptance criteria and measurable outcomes.'
    : score >= 60
      ? 'The specification has some testable elements but could benefit from more measurable criteria.'
      : 'The specification needs significant improvements to be testable. Add acceptance criteria and measurable outcomes.';

  return {
    dimension: 'testability',
    score: clampScore(score),
    feedback,
    suggestions,
  };
}

/**
 * Analyzes spec feasibility based on scope (section count), word count
 * per section, and optional complexity/team size constraints.
 */
export function analyzeFeasibility(
  sections: SpecSection[],
  constraints?: { maxComplexity?: number; teamSize?: number }
): QualityScore {
  const suggestions: string[] = [];

  if (!sections || sections.length === 0) {
    return {
      dimension: 'feasibility',
      score: 0,
      feedback: 'No sections to analyze for feasibility.',
      suggestions: ['Add specification sections to evaluate feasibility.'],
    };
  }

  let score = 100;
  const maxSections = constraints?.maxComplexity || DEFAULT_MAX_SECTIONS;
  const maxWordsPerSection = DEFAULT_MAX_WORDS_PER_SECTION;

  // Scope check: penalize if too many sections
  if (sections.length > maxSections) {
    const excess = sections.length - maxSections;
    const penalty = Math.min(excess * 5, 30);
    score -= penalty;
    suggestions.push(
      `The specification has ${sections.length} sections, exceeding the recommended maximum of ${maxSections}. ` +
      'Consider splitting into multiple specifications or consolidating related sections.'
    );
  }

  // Word count per section: penalize overly verbose sections
  const overlyLong = sections.filter((s) => s.wordCount > maxWordsPerSection);
  if (overlyLong.length > 0) {
    const penalty = Math.min(overlyLong.length * 8, 25);
    score -= penalty;
    suggestions.push(
      `${overlyLong.length} section(s) exceed ${maxWordsPerSection} words. ` +
      'Lengthy sections may indicate requirements that should be broken down further.'
    );
  }

  // Team size constraint check
  if (constraints?.teamSize !== undefined && constraints.teamSize > 0) {
    const sectionsPerPerson = sections.length / constraints.teamSize;
    if (sectionsPerPerson > 5) {
      const penalty = Math.min((sectionsPerPerson - 5) * 5, 20);
      score -= penalty;
      suggestions.push(
        `With a team of ${constraints.teamSize}, each person would handle ~${Math.round(sectionsPerPerson)} sections. ` +
        'Consider reducing scope or increasing team size.'
      );
    }
  }

  // Complexity indicator: sections with both acceptance criteria and dependencies
  // are well-defined; too few of these may indicate underspecified requirements
  const wellDefined = sections.filter(
    (s) => s.hasAcceptanceCriteria && s.hasDependencies
  );
  const wellDefinedRatio = wellDefined.length / sections.length;

  if (wellDefinedRatio < 0.25 && sections.length > 2) {
    score -= 10;
    suggestions.push(
      'Few sections have both acceptance criteria and dependencies defined. ' +
      'Better-defined sections improve estimation accuracy and reduce implementation risk.'
    );
  }

  // Total word count as a rough complexity proxy
  const totalWords = sections.reduce((sum, s) => sum + s.wordCount, 0);
  if (totalWords > maxWordsPerSection * maxSections) {
    score -= 15;
    suggestions.push(
      'The total specification length is very large. Consider phasing the implementation or breaking into smaller deliverables.'
    );
  }

  const feedback = score >= 80
    ? 'The specification scope appears feasible and well-bounded.'
    : score >= 60
      ? 'The specification is mostly feasible but some areas may need scoping adjustments.'
      : 'The specification may be too ambitious. Consider reducing scope or breaking it into phases.';

  return {
    dimension: 'feasibility',
    score: clampScore(score),
    feedback,
    suggestions,
  };
}

/**
 * Runs all five quality analyzers and produces a comprehensive quality report
 * with a weighted overall score and summary.
 */
export function generateQualityReport(
  sections: SpecSection[],
  content: string,
  constraints?: { maxComplexity?: number; teamSize?: number }
): QualityReport {
  const completeness = analyzeCompleteness(sections);
  const clarity = analyzeClarity(content);
  const consistency = analyzeConsistency(sections);
  const testability = analyzeTestability(sections);
  const feasibility = analyzeFeasibility(sections, constraints);

  const dimensions: QualityScore[] = [
    completeness,
    clarity,
    consistency,
    testability,
    feasibility,
  ];

  // Compute weighted average
  const overallScore = clampScore(
    dimensions.reduce((sum, dim) => {
      return sum + dim.score * DIMENSION_WEIGHTS[dim.dimension];
    }, 0)
  );

  const grade = getQualityGrade(overallScore);
  const weakDimensions = dimensions.filter((d) => d.score < 60);
  const strongDimensions = dimensions.filter((d) => d.score >= 80);

  let summary = `Overall quality grade: ${grade} (${overallScore}/100). `;

  if (strongDimensions.length > 0) {
    const strongNames = strongDimensions.map((d) => d.dimension).join(', ');
    summary += `Strengths: ${strongNames}. `;
  }

  if (weakDimensions.length > 0) {
    const weakNames = weakDimensions.map((d) => d.dimension).join(', ');
    summary += `Areas needing improvement: ${weakNames}.`;
  } else if (overallScore >= 80) {
    summary += 'The specification meets quality standards across all dimensions.';
  } else {
    summary += 'The specification is adequate but could be improved in several areas.';
  }

  return {
    overallScore,
    dimensions,
    summary: summary.trim(),
    timestamp: Date.now(),
  };
}

/**
 * Returns a letter grade based on a numeric score (0-100).
 *   A: 90+, B: 80+, C: 70+, D: 60+, F: below 60
 */
export function getQualityGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Returns quality dimensions sorted by score ascending (worst first),
 * filtered to only include those scoring below 80.
 */
export function getImprovementPriorities(
  report: QualityReport
): QualityDimension[] {
  return report.dimensions
    .filter((d) => d.score < 80)
    .sort((a, b) => a.score - b.score)
    .map((d) => d.dimension);
}
