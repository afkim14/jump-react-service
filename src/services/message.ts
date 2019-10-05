import { Message } from '../constants/Types';

// export function createMessage(sender: string, text: string): string {
//     const timestamp = new Date().toString();
//     const message: Message = {
//         sender,
//         text,
//         timestamp,
//     };
//     return JSON.stringify(message);
// }

export function parseMessage(message: string): Message {
    return JSON.parse(message);
}
