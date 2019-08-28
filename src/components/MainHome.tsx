import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import './MainHome.css';
import LeftTabBar from './LeftTabBar';
import CustomButton from './CustomButton';
import CustomTextInput from './CustomTextInput';
import Room from './Room';
import openSocket from 'socket.io-client';
import Constants from '../Constants';

type MainHomeState = {
    sendTo: string;
    socket: SocketIOClient.Socket;
    connectToRoom: boolean;
    roomid: string;
};

type ConnectRoomData = {
    roomid: string;
};

export default class MainHome extends Component<RouteComponentProps, MainHomeState> {
    state: MainHomeState = {
        sendTo: '',
        socket: openSocket(`${Constants.SERVER_HOST}:${Constants.SERVER_PORT}`),
        connectToRoom: false,
        roomid: '',
    };

    componentDidMount(): void {
        const path = window.location.pathname;
        const tokens = path.split('/');
        if (tokens.length > 2) {
            const roomid = tokens[tokens.length - 1];
            this.setState({ connectToRoom: true, roomid: roomid });
        }

        this.state.socket.on('CREATE_ROOM_SUCCESS', (data: ConnectRoomData) => {
            this.setState({ connectToRoom: true, roomid: data.roomid });
        });
    }

    handleSendTo = (e: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState({ sendTo: e.target.value });
    };

    createRoom = (): void => {
        this.state.socket.emit('CREATE_ROOM', { size: 2 });
    };

    render(): React.ReactNode {
        return (
            <div>
                <LeftTabBar />
                {this.state.connectToRoom ? (
                    <Room socket={this.state.socket} roomid={this.state.roomid} />
                ) : (
                    <div>
                        <CustomTextInput
                            onChange={this.handleSendTo}
                            placeholder={'Send to ...'}
                            style={{ margin: 0 }}
                        />
                        <CustomButton
                            onClick={this.createRoom}
                            text={'Create Room / Send Invite'}
                            style={{ margin: 0 }}
                        />
                    </div>
                )}
            </div>
        );
    }
}
