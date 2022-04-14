const path = require('path');
const fs = require('fs');
const snekfetch = require('snekfetch');

const Constants = require('../util/Constants');
const convertToBuffer = require('../util/Util').convertToBuffer;
const User = require('../structures/User');
class ClientDataResolver {
    constructor(client) {
        this.client = client;
    }
    resolveUser(user) {
        if (user instanceof User) return user;
        if (typeof user === 'string') return this.client.users.get(user) || null;
        if (user instanceof GuildMember) return user.user;
        if (user instanceof Message) return user.author;
        if (user instanceof Guild) return this.resolveUser(user.ownerID);
        return null;
    }
    resolveUserID(user) {
        if (user instanceof User || user instanceof GuildMember) return user.id;
        if (typeof user === 'string') return user || null;
        if (user instanceof Message) return user.author.id;
        if (user instanceof Guild) return user.ownerID;
        return null;
    }
    resolveGuild(guild) {
        if (guild instanceof Guild) return guild;
        if (typeof guild === 'string') return this.client.guilds.get(guild) || null;
        return null;
    }
    resolveGuildMember(guild, user) {
        if (user instanceof GuildMember) return user;
        guild = this.resolveGuild(guild);
        user = this.resolveUser(user);
        if (!guild || !user) return null;
        return guild.members.get(user.id) || null;
    }
    resolveRole(guild, role) {
        if (role instanceof Role) return role;
        guild = this.resolveGuild(guild);
        if (!guild) return null;
        if (typeof role === 'string') return guild.roles.get(role);
        return null;
    }
    resolveChannel(channel) {
        if (channel instanceof Channel) return channel;
        if (typeof channel === 'string') return this.client.channels.get(channel) || null;
        if (channel instanceof Message) return channel.channel;
        if (channel instanceof Guild) return channel.channels.get(channel.id) || null;
        return null;
    }
    resolveChannelID(channel) {
        if (channel instanceof Channel) return channel.id;
        if (typeof channel === 'string') return channel;
        if (channel instanceof Message) return channel.channel.id;
        if (channel instanceof Guild) return channel.defaultChannel.id;
        return null;
    }
    resolveInviteCode(data) {
        const inviteRegex = /discord(?:app\.com\/invite|\.gg(?:\/invite)?)\/([\w-]{2,255})/i;
        const match = inviteRegex.exec(data);
        if (match && match[1]) return match[1];
        return data;
    }
    resolveString(data) {
        if (typeof data === 'string') return data;
        if (data instanceof Array) return data.join('\n');
        return String(data);
    }
    resolveImage(image) {
        if (!image) return Promise.resolve(null);
        if (typeof image === 'string' && image.startsWith('data:')) {
            return Promise.resolve(image);
        }
        return this.resolveFile(image).then(this.resolveBase64);
    }
    resolveBase64(data) {
        if (data instanceof Buffer) return `data:image/jpg;base64,${data.toString('base64')}`;
        return data;
    }
    resolveFile(resource) {
        if (resource instanceof Buffer) return Promise.resolve(resource);
        if (this.client.browser && resource instanceof ArrayBuffer) return Promise.resolve(convertToBuffer(resource));

        if (typeof resource === 'string') {
            if (/^https?:\/\//.test(resource)) {
                return snekfetch.get(resource).then(res => res.body instanceof Buffer ? res.body : Buffer.from(res.text));
            }
            return new Promise((resolve, reject) => {
                const file = path.resolve(resource);
                fs.stat(file, (err, stats) => {
                    if (err) return reject(err);
                    if (!stats || !stats.isFile()) return reject(new Error(`The file could not be found: ${file}`));
                    fs.readFile(file, (err2, data) => {
                        if (err2) reject(err2);
                        else resolve(data);
                    });
                    return null;
                });
            });
        } else if (resource && resource.pipe && typeof resource.pipe === 'function') {
            return new Promise((resolve, reject) => {
                const buffers = [];
                resource.once('error', reject);
                resource.on('data', data => buffers.push(data));
                resource.once('end', () => resolve(Buffer.concat(buffers)));
            });
        }

        return Promise.reject(new TypeError('The resource must be a string or Buffer.'));
    }
    resolveEmojiIdentifier(emoji) {
        if (emoji instanceof Emoji || emoji instanceof ReactionEmoji) return emoji.identifier;
        if (typeof emoji === 'string') {
            if (this.client.emojis.has(emoji)) return this.client.emojis.get(emoji).identifier;
            else if (!emoji.includes('%')) return encodeURIComponent(emoji);
            else return emoji;
        }
        return null;
    }
    static resolveColor(color) {
        if (typeof color === 'string') {
            if (color === 'RANDOM') return Math.floor(Math.random() * (0xFFFFFF + 1));
            if (color === 'DEFAULT') return 0;
            color = Constants.Colors[color] || parseInt(color.replace('#', ''), 16);
        } else if (color instanceof Array) {
            color = (color[0] << 16) + (color[1] << 8) + color[2];
        }

        if (color < 0 || color > 0xFFFFFF) {
            throw new RangeError('Color must be within the range 0 - 16777215 (0xFFFFFF).');
        } else if (color && isNaN(color)) {
            throw new TypeError('Unable to convert color to a number.');
        }

        return color;
    }
    resolveColor(color) {
        return this.constructor.resolveColor(color);
    }
}

module.exports = ClientDataResolver;