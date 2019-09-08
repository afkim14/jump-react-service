import React from 'react';
import './UserContainer.css';
import * as Types from '../constants/Types';

type UserContainerProps = {
    displayName: Types.UserDisplay;
    onClick: (displayName: Types.UserDisplay) => void;
};

const UserContainer: React.SFC<UserContainerProps> = ({ displayName, onClick }: UserContainerProps) => {
    return (
        <div
            className="user-container"
            onMouseDown={(): void => {
                onClick(displayName);
            }}
        >
            <div className="user-display-icon" style={{ backgroundColor: displayName.color }}></div>
            <p className="user-display-text">{displayName.displayName}</p>
        </div>
    );
};

export default UserContainer;
