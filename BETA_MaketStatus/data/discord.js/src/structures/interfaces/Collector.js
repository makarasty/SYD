const Collection = require('../../util/Collection');
const EventEmitter = require('events').EventEmitter;
class Collector extends EventEmitter {
    constructor(client, filter, options = {}) {
        super();
        Object.defineProperty(this, 'client', { value: client });
        this.filter = filter;
        this.options = options;
        this.collected = new Collection();
        this.ended = false;
        this._timeout = null;
        this._idletimeout = null;
        this.listener = this._handle.bind(this);
        if (options.time) this._timeout = this.client.setTimeout(() => this.stop('time'), options.time);
        if (options.idle) this._idletimeout = this.client.setTimeout(() => this.stop('idle'), options.idle);
    }
    _handle(...args) {
        const collect = this.handle(...args);
        if (collect && this.filter(...args, this.collected)) {
            this.collected.set(collect.key, collect.value);
            this.emit('collect', collect.value, this);
            this.emit('fullCollect', ...args, this);

            if (this._idletimeout) {
                this.client.clearTimeout(this._idletimeout);
                this._idletimeout = this.client.setTimeout(() => this.stop('idle'), this.options.idle);
            }
        }

        const post = this.postCheck(...args);
        if (post) this.stop(post);
    }
    get next() {
        return new Promise((resolve, reject) => {
            if (this.ended) {
                reject(this.collected);
                return;
            }

            const cleanup = () => {
                this.removeListener('collect', onCollect);
                this.removeListener('end', onEnd);
            };

            const onCollect = item => {
                cleanup();
                resolve(item);
            };

            const onEnd = () => {
                cleanup();
                reject(this.collected);
            };

            this.on('collect', onCollect);
            this.on('end', onEnd);
        });
    }
    stop(reason = 'user') {
        if (this.ended) return;

        if (this._timeout) {
            this.client.clearTimeout(this._timeout);
            this._timeout = null;
        }
        if (this._idletimeout) {
            this.client.clearTimeout(this._idletimeout);
            this._idletimeout = null;
        }
        this.ended = true;
        this.cleanup();
        this.emit('end', this.collected, reason);
    }
    handle() {}
    postCheck() {}
    cleanup() {}
}

module.exports = Collector;