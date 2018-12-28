import React from 'react';
import {render} from 'react-dom';
import { applyMiddleware, compose, createStore } from 'redux';
import { Provider } from 'react-redux';
import { Route, Switch } from 'react-router'; // react-router v4
import { ConnectedRouter, routerMiddleware } from 'connected-react-router';
import { createBrowserHistory } from 'history';

import Dashboard from './Dashboard';
import rootReducer from '../reducers';

const initialState = {};
const history = createBrowserHistory();
const store = createStore(
    rootReducer(history), // root reducer with router state
    initialState,
    compose(
        applyMiddleware(
            routerMiddleware(history) // for dispatching history actions
            // ... other middlewares ...
        )
    )
);

render(
    <Provider store={store}>
        <ConnectedRouter history={history} onUpdate={() => {window.scrollTo(0, 0);}}>
            <Switch>
                <Route path='*' component={Dashboard} />
            </Switch>
        </ConnectedRouter>
    </Provider>,
    document.getElementById('AppContainer')
);
