import { all } from 'redux-saga/effects';

import dictionary from './dictionary';

export default function* rootSaga() {
  yield all([dictionary]);
}
