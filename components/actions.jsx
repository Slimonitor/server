import actionTypes from './constants.jsx';

export function connection(isConnected) {
    return {
        type: actionTypes.Connection,
        isConnected: isConnected
    }
}

export function refreshHealthData(data) {
    return {
        type: actionTypes.HealthData,
        data: data
    };
}
