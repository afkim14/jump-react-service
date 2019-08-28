import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import './App.css';
import logoImg from './assets/images/logo-01.png';
import Constants from './Constants';
import Login from './components/Login';
import SignUp from './components/SignUp';
import CustomButton from './components/CustomButton';
import User from './User';

type AppState = {
    userAuthState: string;
};

export default class App extends Component<RouteComponentProps, AppState> {
    public readonly state: Readonly<AppState> = {
        userAuthState: Constants.SIGN_UP,
    };

    changeAuthState = (state: string): void => {
        this.setState({ userAuthState: state });
    };

    signInWithGoogle = (): void => {};

    continueAsGuest = (): void => {
        // todo: send temporary user data
        this.props.history.push('/home');
        //user: new User('id', 'slowturtle19'),
    };

    render(): React.ReactNode {
        return (
            <div className="home-container">
                <img className="home-logo" src={logoImg} />
                <p className="home-logo-text">JUMP</p>
                <p className="home-blurb">Send files of any size without saving it anywhere.</p>
                {this.state.userAuthState === Constants.LOGIN ? (
                    <Login
                        toSignUp={(): void => {
                            this.changeAuthState(Constants.SIGN_UP);
                        }}
                    />
                ) : (
                    <SignUp
                        toLogin={(): void => {
                            this.changeAuthState(Constants.LOGIN);
                        }}
                    />
                )}
                <CustomButton
                    onClick={this.signInWithGoogle}
                    text={'Sign in with Google'}
                    style={{ backgroundColor: '#4688f1' }}
                />
                <div className="or-break-line">
                    <div className="break-line" />
                    <p className="or-msg">or</p>
                    <div className="break-line" />
                </div>
                <div style={{ clear: 'both' }} />
                <CustomButton
                    onClick={this.continueAsGuest}
                    text={'Continue as guest'}
                    style={{ backgroundColor: '#3e3e3e' }}
                />
            </div>
        );
    }
}
