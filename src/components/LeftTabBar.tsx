import React, { Component } from 'react';
import { A } from 'hookrouter';
import '../assets/components/LeftTabBar.scss';
import CustomTextInput from './CustomTextInput';
import UserContainer from './UserContainer';
import * as Types from '../constants/Types';

type LeftTabBarProps = {
    displayName: Types.UserDisplay;
    users: Types.UserDisplayMap;
    selectUser: (displayName: Types.UserDisplay) => void;
    leaveRoom: (roomId: string) => void;
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
            if (room.invited[users[i]].displayName.userId !== this.props.displayName.userId) {
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
                <UserContainer displayName={this.props.displayName} />
                <p className="left-tab-bar-header">Connections</p>
                {Object.keys(this.props.rooms).map((roomId, i) => {
                    return (
                        <UserContainer
                            key={i}
                            displayName={this.getOtherUserInRoom(this.props.rooms[roomId])}
                            onClick={(): void => {
                                this.props.selectUser(this.getOtherUserInRoom(this.props.rooms[roomId]));
                            }}
                            onLeaveRoom={(): void => {
                                this.props.leaveRoom(roomId);
                            }}
                            requestSent={this.props.rooms[roomId].requestSent}
                            accepted={this.checkRoomAccepted(this.props.rooms[roomId])}
                            currentRoom={this.props.currentRoomId === roomId}
                        />
                    );
                })}
                <p className="left-tab-bar-header">All Users</p>
                <CustomTextInput onChange={this.handleSearchUser} placeholder={'Search ...'} style={{ width: '80%' }} />
                {this.props.searchResults.map((user, i) => {
                    if (user.userId === this.props.displayName.userId) {
                        return null;
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
