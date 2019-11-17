import RTC from '../services/RTC';

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

export type ConnectedUserMap = { [userid: string]: { accepted: boolean; displayName: UserDisplay } };

export type Room = {
    // Both in frontend and backend
    roomid: string;
    owner: string;
    requestSent: boolean;
    invited: ConnectedUserMap;

    // Only in frontend
    full: boolean;
    messages: Array<Message>;
    files: Array<any>;
    rtcConnection: RTC | null;
};

export type RoomInvite = {
    sender: UserDisplay;
    roomid: string;
};

export type RoomInviteResponse = {
    invitedBy: UserDisplay;
    respondedBy: UserDisplay;
    roomid: string;
};

export type RoomStatus = {
    type: string;
    roomid: string;
    invited: ConnectedUserMap;
    full: boolean;
    owner: string;
    userid: string;
};

export type Message = {
    sender: UserDisplay;
    text: string;
};

export type FileInfo = {
    id: string;
    sender: UserDisplay;
    name: string;
    size: number;
    anchorDownloadHref: string;
    anchorDownloadFileName: string;
    accepted: boolean;
    completed: boolean;
};

// RTC STUFF
export type SDP = {
    sdp: RTCSessionDescription;
    roomid: string;
};

export type IceCandidate = {
    candidate: RTCIceCandidate;
    roomid: string;
};
