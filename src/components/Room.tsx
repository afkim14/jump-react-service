import React, { Component } from 'react';
import './Room.css';
import Constants from '../constants/Constants';
import CopyToClipboard from 'react-copy-to-clipboard';
import * as Types from '../constants/Types';
import socket from '../constants/socket-context';

import Messaging from './Messaging';
import FileTransfer from './FileTransfer';

type RoomProps = {
    roomid: string;
};

type RoomState = {
    room: Types.Room;
    validating: boolean;
    error: string;
    linkCopied: boolean;
    full: boolean;
};

class Room extends Component<RoomProps, RoomState> {
    state: RoomState = {
        room: { owner: '', size: 0, connected: {} },
        validating: true,
        error: '',
        linkCopied: false,
        full: false
    };

    componentDidMount(): void {
        /**
         * This is called whenever a user joins or leaves the room.
         */
        socket.on(Constants.ROOM_INFO, (room: Types.Room) => {
            const roomFull = Object.keys(room.connected).length === room.size;
            this.setState({ room, validating: false, full: roomFull });
        });

        /**
         * Failed to connect room either because room doesn't exist, or room is full.
         */
        socket.on(Constants.CONNECT_TO_ROOM_FAIL, (error: string) => {
            this.setState({ error, validating: false });
        });

        // Attempt to connect to room when this component loads.
        socket.emit(Constants.CONNECT_TO_ROOM, { roomid: this.props.roomid });
    }

    render(): React.ReactNode {
        if (this.state.validating) {
            return <div></div>;
        }

        if (this.state.error !== '') {
            return (
                <div className="room-container">
                    <p>{this.state.error}</p>
                </div>
            );
        }

        const shareLink = `http://localhost:3000/home/${this.props.roomid}`;
        return (
            <div className="room-container standard-container-padding">
                <p className="room-welcome-msg">Start sharing.</p>
                <CopyToClipboard text={shareLink} onCopy={(): void => this.setState({ linkCopied: true })}>
                    <p className="room-link">{shareLink}</p>
                </CopyToClipboard>
                <p className="room-link-copy-msg">{this.state.linkCopied ? 'Copied.' : 'Click to copy.'}</p>
                <p className="connected-users-header">Connected Users</p>
                {Object.keys(this.state.room.connected).map((userid, i) => {
                    return (
                        <div key={i} className="connected-user-container">
                            <div
                                className="user-display-icon"
                                style={{ backgroundColor: this.state.room.connected[userid].color }}
                            ></div>
                            <p className="user-display-text">{this.state.room.connected[userid].displayName}</p>
                        </div>
                    );
                })}
                <br />
                <br />
                <br />
                {
                    this.state.full && (
                        <div>
                            <Messaging roomOwner={this.state.room.owner === socket.id} />
                            {/* <FileTransfer roomOwner={this.state.room.owner === socket.id}/> */}
                        </div>
                    )
                }
            </div>
        );
    }
}

export default Room;
