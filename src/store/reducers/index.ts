import { combineReducers } from 'redux';

import { StoreState } from '../types';
import countReducer from './count';

const reducers = {
    count: countReducer,
};

export default combineReducers<StoreState>(reducers);
