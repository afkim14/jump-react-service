import RTC from '../services/RTC';

export type CreateRoom = { size: number }; // data sent by frontend on room creation information
export type ConnectRoom = { roomId: string }; // data sent by frontend to connect to specific room
export type UserDisplayMap = { [userId: string]: UserDisplay }; // Map from userid to display name
export type UserDisplay = {
    // user information
    userId: string;
    displayName: string;
    color: string;
};

export type ConnectedRoomMap = { [userId: string]: Room };

export type ConnectedUserMap = { [userId: string]: { accepted: boolean; displayName: UserDisplay } };

export type Room = {
    // Both in frontend and backend
    roomId: string;
    owner: string;
    requestSent: boolean;
    invited: ConnectedUserMap;

    // Only in frontend
    full: boolean;
    messages: Array<Message>;
    files: Array<any>;
    rtcConnection: RTC | null;
    receivedFiles: Array<ReceivedFile>;
};

export type RoomInvite = {
    sender: UserDisplay;
    roomId: string;
};

export type RoomInviteResponse = {
    invitedBy: UserDisplay;
    respondedBy: UserDisplay;
    roomId: string;
};

export type RoomStatus = {
    type: string;
    roomId: string;
    invited: ConnectedUserMap;
    full: boolean;
    owner: string;
    userId: string;
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

export type ReceivedFile = {
    fileName: string;
    anchorDownloadHref: string;
};

// RTC STUFF
export type SDP = {
    sdp: RTCSessionDescription;
    roomId: string;
};

export type IceCandidate = {
    candidate: RTCIceCandidate;
    roomId: string;
};
