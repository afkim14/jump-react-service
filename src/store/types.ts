import RTC from '../lib/RTC';

export type StoreState = {
    count: number;
    // rtcConnections: RTCConnections;
};

export type RTCConnection = {
    [key: string]: RTC;
};

export const INCREMENT_COUNT = 'INCREMENT_COUNT';
export type INCREMENT_COUNT = typeof INCREMENT_COUNT;

export const DECREMENT_COUNT = 'DECREMENT_COUNT';
export type DECREMENT_COUNT = typeof DECREMENT_COUNT;

export const ADD_RTC_CONNECTION = 'ADD_RTC_CONNECTION';
export type ADD_RTC_CONNECTION = typeof ADD_RTC_CONNECTION;

export const REMOVE_RTC_CONNECTION = 'REMOVE_RTC_CONNECTION';
export type REMOVE_RTC_CONNECTION = typeof REMOVE_RTC_CONNECTION;