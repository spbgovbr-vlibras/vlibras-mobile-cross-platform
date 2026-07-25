import produce, { Draft } from 'immer';
import { Reducer } from 'redux';
import { createAction, ActionType } from 'typesafe-actions';

export type PlayerCanvasMode = 'home' | 'dict-mini' | 'hidden';

export interface CanvasDockRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface PlayerCanvasState {
  mode: PlayerCanvasMode;
  dockRect: CanvasDockRect | null;
}

const INITIAL_STATE: PlayerCanvasState = { mode: 'hidden', dockRect: null };

export const Types = {
  SET_MODE: '@playerCanvas/SET_MODE',
  SET_DOCK_RECT: '@playerCanvas/SET_DOCK_RECT',
} as const;

export const Creators = {
  setMode: createAction(Types.SET_MODE)<PlayerCanvasMode>(),
  setDockRect: createAction(Types.SET_DOCK_RECT)<CanvasDockRect | null>(),
};

export type ActionTypes = ActionType<typeof Creators>;

const reducer: Reducer<PlayerCanvasState, ActionTypes> = (
  state = INITIAL_STATE,
  action: ActionTypes
) => {
  return produce(state, (draft: Draft<PlayerCanvasState>) => {
    if (action.type === Types.SET_MODE) {
      draft.mode = action.payload;
      if (action.payload !== 'dict-mini' && action.payload !== 'home') {
        draft.dockRect = null;
      }
      return;
    }
    if (action.type === Types.SET_DOCK_RECT) {
      draft.dockRect = action.payload;
    }
  });
};

export default reducer;
