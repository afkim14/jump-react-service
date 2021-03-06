import React, { Component } from 'react';
import socket from '../constants/socket-context';
import {
    LOGIN,
    DISPLAY_NAME,
    USERS,
    SEARCH_USERS,
    CREATE_ROOM,
    CREATE_ROOM_SUCCESS,
    SEND_ROOM_INVITES,
    ROOM_STATUS,
    FILE_ACCEPT,
    FILE_REJECT,
    USER_CONNECT,
    LEAVE_ROOM,
    ACCEPT_TRANSFER_REQUEST,
    REJECT_TRANSFER_REQUEST,
} from '../constants/Constants';
import * as Types from '../constants/Types';

import LeftTabBar from '../components/LeftTabBar';
import TransferRequest from '../components/TransferRequest';
import Room from './Room';
import MainWelcome from '../components/MainWelcome';
import RoomAwaiting from '../components/RoomAwaiting';
import RoomConnect from '../components/RoomConnect';
import RTC from '../services/RTC';

type MainHomeProps = {
    user: Types.UserDisplay;
    setUser: (user: Types.UserDisplay) => void;
    rooms: Types.ConnectedRoomMap;
    addRoom: (room: Types.Room) => void;
    removeRoom: (roomId: string) => void;
    updateRoom: (roomId: string, room: Types.Room) => void;
};

type MainHomeState = {
    creatingRoom: null | Types.Room;
    currentRoomId: string;
    users: Types.UserDisplayMap;
    searchResults: Types.UserDisplay[];
    roomInvite: Types.RoomInvite;
};

const emptyRoomInvite = {
    sender: { userId: '', displayName: '', color: '' },
    roomId: '',
};

export default class MainHome extends Component<MainHomeProps, MainHomeState> {
    state: MainHomeState = {
        creatingRoom: null,
        currentRoomId: '',
        users: {},
        searchResults: [],
        roomInvite: emptyRoomInvite,
    };

    componentDidMount(): void {
        // Get random username and a list of connected users
        socket.emit(LOGIN);

        socket.on(DISPLAY_NAME, (displayName: Types.UserDisplay) => {
            this.props.setUser(displayName);
        });

        socket.on(USERS, (users: Types.UserDisplayMap) => {
            this.setState({ users, searchResults: Object.values(users) });
        });

        socket.on(SEARCH_USERS, (searchResults: Types.UserDisplay[]) => {
            this.setState({ searchResults });
        });

        socket.on(CREATE_ROOM_SUCCESS, (roomInfo: Types.ConnectRoom) => {
            // Update with roomid given by server and open room
            if (this.state.creatingRoom) {
                const updatedRoom = this.state.creatingRoom;
                updatedRoom.roomId = roomInfo.roomId;
                updatedRoom.rtcConnection = new RTC(roomInfo.roomId);
                this.props.addRoom(updatedRoom);
                this.setState({ creatingRoom: null, currentRoomId: updatedRoom.roomId });
            }
        });

        socket.on(SEND_ROOM_INVITES, (invite: Types.RoomInvite) => {
            this.setState({ roomInvite: invite });
        });

        socket.on(LEAVE_ROOM, ( roomId: string ) => {
            this.props.removeRoom(roomId);
            if (this.state.currentRoomId === roomId) {
                this.setState({ currentRoomId: '' });
            }
        });

        socket.on(ROOM_STATUS, (data: Types.RoomStatus) => {
            const updatedRoom = this.props.rooms[data.roomId];
            if (updatedRoom) {
                // Users connected to the room already
                updatedRoom.invited[data.userId].accepted = data.type === USER_CONNECT;
                updatedRoom.full = data.full;
                this.props.updateRoom(updatedRoom.roomId, updatedRoom);
            } else {
                // New users who just accepted a room invite
                const newCurrentRoom = {
                    roomId: data.roomId,
                    owner: data.owner,
                    requestSent: true,
                    invited: data.invited,
                    full: data.full,
                    messages: [],
                    files: [],
                    rtcConnection: new RTC(data.roomId),
                    receivedFiles: [],
                };

                this.props.addRoom(newCurrentRoom);
                this.setState({
                    currentRoomId: newCurrentRoom.roomId,
                    roomInvite: emptyRoomInvite,
                });
            }
        });

        // TODO: MAYBE PUT THIS IN FILE TRANSFER
        socket.on(FILE_ACCEPT, (data: { roomId: string; fileId: string }) => {
            const updatedRoom = this.props.rooms[data.roomId];
            updatedRoom.files.forEach((f: Types.FileInfo) => {
                if (f.id === data.fileId) {
                    f.accepted = true;
                    this.props.updateRoom(updatedRoom.roomId, updatedRoom);
                }
            });
        });

        // TODO: MAYBE PUT THIS IN FILE TRANSFER
        socket.on(FILE_REJECT, (data: { roomId: string; fileId: string }) => {
            const updatedRoom = this.props.rooms[data.roomId];
            updatedRoom.files.forEach((f: Types.FileInfo) => {
                if (f.id === data.fileId) {
                    f.accepted = false;
                    this.props.updateRoom(updatedRoom.roomId, updatedRoom);
                }
            });
        });
    }

    componentWillUnmount(): void {
        // IMPORTANT!: Have to close socket to trigger disconnect message on backend.
        socket.close();
    }

    /**
     * Returns search result from trie
     */
    updateSearchResults = (search: string): void => {
        search === ''
            ? this.setState({ searchResults: Object.values(this.state.users) })
            : socket.emit(SEARCH_USERS, search);
    };

    /**
     * Called when a user is clicked
     */
    selectUser = (displayName: Types.UserDisplay): void => {
        // If already an open room, just open it up
        const roomsIds = Object.keys(this.props.rooms);
        for (let i = 0; i < roomsIds.length; i++) {
            if (this.props.rooms[roomsIds[i]].invited[displayName.userId]) {
                this.setState({ currentRoomId: roomsIds[i] });
                return;
            }
        }

        // Create new room
        const newRoom = {
            roomId: '',
            owner: this.props.user.userId,
            requestSent: false,
            invited: {
                [this.props.user.userId]: {
                    accepted: true,
                    displayName: this.props.user,
                },
                [displayName.userId]: {
                    accepted: false,
                    displayName: displayName,
                },
            },
            full: false,
            messages: [],
            files: [],
            rtcConnection: null,
            receivedFiles: [],
        };

        socket.emit(CREATE_ROOM, { invited: newRoom.invited });
        this.setState({ creatingRoom: newRoom });

        // Remove any rooms that were open but request wasn't sent
        Object.keys(this.props.rooms).forEach((roomId: string) => {
            if (!this.props.rooms[roomId].requestSent) {
                // TODO: properly close RTC connection
                delete this.props.rooms[roomId];
            }
        });
    };

    leaveRoom = (roomId: string): void => {
        this.props.removeRoom(roomId);
        socket.emit(LEAVE_ROOM, { roomId });
    };

    /**
     * Sends room invites to invited users in the room.
     */
    sendRequests = (): void => {
        const updatedRoom = this.props.rooms[this.state.currentRoomId];
        updatedRoom.requestSent = true;
        socket.emit(SEND_ROOM_INVITES, { roomId: updatedRoom.roomId });
        this.props.updateRoom(updatedRoom.roomId, updatedRoom);
    };

    /**
     * Accepts incoming transfer request
     */
    acceptRequest = (): void => {
        socket.emit(ACCEPT_TRANSFER_REQUEST, {
            invitedBy: this.state.roomInvite.sender,
            respondedBy: this.props.user,
            roomId: this.state.roomInvite.roomId,
        });
    };

    /**
     * Declines incoming transfer request
     */
    declineRequest = (): void => {
        socket.emit(REJECT_TRANSFER_REQUEST, {
            invitedBy: this.state.roomInvite.sender,
            respondedBy: this.props.user,
            roomId: this.state.roomInvite.roomId,
        });
        this.setState({ roomInvite: emptyRoomInvite });
    };

    render(): React.ReactNode {
        const currentRoom = this.props.rooms[this.state.currentRoomId];
        const mainWelcomeHtml = <MainWelcome userDisplay={this.props.user} />;
        const roomConnectHtml = (
            <RoomConnect currentRoom={currentRoom} displayName={this.props.user} sendRequests={this.sendRequests} />
        );
        const roomAwaitingHtml = currentRoom && (
            <RoomAwaiting displayName={this.props.user} invited={currentRoom.invited} />
        );
        const roomConnectedHtml = (
            <Room currentRoom={currentRoom} displayName={this.props.user} updateRoom={this.props.updateRoom} />
        );
        const RoomComponent = currentRoom
            ? currentRoom.requestSent
                ? currentRoom.full
                    ? roomConnectedHtml
                    : roomAwaitingHtml
                : roomConnectHtml
            : mainWelcomeHtml;

        return (
            <div>
                <TransferRequest
                    roomInvite={this.state.roomInvite}
                    visible={this.state.roomInvite.sender.userId !== ''}
                    acceptRequest={this.acceptRequest}
                    declineRequest={this.declineRequest}
                />
                <LeftTabBar
                    displayName={this.props.user}
                    users={this.state.users}
                    updateSearchResults={this.updateSearchResults}
                    searchResults={this.state.searchResults}
                    selectUser={this.selectUser}
                    leaveRoom={this.leaveRoom}
                    rooms={this.props.rooms}
                    currentRoomId={this.state.currentRoomId}
                />
                {RoomComponent}
            </div>
        );
    }
}
