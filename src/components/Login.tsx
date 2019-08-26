import React, { Component } from 'react';
import './Login.css';
import CustomTextInput from './CustomTextInput';

type LoginProps = {
    toSignUp: Function;
};

type LoginState = {
    email: string;
    password: string;
};

export default class Login extends Component<LoginProps, LoginState> {
    handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState({ email: e.target.value });
    };

    handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState({ password: e.target.value });
    };

    render(): React.ReactNode {
        return (
            <div>
                <CustomTextInput onChange={this.handleEmailChange} placeholder={'Email'} />
                <CustomTextInput onChange={this.handlePasswordChange} placeholder={'Password'} type={'password'} />
                <span className="go-to-sign-up-msg">
                    Not registered? Register&nbsp;
                    {/* TODO: update to router link once home page is implemented */}
                    <a
                        className="link"
                        onClick={(): void => {
                            this.props.toSignUp();
                        }}
                    >
                        {'here.'}
                    </a>
                </span>
            </div>
        );
    }
}
