import RTC from '../services/RTC';
import { UserDisplay, ConnectedRoomMap } from '../constants/Types';

export type StoreState = {
    user: UserDisplay;
    rooms: ConnectedRoomMap;
};

export type RTCConnection = {
    [key: string]: RTC;
};

export const SET_USER = 'SET_USER';
export type SET_USER = typeof SET_USER;

export const ADD_ROOM = 'ADD_ROOM';
export type ADD_ROOM = typeof ADD_ROOM;

export const REMOVE_ROOM = 'REMOVE_ROOM';
export type REMOVE_ROOM = typeof REMOVE_ROOM;
