import React, { FC } from 'react';

import { UserDisplay } from '../constants/Types';
import './MainWelcome.css';

type MainWelcomeProps = {
    userDisplay: UserDisplay;
};

const MainWelcome: FC<MainWelcomeProps> = (props: MainWelcomeProps) => {
    return (
        <div className="main-welcome-container">
            <div>
                <p className="main-welcome-msg">{`Hello`}</p>
                <p className="main-welcome-msg-username">{`${props.userDisplay.displayName}!`}</p>
            </div>
            <div style={{ clear: 'both' }} />
            <p className="main-sub-msg">Begin sending files with the following steps:</p>
            <div className="main-step-container">
                <div className="main-step-icon">
                    <p className="main-step-number">1</p>
                </div>
                <p className="main-step-inst">Search and select a user using left nav bar.</p>
            </div>
            <div style={{ clear: 'both' }} />
            <div className="main-step-container">
                <div className="main-step-icon">
                    <p className="main-step-number">2</p>
                </div>
                <p className="main-step-inst">Send a message or a file request and wait for approval.</p>
            </div>
            <div style={{ clear: 'both' }} />
            <div className="main-step-container">
                <div className="main-step-icon">
                    <p className="main-step-number">3</p>
                </div>
                <p className="main-step-inst">Track the transfer process with detailed information.</p>
            </div>
        </div>
    );
};

export default MainWelcome;
