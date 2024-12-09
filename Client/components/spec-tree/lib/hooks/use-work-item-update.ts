import { useState } from 'react';
import {
  generateUpdatedEpic,
  generateUpdatedFeature,
  generateUpdatedUserStory,
  generateUpdatedTask,
} from '../api/openai';
import {
  ExtendedWorkItemType,
  EpicType,
  FeatureType,
  UserStoryType,
} from '../types/work-items';
import { RootState } from '../../../../lib/store';

import { useSelector } from 'react-redux';
import { selectChatApi } from '../../../../lib/store/sow-slice';

interface IGenerateUpdatedWorkItemProps {
  context: string;
  epic?: EpicType;
  feature?: FeatureType;
  userStory?: UserStoryType;
  state?: RootState;
}

const useWorkItemUpdate = (workItemType: ExtendedWorkItemType) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedWorkItem, setUpdatedWorkItem] = useState<any>(null);
  const chatApi = useSelector(selectChatApi);

  const generateUpdatedWorkItem = async ({
    context,
    epic,
    feature,
    userStory,
    state,
  }: IGenerateUpdatedWorkItemProps) => {
    setLoading(true);
    try {
      let response;
      switch (workItemType) {
        case 'epics':
          response =
            state &&
            (await generateUpdatedEpic({
              chatApi,
              context,
              requirements: 'TODO-p1: Add requirements',
              selectedModel: state.sow.selectedModel,
            }));
          break;
        case 'features':
          response =
            epic &&
            state &&
            (await generateUpdatedFeature({
              chatApi,
              epic,
              state,
              context,
              selectedModel: state.sow.selectedModel,
            }));
          break;
        case 'userStories':
          response =
            feature &&
            state &&
            (await generateUpdatedUserStory({
              chatApi,
              feature,
              state,
              context,
              selectedModel: state.sow.selectedModel,
            }));
          break;
        case 'tasks':
          response =
            userStory &&
            state &&
            (await generateUpdatedTask({
              chatApi,
              userStory,
              state,
              context,
              selectedModel: state.sow.selectedModel,
            }));
          break;
        default:
          throw new Error('Invalid work item type.');
      }
      if (response) {
        setUpdatedWorkItem(response.data);
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to generate updated work item:', err);
      setError('Failed to generate updated work item.');
      setLoading(false);
    }
  };

  return { loading, error, updatedWorkItem, generateUpdatedWorkItem };
};

export default useWorkItemUpdate;
