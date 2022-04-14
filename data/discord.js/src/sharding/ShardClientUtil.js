const Util = require('../util/Util');
class ShardClientUtil {
    constructor(client) {
        this.client = client;
        process.on('message', this._handleMessage.bind(this));
        client.on('ready', () => { process.send({ _ready: true }); });
        client.on('disconnect', () => { process.send({ _disconnect: true }); });
        client.on('reconnecting', () => { process.send({ _reconnecting: true }); });
    }
    get id() {
        return this.client.options.shardId;
    }
    get count() {
        return this.client.options.shardCount;
    }
    send(message) {
        return new Promise((resolve, reject) => {
            process.send(message, err => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
    fetchClientValues(prop) {
        return new Promise((resolve, reject) => {
            const listener = message => {
                if (!message || message._sFetchProp !== prop) return;
                process.removeListener('message', listener);
                if (!message._error) resolve(message._result);
                else reject(Util.makeError(message._error));
            };
            process.on('message', listener);

            this.send({ _sFetchProp: prop }).catch(err => {
                process.removeListener('message', listener);
                reject(err);
            });
        });
    }
    broadcastEval(script) {
        return new Promise((resolve, reject) => {
            const listener = message => {
                if (!message || message._sEval !== script) return;
                process.removeListener('message', listener);
                if (!message._error) resolve(message._result);
                else reject(Util.makeError(message._error));
            };
            process.on('message', listener);

            this.send({ _sEval: script }).catch(err => {
                process.removeListener('message', listener);
                reject(err);
            });
        });
    }
    _handleMessage(message) {
        if (!message) return;
        if (message._fetchProp) {
            const props = message._fetchProp.split('.');
            let value = this.client;
            for (const prop of props) value = value[prop];
            this._respond('fetchProp', { _fetchProp: message._fetchProp, _result: value });
        } else if (message._eval) {
            try {
                this._respond('eval', { _eval: message._eval, _result: this.client._eval(message._eval) });
            } catch (err) {
                this._respond('eval', { _eval: message._eval, _error: Util.makePlainError(err) });
            }
        }
    }
    _respond(type, message) {
        this.send(message).catch(err => {
            err.message = `Error when sending ${type} response to master process: ${err.message}`;
            this.client.emit('error', err);
        });
    }
    static singleton(client) {
        if (!this._singleton) {
            this._singleton = new this(client);
        } else {
            client.emit('warn', 'Multiple clients created in child process; only the first will handle sharding helpers.');
        }
        return this._singleton;
    }
}

module.exports = ShardClientUtil;