import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import connection from './connection.jsx';

export default (history) => combineReducers({
    connection: connection,
    router: connectRouter(history)
});
