const Constants = require('../util/Constants');
const Util = require('../util/Util');
//const Guild = require('../structures/Guild');
const User = require('../structures/User');
//const Emoji = require('../structures/Emoji');
//const GuildChannel = require('../structures/GuildChannel');
//const TextChannel = require('../structures/TextChannel');
//const VoiceChannel = require('../structures/VoiceChannel');
//const CategoryChannel = require('../structures/CategoryChannel');
//const NewsChannel = require('../structures/NewsChannel');
//const StoreChannel = require('../structures/StoreChannel');
//const DMChannel = require('../structures/DMChannel');
//const GroupDMChannel = require('../structures/GroupDMChannel');

class ClientDataManager {
    constructor(client) {
        this.client = client;
    }

    get pastReady() {
        return this.client.ws.connection.status === Constants.Status.READY;
    }

    newGuild(data) {}

    newUser(data, cache = true) {
        if (this.client.users.has(data.id)) return this.client.users.get(data.id);
        const user = new User(this.client, data);
        if (cache) this.client.users.set(user.id, user);
        return user;
    }


    newEmoji(data, guild) {
        const already = guild.emojis.has(data.id);
        if (data && !already) {
            let emoji = new Emoji(guild, data);
            this.client.emit(Constants.Events.GUILD_EMOJI_CREATE, emoji);
            guild.emojis.set(emoji.id, emoji);
            return emoji;
        } else if (already) {
            return guild.emojis.get(data.id);
        }

        return null;
    }

    killEmoji(emoji) {
        if (!(emoji instanceof Emoji && emoji.guild)) return;
        this.client.emit(Constants.Events.GUILD_EMOJI_DELETE, emoji);
        emoji.guild.emojis.delete(emoji.id);
    }

    killGuild(guild) {
        const already = this.client.guilds.has(guild.id);
        this.client.guilds.delete(guild.id);
        if (already && this.pastReady) this.client.emit(Constants.Events.GUILD_DELETE, guild);
    }

    killUser(user) {
        this.client.users.delete(user.id);
    }

    killChannel(channel) {
        this.client.channels.delete(channel.id);
        if (channel instanceof GuildChannel) channel.guild.channels.delete(channel.id);
    }

    updateGuild(currentGuild, newData) {
        const oldGuild = Util.cloneObject(currentGuild);
        currentGuild.setup(newData);
        if (this.pastReady) this.client.emit(Constants.Events.GUILD_UPDATE, oldGuild, currentGuild);
    }

    updateChannel(currentChannel, newData) {
        currentChannel.setup(newData);
    }

    updateEmoji(currentEmoji, newData) {
        const oldEmoji = Util.cloneObject(currentEmoji);
        currentEmoji.setup(newData);
        this.client.emit(Constants.Events.GUILD_EMOJI_UPDATE, oldEmoji, currentEmoji);
        return currentEmoji;
    }
}

module.exports = ClientDataManager;