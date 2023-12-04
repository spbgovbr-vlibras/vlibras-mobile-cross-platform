import { combineReducers } from 'redux';

import customization from './customization';
import dictionaryReducer from './dictionary';
import loading from './loadingAction';
import regionalism from './regionalism';
import translator from './translator';
import video from './video';

const reducers = combineReducers({
  regionalism,
  video,
  dictionaryReducer,
  translator,
  customization,
  loading,
});

export default reducers;
