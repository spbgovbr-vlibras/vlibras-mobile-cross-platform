import { combineReducers } from 'redux';

import dictionaryReducer from './dictionary';
import regionalism from './regionalism';
import video from './video';
import translator from './translator';

const reducers = combineReducers({ regionalism, video, dictionaryReducer, translator });

export default reducers;
