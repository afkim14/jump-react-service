import React, { FC } from 'react';

import { Room, UserDisplay } from '../constants/Types';

type PreConnectionRoomProps = {
    currentRoom: Room;
    displayName: UserDisplay;
};

const PreConnectionRoom: FC<PreConnectionRoomProps> = (props: PreConnectionRoomProps) => (
    <div className="room-connection-container">
        {Object.keys(props.currentRoom.invited).map((userid, i) => {
            if (userid === props.displayName.userid) {
                return;
            }

            return (
                <div key={i}>
                    <div
                        className="room-receipient-circle-icon"
                        style={{
                            backgroundColor: props.currentRoom.invited[userid].displayName.color,
                        }}
                    />
                    <p className="room-receipient-username">
                        {props.currentRoom.invited[userid].displayName.displayName}
                    </p>
                    <p className="room-connection-msg">Drag file or send message to begin file transfer</p>
                </div>
            );
        })}
    </div>
);

export default PreConnectionRoom;
