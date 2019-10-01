import React, { FC } from 'react';
import { Message } from '../constants/Types';

type MessageProps = {
    message: Message;
};

const MessageDisplay: FC<MessageProps> = (props: MessageProps) => (
    <p>
        {props.message.sender}: {props.message.text}
    </p>
);

export default MessageDisplay;
