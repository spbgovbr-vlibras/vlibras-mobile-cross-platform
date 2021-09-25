/* eslint-disable no-case-declarations */
/* eslint-disable no-param-reassign */
import produce, { Draft } from 'immer';
import { Reducer } from 'redux';
import { createAction, ActionType, createAsyncAction } from 'typesafe-actions';

export const Types = {
  SET_CURRENT_CUSTOMIZATION_BODY:
    '@customization/SET_CURRENT_CUSTOMIZATION_BODY',
  SET_CURRENT_CUSTOMIZATION_EYE: '@customization/SET_CURRENT_CUSTOMIZATION_EYE',
  SET_CURRENT_CUSTOMIZATION_HAIR:
    '@customization/SET_CURRENT_CUSTOMIZATION_HAIR',
  SET_CURRENT_CUSTOMIZATION_PANTS:
    '@customization/SET_CURRENT_CUSTOMIZATION_PANTS',
  SET_CURRENT_CUSTOMIZATION_SHIRT:
    '@customization/SET_CURRENT_CUSTOMIZATION_SHIRT',
  LOAD_CUSTOMIZATION_REQUEST: '@customization/LOAD_CUSTOMIZATION_REQUEST',
  LOAD_CUSTOMIZATION_SUCCESS: '@customization/LOAD_CUSTOMIZATION_SUCCESS',
  LOAD_CUSTOMIZATION_FAILURE: '@customization/LOAD_CUSTOMIZATION_FAILURE',
  STORE_CUSTOMIZATION_REQUEST: '@customization/STORE_CUSTOMIZATION_REQUEST',
  STORE_CUSTOMIZATION_SUCCESS: '@customization/STORE_CUSTOMIZATION_SUCCESS',
  STORE_CUSTOMIZATION_FAILURE: '@customization/STORE_CUSTOMIZATION_FAILURE',
};

export interface CustomizationState {
  currentbody: string;
  currenteye: string;
  currenthair: string;
  currentpants: string;
  currentshirt: string;
}
const INITIAL_STATE: CustomizationState = {
  currentbody: '#f3a78f',
  currenteye: '#000000',
  currenthair: '#000000',
  currentpants: '#121420',
  currentshirt: '#202763',
};

export type CustomizationColors = {
  corpo: string;
  olhos: string;
  cabelo: string;
  camisa: string;
  calca: string;
  iris: string;
  pos: 'center';
};

export const Creators = {
  setCurrentCustomizationBody: createAction(
    Types.SET_CURRENT_CUSTOMIZATION_BODY,
  )<string>(),
  setCurrentCustomizationEye: createAction(
    Types.SET_CURRENT_CUSTOMIZATION_EYE,
  )<string>(),
  setCurrentCustomizationHair: createAction(
    Types.SET_CURRENT_CUSTOMIZATION_HAIR,
  )<string>(),
  setCurrentCustomizationPants: createAction(
    Types.SET_CURRENT_CUSTOMIZATION_PANTS,
  )<string>(),
  setCurrentCustomizationShirt: createAction(
    Types.SET_CURRENT_CUSTOMIZATION_SHIRT,
  )<string>(),
  storeCustomization: createAsyncAction(
    Types.STORE_CUSTOMIZATION_REQUEST,
    Types.STORE_CUSTOMIZATION_SUCCESS,
    Types.STORE_CUSTOMIZATION_FAILURE,
  )<CustomizationColors, unknown, unknown>(),
  loadCustomization: createAsyncAction(
    Types.LOAD_CUSTOMIZATION_REQUEST,
    Types.LOAD_CUSTOMIZATION_SUCCESS,
    Types.LOAD_CUSTOMIZATION_FAILURE,
  )<unknown, CustomizationColors, unknown>(),
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
      case Types.LOAD_CUSTOMIZATION_SUCCESS:
        const colors = payload as CustomizationColors;
        draft.currentbody = colors.corpo;
        draft.currenteye = colors.iris;
        draft.currenthair = colors.cabelo;
        draft.currentpants = colors.calca;
        draft.currentshirt = colors.camisa;
        break;
      default:
        break;
    }
  });
};

export default reducer;
