const User = require('./User');
const Collection = require('../util/Collection');
const ClientUserSettings = require('./ClientUserSettings');
const ClientUserGuildSettings = require('./ClientUserGuildSettings');
const Constants = require('../util/Constants');
const util = require('util');
class ClientUser extends User {
    setup(data) {
        super.setup(data);
        this.verified = data.verified;
        this.email = data.email;
        this.localPresence = {};
        this._typing = new Map();
        this.friends = new Collection();
        this.blocked = new Collection();
        this.notes = new Collection();
        this.premium = typeof data.premium === 'boolean' ? data.premium : null;
        this.mfaEnabled = data.mfa_enabled;
        this.mobile = typeof data.mobile === 'boolean' ? data.mobile : null;
        this.settings = data.user_settings ? new ClientUserSettings(this, data.user_settings) : null;
        this.guildSettings = new Collection();
        if (data.user_guild_settings) {
            for (const settings of data.user_guild_settings) {
                this.guildSettings.set(settings.guild_id, new ClientUserGuildSettings(settings, this.client));
            }
        }
    }

    edit(data) {
        return this.client.rest.methods.updateCurrentUser(data);
    }
    setUsername(username, password) {
        return this.client.rest.methods.updateCurrentUser({ username }, password);
    }
    setEmail(email, password) {
        return this.client.rest.methods.updateCurrentUser({ email }, password);
    }
    setPassword(newPassword, oldPassword) {
        return this.client.rest.methods.updateCurrentUser({ password: newPassword }, oldPassword);
    }
    setAvatar(avatar) {
        return this.client.resolver.resolveImage(avatar).then(data =>
            this.client.rest.methods.updateCurrentUser({ avatar: data })
        );
    }
    setPresence(data) {
        return new Promise(resolve => {
            let status = this.localPresence.status || this.presence.status;
            let game = this.localPresence.game;
            let afk = this.localPresence.afk || this.presence.afk;

            if (!game && this.presence.game) {
                game = {
                    name: this.presence.game.name,
                    type: this.presence.game.type,
                    url: this.presence.game.url,
                };
            }

            if (data.status) {
                if (typeof data.status !== 'string') throw new TypeError('Status must be a string');
                if (this.bot) {
                    status = data.status;
                } else {
                    this.settings.update(Constants.UserSettingsMap.status, data.status);
                    status = 'invisible';
                }
            }

            if (data.game) {
                game = data.game;
                game.type = game.url && typeof game.type === 'undefined' ? 1 : game.type || 0;
                if (typeof game.type === 'string') {
                    game.type = Constants.ActivityTypes.indexOf(game.type.toUpperCase());
                }
            } else if (typeof data.game !== 'undefined') {
                game = null;
            }

            if (typeof data.afk !== 'undefined') afk = data.afk;
            afk = Boolean(afk);

            this.localPresence = { status, game, afk };
            this.localPresence.since = 0;
            this.localPresence.game = this.localPresence.game || null;

            this.client.ws.send({
                op: 3,
                d: this.localPresence,
            });

            this.client._setPresence(this.id, this.localPresence);

            resolve(this);
        });
    }
    setStatus(status) {
        return this.setPresence({ status });
    }
    setGame(game, streamingURL) {
        if (!game) return this.setPresence({ game: null });
        return this.setPresence({
            game: {
                name: game,
                url: streamingURL,
            },
        });
    }
    setActivity(name, { url, type } = {}) {
        if (!name) return this.setPresence({ game: null });
        return this.setPresence({
            game: { name, type, url },
        }).then(clientUser => clientUser.presence);
    }
    setAFK(afk) {
        return this.setPresence({ afk });
    }
    fetchMentions(options = {}) {
        return this.client.rest.methods.fetchMentions(options);
    }
    addFriend(user) {
        user = this.client.resolver.resolveUser(user);
        return this.client.rest.methods.addFriend(user);
    }
    removeFriend(user) {
        user = this.client.resolver.resolveUser(user);
        return this.client.rest.methods.removeFriend(user);
    }
    createGuild(name, region, icon = null) {
        if (typeof icon === 'string' && icon.startsWith('data:')) {
            return this.client.rest.methods.createGuild({ name, icon, region });
        } else {
            return this.client.resolver.resolveImage(icon).then(data =>
                this.client.rest.methods.createGuild({ name, icon: data, region })
            );
        }
    }
    createGroupDM(recipients) {
        return this.client.rest.methods.createGroupDM({
            recipients: recipients.map(u => this.client.resolver.resolveUserID(u.user)),
            accessTokens: recipients.map(u => u.accessToken),
            nicks: recipients.reduce((o, r) => {
                if (r.nick) o[r.user ? r.user.id : r.id] = r.nick;
                return o;
            }, {}),
        });
    }
    acceptInvite(invite) {
        return this.client.rest.methods.acceptInvite(invite);
    }
}

ClientUser.prototype.acceptInvite =
    util.deprecate(ClientUser.prototype.acceptInvite, 'ClientUser#acceptInvite: userbot methods will be removed');

ClientUser.prototype.setGame =
    util.deprecate(ClientUser.prototype.setGame, 'ClientUser#setGame: use ClientUser#setActivity instead');

ClientUser.prototype.addFriend =
    util.deprecate(ClientUser.prototype.addFriend, 'ClientUser#addFriend: userbot methods will be removed');

ClientUser.prototype.removeFriend =
    util.deprecate(ClientUser.prototype.removeFriend, 'ClientUser#removeFriend: userbot methods will be removed');

ClientUser.prototype.setPassword =
    util.deprecate(ClientUser.prototype.setPassword, 'ClientUser#setPassword: userbot methods will be removed');

ClientUser.prototype.setEmail =
    util.deprecate(ClientUser.prototype.setEmail, 'ClientUser#setEmail: userbot methods will be removed');

ClientUser.prototype.fetchMentions =
    util.deprecate(ClientUser.prototype.fetchMentions, 'ClientUser#fetchMentions: userbot methods will be removed');

module.exports = ClientUser;