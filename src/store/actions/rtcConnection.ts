import { ADD_RTC_CONNECTION, REMOVE_RTC_CONNECTION } from '../types';

export interface AddRtcConnection {
    type: ADD_RTC_CONNECTION;
    payload: string;
}

export interface RemoveRtcConnection {
    type: REMOVE_RTC_CONNECTION;
    payload: string;
}

export type RtcConnectionAction = AddRtcConnection | RemoveRtcConnection;

export function addRtcConnection(connectionId: string): AddRtcConnection {
    return {
        type: ADD_RTC_CONNECTION,
        payload: connectionId,
    };
}

export function removeRtcConnection(connectionId: string): RemoveRtcConnection {
    return {
        type: REMOVE_RTC_CONNECTION,
        payload: connectionId,
    };
}
