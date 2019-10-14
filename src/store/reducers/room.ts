import { ConnectedRoomMap } from '../../constants/Types';
import { RoomAction } from '../actions/room';
import { ADD_ROOM, REMOVE_ROOM } from '../types';

const initialState: ConnectedRoomMap = {};

function userReducer(state: ConnectedRoomMap = initialState, action: RoomAction): ConnectedRoomMap {
    switch (action.type) {
        case ADD_ROOM:
            return {
                ...state,
                [action.payload.roomid]: action.payload,
            };
        case REMOVE_ROOM:
            const roomIdToRemove = action.payload;
            const { [roomIdToRemove]: roomToRemove, ...roomsToKeep } = state;
            return roomsToKeep;
        default:
            return state;
    }
}

export default userReducer;
