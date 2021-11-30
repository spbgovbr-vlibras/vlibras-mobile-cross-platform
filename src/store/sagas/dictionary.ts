import { all, takeLatest, put } from 'redux-saga/effects';

import { getDictionary } from 'services/api';
import { Creators, ListResponseDictionary } from 'store/ducks/dictionary';

function* fetchWords(
  action: ReturnType<typeof Creators.fetchWords.request>,
): Generator<unknown, void, ListResponseDictionary> {
  try {
    const response = yield getDictionary(action.payload);
    yield put(Creators.fetchWords.success(response));
  } catch (error) {
    yield put(Creators.fetchWords.failure({}));
  }
}

export default all([takeLatest(Creators.fetchWords.request, fetchWords)]);
