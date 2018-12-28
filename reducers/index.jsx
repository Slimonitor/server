import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import connection from './connection.jsx';
import subscriptions from './subscriptions.jsx';

export default (history) => combineReducers({
    connection: connection,
    subscriptions: subscriptions,
    router: connectRouter(history)
});
