import React, { Component } from 'react';
import './Room.css';
import Constants from '../constants/Constants';
import CopyToClipboard from 'react-copy-to-clipboard';
import * as Types from '../constants/Types';
import SocketContext from '../constants/socket-context';

import MessageTransfer from './Messaging';

type RoomProps = {
    roomid: string;
    socket: SocketIOClient.Socket;
};

type RoomState = {
    usersConnected: Types.UserDisplayMap;
    validating: boolean;
    error: string;
    linkCopied: boolean;
};

class Room extends Component<RoomProps, RoomState> {
    state: RoomState = {
        usersConnected: {},
        validating: true,
        error: '',
        linkCopied: false,
    };

    componentDidMount(): void {
        /**
         * This is called whenever a user joins or leaves the room.
         */
        this.props.socket.on(Constants.USERS_CONNECTED, (users: Types.UserDisplayMap) => {
            this.setState({ usersConnected: users, validating: false });
            console.log(`Users connected: ${users}`);
        });

        /**
         * Called when room is full and ready for P2P connection.
         * TODO: actually establish P2P connection given data from backend.
         */
        this.props.socket.on(Constants.ROOM_FULLY_CONNECTED, (data: object) => {
            console.log('Room fully connected');
        });

        /**
         * Failed to connect room either because room doesn't exist, or room is full.
         */
        this.props.socket.on(Constants.CONNECT_TO_ROOM_FAIL, (error: string) => {
            this.setState({ error, validating: false });
        });

        // Attempt to connect to room when this component loads.
        this.props.socket.emit(Constants.CONNECT_TO_ROOM, { roomid: this.props.roomid });
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
                {Object.keys(this.state.usersConnected).map((userid, i) => {
                    return (
                        <div key={i} className="connected-user-container">
                            <div
                                className="user-display-icon"
                                style={{ backgroundColor: this.state.usersConnected[userid].color }}
                            ></div>
                            <p className="user-display-text">{this.state.usersConnected[userid].displayName}</p>
                        </div>
                    );
                })}
                <br />
                <br />
                <br />
                <MessageTransfer />
            </div>
        );
    }
}

type RoomWithSocketProps = {
    roomid: string;
};

const RoomWithSocket: React.SFC<RoomWithSocketProps> = props => {
    return (
        <SocketContext.Consumer>
            {(socket: SocketIOClient.Socket): React.ReactNode => <Room {...props} socket={socket} />}
        </SocketContext.Consumer>
    );
};

export default RoomWithSocket;
