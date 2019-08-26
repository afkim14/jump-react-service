import React, { Component } from 'react';
import './Login.css';
import CustomButton from './CustomButton';
import CustomTextInput from './CustomTextInput';

type LoginProps = {
    toSignUp: Function,
}

type LoginState = {
    email: string,
    password: string
}

export default class Login extends Component<LoginProps, LoginState> {
    handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ email: e.target.value });
    }

    handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ password: e.target.value });
    }

    render() {
        return (
            <div>
                <CustomTextInput 
                    onChange={this.handleEmailChange} 
                    placeholder={'Email'}
                    />
                <CustomTextInput 
                    onChange={this.handlePasswordChange} 
                    placeholder={'Password'} 
                    type={'password'}
                    />
                <span className="go-to-sign-up-msg">
                    Not registered? Register&nbsp;
                    <a className="link" onClick={() => {this.props.toSignUp()}}>{'here.'}</a>
                </span>
            </div>
        )
    }
}