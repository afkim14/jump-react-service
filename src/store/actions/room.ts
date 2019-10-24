import { Room } from '../../constants/Types';
import { ADD_ROOM, REMOVE_ROOM, UPDATE_ROOM } from '../types';

export interface AddRoom {
    type: ADD_ROOM;
    payload: Room;
}

export interface RemoveRoom {
    type: REMOVE_ROOM;
    payload: string;
}

export interface UpdateRoom {
    type: UPDATE_ROOM;
    payload: string;
    data: Room;
}

export type RoomAction = AddRoom | RemoveRoom | UpdateRoom;

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

export function updateRoom(roomid: string, room: Room): UpdateRoom {
    return {
        type: UPDATE_ROOM,
        payload: roomid,
        data: room
    }
}