import produce, { Draft } from 'immer';
import { Reducer } from 'redux';
import { createAction, ActionType, createAsyncAction } from 'typesafe-actions';

import { FIRST_PAGE_INDEX } from 'constants/pagination';
import { Words } from 'models/dictionary';

export interface MetadataParams {
  limit: number;
  page: number;
  name?: string;
}

export interface Metadata {
  current_page: number;
  first_page: number;
  first_page_url: string;
  last_page: number;
  last_page_url: string;
  next_page_url: string;
  per_page: number;
  previous_page_url: string;
  total: number;
}

export interface ListResponseDictionary {
  meta: Metadata;
  data: Words[];
}

export const Types = {
  SET_CURRENT_DICTIONARY: '@dictionary/SET_CURRENT_DICTIONARY',
  GET_REQUEST: '@dicinario/GET_REQUEST',
  GET_SUCCESS: '@dicinario/GET_SUCCESS',
  GET_FAILURE: '@dicinario/GET_FAILURE',
};

export interface DictionaryState {
  words: Words[];
  recents: Words[];
  metadata: Metadata;
  loading: boolean;
}

const INITIAL_STATE: DictionaryState = {
  words: [],
  recents: [],
  metadata: {} as Metadata,
  loading: false,
};

export const Creators = {
  setCurrentRegionalism: createAction(Types.SET_CURRENT_DICTIONARY)<string>(),
  fetchWords: createAsyncAction(
    Types.GET_REQUEST,
    Types.GET_SUCCESS,
    Types.GET_FAILURE,
  )<MetadataParams, ListResponseDictionary, unknown>(),
};

export type ActionTypes = ActionType<typeof Creators>;

const reducer: Reducer<DictionaryState, ActionTypes> = (
  state = INITIAL_STATE,
  action: ActionTypes,
) => {
  const { payload, type } = action;
  return produce(state, (draft: Draft<DictionaryState>) => {
    switch (type) {
      case Types.SET_CURRENT_DICTIONARY: {
        draft.words = payload;
        break;
      }
      case Types.GET_REQUEST: {
        draft.loading = true;
        break;
      }
      case Types.GET_SUCCESS: {
        draft.loading = false;
        const { meta, data } = payload as ListResponseDictionary;
        if (meta.current_page === FIRST_PAGE_INDEX) {
          draft.words = data;
        } else {
          draft.words = [...draft.words, ...data];
        }
        draft.metadata = meta;
        break;
      }
      case Types.GET_FAILURE: {
        draft.loading = false;
        break;
      }
      default:
        break;
    }
  });
};

export default reducer;
