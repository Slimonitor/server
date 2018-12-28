import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';

class Dashboard extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>React is ready.</div>
        );
    }

}

Dashboard.propTypes = {

};

// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.
function selector(state) {
    return state;
}

export default connect(selector)(Dashboard);
