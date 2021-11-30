/* eslint-disable no-param-reassign */
import { useState } from 'react';

import produce, { Draft } from 'immer';
import { Reducer } from 'redux';
import { createAction, ActionType } from 'typesafe-actions';

import { Words } from 'models/dictionary';

export const Types = {
  SET_TRANSLATOR_TEXT: '@translator/SET_CURRENT_TRANSLATOR_TEXT',
};

export interface TranslatorTextState {
  translatorText: string;
}

const INITIAL_STATE: TranslatorTextState = {
  translatorText: '',
};

export const Creators = {
  setTranslatorText: createAction(Types.SET_TRANSLATOR_TEXT)<string>(),
};

export type ActionTypes = ActionType<typeof Creators>;

const reducer: Reducer<TranslatorTextState, ActionTypes> = (
  state = INITIAL_STATE,
  action: ActionTypes,
) => {
  const { payload, type } = action;
  return produce(state, (draft: Draft<TranslatorTextState>) => {
    switch (type) {
      case Types.SET_TRANSLATOR_TEXT:
        draft.translatorText = payload;
        break;

      default:
        break;
    }
  });
};

export default reducer;
