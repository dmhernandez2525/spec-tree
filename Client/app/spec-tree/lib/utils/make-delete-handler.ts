import { Dispatch } from 'redux';
import { AnyAction } from 'redux';

type ParametersType = {
  [key: string]: string;
};

const makeDeleteHandler = (
  dispatch: Dispatch<AnyAction>,
  action: any,
  parameters: ParametersType
) => {
  return (): void => {
    dispatch(action(parameters));
  };
};

export default makeDeleteHandler;
