import React, { FC } from 'react';

import { Message } from '../constants/Types';
import './MessageContainer.css';

type MessageProps = {
    key: number;
    message: Message;
};

const MessageContainer: FC<MessageProps> = (props: MessageProps) => (
    <div className="message-container">
        <span>
            <p className="message-sender" style={{ color: props.message.sender.color }}>
                {props.message.sender.displayName}
            </p>
            <p className="message-text">{props.message.text}</p>
        </span>
    </div>
);

export default MessageContainer;
