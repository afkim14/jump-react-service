import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import './App.css';
import logoImg from './assets/images/logo-01.png';
import CustomButton from './components/CustomButton';

type AppState = {};

export default class App extends Component<RouteComponentProps, AppState> {
    continueAsGuest = (): void => {
        this.props.history.push('/home');
    };

    render(): React.ReactNode {
        return (
            <div>
                <div className="home-container">
                    <img className="home-logo" src={logoImg} />
                    <p className="home-logo-text">JUMP</p>
                    <p className="home-blurb">Send files of any size without saving it anywhere.</p>
                    <CustomButton
                        onClick={this.continueAsGuest}
                        text={'Continue as guest'}
                        style={{ backgroundColor: '#3e3e3e' }}
                    />
                </div>
                <div className="mobile-container">
                    <img className="home-logo" src={logoImg} />
                    <p className="home-logo-text">JUMP</p>
                    <p className="home-blurb">Sorry, this service is not available on mobile.</p>
                </div>
            </div>
        );
    }
}
