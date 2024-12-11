import {
  generateContextQuestionsForEpic,
  generateContextQuestionsForFeature,
  generateContextQuestionsForUserStory,
  generateContextQuestionsForTask,
  generateAdditionalEpicsPrompt,
  generateAdditionalFeaturesPrompt,
  generateAdditionalUserStoriesPrompt,
  epicPrompt,
  featurePrompt,
  userStoryPrompt,
  taskPrompt,
  generateContextQuestionsForGlobalRefinement,
  generateExplanationForGlobalRefinement,
  generateAdditionalTasksPrompt,
} from '../constants/prompts';
import { RootState } from '../../../../lib/store';
import {
  EpicType,
  FeatureType,
  TaskType,
  UserStoryType,
} from '../types/work-items';
import { makeProxyCall } from './openai-proxy-helper';

export const generateAdditionalFeatures = async ({
  epic,
  state,
  selectedModel,
  context,
}: {
  chatApi?: string; // kept for backward compatibility
  epic: EpicType;
  state: RootState;
  selectedModel: string;
  context?: string;
}) => {
  return makeProxyCall({
    systemPrompt:
      'You are an AI model trained to generate additional features and user stories for software development projects.',
    userPrompt: context
      ? context
      : generateAdditionalFeaturesPrompt(epic, state),
    selectedModel,
    errorContext: 'generate additional features',
  });
};

export const generateAdditionalEpics = async ({
  state,
  selectedModel,
}: {
  chatApi?: string;
  state: RootState;
  selectedModel: string;
}) => {
  return makeProxyCall({
    systemPrompt:
      'You are an AI model trained to generate additional epics for software development projects.',
    userPrompt: generateAdditionalEpicsPrompt({ state }),
    selectedModel,
    errorContext: 'generate additional epics',
  });
};

export const generateUserStories = async ({
  feature,
  state,
  selectedModel,
  context,
}: {
  chatApi?: string;
  feature: FeatureType;
  state: RootState;
  selectedModel: string;
  context?: string;
}) => {
  return makeProxyCall({
    systemPrompt:
      'You are an AI model trained to generate additional features and user stories for software development projects.',
    userPrompt: context
      ? context
      : generateAdditionalUserStoriesPrompt(feature, state),
    selectedModel,
    errorContext: 'generate user stories',
  });
};

export const askQuestion = async ({
  question,
  selectedModel,
}: {
  chatApi?: string;
  question: string;
  selectedModel: string;
}) => {
  return makeProxyCall({
    systemPrompt: 'You are an AI model trained to generate information.',
    userPrompt: question,
    selectedModel,
    errorContext: 'answer question',
  });
};

export const generateTasks = async ({
  userStory,
  state,
  selectedModel,
}: {
  chatApi?: string;
  userStory: UserStoryType;
  state: RootState;
  selectedModel: string;
}) => {
  return makeProxyCall({
    systemPrompt:
      'You are an AI model trained to generate tasks for software development projects.',
    userPrompt: generateAdditionalTasksPrompt(userStory, state),
    selectedModel,
    errorContext: 'generate tasks',
  });
};

export const generateQuestionsForEpic = async ({
  epic,
  selectedModel,
}: {
  chatApi?: string;
  epic: EpicType;
  selectedModel: string;
}) => {
  return makeProxyCall({
    systemPrompt:
      'You are an AI trained to generate contextual questions for software development projects.',
    userPrompt: generateContextQuestionsForEpic(epic),
    selectedModel,
    errorContext: 'generate epic questions',
  });
};

export const generateQuestionsForFeature = async ({
  feature,
  selectedModel,
}: {
  chatApi?: string;
  feature: FeatureType;
  selectedModel: string;
}) => {
  return makeProxyCall({
    systemPrompt:
      'You are an AI trained to generate contextual questions for software development projects.',
    userPrompt: generateContextQuestionsForFeature(feature),
    selectedModel,
    errorContext: 'generate feature questions',
  });
};

export const generateQuestionsForUserStory = async ({
  userStory,
  selectedModel,
}: {
  chatApi?: string;
  userStory: UserStoryType;
  selectedModel: string;
}) => {
  return makeProxyCall({
    systemPrompt:
      'You are an AI trained to generate contextual questions for software development projects.',
    userPrompt: generateContextQuestionsForUserStory(userStory),
    selectedModel,
    errorContext: 'generate user story questions',
  });
};

export const generateQuestionsForTask = async ({
  task,
  selectedModel,
}: {
  chatApi?: string;
  task: TaskType;
  selectedModel: string;
}) => {
  return makeProxyCall({
    systemPrompt:
      'You are an AI trained to generate contextual questions for software development projects.',
    userPrompt: generateContextQuestionsForTask(task),
    selectedModel,
    errorContext: 'generate task questions',
  });
};

export const generateFollowUpQuestions = async ({
  context,
  selectedModel,
}: {
  chatApi?: string;
  context: string;
  selectedModel: string;
}) => {
  return makeProxyCall({
    systemPrompt:
      'You are an AI trained to generate follow-up questions based on given context and answers.',
    userPrompt: context,
    selectedModel,
    errorContext: 'generate follow-up questions',
  });
};

export const generateUpdatedEpic = async ({
  requirements,
  selectedModel,
  context,
}: {
  chatApi?: string;
  requirements: string;
  selectedModel: string;
  context?: string;
}) => {
  return makeProxyCall({
    systemPrompt:
      'You are an AI trained to generate updated epics based on given context and answers.',
    userPrompt: epicPrompt(requirements, context),
    selectedModel,
    errorContext: 'generate updated epic',
  });
};

export const generateUpdatedFeature = async ({
  epic,
  state,
  selectedModel,
  context,
}: {
  chatApi?: string;
  epic: EpicType;
  state: RootState;
  selectedModel: string;
  context?: string;
}) => {
  return makeProxyCall({
    systemPrompt:
      'You are an AI trained to generate updated features based on given context and answers.',
    userPrompt: featurePrompt(epic, state, context),
    selectedModel,
    errorContext: 'generate updated feature',
  });
};

export const generateUpdatedUserStory = async ({
  feature,
  state,
  selectedModel,
  context,
}: {
  chatApi?: string;
  feature: FeatureType;
  state: RootState;
  selectedModel: string;
  context?: string;
}) => {
  return makeProxyCall({
    systemPrompt:
      'You are an AI trained to generate updated user stories based on given context and answers.',
    userPrompt: userStoryPrompt(feature, state, context),
    selectedModel,
    errorContext: 'generate updated user story',
  });
};

export const generateUpdatedTask = async ({
  userStory,
  state,
  context,
  selectedModel,
}: {
  chatApi?: string;
  userStory: UserStoryType;
  state: RootState;
  context: string;
  selectedModel: string;
}) => {
  return makeProxyCall({
    systemPrompt:
      'You are an AI trained to generate updated tasks based on given context and answers.',
    userPrompt: taskPrompt(userStory, state, context),
    selectedModel,
    errorContext: 'generate updated task',
  });
};

export const generateQuestionsForGlobalRefinement = async ({
  globalInformation,
  selectedModel,
}: {
  chatApi?: string;
  globalInformation: string;
  selectedModel: string;
}) => {
  return makeProxyCall({
    systemPrompt:
      'You are an AI trained to generate contextual questions for software development projects.',
    userPrompt: generateContextQuestionsForGlobalRefinement(globalInformation),
    selectedModel,
    errorContext: 'generate global refinement questions',
  });
};

export const generateUpdatedExplanationForGlobalRefinement = async ({
  globalInformation,
  context,
  selectedModel,
}: {
  chatApi?: string;
  globalInformation: string;
  context: string;
  selectedModel: string;
}) => {
  const response = await makeProxyCall({
    systemPrompt:
      'You are an AI trained to generate contextual questions for software development projects.',
    userPrompt: generateExplanationForGlobalRefinement(
      globalInformation,
      context
    ),
    selectedModel,
    errorContext: 'generate updated global refinement explanation',
  });

  const responseText = response.data.choices[0].message.content;
  const startIndex = responseText.indexOf('=+=') + 3;
  const endIndex = responseText.lastIndexOf('=+=');
  return responseText.substring(startIndex, endIndex).trim();
};
