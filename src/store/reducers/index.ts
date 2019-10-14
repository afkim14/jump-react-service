import { combineReducers } from 'redux';

import { StoreState } from '../types';
import userReducer from './user';
import roomReducer from './room';

const reducers = {
    user: userReducer,
    rooms: roomReducer,
};

export default combineReducers<StoreState>(reducers);
