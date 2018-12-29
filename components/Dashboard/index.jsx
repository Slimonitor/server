import React, {Component} from 'react';
import PropTypes from 'prop-types';
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
        let list = Object.keys(this.props.subscriptions).join(', ');
        let chart = null;
        if (typeof(this.props.subscriptions.hostHealth) === 'object') {
            chart = (
                <Chart
                    title={'Current Load'}
                    axis={'timestamp'}
                    value={'currentLoad'}
                    data={this.props.subscriptions.hostHealth}
                />
            );
        }
        return (
            <div>
                <div>Connected. Current subscriptions: {list}</div>
                <div>{chart}</div>
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
