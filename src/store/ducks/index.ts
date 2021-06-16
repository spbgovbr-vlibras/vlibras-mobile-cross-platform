import { combineReducers } from 'redux';

import regionalism from './regionalism';
import video from './video';

const reducers = combineReducers({ regionalism, video });

export default reducers;
