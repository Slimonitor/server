import actionTypes from '../components/constants.jsx';

const initialState = {
    isConnected: false
};

export default function modal(state = initialState, action) {
    switch (action.type) {
        case actionTypes.Connection:
            return {
                ...state,
                isConnected: action.isConnected
            };
        default:
            return state;
    }
}
