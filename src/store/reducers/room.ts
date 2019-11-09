import { ConnectedRoomMap, Room } from '../../constants/Types';
import { RoomAction } from '../actions/room';
import { ADD_ROOM, REMOVE_ROOM, UPDATE_ROOM, ADD_FILE_TO_ROOM } from '../types';

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
        case UPDATE_ROOM:
            const roomIdToUpdate = action.payload;
            return {
                ...state,
                [roomIdToUpdate]: action.data,
            };
        case ADD_FILE_TO_ROOM:
            console.log('adding file to room');
            const { roomId, file } = action.payload;
            const oldRoomState = state[roomId];
            const roomWithNewFile: Room = {
                ...oldRoomState,
                files: [...oldRoomState.files, file],
            };
            return {
                ...state,
                [roomId]: roomWithNewFile,
            };
        default:
            return state;
    }
}

export default userReducer;
