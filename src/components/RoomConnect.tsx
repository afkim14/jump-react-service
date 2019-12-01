import React, { FC } from 'react';
import { Room, UserDisplay } from '../constants/Types';
import CustomButton from './CustomButton';
import '../assets/components/RoomConnect.scss';

type RoomConnectProps = {
    currentRoom: Room;
    displayName: UserDisplay;
    sendRequests: () => void;
};

// TODO: Style
const MessageContainer: FC<RoomConnectProps> = (props: RoomConnectProps) => (
    <div className="room-connecting-container">
        {Object.keys(props.currentRoom.invited).map((userId, i) => {
            if (userId !== props.displayName.userId) {
                return (
                    <div key={i}>
                        <div
                            className="room-connecting-receipient-circle-icon"
                            style={{
                                backgroundColor: props.currentRoom.invited[userId].displayName.color,
                            }}
                        />
                        <p className="room-connecting-receipient-username">
                            {props.currentRoom.invited[userId].displayName.displayName}
                        </p>
                        <p className="room-connecting-connection-msg">Request to connect to begin data transfer.</p>
                        <CustomButton onClick={props.sendRequests} text={'Connect'} />
                    </div>
                );
            }
        })}
    </div>
);

export default MessageContainer;
