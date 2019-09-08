import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { useRoutes } from 'hookrouter';
import routes from './constants/routes';
import * as serviceWorker from './constants/serviceWorker';

import { NotFoundPage } from './components/NotFoundPage';

// TODO: Couldn't find what type this is supposed to be
function App(): any {
    const routeResult = useRoutes(routes) || NotFoundPage;
    return routeResult;
}

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
