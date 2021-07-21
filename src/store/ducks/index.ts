import { combineReducers } from 'redux';

import dictionaryReducer from './dictionary';
import regionalism from './regionalism';

const reducers = combineReducers({ regionalism, dictionaryReducer });

export default reducers;
