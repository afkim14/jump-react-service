import React, { Component } from 'react';
import TrieSearch from 'trie-search';
import socket from '../constants/socket-context';
import Constants from '../constants/Constants';
import * as Types from '../constants/Types';

import LeftTabBar from './LeftTabBar';
import NewRoom from './NewRoom';
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
    invitedBy: Types.UserDisplay;
};

let usersTrie: Record<string, any>;

export default class MainHome extends Component<MainHomeProps, MainHomeState> {
    state: MainHomeState = {
        sendTo: '',
        rooms: {},
        currentRoom: { owner: '', accepted: false, invited: {}, roomid: '' },
        displayName: { userid: '', displayName: '', color: '' },
        users: {},
        searchResults: [],
        invitedBy: { userid: '', displayName: '', color: '' }
    };

    componentDidMount(): void {
        this.updateSearchResults = this.updateSearchResults.bind(this);

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
            const updatedRoom = this.state.currentRoom;
            updatedRoom.roomid = roomInfo.roomid;
            this.setState({ currentRoom: updatedRoom });
        });

        socket.on(Constants.SEND_ROOM_INVITES, (invite: Types.RoomInvite) => {
            this.setState({ invitedBy: invite.sender });
        });
    }

    componentWillUnmount(): void {
        // IMPORTANT!: Have to close socket to trigger disconnect message on backend.
        socket.close();
    }

    /**
     * Returns search result from trie
     */
    updateSearchResults(search: string): void {
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
        // TODO: implement user click
        if (this.state.rooms[displayName.userid]) {
            this.setState({ currentRoom: this.state.rooms[displayName.userid] });
        } else {
            socket.emit(Constants.CREATE_ROOM, { receipients: [displayName] });
            const newRooms = this.state.rooms;
            const newRoom = {
                roomid: '',
                owner: this.state.displayName.userid,
                accepted: false,
                invited: {
                    [this.state.displayName.userid]: this.state.displayName,
                    [displayName.userid]: displayName
                }
            };
            newRooms[displayName.userid] = newRoom;
            this.setState({ rooms: newRooms, currentRoom: newRoom });
        }
    };

    render(): React.ReactNode {
        if (this.state.invitedBy.userid !== '') {
            return (
                <div>
                    <p>{`You were just invited by ${this.state.invitedBy.displayName}`}</p>
                    <button>Accept</button>
                    <button>Reject</button>
                </div>
            );
        }

        return (
            <div>
                <LeftTabBar
                    displayName={this.state.displayName}
                    users={this.state.users}
                    updateSearchResults={this.updateSearchResults}
                    searchResults={this.state.searchResults}
                    selectUser={this.selectUser}
                />
                {
                    this.state.currentRoom.roomid !== '' ? (
                        <NewRoom currentRoom={this.state.currentRoom} displayName={this.state.displayName} />
                    ) : (
                        <div>{`Welcome, ${this.state.displayName.displayName}`}</div>
                    )
                }
                {/* {this.state.connectToRoom && <Room roomid={this.state.roomid} />} */}
            </div>
        );
    }
}
