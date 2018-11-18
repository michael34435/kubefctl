const _ = require('lodash');
const { argv } = require('yargs');

module.exports = {
  getCommands () {
    return _(argv)
      .omit(['$0', 'f', 'file'])
      .values()
      .flatten()
      .value();
  },

  getFiles () {
    return _(argv)
      .pick(['f', 'file'])
      .values()
      .flatten()
      .value();
  },
};
