import React, { Component } from 'react';
import './LeftTabBar.css';
import CustomTextInput from './CustomTextInput';
import UserContainer from './UserContainer';
import { Link } from 'react-router-dom';
import * as Types from '../Types';

type LeftTabBarProps = {
    displayName: Types.UserDisplay;
    users: Types.UserDisplayMap;
    selectUser: (displayName: Types.UserDisplay) => void;
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
    };

    render(): React.ReactNode {
        return (
            <div className="left-tab-bar-container">
                <Link className="left-tab-bar-logo-text" to="/">
                    JUMP
                </Link>
                <UserContainer displayName={this.props.displayName} onClick={this.props.selectUser} />
                <p className="left-tab-bar-header">Connected Users</p>
                <CustomTextInput
                    onChange={this.handleSearchUser}
                    placeholder={'Search ...'}
                    style={{ backgroundColor: '#d8d8d8', width: '80%' }}
                />
                {Object.keys(this.props.users).map((user, i) => {
                    return (
                        <UserContainer
                            key={i}
                            displayName={this.props.users[user]}
                            onClick={(): void => {
                                this.props.selectUser(this.props.users[user]);
                            }}
                        />
                    );
                })}
            </div>
        );
    }
}
