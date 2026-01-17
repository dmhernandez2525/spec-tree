/**
 * Test Fixtures for Work Items
 *
 * Factory functions for creating mock data in tests
 */

import { faker } from '@faker-js/faker';

// Type definitions for mock data
export interface MockApp {
  id: number;
  documentId: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockEpic {
  id: number;
  documentId: string;
  title: string;
  description: string;
  goal: string;
  successCriteria: string;
  dependencies: string;
  timeline: string;
  resources: string;
  risksAndMitigation: Array<{ risk: string; mitigation: string }>;
  notes: string;
  position: number;
  parentAppId?: string;
  featureIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MockFeature {
  id: number;
  documentId: string;
  title: string;
  description: string;
  details: string;
  dependencies: string;
  acceptanceCriteria: Array<{ text: string }>;
  priority: string;
  effort: string;
  notes: string;
  position: number;
  parentEpicId?: string;
  userStoryIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MockUserStory {
  id: number;
  documentId: string;
  title: string;
  role: string;
  action: string;
  goal: string;
  points: string;
  acceptanceCriteria: Array<{ text: string }>;
  notes: string;
  developmentOrder: number;
  position: number;
  parentFeatureId?: string;
  taskIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MockTask {
  id: number;
  documentId: string;
  title: string;
  details: string;
  priority: number;
  notes: string;
  position: number;
  parentUserStoryId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create a mock App
 */
export const createMockApp = (overrides: Partial<MockApp> = {}): MockApp => ({
  id: faker.number.int({ min: 1, max: 10000 }),
  documentId: faker.string.uuid(),
  name: faker.company.name() + ' App',
  description: faker.lorem.paragraph(),
  createdAt: faker.date.past().toISOString(),
  updatedAt: faker.date.recent().toISOString(),
  ...overrides,
});

/**
 * Create a mock Epic
 */
export const createMockEpic = (overrides: Partial<MockEpic> = {}): MockEpic => ({
  id: faker.number.int({ min: 1, max: 10000 }),
  documentId: faker.string.uuid(),
  title: faker.lorem.sentence({ min: 3, max: 6 }),
  description: faker.lorem.paragraph(),
  goal: faker.lorem.sentence(),
  successCriteria: faker.lorem.paragraph(),
  dependencies: faker.lorem.sentence(),
  timeline: faker.helpers.arrayElement(['1-2 weeks', '2-4 weeks', '1-2 months', '3-6 months']),
  resources: faker.lorem.sentence(),
  risksAndMitigation: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => ({
    risk: faker.lorem.sentence(),
    mitigation: faker.lorem.sentence(),
  })),
  notes: faker.lorem.paragraph(),
  position: faker.number.int({ min: 0, max: 100 }),
  featureIds: [],
  createdAt: faker.date.past().toISOString(),
  updatedAt: faker.date.recent().toISOString(),
  ...overrides,
});

/**
 * Create a mock Feature
 */
export const createMockFeature = (overrides: Partial<MockFeature> = {}): MockFeature => ({
  id: faker.number.int({ min: 1, max: 10000 }),
  documentId: faker.string.uuid(),
  title: faker.lorem.sentence({ min: 3, max: 6 }),
  description: faker.lorem.paragraph(),
  details: faker.lorem.paragraphs(2),
  dependencies: faker.lorem.sentence(),
  acceptanceCriteria: Array.from({ length: faker.number.int({ min: 2, max: 5 }) }, () => ({
    text: faker.lorem.sentence(),
  })),
  priority: faker.helpers.arrayElement(['Low', 'Medium', 'High', 'Critical']),
  effort: faker.helpers.arrayElement(['XS', 'S', 'M', 'L', 'XL']),
  notes: faker.lorem.paragraph(),
  position: faker.number.int({ min: 0, max: 100 }),
  userStoryIds: [],
  createdAt: faker.date.past().toISOString(),
  updatedAt: faker.date.recent().toISOString(),
  ...overrides,
});

/**
 * Create a mock User Story
 */
export const createMockUserStory = (overrides: Partial<MockUserStory> = {}): MockUserStory => ({
  id: faker.number.int({ min: 1, max: 10000 }),
  documentId: faker.string.uuid(),
  title: faker.lorem.sentence({ min: 3, max: 6 }),
  role: faker.helpers.arrayElement(['user', 'admin', 'developer', 'manager', 'customer']),
  action: faker.lorem.sentence(),
  goal: faker.lorem.sentence(),
  points: faker.helpers.arrayElement(['1', '2', '3', '5', '8', '13']),
  acceptanceCriteria: Array.from({ length: faker.number.int({ min: 2, max: 5 }) }, () => ({
    text: faker.lorem.sentence(),
  })),
  notes: faker.lorem.paragraph(),
  developmentOrder: faker.number.int({ min: 1, max: 10 }),
  position: faker.number.int({ min: 0, max: 100 }),
  taskIds: [],
  createdAt: faker.date.past().toISOString(),
  updatedAt: faker.date.recent().toISOString(),
  ...overrides,
});

/**
 * Create a mock Task
 */
export const createMockTask = (overrides: Partial<MockTask> = {}): MockTask => ({
  id: faker.number.int({ min: 1, max: 10000 }),
  documentId: faker.string.uuid(),
  title: faker.lorem.sentence({ min: 3, max: 6 }),
  details: faker.lorem.paragraph(),
  priority: faker.number.int({ min: 1, max: 5 }),
  notes: faker.lorem.paragraph(),
  position: faker.number.int({ min: 0, max: 100 }),
  createdAt: faker.date.past().toISOString(),
  updatedAt: faker.date.recent().toISOString(),
  ...overrides,
});

/**
 * Create a full mock hierarchy (App -> Epic -> Feature -> User Story -> Task)
 * Creates objects leaf-first to avoid mutations after creation
 */
export const createMockHierarchy = () => {
  // Create IDs upfront
  const appId = faker.string.uuid();
  const epicId = faker.string.uuid();
  const featureId = faker.string.uuid();
  const userStoryId = faker.string.uuid();
  const taskId = faker.string.uuid();

  // Create from leaf to root, passing child IDs upfront
  const task = createMockTask({
    documentId: taskId,
    parentUserStoryId: userStoryId,
  });

  const userStory = createMockUserStory({
    documentId: userStoryId,
    parentFeatureId: featureId,
    taskIds: [taskId],
  });

  const feature = createMockFeature({
    documentId: featureId,
    parentEpicId: epicId,
    userStoryIds: [userStoryId],
  });

  const epic = createMockEpic({
    documentId: epicId,
    parentAppId: appId,
    featureIds: [featureId],
  });

  const app = createMockApp({
    documentId: appId,
  });

  return { app, epic, feature, userStory, task };
};

/**
 * Create multiple items of a specific type
 */
export const createMockItems = <T>(
  factory: (overrides?: Partial<T>) => T,
  count: number,
  overrides: Partial<T> = {}
): T[] => {
  return Array.from({ length: count }, () => factory(overrides));
};
