import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Chart from '../Chart';

class Dashboard extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        if (!this.props.connection.isConnected) {
            return (
                <div>Connecting to server...</div>
            );
        }
        return (
            <div>
                <div>Connected</div>
                <div><Chart /></div>
            </div>
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
