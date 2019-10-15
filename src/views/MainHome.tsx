import React, { Component } from 'react';
import socket from '../constants/socket-context';
import Constants from '../constants/Constants';
import * as Types from '../constants/Types';

import LeftTabBar from '../components/LeftTabBar';
import TransferRequest from '../components/TransferRequest';
import Room from './Room';
import MainWelcome from '../components/MainWelcome';

type MainHomeProps = {
    user: Types.UserDisplay;
    setUser: (user: Types.UserDisplay) => void;
    rooms: Types.ConnectedRoomMap;
    addRoom: (room: Types.Room) => void;
    removeRoom: (roomid: string) => void;
    updateRoom: (roomid: string, room: Types.Room) => void;
};

type MainHomeState = {
    currentRoom: Types.Room;
    users: Types.UserDisplayMap;
    searchResults: Types.UserDisplay[];
    roomInvite: Types.RoomInvite;
};

const emptyCurrentRoom = {
    owner: '',
    requestSent: false,
    invited: {},
    roomid: '',
    messages: [],
    files: [],
    rtcConnection: null,
};
const emptyRoomInvite = {
    sender: { userid: '', displayName: '', color: '' },
    roomid: '',
    initialMessage: {
        sender: { userid: '', displayName: '', color: '' },
        text: '',
    },
    initialFile: {
        sender: { userid: '', displayName: '', color: '' },
        fileName: '',
        fileSize: 0,
        completed: false,
    },
};

export default class MainHome extends Component<MainHomeProps, MainHomeState> {
    state: MainHomeState = {
        currentRoom: emptyCurrentRoom,
        users: {},
        searchResults: [],
        roomInvite: emptyRoomInvite,
    };

    componentDidMount(): void {
        // Get random username and a list of connected users
        socket.emit(Constants.GET_DISPLAY_NAME);
        socket.emit(Constants.GET_USERS);

        socket.on(Constants.DISPLAY_NAME, (displayName: Types.UserDisplay) => {
            this.props.setUser(displayName);
        });

        socket.on(Constants.USERS, (users: Types.UserDisplayMap) => {
            this.setState({ users, searchResults: Object.values(users) });
        });

        socket.on(Constants.SEARCH_USERS, (searchResults: Types.UserDisplay[]) => {
            this.setState({ searchResults });
        });

        socket.on(Constants.CREATE_ROOM_SUCCESS, (roomInfo: Types.ConnectRoom) => {
            const updatedRoom = this.state.currentRoom;
            updatedRoom.roomid = roomInfo.roomid;
            this.props.updateRoom(updatedRoom.roomid, updatedRoom);
            this.setState({ currentRoom: updatedRoom });
        });

        socket.on(Constants.SEND_ROOM_INVITES, (invite: Types.RoomInvite) => {
            this.setState({ roomInvite: invite });
        });

        socket.on(Constants.REJECT_TRANSFER_REQUEST, (data: Types.RoomInviteResponse) => {
            const updatedRoom = this.props.rooms[data.roomid];
            updatedRoom.invited[data.respondedBy.userid].accepted = false;
            this.props.updateRoom(updatedRoom.roomid, updatedRoom);
        });

        socket.on(Constants.ACCEPT_TRANSFER_REQUEST, (data: Types.RoomInviteResponse) => {
            const updatedRoom = this.props.rooms[data.roomid];
            updatedRoom.invited[data.respondedBy.userid].accepted = true;
            this.props.updateRoom(updatedRoom.roomid, updatedRoom);
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
            : socket.emit(Constants.SEARCH_USERS, search);
    };

    /**
     * Called when a user is clicked
     */
    selectUser = (displayName: Types.UserDisplay): void => {
        // If yourself, ignore
        if (displayName.userid === this.props.user.userid) {
            return;
        }

        // If already an open room, just open it up
        const roomsIds = Object.keys(this.props.rooms);
        for (let i = 0; i < roomsIds.length; i++) {
            if (this.props.rooms[roomsIds[i]].invited[displayName.userid]) {
                this.setState({ currentRoom: this.props.rooms[roomsIds[i]] });
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
            messages: [],
            files: [],
            rtcConnection: null,
        };

        socket.emit(Constants.CREATE_ROOM, { invited: newRoom.invited });
        this.setState({ currentRoom: newRoom });

        // Remove any rooms that were open but nothing was sent
        Object.keys(this.props.rooms).forEach(roomid => {
            if (!this.props.rooms[roomid].requestSent) {
                delete this.props.rooms[roomid];
            }
        });
    };

    /**
     * Callback on initial message send. Sends invites to everyone in room except sender
     */
    onInitialMessageSend = (msg: Types.Message): void => {
        const newCurrentRoom = this.state.currentRoom;
        newCurrentRoom.requestSent = true;
        newCurrentRoom.messages.push(msg);
        socket.emit(Constants.SEND_ROOM_INVITES, {
            invited: newCurrentRoom.invited,
            roomid: this.state.currentRoom.roomid,
            initialMessage: newCurrentRoom.messages[0],
        });
        this.setState({ currentRoom: newCurrentRoom });
    };

    /**
     * Callback on initial file send. Sends invites to everyone in room except sender
     */
    onInitialFileSend = (file: Types.File): void => {
        const newCurrentRoom = this.state.currentRoom;
        newCurrentRoom.requestSent = true;
        newCurrentRoom.files.push(file);
        socket.emit(Constants.SEND_ROOM_INVITES, {
            invited: newCurrentRoom.invited,
            roomid: this.state.currentRoom.roomid,
            initialFile: newCurrentRoom.files[0],
        });
        this.setState({ currentRoom: newCurrentRoom });
    };

    /**
     * Accepts incoming transfer request and goes inside room.
     */
    acceptRequest = (): void => {
        socket.emit(Constants.ACCEPT_TRANSFER_REQUEST, {
            invitedBy: this.state.roomInvite.sender,
            respondedBy: this.props.user,
            roomid: this.state.roomInvite.roomid,
        });

        const newCurrentRoom = {
            roomid: this.state.roomInvite.roomid,
            owner: this.state.roomInvite.sender.displayName,
            requestSent: true,
            invited: {
                [this.state.roomInvite.sender.userid]: {
                    accepted: true,
                    displayName: this.state.roomInvite.sender,
                },
                [this.props.user.userid]: {
                    accepted: true,
                    displayName: this.props.user,
                },
            },
            messages: this.state.roomInvite.initialMessage ? [this.state.roomInvite.initialMessage] : [],
            files: this.state.roomInvite.initialFile ? [this.state.roomInvite.initialFile] : [],
            rtcConnection: null,
        };

        this.props.addRoom(newCurrentRoom);
        this.setState({
            currentRoom: newCurrentRoom,
            roomInvite: emptyRoomInvite,
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

    /**
     * Saves room messages locally
     */
    addRoomMessage = (roomid: string, msg: Types.Message): void => {
        const updatedRoom = this.props.rooms[roomid];
        updatedRoom.messages.push(msg);
        this.props.updateRoom(updatedRoom.roomid, updatedRoom);
    };

    /**
     * Changes file status
     */
    updateCompletedFile = (roomid: string, file: Types.File): void => {
        const updatedRoom = this.props.rooms[roomid];
        updatedRoom.files.forEach(f => {
            if (f.fileName === file.fileName) {
                f.completed = true;
            }
        });
        this.props.updateRoom(updatedRoom.roomid, updatedRoom);
    };

    render(): React.ReactNode {
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
                    rooms={this.props.rooms}
                    currentRoom={this.state.currentRoom}
                />
                {this.state.currentRoom.roomid !== '' ? (
                    <Room
                        currentRoom={this.state.currentRoom}
                        displayName={this.props.user}
                        onInitialMessageSend={this.onInitialMessageSend}
                        onInitialFileSend={this.onInitialFileSend}
                        addRoomMessage={this.addRoomMessage}
                        updateCompletedFile={this.updateCompletedFile}
                    />
                ) : (
                    <MainWelcome userDisplay={this.props.user} />
                )}
            </div>
        );
    }
}
