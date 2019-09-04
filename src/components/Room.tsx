import React, { Component } from 'react';
import './Room.css';
import CustomButton from './CustomButton';
import Constants from '../Constants';
import CopyToClipboard from 'react-copy-to-clipboard';
import * as Types from '../Types';

type RoomProps = {
    socket: SocketIOClient.Socket;
    roomid: string;
};

type RoomState = {
    usersConnected: Types.UserDisplayMap;
    validating: boolean;
    error: string;
    linkCopied: boolean;
};

export default class Room extends Component<RoomProps, RoomState> {
    state: RoomState = {
        usersConnected: {},
        validating: false,
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
            return <p>{this.state.error}</p>;
        }

        const shareLink = `http://localhost:3000/home/${this.props.roomid}`;
        return (
            <div className="room-container">
                <p className="room-link">{shareLink}</p>
                <CopyToClipboard text={shareLink} onCopy={(): void => this.setState({ linkCopied: true })}>
                    <CustomButton
                        disabled={this.state.linkCopied ? true : false}
                        text={this.state.linkCopied ? 'Copied' : 'Copy'}
                    />
                </CopyToClipboard>
                {Object.keys(this.state.usersConnected).map((userid, i) => {
                    return <p key={i}>{this.state.usersConnected[userid].displayName}</p>;
                })}
            </div>
        );
    }
}
