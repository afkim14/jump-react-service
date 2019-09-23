import openSocket from 'socket.io-client';
import Constants from '../constants/Constants';

const socket = openSocket(`${Constants.SERVER_HOST}:${Constants.SERVER_PORT}`);

export default socket;
