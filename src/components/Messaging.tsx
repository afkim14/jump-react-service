import React, { Component } from 'react';
import RTC from '../lib/RTC';
import { createMessage } from '../lib/message';

type MessagingProps = {
    roomOwner: boolean;
};

type MessagingState = {
    sendChannelOpen: boolean;
    receiveChannelOpen: boolean;
    messageInputText: string;
    messages: string[];
};

class Messaging extends Component<MessagingProps, MessagingState> {
    state: MessagingState = {
        sendChannelOpen: false,
        receiveChannelOpen: false,
        messageInputText: '',
        messages: [],
    };

    constructor(props: MessagingProps) {
        super(props);
        this.handleSendChannelStatusChange = this.handleSendChannelStatusChange.bind(this);
        this.handleReceiveChannelStatusChange = this.handleReceiveChannelStatusChange.bind(this);
        this.handleSendMessage = this.handleSendMessage.bind(this);
        this.handleReceiveMessage = this.handleReceiveMessage.bind(this);
        this.handleMessageInputChange = this.handleMessageInputChange.bind(this);
        this.handleMessageInputSubmit = this.handleMessageInputSubmit.bind(this);
        this.addMessage = this.addMessage.bind(this);

        RTC.connectPeers('messageDataChannel', this.props.roomOwner);
        RTC.setHandleSendChannelStatusChange(this.handleSendChannelStatusChange);
        RTC.setHandleReceiveChannelStatusChange(this.handleReceiveChannelStatusChange);
        RTC.setReceiveMessageHandler(this.handleReceiveMessage);
    }

    /**
     * Disconnect from RTC channels. The cool thing here is that if ANY user in the room leaves,
     * all other users will re-render their components and since room is not full, they will also be disconnected.
     */
    componentWillUnmount(): void {
        RTC.disconnect();
    }

    /**
     * Custom handler for status change on send channel. Needed to re-render component.
     */
    handleSendChannelStatusChange(open: boolean): void {
        this.setState({ sendChannelOpen: open });
    }

    /**
     * Custom handler for receive change on send channel. Needed to re-render component.
     */
    handleReceiveChannelStatusChange(open: boolean): void {
        this.setState({ receiveChannelOpen: open });
    }

    /**
     * Handles messages sent over RTC send channel.
     */
    handleSendMessage(msg: string): void {
        if (RTC.sendMessage(msg)) {
            this.addMessage(msg);
        }
    }

    /**
     * Handles messages received over RTC receive channel.
     */
    handleReceiveMessage(event: MessageEvent): void {
        this.addMessage(event.data);
    }

    /**
     * Adds message to display in UI
     */
    addMessage(msg: string): void {
        this.setState(state => {
            const messages = [...state.messages, msg];
            return {
                messages,
            };
        });
    }

    /**
     * Handles message input.
     */
    handleMessageInputChange(event: React.ChangeEvent<HTMLInputElement>): void {
        this.setState({ messageInputText: event.currentTarget.value });
    }

    /**
     * Handles message submit.
     */
    handleMessageInputSubmit(event: React.FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        this.handleSendMessage(this.state.messageInputText);
        this.setState({
            messageInputText: '',
        });
    }

    render(): React.ReactNode {
        const messages = this.state.messages.map((msg, idx) => (
            <p key={idx}>
                {msg}
                <br />
            </p>
        ));
        return (
            <div className="message">
                <div className="message-input">
                    <div className="messages-inbox">{messages}</div>
                    <form onSubmit={this.handleMessageInputSubmit}>
                        <input
                            type="text"
                            size={64}
                            value={this.state.messageInputText}
                            onChange={this.handleMessageInputChange}
                        />
                        <input type="submit" value="Send" disabled={!this.state.sendChannelOpen} />
                    </form>
                </div>
            </div>
        );
    }
}

export default Messaging;
