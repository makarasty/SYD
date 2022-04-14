const Long = require('long');

const EPOCH = 1420070400000;
let INCREMENT = 0;
class SnowflakeUtil {
    constructor() {
        throw new Error(`The ${this.constructor.name} class may not be instantiated.`);
    }
    static generate(timestamp = Date.now()) {
        if (timestamp instanceof Date) timestamp = timestamp.getTime();
        if (typeof timestamp !== 'number' || isNaN(timestamp)) {
            throw new TypeError(
                `"timestamp" argument must be a number (received ${isNaN(timestamp) ? 'NaN' : typeof timestamp})`
            );
        }
        if (INCREMENT >= 4095) INCREMENT = 0;
        const BINARY = `${pad((timestamp - EPOCH).toString(2), 42)}0000100000${pad((INCREMENT++).toString(2), 12)}`;
        return Long.fromString(BINARY, 2).toString();
    }
    static deconstruct(snowflake) {
        const BINARY = pad(Long.fromString(snowflake).toString(2), 64);
        const res = {
            timestamp: parseInt(BINARY.substring(0, 42), 2) + EPOCH,
            workerID: parseInt(BINARY.substring(42, 47), 2),
            processID: parseInt(BINARY.substring(47, 52), 2),
            increment: parseInt(BINARY.substring(52, 64), 2),
            binary: BINARY,
        };
        Object.defineProperty(res, 'date', {
            get: function get() { return new Date(this.timestamp); },
            enumerable: true,
        });
        return res;
    }
}

function pad(v, n, c = '0') {
    return String(v).length >= n ? String(v) : (String(c).repeat(n) + v).slice(-n);
}

module.exports = SnowflakeUtil;