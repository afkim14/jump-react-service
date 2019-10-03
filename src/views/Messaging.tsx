import React, { Component } from 'react';
import { UserDisplay } from '../constants/Types';
import RTC from '../lib/RTC';
import Constants from '../constants/Constants';
import CustomTextInput from '../components/CustomTextInput';
import * as Types from '../constants/Types';
import './Messaging.css';
import socket from '../constants/socket-context';
import MessageContainer from '../components/MessageContainer';

type MessagingProps = {
    currentRoom: Types.Room;
    onInitialMessageSend: Function;
    displayName: Types.UserDisplay;
    addRoomMessage: Function;
};

type MessagingState = {
    sendChannelOpen: boolean;
    receiveChannelOpen: boolean;
    messageInputText: string;
    messages: Array<Types.Message>;
};

class Messaging extends Component<MessagingProps, MessagingState> {
    state: MessagingState = {
        sendChannelOpen: false,
        receiveChannelOpen: false,
        messageInputText: '',
        messages: this.props.currentRoom.messages,
    };
    rtc: RTC;

    constructor(props: MessagingProps) {
        super(props);
        this.handleSendChannelStatusChange = this.handleSendChannelStatusChange.bind(this);
        this.handleReceiveChannelStatusChange = this.handleReceiveChannelStatusChange.bind(this);
        this.handleSendMessage = this.handleSendMessage.bind(this);
        this.handleReceiveMessage = this.handleReceiveMessage.bind(this);
        this.handleMessageInputChange = this.handleMessageInputChange.bind(this);
        this.handleMessageInputSubmit = this.handleMessageInputSubmit.bind(this);
        this.addMessage = this.addMessage.bind(this);
        this.rtc = new RTC();

        socket.on(Constants.ROOM_STATUS, (data: Types.RoomStatus) => {
            if (data.full) {
                // TODO: UNCOMMENT THIS OUT WHEN WE HAVE NEW RTC (SEPARATE FROM FILE TRANSFER ONE)
                this.rtc.connectPeers('messageDataChannel', this.props.displayName.userid === data.owner);
                this.rtc.setHandleSendChannelStatusChange(this.handleSendChannelStatusChange);
                this.rtc.setHandleReceiveChannelStatusChange(this.handleReceiveChannelStatusChange);
                this.rtc.setReceiveMessageHandler(this.handleReceiveMessage);
            }
        });
    }

    /**
     * Disconnect from RTC channels. The cool thing here is that if ANY user in the room leaves,
     * all other users will re-render their components and since room is not full, they will also be disconnected.
     */
    componentWillUnmount(): void {
        this.rtc.disconnect();
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
    handleSendMessage(msg: Types.Message): void {
        this.setState({ messageInputText: '' });
        if (!this.props.currentRoom.requestSent) {
            this.props.onInitialMessageSend(msg);
            return;
        }

        if (this.rtc.sendMessage(JSON.stringify(msg))) {
            this.addMessage(msg);
        }
    }

    /**
     * Handles messages received over RTC receive channel.
     */
    handleReceiveMessage(event: MessageEvent): void {
        this.addMessage(JSON.parse(event.data));
    }

    /**
     * Adds message to display in UI
     */
    addMessage(msg: Types.Message): void {
        this.props.addRoomMessage(this.props.currentRoom.roomid, msg);
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
        this.handleSendMessage({ sender: this.props.displayName, text: this.state.messageInputText });
        this.setState({
            messageInputText: '',
        });
    }

    render(): React.ReactNode {
        const messages =
            this.state.messages && this.state.messages.map((msg, idx) => <MessageContainer key={idx} message={msg} />);
        const openConnection =
            !this.props.currentRoom.requestSent || (this.state.receiveChannelOpen && this.state.sendChannelOpen);
        return (
            <div className="message">
                <div className="message-input">
                    {this.state.messages.length > 0 && <div className="messages-inbox">{messages}</div>}
                    <div className="messages-container">
                        {openConnection ? (
                            <form onSubmit={this.handleMessageInputSubmit}>
                                <CustomTextInput
                                    placeholder={'Send a message'}
                                    onChange={this.handleMessageInputChange}
                                    value={this.state.messageInputText}
                                    style={{
                                        display: 'inline-block',
                                        margin: 0,
                                        width: '100%',
                                        paddingLeft: 20,
                                    }}
                                />
                                <input
                                    className="messaging-submit-button"
                                    type="submit"
                                    value="Send"
                                    disabled={!openConnection}
                                />
                            </form>
                        ) : (
                            <p className="messages-connecting-msg">Connecting ... please wait.</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

export default Messaging;
