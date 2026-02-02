/**
 * Model Selection Hook
 *
 * F1.3.9 - Model selection per task
 *
 * Provides task-type-specific model selection with persistence.
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  ALL_MODELS,
  AIModelInfo,
  AIProviderType,
  getModelsForProvider,
} from '../api/providers/ai-provider';
import { isProviderAvailable } from '../api/providers/provider-factory';

/**
 * Task types that can have different model preferences
 */
export type TaskType =
  | 'generation' // Main content generation (epics, features, stories)
  | 'expansion' // Expanding existing content
  | 'questions' // Generating contextual questions
  | 'refinement' // Refining/improving content
  | 'chat'; // Chat/Q&A interactions

/**
 * Model preferences for each task type
 */
export interface ModelPreferences {
  generation: string;
  expansion: string;
  questions: string;
  refinement: string;
  chat: string;
}

/**
 * Default model preferences by task type
 */
export const DEFAULT_MODEL_PREFERENCES: ModelPreferences = {
  generation: 'gpt-4-turbo', // High capability for main generation
  expansion: 'gpt-3.5-turbo-16k', // Cost-effective for expansion
  questions: 'gpt-3.5-turbo', // Fast for questions
  refinement: 'gpt-4-turbo', // High capability for refinement
  chat: 'gpt-3.5-turbo', // Fast for chat
};

/**
 * Storage key for persisted preferences
 */
const STORAGE_KEY = 'spec-tree-model-preferences';

/**
 * Load preferences from localStorage
 */
function loadPreferences(): ModelPreferences {
  if (typeof window === 'undefined') {
    return DEFAULT_MODEL_PREFERENCES;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate all keys exist
      const validKeys: TaskType[] = [
        'generation',
        'expansion',
        'questions',
        'refinement',
        'chat',
      ];
      const isValid = validKeys.every(
        (key) => typeof parsed[key] === 'string'
      );
      if (isValid) {
        return parsed;
      }
    }
  } catch {
    // Ignore parse errors
  }

  return DEFAULT_MODEL_PREFERENCES;
}

/**
 * Save preferences to localStorage
 */
function savePreferences(preferences: ModelPreferences): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Get recommended models for a task type
 */
export function getRecommendedModelsForTask(taskType: TaskType): AIModelInfo[] {
  switch (taskType) {
    case 'generation':
    case 'refinement':
      // High capability models for complex tasks
      return ALL_MODELS.filter(
        (m) =>
          m.id.includes('gpt-4') ||
          m.id.includes('opus') ||
          m.id === 'gemini-1.5-pro'
      );

    case 'expansion':
    case 'questions':
    case 'chat':
      // Cost-effective models for simpler tasks
      return ALL_MODELS.filter(
        (m) =>
          m.id.includes('3.5') ||
          m.id.includes('sonnet') ||
          m.id.includes('haiku') ||
          m.id.includes('flash')
      );

    default:
      return ALL_MODELS;
  }
}

/**
 * Model selection state and actions
 */
export interface UseModelSelectionReturn {
  /** Current model preferences */
  preferences: ModelPreferences;

  /** Get the selected model for a task type */
  getModelForTask: (taskType: TaskType) => string;

  /** Get model info for a task type */
  getModelInfoForTask: (taskType: TaskType) => AIModelInfo | undefined;

  /** Set the model for a task type */
  setModelForTask: (taskType: TaskType, modelId: string) => void;

  /** Reset to default preferences */
  resetPreferences: () => void;

  /** Get all available models */
  allModels: AIModelInfo[];

  /** Get models by provider */
  getModelsByProvider: (provider: AIProviderType) => AIModelInfo[];

  /** Get recommended models for a task type */
  getRecommendedModels: (taskType: TaskType) => AIModelInfo[];

  /** Check if a provider is available */
  checkProviderAvailable: (provider: AIProviderType) => boolean;

  /** Group models by provider for display */
  modelsByProvider: Record<AIProviderType, AIModelInfo[]>;
}

/**
 * Hook for managing model selection per task type
 */
export function useModelSelection(): UseModelSelectionReturn {
  const [preferences, setPreferences] = useState<ModelPreferences>(
    loadPreferences
  );

  // Persist preferences when they change
  useEffect(() => {
    savePreferences(preferences);
  }, [preferences]);

  const getModelForTask = useCallback(
    (taskType: TaskType): string => {
      return preferences[taskType] || DEFAULT_MODEL_PREFERENCES[taskType];
    },
    [preferences]
  );

  const getModelInfoForTask = useCallback(
    (taskType: TaskType): AIModelInfo | undefined => {
      const modelId = getModelForTask(taskType);
      return ALL_MODELS.find((m) => m.id === modelId);
    },
    [getModelForTask]
  );

  const setModelForTask = useCallback(
    (taskType: TaskType, modelId: string): void => {
      setPreferences((prev) => ({
        ...prev,
        [taskType]: modelId,
      }));
    },
    []
  );

  const resetPreferences = useCallback((): void => {
    setPreferences(DEFAULT_MODEL_PREFERENCES);
  }, []);

  const getModelsByProvider = useCallback(
    (provider: AIProviderType): AIModelInfo[] => {
      return getModelsForProvider(provider);
    },
    []
  );

  const getRecommendedModels = useCallback(
    (taskType: TaskType): AIModelInfo[] => {
      return getRecommendedModelsForTask(taskType);
    },
    []
  );

  const checkProviderAvailable = useCallback(
    (provider: AIProviderType): boolean => {
      return isProviderAvailable(provider);
    },
    []
  );

  const modelsByProvider = useMemo(() => {
    const providers: AIProviderType[] = ['openai', 'anthropic', 'gemini'];
    return providers.reduce(
      (acc, provider) => {
        acc[provider] = getModelsForProvider(provider);
        return acc;
      },
      {} as Record<AIProviderType, AIModelInfo[]>
    );
  }, []);

  return {
    preferences,
    getModelForTask,
    getModelInfoForTask,
    setModelForTask,
    resetPreferences,
    allModels: ALL_MODELS,
    getModelsByProvider,
    getRecommendedModels,
    checkProviderAvailable,
    modelsByProvider,
  };
}

/**
 * Get task type description for display
 */
export function getTaskTypeDescription(taskType: TaskType): string {
  switch (taskType) {
    case 'generation':
      return 'Creating new epics, features, and user stories';
    case 'expansion':
      return 'Expanding existing items with more detail';
    case 'questions':
      return 'Generating contextual questions';
    case 'refinement':
      return 'Refining and improving content';
    case 'chat':
      return 'Chat and Q&A interactions';
    default:
      return '';
  }
}

/**
 * Get task type display name
 */
export function getTaskTypeDisplayName(taskType: TaskType): string {
  switch (taskType) {
    case 'generation':
      return 'Generation';
    case 'expansion':
      return 'Expansion';
    case 'questions':
      return 'Questions';
    case 'refinement':
      return 'Refinement';
    case 'chat':
      return 'Chat';
    default:
      return taskType;
  }
}
