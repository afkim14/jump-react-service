import React, { Component } from 'react';
import './Room.css';
import Constants from '../constants/Constants';
import * as Types from '../constants/Types';
import socket from '../constants/socket-context';
import Messaging from './Messaging';
import FileTransfer from './FileTransfer';

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
                    <div className="room-connection-container">
                        {Object.keys(this.props.currentRoom.invited).map((userid, i) => {
                            if (userid === this.props.displayName.userid) {
                                return;
                            }

                            return (
                                <div key={i}>
                                    <div
                                        className="room-receipient-circle-icon"
                                        style={{
                                            backgroundColor: this.props.currentRoom.invited[userid].displayName.color,
                                        }}
                                    />
                                    <p className="room-receipient-username">
                                        {this.props.currentRoom.invited[userid].displayName.displayName}
                                    </p>
                                    <p className="room-connection-msg">
                                        Drag file or send message to begin file transfer
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="room-connected-container">
                        {Object.keys(this.props.currentRoom.invited).map((userid, i) => {
                            if (userid === this.props.displayName.userid) {
                                return;
                            }

                            return (
                                <div key={i}>
                                    <p
                                        className="room-connected-receipient-username"
                                        style={{
                                            backgroundColor: this.props.currentRoom.invited[userid].displayName.color,
                                        }}
                                    >
                                        {this.props.currentRoom.invited[userid].displayName.displayName}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}
                <FileTransfer
                    displayName={this.props.displayName}
                    currentRoom={this.props.currentRoom}
                    onInitialFileSend={this.props.onInitialFileSend}
                    updateCompletedFile={this.props.updateCompletedFile}
                />
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
