import React, { FC } from 'react';

import { Room, UserDisplay } from '../constants/Types';
import '../assets/components/ConnectedRoom.scss';

type ConnectedRoomProps = {
    currentRoom: Room;
    displayName: UserDisplay;
};

const ConnectedRoom: FC<ConnectedRoomProps> = (props: ConnectedRoomProps) => (
    <div className="room-connected-container">
        {Object.keys(props.currentRoom.invited).map((userid, i) => {
            if (userid === props.displayName.userid) {
                return;
            }

            return (
                <div key={i}>
                    <p
                        className="room-connected-receipient-username"
                        style={{
                            backgroundColor: props.currentRoom.invited[userid].displayName.color,
                        }}
                    >
                        {props.currentRoom.invited[userid].displayName.displayName}
                    </p>
                </div>
            );
        })}
    </div>
);

export default ConnectedRoom;
