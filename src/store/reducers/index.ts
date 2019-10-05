import { combineReducers } from 'redux';

import { StoreState } from '../types';
import countReducer from './count';
import rtcConnectionReducer from './rtcConnection';
import userReducer from './user';

const reducers = {
    count: countReducer,
    rtcConnections: rtcConnectionReducer,
    user: userReducer,
};

export default combineReducers<StoreState>(reducers);
