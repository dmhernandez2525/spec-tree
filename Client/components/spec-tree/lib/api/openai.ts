import axios, { AxiosInstance } from 'axios';
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

interface OpenAIRequest {
  model: string;
  messages: Array<{ role: 'system' | 'user'; content: string }>;
  max_tokens: number;
  temperature: number;
}

const openaiCall = ({ chatApi }: { chatApi: string }): AxiosInstance => {
  // TODO: use chatApi then remove console.log
  console.log(chatApi);
  return axios.create({
    baseURL: 'https://api.openai.com/v1',
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });
};

// TODO: we should validate the response and format it so that we can add a return type and validate the types
export const generateAdditionalFeatures = ({
  chatApi,
  epic,
  state,
  selectedModel,
  context,
}: {
  chatApi: string;
  epic: EpicType;
  state: RootState;
  selectedModel: string;
  context?: string;
}) => {
  // TODO: use selectedModel then remove console.log
  console.log(selectedModel);
  const messages: OpenAIRequest['messages'] = [
    {
      role: 'system',
      content:
        'You are an AI model trained to generate additional features and user stories for software development projects.',
    },
    {
      role: 'user',
      content: context
        ? context
        : generateAdditionalFeaturesPrompt(epic, state),
    },
  ];
  const openai = openaiCall({ chatApi });
  return openai.post('/chat/completions', {
    model: 'gpt-3.5-turbo-16k',
    // model: selectedModel,
    messages,
    // TODO-p2: make this dynamic based on the modle
    max_tokens: 10000,
    // max_tokens: selectedModel === 'gpt-3.5-turbo-16k' ? 10000 : 4096,

    temperature: 0.5,
  });
};

export const generateAdditionalEpics = ({
  chatApi,
  state,
  selectedModel,
}: {
  chatApi: string;
  state: RootState;
  selectedModel: string;
}) => {
  // TODO: use selectedModel then remove console.log
  console.log(selectedModel);
  const messages: OpenAIRequest['messages'] = [
    {
      role: 'system',
      content:
        'You are an AI model trained to generate additional epics for software development projects.',
    },
    {
      role: 'user',
      content: generateAdditionalEpicsPrompt({ state }),
    },
  ];
  const openai = openaiCall({ chatApi });
  return openai.post('/chat/completions', {
    model: 'gpt-3.5-turbo-16k',
    // model: selectedModel,
    messages,
    // TODO-p2: make this dynamic based on the modle
    max_tokens: 10000,
    // max_tokens: selectedModel === 'gpt-3.5-turbo-16k' ? 10000 : 4096,

    temperature: 0.5,
  });
};

export const generateUserStories = ({
  chatApi,
  feature,
  state,
  selectedModel,
  context,
}: {
  chatApi: string;
  feature: FeatureType;
  state: RootState;
  selectedModel: string;
  context?: string;
}) => {
  // TODO: use selectedModel then remove console.log
  console.log(selectedModel);
  const messages: OpenAIRequest['messages'] = [
    {
      role: 'system',
      content:
        'You are an AI model trained to generate additional features and user stories for software development projects.',
    },
    {
      role: 'user',
      content: context
        ? context
        : generateAdditionalUserStoriesPrompt(feature, state),
    },
  ];
  const openai = openaiCall({ chatApi });
  return openai.post('/chat/completions', {
    model: 'gpt-3.5-turbo-16k',
    // model: selectedModel,
    messages,
    // TODO-p2: make this dynamic based on the modle
    max_tokens: 10000,
    // max_tokens: selectedModel === 'gpt-3.5-turbo-16k' ? 10000 : 4096,

    temperature: 0.5,
  });
};

export const askQuestion = ({
  chatApi,
  question,
  selectedModel,
}: {
  chatApi: string;
  question: string;
  selectedModel: string;
}) => {
  const messages: OpenAIRequest['messages'] = [
    {
      role: 'system',
      content: 'You are an AI model trained to generate information.',
    },
    {
      role: 'user',
      content: question,
    },
  ];
  const openai = openaiCall({ chatApi });
  return openai.post('/chat/completions', {
    model: selectedModel,
    messages,
    // TODO-p2: make this dynamic based on the modle
    max_tokens: selectedModel === 'gpt-3.5-turbo-16k' ? 10000 : 4096,
    temperature: 0.5,
  });
};

export const generateTasks = ({
  chatApi,
  userStory,
  state,
  selectedModel,
}: {
  chatApi: string;
  userStory: UserStoryType;
  state: RootState;
  selectedModel: string;
}) => {
  // TODO: use selectedModel then remove console.log
  console.log(selectedModel);
  const messages: OpenAIRequest['messages'] = [
    {
      role: 'system',
      content:
        'You are an AI model trained to generate tasks for software development projects.',
    },
    {
      role: 'user',
      content: generateAdditionalTasksPrompt(userStory, state),
    },
  ];
  const openai = openaiCall({ chatApi });
  return openai.post('/chat/completions', {
    model: 'gpt-3.5-turbo-16k',
    // model: selectedModel,
    messages,
    // TODO-p2: make this dynamic based on the modle
    max_tokens: 10000,
    // max_tokens: selectedModel === 'gpt-3.5-turbo-16k' ? 10000 : 4096,

    temperature: 0.5,
  });
};

export const generateQuestionsForEpic = ({
  chatApi,
  epic,
  selectedModel,
}: {
  chatApi: string;
  epic: EpicType;
  selectedModel: string;
}) => {
  // TODO: use selectedModel then remove console.log
  console.log(selectedModel);
  const openai = openaiCall({ chatApi });
  return openai.post('/chat/completions', {
    model: 'gpt-3.5-turbo-16k',
    // model: selectedModel,
    messages: [
      {
        role: 'system',
        content:
          'You are an AI trained to generate contextual questions for software development projects.',
      },
      {
        role: 'user',
        content: generateContextQuestionsForEpic(epic),
      },
    ],
    max_tokens: 1000,
    temperature: 0.5,
  });
};

export const generateQuestionsForFeature = ({
  chatApi,
  feature,
  selectedModel,
}: {
  chatApi: string;
  feature: FeatureType;
  selectedModel: string;
}) => {
  // TODO: use selectedModel then remove console.log
  console.log(selectedModel);
  const openai = openaiCall({ chatApi });
  return openai.post('/chat/completions', {
    model: 'gpt-3.5-turbo-16k',
    // model: selectedModel,
    messages: [
      {
        role: 'system',
        content:
          'You are an AI trained to generate contextual questions for software development projects.',
      },
      {
        role: 'user',
        content: generateContextQuestionsForFeature(feature),
      },
    ],
    max_tokens: 1000,
    temperature: 0.5,
  });
};

export const generateQuestionsForUserStory = ({
  chatApi,
  userStory,
  selectedModel,
}: {
  chatApi: string;
  userStory: UserStoryType;
  selectedModel: string;
}) => {
  // TODO: use selectedModel then remove console.log
  console.log(selectedModel);
  const openai = openaiCall({ chatApi });
  return openai.post('/chat/completions', {
    model: 'gpt-3.5-turbo-16k',
    // model: selectedModel,
    messages: [
      {
        role: 'system',
        content:
          'You are an AI trained to generate contextual questions for software development projects.',
      },
      {
        role: 'user',
        content: generateContextQuestionsForUserStory(userStory),
      },
    ],
    max_tokens: 1000,
    temperature: 0.5,
  });
};

export const generateQuestionsForTask = ({
  chatApi,
  task,
  selectedModel,
}: {
  chatApi: string;
  task: TaskType;
  selectedModel: string;
}) => {
  // TODO: use selectedModel then remove console.log
  console.log(selectedModel);
  const openai = openaiCall({ chatApi });
  return openai.post('/chat/completions', {
    model: 'gpt-3.5-turbo-16k',
    // model: selectedModel,
    messages: [
      {
        role: 'system',
        content:
          'You are an AI trained to generate contextual questions for software development projects.',
      },
      {
        role: 'user',
        content: generateContextQuestionsForTask(task),
      },
    ],
    max_tokens: 1000,
    temperature: 0.5,
  });
};

export const generateFollowUpQuestions = ({
  chatApi,
  context,
  selectedModel,
}: {
  chatApi: string;
  context: string;
  selectedModel: string;
}) => {
  // TODO: use selectedModel then remove console.log
  console.log(selectedModel);
  const openai = openaiCall({ chatApi });
  return openai.post('/chat/completions', {
    model: 'gpt-3.5-turbo-16k',

    // model: selectedModel,

    messages: [
      {
        role: 'system',
        content:
          'You are an AI trained to generate follow-up questions based on given context and answers.',
      },
      {
        role: 'user',
        content: context,
      },
    ],
    max_tokens: 1000,
    temperature: 0.5,
  });
};

export const generateUpdatedEpic = ({
  chatApi,
  requirements,
  selectedModel,
  context,
}: {
  chatApi: string;
  requirements: string;
  selectedModel: string;
  context?: string;
}) => {
  // TODO: use selectedModel then remove console.log
  console.log(selectedModel);
  const openai = openaiCall({ chatApi });
  return openai.post('/chat/completions', {
    model: 'gpt-3.5-turbo-16k',
    // model: selectedModel,
    messages: [
      {
        role: 'system',
        content:
          'You are an AI trained to generate updated epics based on given context and answers.',
      },
      {
        role: 'user',
        content: epicPrompt(requirements, context),
      },
    ],
    // TODO-p2: make this dynamic based on the modle
    max_tokens: 10000,
    // max_tokens: selectedModel === 'gpt-3.5-turbo-16k' ? 10000 : 4096,

    temperature: 0.5,
  });
};

export const generateUpdatedFeature = ({
  chatApi,
  epic,
  state,
  selectedModel,
  context,
}: {
  chatApi: string;
  epic: EpicType;
  state: RootState;
  selectedModel: string;
  context?: string;
}) => {
  // TODO: use selectedModel then remove console.log
  console.log(selectedModel);
  const openai = openaiCall({ chatApi });
  return openai.post('/chat/completions', {
    model: 'gpt-3.5-turbo-16k',

    // model: selectedModel,

    messages: [
      {
        role: 'system',
        content:
          'You are an AI trained to generate updated features based on given context and answers.',
      },
      {
        role: 'user',
        content: featurePrompt(epic, state, context),
      },
    ],
    // TODO-p2: make this dynamic based on the modle
    max_tokens: 10000,
    // max_tokens: selectedModel === 'gpt-3.5-turbo-16k' ? 10000 : 4096,

    temperature: 0.5,
  });
};

export const generateUpdatedUserStory = ({
  chatApi,
  feature,
  state,
  selectedModel,
  context,
}: {
  chatApi: string;
  feature: FeatureType;
  state: RootState;
  selectedModel: string;
  context?: string;
}) => {
  // TODO: use selectedModel then remove console.log
  console.log(selectedModel);
  const openai = openaiCall({ chatApi });
  return openai.post('/chat/completions', {
    model: 'gpt-3.5-turbo-16k',
    // model: selectedModel,
    messages: [
      {
        role: 'system',
        content:
          'You are an AI trained to generate updated user stories based on given context and answers.',
      },
      {
        role: 'user',
        content: userStoryPrompt(feature, state, context),
      },
    ],
    // TODO-p2: make this dynamic based on the modle
    max_tokens: 10000,
    // max_tokens: selectedModel === 'gpt-3.5-turbo-16k' ? 10000 : 4096,

    temperature: 0.5,
  });
};

export const generateUpdatedTask = ({
  chatApi,
  userStory,
  state,
  context,
  selectedModel,
}: {
  chatApi: string;
  userStory: UserStoryType;
  state: RootState;
  context: string;
  selectedModel: string;
}) => {
  // TODO: use selectedModel then remove console.log
  console.log(selectedModel);
  const openai = openaiCall({ chatApi });
  return openai.post('/chat/completions', {
    model: 'gpt-3.5-turbo-16k',
    // model: selectedModel,
    messages: [
      {
        role: 'system',
        content:
          'You are an AI trained to generate updated tasks based on given context and answers.',
      },
      {
        role: 'user',
        content: taskPrompt(userStory, state, context),
      },
    ],
    // TODO-p2: make this dynamic based on the modle
    max_tokens: 10000,
    // max_tokens: selectedModel === 'gpt-3.5-turbo-16k' ? 10000 : 4096,

    temperature: 0.5,
  });
};

export const generateQuestionsForGlobalRefinement = ({
  chatApi,
  globalInformation,
  selectedModel,
}: {
  chatApi: string;
  globalInformation: string;
  selectedModel: string;
}) => {
  // TODO: use selectedModel then remove console.log
  console.log(selectedModel);
  const openai = openaiCall({ chatApi });
  return openai.post('/chat/completions', {
    model: 'gpt-3.5-turbo-16k',
    // model: selectedModel,
    messages: [
      {
        role: 'system',
        content:
          'You are an AI trained to generate contextual questions for software development projects.',
      },
      {
        role: 'user',
        content: generateContextQuestionsForGlobalRefinement(globalInformation),
      },
    ],
    max_tokens: 1000,
    temperature: 0.5,
  });
};

export const generateUpdatedExplanationForGlobalRefinement = async ({
  chatApi,
  globalInformation,
  context,
  selectedModel,
}: {
  chatApi: string;
  globalInformation: string;
  context: string;
  selectedModel: string;
}) => {
  // TODO: use selectedModel then remove console.log
  console.log(selectedModel);
  const openai = openaiCall({ chatApi });
  const response = await openai.post('/chat/completions', {
    model: 'gpt-3.5-turbo-16k',
    // model: selectedModel,
    messages: [
      {
        role: 'system',
        content:
          'You are an AI trained to generate contextual questions for software development projects.',
      },
      {
        role: 'user',
        content: generateExplanationForGlobalRefinement(
          globalInformation,
          context
        ),
      },
    ],
    max_tokens: 1000,
    temperature: 0.5,
  });
  // Extract the updated explanation between the separators "=+="
  const responseText = response?.data?.choices[0]?.message?.content;
  const startIndex = responseText?.indexOf('=+=') + 3; // +3 to exclude the separator itself
  const endIndex = responseText?.lastIndexOf('=+=');
  const updatedExplanation = responseText
    .substring(startIndex, endIndex)
    .trim();

  return updatedExplanation;
};
