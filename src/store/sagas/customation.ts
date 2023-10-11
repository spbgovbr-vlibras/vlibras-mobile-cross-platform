import { NativeStorage } from '@ionic-native/native-storage';
import { all, takeLatest, put } from 'redux-saga/effects';

import { PLAYER_AVATAR_KEY_STORE, PLAYER_CUSTOMIZATION_KEY_STORE } from 'constants/keys';
import { Avatar } from 'constants/types';
import { Creators, CustomizationColors } from 'store/ducks/customization';

function* storeCustomization(
  action: ReturnType<typeof Creators.storeCustomization.request>
): Generator<unknown, void, unknown> {
  try {
    yield NativeStorage.setItem(PLAYER_CUSTOMIZATION_KEY_STORE, action.payload);
    yield put(Creators.storeCustomization.success({}));
  } catch (error) {
    yield put(Creators.storeCustomization.failure({}));
  }
}

function* loadCustomization(): Generator<unknown, void, CustomizationColors> {
  try {
    const response = yield NativeStorage.getItem(
      PLAYER_CUSTOMIZATION_KEY_STORE
    );
    yield put(Creators.loadCustomization.success(response));
  } catch (error) {
    yield put(Creators.loadCustomization.failure({}));
  }
}

function* storeAvatar(
  action: ReturnType<typeof Creators.storeAvatar.request>
): Generator<unknown, void, unknown> {
  try {
    yield NativeStorage.setItem(PLAYER_AVATAR_KEY_STORE, action.payload)
    yield put(Creators.storeAvatar.success({}))
  } catch (error) {
    yield put(Creators.storeAvatar.failure({}))
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
