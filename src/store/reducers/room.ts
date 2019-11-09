import { ConnectedRoomMap, Room } from '../../constants/Types';
import { RoomAction } from '../actions/room';
import { ADD_ROOM, REMOVE_ROOM, UPDATE_ROOM, ADD_FILE_TO_ROOM, SEND_FILE } from '../types';
import RTC from '../../services/RTC';

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
            console.log('starting send file');
            const room = state[action.payload];
            const roomRTCConnection = room.rtcConnection;
            const fileReader = getFileReader();
            let progress = 0;
            const chunksize = 16384;
            const fileToSend = room.files.length > 0 ? room.files[0] : null;

            if (!roomRTCConnection || !fileToSend) return state;

            const readFileSlice = (progressOffset: number) => {
                const slice = fileToSend.slice(progress, progressOffset + chunksize);
                return fileReader.readAsArrayBuffer(slice);
            };

            const handleFileReaderLoadEvent = (event: ProgressEvent) => {
                const result = fileReader.result as ArrayBuffer;
                ((roomRTCConnection as RTC).sendChannel as RTCDataChannel).send(result);
                progress += result.byteLength;
                console.log(progress, fileToSend.size);
                if (progress < fileToSend.size) {
                    readFileSlice(progress);
                }
            };

            fileReader.onload = handleFileReaderLoadEvent;
            readFileSlice(0);

            console.log('made it to end of send file');
            return state;

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
