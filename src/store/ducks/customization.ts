/* eslint-disable no-case-declarations */
/* eslint-disable no-param-reassign */
import produce, { Draft } from 'immer';
import { Reducer } from 'redux';
import { createAction, ActionType, createAsyncAction } from 'typesafe-actions';

import { Avatar } from 'constants/types';

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

export const AvatarType = {
  SET_CURRENT_AVATAR:
    '@avatar/SET_CURRENT_AVATAR',
  LOAD_CURRENT_AVATAR_REQUEST: '@avatar/LOAD_CURRENT_AVATAR_REQUEST',
  LOAD_CURRENT_AVATAR_SUCCESS: '@avatar/LOAD_AVATAR_SUCCESS',
  LOAD_CURRENT_AVATAR_FAILURE: '@avatar/LOAD_AVATAR_FAILURE',
  STORE_CURRENT_AVATAR_REQUEST: '@avatar/STORE_AVATAR_REQUEST',
  STORE_CURRENT_AVATAR_SUCCESS: '@avatar/STORE_AVATAR_SUCCESS',
  STORE_CURRENT_AVATAR_FAILURE: '@avatar/STORE_AVATAR_FAILURE',
};
export interface CustomizationState {
  currentbody: string;
  currenteye: string;
  currenthair: string;
  currentpants: string;
  currentshirt: string;
  currentavatar: Avatar;
}
const INITIAL_STATE: CustomizationState = {
  currentbody: '#b87d6c',
  currenteye: '#000000',
  currenthair: '#000000',
  currentpants: '#121420',
  currentshirt: '#202763',
  currentavatar: 'icaro'
};

export type CustomizationColors = {
  corpo: string;
  cabelo: string;
  camisa: string;
  calca: string;
  iris: string;
};

export type AvatarCustomization = {
  customizationColors: CustomizationColors;
  avatar: Avatar;
}

export const Creators = {
  setCurrentCustomizationBody: createAction(
    Types.SET_CURRENT_CUSTOMIZATION_BODY
  )<string>(),
  setCurrentCustomizationEye: createAction(
    Types.SET_CURRENT_CUSTOMIZATION_EYE
  )<string>(),
  setCurrentCustomizationHair: createAction(
    Types.SET_CURRENT_CUSTOMIZATION_HAIR
  )<string>(),
  setCurrentCustomizationPants: createAction(
    Types.SET_CURRENT_CUSTOMIZATION_PANTS
  )<string>(),
  setCurrentCustomizationShirt: createAction(
    Types.SET_CURRENT_CUSTOMIZATION_SHIRT
  )<string>(),
  storeCustomization: createAsyncAction(
    Types.STORE_CUSTOMIZATION_REQUEST,
    Types.STORE_CUSTOMIZATION_SUCCESS,
    Types.STORE_CUSTOMIZATION_FAILURE
  )<AvatarCustomization, unknown, unknown>(),
  loadCustomization: createAsyncAction(
    Types.LOAD_CUSTOMIZATION_REQUEST,
    Types.LOAD_CUSTOMIZATION_SUCCESS,
    Types.LOAD_CUSTOMIZATION_FAILURE
  )<Avatar, AvatarCustomization, unknown>(),
  storeAvatar: createAsyncAction(
    AvatarType.STORE_CURRENT_AVATAR_REQUEST,
    AvatarType.STORE_CURRENT_AVATAR_SUCCESS,
    AvatarType.STORE_CURRENT_AVATAR_FAILURE
  )<Avatar, unknown, unknown>(),
  loadAvatar: createAsyncAction(
    AvatarType.LOAD_CURRENT_AVATAR_REQUEST,
    AvatarType.LOAD_CURRENT_AVATAR_SUCCESS,
    AvatarType.LOAD_CURRENT_AVATAR_FAILURE
  )<void, Avatar, unknown>(),
};

export type ActionTypes = ActionType<typeof Creators>;

const reducer: Reducer<CustomizationState, ActionTypes> = (
  state = INITIAL_STATE,
  action: ActionTypes
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
    case AvatarType.STORE_CURRENT_AVATAR_REQUEST:
      draft.currentavatar = payload;
      break;
    case AvatarType.LOAD_CURRENT_AVATAR_SUCCESS:
      draft.currentavatar = payload;
      break;
    case Types.LOAD_CUSTOMIZATION_SUCCESS:
      const customization = payload as AvatarCustomization;
      draft.currentbody = customization.customizationColors.corpo;
      draft.currenteye = customization.customizationColors.iris;
      draft.currenthair = customization.customizationColors.cabelo;
      draft.currentpants = customization.customizationColors.calca;
      draft.currentshirt = customization.customizationColors.camisa;
      break;
    case Types.LOAD_CUSTOMIZATION_FAILURE:
      draft.currentbody = INITIAL_STATE.currentbody;
      draft.currenteye = INITIAL_STATE.currenteye;
      draft.currenthair = INITIAL_STATE.currenthair;
      draft.currentpants = INITIAL_STATE.currentpants;
      draft.currentshirt = INITIAL_STATE.currentshirt;
      break;
    default:
      break;
    }
  });
};

export default reducer;
