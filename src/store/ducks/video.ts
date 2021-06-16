/* eslint-disable no-param-reassign */
import produce, { Draft } from 'immer';
import { Reducer } from 'redux';
import { createAction, ActionType } from 'typesafe-actions';

export const Types = {
  SET_ARRAY_VIDEOS: '@video/SET_ARRAY_VIDEOS',
  SET_LAST_TRANSLATOR: '@video/SET_LAST_TRANSLATOR',

};

export interface VideoState {
  current: any;
  lastTranslate: any;
}

const INITIAL_STATE: VideoState = {
  current: [],
  lastTranslate: []
};

export const Creators = {
  setCurrentArrayVideo: createAction(Types.SET_ARRAY_VIDEOS)<any>(),
  setLastTranslator: createAction(Types.SET_LAST_TRANSLATOR)<any>(),

};

export type ActionTypes = ActionType<typeof Creators>;

const reducer: Reducer<VideoState, ActionTypes> = (
  state = INITIAL_STATE,
  action: ActionTypes,
) => {
  const { payload, type } = action;
  return produce(state, (draft: Draft<VideoState>) => {
    switch (type) {
      case Types.SET_ARRAY_VIDEOS:
        draft.current = payload;
        break;
      case Types.SET_LAST_TRANSLATOR:
        draft.lastTranslate = payload;
        break;

      default:
        break;
    }
  });
};

export default reducer;
