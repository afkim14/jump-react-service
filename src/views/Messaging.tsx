import React, { Component } from 'react';
import CustomTextInput from '../components/CustomTextInput';
import * as Types from '../constants/Types';
import '../assets/views/Messaging.scss';
import MessageContainer from '../components/MessageContainer';

type MessagingProps = {
    currentRoom: Types.Room;
    displayName: Types.UserDisplay;
    channelsOpen: boolean;
    setReceiveMessageHandler: (handler: any) => void;
    updateRoom: (roomid: string, room: Types.Room) => void;
};

type MessagingState = {
    messageInputText: string;
};

class Messaging extends Component<MessagingProps, MessagingState> {
    state: MessagingState = {
        messageInputText: '',
    };

    constructor(props: MessagingProps) {
        super(props);
        this.handleSendMessage = this.handleSendMessage.bind(this);
        this.handleReceiveMessage = this.handleReceiveMessage.bind(this);
        this.handleMessageInputChange = this.handleMessageInputChange.bind(this);
        this.handleMessageInputSubmit = this.handleMessageInputSubmit.bind(this);
        this.addMessage = this.addMessage.bind(this);

        this.props.setReceiveMessageHandler(this.handleReceiveMessage);
    }

    /**
     * Handles messages sent over RTC send channel.
     */
    handleSendMessage(msg: Types.Message): void {
        this.setState({ messageInputText: '' });
        if (
            this.props.currentRoom.rtcConnection &&
            this.props.currentRoom.rtcConnection.sendMessage(JSON.stringify(msg))
        ) {
            this.addMessage(msg);
        }
    }

    /*
     * Adds message to display in UI
     */
    // TODO: create message actions
    addMessage = (msg: Types.Message): void => {
        const updatedRoom = this.props.currentRoom;
        updatedRoom.messages.push(msg);
        this.props.updateRoom(updatedRoom.roomid, updatedRoom);
    };

    /**
     * Handles messages received over RTC receive channel.
     */
    handleReceiveMessage(event: MessageEvent): void {
        this.addMessage(JSON.parse(event.data));
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
            this.props.currentRoom.messages &&
            this.props.currentRoom.messages.map((msg, idx) => <MessageContainer key={idx} message={msg} />);
        const openConnection = !this.props.currentRoom.requestSent || this.props.channelsOpen;
        return (
            <div className="messaging">
                <div className="messaging-input">
                    {this.props.currentRoom.messages.length > 0 && <div className="messaging-inbox">{messages}</div>}
                    <div className="messaging-container">
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
                            <p className="messaging-connecting-msg">Connecting ... please wait.</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

export default Messaging;
