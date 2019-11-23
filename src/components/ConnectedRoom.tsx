import React, { FC } from 'react';

import { Room, UserDisplay } from '../constants/Types';
import './ConnectedRoom.css';

type ConnectedRoomProps = {
    currentRoom: Room;
    displayName: UserDisplay;
};

const ConnectedRoom: FC<ConnectedRoomProps> = (props: ConnectedRoomProps) => (
    <div className="room-connected-container">
        {Object.keys(props.currentRoom.invited).map((userId, i) => {
            if (userId === props.displayName.userId) {
                return;
            }

            return (
                <div key={i}>
                    <p
                        className="room-connected-receipient-username"
                        style={{
                            backgroundColor: props.currentRoom.invited[userId].displayName.color,
                        }}
                    >
                        {props.currentRoom.invited[userId].displayName.displayName}
                    </p>
                </div>
            );
        })}
    </div>
);

export default ConnectedRoom;
