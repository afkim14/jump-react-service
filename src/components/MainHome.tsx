import React, { Component } from 'react';
import TrieSearch from 'trie-search';
import socket from '../constants/socket-context';
import Constants from '../constants/Constants';
import * as Types from '../constants/Types';

import LeftTabBar from './LeftTabBar';
import Room from './Room';
import './MainHome.css';

import Count from '../containers/count';

type MainHomeProps = {
    roomid?: string;
};

type MainHomeState = {
    sendTo: string;
    connectToRoom: boolean;
    roomid: string;
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
        displayName: { userid: '', displayName: '', color: '' },
        users: {},
        searchResults: [],
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

        // TODO: After creating room, user url should also update to contain the roomid extension
        socket.on(Constants.CREATE_ROOM_SUCCESS, (data: Types.ConnectRoom) => {
            this.setState({ connectToRoom: true, roomid: data.roomid });
        });

        // Design Choice: user creates room automatically if link does not contain room to connect to
        if (this.state.roomid !== '') {
            this.setState({ connectToRoom: true });
        } else {
            socket.emit(Constants.CREATE_ROOM, { size: 2 });
        }
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
    selectUser = (displayName: Types.UserDisplay) => {
        // TODO: implement user click
        console.log('select user', displayName.displayName);
        return;
    };

    render(): React.ReactNode {
        return (
            <div>
                <LeftTabBar
                    displayName={this.state.displayName}
                    users={this.state.users}
                    updateSearchResults={this.updateSearchResults}
                    searchResults={this.state.searchResults}
                    selectUser={this.selectUser}
                />
                {this.state.connectToRoom && <Room roomid={this.state.roomid} displayName={this.state.displayName} />}
                <Count />
            </div>
        );
    }
}
