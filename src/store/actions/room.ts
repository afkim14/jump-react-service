import { Room } from '../../constants/Types';
import { ADD_ROOM, REMOVE_ROOM } from '../types';

export interface AddRoom {
    type: ADD_ROOM;
    payload: Room;
}

export interface RemoveRoom {
    type: REMOVE_ROOM;
    payload: string;
}

export type RoomAction = AddRoom | RemoveRoom;

export function addRoom(room: Room): AddRoom {
    return {
        type: ADD_ROOM,
        payload: room,
    };
}

export function removeRoom(roomid: string): RemoveRoom {
    return {
        type: REMOVE_ROOM,
        payload: roomid,
    };
}
