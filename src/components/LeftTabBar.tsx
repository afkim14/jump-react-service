import React, { Component } from 'react';
import { A } from 'hookrouter';
import './LeftTabBar.css';
import CustomTextInput from './CustomTextInput';
import UserContainer from './UserContainer';
import * as Types from '../constants/Types';

type LeftTabBarProps = {
    displayName: Types.UserDisplay;
    users: Types.UserDisplayMap;
    selectUser: (displayName: Types.UserDisplay) => void;
    updateSearchResults: (search: string) => void;
    searchResults: Array<Types.UserDisplay>;
    rooms: Types.ConnectedRoomMap;
    currentRoomId: string;
};

type LeftTabBarState = {
    searchUser: string;
};

export default class LeftTabBar extends Component<LeftTabBarProps, LeftTabBarState> {
    state: LeftTabBarState = {
        searchUser: '',
    };

    handleSearchUser = (e: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState({ searchUser: e.target.value });
        this.props.updateSearchResults(e.target.value);
    };

    getOtherUserInRoom = (room: Types.Room): Types.UserDisplay => {
        const users = Object.keys(room.invited);
        for (let i = 0; i < users.length; i++) {
            if (room.invited[users[i]].displayName.userid !== this.props.displayName.userid) {
                return room.invited[users[i]].displayName;
            }
        }

        return this.props.displayName;
    };

    checkRoomAccepted = (room: Types.Room): boolean => {
        const users = Object.keys(room.invited);
        for (let i = 0; i < users.length; i++) {
            if (!room.invited[users[i]].accepted) {
                return false;
            }
        }
        return true;
    };

    render(): React.ReactNode {
        return (
            <div className="left-tab-bar-container">
                <A href="/" className="left-tab-bar-logo-text">
                    JUMP
                </A>
                <UserContainer displayName={this.props.displayName} onClick={this.props.selectUser} />
                <p className="left-tab-bar-header">Connections</p>
                {Object.keys(this.props.rooms).map((roomid, i) => {
                    return (
                        <UserContainer
                            key={i}
                            displayName={this.getOtherUserInRoom(this.props.rooms[roomid])}
                            onClick={(): void => {
                                this.props.selectUser(this.getOtherUserInRoom(this.props.rooms[roomid]));
                            }}
                            requestSent={this.props.rooms[roomid].requestSent}
                            accepted={this.checkRoomAccepted(this.props.rooms[roomid])}
                            currentRoom={this.props.currentRoomId === roomid}
                        />
                    );
                })}
                <p className="left-tab-bar-header">All Users</p>
                <CustomTextInput onChange={this.handleSearchUser} placeholder={'Search ...'} style={{ width: '80%' }} />
                {this.props.searchResults.map((user, i) => {
                    if (user.userid === this.props.displayName.userid) {
                        return;
                    }

                    return (
                        <UserContainer
                            key={i}
                            displayName={user}
                            onClick={(): void => {
                                this.props.selectUser(user);
                            }}
                        />
                    );
                })}
            </div>
        );
    }
}
