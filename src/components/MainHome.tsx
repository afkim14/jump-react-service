import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import './MainHome.css';
import LeftTabBar from './LeftTabBar';
import CustomButton from './CustomButton';
import Room from './Room';
import openSocket from 'socket.io-client';
import Constants from '../Constants';
import * as Types from '../Types';

type MainHomeState = {
    sendTo: string;
    connectToRoom: boolean;
    roomid: string;
    socket: SocketIOClient.Socket;
    displayName: Types.UserDisplay;
    users: Types.UserDisplayMap;
};

export default class MainHome extends Component<RouteComponentProps, MainHomeState> {
    state: MainHomeState = {
        sendTo: '',
        connectToRoom: false,
        roomid: '',
        socket: openSocket(`${Constants.SERVER_HOST}:${Constants.SERVER_PORT}`),
        displayName: { userid: '', displayName: '', color: '' },
        users: {},
    };

    componentDidMount(): void {
        // Get random username and a list of connected users
        this.state.socket.emit(Constants.GET_DISPLAY_NAME);
        this.state.socket.emit(Constants.GET_USERS);

        // If path contains /home/roomid, then attempt to connect to roomid.
        const path = window.location.pathname;
        const tokens = path.split('/');
        if (tokens.length > 2) {
            const roomid = tokens[tokens.length - 1];
            this.setState({ connectToRoom: true, roomid: roomid });
        }

        this.state.socket.on(Constants.DISPLAY_NAME, (displayName: Types.UserDisplay) => {
            this.setState({ displayName });
        });

        this.state.socket.on(Constants.USERS, (users: Types.UserDisplayMap) => {
            this.setState({ users });
        });

        // TODO: After creating room, user url should also update to contain the roomid extension
        this.state.socket.on(Constants.CREATE_ROOM_SUCCESS, (data: Types.ConnectRoom) => {
            this.setState({ connectToRoom: true, roomid: data.roomid });
        });
    }

    componentWillUnmount(): void {
        // IMPORTANT!: Have to close socket to trigger disconnect message on backend.
        this.state.socket.close();
    }

    /**
     * Creates room with relevant information.
     */
    createRoom = (): void => {
        // TODO: Placeholder value just to test connection.
        this.state.socket.emit(Constants.CREATE_ROOM, { size: 2 });
    };

    /**
     * Called when a user is clicked
     */
    selectUser = (displayName: Types.UserDisplay) => {
        return;
    };

    render(): React.ReactNode {
        return (
            <div>
                <LeftTabBar
                    displayName={this.state.displayName}
                    users={this.state.users}
                    selectUser={this.selectUser}
                />
                {this.state.connectToRoom ? (
                    <Room socket={this.state.socket} roomid={this.state.roomid} />
                ) : (
                    <div>
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
