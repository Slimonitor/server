import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Line} from 'react-chartjs-2';

class Chart extends Component {
    constructor(props) {
        super();
        this.displayName = props.title;
    }

    buildAxis(data) {
        let result = [];
        data.map(hostLevel => {
            return hostLevel.values.map(row => {
                return new Date(row.axis.year, row.axis.month - 1, row.axis.day,
                    row.axis.hour, row.axis.minute, row.axis.second);
            });
        }).forEach(hostLevel => {
            result = [...result, ...hostLevel];
        });
        return result;
    }

    buildDataForChart(data) {
        return {
            labels: this.buildAxis(data),
            datasets: data.map(hostLevel => {
                return {
                    label: hostLevel.hostname,
                    fill: false,
                    lineTension: 0.1,
                    backgroundColor: 'rgba(75,192,192,0.4)',
                    borderColor: 'rgba(75,192,192,1)',
                    borderCapStyle: 'butt',
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    pointBorderColor: 'rgba(75,192,192,1)',
                    pointBackgroundColor: '#fff',
                    pointBorderWidth: 1,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: 'rgba(75,192,192,1)',
                    pointHoverBorderColor: 'rgba(220,220,220,1)',
                    pointHoverBorderWidth: 2,
                    pointRadius: 1,
                    pointHitRadius: 10,
                    data: hostLevel.values.map(row => row[this.props.value])
                };
            })
        };
    }

    render() {
        const data = this.buildDataForChart(this.props.data);
        const options = {
            animation: false,
            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                        displayFormats: {
                            second: 'hh:mm:ss'
                        }
                    }
                }]
            }
        };
        return (
            <div>
                <h2>{this.props.title}</h2>
                <Line data={data} options={options} />
            </div>
        );
    }
}

Chart.propTypes = {
    title: PropTypes.string,
    axis: PropTypes.string,
    value: PropTypes.string,
    data: PropTypes.array
};


export default Chart;
