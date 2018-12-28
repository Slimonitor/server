import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

export default (history) => combineReducers({
    //count: counterReducer,
    router: connectRouter(history)
});
