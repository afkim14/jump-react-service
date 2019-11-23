import React, { Component } from 'react';
import Constants from '../constants/Constants';
import * as Types from '../constants/Types';
import socket from '../constants/socket-context';
import Messaging from './Messaging';
import FileTransfer from './FileTransfer';
import ConnectedRoom from '../components/ConnectedRoom';

type RoomProps = {
    currentRoom: Types.Room;
    displayName: Types.UserDisplay;
    updateRoom: (roomId: string, room: Types.Room) => void;
};

type RoomState = {
    sendChannelOpen: boolean;
    receiveChannelOpen: boolean;
    receiveMessageHandler: any;
    receiveFileHandler: any;
};

export default class Room extends Component<RoomProps, RoomState> {
    state: RoomState = {
        sendChannelOpen: false,
        receiveChannelOpen: false,
        receiveMessageHandler: null,
        receiveFileHandler: null,
    };

    componentDidMount(): void {
        // Attempt to connect to room when this component loads.
        socket.emit(Constants.CONNECT_TO_ROOM, { roomId: this.props.currentRoom.roomId });

        if (this.props.currentRoom.rtcConnection) {
            this.props.currentRoom.rtcConnection.connectPeers(
                `${this.props.currentRoom.roomId}-data-channel`,
                this.props.displayName.userId === this.props.currentRoom.owner,
            );
            this.props.currentRoom.rtcConnection.setHandleSendChannelStatusChange(this.handleSendChannelStatusChange);
            this.props.currentRoom.rtcConnection.setHandleReceiveChannelStatusChange(
                this.handleReceiveChannelStatusChange,
            );
            
            // this.props.currentRoom.rtcConnection.setReceiveDataHandler(this.handleReceiveData);

            this.props.currentRoom.rtcConnection.setSendChannelBinaryType('arraybuffer');
            this.props.currentRoom.rtcConnection.setReceiveChannelBinaryType('arraybuffer');
        }
    }

    /**
     * Custom handler for status change on send channel. Needed to re-render component.
     */
    handleSendChannelStatusChange = (open: boolean): void => {
        this.setState({ sendChannelOpen: open });
    };

    /**
     * Custom handler for status change in receive channel. Needed to re-render component.
     */
    handleReceiveChannelStatusChange = (open: boolean): void => {
        this.setState({ receiveChannelOpen: open });
    };

    handleReceiveData = (event: MessageEvent): void => {
        // TODO: HAVE TO FIND A WAY TO DIFFERENTIATE DATA FOR MESSAGES AND FILE DATA (some property?)
        if (this.state.receiveMessageHandler) {
            this.state.receiveMessageHandler(event);
        }

        // if (this.state.receiveFileHandler) {
        //     this.state.receiveFileHandler(event);
        // }
    };

    setReceiveMessageHandler = (handler: any): void => {
        this.setState({ receiveMessageHandler: handler });
    };

    setReceeiveFileHandler = (handler: any): void => {
        this.setState({ receiveFileHandler: handler });
    };

    render(): React.ReactNode {
        return (
            <div className="standard-container-padding">
                <ConnectedRoom currentRoom={this.props.currentRoom} displayName={this.props.displayName} />
                <FileTransfer
                    displayName={this.props.displayName}
                    currentRoom={this.props.currentRoom}
                    channelsOpen={this.state.receiveChannelOpen && this.state.sendChannelOpen}
                    setReceiveFileHandler={this.setReceeiveFileHandler}
                    updateRoom={this.props.updateRoom}
                />
                <Messaging
                    displayName={this.props.displayName}
                    currentRoom={this.props.currentRoom}
                    channelsOpen={this.state.receiveChannelOpen && this.state.sendChannelOpen}
                    setReceiveMessageHandler={this.setReceiveMessageHandler}
                    updateRoom={this.props.updateRoom}
                />
            </div>
        );
    }
}
