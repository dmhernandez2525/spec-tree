import { Dispatch, AnyAction } from 'redux';
import type { ActionCreatorWithPayload } from '@reduxjs/toolkit';

type ParametersType = {
  [key: string]: string;
};

const makeDeleteHandler = <P extends ParametersType>(
  dispatch: Dispatch<AnyAction>,
  action: ActionCreatorWithPayload<P>,
  parameters: P
) => {
  return (): void => {
    dispatch(action(parameters));
  };
};

export default makeDeleteHandler;
