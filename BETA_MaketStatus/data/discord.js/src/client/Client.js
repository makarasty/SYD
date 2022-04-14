const EventEmitter = require('events');
const Constants = require('../util/Constants');
const Permissions = require('../util/Permissions');
const Util = require('../util/Util');
const RESTManager = require('./rest/RESTManager');
const ClientDataManager = require('./ClientDataManager');
const ClientManager = require('./ClientManager');
const ClientDataResolver = require('./ClientDataResolver');
const WebSocketManager = require('./websocket/WebSocketManager');
const ActionsManager = require('./actions/ActionsManager');
const Collection = require('../util/Collection');
const Presence = require('../structures/Presence').Presence;
const ShardClientUtil = require('../sharding/ShardClientUtil');

class Client extends EventEmitter {
    constructor(options = {}) {
        super();
        if (!options.shardId && 'SHARD_ID' in process.env) options.shardId = Number(process.env.SHARD_ID);
        if (!options.shardCount && 'SHARD_COUNT' in process.env) options.shardCount = Number(process.env.SHARD_COUNT);
        this.options = Util.mergeDefault(Constants.DefaultOptions, options);
        this._validateOptions();
        this.rest = new RESTManager(this);
        this.dataManager = new ClientDataManager(this);
        this.manager = new ClientManager(this);
        this.ws = new WebSocketManager(this);
        this.resolver = new ClientDataResolver(this);
        this.actions = new ActionsManager(this);
        this.shard = process.send ? ShardClientUtil.singleton(this) : null;
        this.users = new Collection();
        this.guilds = new Collection();
        this.channels = new Collection();
        this.presences = new Collection();

        Object.defineProperty(this, 'token', { writable: true });
        if (!this.token && 'CLIENT_TOKEN' in process.env) {
            this.token = process.env.CLIENT_TOKEN;
        } else {
            this.token = null;
        }
        this.user = null;
        this.readyAt = null;
        this.broadcasts = [];
        this.pings = [];
        this._timeouts = new Set();
        this._intervals = new Set();

        if (this.options.messageSweepInterval > 0) {
            this.setInterval(this.sweepMessages.bind(this), this.options.messageSweepInterval * 1000);
        }
    }
    get _pingTimestamp() {
        return this.ws.connection ? this.ws.connection.lastPingTimestamp : 0;
    }
    get status() {
        return this.ws.connection ? this.ws.connection.status : Constants.Status.IDLE;
    }
    get uptime() {
        return this.readyAt ? Date.now() - this.readyAt : null;
    }
    get ping() {
        return this.pings.reduce((prev, p) => prev + p, 0) / this.pings.length;
    }
    get voiceConnections() {
        if (this.browser) return new Collection();
        return this.voice.connections;
    }
    get emojis() {
        const emojis = new Collection();
        for (const guild of this.guilds.values()) {
            for (const emoji of guild.emojis.values()) emojis.set(emoji.id, emoji);
        }
        return emojis;
    }

    get readyTimestamp() {
        return this.readyAt ? this.readyAt.getTime() : null;
    }

    get browser() {
        return typeof window !== 'undefined';
    }

    createVoiceBroadcast() {
        const broadcast = new VoiceBroadcast(this);
        this.broadcasts.push(broadcast);
        return broadcast;
    }
    login(token = this.token) {
        return this.rest.methods.login(token);
    }

    destroy() {
        for (const t of this._timeouts) clearTimeout(t);
        for (const i of this._intervals) clearInterval(i);
        this._timeouts.clear();
        this._intervals.clear();
        return this.manager.destroy();
    }

    syncGuilds(guilds = this.guilds) {
        if (this.user.bot) return;
        this.ws.send({
            op: 12,
            d: guilds instanceof Collection ? guilds.keyArray() : guilds.map(g => g.id),
        });
    }
    fetchUser(id, cache = true) {
        if (this.users.has(id)) return Promise.resolve(this.users.get(id));
        return this.rest.methods.getUser(id, cache);
    }

    fetchInvite(invite) {
        const code = this.resolver.resolveInviteCode(invite);
        return this.rest.methods.getInvite(code);
    }

    fetchWebhook(id, token) {
        return this.rest.methods.getWebhook(id, token);
    }

    fetchVoiceRegions() {
        return this.rest.methods.fetchVoiceRegions();
    }

    sweepMessages(lifetime = this.options.messageCacheLifetime) {
        if (typeof lifetime !== 'number' || isNaN(lifetime)) throw new TypeError('The lifetime must be a number.');
        if (lifetime <= 0) {
            this.emit('debug', 'Didn\'t sweep messages - lifetime is unlimited');
            return -1;
        }

        const lifetimeMs = lifetime * 1000;
        const now = Date.now();
        let channels = 0;
        let messages = 0;

        for (const channel of this.channels.values()) {
            if (!channel.messages) continue;
            channels++;

            messages += channel.messages.sweep(
                message => now - (message.editedTimestamp || message.createdTimestamp) > lifetimeMs
            );
        }

        this.emit('debug', `Swept ${messages} messages older than ${lifetime} seconds in ${channels} text-based channels`);
        return messages;
    }

    fetchApplication(id = '@me') {
        if (id !== '@me') process.emitWarning('fetchApplication: use "@me" as an argument', 'DeprecationWarning');
        return this.rest.methods.getApplication(id);
    }

    generateInvite(permissions) {
        permissions = Permissions.resolve(permissions);
        return this.fetchApplication().then(application =>
            `https://discordapp.com/oauth2/authorize?client_id=${application.id}&permissions=${permissions}&scope=bot`
        );
    }

    setTimeout(fn, delay, ...args) {}

    clearTimeout(timeout) {}

    setInterval(fn, delay, ...args) {
        const interval = setInterval(fn, delay, ...args);
        this._intervals.add(interval);
        return interval;
    }

    clearInterval(interval) {
        clearInterval(interval);
        this._intervals.delete(interval);
    }

    _pong(startTime) {
        this.pings.unshift(Date.now() - startTime);
        if (this.pings.length > 3) this.pings.length = 3;
        this.ws.lastHeartbeatAck = true;
    }

    _setPresence(id, presence) {
        if (this.presences.has(id)) {
            this.presences.get(id).update(presence);
            return;
        }
        this.presences.set(id, new Presence(presence, this));
    }

    _eval(script) {
        return eval(script);
    }

    _validateOptions(options = this.options) { // eslint-disable-line complexity
        if (typeof options.shardCount !== 'number' || isNaN(options.shardCount)) {
            throw new TypeError('The shardCount option must be a number.');
        }
        if (typeof options.shardId !== 'number' || isNaN(options.shardId)) {
            throw new TypeError('The shardId option must be a number.');
        }
        if (options.shardCount < 0) throw new RangeError('The shardCount option must be at least 0.');
        if (options.shardId < 0) throw new RangeError('The shardId option must be at least 0.');
        if (options.shardId !== 0 && options.shardId >= options.shardCount) {
            throw new RangeError('The shardId option must be less than shardCount.');
        }
        if (typeof options.messageCacheMaxSize !== 'number' || isNaN(options.messageCacheMaxSize)) {
            throw new TypeError('The messageCacheMaxSize option must be a number.');
        }
        if (typeof options.messageCacheLifetime !== 'number' || isNaN(options.messageCacheLifetime)) {
            throw new TypeError('The messageCacheLifetime option must be a number.');
        }
        if (typeof options.messageSweepInterval !== 'number' || isNaN(options.messageSweepInterval)) {
            throw new TypeError('The messageSweepInterval option must be a number.');
        }
        if (typeof options.fetchAllMembers !== 'boolean') {
            throw new TypeError('The fetchAllMembers option must be a boolean.');
        }
        if (typeof options.disableEveryone !== 'boolean') {
            throw new TypeError('The disableEveryone option must be a boolean.');
        }
        if (typeof options.restWsBridgeTimeout !== 'number' || isNaN(options.restWsBridgeTimeout)) {
            throw new TypeError('The restWsBridgeTimeout option must be a number.');
        }
        if (!(options.disabledEvents instanceof Array)) throw new TypeError('The disabledEvents option must be an Array.');
        if (typeof options.retryLimit !== 'number' || isNaN(options.retryLimit)) {
            throw new TypeError('The retryLimit  options must be a number.');
        }
    }
}

module.exports = Client;