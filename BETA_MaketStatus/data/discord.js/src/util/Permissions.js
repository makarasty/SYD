const BitField = require('./BitField');
const util = require('util');
class Permissions extends BitField {
    constructor(member, permissions) {
        super(typeof member === 'object' && !(member instanceof Array) ? permissions : member);

        Object.defineProperty(this, '_member', {
            writable: true,
            value: typeof member === 'object' && !(member instanceof Array) ? member : null,
        });
    }

    get member() {
        return this._member;
    }

    set member(value) {
        this._member = value;
    }
    get raw() {
        return this.bitfield;
    }

    set raw(raw) {
        this.bitfield = raw;
    }
    any(permission, checkAdmin = true) {
        return (checkAdmin && super.has(this.constructor.FLAGS.ADMINISTRATOR)) || super.any(permission);
    }
    has(permission, checkAdmin = true) {
        return (checkAdmin && super.has(this.constructor.FLAGS.ADMINISTRATOR)) || super.has(permission);
    }
    hasPermission(permission, explicit = false) {
        return this.has(permission, !explicit);
    }
    hasPermissions(permissions, explicit = false) {
        return this.has(permissions, !explicit);
    }
    missingPermissions(permissions, explicit = false) {
        return this.missing(permissions, !explicit);
    }
}
Permissions.FLAGS = {
    CREATE_INSTANT_INVITE: 1 << 0,
    KICK_MEMBERS: 1 << 1,
    BAN_MEMBERS: 1 << 2,
    ADMINISTRATOR: 1 << 3,
    MANAGE_CHANNELS: 1 << 4,
    MANAGE_GUILD: 1 << 5,
    ADD_REACTIONS: 1 << 6,
    VIEW_AUDIT_LOG: 1 << 7,
    PRIORITY_SPEAKER: 1 << 8,
    STREAM: 1 << 9,

    VIEW_CHANNEL: 1 << 10,
    READ_MESSAGES: 1 << 10,
    SEND_MESSAGES: 1 << 11,
    SEND_TTS_MESSAGES: 1 << 12,
    MANAGE_MESSAGES: 1 << 13,
    EMBED_LINKS: 1 << 14,
    ATTACH_FILES: 1 << 15,
    READ_MESSAGE_HISTORY: 1 << 16,
    MENTION_EVERYONE: 1 << 17,
    EXTERNAL_EMOJIS: 1 << 18,
    USE_EXTERNAL_EMOJIS: 1 << 18,

    CONNECT: 1 << 20,
    SPEAK: 1 << 21,
    MUTE_MEMBERS: 1 << 22,
    DEAFEN_MEMBERS: 1 << 23,
    MOVE_MEMBERS: 1 << 24,
    USE_VAD: 1 << 25,

    CHANGE_NICKNAME: 1 << 26,
    MANAGE_NICKNAMES: 1 << 27,
    MANAGE_ROLES: 1 << 28,
    MANAGE_ROLES_OR_PERMISSIONS: 1 << 28,
    MANAGE_WEBHOOKS: 1 << 29,
    MANAGE_EMOJIS: 1 << 30,
};
Permissions.ALL = Object.keys(Permissions.FLAGS).reduce((all, p) => all | Permissions.FLAGS[p], 0);
Permissions.DEFAULT = 104324673;
Permissions.prototype.hasPermission = util.deprecate(Permissions.prototype.hasPermission,
    'EvaluatedPermissions#hasPermission is deprecated, use Permissions#has instead');
Permissions.prototype.hasPermissions = util.deprecate(Permissions.prototype.hasPermissions,
    'EvaluatedPermissions#hasPermissions is deprecated, use Permissions#has instead');
Permissions.prototype.missingPermissions = util.deprecate(Permissions.prototype.missingPermissions,
    'EvaluatedPermissions#missingPermissions is deprecated, use Permissions#missing instead');
Object.defineProperty(Permissions.prototype, 'raw', {
    get: util
        .deprecate(Object.getOwnPropertyDescriptor(Permissions.prototype, 'raw').get,
            'EvaluatedPermissions#raw is deprecated use Permissions#bitfield instead'),
    set: util.deprecate(Object.getOwnPropertyDescriptor(Permissions.prototype, 'raw').set,
        'EvaluatedPermissions#raw is deprecated use Permissions#bitfield instead'),
});
Object.defineProperty(Permissions.prototype, 'member', {
    get: util
        .deprecate(Object.getOwnPropertyDescriptor(Permissions.prototype, 'member').get,
            'EvaluatedPermissions#member is deprecated'),
    set: util
        .deprecate(Object.getOwnPropertyDescriptor(Permissions.prototype, 'member').set,
            'EvaluatedPermissions#member is deprecated'),
});

module.exports = Permissions;