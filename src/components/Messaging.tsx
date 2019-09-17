import React, { Component } from 'react';

type MessageTransferProps = {};

type MessageTransferState = {
    connectButtonDisabled: boolean;
    disconnectButtonDisabled: boolean;
    messageInputDisabled: boolean;
    messageInputText: string;
    messages: string[];
};

class MessageTransfer extends Component<MessageTransferProps, MessageTransferState> {
    state: MessageTransferState = {
        connectButtonDisabled: false,
        disconnectButtonDisabled: true,
        messageInputDisabled: true,
        messageInputText: '',
        messages: [],
    };

    remoteConnection: any;
    localConnection: any;
    sendChannel: any;
    receiveChannel: any;

    constructor(props: MessageTransferProps) {
        super(props);
        this.handleMessageInputChange = this.handleMessageInputChange.bind(this);
        this.handleMessageInputSubmit = this.handleMessageInputSubmit.bind(this);
        this.handleReceiveMessage = this.handleReceiveMessage.bind(this);
    }

    connectPeers = () => {
        this.localConnection = new RTCPeerConnection();

        this.sendChannel = this.localConnection.createDataChannel('sendChannel');

        this.sendChannel.onopen = this.handleSendChannelStatusChange;
        this.sendChannel.onclose = this.handleSendChannelStatusChange;

        this.remoteConnection = new RTCPeerConnection();
        this.remoteConnection.ondatachannel = this.receiveChannelCallback;

        // TODO: provide method of connection and agree over server, and not with single client
        this.localConnection.onicecandidate = (e: RTCPeerConnectionIceEvent) =>
            !e.candidate || this.remoteConnection.addIceCandidate(e.candidate).catch(this.handleAddCandidateError);

        this.remoteConnection.onicecandidate = (e: RTCPeerConnectionIceEvent) =>
            !e.candidate || this.localConnection.addIceCandidate(e.candidate).catch(this.handleAddCandidateError);

        this.localConnection
            .createOffer()
            .then((offer: RTCSessionDescriptionInit) => this.localConnection.setLocalDescription(offer))
            // TODO: send signal over server
            .then(() =>
                this.remoteConnection.setRemoteDescription(this.localConnection
                    .localDescription as RTCSessionDescription),
            )
            .then(() => this.remoteConnection.createAnswer())
            .then((answer: RTCSessionDescriptionInit) => this.remoteConnection.setLocalDescription(answer))
            .then(() =>
                this.localConnection.setRemoteDescription(this.remoteConnection
                    .localDescription as RTCSessionDescription),
            )
            .catch(this.handleCreateDescriptionError);
    };

    disconnectPeers = () => {
        this.sendChannel.close();
        this.receiveChannel.close();

        this.localConnection.close();
        this.remoteConnection.close();

        this.sendChannel = null;
        this.receiveChannel = null;
        this.localConnection = null;
        this.remoteConnection = null;

        this.setState({
            connectButtonDisabled: false,
            disconnectButtonDisabled: true,
            messageInputDisabled: true,
            messageInputText: '',
        });
    };

    handleSendChannelStatusChange = (event: RTCDataChannelEvent) => {
        if (this.sendChannel) {
            let state = this.sendChannel.readyState;

            if (state === 'open') {
                this.setState({
                    connectButtonDisabled: true,
                    disconnectButtonDisabled: false,
                    messageInputDisabled: false,
                });
            } else {
                this.setState({
                    connectButtonDisabled: false,
                    disconnectButtonDisabled: true,
                    messageInputDisabled: true,
                });
            }
        }
    };

    receiveChannelCallback = (event: RTCDataChannelEvent) => {
        this.receiveChannel = event.channel;
        this.receiveChannel.onmessage = this.handleReceiveMessage;
        this.receiveChannel.onopen = this.handleReceiveChannelStatusChange;
        this.receiveChannel.onclose = this.handleReceiveChannelStatusChange;
    };

    handleAddCandidateError = () => {
        console.log('Something went wrong with adding the candidate');
    };

    handleCreateDescriptionError = (error: Error) => {
        console.log('Unable to create an offer due to error: ' + error.toString());
    };

    handleLocalAddCandidateSuccess() {
        this.setState({
            connectButtonDisabled: true,
        });
    }

    handleRemoteAddCandidateSuccess() {
        this.setState({
            disconnectButtonDisabled: false,
        });
    }

    handleReceiveMessage(event: MessageEvent) {
        this.setState(state => {
            const messages = [...state.messages, event.data];
            return {
                messages,
            };
        });
    }

    handleReceiveChannelStatusChange() {
        if (this.receiveChannel) {
            console.log("Receive channel's status has changed to " + this.receiveChannel.readyState);
        }
    }

    sendMessage(msg: string) {
        this.sendChannel.send(msg);
    }

    handleMessageInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState({ messageInputText: event.currentTarget.value });
    }

    handleMessageInputSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        this.sendMessage(this.state.messageInputText);
        this.setState({
            messageInputText: '',
        });
    }

    render() {
        const messages = this.state.messages.map((msg, idx) => (
            <p key={idx}>
                {msg}
                <br />
            </p>
        ));
        return (
            <div className="message-transfer">
                <div className="message-input">
                    <form onSubmit={this.handleMessageInputSubmit}>
                        <input
                            type="text"
                            size={64}
                            value={this.state.messageInputText}
                            onChange={this.handleMessageInputChange}
                        />
                        <input type="submit" value="Send" disabled={this.state.messageInputDisabled} />
                    </form>
                </div>
                <button
                    id="connect-button"
                    disabled={this.state.connectButtonDisabled}
                    className="buttonleft"
                    onClick={this.connectPeers}
                >
                    Connect
                </button>
                <button
                    id="disconnect-button"
                    className="button-right"
                    disabled={this.state.disconnectButtonDisabled}
                    onClick={this.disconnectPeers}
                >
                    Disconnect
                </button>
                <div className="messages-inbox">{messages}</div>
            </div>
        );
    }
}

export default MessageTransfer;
