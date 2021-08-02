import { combineReducers } from 'redux';

import dictionaryReducer from './dictionary';
import regionalism from './regionalism';
import video from './video';

const reducers = combineReducers({ regionalism, video, dictionaryReducer });

export default reducers;
