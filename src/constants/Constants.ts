export default {
    // PORTS
    SERVER_HOST: 'http://localhost',
    SERVER_PORT: 8000,

    // USER AUTH STATES
    LOGIN: 'LOGIN',
    SIGN_UP: 'SIGN_UP',

    // SOCKET MESSAGES
    GET_DISPLAY_NAME: 'GET_DISPLAY_NAME',
    DISPLAY_NAME: 'DISPLAY_NAME',
    GET_USERS: 'GET_USERS',
    USERS: 'USERS',
    CREATE_ROOM: 'CREATE_ROOM',
    CREATE_ROOM_SUCCESS: 'CREATE_ROOM_SUCCESS',
    CONNECT_TO_ROOM: 'CONNECT_TO_ROOM',
    CONNECT_TO_ROOM_FAIL: 'CONNECT_TO_ROOM_FAIL',
    USERS_CONNECTED: 'USERS_CONNECTED',
    ROOM_STATUS: 'ROOM_STATUS',

    // RTC SOCKET MESSAGES
    ICE_CANDIDATE: 'ICE_CANDIDATE',
    RTC_DESCRIPTION_OFFER: 'RTC_DESCRIPTION_OFFER',
    RTC_DESCRIPTION_ANSWER: 'RTC_DESCRIPTION_ANSWER',

    // FILE TRANSFER RTC SOCKET MESSAGES
    FILE_TRANSFER_REQUEST: 'FILE_INFO_REQUEST',
    FILE_TRANSFER_REPLY: 'FILE_TRANSFER_REPLY',
};
