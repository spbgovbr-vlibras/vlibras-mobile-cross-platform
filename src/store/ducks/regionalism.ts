/* eslint-disable no-param-reassign */
import produce, { Draft } from 'immer';
import { Reducer } from 'redux';
import { createAction, ActionType } from 'typesafe-actions';

export const Types = {
  SET_CURRENT_REGIONALISM: '@regionalism/SET_CURRENT_REGIONALISM',
// A action que vai ser disparada
};

export interface RegionalismState {
  current: string;
  // estado da aplicação(?)
  //data type
  //formato da informação que vai estar dentro do reducer
}

const INITIAL_STATE: RegionalismState = {
  current: ' ',
  //State Type
  // o formato que vai ser armazenado pelo reducer
};

//colocar tudo isso aqui em uma pasta chamada type que fica todos os types do redux do codigo

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
