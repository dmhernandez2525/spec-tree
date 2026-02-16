import { describe, it, expect, beforeEach } from 'vitest';
import {
  extractEntities,
  inferSpecType,
  extractAcceptanceCriteria,
  inferPriority,
  generateSpecId,
  resetSpecCounter,
  convertToSpec,
  splitIntoSections,
  detectDependencies,
} from './nl-to-spec';

// Reset the module-level specCounter before every test
beforeEach(() => {
  resetSpecCounter();
});

// ---------------------------------------------------------------------------
// extractEntities
// ---------------------------------------------------------------------------

describe('extractEntities', () => {
  it('returns empty array for empty text', () => {
    expect(extractEntities('')).toEqual([]);
  });

  it('returns empty array for null/undefined text', () => {
    expect(extractEntities(null as unknown as string)).toEqual([]);
  });

  it('extracts actors from "as a" patterns', () => {
    const entities = extractEntities('As a developer I want to create features.');
    const actors = entities.filter((e) => e.type === 'actor');
    expect(actors.length).toBeGreaterThanOrEqual(1);
    expect(actors[0].confidence).toBe(0.85);
  });

  it('extracts actors from "the user" pattern', () => {
    const entities = extractEntities('The user clicks a button.');
    const actors = entities.filter((e) => e.type === 'actor');
    expect(actors.some((a) => a.name.includes('user'))).toBe(true);
  });

  it('extracts actors from "the admin" pattern', () => {
    const entities = extractEntities('The admin manages roles.');
    const actors = entities.filter((e) => e.type === 'actor');
    expect(actors.some((a) => a.name.includes('admin'))).toBe(true);
  });

  it('extracts system entities', () => {
    const entities = extractEntities('The system processes requests. The API returns data.');
    const systems = entities.filter((e) => e.type === 'system');
    expect(systems.length).toBeGreaterThanOrEqual(1);
    expect(systems[0].confidence).toBe(0.8);
  });

  it('extracts the database as a system entity', () => {
    const entities = extractEntities('The database stores user records.');
    const systems = entities.filter((e) => e.type === 'system');
    expect(systems.some((s) => s.name.includes('database'))).toBe(true);
  });

  it('extracts actions from "should/must/can/will/shall" patterns', () => {
    const entities = extractEntities('The system should validate input. It must log errors.');
    const actions = entities.filter((e) => e.type === 'action');
    expect(actions.length).toBeGreaterThanOrEqual(1);
    expect(actions[0].confidence).toBe(0.75);
  });

  it('extracts constraints from "must not" patterns', () => {
    const entities = extractEntities('The system must not expose passwords.');
    const constraints = entities.filter((e) => e.type === 'constraint');
    expect(constraints.length).toBeGreaterThanOrEqual(1);
    expect(constraints[0].confidence).toBe(0.7);
  });

  it('extracts constraints from "within" patterns', () => {
    const entities = extractEntities('Complete the operation within 5 seconds.');
    const constraints = entities.filter((e) => e.type === 'constraint');
    expect(constraints.length).toBeGreaterThanOrEqual(1);
  });

  it('extracts constraints from "at most" and "at least" patterns', () => {
    const text = 'Use at most 10 connections. Require at least 2 approvals.';
    const entities = extractEntities(text);
    const constraints = entities.filter((e) => e.type === 'constraint');
    expect(constraints.length).toBeGreaterThanOrEqual(2);
  });

  it('extracts mixed entity types from a complex description', () => {
    const text =
      'As a manager, the user should review reports. ' +
      'The system must not allow unauthorized access. ' +
      'The API will return JSON within 2 seconds.';
    const entities = extractEntities(text);
    const types = new Set(entities.map((e) => e.type));
    expect(types.size).toBeGreaterThanOrEqual(2);
  });

  it('deduplicates entities by normalized name', () => {
    const text = 'The user clicks a button. The user submits a form.';
    const entities = extractEntities(text);
    const userEntities = entities.filter((e) => e.name === 'the user');
    expect(userEntities.length).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// inferSpecType
// ---------------------------------------------------------------------------

describe('inferSpecType', () => {
  it('returns "feature" for null/empty text', () => {
    expect(inferSpecType('')).toBe('feature');
    expect(inferSpecType(null as unknown as string)).toBe('feature');
  });

  it('returns "epic" when text contains the word "epic"', () => {
    expect(inferSpecType('This is an epic for the authentication system.')).toBe('epic');
  });

  it('returns "epic" when text is longer than 500 characters', () => {
    const longText = 'a'.repeat(501);
    expect(inferSpecType(longText)).toBe('epic');
  });

  it('returns "story" for "as a...I want" pattern', () => {
    expect(inferSpecType('As a user I want to reset my password.')).toBe('story');
  });

  it('returns "story" for "as an...I want" pattern', () => {
    expect(inferSpecType('As an admin I want to manage users.')).toBe('story');
  });

  it('returns "task" for "implement" keyword', () => {
    expect(inferSpecType('Implement the login endpoint.')).toBe('task');
  });

  it('returns "task" for "create" keyword', () => {
    expect(inferSpecType('Create the database migration script.')).toBe('task');
  });

  it('returns "task" for "deploy" keyword', () => {
    expect(inferSpecType('Deploy the service to production.')).toBe('task');
  });

  it('returns "task" for "configure" keyword', () => {
    expect(inferSpecType('Configure the CI pipeline.')).toBe('task');
  });

  it('returns "feature" as the default fallback', () => {
    expect(inferSpecType('The system handles user authentication.')).toBe('feature');
  });
});

// ---------------------------------------------------------------------------
// extractAcceptanceCriteria
// ---------------------------------------------------------------------------

describe('extractAcceptanceCriteria', () => {
  it('returns empty array for empty text', () => {
    expect(extractAcceptanceCriteria('')).toEqual([]);
  });

  it('returns empty array for null/undefined text', () => {
    expect(extractAcceptanceCriteria(null as unknown as string)).toEqual([]);
  });

  it('extracts Given/When/Then criteria', () => {
    const text = 'Given the user is logged in when they click logout then they are redirected to home.';
    const criteria = extractAcceptanceCriteria(text);
    expect(criteria.length).toBeGreaterThanOrEqual(1);
    expect(criteria[0].toLowerCase()).toContain('given');
    expect(criteria[0].toLowerCase()).toContain('when');
    expect(criteria[0].toLowerCase()).toContain('then');
  });

  it('extracts bullet point items starting with dash', () => {
    const text = '- User can log in\n- User can log out\n- User can reset password';
    const criteria = extractAcceptanceCriteria(text);
    expect(criteria).toHaveLength(3);
    expect(criteria[0]).toBe('User can log in');
  });

  it('extracts bullet point items starting with asterisk', () => {
    const text = '* Feature A works\n* Feature B works';
    const criteria = extractAcceptanceCriteria(text);
    expect(criteria).toHaveLength(2);
  });

  it('extracts numbered list items', () => {
    const text = '1. First criterion\n2. Second criterion\n3. Third criterion';
    const criteria = extractAcceptanceCriteria(text);
    expect(criteria).toHaveLength(3);
    expect(criteria[0]).toBe('First criterion');
  });

  it('extracts numbered list items with closing parenthesis', () => {
    const text = '1) First item\n2) Second item';
    const criteria = extractAcceptanceCriteria(text);
    expect(criteria).toHaveLength(2);
  });

  it('extracts "should" statements as fallback when no bullets or gherkin found', () => {
    const text = 'The system should validate email addresses. It should reject invalid formats.';
    const criteria = extractAcceptanceCriteria(text);
    expect(criteria.length).toBeGreaterThanOrEqual(1);
    expect(criteria.some((c) => c.includes('should'))).toBe(true);
  });

  it('does not extract "should" statements when bullet points are present', () => {
    const text = '- Bullet item\nThe system should validate email.';
    const criteria = extractAcceptanceCriteria(text);
    // The bullet point is found first, so "should" fallback is not used
    expect(criteria.some((c) => c === 'Bullet item')).toBe(true);
  });

  it('filters out very short "should" matches (5 chars or fewer)', () => {
    const text = 'X should Y.';
    const criteria = extractAcceptanceCriteria(text);
    // "X should Y" is the capture; length depends on the match
    // The function filters out matches with trimmed length <= 5
    expect(criteria.every((c) => c.length > 5)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// inferPriority
// ---------------------------------------------------------------------------

describe('inferPriority', () => {
  it('returns "medium" for null/empty text', () => {
    expect(inferPriority('')).toBe('medium');
    expect(inferPriority(null as unknown as string)).toBe('medium');
  });

  it('returns "high" for "critical" keyword', () => {
    expect(inferPriority('This is a critical bug fix.')).toBe('high');
  });

  it('returns "high" for "urgent" keyword', () => {
    expect(inferPriority('Urgent: server is down.')).toBe('high');
  });

  it('returns "high" for "blocker" keyword', () => {
    expect(inferPriority('This is a blocker for the release.')).toBe('high');
  });

  it('returns "high" for "asap" keyword', () => {
    expect(inferPriority('Fix this ASAP.')).toBe('high');
  });

  it('returns "high" for "security vulnerability" keyword', () => {
    expect(inferPriority('Found a security vulnerability in auth.')).toBe('high');
  });

  it('returns "high" for "p0" keyword', () => {
    expect(inferPriority('P0 incident in production.')).toBe('high');
  });

  it('returns "low" for "nice to have" keyword', () => {
    expect(inferPriority('This is a nice to have feature.')).toBe('low');
  });

  it('returns "low" for "eventually" keyword', () => {
    expect(inferPriority('We should eventually refactor this.')).toBe('low');
  });

  it('returns "low" for "backlog" keyword', () => {
    expect(inferPriority('Move this to the backlog.')).toBe('low');
  });

  it('returns "low" for "stretch goal" keyword', () => {
    expect(inferPriority('This is a stretch goal for Q3.')).toBe('low');
  });

  it('returns "medium" when no priority keywords found', () => {
    expect(inferPriority('Implement the user profile page.')).toBe('medium');
  });

  it('prioritizes high over low when both keywords appear', () => {
    expect(inferPriority('This is critical but nice to have.')).toBe('high');
  });
});

// ---------------------------------------------------------------------------
// generateSpecId & resetSpecCounter
// ---------------------------------------------------------------------------

describe('generateSpecId', () => {
  it('generates ID with default SPEC prefix', () => {
    const id = generateSpecId();
    expect(id).toBe('SPEC-001');
  });

  it('generates ID with custom prefix', () => {
    const id = generateSpecId('FEAT');
    expect(id).toBe('FEAT-001');
  });

  it('increments the counter on successive calls', () => {
    const id1 = generateSpecId();
    const id2 = generateSpecId();
    const id3 = generateSpecId();
    expect(id1).toBe('SPEC-001');
    expect(id2).toBe('SPEC-002');
    expect(id3).toBe('SPEC-003');
  });

  it('pads the counter to 3 digits', () => {
    const id = generateSpecId();
    expect(id).toMatch(/-\d{3}$/);
  });

  it('handles counters beyond 999 without truncation', () => {
    // Generate 999 IDs first (counter starts at 0 after reset)
    for (let i = 0; i < 999; i++) {
      generateSpecId();
    }
    const id1000 = generateSpecId();
    expect(id1000).toBe('SPEC-1000');
  });
});

describe('resetSpecCounter', () => {
  it('resets counter so next ID starts at 001 again', () => {
    generateSpecId(); // SPEC-001
    generateSpecId(); // SPEC-002
    resetSpecCounter();
    const id = generateSpecId();
    expect(id).toBe('SPEC-001');
  });
});

// ---------------------------------------------------------------------------
// splitIntoSections
// ---------------------------------------------------------------------------

describe('splitIntoSections', () => {
  it('returns empty array for empty text', () => {
    expect(splitIntoSections('')).toEqual([]);
  });

  it('returns empty array for null/undefined text', () => {
    expect(splitIntoSections(null as unknown as string)).toEqual([]);
  });

  it('splits on markdown headers', () => {
    const text = '# Section One\nContent one.\n# Section Two\nContent two.';
    const sections = splitIntoSections(text);
    expect(sections.length).toBe(2);
    expect(sections[0]).toContain('Section One');
    expect(sections[1]).toContain('Section Two');
  });

  it('splits on double newlines when no markdown headers', () => {
    const text = 'First paragraph here.\n\nSecond paragraph here.\n\nThird paragraph.';
    const sections = splitIntoSections(text);
    expect(sections.length).toBe(3);
  });

  it('splits on numbered section patterns', () => {
    const text = '1. Introduction\nSome intro text\n2. Requirements\nSome requirements';
    const sections = splitIntoSections(text);
    expect(sections.length).toBe(2);
  });

  it('returns single section for text without separators', () => {
    const text = 'A single block of text with no clear separators or headings.';
    const sections = splitIntoSections(text);
    expect(sections.length).toBe(1);
    expect(sections[0]).toBe(text);
  });

  it('filters out empty sections after splitting', () => {
    const text = '# Section One\n\n\n\n# Section Two';
    const sections = splitIntoSections(text);
    sections.forEach((s) => {
      expect(s.trim().length).toBeGreaterThan(0);
    });
  });

  it('prioritizes markdown headers over double newlines', () => {
    const text = '# Header One\nParagraph A.\n\nParagraph B.\n# Header Two\nParagraph C.';
    const sections = splitIntoSections(text);
    // Should split on headers, not double newlines
    expect(sections.length).toBe(2);
    expect(sections[0]).toContain('Header One');
    expect(sections[1]).toContain('Header Two');
  });
});

// ---------------------------------------------------------------------------
// detectDependencies
// ---------------------------------------------------------------------------

describe('detectDependencies', () => {
  it('returns empty array for empty text', () => {
    expect(detectDependencies('')).toEqual([]);
  });

  it('returns empty array for null/undefined text', () => {
    expect(detectDependencies(null as unknown as string)).toEqual([]);
  });

  it('detects "depends on" phrases', () => {
    const deps = detectDependencies('This feature depends on the auth module.');
    expect(deps.length).toBeGreaterThanOrEqual(1);
    expect(deps[0].toLowerCase()).toContain('auth module');
  });

  it('detects "requires" phrases', () => {
    const deps = detectDependencies('This requires a database connection.');
    expect(deps.length).toBeGreaterThanOrEqual(1);
  });

  it('detects "blocked by" phrases', () => {
    const deps = detectDependencies('This task is blocked by the API redesign.');
    expect(deps.length).toBeGreaterThanOrEqual(1);
  });

  it('detects "prerequisite:" phrases', () => {
    const deps = detectDependencies('Prerequisite: complete the migration.');
    expect(deps.length).toBeGreaterThanOrEqual(1);
  });

  it('detects "needs ... first" phrases', () => {
    const deps = detectDependencies('This needs the schema update first.');
    expect(deps.length).toBeGreaterThanOrEqual(1);
  });

  it('detects "after" phrases', () => {
    const deps = detectDependencies('Start this after the deployment is complete.');
    expect(deps.length).toBeGreaterThanOrEqual(1);
  });

  it('deduplicates identical dependencies', () => {
    const text = 'This depends on auth. It also depends on auth.';
    const deps = detectDependencies(text);
    const authDeps = deps.filter((d) => d.toLowerCase().includes('auth'));
    expect(authDeps.length).toBe(1);
  });

  it('returns empty array when no dependency phrases are present', () => {
    const deps = detectDependencies('The system validates user input and returns JSON.');
    expect(deps).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// convertToSpec
// ---------------------------------------------------------------------------

describe('convertToSpec', () => {
  it('returns empty result for empty input text', () => {
    const result = convertToSpec({ text: '' });
    expect(result.nodes).toHaveLength(0);
    expect(result.entities).toHaveLength(0);
    expect(result.warnings).toContain('Empty input provided.');
    expect(result.confidence).toBe(0);
  });

  it('returns empty result for null input', () => {
    const result = convertToSpec(null as unknown as { text: string });
    expect(result.nodes).toHaveLength(0);
    expect(result.confidence).toBe(0);
  });

  it('generates spec nodes from simple input', () => {
    const result = convertToSpec({ text: 'The system should handle login requests securely.' });
    expect(result.nodes.length).toBeGreaterThanOrEqual(1);
    expect(result.nodes[0].title.length).toBeGreaterThan(0);
    expect(result.nodes[0].description.length).toBeGreaterThan(0);
  });

  it('assigns generated IDs by default', () => {
    const result = convertToSpec({ text: 'Implement user authentication.' });
    expect(result.nodes[0].id).toBe('SPEC-001');
  });

  it('does not assign IDs when generateIds is false', () => {
    const result = convertToSpec(
      { text: 'Implement user authentication.' },
      { generateIds: false }
    );
    expect(result.nodes[0].id).toBe('');
  });

  it('infers spec type from text content', () => {
    const result = convertToSpec({ text: 'Implement the caching layer for the API.' });
    expect(result.nodes[0].type).toBe('task');
  });

  it('uses the explicitly provided format over inference', () => {
    const result = convertToSpec({
      text: 'Implement the caching layer.',
      format: 'epic',
    });
    expect(result.nodes[0].type).toBe('epic');
  });

  it('infers priority from text', () => {
    const result = convertToSpec({ text: 'This is a critical security fix.' });
    expect(result.nodes[0].priority).toBe('high');
  });

  it('uses medium priority when inferPriority is false', () => {
    const result = convertToSpec(
      { text: 'This is a critical security fix.' },
      { inferPriority: false }
    );
    expect(result.nodes[0].priority).toBe('medium');
  });

  it('extracts dependencies from text', () => {
    const result = convertToSpec({
      text: 'This feature depends on the auth service.',
    });
    expect(result.nodes[0].dependencies.length).toBeGreaterThanOrEqual(1);
  });

  it('does not extract dependencies when extractDependencies is false', () => {
    const result = convertToSpec(
      { text: 'This feature depends on the auth service.' },
      { extractDependencies: false }
    );
    expect(result.nodes[0].dependencies).toHaveLength(0);
  });

  it('includes context in entity extraction but not in section splitting', () => {
    const result = convertToSpec({
      text: 'Build a dashboard.',
      context: 'The admin manages all users. The system tracks analytics.',
    });
    // Entities should come from both text and context
    const adminEntity = result.entities.find((e) => e.name.includes('admin'));
    expect(adminEntity).toBeDefined();
    // But sections should only come from the text
    expect(result.nodes.length).toBe(1);
    expect(result.nodes[0].description).not.toContain('admin');
  });

  it('generates warnings for short input text', () => {
    const result = convertToSpec({ text: 'Fix bug.' });
    expect(result.warnings.some((w) => w.includes('very short'))).toBe(true);
  });

  it('generates warnings when no actors found', () => {
    const result = convertToSpec({ text: 'Process the data and store results.' });
    expect(result.warnings.some((w) => w.includes('No actors'))).toBe(true);
  });

  it('generates warnings when no action verbs detected', () => {
    const result = convertToSpec({ text: 'The system handles data.' });
    expect(result.warnings.some((w) => w.includes('No action verbs'))).toBe(true);
  });

  it('generates warnings when no acceptance criteria found', () => {
    const result = convertToSpec({ text: 'Build a data pipeline.' });
    expect(result.warnings.some((w) => w.includes('acceptance criteria'))).toBe(true);
  });

  it('detects vague language and warns', () => {
    const result = convertToSpec({ text: 'Maybe add some stuff and things.' });
    expect(result.warnings.some((w) => w.includes('Vague language'))).toBe(true);
  });

  it('computes confidence > 0 for text with entities and criteria', () => {
    const result = convertToSpec({
      text: 'As a user I want to log in.\n- User sees login form\n- User enters credentials\n- User clicks submit',
    });
    expect(result.confidence).toBeGreaterThan(0.3);
  });

  it('computes higher confidence for longer, richer text', () => {
    const shortResult = convertToSpec({ text: 'Fix bug.' });
    const richResult = convertToSpec({
      text:
        'As a developer, the user should be able to push code to the repository. ' +
        'The system must validate all commits. The API will reject unauthorized pushes. ' +
        '- All tests pass before merge\n- Code review is required\n- CI pipeline succeeds',
    });
    expect(richResult.confidence).toBeGreaterThan(shortResult.confidence);
  });

  it('creates multiple nodes from multi-section input', () => {
    const text = '# Login Feature\nUsers log in.\n\n# Registration Feature\nUsers register.';
    const result = convertToSpec({ text });
    expect(result.nodes.length).toBe(2);
  });

  it('extracts acceptance criteria into node fields', () => {
    const text = '- First criterion\n- Second criterion\n- Third criterion';
    const result = convertToSpec({ text });
    expect(result.nodes[0].acceptanceCriteria.length).toBe(3);
  });

  it('produces unique IDs across multiple nodes', () => {
    const text = '# Part A\nContent A.\n\n# Part B\nContent B.';
    const result = convertToSpec({ text });
    const ids = result.nodes.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
