/* eslint-disable no-param-reassign */
import produce, { Draft } from 'immer';
import { Reducer } from 'redux';
import { createAction, ActionType } from 'typesafe-actions';

import regionalismData from 'data/regionalism';

export interface RegionalismData {
  abbreviation: string;
  name: string;
  url: string;
}

export const Types = {
  SET_CURRENT_REGIONALISM: '@regionalism/SET_CURRENT_REGIONALISM',
};

export interface RegionalismState {
  current: RegionalismData;
}

const INITIAL_STATE: RegionalismState = {
  current: {
    abbreviation: regionalismData[0].abbreviation,
    name: regionalismData[0].name,
    url: regionalismData[0].url
  },
};

export const Creators = {
  setCurrentRegionalism: createAction(Types.SET_CURRENT_REGIONALISM)<RegionalismData>(),
};

export type ActionTypes = ActionType<typeof Creators>;

const reducer: Reducer<RegionalismState, ActionTypes> = (
  state = INITIAL_STATE,
  action: ActionTypes
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
