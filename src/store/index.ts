import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { StateType } from 'typesafe-actions';

import reducers from './ducks';
import sagas from './sagas';

const sagaMiddleware = createSagaMiddleware({});

const store = createStore(reducers, applyMiddleware(sagaMiddleware));
sagaMiddleware.run(sagas);

export type Store = StateType<typeof store>;

export type RootState = ReturnType<typeof reducers>;

export default store;
