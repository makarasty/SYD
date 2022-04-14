const Constants = require('../../../util/Constants');

const BeforeReadyWhitelist = [
    Constants.WSEvents.READY,
    Constants.WSEvents.RESUMED,
    Constants.WSEvents.GUILD_CREATE,
    Constants.WSEvents.GUILD_DELETE,
    Constants.WSEvents.GUILD_MEMBERS_CHUNK,
    Constants.WSEvents.GUILD_MEMBER_ADD,
    Constants.WSEvents.GUILD_MEMBER_REMOVE,
];

class WebSocketPacketManager {
    constructor(connection) {
        this.ws = connection;
        this.handlers = {};
        this.queue = [];

        this.register(Constants.WSEvents.READY, require('./handlers/Ready'));
        this.register(Constants.WSEvents.RESUMED, require('./handlers/Resumed'));
        this.register(Constants.WSEvents.PRESENCE_UPDATE, require('./handlers/PresenceUpdate'));
        this.register(Constants.WSEvents.USER_UPDATE, require('./handlers/UserUpdate'));
        this.register(Constants.WSEvents.USER_NOTE_UPDATE, require('./handlers/UserNoteUpdate'));
        this.register(Constants.WSEvents.USER_SETTINGS_UPDATE, require('./handlers/UserSettingsUpdate'));
        this.register(Constants.WSEvents.RELATIONSHIP_ADD, require('./handlers/RelationshipAdd'));
        this.register(Constants.WSEvents.RELATIONSHIP_REMOVE, require('./handlers/RelationshipRemove'));
    }

    get client() {
        return this.ws.client;
    }

    register(event, Handler) {
        this.handlers[event] = new Handler(this);
    }

    handleQueue() {
        this.queue.forEach((element, index) => {
            this.handle(this.queue[index], true);
            this.queue.splice(index, 1);
        });
    }

    handle(packet, queue = false) {
        if (packet.op === Constants.OPCodes.HEARTBEAT_ACK) {
            this.ws.client._pong(this.ws.client._pingTimestamp);
            this.ws.lastHeartbeatAck = true;
            this.ws.client.emit('debug', 'Heartbeat acknowledged');
        } else if (packet.op === Constants.OPCodes.HEARTBEAT) {
            this.client.ws.send({
                op: Constants.OPCodes.HEARTBEAT,
                d: this.client.ws.sequence,
            });
            this.ws.client.emit('debug', 'Received gateway heartbeat');
        }

        if (this.ws.status === Constants.Status.RECONNECTING) {
            this.ws.reconnecting = false;
            this.ws.checkIfReady();
        }

        this.ws.setSequence(packet.s);

        if (this.ws.disabledEvents[packet.t] !== undefined) return false;

        if (this.ws.status !== Constants.Status.READY) {
            if (BeforeReadyWhitelist.indexOf(packet.t) === -1) {
                this.queue.push(packet);
                return false;
            }
        }

        if (!queue && this.queue.length > 0) this.handleQueue();
        if (this.handlers[packet.t]) return this.handlers[packet.t].handle(packet);
        return false;
    }
}

module.exports = WebSocketPacketManager;