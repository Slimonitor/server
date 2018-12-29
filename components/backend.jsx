import io from 'socket.io-client';
import {connection, subscriptionsList, refresh} from './actions.jsx';

export default class BackendApi {
    constructor(dispatch) {
        this._dispatch = dispatch;
        this.isConnected = false;
        this._bundleId = null;
        this._socket = io(document.location.origin); /* global document */
        this._socket.on('connect', this.onConnect.bind(this));
        this._socket.on('disconnect', this.onDisconnect.bind(this));
        this._socket.on('update', this.onUpdate.bind(this));
    }

    onConnect() {
        if (this._bundleId !== this._socket.id) {
            if (this._bundleId === null) {
                this._bundleId = this._socket.id;
            } else {
                window.location.reload(true);
                return;
            }
        }
        this.isConnected = true;
        this._dispatch(connection(this.isConnected));
        this._socket.emit('subscribe', 'hostHealth', list => { // todo: example
            this._dispatch(subscriptionsList(list));
        });
    }

    onDisconnect() {
        this.isConnected = false;
        this._dispatch(connection(this.isConnected));
    }

    onUpdate(update) {
        //console.log(update);
        this._dispatch(refresh(update));
    }
}
