/* eslint-disable camelcase */
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

export interface RegionalismParams {
  abbrreviation: string;
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
  hasNextPage: boolean;
}

const METADATA_INITIAL_STATE: Metadata = {
  current_page: FIRST_PAGE_INDEX,
  first_page: FIRST_PAGE_INDEX,
  first_page_url: '',
  last_page: FIRST_PAGE_INDEX,
  last_page_url: '',
  next_page_url: '',
  per_page: 0,
  previous_page_url: '',
  total: 0,
  hasNextPage: false,
};

export interface ListResponseDictionary {
  meta: Metadata;
  data: Words[];
}

export interface ListBundleDictionary {
  data: string[];
}

export enum ErrorDictionaryRequest {
  INTERNET_CONNECTION='INTERNET_CONNECTION',
  UNKNOWN='UNKNOWN'
}

export const Types = {
  SET_CURRENT_DICTIONARY: '@dictionary/SET_CURRENT_DICTIONARY',
  GET_REQUEST: '@dicinario/GET_REQUEST',
  GET_SUCCESS: '@dicinario/GET_SUCCESS',
  GET_FAILURE: '@dicinario/GET_FAILURE',
  GET_BUNDLE_REQUEST: '@dicinario/GET_BUNDLE_REQUEST',
  GET_BUNDLE_SUCCESS: '@dicinario/GET_BUNDLE_SUCCESS',
  GET_BUNDLE_FAILURE: '@dicinario/GET_BUNDLE_FAILURE',
  BUNDLE_CLEAR: '@dicinario/BUNDLE_CLEAR',
};

export interface DictionaryState {
  words: Words[];
  recents: Words[];
  metadata: Metadata;
  loading: boolean;
  loadingBundle: boolean;
  regionalismWords: string[];
  error: ErrorDictionaryRequest | null
}

const INITIAL_STATE: DictionaryState = {
  words: [],
  recents: [],
  metadata: METADATA_INITIAL_STATE,
  loading: false,
  loadingBundle: false,
  regionalismWords: [],
  error: null
};

export const Creators = {
  setCurrentRegionalism: createAction(Types.SET_CURRENT_DICTIONARY)<string>(),
  fetchWords: createAsyncAction(
    Types.GET_REQUEST,
    Types.GET_SUCCESS,
    Types.GET_FAILURE
  )<MetadataParams, ListResponseDictionary, unknown>(),
  fetchRegionalismWords: createAsyncAction(
    Types.GET_BUNDLE_REQUEST,
    Types.GET_BUNDLE_SUCCESS,
    Types.GET_BUNDLE_FAILURE
  )<RegionalismParams, ListBundleDictionary, unknown>(),
  clearRegionalismWords: createAction(Types.BUNDLE_CLEAR)<void>(),
};

export type ActionTypes = ActionType<typeof Creators>;

function mapErrorToDictionaryRequest(error: Error): ErrorDictionaryRequest {
  const errorMessageLower = error.message.toLowerCase();

  if (errorMessageLower.includes('network error') || errorMessageLower.includes('timeout')) {
    return ErrorDictionaryRequest.INTERNET_CONNECTION;
  }

  return ErrorDictionaryRequest.UNKNOWN;
}

const reducer: Reducer<DictionaryState, ActionTypes> = (
  state = INITIAL_STATE,
  action: ActionTypes
) => {
  const { payload, type } = action;
  return produce(state, (draft: Draft<DictionaryState>) => {
    switch (type) {
    case Types.SET_CURRENT_DICTIONARY: {
      draft.words = payload;
      break;
    }
    case Types.GET_REQUEST: {
      if (payload.page === FIRST_PAGE_INDEX) {
        draft.metadata = METADATA_INITIAL_STATE;
        draft.words = [];
      }
      draft.error = null;
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
      draft.metadata = {
        ...meta,
        hasNextPage: meta.current_page < meta.last_page
      };
      break;
    }
    case Types.GET_FAILURE: {
      const error = payload as Error;
      draft.error = mapErrorToDictionaryRequest(error);
      draft.loading = false;
      break;
    }
    case Types.GET_BUNDLE_REQUEST: {
      draft.loadingBundle = true;
      draft.error = null;
      draft.regionalismWords = [];
      break;
    }
    case Types.GET_BUNDLE_SUCCESS: {
      draft.loadingBundle = false;
      draft.regionalismWords = (payload as ListBundleDictionary).data;
      break;
    }
    case Types.GET_BUNDLE_FAILURE: {
      const error = payload as Error;
      draft.error = mapErrorToDictionaryRequest(error);
      draft.loadingBundle = false;
      break;
    }
    case Types.BUNDLE_CLEAR: {
      draft.regionalismWords = [];
      break;
    }
    default:
      break;
    }
  });
};

export default reducer;
