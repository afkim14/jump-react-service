import React from 'react';
import './UserContainer.css';
import * as Types from '../constants/Types';

type UserContainerProps = {
    displayName: Types.UserDisplay;
    onClick: (displayName: Types.UserDisplay) => void;
    requestSent?: boolean;
    accepted?: boolean;
    currentRoom?: boolean;
};

const UserContainer: React.FC<UserContainerProps> = ({
    displayName,
    onClick,
    requestSent,
    accepted,
    currentRoom,
}: UserContainerProps) => {
    const currentRoomNoAction = !accepted && !requestSent && currentRoom;
    let status = <p></p>;
    if (accepted) {
        status = <p className="user-display-status">Accepted</p>;
    } else {
        status = requestSent ? <p className="user-display-status">Pending</p> : <p></p>;
    }

    return (
        <div
            className={`user-container ${currentRoom && 'user-container-current'} ${currentRoomNoAction &&
                'user-container-initial'}`}
            onMouseDown={(): void => {
                onClick(displayName);
            }}
        >
            <div
                className={`user-display-icon ${currentRoomNoAction && 'user-display-light'}`}
                style={{ backgroundColor: displayName.color }}
            ></div>
            <p className={`user-display-text ${currentRoomNoAction && 'user-display-light'}`}>
                {displayName.displayName}
            </p>
            {status}
        </div>
    );
};

export default UserContainer;
