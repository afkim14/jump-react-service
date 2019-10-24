import React from 'react';
import * as Types from '../constants/Types';
import CustomButton from './CustomButton';
import './TransferRequest.css';

type TransferRequestProps = {
    roomInvite: Types.RoomInvite;
    visible: boolean;
    acceptRequest: () => void;
    declineRequest: () => void;
};

type TransferRequestState = {};

export default class TransferRequest extends React.Component<TransferRequestProps, TransferRequestState> {
    handleOk = (): void => {
        this.props.acceptRequest();
    };

    handleCancel = (): void => {
        this.props.declineRequest();
    };

    render(): React.ReactNode {
        if (!this.props.visible) {
            return <span></span>;
        }
        return (
            <div className="transfer-request-background">
                <div className="transfer-request-modal">
                    <div
                        className="transfer-request-icon"
                        style={{ backgroundColor: this.props.roomInvite.sender.color }}
                    />
                    <p className="transfer-request-msg">
                        <strong>{this.props.roomInvite.sender.displayName}</strong> has requested to start a file
                        transfer.
                    </p>
                    <CustomButton className="transfer-request-accept-btn" text="Accept" onClick={this.handleOk} />
                    <CustomButton className="transfer-request-reject-btn" text="Decline" onClick={this.handleCancel} />
                </div>
            </div>
        );
    }
}
