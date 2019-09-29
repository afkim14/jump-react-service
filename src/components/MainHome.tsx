import React, { Component } from 'react';
import TrieSearch from 'trie-search';
import socket from '../constants/socket-context';
import Constants from '../constants/Constants';
import * as Types from '../constants/Types';

import LeftTabBar from './LeftTabBar';
import TransferRequest from './TransferRequest';
import Room from './Room';
import './MainHome.css';

type MainHomeProps = {};

type MainHomeState = {
    sendTo: string;
    rooms: Types.ConnectedRoomMap;
    currentRoom: Types.Room;
    displayName: Types.UserDisplay;
    users: Types.UserDisplayMap;
    searchResults: Array<Types.UserDisplay>;
    roomInvite: Types.RoomInvite;
};

let usersTrie: Record<string, any>;
const emptyCurrentRoom = { owner: '', requestSent: false, invited: {}, roomid: '', messages: [], files: [] };
const emptyDisplayName = { userid: '', displayName: '', color: '' };
const emptyRoomInvite = {
    sender: { userid: '', displayName: '', color: '' }, 
    roomid: '', 
    initialMessage: { 
        sender: { userid: '', displayName: '', color: '' },
        text: ''
    }
};

export default class MainHome extends Component<MainHomeProps, MainHomeState> {
    state: MainHomeState = {
        sendTo: '',
        rooms: {},
        currentRoom: emptyCurrentRoom,
        displayName: emptyDisplayName,
        users: {},
        searchResults: [],
        roomInvite: emptyRoomInvite
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
        if (search === '') {
            this.setState({ searchResults: Object.values(this.state.users) });
            return;
        }

        this.setState({ searchResults: usersTrie.get(search) });
    }

    /**
     * Called when a user is clicked
     */
    selectUser = (displayName: Types.UserDisplay): void => {
        // If already an open room, just open it up
        const roomsIds = Object.keys(this.state.rooms);
        for (let i = 0; i < roomsIds.length; i++) {
            if (this.state.rooms[roomsIds[i]].invited[displayName.userid]) {
                this.setState({ currentRoom: this.state.rooms[roomsIds[i]] });
                return;
            }
        }
        
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
                    displayName: displayName
                }
            },
            messages: [],
            files: []
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

    onInitialSend = (msg: Types.Message): void => {
        const newCurrentRoom = this.state.currentRoom;
        newCurrentRoom.requestSent = true;
        newCurrentRoom.messages.push(msg);
        socket.emit(Constants.SEND_ROOM_INVITES, {
            invited: newCurrentRoom.invited, 
            roomid: this.state.currentRoom.roomid,
            initialMessage: newCurrentRoom.messages[0]
        });
        this.setState({ currentRoom: newCurrentRoom });
    }

    acceptRequest = (): void => {
        socket.emit(Constants.ACCEPT_TRANSFER_REQUEST, {
            invitedBy: this.state.roomInvite.sender,
            respondedBy: this.state.displayName,
            roomid: this.state.roomInvite.roomid
        });

        this.setState({ 
            currentRoom: {
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
                        displayName: this.state.displayName
                    }
                },
                messages: [this.state.roomInvite.initialMessage],
                files: []
            },
            roomInvite: emptyRoomInvite,
        });
    }

    declineRequest = (): void => {
        socket.emit(Constants.REJECT_TRANSFER_REQUEST, {
            invitedBy: this.state.roomInvite.sender,
            respondedBy: this.state.displayName,
            roomid: this.state.roomInvite.roomid
        });
        this.setState({ roomInvite: emptyRoomInvite });
    }

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
                {
                    this.state.currentRoom.roomid !== '' ? (
                        <Room 
                            currentRoom={this.state.currentRoom} 
                            displayName={this.state.displayName} 
                            onInitialSend={this.onInitialSend}
                        />
                    ) : (
                        <div>{`Welcome, ${this.state.displayName.displayName}`}</div>
                    )
                }
            </div>
        );
    }
}
