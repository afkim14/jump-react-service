import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { useRoutes } from 'hookrouter';

import store from './store';
import * as serviceWorker from './constants/serviceWorker';
import './index.css';

import Login from './components/Login';
import MainHome from './components/MainHome';
import { NotFoundPage } from './components/NotFoundPage';

// TODO: HELP, not sure how to fix these lint errors
const routes = {
    '/': () => <Login />,
    '/home': () => <MainHome />,
};

// TODO: Couldn't find what type this is supposed to be
function App(): any {
    const routeResult = useRoutes(routes) || NotFoundPage;
    return routeResult;
}

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
