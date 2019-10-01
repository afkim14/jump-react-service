import { combineReducers } from 'redux';

import { StoreState } from '../types';
import countReducer from './count';
import rtcConnectionReducer from './rtcConnection';

const reducers = {
    count: countReducer,
    rtcConnections: rtcConnectionReducer,
};

export default combineReducers<StoreState>(reducers);
