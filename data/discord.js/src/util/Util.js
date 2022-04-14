const snekfetch = require('snekfetch');
const Constants = require('./Constants');
const ConstantsHttp = Constants.DefaultOptions.http;
class Util {
    constructor() {
        throw new Error(`The ${this.constructor.name} class may not be instantiated.`);
    }
    static splitMessage(text, { maxLength = 1950, char = '\n', prepend = '', append = '' } = {}) {
        if (text.length <= maxLength) return text;
        const splitText = text.split(char);
        if (splitText.some(chunk => chunk.length > maxLength)) {
            throw new Error('Message exceeds the max length and contains no split characters.');
        }
        const messages = [''];
        let msg = 0;
        for (let i = 0; i < splitText.length; i++) {
            if (messages[msg].length + splitText[i].length + 1 > maxLength) {
                messages[msg] += append;
                messages.push(prepend);
                msg++;
            }
            messages[msg] += (messages[msg].length > 0 && messages[msg] !== prepend ? char : '') + splitText[i];
        }
        return messages;
    }
    static resolveString(data) {
        if (typeof data === 'string') return data;
        if (Array.isArray(data)) return data.join('\n');
        return String(data);
    }
    static escapeMarkdown(text, onlyCodeBlock = false, onlyInlineCode = false) {
        if (onlyCodeBlock) return text.replace(/```/g, '`\u200b``');
        if (onlyInlineCode) return text.replace(/\\(`|\\)/g, '$1').replace(/(`|\\)/g, '\\$1');
        return text.replace(/\\(\*|_|`|~|\\)/g, '$1').replace(/(\*|_|`|~|\\)/g, '\\$1');
    }
    static fetchRecommendedShards(token, guildsPerShard = 1000) {
        return new Promise((resolve, reject) => {
            if (!token) throw new Error('A token must be provided.');
            snekfetch.get(`${ConstantsHttp.host}/api/v${ConstantsHttp.version}${Constants.Endpoints.gateway.bot}`)
                .set('Authorization', `Bot ${token.replace(/^Bot\s*/i, '')}`)
                .end((err, res) => {
                    if (err) reject(err);
                    resolve(res.body.shards * (1000 / guildsPerShard));
                });
        });
    }
    static parseEmoji(text) {
        if (text.includes('%')) text = decodeURIComponent(text);
        if (!text.includes(':')) return { animated: false, name: text, id: null };
        const m = text.match(/<?(a:)?(\w{2,32}):(\d{17,19})>?/);
        if (!m) return null;
        return { animated: Boolean(m[1]), name: m[2], id: m[3] };
    }
    static arraysEqual(a, b) {
        if (a === b) return true;
        if (a.length !== b.length) return false;

        const setA = new Set(a);
        const setB = new Set(b);

        return a.every(e => setB.has(e)) && b.every(e => setA.has(e));
    }
    static cloneObject(obj) {
        return Object.assign(Object.create(obj), obj);
    }
    static mergeDefault(def, given) {
        if (!given) return def;
        for (const key in def) {
            if (!{}.hasOwnProperty.call(given, key)) {
                given[key] = def[key];
            } else if (given[key] === Object(given[key])) {
                given[key] = this.mergeDefault(def[key], given[key]);
            }
        }

        return given;
    }
    static convertToBuffer(ab) {
        if (typeof ab === 'string') ab = this.str2ab(ab);
        return Buffer.from(ab);
    }
    static str2ab(str) {
        const buffer = new ArrayBuffer(str.length * 2);
        const view = new Uint16Array(buffer);
        for (var i = 0, strLen = str.length; i < strLen; i++) view[i] = str.charCodeAt(i);
        return buffer;
    }
    static makeError(obj) {
        const err = new Error(obj.message);
        err.name = obj.name;
        err.stack = obj.stack;
        return err;
    }
    static makePlainError(err) {
        const obj = {};
        obj.name = err.name;
        obj.message = err.message;
        obj.stack = err.stack;
        return obj;
    }
    static moveElementInArray(array, element, newIndex, offset = false) {
        const index = array.indexOf(element);
        newIndex = (offset ? index : 0) + newIndex;
        if (newIndex > -1 && newIndex < array.length) {
            const removedElement = array.splice(index, 1)[0];
            array.splice(newIndex, 0, removedElement);
        }
        return array.indexOf(element);
    }
    static delayFor(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    }
}

module.exports = Util;