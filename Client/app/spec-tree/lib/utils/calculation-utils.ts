import { RootState } from '../../../../lib/store';
import { EpicType, FeatureType, UserStoryType } from '../types/work-items';
import {
  selectFeatureById,
  selectUserStoryById,
  selectTaskById,
} from '../../../../lib/store/sow-slice';

const calculateTotalTasks = (
  state: RootState,
  input: EpicType | EpicType[] | FeatureType | UserStoryType
): number => {
  let totalTasks = 0;

  if (Array.isArray(input) || 'featureIds' in input) {
    const epics = Array.isArray(input) ? input : [input];

    epics?.forEach((epic: EpicType) => {
      const features = epic?.featureIds?.map((id) =>
        selectFeatureById(state, id)
      );
      const userStories = features?.flatMap((feature) =>
        feature.userStoryIds?.map((id) => selectUserStoryById(state, id))
      );
      const tasks = userStories?.flatMap((userStory) =>
        userStory?.taskIds?.map((id) => selectTaskById(state, id))
      );
      totalTasks += tasks?.length || 0;
    });
  } else if (input && 'userStoryIds' in input) {
    const userStories = input?.userStoryIds?.map((id) =>
      selectUserStoryById(state, id)
    );
    const tasks = userStories?.flatMap((userStory) =>
      userStory?.taskIds?.map((id) => selectTaskById(state, id))
    );
    totalTasks += tasks?.length || 0;
  } else if (input && 'taskIds' in input) {
    totalTasks += input?.taskIds?.length || 0;
  } else {
    console.log('Invalid input');
  }

  return totalTasks;
};

const calculateTotalFeatures = (input: EpicType | EpicType[]): number => {
  let totalFeatures = 0;
  const epics = Array.isArray(input) ? input : [input];

  epics?.forEach((epic: EpicType) => {
    totalFeatures += epic.featureIds.length;
  });

  return totalFeatures;
};

const calculateTotalUserStories = (
  state: RootState,
  input: EpicType | EpicType[] | FeatureType
): number => {
  let totalUserStories = 0;

  if (Array.isArray(input) || 'featureIds' in input) {
    const epics = Array.isArray(input) ? input : [input];

    epics?.forEach((epic: EpicType) => {
      const features = epic?.featureIds?.map((id) =>
        selectFeatureById(state, id)
      );
      const userStories = features?.flatMap((feature) => feature?.userStoryIds);
      totalUserStories += userStories?.length || 0;
    });
  } else if (input && 'userStoryIds' in input) {
    totalUserStories += input?.userStoryIds?.length || 0;
  }

  return totalUserStories;
};

export {
  calculateTotalTasks,
  calculateTotalFeatures,
  calculateTotalUserStories,
};
