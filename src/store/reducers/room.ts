import { ConnectedRoomMap, Room, ReceivedFile } from '../../constants/Types';
import { RoomAction } from '../actions/room';
import {
    ADD_ROOM,
    REMOVE_ROOM,
    UPDATE_ROOM,
    ADD_FILE_TO_ROOM,
    SEND_FILE,
    RECEIVED_FILE,
    RECEIVE_MESSAGE,
} from '../types';
import RTC from '../../services/RTC';
import socket from '../../constants/socket-context';

import { SEND_FILE_REQUEST } from '../../constants/Constants';

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
            const { roomId, file } = action.payload;
            const oldRoomState = state[roomId];

            // TODO: support adding multiple files
            if (oldRoomState.files.length > 0) {
                return state;
            }

            const roomWithNewFile: Room = {
                ...oldRoomState,
                files: [...oldRoomState.files, file],
            };
            return {
                ...state,
                [roomId]: roomWithNewFile,
            };
        case SEND_FILE:
            const room = state[action.payload.roomId];
            const roomRTCConnection = room.rtcConnection;
            const fileReader = getFileReader();
            let progress = 0;
            const chunksize = 16384;
            const fileToSend = room.files.length > 0 ? room.files[0] : null;

            if (!roomRTCConnection || !fileToSend) return state;

            socket.emit(SEND_FILE_REQUEST, {
                roomid: room.roomid,
                fileName: room.files[0].name,
                fileSize: room.files[0].size,
                sender: action.payload.sender,
            });

            const readFileSlice = (progressOffset: number) => {
                const slice = fileToSend.slice(progress, progressOffset + chunksize);
                return fileReader.readAsArrayBuffer(slice);
            };

            const handleFileReaderLoadEvent = (event: ProgressEvent) => {
                const result = fileReader.result as ArrayBuffer;
                ((roomRTCConnection as RTC).sendChannel as RTCDataChannel).send(result);
                progress += result.byteLength;
                if (progress < fileToSend.size) {
                    readFileSlice(progress);
                }
            };

            fileReader.onload = handleFileReaderLoadEvent;
            readFileSlice(0);

            return state;

        case RECEIVED_FILE:
            const roomWithReceivedFile = state[action.payload.roomId];
            const receivedFile: ReceivedFile = {
                anchorDownloadHref: action.payload.fileAnchorDownloadHref,
                fileName: action.payload.fileName,
            };
            return {
                [action.payload.roomId]: {
                    ...roomWithReceivedFile,
                    receivedFiles: [...roomWithReceivedFile.receivedFiles, receivedFile],
                },
            };

        case RECEIVE_MESSAGE:
            const roomWithNewMessage = state[action.payload.roomId];
            const newMessage = action.payload.message;
            return {
                [action.payload.roomId]: {
                    ...roomWithNewMessage,
                    messages: [...roomWithNewMessage.messages, newMessage],
                },
            };

        default:
            return state;
    }
}

function getFileReader(): FileReader {
    const fileReader = new FileReader();
    fileReader.onerror = error => console.error('Error reading file:', error);
    fileReader.onabort = event => console.log('File reading aborted:', event);
    return fileReader;
}

export default userReducer;
