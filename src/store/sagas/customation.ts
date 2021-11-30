import { NativeStorage } from '@ionic-native/native-storage';
import { all, takeLatest, put } from 'redux-saga/effects';

import { PLAYER_CUSTOMIZATION_KEY_STORE } from 'constants/keys';
import { Creators, CustomizationColors } from 'store/ducks/customization';

function* storeCustomization(
  action: ReturnType<typeof Creators.storeCustomization.request>,
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
      PLAYER_CUSTOMIZATION_KEY_STORE,
    );
    yield put(Creators.loadCustomization.success(response));
  } catch (error) {
    yield put(Creators.loadCustomization.failure({}));
  }
}

export default all([
  takeLatest(Creators.storeCustomization.request, storeCustomization),
  takeLatest(Creators.loadCustomization.request, loadCustomization),
]);
