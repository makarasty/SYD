const path = require('path');
const fs = require('fs');
const EventEmitter = require('events').EventEmitter;
const Shard = require('./Shard');
const Collection = require('../util/Collection');
const Util = require('../util/Util');
class ShardingManager extends EventEmitter {
    constructor(file, options = {}) {
        super();
        options = Util.mergeDefault({
            totalShards: 'auto',
            respawn: true,
            shardArgs: [],
            token: null,
        }, options);
        this.file = file;
        if (!file) throw new Error('File must be specified.');
        if (!path.isAbsolute(file)) this.file = path.resolve(process.cwd(), file);
        const stats = fs.statSync(this.file);
        if (!stats.isFile()) throw new Error('File path does not point to a file.');
        this.totalShards = options.totalShards;
        if (this.totalShards !== 'auto') {
            if (typeof this.totalShards !== 'number' || isNaN(this.totalShards)) {
                throw new TypeError('Amount of shards must be a number.');
            }
            if (this.totalShards < 1) throw new RangeError('Amount of shards must be at least 1.');
            if (this.totalShards !== Math.floor(this.totalShards)) {
                throw new RangeError('Amount of shards must be an integer.');
            }
        }
        this.respawn = options.respawn;
        this.shardArgs = options.shardArgs;
        this.execArgv = options.execArgv;
        this.token = options.token ? options.token.replace(/^Bot\s*/i, '') : null;
        this.shards = new Collection();
    }
    createShard(id = this.shards.size) {
        const shard = new Shard(this, id, this.shardArgs);
        this.shards.set(id, shard);
        this.emit('launch', shard);
        return Promise.resolve(shard);
    }
    spawn(amount = this.totalShards, delay = 7500) {
        if (amount === 'auto') {
            return Util.fetchRecommendedShards(this.token).then(count => {
                this.totalShards = count;
                return this._spawn(count, delay);
            });
        } else {
            if (typeof amount !== 'number' || isNaN(amount)) throw new TypeError('Amount of shards must be a number.');
            if (amount < 1) throw new RangeError('Amount of shards must be at least 1.');
            if (amount !== Math.floor(amount)) throw new TypeError('Amount of shards must be an integer.');
            return this._spawn(amount, delay);
        }
    }
    _spawn(amount, delay) {
        return new Promise(resolve => {
            if (this.shards.size >= amount) throw new Error(`Already spawned ${this.shards.size} shards.`);
            this.totalShards = amount;

            this.createShard();
            if (this.shards.size >= this.totalShards) {
                resolve(this.shards);
                return;
            }

            if (delay <= 0) {
                while (this.shards.size < this.totalShards) this.createShard();
                resolve(this.shards);
            } else {
                const interval = setInterval(() => {
                    this.createShard();
                    if (this.shards.size >= this.totalShards) {
                        clearInterval(interval);
                        resolve(this.shards);
                    }
                }, delay);
            }
        });
    }
    broadcast(message) {
        const promises = [];
        for (const shard of this.shards.values()) promises.push(shard.send(message));
        return Promise.all(promises);
    }
    broadcastEval(script) {
        const promises = [];
        for (const shard of this.shards.values()) promises.push(shard.eval(script));
        return Promise.all(promises);
    }
    fetchClientValues(prop) {
        if (this.shards.size === 0) return Promise.reject(new Error('No shards have been spawned.'));
        if (this.shards.size !== this.totalShards) return Promise.reject(new Error('Still spawning shards.'));
        const promises = [];
        for (const shard of this.shards.values()) promises.push(shard.fetchClientValue(prop));
        return Promise.all(promises);
    }
    respawnAll(shardDelay = 5000, respawnDelay = 500, waitForReady = true, currentShardIndex = 0) {
        let s = 0;
        const shard = this.shards.get(currentShardIndex);
        const promises = [shard.respawn(respawnDelay, waitForReady)];
        if (++s < this.shards.size && shardDelay > 0) promises.push(Util.delayFor(shardDelay));
        return Promise.all(promises).then(() => {
            if (++currentShardIndex === this.shards.size) return this.shards;
            return this.respawnAll(shardDelay, respawnDelay, waitForReady, currentShardIndex);
        });
    }
}

module.exports = ShardingManager;