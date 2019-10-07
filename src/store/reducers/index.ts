import { combineReducers } from 'redux';

import { StoreState } from '../types';
import countReducer from './count';
import rtcConnectionReducer from './rtcConnection';
import userReducer from './user';
import roomReducer from './room';

const reducers = {
    count: countReducer,
    rtcConnections: rtcConnectionReducer,
    user: userReducer,
    rooms: roomReducer,
};

export default combineReducers<StoreState>(reducers);
