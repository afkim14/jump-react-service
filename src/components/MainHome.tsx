import React, { Component } from 'react';
import './MainHome.css';
import LeftTabBar from './LeftTabBar';
import CustomButton from './CustomButton';
import CustomTextInput from './CustomTextInput';

type MainHomeProps = {

}

type MainHomeState = {
    sendTo: string
}

export default class MainHome extends Component<MainHomeProps, MainHomeState> {
    state: MainHomeState = {
        sendTo: ''
    }

    handleSendTo = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ sendTo: e.target.value });
    }

    render() {
        return (
            <div >
                <LeftTabBar />
                <CustomTextInput
                    onChange={this.handleSendTo}
                    placeholder={'Send to ...'}
                    style={{margin: 0}}
                    />
            </div>
        )
    }
}