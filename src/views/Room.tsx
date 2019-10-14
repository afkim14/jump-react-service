import React, { Component } from 'react';
import './Room.css';
import Constants from '../constants/Constants';
import * as Types from '../constants/Types';
import socket from '../constants/socket-context';
import Messaging from './Messaging';
import FileTransfer from './FileTransfer';
import PreConnectionRoom from '../components/PreConnectionRoom';
import ConnectedRoom from '../components/ConnectedRoom';

type RoomProps = {
    currentRoom: Types.Room;
    displayName: Types.UserDisplay;
    onInitialMessageSend: Function;
    onInitialFileSend: Function;
    addRoomMessage: Function;
    updateCompletedFile: Function;
};

type RoomState = {};

class Room extends Component<RoomProps, RoomState> {
    componentDidMount(): void {
        // Attempt to connect to room when this component loads.
        socket.emit(Constants.CONNECT_TO_ROOM, { roomid: this.props.currentRoom.roomid });
    }

    render(): React.ReactNode {
        return (
            <div className="room-container standard-container-padding">
                {!this.props.currentRoom.requestSent ? (
                    <PreConnectionRoom currentRoom={this.props.currentRoom} displayName={this.props.displayName} />
                ) : (
                    <ConnectedRoom currentRoom={this.props.currentRoom} displayName={this.props.displayName} />
                )}
                {/* <FileTransfer
                    displayName={this.props.displayName}
                    currentRoom={this.props.currentRoom}
                    onInitialFileSend={this.props.onInitialFileSend}
                    updateCompletedFile={this.props.updateCompletedFile}
                /> */}
                <Messaging
                    displayName={this.props.displayName}
                    currentRoom={this.props.currentRoom}
                    onInitialMessageSend={this.props.onInitialMessageSend}
                    addRoomMessage={this.props.addRoomMessage}
                />
            </div>
        );
    }
}

export default Room;
