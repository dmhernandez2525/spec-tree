/**
 * Strapi Data Transformers
 * Type-safe utilities for transforming Strapi API responses to Redux state
 */

import type {
  EpicType,
  FeatureType,
  UserStoryType,
  TaskType,
  ContextualQuestion,
} from '@/components/spec-tree/lib/types/work-items';
import type {
  StrapiEpic,
  StrapiFeature,
  StrapiUserStory,
  StrapiTask,
  StrapiApp,
  StrapiContextualQuestion,
  TransformedSowData,
} from '@/types/strapi';

/**
 * Transform Strapi contextual questions to Redux format
 */
function transformContextualQuestions(
  questions?: StrapiContextualQuestion[]
): ContextualQuestion[] {
  return (
    questions?.map((q) => ({
      id: q.documentId,
      question: q.question,
      answer: q.answer,
    })) || []
  );
}

/**
 * Transform a single Strapi epic to Redux EpicType
 */
export function transformEpic(epic: StrapiEpic): EpicType {
  return {
    id: epic.documentId,
    documentId: epic.documentId,
    title: epic.title || '',
    description: epic.description || '',
    goal: epic.goal || '',
    successCriteria: epic.successCriteria || '',
    dependencies: epic.dependencies || '',
    timeline: epic.timeline || '',
    resources: epic.resources || '',
    risksAndMitigation: epic.risksAndMitigation || [],
    featureIds: epic.features?.map((f) => f.documentId) || [],
    notes: epic.notes || '',
    parentAppId: '',
    contextualQuestions: transformContextualQuestions(epic.contextualQuestions),
  };
}

/**
 * Transform a single Strapi feature to Redux FeatureType
 */
export function transformFeature(
  feature: StrapiFeature,
  parentEpicId: string
): FeatureType {
  return {
    id: feature.documentId,
    documentId: feature.documentId,
    title: feature.title || '',
    description: feature.description || '',
    details: feature.details || '',
    dependencies: feature.dependencies || '',
    acceptanceCriteria: feature.acceptanceCriteria || [{ text: '' }],
    parentEpicId,
    userStoryIds: feature.userStories?.map((us) => us.documentId) || [],
    notes: feature.notes || '',
    priority: feature.priority || '',
    effort: feature.effort || '',
    contextualQuestions: transformContextualQuestions(feature.contextualQuestions),
  };
}

/**
 * Transform a single Strapi user story to Redux UserStoryType
 */
export function transformUserStory(
  story: StrapiUserStory,
  parentFeatureId: string
): UserStoryType {
  return {
    id: story.documentId,
    documentId: story.documentId,
    title: story.title || '',
    role: story.role || '',
    action: story.action || '',
    goal: story.goal || '',
    points: story.points || '',
    acceptanceCriteria: story.acceptanceCriteria || [{ text: '' }],
    notes: story.notes || '',
    parentFeatureId,
    taskIds: story.tasks?.map((t) => t.documentId) || [],
    developmentOrder: story.developmentOrder || 0,
    contextualQuestions: transformContextualQuestions(story.contextualQuestions),
  };
}

/**
 * Transform a single Strapi task to Redux TaskType
 */
export function transformTask(
  task: StrapiTask,
  parentUserStoryId: string
): TaskType {
  return {
    id: task.documentId,
    documentId: task.documentId,
    title: task.title || '',
    details: task.details || '',
    priority: task.priority || 0,
    notes: task.notes || '',
    parentUserStoryId,
    dependentTaskIds: [],
    contextualQuestions: transformContextualQuestions(task.contextualQuestions),
  };
}

/**
 * Transform complete Strapi app data to Redux SOW state
 */
export function transformStrapiDataToSow(
  documentId: string,
  data: StrapiApp
): TransformedSowData {
  const epics: Record<string, EpicType> = {};
  const features: Record<string, FeatureType> = {};
  const userStories: Record<string, UserStoryType> = {};
  const tasks: Record<string, TaskType> = {};

  // Process all epics and their nested data
  for (const epic of data.epics || []) {
    epics[epic.documentId] = transformEpic(epic);

    // Process features within this epic
    if (epic.features) {
      for (const feature of epic.features) {
        features[feature.documentId] = transformFeature(
          feature,
          epic.documentId
        );

        // Process user stories within this feature
        if (feature.userStories) {
          for (const story of feature.userStories) {
            userStories[story.documentId] = transformUserStory(
              story,
              feature.documentId
            );

            // Process tasks within this user story
            if (story.tasks) {
              for (const task of story.tasks) {
                tasks[task.documentId] = transformTask(task, story.documentId);
              }
            }
          }
        }
      }
    }
  }

  return {
    id: documentId,
    epics,
    features,
    userStories,
    tasks,
    contextualQuestions: transformContextualQuestions(data.contextualQuestions),
    globalInformation: data.globalInformation || '',
  };
}
