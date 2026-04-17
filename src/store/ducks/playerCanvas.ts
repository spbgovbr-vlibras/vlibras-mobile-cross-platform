import produce, { Draft } from 'immer';
import { Reducer } from 'redux';
import { createAction, ActionType } from 'typesafe-actions';

export type PlayerCanvasMode = 'home' | 'dict-mini' | 'hidden';

export interface PlayerCanvasState {
  mode: PlayerCanvasMode;
}

const INITIAL_STATE: PlayerCanvasState = { mode: 'hidden' };

export const Types = {
  SET_MODE: '@playerCanvas/SET_MODE',
};

export const Creators = {
  setMode: createAction(Types.SET_MODE)<PlayerCanvasMode>(),
};

export type ActionTypes = ActionType<typeof Creators>;

const reducer: Reducer<PlayerCanvasState, ActionTypes> = (
  state = INITIAL_STATE,
  action
) => {
  return produce(state, (draft: Draft<PlayerCanvasState>) => {
    switch (action.type) {
      case Types.SET_MODE:
        draft.mode = action.payload;
        break;
    }
  });
};

export default reducer;
