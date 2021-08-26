/* eslint-disable no-param-reassign */
import produce, { Draft } from 'immer';
import { Reducer } from 'redux';
import { createAction, ActionType, createAsyncAction } from 'typesafe-actions';

import { Words } from 'models/dictionary';

export interface MetaDataParams {
  limit: number;
  page: number;
  name?: string;
}

export interface MetaData {
  total: number;
  limit: number;
  pageIndex: number;
}

export interface ListResponseDictionary {
  meta: MetaData;
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
  metaData: MetaData;
  loading: boolean;
  // estado da aplicação
}

const INITIAL_STATE: DictionaryState = {
  words: [],
  recents: [],
  metaData: {} as MetaData,
  loading: false,
};

export const Creators = {
  setCurrentRegionalism: createAction(Types.SET_CURRENT_DICTIONARY)<string>(),
  fetchWords: createAsyncAction(
    Types.GET_REQUEST,
    Types.GET_SUCCESS,
    Types.GET_FAILURE,
  )<MetaDataParams, ListResponseDictionary, unknown>(),
};

export type ActionTypes = ActionType<typeof Creators>;

const reducer: Reducer<DictionaryState, ActionTypes> = (
  state = INITIAL_STATE,
  action: ActionTypes,
) => {
  const { payload, type } = action;
  return produce(state, (draft: Draft<DictionaryState>) => {
    switch (type) {
      case Types.SET_CURRENT_DICTIONARY:
        draft.words = payload;

        break;
      case Types.GET_REQUEST:
        draft.loading = true;

        break;
      case Types.GET_SUCCESS:
        draft.loading = false;
        // eslint-disable-next-line no-case-declarations
        const { meta, data } = payload as ListResponseDictionary;
        draft.words = data;
        draft.metaData = meta;

        break;
      case Types.GET_FAILURE:
        draft.loading = false;

        break;

      default:
        break;
    }
  });
};

export default reducer;
