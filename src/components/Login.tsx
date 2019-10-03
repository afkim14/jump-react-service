import React from 'react';
import { A } from 'hookrouter';
import logoImg from '../assets/images/logo-01.png';
import CustomButton from './CustomButton';
import './Login.css';

const Login: React.SFC = () => {
    return (
        <div>
            <div className="home-container">
                <img className="home-logo" src={logoImg} alt={'Jump Logo'} />
                <p className="home-logo-text">JUMP</p>
                <p className="home-blurb">Send files of any size without saving it anywhere.</p>
                <A href="/home" className="home-guest-button">
                    <CustomButton text={'Continue as guest'} style={{ backgroundColor: '#F4976C' }} />
                </A>
            </div>
            <div className="mobile-container">
                <img className="home-logo" src={logoImg} alt={'Jump Logo'} />
                <p className="home-logo-text">JUMP</p>
                <p className="home-blurb">Sorry, this service is not available on mobile.</p>
            </div>
        </div>
    );
};

export default Login;
