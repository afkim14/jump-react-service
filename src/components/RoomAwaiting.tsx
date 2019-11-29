import React, { FC } from 'react';
import { ConnectedUserMap, UserDisplay } from '../constants/Types';
import '../assets/components/RoomAwaiting.scss';

type RoomAwaitingProps = {
    displayName: UserDisplay;
    invited: ConnectedUserMap;
};

const MessageContainer: FC<RoomAwaitingProps> = (props: RoomAwaitingProps) => (
    <div className="room-awaiting-container">
        {Object.keys(props.invited).map((userid, idx) => {
            if (userid === props.displayName.userid) {
                return;
            }

            return (
                <div key={idx}>
                    <div
                        className="room-awaiting-receipient-circle-icon"
                        style={{
                            backgroundColor: props.invited[userid].displayName.color,
                        }}
                    />
                    <p className="room-awaiting-receipient-username">{props.invited[userid].displayName.displayName}</p>
                    <p
                        className={`room-awaiting-status ${!props.invited[userid].accepted &&
                            'room-awaiting-status-pulsing'}`}
                    >
                        {props.invited[userid].accepted ? 'Accepted' : 'Pending...'}
                    </p>
                </div>
            );
        })}
    </div>
);

export default MessageContainer;
