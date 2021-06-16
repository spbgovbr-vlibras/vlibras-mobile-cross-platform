import { createStore } from 'redux';
import { StateType } from 'typesafe-actions';

import reducers from './ducks';

const store = createStore(reducers);

export type Store = StateType<typeof store>;

export type RootState = ReturnType<typeof reducers>;

export default store;
