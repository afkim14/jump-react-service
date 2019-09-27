import React, { Component } from 'react';
import './NewRoom.css';
import Constants from '../constants/Constants';
import * as Types from '../constants/Types';
import socket from '../constants/socket-context';
import Messaging from './Messaging';

type NewRoomProps = {
    currentRoom: Types.Room;
    displayName: Types.UserDisplay;
};

type NewRoomState = {
    validating: boolean;
    error: string;
    linkCopied: boolean;
    full: boolean;
    owner: string;
};

class NewRoom extends Component<NewRoomProps, NewRoomState> {
    state: NewRoomState = {
        validating: true,
        error: '',
        linkCopied: false,
        full: false,
        owner: '',
    };

    componentDidMount(): void {
        console.log(this.props.currentRoom);

        // Attempt to connect to room when this component loads.
        socket.emit(Constants.CONNECT_TO_ROOM, { roomid: this.props.currentRoom.roomid });

        // If owner of room, send room invites
        if (this.props.displayName.userid === this.props.currentRoom.owner) {
            socket.emit(Constants.SEND_ROOM_INVITES, this.props.currentRoom.invited);
        }
    }

    render(): React.ReactNode {
        return (
            <div className="room-container standard-container-padding">
                <p className="room-welcome-msg">Receipients</p>
                {Object.keys(this.props.currentRoom.invited).map((userid, i) => {
                    if (userid === this.props.displayName.userid) {
                        return;
                    }

                    return (
                        <div key={i} className="connected-user-container">
                            <div
                                className="user-display-icon"
                                style={{ backgroundColor: this.props.currentRoom.invited[userid].color }}
                            ></div>
                            <p className="user-display-text">{this.props.currentRoom.invited[userid].displayName}</p>
                        </div>
                    );
                })}
                <br />
                <br />
                <br />
                {
                    this.props.currentRoom.accepted ? (
                        <div>
                            <Messaging roomOwner={this.state.owner === socket.id} />
                            {/* <FileTransfer roomOwner={this.state.owner === socket.id}/> */}
                        </div>
                    ) : (
                        <div>
                            <input placeholder={'send message to start request'} />
                        </div>
                    )
                }
            </div>
        );
    }
}

export default NewRoom;
