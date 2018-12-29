import actionTypes from '../components/constants.jsx';

const initialState = {}; // type => [{hostname, values}]

export default function (state = initialState, action) {
    switch (action.type) {
        case actionTypes.SubscriptionsList: {
            let newState = state;
            Object.keys(action.list).forEach(type => {
                newState = {
                    ...newState,
                    [type]: typeof (action.list[type]) === 'object' ? action.list[type] : {}
                };
            });
            return newState;
        }
        case actionTypes.Refresh:
            return {
                ...state,
                ...action.update
            };
        default:
            return state;
    }
}
