import React, { Component } from 'react';
import './UserContainer.css';
import * as Types from '../constants/Types';

type UserContainerProps = {
    displayName: Types.UserDisplay;
    onClick: (displayName: Types.UserDisplay) => void;
};

type UserContainerState = {};

export default class UserContainer extends Component<UserContainerProps, UserContainerState> {
    render(): React.ReactNode {
        return (
            <div
                className="user-container"
                onMouseDown={(): void => {
                    this.props.onClick(this.props.displayName);
                }}
            >
                <div className="user-display-icon" style={{ backgroundColor: this.props.displayName.color }}></div>
                <p className="user-display-text">{this.props.displayName.displayName}</p>
            </div>
        );
    }
}
