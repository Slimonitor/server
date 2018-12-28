import io from 'socket.io-client';
import {connection, refreshHealthData} from './actions.jsx'

export default class BackendApi {
    constructor(dispatch) {
        this._dispatch = dispatch;
        this.isConnected = false;
        this._socket = io(document.location.origin); /* global document */
        this._socket.on('connect', this.onConnect.bind(this));
        this._socket.on('disconnect', this.onDisconnect.bind(this));
        this._socket.on('health', this.onHealthData.bind(this));
    }

    onConnect() {
        this.isConnected = true;
        this._dispatch(connection(this.isConnected));
    }

    onDisconnect() {
        this.isConnected = false;
        this._dispatch(connection(this.isConnected));
    }

    onHealthData(data) {
        this._dispatch(refreshHealthData(data));
    }
}
