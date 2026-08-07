import { NativeStorage } from '@ionic-native/native-storage';
import { all, takeLatest, put } from 'redux-saga/effects';

import { PLAYER_AVATAR_KEY_STORE, PLAYER_CUSTOMIZATION_KEY_STORE } from 'constants/keys';
import { Avatar } from 'constants/types';
import { DefaultAvatarCustomizationProperties } from 'data/AvatarCustomizationProperties';
import { AvatarCustomization, Creators, CustomizationColors } from 'store/ducks/customization';

const LEGACY_DARK_SHIRTS = new Set(['#202763', '#1c204f', '#005b38']);
const LEGACY_DARK_PANTS = new Set(['#121420', '#0e0f18', '#1f265f']);

function normalizeLegacyAvatarColors(colors: CustomizationColors): CustomizationColors {
  const shirt = colors.camisa.trim().toLowerCase();
  const pants = colors.calca.trim().toLowerCase();
  const camisa = LEGACY_DARK_SHIRTS.has(shirt)
    ? DefaultAvatarCustomizationProperties.camisa
    : colors.camisa;
  const calca = LEGACY_DARK_PANTS.has(pants)
    ? DefaultAvatarCustomizationProperties.calca
    : colors.calca;
  if (camisa === colors.camisa && calca === colors.calca) return colors;
  return { ...colors, camisa, calca };
}

function* storeCustomization(
  action: ReturnType<typeof Creators.storeCustomization.request>
): Generator<unknown, void, unknown> {
  try {
    yield NativeStorage.setItem(
      `${PLAYER_CUSTOMIZATION_KEY_STORE}_${action.payload.avatar}`,
      action.payload
    );
    yield put(Creators.storeCustomization.success({}));
  } catch (error) {
    yield put(Creators.storeCustomization.failure({}));
  }
}

function* loadCustomization(
  action: ReturnType<typeof Creators.loadCustomization.request>
): Generator<unknown, void, AvatarCustomization> {
  try {
    console.log(`[DEBUG] ${`${PLAYER_CUSTOMIZATION_KEY_STORE}_${action.payload}`}`);

    const response = yield NativeStorage.getItem(
      `${PLAYER_CUSTOMIZATION_KEY_STORE}_${action.payload}`
    );

    const stored = response as AvatarCustomization;
    const normalizedColors = normalizeLegacyAvatarColors(stored.customizationColors);
    const customization: AvatarCustomization =
      normalizedColors === stored.customizationColors
        ? stored
        : { avatar: stored.avatar, customizationColors: normalizedColors };

    if (customization !== stored) {
      yield NativeStorage.setItem(
        `${PLAYER_CUSTOMIZATION_KEY_STORE}_${action.payload}`,
        customization
      );
    }

    yield put(Creators.loadCustomization.success(customization));
    console.log(`[DEBUG] ${response}`);
  } catch (error) {
    yield put(Creators.loadCustomization.failure({}));
  }
}

function* storeAvatar(
  action: ReturnType<typeof Creators.storeAvatar.request>
): Generator<unknown, void, unknown> {
  try {
    yield NativeStorage.setItem(PLAYER_AVATAR_KEY_STORE, action.payload);
    yield put(Creators.storeAvatar.success({}));
  } catch (error) {
    yield put(Creators.storeAvatar.failure({}));
  }
}

function* loadAvatar(): Generator<unknown, void, Avatar> {
  try {
    const response = yield NativeStorage.getItem(
      PLAYER_AVATAR_KEY_STORE
    );
    yield put(Creators.loadAvatar.success(response));
  } catch (error) {
    yield put(Creators.loadAvatar.failure({}));
  }
}

export default all([
  takeLatest(Creators.storeCustomization.request, storeCustomization),
  takeLatest(Creators.loadCustomization.request, loadCustomization),
  takeLatest(Creators.storeAvatar.request, storeAvatar),
  takeLatest(Creators.loadAvatar.request, loadAvatar),
]);
