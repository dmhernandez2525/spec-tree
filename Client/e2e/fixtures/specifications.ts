import type {
  EpicType,
  FeatureType,
  UserStoryType,
  TaskType,
  RiskMitigationType,
} from '../../components/spec-tree/lib/types/work-items';

let specCounter = 0;

function nextId(prefix: string): string {
  specCounter += 1;
  return `${prefix}-${specCounter}-${Math.random().toString(36).slice(2, 8)}`;
}

// ---------------------------------------------------------------------------
// Epic
// ---------------------------------------------------------------------------

const defaultRiskMitigation: RiskMitigationType = {
  resolve: [{ text: 'Address root cause immediately' }],
  own: [{ text: 'Assign dedicated owner' }],
  accept: [{ text: 'Accept and monitor' }],
  mitigate: [{ text: 'Add fallback strategy' }],
};

export function createTestEpic(overrides: Partial<EpicType> = {}): EpicType {
  const id = nextId('epic');
  const index = specCounter;

  return {
    id,
    title: `Epic ${index}: Core Platform`,
    description: `Description for test epic ${index}`,
    goal: `Deliver core platform functionality for epic ${index}`,
    successCriteria: 'All features implemented and passing tests',
    dependencies: 'None',
    timeline: '4 weeks',
    resources: '2 developers, 1 designer',
    risksAndMitigation: [defaultRiskMitigation],
    featureIds: [],
    parentAppId: 'app-1',
    notes: `Notes for epic ${index}`,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Feature
// ---------------------------------------------------------------------------

export function createTestFeature(
  overrides: Partial<FeatureType> = {},
): FeatureType {
  const id = nextId('feature');
  const index = specCounter;

  return {
    id,
    title: `Feature ${index}: User Dashboard`,
    description: `Description for test feature ${index}`,
    details: `Implementation details for feature ${index}`,
    dependencies: 'None',
    acceptanceCriteria: [
      { text: 'Dashboard loads within 2 seconds' },
      { text: 'All widgets render correctly' },
    ],
    parentEpicId: 'epic-1',
    userStoryIds: [],
    notes: `Notes for feature ${index}`,
    priority: 'high',
    effort: 'medium',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// User Story
// ---------------------------------------------------------------------------

export function createTestUserStory(
  overrides: Partial<UserStoryType> = {},
): UserStoryType {
  const id = nextId('story');
  const index = specCounter;

  return {
    id,
    title: `Story ${index}: View analytics`,
    role: 'project manager',
    action: 'view the analytics dashboard',
    goal: 'track project progress and team velocity',
    points: '5',
    acceptanceCriteria: [
      { text: 'Analytics data refreshes in real time' },
      { text: 'Charts are accessible via keyboard navigation' },
    ],
    notes: `Notes for user story ${index}`,
    parentFeatureId: 'feature-1',
    taskIds: [],
    developmentOrder: index,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Task
// ---------------------------------------------------------------------------

export function createTestTask(overrides: Partial<TaskType> = {}): TaskType {
  const id = nextId('task');
  const index = specCounter;

  return {
    id,
    title: `Task ${index}: Implement API endpoint`,
    details: `Detailed implementation plan for task ${index}`,
    priority: Math.min(index, 5),
    notes: `Notes for task ${index}`,
    parentUserStoryId: 'story-1',
    dependentTaskIds: [],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Full hierarchy helper
// ---------------------------------------------------------------------------

export interface SpecHierarchy {
  epic: EpicType;
  feature: FeatureType;
  userStory: UserStoryType;
  task: TaskType;
}

/**
 * Creates a complete epic > feature > user story > task chain with
 * all parent/child IDs linked correctly.
 */
export function createSpecHierarchy(): SpecHierarchy {
  const epic = createTestEpic();
  const feature = createTestFeature({ parentEpicId: epic.id });
  const userStory = createTestUserStory({ parentFeatureId: feature.id });
  const task = createTestTask({ parentUserStoryId: userStory.id });

  // Wire up child ID arrays
  epic.featureIds = [feature.id];
  feature.userStoryIds = [userStory.id];
  userStory.taskIds = [task.id];

  return { epic, feature, userStory, task };
}

/** Reset the internal counter (useful between test files). */
export function resetSpecCounter(): void {
  specCounter = 0;
}
