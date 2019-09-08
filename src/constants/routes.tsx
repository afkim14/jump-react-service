import React from 'react';
import Login from '../components/Login';
import MainHome from '../components/MainHome';

// TODO: HELP, not sure how to fix these lint errors
const routes = {
    '/': () => <Login />,
    '/home': () => <MainHome />,
    '/home/:roomid': ({ roomid }: { [roomid: string]: string }) => <MainHome roomid={roomid} />,
};

export default routes;
