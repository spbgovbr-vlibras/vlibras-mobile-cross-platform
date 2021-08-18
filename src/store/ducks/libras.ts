/* eslint-disable no-param-reassign */
import produce, { Draft } from 'immer';
import { Reducer } from 'redux';
import { createAction, ActionType } from 'typesafe-actions';
import { reloadHistory } from 'utils/setHistory';


export const Types = {
  SET_ARRAY_LIBRAS: '@LIBRAS/SET_ARRAY_LIBRAS',
  SET_LAST_TRANSLATOR: '@LIBRAS/SET_LAST_TRANSLATOR',
  SET_IS_LIBRAS_SCREEN: '@LIBRAS/SET_IS_LIBRAS_SCREEN',
  SET_TRANSLATION_HISTORIC: '@LIBRAS/SET_TRANSLATION_HISTORIC',
};

export interface LibrasState {
  current: any;
  lastTranslate: any;
  translationsHistoric: any;
  isLibrasScreen: boolean;
}

const INITIAL_STATE: LibrasState = {
  current: [],
  lastTranslate: [],
  isLibrasScreen: false,
  translationsHistoric: {}
};

export const Creators = {
  setCurrentArrayLibras: createAction(Types.SET_ARRAY_LIBRAS)<any>(),
  setLastTranslator: createAction(Types.SET_LAST_TRANSLATOR)<any>(),
  setIsLibrasScreen: createAction(Types.SET_IS_LIBRAS_SCREEN)<any>(),
};

export type ActionTypes = ActionType<typeof Creators>;


const reducer: Reducer<LibrasState, ActionTypes> = (
  state = INITIAL_STATE,
  action: ActionTypes,
) => {
  const { payload, type } = action;
  return produce(state, (draft: Draft<LibrasState>) => {
    switch (type) {
      case Types.SET_ARRAY_LIBRAS:
        draft.current = payload;
        break;
      case Types.SET_LAST_TRANSLATOR:
        // draft.lastTranslate = payload.data;
        draft.lastTranslate = ['alo']; //mock

        reloadHistory(payload.date, payload.data, payload.key);
 
        //mock
        if (draft.translationsHistoric[payload.date]) {  
          if (draft.translationsHistoric[payload.date][payload.key]) {
            draft.translationsHistoric[payload.date][payload.key].unshift(payload.data)
          } else {
            draft.translationsHistoric[payload.date][payload.key] = []
            draft.translationsHistoric[payload.date][payload.key].unshift(payload.data)
          }
        } else {
          draft.translationsHistoric[payload.date] = {}
          draft.translationsHistoric[payload.date][payload.key] = [payload.data]          
        }
 
        break;
      case Types.SET_IS_LIBRAS_SCREEN:
        draft.isLibrasScreen = payload;
        break;
      default:
        break;
    }
  });
};



export default reducer;
