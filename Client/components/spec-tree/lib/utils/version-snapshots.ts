import type { RootState } from '@/lib/store';
import type { SowSnapshot } from '@/types/version-snapshot';

export const buildSowSnapshot = (state: RootState): SowSnapshot => {
  const {
    epics,
    features,
    userStories,
    tasks,
    contextualQuestions,
    globalInformation,
    selectedModel,
    chatApi,
    id,
    apps,
  } = state.sow;

  return {
    epics,
    features,
    userStories,
    tasks,
    contextualQuestions,
    globalInformation,
    selectedModel,
    chatApi,
    id,
    apps,
  };
};
