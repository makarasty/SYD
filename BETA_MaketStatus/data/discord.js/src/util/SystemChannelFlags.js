const BitField = require('./BitField');
class SystemChannelFlags extends BitField {}
SystemChannelFlags.FLAGS = {
    WELCOME_MESSAGE_DISABLED: 1 << 0,
    BOOST_MESSAGE_DISABLED: 1 << 1,
};

module.exports = SystemChannelFlags;