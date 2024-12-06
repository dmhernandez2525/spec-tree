import { Dispatch } from 'redux';

type ParametersType = {
  [key: string]: string | number;
};

// type RiskMitigationFieldType = 'resolve' | 'own' | 'accept' | 'mitigate';

type UpdateFieldType =
  | 'title'
  | 'description'
  | 'goal'
  | 'successCriteria'
  | 'dependencies'
  | 'timeline'
  | 'resources'
  | 'notes'
  | string; // This is for the properties of RiskMitigationType but we should use this RiskMitigationFieldType

type UpdateParameters = {
  field: UpdateFieldType;
  newValue: string | string[];
  riskMitigationIndex?: number;
  arrayIndex?: number; // Used for updating specific item
  isArrayItem?: boolean; // Used for adding to the end of an array
};

const makeUpdateHandler = (
  dispatch: Dispatch<any>,
  action: any,
  parameters: ParametersType
) => {
  return (updateParams: UpdateParameters): void => {
    dispatch(
      action({
        ...parameters,
        ...updateParams,
      })
    );
  };
};

export default makeUpdateHandler;
