/* eslint-disable no-param-reassign */
import produce, { Draft } from 'immer';
import { Reducer } from 'redux';
import { createAction, ActionType } from 'typesafe-actions';
import regionalismData from 'data/regionalism';

export const Types = {
  SET_CURRENT_CUSTOMIZATION_BODY: '@customization/SET_CURRENT_CUSTOMIZATION_BODY',
  SET_CURRENT_CUSTOMIZATION_EYE: '@customization/SET_CURRENT_CUSTOMIZATION_EYE',
  SET_CURRENT_CUSTOMIZATION_HAIR: '@customization/SET_CURRENT_CUSTOMIZATION_HAIR',
  SET_CURRENT_CUSTOMIZATION_PANTS: '@customization/SET_CURRENT_CUSTOMIZATION_PANTS',
  SET_CURRENT_CUSTOMIZATION_SHIRT: '@customization/SET_CURRENT_CUSTOMIZATION_SHIRT',

};

export interface CustomizationState {
  currentbody: string;
  currenteye: string;
  currenthair: string;
  currentpants: string;
  currentshirt: string;
}

const INITIAL_STATE: CustomizationState = {
  currentbody: " ",
  currenteye: " ",
  currenthair: " ",
  currentpants: " ",
  currentshirt: " ", 
 };
  
export const Creators = {
  setCurrentCustomizationBody: createAction(Types.SET_CURRENT_CUSTOMIZATION_BODY)<string>(),
  setCurrentCustomizationEye: createAction(Types.SET_CURRENT_CUSTOMIZATION_EYE)<string>(),
  setCurrentCustomizationHair: createAction(Types.SET_CURRENT_CUSTOMIZATION_HAIR)<string>(),
  setCurrentCustomizationPants: createAction(Types.SET_CURRENT_CUSTOMIZATION_PANTS)<string>(),
  setCurrentCustomizationShirt: createAction(Types.SET_CURRENT_CUSTOMIZATION_SHIRT)<string>(),

};

export type ActionTypes = ActionType<typeof Creators>;

const reducer: Reducer<CustomizationState, ActionTypes> = (
  state = INITIAL_STATE,
  action: ActionTypes,
) => {
  const { payload, type } = action;
  return produce(state, (draft: Draft<CustomizationState>) => {
    switch (type) {
      case Types.SET_CURRENT_CUSTOMIZATION_BODY:
        draft.currentbody = payload;
        break;
      case Types.SET_CURRENT_CUSTOMIZATION_EYE:
          draft.currenteye = payload;
          break;
      case Types.SET_CURRENT_CUSTOMIZATION_HAIR:
            draft.currenthair = payload;
            break;
      case Types.SET_CURRENT_CUSTOMIZATION_PANTS:
        draft.currentpants = payload;
        break;
      case Types.SET_CURRENT_CUSTOMIZATION_SHIRT:
          draft.currentshirt = payload;
          break;
  
      default:
        break;
    }
  });
};

export default reducer;
