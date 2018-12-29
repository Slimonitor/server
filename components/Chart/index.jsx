import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Line} from 'react-chartjs-2';

class Chart extends Component {
    constructor(props) {
        super();
        this.displayName = props.title;
        this.colors = {};
    }

    generateRandomColor() {
        return [1,2,3].map(() => {
            return Math.floor(Math.random() * (200 - 50 + 1)) + 50;
        });
    }

    buildDataForChart(data) {
        if (typeof(data.timeline) !== 'object') {
            return {};
        }
        return {
            labels: Object.keys(data.timeline).map(v => {return new Date(v);}),
            datasets: data.hosts.map((hostname, i) => {
                if (!this.colors[i]) {
                    this.colors[i] = this.generateRandomColor().join(',');
                }
                let colorFull = 'rgba(' + this.colors[i] + ',1)';
                let colorAlpha = 'rgba(' + this.colors[i] + ',0.4)';
                return {
                    label: hostname,
                    fill: false,
                    lineTension: 0.1,
                    backgroundColor: colorAlpha,
                    borderColor: colorFull,
                    borderCapStyle: 'butt',
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    pointBorderColor: colorFull,
                    pointBackgroundColor: '#fff',
                    pointBorderWidth: 1,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: colorFull,
                    pointHoverBorderColor: 'rgba(220,220,220,1)',
                    pointHoverBorderWidth: 2,
                    pointRadius: 1,
                    pointHitRadius: 10,
                    data: Object.keys(data.timeline).map(time => {
                        return data.timeline[time][hostname] ? data.timeline[time][hostname].currentLoad : null;
                    })
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
    data: PropTypes.object
};


export default Chart;
