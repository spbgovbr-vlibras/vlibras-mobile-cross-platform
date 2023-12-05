import produce, { Draft } from 'immer';
import { Reducer } from 'redux';
import { createAction, ActionType } from 'typesafe-actions';

export interface LoadingActionData {
  isLoading: boolean;
}

export const Types = {
  SET_LOADING: '@loanding/SET_LOADING',
};

export interface LoadingActionState {
  isLoading: boolean;
}

const INITIAL_STATE: LoadingActionState = {
  isLoading: true,
};

export const Creators = {
  setIsLoading: createAction(Types.SET_LOADING)<LoadingActionData>(),
};

export type ActionTypes = ActionType<typeof Creators>;

const reducer: Reducer<LoadingActionState, ActionTypes> = (
  state = INITIAL_STATE,
  action: ActionTypes
) => {
  const { payload, type } = action;
  return produce(state, (draft: Draft<LoadingActionState>) => {
    switch (type) {
      case Types.SET_LOADING:
        draft.isLoading = payload.isLoading;
        break;

      default:
        break;
    }
  });
};

export default reducer;
