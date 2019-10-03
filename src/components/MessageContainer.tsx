import React, { FC } from 'react';

import { Message } from '../constants/Types';

type MessageProps = {
    key: number;
    message: Message;
};

const MessageContainer: FC<MessageProps> = (props: MessageProps) => (
    <div key={props.key} className="message-container">
        <span>
            <p className="messages-sender" style={{ color: props.message.sender.color }}>
                {props.message.sender.displayName}
            </p>
            <p className="messages-text">{props.message.text}</p>
        </span>
    </div>
);

export default MessageContainer;
