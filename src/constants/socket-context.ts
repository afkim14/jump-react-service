import openSocket from 'socket.io-client';
import { SERVER_HOST, SERVER_PORT } from './Constants';

const socket = openSocket(`${SERVER_HOST}:${SERVER_PORT}`);

export default socket;
