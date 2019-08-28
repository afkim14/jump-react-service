import React, { Component } from 'react';
import './Room.css';
import Constants from '../Constants';

type UserConnected = {
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
        this.props.socket.on('USER_CONNECTED', (data: UserConnected) => {
            this.setState({ usersConnected: data.users, validating: false });
            console.log(`Users connected: ${data.users}`);
        });

        this.props.socket.on('ROOM_FULLY_CONNECTED', (data: object) => {
            console.log('Room fully connected');
        });

        this.props.socket.on('CONNECT_TO_ROOM_FAIL', (data: ConnectRoomFailData) => {
            this.setState({ error: data.error, validating: false });
        });

        this.props.socket.emit('CONNECT_TO_ROOM', { roomid: this.props.roomid });
    }

    componentWillUnmount(): void {
        console.log('UNMOUNT');
        this.props.socket.emit('DISCONNECT_FROM_ROOM', { roomid: this.props.roomid });
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
