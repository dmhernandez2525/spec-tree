import { RootState } from '@/lib/store';
import {
  selectEpicById,
  selectFeatureById,
  selectUserStoryById,
} from '@/lib/store/sow-slice';
import {
  EpicType,
  FeatureType,
  UserStoryType,
  TaskType,
  ContextualQuestion,
} from '../types/work-items';

/**
 * Format contextual Q&A pairs into a string
 */
function formatContextualQuestions(
  questions: ContextualQuestion[] | undefined,
  prefix: string = ''
): string {
  if (!questions || questions.length === 0) return '';

  const formatted = questions
    .filter((q) => q.answer)
    .map((q) => `Q: ${q.question}\nA: ${q.answer}`)
    .join('\n\n');

  return formatted ? `${prefix}${formatted}\n` : '';
}

/**
 * Build context for an Epic
 * Includes: Global information, Epic's own contextual Q&A
 */
export function buildEpicContext(
  epic: EpicType,
  state: RootState
): string {
  const globalInfo = state.sow.globalInformation;
  const parts: string[] = [];

  if (globalInfo) {
    parts.push(`=== Application Context ===\n${globalInfo}`);
  }

  const epicQuestions = formatContextualQuestions(
    epic.contextualQuestions,
    '=== Epic Contextual Information ===\n'
  );
  if (epicQuestions) {
    parts.push(epicQuestions);
  }

  return parts.join('\n\n');
}

/**
 * Build context for a Feature
 * Includes: Global information, Parent Epic's info and Q&A, Feature's own Q&A
 */
export function buildFeatureContext(
  feature: FeatureType,
  state: RootState
): string {
  const globalInfo = state.sow.globalInformation;
  const parts: string[] = [];

  if (globalInfo) {
    parts.push(`=== Application Context ===\n${globalInfo}`);
  }

  // Get parent epic context
  const parentEpic = selectEpicById(state, feature.parentEpicId);
  if (parentEpic) {
    parts.push(
      `=== Parent Epic: ${parentEpic.title} ===\n` +
        `Description: ${parentEpic.description}\n` +
        `Goal: ${parentEpic.goal}`
    );

    const epicQuestions = formatContextualQuestions(
      parentEpic.contextualQuestions,
      '=== Epic Contextual Information ===\n'
    );
    if (epicQuestions) {
      parts.push(epicQuestions);
    }
  }

  // Add feature's own contextual Q&A
  const featureQuestions = formatContextualQuestions(
    feature.contextualQuestions,
    '=== Feature Contextual Information ===\n'
  );
  if (featureQuestions) {
    parts.push(featureQuestions);
  }

  return parts.join('\n\n');
}

/**
 * Build context for a User Story
 * Includes: Global info, Epic info and Q&A, Feature info and Q&A, User Story's own Q&A
 */
export function buildUserStoryContext(
  userStory: UserStoryType,
  state: RootState
): string {
  const globalInfo = state.sow.globalInformation;
  const parts: string[] = [];

  if (globalInfo) {
    parts.push(`=== Application Context ===\n${globalInfo}`);
  }

  // Get parent feature
  const parentFeature = selectFeatureById(state, userStory.parentFeatureId);
  if (parentFeature) {
    // Get grandparent epic
    const parentEpic = selectEpicById(state, parentFeature.parentEpicId);
    if (parentEpic) {
      parts.push(
        `=== Epic: ${parentEpic.title} ===\n` +
          `Description: ${parentEpic.description}\n` +
          `Goal: ${parentEpic.goal}`
      );

      const epicQuestions = formatContextualQuestions(
        parentEpic.contextualQuestions,
        '=== Epic Contextual Information ===\n'
      );
      if (epicQuestions) {
        parts.push(epicQuestions);
      }
    }

    parts.push(
      `=== Feature: ${parentFeature.title} ===\n` +
        `Description: ${parentFeature.description}\n` +
        `Details: ${parentFeature.details}`
    );

    const featureQuestions = formatContextualQuestions(
      parentFeature.contextualQuestions,
      '=== Feature Contextual Information ===\n'
    );
    if (featureQuestions) {
      parts.push(featureQuestions);
    }
  }

  // Add user story's own contextual Q&A
  const storyQuestions = formatContextualQuestions(
    userStory.contextualQuestions,
    '=== User Story Contextual Information ===\n'
  );
  if (storyQuestions) {
    parts.push(storyQuestions);
  }

  return parts.join('\n\n');
}

/**
 * Build context for a Task
 * Includes: Global info, Epic, Feature, User Story info and all Q&A
 */
export function buildTaskContext(
  task: TaskType,
  state: RootState
): string {
  const globalInfo = state.sow.globalInformation;
  const parts: string[] = [];

  if (globalInfo) {
    parts.push(`=== Application Context ===\n${globalInfo}`);
  }

  // Get parent user story
  const parentUserStory = selectUserStoryById(state, task.parentUserStoryId);
  if (parentUserStory) {
    // Get parent feature
    const parentFeature = selectFeatureById(state, parentUserStory.parentFeatureId);
    if (parentFeature) {
      // Get grandparent epic
      const parentEpic = selectEpicById(state, parentFeature.parentEpicId);
      if (parentEpic) {
        parts.push(
          `=== Epic: ${parentEpic.title} ===\n` +
            `Description: ${parentEpic.description}\n` +
            `Goal: ${parentEpic.goal}`
        );

        const epicQuestions = formatContextualQuestions(
          parentEpic.contextualQuestions,
          '=== Epic Contextual Information ===\n'
        );
        if (epicQuestions) {
          parts.push(epicQuestions);
        }
      }

      parts.push(
        `=== Feature: ${parentFeature.title} ===\n` +
          `Description: ${parentFeature.description}\n` +
          `Details: ${parentFeature.details}`
      );

      const featureQuestions = formatContextualQuestions(
        parentFeature.contextualQuestions,
        '=== Feature Contextual Information ===\n'
      );
      if (featureQuestions) {
        parts.push(featureQuestions);
      }
    }

    parts.push(
      `=== User Story: ${parentUserStory.title} ===\n` +
        `Role: ${parentUserStory.role}\n` +
        `Action: ${parentUserStory.action}\n` +
        `Goal: ${parentUserStory.goal}`
    );

    const storyQuestions = formatContextualQuestions(
      parentUserStory.contextualQuestions,
      '=== User Story Contextual Information ===\n'
    );
    if (storyQuestions) {
      parts.push(storyQuestions);
    }
  }

  // Add task's own contextual Q&A
  const taskQuestions = formatContextualQuestions(
    task.contextualQuestions,
    '=== Task Contextual Information ===\n'
  );
  if (taskQuestions) {
    parts.push(taskQuestions);
  }

  return parts.join('\n\n');
}

/**
 * Get the full context chain for any work item type
 */
export function getContextChain(
  item: EpicType | FeatureType | UserStoryType | TaskType,
  itemType: 'epic' | 'feature' | 'userStory' | 'task',
  state: RootState
): string {
  switch (itemType) {
    case 'epic':
      return buildEpicContext(item as EpicType, state);
    case 'feature':
      return buildFeatureContext(item as FeatureType, state);
    case 'userStory':
      return buildUserStoryContext(item as UserStoryType, state);
    case 'task':
      return buildTaskContext(item as TaskType, state);
    default:
      return '';
  }
}

/**
 * Build a context summary for display in the UI
 */
export function buildContextSummary(
  item: EpicType | FeatureType | UserStoryType | TaskType,
  itemType: 'epic' | 'feature' | 'userStory' | 'task',
  state: RootState
): {
  globalContext: boolean;
  epicContext?: { title: string; hasQuestions: boolean };
  featureContext?: { title: string; hasQuestions: boolean };
  userStoryContext?: { title: string; hasQuestions: boolean };
  itemQuestions: boolean;
} {
  const summary: ReturnType<typeof buildContextSummary> = {
    globalContext: !!state.sow.globalInformation,
    itemQuestions: !!item.contextualQuestions?.some((q) => q.answer),
  };

  if (itemType === 'feature' || itemType === 'userStory' || itemType === 'task') {
    const feature =
      itemType === 'feature'
        ? (item as FeatureType)
        : itemType === 'userStory'
          ? selectFeatureById(state, (item as UserStoryType).parentFeatureId)
          : selectFeatureById(
              state,
              selectUserStoryById(state, (item as TaskType).parentUserStoryId)?.parentFeatureId || ''
            );

    if (feature) {
      const epic = selectEpicById(state, feature.parentEpicId);
      if (epic) {
        summary.epicContext = {
          title: epic.title,
          hasQuestions: !!epic.contextualQuestions?.some((q) => q.answer),
        };
      }

      if (itemType !== 'feature') {
        summary.featureContext = {
          title: feature.title,
          hasQuestions: !!feature.contextualQuestions?.some((q) => q.answer),
        };
      }
    }
  }

  if (itemType === 'task') {
    const userStory = selectUserStoryById(state, (item as TaskType).parentUserStoryId);
    if (userStory) {
      summary.userStoryContext = {
        title: userStory.title,
        hasQuestions: !!userStory.contextualQuestions?.some((q) => q.answer),
      };
    }
  }

  return summary;
}
