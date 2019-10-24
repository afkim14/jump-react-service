import React, { FC } from 'react';

import { Room, UserDisplay } from '../constants/Types';
import './PreConnectionRoom.css';

type PreConnectionRoomProps = {
    currentRoom: Room;
    displayName: UserDisplay;
};

const PreConnectionRoom: FC<PreConnectionRoomProps> = (props: PreConnectionRoomProps) => (
    <div className="room-preconnection-container">
        {Object.keys(props.currentRoom.invited).map((userid, i) => {
            if (userid === props.displayName.userid) {
                return;
            }

            return (
                <div key={i}>
                    <div
                        className="room-preconnection-receipient-circle-icon"
                        style={{
                            backgroundColor: props.currentRoom.invited[userid].displayName.color,
                        }}
                    />
                    <p className="room-preconnection-receipient-username">
                        {props.currentRoom.invited[userid].displayName.displayName}
                    </p>
                    <p className="room-preconnection-connection-msg">Drag file or send message to begin file transfer</p>
                </div>
            );
        })}
    </div>
);

export default PreConnectionRoom;
