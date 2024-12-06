import { RootState } from '../../../../lib/store';
import { EpicType, FeatureType, UserStoryType } from '../types/work-items';
import {
  selectFeatureById,
  selectUserStoryById,
} from '../../../../lib/store/sow-slice';

const calculateTotalPoints = (
  state: RootState,
  input: EpicType | FeatureType | UserStoryType[] | UserStoryType
): number => {
  let totalPoints = 0;

  if (Array.isArray(input)) {
    input.forEach((userStory: UserStoryType) => {
      totalPoints += parseInt(userStory?.points || '0', 10);
    });
  } else if (input && 'featureIds' in input) {
    const epicInput = input as EpicType;
    const features = epicInput.featureIds.map((id) =>
      selectFeatureById(state, id)
    );
    const userStories = features.flatMap((feature) =>
      feature.userStoryIds?.map((id) => selectUserStoryById(state, id))
    );
    userStories.forEach((userStory) => {
      totalPoints += parseInt(userStory?.points || '0', 10);
    });
  } else if (input && 'userStoryIds' in input) {
    const featureInput = input as FeatureType;
    const userStories = featureInput.userStoryIds.map((id) =>
      selectUserStoryById(state, id)
    );
    userStories.forEach((userStory) => {
      totalPoints += parseInt(userStory?.points || '0', 10);
    });
  } else if (input && 'points' in input) {
    totalPoints += parseInt(input.points || '0', 10);
  } else {
    console.log('Invalid input');
  }

  return totalPoints;
};

export default calculateTotalPoints;
