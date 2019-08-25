import React, { Component } from 'react';
import './SignUp.css';
import CustomButton from './CustomButton';
import CustomTextInput from './CustomTextInput';

type SignUpProps = {
    toLogin: Function,
}

type SignUpState = {
    firstname: string,
    lastname: string,
    email: string,
    password: string
}

export default class SignUp extends Component<SignUpProps, SignUpState> {
    handleFirstnameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // TODO: validate length, non-numeric values
        this.setState({ firstname: e.target.value });
    }

    handleLastnameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // TODO: validate length, non-numeric values
        this.setState({ lastname: e.target.value });
    }

    handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // TODO: validate email format
        this.setState({ email: e.target.value });
    }

    handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // TODO: valid password length, strength (?)
        this.setState({ password: e.target.value });
    }

    submit = () => {
        // handle registration
        if (!this.state.firstname || !this.state.lastname || !this.state.email || !this.state.password) {
            return;
        }
    }

    render() {
        return (
            <div>
                <CustomTextInput 
                    onChange={this.handleFirstnameChange} 
                    placeholder={'Firstname'} 
                    />
                <CustomTextInput 
                    onChange={this.handleLastnameChange} 
                    placeholder={'Lastname'} 
                    />
                <CustomTextInput 
                    onChange={this.handleEmailChange} 
                    placeholder={'Email'} 
                    />
                <CustomTextInput 
                    onChange={this.handlePasswordChange} 
                    placeholder={'Password'} 
                    type={'password'}
                    />
                <CustomButton
                    onClick={this.submit}
                    text={'Create Account'}
                    />
                <span className="go-to-login-msg">
                    Already an user? Login&nbsp;
                    <a className="link" onClick={() => {this.props.toLogin()}}>{'here.'}</a>
                </span>
            </div>
        )
    }
}