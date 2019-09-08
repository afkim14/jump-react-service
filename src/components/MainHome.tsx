import React, { Component } from 'react';
import './MainHome.css';
import LeftTabBar from './LeftTabBar';
import Room from './Room';
import openSocket from 'socket.io-client';
import Constants from '../constants/Constants';
import * as Types from '../constants/Types';
import TrieSearch from 'trie-search';
import SocketContext from '../constants/socket-context';

type MainHomeProps = {
    roomid?: string;
};

type MainHomeState = {
    sendTo: string;
    connectToRoom: boolean;
    roomid: string;
    socket: SocketIOClient.Socket;
    displayName: Types.UserDisplay;
    users: Types.UserDisplayMap;
    searchResults: Array<Types.UserDisplay>;
};

let usersTrie: Record<string, any>;

export default class MainHome extends Component<MainHomeProps, MainHomeState> {
    state: MainHomeState = {
        sendTo: '',
        connectToRoom: false,
        roomid: this.props.roomid ? this.props.roomid : '',
        socket: openSocket(`${Constants.SERVER_HOST}:${Constants.SERVER_PORT}`),
        displayName: { userid: '', displayName: '', color: '' },
        users: {},
        searchResults: [],
    };

    componentDidMount(): void {
        this.updateSearchResults = this.updateSearchResults.bind(this);

        // Get random username and a list of connected users
        this.state.socket.emit(Constants.GET_DISPLAY_NAME);
        this.state.socket.emit(Constants.GET_USERS);

        // If url path contains roomid, then attempt to connect to roomid.
        if (this.state.roomid !== '') {
            this.setState({ connectToRoom: true });
        }

        this.state.socket.on(Constants.DISPLAY_NAME, (displayName: Types.UserDisplay) => {
            this.setState({ displayName });
        });

        this.state.socket.on(Constants.USERS, (users: Types.UserDisplayMap) => {
            // FIXME: new Trie created everytime user logs in or disconnects from system
            usersTrie = new TrieSearch('displayName');
            usersTrie.addAll(Object.values(users));
            this.setState({ users, searchResults: Object.values(users) });
        });

        // TODO: After creating room, user url should also update to contain the roomid extension
        this.state.socket.on(Constants.CREATE_ROOM_SUCCESS, (data: Types.ConnectRoom) => {
            this.setState({ connectToRoom: true, roomid: data.roomid });
        });

        // Design Choice: user creates room automatically if link does not contain room to connect to
        this.state.socket.emit(Constants.CREATE_ROOM, { size: 2 });
    }

    componentWillUnmount(): void {
        // IMPORTANT!: Have to close socket to trigger disconnect message on backend.
        this.state.socket.close();
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
    selectUser = (displayName: Types.UserDisplay) => {
        // TODO: implement user click
        return;
    };

    render(): React.ReactNode {
        return (
            <SocketContext.Provider value={this.state.socket}>
                <LeftTabBar
                    displayName={this.state.displayName}
                    users={this.state.users}
                    updateSearchResults={this.updateSearchResults}
                    searchResults={this.state.searchResults}
                    selectUser={this.selectUser}
                />
                {this.state.connectToRoom && <Room roomid={this.state.roomid} />}
            </SocketContext.Provider>
        );
    }
}
