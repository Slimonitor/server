import actionTypes from '../components/constants.jsx';

const initialState = {}; // type => {}

export default function (state = initialState, action) {
    switch (action.type) {
        case actionTypes.SubscriptionsList: {
            let newState = state;
            action.list.forEach(type => {
                newState = {
                    ...newState,
                    [type]: {}
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
