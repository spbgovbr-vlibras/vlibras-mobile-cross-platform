/* eslint-disable no-param-reassign */
import produce, { Draft } from 'immer';
import { Reducer } from 'redux';
import { createAction, ActionType } from 'typesafe-actions';
import dateFormat from 'utils/dateFormat';

export const Types = {
  SET_ARRAY_VIDEOS: '@video/SET_ARRAY_VIDEOS',
  SET_LAST_TRANSLATOR: '@video/SET_LAST_TRANSLATOR',
  SET_DOMAIN: '@video/SET_DOMAIN',
  SET_IS_VIDEO_SCREEN: '@video/SET_IS_VIDEO_SCREEN',
  SET_TRANSLATION_HISTORIC: '@video/SET_TRANSLATION_HISTORIC',
};

export interface VideoState {
  current: any;
  lastTranslate: any;
  translationsHistoric: any;
  domain: string;
  isVideoScreen: boolean;
}

const INITIAL_STATE: VideoState = {
  current: [],
  lastTranslate: [],
  domain: 'Saúde',
  isVideoScreen: false,
  translationsHistoric: {}
};

export const Creators = {
  setCurrentArrayVideo: createAction(Types.SET_ARRAY_VIDEOS)<any>(),
  setLastTranslator: createAction(Types.SET_LAST_TRANSLATOR)<any>(),
  setDomain: createAction(Types.SET_DOMAIN)<any>(),
  setIsVideoScreen: createAction(Types.SET_IS_VIDEO_SCREEN)<any>(),
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
        draft.lastTranslate = payload.data;

        const dateFormatted = dateFormat(payload.date)
        if (draft.translationsHistoric[dateFormatted]) {
          draft.translationsHistoric[dateFormatted].unshift(payload.data)
        } else {
          draft.translationsHistoric[dateFormatted] = [payload.data]
        }

        break;
      case Types.SET_DOMAIN:
        draft.domain = payload;
        break;
      case Types.SET_IS_VIDEO_SCREEN:
        draft.isVideoScreen = payload;
        break;
      default:
        break;
    }
  });
};

export default reducer;
