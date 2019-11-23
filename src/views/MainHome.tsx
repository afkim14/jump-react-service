import React, { Component } from 'react';
import socket from '../constants/socket-context';
import Constants from '../constants/Constants';
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
    removeRoom: (roomid: string) => void;
    updateRoom: (roomid: string, room: Types.Room) => void;
};

type MainHomeState = {
    creatingRoom: null | Types.Room;
    currentRoomId: string;
    users: Types.UserDisplayMap;
    searchResults: Types.UserDisplay[];
    roomInvite: Types.RoomInvite;
};

const emptyRoomInvite = {
    sender: { userid: '', displayName: '', color: '' },
    roomid: '',
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
        socket.emit(Constants.LOGIN);

        socket.on(Constants.DISPLAY_NAME, (displayName: Types.UserDisplay) => {
            this.props.setUser(displayName);
        });

        socket.on(Constants.USERS, (users: Types.UserDisplayMap) => {
            this.setState({ users, searchResults: Object.values(users) });
        });

        socket.on(Constants.CREATE_ROOM_SUCCESS, (roomInfo: Types.ConnectRoom) => {
            // Update with roomid given by server and open room
            if (this.state.creatingRoom) {
                const updatedRoom = this.state.creatingRoom;
                updatedRoom.roomid = roomInfo.roomid;
                updatedRoom.rtcConnection = new RTC(roomInfo.roomid);
                this.props.addRoom(updatedRoom);
                this.setState({ creatingRoom: null, currentRoomId: updatedRoom.roomid });
            }
        });

        socket.on(Constants.SEND_ROOM_INVITES, (invite: Types.RoomInvite) => {
            this.setState({ roomInvite: invite });
        });

        socket.on(Constants.LEAVE_ROOM, ( roomid: string ) => {
            this.props.removeRoom(roomid);
            if (this.state.currentRoomId === roomid) {
                this.setState({ currentRoomId: '' });
            }
        });

        socket.on(Constants.ROOM_STATUS, (data: Types.RoomStatus) => {
            const updatedRoom = this.props.rooms[data.roomid];
            if (updatedRoom) {
                // Users connected to the room already
                updatedRoom.invited[data.userid].accepted = data.type === Constants.USER_CONNECT;
                updatedRoom.full = data.full;
                this.props.updateRoom(updatedRoom.roomid, updatedRoom);
            } else {
                // New users who just accepted a room invite
                const newCurrentRoom = {
                    roomid: data.roomid,
                    owner: data.owner,
                    requestSent: true,
                    invited: data.invited,
                    full: data.full,
                    messages: [],
                    files: [],
                    rtcConnection: new RTC(data.roomid),
                    receivedFiles: [],
                };

                this.props.addRoom(newCurrentRoom);
                this.setState({
                    currentRoomId: newCurrentRoom.roomid,
                    roomInvite: emptyRoomInvite,
                });
            }
        });

        // TODO: MAYBE PUT THIS IN FILE TRANSFER
        socket.on(Constants.FILE_ACCEPT, (data: { roomid: string; fileid: string }) => {
            const updatedRoom = this.props.rooms[data.roomid];
            updatedRoom.files.forEach((f: Types.FileInfo) => {
                if (f.id === data.fileid) {
                    f.accepted = true;
                    this.props.updateRoom(updatedRoom.roomid, updatedRoom);
                }
            });
        });

        // TODO: MAYBE PUT THIS IN FILE TRANSFER
        socket.on(Constants.FILE_REJECT, (data: { roomid: string; fileid: string }) => {
            const updatedRoom = this.props.rooms[data.roomid];
            updatedRoom.files.forEach((f: Types.FileInfo) => {
                if (f.id === data.fileid) {
                    f.accepted = false;
                    this.props.updateRoom(updatedRoom.roomid, updatedRoom);
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
        socket.emit(Constants.SEARCH_USERS, search);
    };

    /**
     * Called when a user is clicked
     */
    selectUser = (displayName: Types.UserDisplay): void => {
        // If already an open room, just open it up
        const roomsIds = Object.keys(this.props.rooms);
        for (let i = 0; i < roomsIds.length; i++) {
            if (this.props.rooms[roomsIds[i]].invited[displayName.userid]) {
                this.setState({ currentRoomId: roomsIds[i] });
                return;
            }
        }

        // Create new room
        const newRoom = {
            roomid: '',
            owner: this.props.user.userid,
            requestSent: false,
            invited: {
                [this.props.user.userid]: {
                    accepted: true,
                    displayName: this.props.user,
                },
                [displayName.userid]: {
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

        socket.emit(Constants.CREATE_ROOM, { invited: newRoom.invited });
        this.setState({ creatingRoom: newRoom });

        // Remove any rooms that were open but request wasn't sent
        Object.keys(this.props.rooms).forEach(roomid => {
            if (!this.props.rooms[roomid].requestSent) {
                // TODO: properly close RTC connection
                delete this.props.rooms[roomid];
            }
        });
    };

    leaveRoom = (roomid: string): void => {
        this.props.removeRoom(roomid);
        socket.emit(Constants.LEAVE_ROOM, { roomid });
    };

    /**
     * Sends room invites to invited users in the room.
     */
    sendRequests = (): void => {
        const updatedRoom = this.props.rooms[this.state.currentRoomId];
        updatedRoom.requestSent = true;
        socket.emit(Constants.SEND_ROOM_INVITES, { roomid: updatedRoom.roomid });
        this.props.updateRoom(updatedRoom.roomid, updatedRoom);
    };

    /**
     * Accepts incoming transfer request
     */
    acceptRequest = (): void => {
        socket.emit(Constants.ACCEPT_TRANSFER_REQUEST, {
            invitedBy: this.state.roomInvite.sender,
            respondedBy: this.props.user,
            roomid: this.state.roomInvite.roomid,
        });
    };

    /**
     * Declines incoming transfer request
     */
    declineRequest = (): void => {
        socket.emit(Constants.REJECT_TRANSFER_REQUEST, {
            invitedBy: this.state.roomInvite.sender,
            respondedBy: this.props.user,
            roomid: this.state.roomInvite.roomid,
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
                    visible={this.state.roomInvite.sender.userid !== ''}
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
