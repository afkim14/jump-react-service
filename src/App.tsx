import React, { Component } from 'react';
import './App.css';
import logoImg from './assets/images/logo-01.png';
import { Constants } from './Constants';
import Login from './components/Login';
import SignUp from './components/SignUp';
import CustomButton from './components/CustomButton';

type AppProps = {}
type AppState = {
  userAuthState: string
}

export default class App extends Component<AppProps, AppState> {
  public readonly state: Readonly<AppState> = {
    userAuthState: Constants.SIGN_UP
  }

  changeAuthState = (state: string) => {
    this.setState({ userAuthState: state });
  }

  signInWithGoogle = () => {
    
  }

  render() {
    return (
      <div className="home-container">
        <img className="home-logo" src={logoImg}/>
        <p className="home-logo-text">JUMP</p>
        <p className="home-blurb">Send files of any size without saving it anywhere.</p>
        {
          this.state.userAuthState === Constants.LOGIN ? (
            <Login toSignUp={() => {this.changeAuthState(Constants.SIGN_UP)}} />
          ) : (
            <SignUp toLogin={() => {this.changeAuthState(Constants.LOGIN)}} />
          )
        }
        <div className="or-break-line">
          <div className="break-line" />
          <p className='or-msg'>or</p>
          <div className="break-line" />
        </div>
        <div style={{clear: 'both'}}/>
        <CustomButton
          onClick={this.signInWithGoogle}
          text={'Sign in with Google'}
          style={{backgroundColor: '#4688f1'}}
          />
      </div>
    );
  }
}
