import { RtcConnectionAction } from '../actions/rtcConnection';

import { ADD_RTC_CONNECTION, REMOVE_RTC_CONNECTION, RTCConnection } from '../types';
import RTC from '../../lib/RTC';

const initialState = {};

function rtcConnectionReducer(state: RTCConnection = initialState, action: RtcConnectionAction): RTCConnection {
    switch (action.type) {
        case ADD_RTC_CONNECTION:
            console.log('add rtc connection');
            return {
                ...state,
                [action.payload]: new RTC(),
            };
        case REMOVE_RTC_CONNECTION:
            const { [action.payload]: value, ...connectionsToKeep } = state;
            console.log('remove rtc connection');
            return connectionsToKeep;
        default:
            return state;
    }
}

export default rtcConnectionReducer;
