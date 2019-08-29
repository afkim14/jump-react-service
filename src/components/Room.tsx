import React, { Component } from 'react';
import './Room.css';
import Constants from '../Constants';

type UsersConnected = {
    users: Array<string>;
};

type RoomProps = {
    socket: SocketIOClient.Socket;
    roomid: string;
};

type RoomState = {
    usersConnected: Array<string>;
    validating: boolean;
    error: string;
};

type ConnectRoomFailData = {
    error: string;
};

export default class Room extends Component<RoomProps, RoomState> {
    state: RoomState = {
        usersConnected: [],
        validating: false,
        error: '',
    };

    componentDidMount(): void {
        /**
         * This is called whenever a user joins or leaves the room.
         */
        this.props.socket.on(Constants.USERS_CONNECTED, (data: UsersConnected) => {
            this.setState({ usersConnected: data.users, validating: false });
            console.log(`Users connected: ${data.users}`);
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
        this.props.socket.on(Constants.CONNECT_TO_ROOM_FAIL, (data: ConnectRoomFailData) => {
            this.setState({ error: data.error, validating: false });
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

        return (
            <div>
                <div>{`Room ID: ${this.props.roomid}`}</div>
                {this.state.usersConnected.map((userid, i) => {
                    return <p key={i}>{userid}</p>;
                })}
            </div>
        );
    }
}
