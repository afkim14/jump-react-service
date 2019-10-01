import { Message } from '../types';

export function createMessage(sender: string, text: string): Message {
    const timestamp = new Date().toString();
    return {
        sender,
        text,
        timestamp,
    };
}
