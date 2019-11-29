import { Room, UserDisplay, FileInfo, Message } from '../../constants/Types';
import {
    ADD_ROOM,
    REMOVE_ROOM,
    UPDATE_ROOM,
    ADD_FILE_TO_ROOM,
    SEND_FILE,
    RECEIVED_FILE,
    RECEIVE_MESSAGE,
} from '../types';

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

export interface AddFileToRoom {
    type: ADD_FILE_TO_ROOM;
    payload: AddFileToRoomPayload;
}

// TODO: update name to `SendFiles` after implementing sending multiple files
export interface SendFile {
    type: SEND_FILE;
    payload: SendFilePayload;
}

export interface ReceivedFile {
    type: RECEIVED_FILE;
    payload: ReceivedFilePayload;
}

export interface ReceiveMessage {
    type: RECEIVE_MESSAGE;
    payload: ReceiveMessagePayload;
}

interface AddFileToRoomPayload {
    file: File;
    roomId: string;
}

interface SendFilePayload {
    roomId: string;
    sender: UserDisplay;
}

interface ReceivedFilePayload {
    roomId: string;
    fileAnchorDownloadHref: string;
    fileName: string;
}

export interface ReceiveMessagePayload {
    roomId: string;
    message: Message;
}

export type RoomAction = AddRoom | RemoveRoom | UpdateRoom | AddFileToRoom | SendFile | ReceivedFile | ReceiveMessage;

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
        data: room,
    };
}

export function addFileToRoom(roomId: string, file: File): AddFileToRoom {
    return {
        type: ADD_FILE_TO_ROOM,
        payload: {
            roomId,
            file,
        },
    };
}

export function SendFile(roomId: string, sender: UserDisplay): SendFile {
    return {
        type: SEND_FILE,
        payload: {
            roomId,
            sender,
        },
    };
}

export function ReceivedFile(roomId: string, fileAnchorDownloadHref: string, fileName: string): ReceivedFile {
    return {
        type: RECEIVED_FILE,
        payload: {
            roomId,
            fileAnchorDownloadHref,
            fileName,
        },
    };
}

export function ReceiveMessage(roomId: string, message: Message): ReceiveMessage {
    return {
        type: RECEIVE_MESSAGE,
        payload: {
            roomId,
            message,
        },
    };
}
