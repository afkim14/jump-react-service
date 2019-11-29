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

export const UPDATE_ROOM = 'UPDATE_ROOM';
export type UPDATE_ROOM = typeof UPDATE_ROOM;

export const ADD_FILE_TO_ROOM = 'ADD_FILE_TO_ROOM';
export type ADD_FILE_TO_ROOM = typeof ADD_FILE_TO_ROOM;

// TODO: update name to `SEND_FILES` after implementing sending multiple files
export const SEND_FILE = 'SEND_FILE';
export type SEND_FILE = typeof SEND_FILE;

export const RECEIVED_FILE = 'RECEIVED_FILE';
export type RECEIVED_FILE = typeof RECEIVED_FILE;

export const RECEIVE_MESSAGE = 'RECEIVE_MESSAGE';
export type RECEIVE_MESSAGE = typeof RECEIVE_MESSAGE;
