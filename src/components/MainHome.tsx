import React, { Component } from 'react';
import TrieSearch from 'trie-search';
import socket from '../constants/socket-context';
import Constants from '../constants/Constants';
import * as Types from '../constants/Types';
import CopyToClipboard from 'react-copy-to-clipboard';

import LeftTabBar from './LeftTabBar';
import TransferRequest from './TransferRequest';
import Room from './Room';
import './MainHome.css';
import CustomButton from './CustomButton';

type MainHomeProps = {};

type MainHomeState = {
    rooms: Types.ConnectedRoomMap;
    currentRoom: Types.Room;
    displayName: Types.UserDisplay; // Current user
    users: Types.UserDisplayMap;
    searchResults: Array<Types.UserDisplay>;
    roomInvite: Types.RoomInvite;
    copied: boolean;
};

let usersTrie: Record<string, any>;
const emptyCurrentRoom = { owner: '', requestSent: false, invited: {}, roomid: '', messages: [], files: [] };
const emptyDisplayName = { userid: '', displayName: '', color: '' };
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
        rooms: {},
        currentRoom: emptyCurrentRoom,
        displayName: emptyDisplayName,
        users: {},
        searchResults: [],
        roomInvite: emptyRoomInvite,
        copied: false,
    };

    componentDidMount(): void {
        // Get random username and a list of connected users
        socket.emit(Constants.GET_DISPLAY_NAME);
        socket.emit(Constants.GET_USERS);

        socket.on(Constants.DISPLAY_NAME, (displayName: Types.UserDisplay) => {
            this.setState({ displayName });
        });

        socket.on(Constants.USERS, (users: Types.UserDisplayMap) => {
            // FIXME: new Trie created everytime user logs in or disconnects from system
            usersTrie = new TrieSearch('displayName');
            usersTrie.addAll(Object.values(users));
            this.setState({ users, searchResults: Object.values(users) });
        });

        socket.on(Constants.CREATE_ROOM_SUCCESS, (roomInfo: Types.ConnectRoom) => {
            const newRooms = this.state.rooms;
            const updatedRoom = this.state.currentRoom;
            updatedRoom.roomid = roomInfo.roomid;
            newRooms[updatedRoom.roomid] = updatedRoom;
            this.setState({ rooms: newRooms, currentRoom: updatedRoom });
        });

        socket.on(Constants.SEND_ROOM_INVITES, (invite: Types.RoomInvite) => {
            this.setState({ roomInvite: invite });
        });

        socket.on(Constants.REJECT_TRANSFER_REQUEST, (data: Types.RoomInviteResponse) => {
            const newRooms = this.state.rooms;
            newRooms[data.roomid].invited[data.respondedBy.userid].accepted = false;
            this.setState({ rooms: newRooms });
        });

        socket.on(Constants.ACCEPT_TRANSFER_REQUEST, (data: Types.RoomInviteResponse) => {
            const newRooms = this.state.rooms;
            newRooms[data.roomid].invited[data.respondedBy.userid].accepted = true;
            this.setState({ rooms: newRooms });
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
            : this.setState({ searchResults: usersTrie.get(search) });
    };

    /**
     * Called when a user is clicked
     */
    selectUser = (displayName: Types.UserDisplay): void => {
        // If yourself
        if (displayName.userid === this.state.displayName.userid) {
            return;
        }

        // If already an open room, just open it up
        const roomsIds = Object.keys(this.state.rooms);
        for (let i = 0; i < roomsIds.length; i++) {
            if (this.state.rooms[roomsIds[i]].invited[displayName.userid]) {
                this.setState({ currentRoom: this.state.rooms[roomsIds[i]] });
                return;
            }
        }

        // Create new room
        const newRoom = {
            roomid: '',
            owner: this.state.displayName.userid,
            requestSent: false,
            invited: {
                [this.state.displayName.userid]: {
                    accepted: true,
                    displayName: this.state.displayName,
                },
                [displayName.userid]: {
                    accepted: false,
                    displayName: displayName,
                },
            },
            messages: [],
            files: [],
        };

        socket.emit(Constants.CREATE_ROOM, { invited: newRoom.invited });
        this.setState({ currentRoom: newRoom });

        // Remove any rooms that were open but nothing was sent
        Object.keys(this.state.rooms).forEach(roomid => {
            if (!this.state.rooms[roomid].requestSent) {
                delete this.state.rooms[roomid];
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
            respondedBy: this.state.displayName,
            roomid: this.state.roomInvite.roomid,
        });

        const newRooms = this.state.rooms;
        const newCurrentRoom = {
            roomid: this.state.roomInvite.roomid,
            owner: this.state.roomInvite.sender.displayName,
            requestSent: true,
            invited: {
                [this.state.roomInvite.sender.userid]: {
                    accepted: true,
                    displayName: this.state.roomInvite.sender,
                },
                [this.state.displayName.userid]: {
                    accepted: true,
                    displayName: this.state.displayName,
                },
            },
            messages: this.state.roomInvite.initialMessage ? [this.state.roomInvite.initialMessage] : [],
            files: this.state.roomInvite.initialFile ? [this.state.roomInvite.initialFile] : [],
        };
        newRooms[newCurrentRoom.roomid] = newCurrentRoom;

        this.setState({
            rooms: newRooms,
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
            respondedBy: this.state.displayName,
            roomid: this.state.roomInvite.roomid,
        });
        this.setState({ roomInvite: emptyRoomInvite });
    };

    /**
     * Saves room messages locally
     */
    addRoomMessage = (roomid: string, msg: Types.Message): void => {
        const newRooms = this.state.rooms;
        newRooms[roomid].messages.push(msg);
        this.setState({ rooms: newRooms });
    };

    /**
     * Changes file status
     */
    updateCompletedFile = (roomid: string, file: Types.File): void => {
        const newRooms = this.state.rooms;
        newRooms[roomid].files.forEach(f => {
            if (f.fileName === file.fileName) {
                f.completed = true;
            }
        });
        this.setState({ rooms: newRooms });
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
                    displayName={this.state.displayName}
                    users={this.state.users}
                    updateSearchResults={this.updateSearchResults}
                    searchResults={this.state.searchResults}
                    selectUser={this.selectUser}
                    rooms={this.state.rooms}
                    currentRoom={this.state.currentRoom}
                />
                {this.state.currentRoom.roomid !== '' ? (
                    <Room
                        currentRoom={this.state.currentRoom}
                        displayName={this.state.displayName}
                        onInitialMessageSend={this.onInitialMessageSend}
                        onInitialFileSend={this.onInitialFileSend}
                        addRoomMessage={this.addRoomMessage}
                        updateCompletedFile={this.updateCompletedFile}
                    />
                ) : (
                    <div className="main-welcome-container">
                        <div>
                            <p className="main-welcome-msg">{`Hello`}</p>
                            <p className="main-welcome-msg-username">{`${this.state.displayName.displayName}!`}</p>
                        </div>
                        <div style={{ clear: 'both' }} />
                        <p className="main-sub-msg">Begin sending files with the following steps:</p>
                        <div className="main-step-container">
                            <div className="main-step-icon">
                                <p className="main-step-number">1</p>
                            </div>
                            <p className="main-step-inst">Search and select a user using left nav bar.</p>
                        </div>
                        <div style={{ clear: 'both' }} />
                        <div className="main-step-container">
                            <div className="main-step-icon">
                                <p className="main-step-number">2</p>
                            </div>
                            <p className="main-step-inst">Send a message or a file request and wait for approval.</p>
                        </div>
                        <div style={{ clear: 'both' }} />
                        <div className="main-step-container">
                            <div className="main-step-icon">
                                <p className="main-step-number">3</p>
                            </div>
                            <p className="main-step-inst">Track the transfer process with detailed information.</p>
                        </div>
                        <div style={{ clear: 'both', marginTop: 100 }} />
                        <p className="main-sub-msg">Is your friend not signed up yet?</p>
                        <CopyToClipboard
                            onCopy={(): void => this.setState({ copied: true })}
                            text="http://localhost:3000/home"
                        >
                            <CustomButton
                                disabled={this.state.copied}
                                className="main-share-btn"
                                text={this.state.copied ? 'Copied' : 'Copy Sharing Link'}
                            />
                        </CopyToClipboard>
                    </div>
                )}
            </div>
        );
    }
}
