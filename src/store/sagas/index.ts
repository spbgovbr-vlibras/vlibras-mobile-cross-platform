import { all } from 'redux-saga/effects';

import customation from './customation';
import dictionary from './dictionary';

export default function* rootSaga() {
  yield all([dictionary, customation]);
}
