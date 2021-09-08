import { combineReducers } from 'redux';

import dictionaryReducer from './dictionary';
import regionalism from './regionalism';
import video from './video';
import customization from './customization';

const reducers = combineReducers({ regionalism, video, dictionaryReducer, customization });

export default reducers;
