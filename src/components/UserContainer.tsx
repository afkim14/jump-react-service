import React, { Component } from 'react';
import '../assets/components/UserContainer.scss';
import * as Types from '../constants/Types';

type UserContainerProps = {
    displayName: Types.UserDisplay;
    onClick?: () => void;
    onLeaveRoom?: () => void;
    requestSent?: boolean;
    accepted?: boolean;
    currentRoom?: boolean;
};

type UserContainerState = {
    hovered: boolean;
};

export default class UserContainer extends Component<UserContainerProps, UserContainerState> {
    state: UserContainerState = {
        hovered: false,
    };

    render(): React.ReactNode {
        const currentRoomNoAction = !this.props.accepted && !this.props.requestSent && this.props.currentRoom;
        const acceptedStatusHtmlContent = <p className="user-display-status">Accepted</p>;
        const pendingStatusHtmlContent = <p className="user-display-status">Pending</p>;
        const status = this.props.accepted
            ? acceptedStatusHtmlContent
            : this.props.requestSent && pendingStatusHtmlContent;

        return (
            <div
                className={`user-container ${this.props.currentRoom &&
                    'user-container-current'} ${currentRoomNoAction && 'user-container-initial'}`}
                onMouseDown={(): void => {
                    this.props.onClick && this.props.onClick();
                }}
                onMouseEnter={(): void => {
                    this.setState({ hovered: true });
                }}
                onMouseLeave={(): void => {
                    this.setState({ hovered: false });
                }}
            >
                <div
                    className={`user-display-icon ${currentRoomNoAction && 'user-display-light'}`}
                    style={{ backgroundColor: this.props.displayName.color }}
                />
                <p className={`user-display-text ${currentRoomNoAction && 'user-display-light'}`}>
                    {this.props.displayName.displayName}
                </p>
                {this.state.hovered && this.props.onLeaveRoom ? (
                    <div
                        className={'user-container-x-container'}
                        onClick={(): void => {
                            this.props.onLeaveRoom && this.props.onLeaveRoom();
                        }}
                    >
                        x
                    </div>
                ) : (
                    status
                )}
            </div>
        );
    }
}
