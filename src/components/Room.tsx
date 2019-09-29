import React, { Component } from 'react';
import './Room.css';
import Constants from '../constants/Constants';
import * as Types from '../constants/Types';
import socket from '../constants/socket-context';
import Messaging from './Messaging';

type RoomProps = {
    currentRoom: Types.Room;
    displayName: Types.UserDisplay;
    onInitialSend: Function;
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
                {
                    !this.props.currentRoom.requestSent ? (
                        <div className="room-connection-container">
                            {Object.keys(this.props.currentRoom.invited).map((userid, i) => {
                                if (userid === this.props.displayName.userid) {
                                    return;
                                }

                                return (
                                    <div key={i}>
                                        <div className="room-receipient-circle-icon" style={{ backgroundColor: this.props.currentRoom.invited[userid].displayName.color }} />
                                        <p className="room-receipient-username">{this.props.currentRoom.invited[userid].displayName.displayName}</p>
                                        <p className="room-connection-msg">Drag file or send message to begin file transfer</p>
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
                                        <div className="room-connected-receipient-circle-icon" style={{ backgroundColor: this.props.currentRoom.invited[userid].displayName.color }} />
                                        <p className="room-connected-receipient-username">{this.props.currentRoom.invited[userid].displayName.displayName}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )
                }
                <Messaging 
                    displayName={this.props.displayName}
                    currentRoom={this.props.currentRoom} 
                    onInitialSend={this.props.onInitialSend}
                />
            </div>
        );
    }
}

export default Room;
