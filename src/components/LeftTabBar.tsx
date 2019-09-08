import React, { Component } from 'react';
import { A } from 'hookrouter';
import './LeftTabBar.css';
import CustomTextInput from './CustomTextInput';
import UserContainer from './UserContainer';
import * as Types from '../constants//Types';

type LeftTabBarProps = {
    displayName: Types.UserDisplay;
    users: Types.UserDisplayMap;
    selectUser: (displayName: Types.UserDisplay) => void;
    updateSearchResults: (search: string) => void;
    searchResults: Array<Types.UserDisplay>;
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

    render(): React.ReactNode {
        return (
            <div className="left-tab-bar-container">
                <A href="/" className="left-tab-bar-logo-text">
                    JUMP
                </A>
                <UserContainer displayName={this.props.displayName} onClick={this.props.selectUser} />
                <p className="left-tab-bar-header">All Users</p>
                <CustomTextInput
                    onChange={this.handleSearchUser}
                    placeholder={'Search ...'}
                    style={{ backgroundColor: '#d8d8d8', width: '80%' }}
                />
                {this.props.searchResults.map((user, i) => {
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
