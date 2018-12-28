import actionTypes from './constants.jsx';

export function connection(isConnected) {
    return {
        type: actionTypes.Connection,
        isConnected: isConnected
    };
}

export function subscriptionsList(list) {
    return {
        type: actionTypes.SubscriptionsList,
        list: list
    };
}

export function refresh(update) {
    return {
        type: actionTypes.Refresh,
        update: update
    };
}
