const browser = typeof window !== 'undefined';
const webpack = !!process.env.__DISCORD_WEBPACK__;

const Discord = require('./');

module.exports = Discord;
if (browser && webpack) window.Discord = Discord;
else if (!browser) console.warn('Warning: Attempting to use browser version of Discord.js in a non-browser environment!');