/* eslint-disable no-param-reassign */
import produce, { Draft } from 'immer';
import { Reducer } from 'redux';
import { createAction, ActionType } from 'typesafe-actions';

import { reloadHistory, lastTranslation } from 'utils/setHistory';

export const Types = {
  SET_ARRAY_VIDEOS: '@video/SET_ARRAY_VIDEOS',
  SET_LAST_TRANSLATOR: '@video/SET_LAST_TRANSLATOR',
  SET_DOMAIN: '@video/SET_DOMAIN',
  SET_IS_VIDEO_SCREEN: '@video/SET_IS_VIDEO_SCREEN',
  SET_TRANSLATION_HISTORIC: '@video/SET_TRANSLATION_HISTORIC',
  SET_FIRST_ACCESS: '@video/SET_FIRST_ACCESS',
  SET_PROGRESS: '@video/SET_PROGRESS'
};

export interface VideoState {
  current: any;
  lastTranslate: any;
  translationsHistoric: any;
  domain: string;
  isVideoScreen: boolean;
  onboardingFirstAccess: boolean;
  progressOutput: number;
}

const INITIAL_STATE: VideoState = {
  current: [],
  lastTranslate: [],
  domain: 'Saúde',
  isVideoScreen: false,
  translationsHistoric: {},
  onboardingFirstAccess: true,
  progressOutput: 0
};

export const Creators = {
  setCurrentArrayVideo: createAction(Types.SET_ARRAY_VIDEOS)<any>(),
  setLastTranslator: createAction(Types.SET_LAST_TRANSLATOR)<any>(),
  setDomain: createAction(Types.SET_DOMAIN)<any>(),
  setIsVideoScreen: createAction(Types.SET_IS_VIDEO_SCREEN)<any>(),
  setFirstAccess: createAction(Types.SET_FIRST_ACCESS)<any>(),
  setProgress: createAction(Types.SET_PROGRESS)<any>(),
};

export type ActionTypes = ActionType<typeof Creators>;

type payloadVideoTranslator = {
  date: string;
  data: string[];
  key: string;
};

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
        // draft.lastTranslate = ['alo']; //mock

        // eslint-disable-next-line no-case-declarations
        const { date, data, key }: payloadVideoTranslator = payload;

        reloadHistory(date, data, key);
        lastTranslation(data, key);

        // mock
        // if (draft.translationsHistoric[date]) {
        //   if (draft.translationsHistoric[date][key]) {
        //     draft.translationsHistoric[date][key].unshift(data)
        //   } else {
        //     draft.translationsHistoric[date][key] = []
        //     draft.translationsHistoric[date][key].unshift(data)
        //   }
        // } else {
        //   draft.translationsHistoric[date] = {}
        //   draft.translationsHistoric[date][key] = [data]
        // }

        break;
      case Types.SET_DOMAIN:
        draft.domain = payload;
        break;
      case Types.SET_IS_VIDEO_SCREEN:
        draft.isVideoScreen = payload;
        break;
      case Types.SET_FIRST_ACCESS:
        draft.onboardingFirstAccess = payload; 
        break;
      case Types.SET_PROGRESS:
        draft.progressOutput = payload; 
        break;  
      default:
        break;
    }
  });
};

export default reducer;
