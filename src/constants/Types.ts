export type CreateRoom = { size: number }; // data sent by frontend on room creation information
export type ConnectRoom = { roomid: string }; // data sent by frontend to connect to specific room
export type UserDisplayMap = { [userid: string]: UserDisplay }; // Map from userid to display name
export type UserDisplay = {
    // user information
    userid: string;
    displayName: string;
    color: string;
};

export type ConnectedRoomMap = { [userid: string]: Room };
export type Room = {
    roomid: string;
    owner: string;
    accepted: boolean;
    invited: UserDisplayMap;
};
export type RoomInvite = {
    sender: UserDisplay;
}

export type RoomStatus = {
    full: boolean;
    owner: string;
}

// RTC STUFF
export type SDP = {
    sdp: RTCSessionDescription
}

export type RTCFileRequest = {
    name: string,
    size: number
}

export type RTCFileReply = {
    accept: boolean
}