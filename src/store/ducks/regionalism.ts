/* eslint-disable no-param-reassign */
import produce, { Draft } from 'immer';
import { Reducer } from 'redux';
import { createAction, ActionType } from 'typesafe-actions';

import regionalismData from 'data/regionalism';

export const Types = {
  SET_CURRENT_REGIONALISM: '@regionalism/SET_CURRENT_REGIONALISM',
};

export interface RegionalismState {
  current: string;
}

const INITIAL_STATE: RegionalismState = {
  current: regionalismData[0].name,
};

export const Creators = {
  setCurrentRegionalism: createAction(Types.SET_CURRENT_REGIONALISM)<string>(),
};

export type ActionTypes = ActionType<typeof Creators>;

const reducer: Reducer<RegionalismState, ActionTypes> = (
  state = INITIAL_STATE,
  action: ActionTypes,
) => {
  const { payload, type } = action;
  return produce(state, (draft: Draft<RegionalismState>) => {
    switch (type) {
      case Types.SET_CURRENT_REGIONALISM:
        draft.current = payload;
        break;

      default:
        break;
    }
  });
};

export default reducer;
