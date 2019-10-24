import React, { FC } from 'react';
import { ConnectedUserMap, UserDisplay } from '../constants/Types';
import './RoomAwaiting.css';

type RoomAwaitingProps = {
    displayName: UserDisplay,
    invited: ConnectedUserMap
};

// TODO: Style
const MessageContainer: FC<RoomAwaitingProps> = (props: RoomAwaitingProps) => (
    <div>
        <p>Awaiting...</p>
        {
            Object.keys(props.invited).map((userid, idx) => {
                if (userid === props.displayName.userid) {
                    return;
                }

                return (
                    <div key={idx}>
                        <p>{props.invited[userid].displayName.displayName}</p>
                        <p>{props.invited[userid].accepted ? 'Accepted' : 'Pending'}</p>
                    </div>   
                )
            })
        }
    </div>
);

export default MessageContainer;
