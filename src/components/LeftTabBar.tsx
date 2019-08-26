import React, { Component } from 'react';
import './LeftTabBar.css';
import CustomTextInput from './CustomTextInput';

type LeftTabBarProps = {};

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
                <p className="left-tab-bar-header">Recent Connections</p>
                <CustomTextInput
                    onChange={this.handleSearchUser}
                    placeholder={'Search ...'}
                    style={{ backgroundColor: '#d8d8d8', width: '80%' }}
                />
            </div>
        );
    }
}
