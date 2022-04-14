const EventEmitter = require('events').EventEmitter;
const Constants = require('../../util/Constants');
const WebSocketConnection = require('./WebSocketConnection');
class WebSocketManager extends EventEmitter {
    constructor(client) {
        super();
        this.client = client;
        this.connection = null;
    }
    heartbeat() {
        if (!this.connection) return this.debug('No connection to heartbeat');
        return this.connection.heartbeat();
    }
    debug(message) {
        return this.client.emit('debug', `[ws] ${message}`);
    }
    destroy() {
        if (!this.connection) {
            this.debug('Attempted to destroy WebSocket but no connection exists!');
            return false;
        }
        return this.connection.destroy();
    }
    send(packet) {
        if (!this.connection) {
            this.debug('No connection to websocket');
            return;
        }
        this.connection.send(packet);
    }
    connect(gateway) {
        if (!this.connection) {
            this.connection = new WebSocketConnection(this, gateway);
            return true;
        }
        switch (this.connection.status) {
            case Constants.Status.IDLE:
            case Constants.Status.DISCONNECTED:
                this.connection.connect(gateway, 5500);
                return true;
            default:
                this.debug(`Couldn't connect to ${gateway} as the websocket is at state ${this.connection.status}`);
                return false;
        }
    }
}

module.exports = WebSocketManager;