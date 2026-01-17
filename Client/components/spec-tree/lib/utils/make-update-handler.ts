import { Dispatch, AnyAction } from 'redux';
import type { ActionCreatorWithPayload } from '@reduxjs/toolkit';

type ParametersType = {
  [key: string]: string | number;
};

type UpdateFieldType =
  | 'title'
  | 'description'
  | 'goal'
  | 'successCriteria'
  | 'dependencies'
  | 'timeline'
  | 'resources'
  | 'notes'
  | string;

type UpdateParameters = {
  field: UpdateFieldType;
  newValue: string | string[];
  riskMitigationIndex?: number;
  arrayIndex?: number;
  isArrayItem?: boolean;
};

type CombinedPayload = ParametersType & UpdateParameters;

const makeUpdateHandler = <P extends CombinedPayload>(
  dispatch: Dispatch<AnyAction>,
  action: ActionCreatorWithPayload<P>,
  parameters: ParametersType
) => {
  return (updateParams: UpdateParameters): void => {
    dispatch(
      action({
        ...parameters,
        ...updateParams,
      } as P)
    );
  };
};

export default makeUpdateHandler;
