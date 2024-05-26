import { all, takeLatest, put } from 'redux-saga/effects';

import { getDictionary } from 'services/api';
import { fetchBundles } from 'services/regionalism';
import { Creators, ListResponseDictionary } from 'store/ducks/dictionary';

function* fetchWords(
  action: ReturnType<typeof Creators.fetchWords.request>
): Generator<unknown, void, ListResponseDictionary> {
  try {
    const response = yield getDictionary(action.payload);
    yield put(Creators.fetchWords.success(response));
  } catch (error) {
    yield put(Creators.fetchWords.failure(error));
  }
}

function* fetchRegionalistWords(
  action: ReturnType<typeof Creators.fetchRegionalismWords.request>
): Generator<unknown, void, [string]> {
  try {
    const response = yield fetchBundles(action.payload.abbrreviation);
    yield put(Creators.fetchRegionalismWords.success(
      { data: response }
    ));
  } catch (error) {
    yield put(Creators.fetchRegionalismWords.failure(error));
  }
}

export default all(
  [takeLatest(Creators.fetchWords.request, fetchWords),
    takeLatest(Creators.fetchRegionalismWords.request, fetchRegionalistWords)]
);
