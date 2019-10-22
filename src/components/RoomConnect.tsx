import React, { FC } from 'react';
import './RoomConnect.css';

type RoomConnectProps = {
    sendRequests: () => void;
};

// TODO: Style
const MessageContainer: FC<RoomConnectProps> = (props: RoomConnectProps) => (
    <div className="room-awaiting-container">
        <button onClick={props.sendRequests}>Connect</button>
    </div>
);

export default MessageContainer;
